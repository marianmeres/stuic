import { render } from "vitest-browser-svelte";
import { userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldTable, {
	type FieldTableColumn,
	type FieldTableRow,
} from "./FieldTable.svelte";
import FieldTableHarness from "./FieldTableHarness.test.svelte";

// FieldTable is a composite form control whose bindable `value` is a live array
// of row objects; the six built-in cell types each write their typed value. The
// serialized value is carried by a HIDDEN <input type="hidden" name> for form
// participation and as the validate-action anchor. Every cell has a real
// <label for> reading "Column, row N", which is how the tests address cells.
//
// The high-yield browser contracts:
//   - header + per-cell accessible names, the unit in both
//   - each cell type writes its typed value (number -> number, blank -> null,
//     checkbox -> boolean, date ISO, text trimmed on commit only)
//   - add (seeded empties / newRow, focus, announcement), move (order + focus
//     follows the row), remove (focus lands sensibly)
//   - no internal id ever leaks into a row; unknown keys round-trip
//   - a non-array value does not emit on mount
//   - validate(): required / maxRows / the first invalid cell (aria-invalid,
//     inline message, focus), a stored select value outside the options
//   - unknown column types via the `cell` snippet or read-only
//   - duplicate column keys do not throw
//   - one FormData entry; Enter in a cell submits the host form (harness)
//   - the layout attribute contract; external bind:value resync (harness)
//
// NOTE: browser tests do not load the component's index.css, so the container
// query itself (the `auto` table <-> stacked flip) is not observable here — only
// the attribute contract it is driven by. The switch is exercised on the demo page.

const COLUMNS: FieldTableColumn[] = [
	{ key: "part", type: "text", label: "Part", maxLength: 20 },
	{ key: "qty", type: "number", label: "Qty", unit: "pcs" },
	{
		key: "material",
		type: "select",
		label: "Material",
		placeholder: "Pick…",
		options: [
			{ value: "steel", label: "Steel" },
			{ value: "brass", label: "Brass" },
		],
	},
	{ key: "rohs", type: "checkbox", label: "RoHS" },
	{ key: "since", type: "date", label: "Since" },
	{ key: "sheet", type: "url", label: "Datasheet" },
];

const BOM: FieldTableRow[] = [
	{
		part: "M6 bolt",
		qty: 12,
		material: "steel",
		rohs: true,
		since: "2026-01-15",
		sheet: "",
	},
	{
		part: "Washer",
		qty: 24,
		material: "brass",
		rohs: false,
		since: "",
		sheet: "https://example.com/washer.pdf",
	},
];

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function baseProps(value: unknown = BOM, extra: Record<string, unknown> = {}) {
	return {
		name: "bom",
		label: "Bill of materials",
		columns: COLUMNS,
		value: clone(value) as FieldTableRow[],
		...extra,
	};
}

function hiddenEl(container: HTMLElement) {
	const el = container.querySelector<HTMLInputElement>('input[type="hidden"]');
	if (!el) throw new Error("missing hidden input");
	return el;
}

function emitted(container: HTMLElement): FieldTableRow[] {
	return JSON.parse(hiddenEl(container).value || "[]");
}

function liveText(container: HTMLElement) {
	return container.querySelector(".sr-only[aria-live]")?.textContent ?? "";
}

function root(container: HTMLElement) {
	const el = container.querySelector<HTMLElement>(".stuic-field-table");
	if (!el) throw new Error("missing .stuic-field-table root");
	return el;
}

// Cells are addressed by their accessible name, "Column, row N" — case-insensitive
// because `row_label` ("Row {{row}}") doubles as the stacked card's visible title.
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function cell(
	screen: Pick<Awaited<ReturnType<typeof render>>, "getByLabelText">,
	label: string,
	row: number
) {
	return screen.getByLabelText(new RegExp(`^${esc(label)}, row ${row}$`, "i"));
}

function activeRowIndex(container: HTMLElement) {
	const tr = (document.activeElement as HTMLElement | null)?.closest("tbody tr");
	const all = [...container.querySelectorAll("tbody tr")];
	return tr ? all.indexOf(tr) : -1;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

test("renders one th[scope=col] per column (unit in the header) plus the actions header, and the layout attributes", async () => {
	const screen = await render(FieldTable, baseProps());
	const ths = [...screen.container.querySelectorAll('th[scope="col"]')];
	// 6 columns + the actions column
	expect(ths.length).toBe(7);
	expect(ths.map((th) => th.textContent?.trim())).toEqual([
		"Part",
		"Qty (pcs)",
		"Material",
		"RoHS",
		"Since",
		"Datasheet",
		"Actions",
	]);
	const el = root(screen.container);
	expect(el.getAttribute("data-layout")).toBe("auto");
	expect(el.getAttribute("data-table-from")).toBe("md");
	// the serialized value round-trips untouched
	expect(emitted(screen.container)).toEqual(BOM);
});

test("every cell has a real label: 'Column, row N' (unit included), in both header and cell", async () => {
	const screen = await render(FieldTable, baseProps());
	await expect.element(cell(screen, "Part", 1)).toHaveValue("M6 bolt");
	await expect.element(cell(screen, "Qty (pcs)", 2)).toHaveValue("24");
	await expect.element(cell(screen, "Material", 2)).toHaveValue("brass");
	await expect.element(cell(screen, "RoHS", 1)).toBeChecked();
	await expect.element(cell(screen, "Since", 1)).toHaveValue("2026-01-15");
	await expect
		.element(cell(screen, "Datasheet", 2))
		.toHaveValue("https://example.com/washer.pdf");
});

test("layout attribute contract: stacked / table carry no data-table-from; auto maps tableFrom", async () => {
	const stacked = await render(FieldTable, baseProps(BOM, { layout: "stacked" }));
	expect(root(stacked.container).getAttribute("data-layout")).toBe("stacked");
	expect(root(stacked.container).hasAttribute("data-table-from")).toBe(false);

	const table = await render(FieldTable, baseProps(BOM, { layout: "table" }));
	expect(root(table.container).getAttribute("data-layout")).toBe("table");
	expect(root(table.container).hasAttribute("data-table-from")).toBe(false);

	const auto = await render(FieldTable, baseProps(BOM, { tableFrom: "lg" }));
	expect(root(auto.container).getAttribute("data-table-from")).toBe("lg");
});

test("an empty value shows the empty message and only the add button; rows render no thead", async () => {
	const screen = await render(FieldTable, baseProps([]));
	await expect.element(screen.getByText("No rows yet")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Add row" }))
		.toBeInTheDocument();
	expect(screen.container.querySelector("table")).toBeNull();
	expect(hiddenEl(screen.container).value).toBe("[]");
});

test("displayLanguage resolves localized column and option labels", async () => {
	const screen = await render(
		FieldTable,
		baseProps([{ part: "x", material: "steel" }], {
			displayLanguage: "sk",
			columns: [
				{ key: "part", type: "text", label: { en: "Part", sk: "Diel" } },
				{
					key: "material",
					type: "select",
					label: { en: "Material", sk: "Materiál" },
					options: [{ value: "steel", label: { en: "Steel", sk: "Oceľ" } }],
				},
			] satisfies FieldTableColumn[],
		})
	);
	const ths = [...screen.container.querySelectorAll('th[scope="col"]')].map((th) =>
		th.textContent?.trim()
	);
	expect(ths.slice(0, 2)).toEqual(["Diel", "Materiál"]);
	await expect.element(cell(screen, "Materiál", 1)).toHaveValue("steel");
	expect(
		screen.container.querySelector('option[value="steel"]')?.textContent?.trim()
	).toBe("Oceľ");
});

// ---------------------------------------------------------------------------
// cell writes
// ---------------------------------------------------------------------------

test("text cell: written as typed, trimmed on commit (change), not while typing", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldTable, baseProps(BOM, { onChange }));
	const part = cell(screen, "Part", 1);
	await part.fill("Bolt ");
	await expect.poll(() => emitted(screen.container)[0].part).toBe("Bolt ");
	// moving focus away commits -> trimmed
	await cell(screen, "Part", 2).click();
	await expect.poll(() => emitted(screen.container)[0].part).toBe("Bolt");
	expect(onChange).toHaveBeenCalled();
	expect(onChange.mock.lastCall?.[0][0].part).toBe("Bolt");
});

test("number cell: writes a number, blank writes null, garbage is kept as typed", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { locale: "en" }));
	const qty = cell(screen, "Qty (pcs)", 1);
	await qty.fill("4.5");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(4.5);
	await qty.fill("1 000");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(1000);
	await qty.fill("");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(null);
	await qty.fill("abc");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe("abc");
	// a "," under an English locale is not a thousands separator — kept + flagged
	await qty.fill("1,000");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe("1,000");
});

