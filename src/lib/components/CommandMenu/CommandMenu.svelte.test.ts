import { render } from "vitest-browser-svelte";
import { userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import type { Item } from "@marianmeres/item-collection";
import { NotificationsStack } from "../Notifications/index.js";
import Fixture from "./CommandMenu.fixture.svelte";
import type { GetOptionsContext } from "./CommandMenu.svelte";

// CommandMenu is a command palette built on ModalDialog (opened imperatively via
// open()), so every assertion goes through the fixture that holds the ref. The
// browser-only contracts worth proving:
//   - open() -> ModalDialog.showModal() puts a role="dialog" in the a11y tree
//     ASYNCHRONOUSLY (waitForNextRepaint().then(showModal)) — always expect.element
//     auto-retry, never a synchronous read.
//   - the search box is a FieldInput text <input> (role="textbox") whose default
//     placeholder is the i18n "Type to search...".
//   - typing is debounced ~150ms (the `Debounced` util) before getOptions runs; results
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
	const screen = await render(Fixture, { getOptions });

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
	const screen = await render(Fixture, { getOptions });

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
	const screen = await render(Fixture, { getOptions });

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
	const screen = await render(Fixture, { getOptions });

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

// ---------------------------------------------------------------------------
// Progressive options: getOptions(q, current, { append, signal }) + sortOptions.
// The tests below hold every getOptions call open (a deferred promise) and drive
// it by hand — `append` batches, resolve, reject — so each contract line is
// observable in isolation: what the first batch replaces, what later batches add,
// when the spinner goes off, what a superseded query may still do (nothing), and
// where a late batch lands under the default / a custom / no ordering.
// ---------------------------------------------------------------------------

interface DeferredCall {
	q: string;
	ctx: GetOptionsContext;
	resolve: (items: Item[]) => void;
	reject: (e: unknown) => void;
}

// A getOptions whose every call stays pending until the test settles it, handing
// back the call's ctx so the test can `append` and inspect `signal`.
const makeDeferredGetOptions = () => {
	const calls: DeferredCall[] = [];
	const getOptions = vi.fn(
		(q: string, _current: Item[], ctx: GetOptionsContext) =>
			new Promise<Item[]>((resolve, reject) => calls.push({ q, ctx, resolve, reject }))
	);
	return { getOptions, calls };
};

const notificationsMock = () => {
	const n = new NotificationsStack([]);
	const error = vi.spyOn(n, "error");
	return { notifications: n, error };
};

// the n-th getOptions call fires after the ~150ms debounce — poll, don't time it
const waitForCall = (calls: DeferredCall[], n: number) =>
	vi.waitFor(() => expect(calls.length).toBeGreaterThan(n), { timeout: 4000 });

// the "still looking" spinner sits in the search box's inputAfter slot
const spinner = () => document.querySelector(".stuic-spinner");
// rendered order of options / group headers, top to bottom
const optionNames = () =>
	[...document.querySelectorAll('[role="option"]')].map((el) => el.textContent?.trim());
const groupNames = () =>
	[...document.querySelectorAll(".stuic-command-menu-group-header")].map((el) =>
		el.textContent?.trim()
	);
// a macrotask boundary: every microtask queued by a resolve()/reject() (the
// component's then/catch/finally chain) has run by the time it fires
const drainMicrotasks = () => new Promise((r) => setTimeout(r, 0));

async function openAndType(screen: Awaited<ReturnType<typeof render>>, q: string) {
	await screen.getByTestId("opener").click();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await screen.getByRole("textbox").fill(q);
}

test("ctx.append shows options while the spinner is still on; the resolved array adds to them and turns it off", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);
	await expect.poll(spinner).not.toBeNull();

	calls[0].ctx.append([{ id: "apple" }]);
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();
	// "still looking" is about the promise, not about whether the list has rows
	expect(spinner()).not.toBeNull();

	calls[0].resolve([{ id: "banana" }]);
	await expect
		.element(screen.getByRole("option", { name: "banana" }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();
	await expect.poll(spinner).toBeNull();
});

test("the first batch of a new query replaces the previous query's options, later batches add, a repeated id appears once", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);
	calls[0].resolve([{ id: "apple" }, { id: "banana" }]);
	await expect
		.element(screen.getByRole("option", { name: "banana" }))
		.toBeInTheDocument();

	await screen.getByRole("textbox").fill("ab");
	await waitForCall(calls, 1);
	// the previous query's options stay up until the first batch lands (no empty flash)
	expect(optionNames()).toEqual(["apple", "banana"]);

	calls[1].ctx.append([{ id: "apricot" }]);
	await expect
		.element(screen.getByRole("option", { name: "apricot" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("option", { name: "apple" }))
		.not.toBeInTheDocument();
	expect(optionNames()).toEqual(["apricot"]);

	calls[1].ctx.append([{ id: "apricot" }, { id: "avocado" }]);
	await expect
		.element(screen.getByRole("option", { name: "avocado" }))
		.toBeInTheDocument();

	calls[1].resolve([{ id: "apricot" }, { id: "almond" }]);
	await expect
		.element(screen.getByRole("option", { name: "almond" }))
		.toBeInTheDocument();
	// default order is alphabetical; "apricot" was named three times and shows once
	expect(optionNames()).toEqual(["almond", "apricot", "avocado"]);
	await expect.poll(spinner).toBeNull();
});

test("a superseded query: its signal is aborted, its late append is ignored and its rejection is not reported", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const { notifications, error } = notificationsMock();
	const screen = await render(Fixture, { getOptions, notifications });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);
	expect(calls[0].ctx.signal.aborted).toBe(false);

	await screen.getByRole("textbox").fill("ab");
	await waitForCall(calls, 1);
	expect(calls[0].ctx.signal.aborted).toBe(true);
	expect(calls[1].ctx.signal.aborted).toBe(false);

	calls[0].ctx.append([{ id: "stale" }]);
	calls[0].reject(new Error("boom"));
	calls[1].resolve([{ id: "fresh" }]);
	await expect.element(screen.getByRole("option", { name: "fresh" })).toBeInTheDocument();
	await expect
		.element(screen.getByRole("option", { name: "stale" }))
		.not.toBeInTheDocument();
	expect(optionNames()).toEqual(["fresh"]);
	expect(error).not.toHaveBeenCalled();
	await expect.poll(spinner).toBeNull();
});

