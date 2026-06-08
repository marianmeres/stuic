import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./CommandMenu.fixture.svelte";

// CommandMenu is a command palette built on ModalDialog (opened imperatively via
// open()), so every assertion goes through the fixture that holds the ref. The
// browser-only contracts worth proving:
//   - open() -> ModalDialog.showModal() puts a role="dialog" in the a11y tree
//     ASYNCHRONOUSLY (waitForNextRepaint().then(showModal)) — always expect.element
//     auto-retry, never a synchronous read.
//   - the search box is a FieldInput text <input> (role="textbox") whose default
//     placeholder is the i18n "Type to search...".
//   - typing is debounced ~150ms (runed Debounced) before getOptions runs; results
//     render as role="option" inside a role="listbox" (the items come back through
//     ListItemButton with an explicit role="option", id is the default label).
//   - picking an option (submit() path) sets the bound value and close()s the dialog.
// getOptions is a REQUIRED async prop; we pass a vi.fn returning a fixed Item list.
// Items are @marianmeres/item-collection Items; `id` is the default idPropName and
// the default rendered label.

const makeGetOptions = () =>
	vi.fn(async (_q: string) => [{ id: "apple" }, { id: "banana" }]);

test("clicking the opener calls open() and shows a role=dialog with the search box (async)", async () => {
	const getOptions = makeGetOptions();
	const screen = render(Fixture, { getOptions });

	// nothing is open yet
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

	await screen.getByTestId("opener").click();

	// showModal() runs after waitForNextRepaint() — expect.element retries until it lands.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// the search box is a FieldInput text input with the default placeholder.
	const search = screen.getByRole("textbox");
	await expect.element(search).toBeInTheDocument();
	await expect.element(search).toHaveAttribute("placeholder", "Type to search...");
});

test("typing runs the debounced getOptions and renders the results as role=option in a role=listbox", async () => {
	const getOptions = makeGetOptions();
	const screen = render(Fixture, { getOptions });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	// fill the search box -> q updates -> Debounced(~150ms) -> getOptions runs.
	await screen.getByRole("textbox").fill("a");

	// getOptions fires after the debounce — poll (don't assert exact timing).
	await vi.waitFor(() => expect(getOptions.mock.calls.length).toBeGreaterThan(0), {
		timeout: 4000,
	});

	// the returned items render as options inside the results listbox.
	await expect.element(screen.getByRole("listbox")).toBeInTheDocument();
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("option", { name: "banana" }))
		.toBeInTheDocument();
});

test("getOptions receives the typed query string", async () => {
	const getOptions = makeGetOptions();
	const screen = render(Fixture, { getOptions });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	await screen.getByRole("textbox").fill("ap");

	await vi.waitFor(() => expect(getOptions.mock.calls.length).toBeGreaterThan(0), {
		timeout: 4000,
	});
	// first positional arg is the (stringified) query.
	expect(getOptions.mock.calls.at(-1)?.[0]).toBe("ap");
});

test("selecting an option closes the dialog (submit() -> close())", async () => {
	const getOptions = makeGetOptions();
	const screen = render(Fixture, { getOptions });

	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	await screen.getByRole("textbox").fill("a");

	// Wait for the debounced (~150ms) getOptions to fire before asserting the
	// option exists, mirroring the generous retry used in the other tests — the
	// default expect.element budget is tighter than the debounce + async + render
	// chain, so a slow repaint could otherwise flake here.
	await vi.waitFor(() => expect(getOptions.mock.calls.length).toBeGreaterThan(0), {
		timeout: 4000,
	});
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();

	// clicking an option sets it active and submit()s -> the happy path assigns
	// value and close()s the dialog (slide/fade transition means the dialog
	// lingers briefly, so assert absence with the auto-retrying expect.element).
	await screen.getByRole("option", { name: "apple" }).click();

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();

	// submit()'s happy path also assigns `value = options.active` (the picked
	// Item). The fixture mirrors `value.id` into [data-testid=selected].
	await expect.element(screen.getByTestId("selected")).toHaveTextContent("apple");
});