test("number cell under locale=sk: ',' is the decimal separator and the display is localized after blur", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { locale: "sk" }));
	const qty = cell(screen, "Qty (pcs)", 1);
	// a stored 12 displays as "12"; 4.2 would display as "4,2"
	await expect.element(qty).toHaveValue("12");
	await qty.fill("4,2");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(4.2);
	// while typing, the input shows exactly what was typed
	await expect.element(qty).toHaveValue("4,2");
	await qty.fill("1 000,50");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(1000.5);
	// blur drops the draft -> formatted for the locale (no grouping, ',' decimal)
	await cell(screen, "Part", 1).click();
	await expect.element(qty).toHaveValue("1000,5");
});

test("number cell: a trailing decimal point mid-typing does not snap away", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { locale: "en" }));
	const qty = cell(screen, "Qty (pcs)", 1);
	await qty.fill("4.");
	await expect.poll(() => emitted(screen.container)[0].qty).toBe(4);
	await expect.element(qty).toHaveValue("4.");
});

test("select cell: writes the option value; the blank entry writes ''", async () => {
	const screen = await render(FieldTable, baseProps());
	const material = cell(screen, "Material", 1);
	await material.selectOptions("brass");
	await expect.poll(() => emitted(screen.container)[0].material).toBe("brass");
	await material.selectOptions("");
	await expect.poll(() => emitted(screen.container)[0].material).toBe("");
	// the blank entry carries the column placeholder
	expect(screen.container.querySelector('option[value=""]')?.textContent?.trim()).toBe(
		"Pick…"
	);
});

