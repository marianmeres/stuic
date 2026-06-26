import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import FieldOptions from "./FieldOptions.svelte";

// FieldOptions is a modal-based multi/single-select. The opt-in `ordered` prop adds a
// dedicated "Arrange" screen (a second tab in the modal) that renders the current
// selection as a flat, manually-ordered list with per-row Move up/down/top/bottom +
// Remove buttons, plus global "Sort A–Z" / "Reverse" shortcuts. On submit the selection
// is serialized to `value` in the user's chosen order.
//
// Testing notes:
//   - the modal is a native <dialog> rendered inside the component container, so
//     screen.getBy* (scoped to the render) reaches the modal content once opened.
//   - we PRE-SEED `value` with full Item objects: on open the selection hydrates from
//     `value` (independent of getOptions), so we can drive the Arrange screen directly.
//   - the Move buttons carry data-arrange-btn hooks (and aria-labels); each Arrange row
//     is a <div id="arr-..."> whose first <span> is the label. We locate move buttons by
//     the data hook (there are several "Move up" etc., so role+name would be ambiguous).
//   - no CSS is loaded in browser mode, so the responsive `hidden sm:*` on the
//     to-top/to-bottom buttons has no effect here — all five buttons exist in the DOM.

const OPTIONS = [{ id: "Apple" }, { id: "Banana" }, { id: "Cherry" }];

// stub server: ignores the query, always returns the three options (with full data, so
// patchMany keeps labels). Selection rehydration comes from `value`, not from here.
function getOptions() {
	return Promise.resolve({ found: OPTIONS });
}

const seeded = (ids: string[]) => JSON.stringify(ids.map((id) => ({ id })));

type Screen = Awaited<ReturnType<typeof render>>;

// open the modal by clicking the field trigger (the only button in the closed state)
async function open(screen: Screen) {
	await screen.getByRole("button").click();
}

// the arrange rows are <div id="arr-...">; their first <span> is the label
function arrangeLabels(container: HTMLElement): string[] {
	return [...container.querySelectorAll('[id^="arr-"]')].map(
		(row) => row.querySelector("span")?.textContent?.trim() ?? ""
	);
}

function rowButton(container: HTMLElement, rowIndex: number, which: string) {
	const rows = container.querySelectorAll('[id^="arr-"]');
	return (
		rows[rowIndex]?.querySelector<HTMLButtonElement>(`[data-arrange-btn="${which}"]`) ??
		null
	);
}

async function gotoArrange(screen: Screen) {
	await screen.getByRole("tab", { name: /Arrange/ }).click();
}

test("ordered off: the modal has no Arrange tab (default behavior unchanged)", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana"]),
		cardinality: -1,
		getOptions,
	});
	await open(screen);
	// modal is open (Submit present) but there is no tablist / Arrange tab
	await expect
		.element(screen.getByRole("button", { name: "Submit" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("tab", { name: /Arrange/ }))
		.not.toBeInTheDocument();
});

test("ordered + single-select (cardinality 1): Arrange is a no-op (no tab)", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple"]),
		cardinality: 1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await expect
		.element(screen.getByRole("tab", { name: /Arrange/ }))
		.not.toBeInTheDocument();
});

test("Arrange lists the selection in order; boundary buttons are disabled", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);

	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Apple", "Banana", "Cherry"]);
	// first row can't move up/to-top; last row can't move down/to-bottom
	expect(rowButton(screen.container, 0, "up")!.disabled).toBe(true);
	expect(rowButton(screen.container, 0, "top")!.disabled).toBe(true);
	expect(rowButton(screen.container, 2, "down")!.disabled).toBe(true);
	expect(rowButton(screen.container, 2, "bottom")!.disabled).toBe(true);
});

test("Move down then Move up reorders the selection", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Apple", "Banana", "Cherry"]);

	rowButton(screen.container, 0, "down")!.click();
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Banana", "Apple", "Cherry"]);

	// Apple is now row 1 — move it back up
	rowButton(screen.container, 1, "up")!.click();
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Apple", "Banana", "Cherry"]);
});

test("Move to top / Move to bottom jump an item to the extremes", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);

	rowButton(screen.container, 2, "top")!.click(); // Cherry -> top
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Cherry", "Apple", "Banana"]);

	rowButton(screen.container, 0, "bottom")!.click(); // Cherry -> bottom
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Apple", "Banana", "Cherry"]);
});

test("Sort A–Z orders by label; Reverse reverses the current order", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Cherry", "Apple", "Banana"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);
	// seeded (insertion) order is preserved — NOT auto-sorted
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Cherry", "Apple", "Banana"]);

	await screen.getByRole("button", { name: /Sort A/ }).click();
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Apple", "Banana", "Cherry"]);

	await screen.getByRole("button", { name: "Reverse" }).click();
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Cherry", "Banana", "Apple"]);
});

test("Remove drops a row from Arrange and unchecks it on Pick", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);

	rowButton(screen.container, 0, "remove")!.click(); // remove Apple
	await expect.poll(() => arrangeLabels(screen.container)).toEqual(["Banana", "Cherry"]);

	// back to Pick — Apple option is now unchecked (single source of truth)
	await screen.getByRole("tab", { name: "Pick" }).click();
	await expect
		.element(screen.getByRole("checkbox", { name: "Apple" }))
		.toHaveAttribute("aria-checked", "false");
	await expect
		.element(screen.getByRole("checkbox", { name: "Banana" }))
		.toHaveAttribute("aria-checked", "true");
});

test("Submit serializes the arranged order to value/onChange", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
		onChange,
	});
	await open(screen);
	await gotoArrange(screen);

	rowButton(screen.container, 0, "down")!.click(); // -> [Banana, Apple, Cherry]
	await expect
		.poll(() => arrangeLabels(screen.container))
		.toEqual(["Banana", "Apple", "Cherry"]);

	await screen.getByRole("button", { name: "Submit" }).click();

	await expect.poll(() => onChange.mock.calls.length).toBeGreaterThan(0);
	const last = onChange.mock.calls.at(-1)?.[0] as string;
	expect(JSON.parse(last).map((x: { id: string }) => x.id)).toEqual([
		"Banana",
		"Apple",
		"Cherry",
	]);
});

test("a reorder is announced via the aria-live region", async () => {
	const screen = await render(FieldOptions, {
		name: "opts",
		value: seeded(["Apple", "Banana", "Cherry"]),
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	await gotoArrange(screen);

	rowButton(screen.container, 0, "down")!.click();
	const live = screen.container.querySelector('[aria-live="polite"]');
	await expect.poll(() => live?.textContent?.trim()).toBe("Moved Apple down");
});

test("ordered: in-progress picks survive a re-search (rehydrate gating)", async () => {
	// This guards the core fix: in ordered mode the selection is hydrated only on open,
	// NOT on every typeahead fetch — otherwise a pick (and any manual order) would be
	// reset to the last-submitted value on the next keystroke.
	const screen = await render(FieldOptions, {
		name: "opts",
		value: "[]",
		cardinality: -1,
		ordered: true,
		getOptions,
	});
	await open(screen);
	// pick Apple from the (server-loaded) options list
	await screen.getByRole("checkbox", { name: "Apple" }).click();
	await expect
		.element(screen.getByRole("checkbox", { name: "Apple" }))
		.toHaveAttribute("aria-checked", "true");

	// type to trigger a refetch (debounced) — Apple must remain selected
	await screen.getByRole("textbox").fill("a");
	await expect
		.poll(() =>
			screen
				.getByRole("checkbox", { name: "Apple" })
				.element()
				.getAttribute("aria-checked")
		)
		.toBe("true");
});