test("a rejection is reported once for the current query; the batches already on screen stay", async () => {
	const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
	const { getOptions, calls } = makeDeferredGetOptions();
	const { notifications, error } = notificationsMock();
	const screen = await render(Fixture, { getOptions, notifications });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);

	calls[0].ctx.append([{ id: "apple" }]);
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();

	calls[0].reject(new Error("boom"));
	await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(1));
	expect(error.mock.calls[0][0]).toBe("Error: boom");
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();
	await expect.poll(spinner).toBeNull();

	// an append after the promise settled does nothing
	calls[0].ctx.append([{ id: "late" }]);
	await drainMicrotasks();
	expect(optionNames()).toEqual(["apple"]);
	consoleError.mockRestore();
});

test("an append that leaves the same option active moves neither the highlight nor the focus", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);
	calls[0].ctx.append([{ id: "apple" }, { id: "banana" }]);
	await expect.element(screen.getByRole("option", { name: "apple" })).toBeInTheDocument();

	await userEvent.keyboard("{ArrowDown}");
	await expect
		.element(screen.getByRole("option", { name: "apple" }))
		.toHaveAttribute("aria-selected", "true");

	// arrowing focuses the active option; the person then clicks back into the search box
	const textbox = screen.getByRole("textbox");
	await textbox.click();
	expect(document.activeElement).toBe(textbox.element());

	calls[0].ctx.append([{ id: "cherry" }]);
	await expect
		.element(screen.getByRole("option", { name: "cherry" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("option", { name: "apple" }))
		.toHaveAttribute("aria-selected", "true");
	// the batch did not pull focus out of the input
	expect(document.activeElement).toBe(textbox.element());
});

test("sortOptions comparator: a late group lands where the comparator puts it; the active option keeps its highlight across the re-sort", async () => {
	const rank: Record<string, number> = { nav: 0, actions: 1, data: 2 };
	const sortOptions = (a: Item, b: Item) =>
		rank[a.optgroup] - rank[b.optgroup] || `${a.id}`.localeCompare(`${b.id}`);
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions, sortOptions });
	await openAndType(screen, "s");
	await waitForCall(calls, 0);

	calls[0].ctx.append([
		{ id: "settings", optgroup: "nav" },
		{ id: "save", optgroup: "actions" },
	]);
	await expect.element(screen.getByRole("option", { name: "save" })).toBeInTheDocument();
	expect(groupNames()).toEqual(["nav", "actions"]);

	await userEvent.keyboard("{ArrowDown}");
	await expect
		.element(screen.getByRole("option", { name: "settings" }))
		.toHaveAttribute("aria-selected", "true");

	calls[0].ctx.append([
		{ id: "sales report", optgroup: "data" },
		{ id: "archive", optgroup: "nav" },
	]);
	await expect
		.element(screen.getByRole("option", { name: "sales report" }))
		.toBeInTheDocument();
	// the default order would be actions, data, nav
	expect(groupNames()).toEqual(["nav", "actions", "data"]);
	expect(optionNames()).toEqual(["archive", "settings", "save", "sales report"]);
	// "settings" moved from index 0 to 1 and is still the active one
	await expect
		.element(screen.getByRole("option", { name: "settings" }))
		.toHaveAttribute("aria-selected", "true");
	expect(document.querySelectorAll('[aria-selected="true"]').length).toBe(1);
});

test("sortOptions={false}: options and groups keep their arrival order", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions, sortOptions: false });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);

	calls[0].ctx.append([
		{ id: "zeta", optgroup: "b" },
		{ id: "alpha", optgroup: "a" },
	]);
	await expect.element(screen.getByRole("option", { name: "alpha" })).toBeInTheDocument();
	calls[0].resolve([{ id: "mid", optgroup: "b" }]);
	await expect.element(screen.getByRole("option", { name: "mid" })).toBeInTheDocument();

	// group "b" appeared first, so it renders first; "mid" joins it in arrival order
	expect(groupNames()).toEqual(["b", "a"]);
	expect(optionNames()).toEqual(["zeta", "mid", "alpha"]);
});

test("without showAllOnEmptyQ, clearing the input while a request is in flight drops its answer and stops the spinner", async () => {
	const { getOptions, calls } = makeDeferredGetOptions();
	const screen = await render(Fixture, { getOptions });
	await openAndType(screen, "a");
	await waitForCall(calls, 0);
	await expect.poll(spinner).not.toBeNull();

	await screen.getByRole("textbox").fill("");
	// the emptied query supersedes the in-flight one
	await expect.poll(() => calls[0].ctx.signal.aborted).toBe(true);
	await expect.poll(spinner).toBeNull();

	calls[0].resolve([{ id: "apple" }]);
	await drainMicrotasks();
	expect(optionNames()).toEqual([]);
	await expect.element(screen.getByRole("listbox")).not.toBeInTheDocument();
	expect(spinner()).toBeNull();
});