test("checkbox cell: writes a boolean, only when toggled", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldTable, baseProps(BOM, { onChange }));
	const rohs = cell(screen, "RoHS", 2);
	await expect.element(rohs).not.toBeChecked();
	expect(onChange).not.toHaveBeenCalled();
	await rohs.click();
	await expect.poll(() => emitted(screen.container)[1].rohs).toBe(true);
	await rohs.click();
	await expect.poll(() => emitted(screen.container)[1].rohs).toBe(false);
});

test("date cell: writes ISO; clearing writes ''", async () => {
	const screen = await render(FieldTable, baseProps());
	const since = cell(screen, "Since", 2);
	await since.fill("2026-02-03");
	await expect.poll(() => emitted(screen.container)[1].since).toBe("2026-02-03");
	await since.fill("");
	await expect.poll(() => emitted(screen.container)[1].since).toBe("");
});

test("url cell: written as typed (validated, not coerced)", async () => {
	const screen = await render(FieldTable, baseProps());
	const sheet = cell(screen, "Datasheet", 1);
	await sheet.fill("https://example.com/bolt.pdf");
	await expect
		.poll(() => emitted(screen.container)[0].sheet)
		.toBe("https://example.com/bolt.pdf");
	await sheet.fill("not a url");
	await expect.poll(() => emitted(screen.container)[0].sheet).toBe("not a url");
});

test("a loaded row missing a cell renders it empty and writes nothing until edited", async () => {
	const screen = await render(FieldTable, baseProps([{ part: "Nut" }]));
	const qty = cell(screen, "Qty (pcs)", 1);
	await expect.element(qty).toHaveValue("");
	await expect.element(cell(screen, "RoHS", 1)).not.toBeChecked();
	expect(emitted(screen.container)).toEqual([{ part: "Nut" }]);
	await qty.fill("3");
	await expect.poll(() => emitted(screen.container)).toEqual([{ part: "Nut", qty: 3 }]);
});

// ---------------------------------------------------------------------------
// add / move / remove
// ---------------------------------------------------------------------------

test("'Add row' seeds one empty value per column, focuses the new row's first cell and announces", async () => {
	const screen = await render(FieldTable, baseProps());
	await screen.getByRole("button", { name: "Add row" }).click();
	await expect
		.poll(() => emitted(screen.container)[2])
		.toEqual({ part: "", qty: null, material: "", rohs: false, since: "", sheet: "" });
	await expect.element(cell(screen, "Part", 3)).toHaveFocus();
	await expect.poll(() => liveText(screen.container)).toBe("Row 3 added");
});

test("`newRow` overrides what 'Add row' inserts", async () => {
	const screen = await render(
		FieldTable,
		baseProps([], { newRow: () => ({ part: "New", qty: 1 }) })
	);
	await screen.getByRole("button", { name: "Add row" }).click();
	await expect.poll(() => emitted(screen.container)).toEqual([{ part: "New", qty: 1 }]);
});

test("move down reorders the value, focus follows the moved row, the live region announces", async () => {
	const screen = await render(FieldTable, baseProps());
	await screen.getByRole("button", { name: "Move row 1 down" }).click();
	await expect
		.poll(() => emitted(screen.container).map((r) => r.part))
		.toEqual(["Washer", "M6 bolt"]);
	// focus stayed on the moved row (now the second one), on the "down" button...
	// which is disabled at the boundary, so it fell back to its enabled sibling
	await expect.poll(() => activeRowIndex(screen.container)).toBe(1);
	expect((document.activeElement as HTMLElement).getAttribute("data-ft-btn")).toBe("up");
	await expect
		.poll(() => liveText(screen.container))
		.toBe("Row moved to position 2 of 2");
	// and back up
	await screen.getByRole("button", { name: "Move row 2 up" }).click();
	await expect
		.poll(() => emitted(screen.container).map((r) => r.part))
		.toEqual(["M6 bolt", "Washer"]);
	await expect.poll(() => activeRowIndex(screen.container)).toBe(0);
});

test("the boundary move buttons are disabled; a single row has no move buttons", async () => {
	const screen = await render(FieldTable, baseProps());
	await expect
		.element(screen.getByRole("button", { name: "Move row 1 up" }))
		.toBeDisabled();
	await expect
		.element(screen.getByRole("button", { name: "Move row 2 down" }))
		.toBeDisabled();

	// (a second render in the same test: query its own container, locators are page-scoped)
	const one = await render(FieldTable, baseProps([BOM[0]]));
	expect(one.container.querySelector('[data-ft-btn="up"]')).toBeNull();
	expect(one.container.querySelector('[data-ft-btn="remove"]')).not.toBeNull();
});

test("`reorderable={false}` renders no move buttons", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { reorderable: false }));
	expect(screen.container.querySelector("[data-ft-btn='up']")).toBeNull();
	expect(screen.container.querySelectorAll("[data-ft-btn='remove']").length).toBe(2);
});

test("remove: focus lands on the row now at that index, then the previous one, then 'Add row'", async () => {
	const screen = await render(FieldTable, baseProps());
	await screen.getByRole("button", { name: "Remove row 1" }).click();
	await expect
		.poll(() => emitted(screen.container).map((r) => r.part))
		.toEqual(["Washer"]);
	await expect.poll(() => liveText(screen.container)).toBe("Row 1 removed");
	// the former row 2 is now row 1 and holds focus
	await expect.element(cell(screen, "Part", 1)).toHaveFocus();
	await screen.getByRole("button", { name: "Remove row 1" }).click();
	await expect.poll(() => emitted(screen.container)).toEqual([]);
	await expect.element(screen.getByRole("button", { name: "Add row" })).toHaveFocus();
});

test("no row ever gains an internal id; keys outside `columns` round-trip untouched", async () => {
	const seeded = BOM.map((r, i) => ({ ...r, legacy: `L${i}`, nested: { a: i } }));
	const screen = await render(FieldTable, baseProps(seeded));
	const allowed = new Set([...Object.keys(seeded[0]), ...COLUMNS.map((c) => c.key)]);

	await cell(screen, "Part", 1).fill("Edited");
	await screen.getByRole("button", { name: "Move row 1 down" }).click();
	await screen.getByRole("button", { name: "Add row" }).click();
	await cell(screen, "Qty (pcs)", 3).fill("7");

	await expect.poll(() => emitted(screen.container).length).toBe(3);
	const rows = emitted(screen.container);
	for (const row of rows) {
		for (const k of Object.keys(row))
			expect(allowed.has(k), `leaked key ${k}`).toBe(true);
	}
	expect(rows[0]).toMatchObject({ part: "Washer", legacy: "L1", nested: { a: 1 } });
	expect(rows[1]).toMatchObject({ part: "Edited", legacy: "L0", nested: { a: 0 } });
	expect(rows[2].qty).toBe(7);
});

test("a non-array value renders zero rows and does not emit on mount; the first edit emits an array", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldTable, baseProps("" as unknown, { onChange }));
	await expect.element(screen.getByText("No rows yet")).toBeInTheDocument();
	expect(hiddenEl(screen.container).value).toBe("[]");
	expect(onChange).not.toHaveBeenCalled();
	await screen.getByRole("button", { name: "Add row" }).click();
	await expect.poll(() => emitted(screen.container).length).toBe(1);
	expect(Array.isArray(onChange.mock.lastCall?.[0])).toBe(true);
});

test("a non-object entry renders as a degraded read-only row that can be moved / removed and round-trips", async () => {
	const screen = await render(FieldTable, baseProps([BOM[0], "junk", 42]));
	const degraded = screen.container.querySelectorAll("td[data-degraded]");
	expect(degraded.length).toBe(2);
	await expect
		.element(screen.getByText(/not a record this editor can show/).first())
		.toBeInTheDocument();
	expect(emitted(screen.container)).toEqual([BOM[0], "junk", 42]);
	await screen.getByRole("button", { name: "Move row 2 up" }).click();
	await expect.poll(() => emitted(screen.container)).toEqual(["junk", BOM[0], 42]);
	await screen.getByRole("button", { name: "Remove row 3" }).click();
	await expect.poll(() => emitted(screen.container)).toEqual(["junk", BOM[0]]);
});

test("`maxRows`: 'Add row' is disabled at the cap and the counter is shown", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { maxRows: 2 }));
	await expect.element(screen.getByRole("button", { name: "Add row" })).toBeDisabled();
	await expect.element(screen.getByText("2 / 2")).toBeInTheDocument();
	await screen.getByRole("button", { name: "Remove row 2" }).click();
	await expect.element(screen.getByRole("button", { name: "Add row" })).toBeEnabled();
	await expect.element(screen.getByText("1 / 2")).toBeInTheDocument();
});

test("`disabled`: every control is disabled, the actions cell is not rendered, 'Add row' is disabled", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { disabled: true }));
	await expect.element(cell(screen, "Part", 1)).toBeDisabled();
	await expect.element(cell(screen, "RoHS", 1)).toBeDisabled();
	expect(screen.container.querySelector(".stuic-field-table-actions")).toBeNull();
	await expect.element(screen.getByRole("button", { name: "Add row" })).toBeDisabled();
});

test("an empty `columns` list: rows are action-only, nothing can be added, nothing throws", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { columns: [] }));
	expect(screen.container.querySelectorAll("tbody tr").length).toBe(2);
	await expect.element(screen.getByRole("button", { name: "Add row" })).toBeDisabled();
	await screen.getByRole("button", { name: "Remove row 1" }).click();
	await expect.poll(() => emitted(screen.container)).toEqual([BOM[1]]);
});

test("duplicate column keys do not throw: the first occurrence wins, with a console.warn", async () => {
	const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	try {
		const screen = await render(
			FieldTable,
			baseProps([{ part: "x" }], {
				columns: [
					{ key: "part", type: "text", label: "Part" },
					{ key: "part", type: "number", label: "Part again" },
					{ key: "qty", type: "number", label: "Qty" },
				] satisfies FieldTableColumn[],
			})
		);
		const ths = [...screen.container.querySelectorAll('th[scope="col"]')].map((th) =>
			th.textContent?.trim()
		);
		expect(ths).toEqual(["Part", "Qty", "Actions"]);
		expect(warn).toHaveBeenCalled();
		expect(String(warn.mock.calls[0][0])).toContain('"part"');
	} finally {
		warn.mockRestore();
	}
});

test("an empty column label falls back to the key", async () => {
	const screen = await render(
		FieldTable,
		baseProps([{ sku: "a" }], {
			columns: [{ key: "sku", type: "text", label: "" }] satisfies FieldTableColumn[],
		})
	);
	expect(screen.container.querySelector('th[scope="col"]')?.textContent?.trim()).toBe(
		"sku"
	);
	await expect.element(cell(screen, "sku", 1)).toHaveValue("a");
});

// ---------------------------------------------------------------------------
// validation
// ---------------------------------------------------------------------------

test("validate(): `required` with zero rows", async () => {
	const screen = await render(FieldTable, baseProps([], { required: true }));
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("At least one row is required");
	await expect.element(screen.getByText("At least one row is required")).toBeVisible();
	expect(screen.component.getValidation()?.valid).toBe(false);
	screen.component.clearValidation();
	expect(screen.component.getValidation()).toBeUndefined();
});

test("validate() passes on a clean seeded list", async () => {
	const screen = await render(FieldTable, baseProps());
	expect(screen.component.validate()?.valid).toBe(true);
});

test("validate() reports the first invalid cell as 'Row N, Column: message', marks it aria-invalid with an inline message and focuses it", async () => {
	const screen = await render(
		FieldTable,
		baseProps([BOM[0], { ...BOM[1], qty: "abc", sheet: "nope" }])
	);
	// nothing is flagged before validation ran (or the cell was blurred)
	expect(screen.container.querySelector("[aria-invalid]")).toBeNull();
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("Row 2, Qty: not a number");
	const qty = cell(screen, "Qty (pcs)", 2);
	await expect.element(qty).toHaveAttribute("aria-invalid", "true");
	await expect.element(qty).toHaveFocus();
	await expect.element(screen.getByText("not a number", { exact: true })).toBeVisible();
	// the second offender is flagged inline too, in row-major order after the first
	await expect
		.element(cell(screen, "Datasheet", 2))
		.toHaveAttribute("aria-invalid", "true");
	await expect
		.element(screen.getByText("must be a web address starting with http:// or https://"))
		.toBeVisible();
	// fixing the cell clears it; the report moves on to the next offender
	await qty.fill("5");
	await expect
		.poll(() => screen.component.validate()?.message)
		.toBe("Row 2, Datasheet: must be a web address starting with http:// or https://");
	await expect.element(qty).not.toHaveAttribute("aria-invalid");
	await cell(screen, "Datasheet", 2).fill("https://example.com/w.pdf");
	await expect.poll(() => screen.component.validate()?.valid).toBe(true);
	expect(screen.container.querySelector("[aria-invalid]")).toBeNull();
});

test("a cell edited and blurred shows its inline error without validate()", async () => {
	const screen = await render(FieldTable, baseProps(BOM, { locale: "en" }));
	const qty = cell(screen, "Qty (pcs)", 1);
	await qty.fill("x");
	await cell(screen, "Part", 1).click();
	await expect.element(qty).toHaveAttribute("aria-invalid", "true");
	await expect.element(screen.getByText("not a number", { exact: true })).toBeVisible();
});

test("a stored select value outside the options is shown, flagged, and still round-trips", async () => {
	const screen = await render(FieldTable, baseProps([{ ...BOM[0], material: "gold" }]));
	const material = cell(screen, "Material", 1);
	await expect.element(material).toHaveValue("gold");
	expect(emitted(screen.container)[0].material).toBe("gold");
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("Row 1, Material: “gold” is not one of the choices");
	await expect.element(material).toHaveAttribute("aria-invalid", "true");
	// picking a real option clears it; the unknown entry is then gone
	await material.selectOptions("steel");
	await expect.poll(() => emitted(screen.container)[0].material).toBe("steel");
	await expect.poll(() => screen.component.validate()?.valid).toBe(true);
	expect(screen.container.querySelector('option[value="gold"]')).toBeNull();
});

test("validate(): a stored date that is not YYYY-MM-DD, a text over maxLength, and a seeded list over maxRows", async () => {
	const bad = await render(FieldTable, baseProps([{ ...BOM[0], since: "2026-13-45" }]));
	expect(bad.component.validate()?.message).toBe("Row 1, Since: not a valid date");
	// the native date input shows empty for it, the value is untouched
	await expect.element(cell(bad, "Since", 1)).toHaveValue("");
	expect(emitted(bad.container)[0].since).toBe("2026-13-45");

	const long = await render(FieldTable, baseProps([{ ...BOM[0], part: "x".repeat(25) }]));
	expect(long.component.validate()?.message).toBe(
		"Row 1, Part: too long (max 20 characters)"
	);

	const over = await render(FieldTable, baseProps(BOM, { maxRows: 1 }));
	expect(over.component.validate()?.message).toBe("Maximum number of rows is 1");
	// never truncated
	expect(emitted(over.container).length).toBe(2);
});

test("`column.validate` runs after the built-in rule; the consumer's customValidator runs last", async () => {
	const customValidator = vi.fn(() => "consumer says no");
	const screen = await render(
		FieldTable,
		baseProps(BOM, {
			columns: [
				{
					key: "qty",
					type: "number",
					label: "Qty",
					validate: (v: unknown) =>
						typeof v === "number" && v > 20 ? "too many" : undefined,
				},
			] satisfies FieldTableColumn[],
			validate: { customValidator },
		})
	);
	expect(screen.component.validate()?.message).toBe("Row 2, Qty: too many");
	expect(customValidator).not.toHaveBeenCalled();
	await cell(screen, "Qty", 2).fill("2");
	await expect.poll(() => screen.component.validate()?.message).toBe("consumer says no");
	expect(customValidator).toHaveBeenCalled();
});

test("validate={false} disables validation entirely", async () => {
	const screen = await render(
		FieldTable,
		baseProps([], { required: true, validate: false })
	);
	expect(screen.component.validate()).toBeUndefined();
});

test("i18n: a Slovak `t` renders Slovak chrome and messages", async () => {
	const { createFieldTableT } = await import("./field-table-i18n.js");
	const { FIELD_TABLE_MESSAGES_SK } = await import("./field-table-i18n-sk.js");
	const screen = await render(
		FieldTable,
		baseProps([{ ...BOM[0], qty: "abc" }], {
			t: createFieldTableT(FIELD_TABLE_MESSAGES_SK),
		})
	);
	await expect
		.element(screen.getByRole("button", { name: "Pridať riadok" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Odstrániť riadok 1" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByLabelText(/^Qty \(pcs\), riadok 1$/i))
		.toHaveValue("abc");
	expect(screen.component.validate()?.message).toBe("Riadok 1, Qty: nie je číslo");
});

// ---------------------------------------------------------------------------
// custom cells, harness contracts
// ---------------------------------------------------------------------------

test("an unknown column type renders read-only (round-trips) without a `cell` snippet", async () => {
	const screen = await render(
		FieldTable,
		baseProps([{ color: "red", part: "x" }], {
			columns: [
				{ key: "part", type: "text", label: "Part" },
				{ key: "color", type: "color", label: "Color" },
			] satisfies FieldTableColumn[],
		})
	);
	expect(
		screen.container.querySelector(".stuic-field-table-readonly")?.textContent?.trim()
	).toBe("red");
	await cell(screen, "Part", 1).fill("y");
	await expect
		.poll(() => emitted(screen.container))
		.toEqual([{ color: "red", part: "y" }]);
});

test("an unknown column type renders through `cell` with a working setValue (harness)", async () => {
	const screen = await render(FieldTableHarness, {
		initial: [{ part: "x", color: "red" }],
		initialColumns: [
			{ key: "part", type: "text", label: "Part" },
			{ key: "color", type: "color", label: "Color" },
		] satisfies FieldTableColumn[],
		withCell: true,
	});
	const custom = screen.getByTestId("custom-0");
	await expect.element(custom).toHaveValue("red");
	// the snippet put the given id on its control, so the cell label reaches it
	await expect.element(cell(screen, "Color", 1)).toHaveValue("red");
	await custom.fill("blue");
	await expect
		.poll(() => JSON.parse(screen.getByTestId("bound").element().textContent || "[]"))
		.toEqual([{ part: "x", color: "blue" }]);
});

test("FormData of a wrapping form holds exactly one entry, under `name` (harness)", async () => {
	const screen = await render(FieldTableHarness, {
		initial: clone(BOM),
		initialColumns: COLUMNS,
	});
	const form = screen.getByTestId("form").element() as HTMLFormElement;
	const fd = [...new FormData(form).entries()];
	expect(fd.length).toBe(1);
	expect(fd[0][0]).toBe("bom");
	expect(JSON.parse(String(fd[0][1]))).toEqual(BOM);
});

test("Enter in a cell submits the host form natively (harness)", async () => {
	const screen = await render(FieldTableHarness, {
		initial: clone(BOM),
		initialColumns: COLUMNS,
	});
	await cell(screen, "Part", 1).click();
	await userEvent.keyboard("{Enter}");
	await expect.element(screen.getByTestId("submitted")).toHaveTextContent("1");
});

test("external bind:value reassignment resyncs the rows (harness)", async () => {
	const screen = await render(FieldTableHarness, {
		initial: clone(BOM),
		initialColumns: COLUMNS,
	});
	await cell(screen, "Part", 1).fill("Edited");
	await expect.element(screen.getByTestId("bound")).toHaveTextContent('"part":"Edited"');
	await screen.getByTestId("set-external").click();
	await expect.element(cell(screen, "Part", 1)).toHaveValue("External");
	expect(screen.container.querySelectorAll("tbody tr").length).toBe(1);
	await expect
		.element(screen.getByTestId("bound"))
		.toHaveTextContent('[{"part":"External","qty":1}]');
});

test("`columns` changing while rows exist keeps the rows' data (harness)", async () => {
	const screen = await render(FieldTableHarness, {
		initial: clone(BOM),
		initialColumns: COLUMNS,
	});
	await screen.getByTestId("drop-column").click();
	// the Datasheet column is gone from the UI...
	await expect
		.poll(() => screen.container.querySelectorAll('th[scope="col"]').length)
		.toBe(6);
	// ...but its cells are preserved in the value, and editing keeps them
	await cell(screen, "Part", 2).fill("W2");
	await expect
		.poll(() => JSON.parse(screen.getByTestId("bound").element().textContent || "[]")[1])
		.toEqual({ ...BOM[1], part: "W2" });
});
