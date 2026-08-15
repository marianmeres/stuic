import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import FieldsBuilder from "./FieldsBuilder.svelte";
import FieldsBuilderHarness from "./FieldsBuilderHarness.test.svelte";
import type { FieldDef } from "./types.js";
import { DEFAULT_FIELD_TYPES } from "./utils.js";

// FieldsBuilder is a composite form control whose bindable `value` is an ordered
// `FieldDef[]`. Internally the source of truth is a row list (so mark-deleted
// rows can stay visible while excluded from `value`); the serialized value is
// carried by a HIDDEN <input type="hidden" name> for form participation and as
// the validate-action anchor. The high-yield browser contracts:
//   - add flow (expanded row, focused label, key derivation incl. diacritics,
//     collision suffixing, derivation stop on manual key edit)
//   - delete: mark+undo for pre-existing fields, outright removal for
//     session-new fields, `deleteMode: "immediate"`, `onBeforeDelete` veto
//   - reorder move buttons + `lock.reorder` position pinning
//   - locks (delete/type/key) and `keysImmutable` read-only keys
//   - type change warning + `onBeforeTypeChange` veto
//   - options editor for `supportsOptions` types
//   - validation (imperative `validate()`, inline row errors)
//   - unknown-type degraded rows that still round-trip
//   - languages mode (LocalizedText records)
//   - external `bind:value` resync + `preview` snippet (via harness)
//
// Drag-and-drop reorder shares `canMoveRow`/`moveRow` with the buttons tested
// here; simulating native HTML5 DnD through locators is unreliable, so the DnD
// wiring itself is exercised via the live demo page, not here.

const TYPES = DEFAULT_FIELD_TYPES;

const FIELD_COLOR: FieldDef = { key: "color", type: "text", label: "Color" };
const FIELD_SIZE: FieldDef = { key: "size", type: "number", label: "Size" };

function baseProps(value: FieldDef[] = []) {
	return { name: "fields", label: "Fields", types: TYPES, value };
}

function hiddenEl(container: HTMLElement) {
	const el = container.querySelector<HTMLInputElement>('input[type="hidden"]');
	if (!el) throw new Error("missing hidden input");
	return el;
}

function emitted(container: HTMLElement): FieldDef[] {
	return JSON.parse(hiddenEl(container).value || "[]");
}

test("renders the empty state, the add button, and an empty serialized value", async () => {
	const screen = await render(FieldsBuilder, baseProps());
	await expect.element(screen.getByText("No fields yet")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Add field" }))
		.toBeInTheDocument();
	await expect.poll(() => hiddenEl(screen.container).value).toBe("[]");
});

test("add flow: expanded row with focused label; key derives from label (incl. diacritics)", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldsBuilder, { ...baseProps(), onChange });
	await screen.getByRole("button", { name: "Add field" }).click();
	const label = screen.getByLabelText("Label");
	await expect.element(label).toBeInTheDocument();
	await expect.element(label).toHaveFocus();

	await label.fill("Vintage Year");
	await expect
		.poll(() => emitted(screen.container))
		.toEqual([{ key: "vintage_year", type: "text", label: "Vintage Year" }]);
	expect(onChange).toHaveBeenCalled();

	// still untouched key -> re-derives, transliterating diacritics
	await label.fill("Ročník");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("rocnik");
});

test("derived keys avoid collisions with existing fields (suffix _2)", async () => {
	const screen = await render(
		FieldsBuilder,
		baseProps([{ key: "vintage_year", type: "text", label: "Vintage Year" }])
	);
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Vintage Year");
	await expect
		.poll(() => emitted(screen.container).map((f) => f.key))
		.toEqual(["vintage_year", "vintage_year_2"]);
});

test("a manually edited key stops label derivation for that row", async () => {
	const screen = await render(FieldsBuilder, baseProps());
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await screen.getByRole("button", { name: "Advanced" }).click();
	const key = screen.getByLabelText("Key");
	await expect.element(key).toHaveValue("color");
	await key.fill("my_custom_key");
	await screen.getByLabelText("Label").fill("Something Else");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("my_custom_key");
});

test("mark delete: pre-existing field is marked, excluded from value, undoable", async () => {
	const screen = await render(FieldsBuilder, baseProps([FIELD_COLOR]));
	await screen.getByRole("button", { name: "Delete field" }).click();
	// exact:true so the chip does not collide with the aria-live announcement
	await expect.element(screen.getByText("Deleted", { exact: true })).toBeInTheDocument();
	await expect.poll(() => emitted(screen.container)).toEqual([]);
	await screen.getByRole("button", { name: "Undo" }).click();
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual(["color"]);
});

test("a field added this session is removed outright even in mark mode", async () => {
	const screen = await render(FieldsBuilder, baseProps());
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Temp");
	await screen.getByRole("button", { name: "Delete field" }).click();
	await expect.element(screen.getByText("No fields yet")).toBeInTheDocument();
	await expect.poll(() => emitted(screen.container)).toEqual([]);
});

test("deleteMode immediate removes a pre-existing field's row entirely", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		deleteMode: "immediate",
	});
	await screen.getByRole("button", { name: "Delete field" }).click();
	await expect.element(screen.getByText("No fields yet")).toBeInTheDocument();
	await expect.poll(() => emitted(screen.container)).toEqual([]);
});

test("onBeforeDelete veto (false) cancels the delete", async () => {
	const onBeforeDelete = vi.fn(() => false as const);
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		onBeforeDelete,
	});
	await screen.getByRole("button", { name: "Delete field" }).click();
	await expect.poll(() => onBeforeDelete.mock.calls.length).toBe(1);
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual(["color"]);
	expect(screen.getByText("Deleted").query()).toBeNull();
});

test("a mark-deleted key can be reused by a new field in the same session", async () => {
	const screen = await render(FieldsBuilder, baseProps([FIELD_COLOR]));
	await screen.getByRole("button", { name: "Delete field" }).click();
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual(["color"]);
	// the marked row must not count toward key uniqueness
	expect(screen.component.validate()?.valid).toBe(true);
});

test("move buttons reorder and are disabled at the boundaries", async () => {
	const screen = await render(FieldsBuilder, baseProps([FIELD_COLOR, FIELD_SIZE]));
	const rows = screen.getByRole("listitem");
	await expect
		.element(rows.first().getByRole("button", { name: "Move up" }))
		.toBeDisabled();
	await expect
		.element(rows.last().getByRole("button", { name: "Move down" }))
		.toBeDisabled();
	await rows.first().getByRole("button", { name: "Move down" }).click();
	await expect
		.poll(() => emitted(screen.container).map((f) => f.key))
		.toEqual(["size", "color"]);
});

test("lock.reorder pins a row: no own move affordance, neighbors cannot displace it", async () => {
	const pinned: FieldDef = {
		key: "pinned",
		type: "text",
		label: "Pinned",
		lock: { reorder: true },
	};
	const screen = await render(
		FieldsBuilder,
		baseProps([FIELD_COLOR, pinned, FIELD_SIZE])
	);
	const rows = screen.getByRole("listitem");
	expect(rows.nth(1).getByRole("button", { name: "Move up" }).query()).toBeNull();
	await expect
		.element(rows.first().getByRole("button", { name: "Move down" }))
		.toBeDisabled();
	await expect
		.element(rows.nth(2).getByRole("button", { name: "Move up" }))
		.toBeDisabled();
});

test("locks: delete hidden, type disabled, saved key readonly — label stays editable", async () => {
	const sys: FieldDef = {
		key: "sys",
		type: "text",
		label: "System",
		lock: { delete: true, type: true },
	};
	const screen = await render(FieldsBuilder, baseProps([sys]));
	expect(screen.getByRole("button", { name: "Delete field" }).query()).toBeNull();
	await screen.getByRole("button", { name: /System/ }).click();
	await expect.element(screen.getByLabelText("Type")).toBeDisabled();
	await screen.getByRole("button", { name: "Advanced" }).click();
	const key = screen.getByLabelText("Key");
	await expect.element(key).toHaveValue("sys");
	await expect.element(key).toHaveAttribute("readonly");
	// label/description are ALWAYS editable, even on locked fields
	await screen.getByLabelText("Label").fill("Renamed");
	await expect.poll(() => emitted(screen.container)[0]?.label).toBe("Renamed");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("sys");
});

test("onBeforeTypeChange veto (false) reverts the type select", async () => {
	const onBeforeTypeChange = vi.fn(() => false as const);
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		onBeforeTypeChange,
	});
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByLabelText("Type").selectOptions("number");
	await expect.poll(() => onBeforeTypeChange.mock.calls.length).toBe(1);
	await expect.poll(() => emitted(screen.container)[0]?.type).toBe("text");
	await expect.element(screen.getByLabelText("Type")).toHaveValue("text");
});

test("changing a saved field's type applies and shows a destructiveness warning", async () => {
	const screen = await render(FieldsBuilder, baseProps([FIELD_COLOR]));
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByLabelText("Type").selectOptions("number");
	await expect.poll(() => emitted(screen.container)[0]?.type).toBe("number");
	await expect
		.element(screen.getByText(/Changing the type of an existing field/))
		.toBeInTheDocument();
});

test("choice type: options editor with label→value derivation", async () => {
	const screen = await render(FieldsBuilder, baseProps());
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await screen.getByLabelText("Type").selectOptions("select");
	await screen.getByRole("button", { name: "Add choice" }).click();
	await screen.getByLabelText("Choice label").fill("Dark Red");
	await expect
		.poll(() => emitted(screen.container)[0]?.options)
		.toEqual([{ value: "dark_red", label: "Dark Red" }]);
});

test("validate(): required empty list surfaces in the validation box", async () => {
	const screen = await render(FieldsBuilder, { ...baseProps(), required: true });
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	await expect
		.poll(() => screen.container.querySelector(".validation-box")?.textContent ?? "")
		.toContain("At least one field is required");
});

test("validate() flags a choice field without options, expands the row, shows inline error", async () => {
	const screen = await render(
		FieldsBuilder,
		baseProps([{ key: "c", type: "select", label: "Choice" }])
	);
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	await expect
		.poll(() => screen.container.querySelector(".validation-box")?.textContent ?? "")
		.toContain("Add at least one choice");
	// the offending row auto-expanded (its options editor is now visible)
	await expect
		.element(screen.getByRole("button", { name: "Add choice" }))
		.toBeInTheDocument();
});

test("unknown-type field: warning chip, read-only body, still round-trips untouched", async () => {
	const unknown: FieldDef = {
		key: "mystery",
		type: "wormhole",
		label: "Mystery",
		options: [{ value: "x", label: "X" }],
	};
	const screen = await render(FieldsBuilder, baseProps([unknown, FIELD_COLOR]));
	await expect.element(screen.getByText("wormhole")).toBeInTheDocument();
	await screen.getByRole("button", { name: /Mystery/ }).click();
	await expect.element(screen.getByText(/does not recognize/)).toBeInTheDocument();
	expect(screen.getByLabelText("Label").query()).toBeNull();
	// unknown type must not block validation
	expect(screen.component.validate()?.valid).toBe(true);
	// editing the other field keeps the unknown def in value byte-identical
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByLabelText("Label").fill("Colour");
	await expect.poll(() => emitted(screen.container)[0]).toEqual(unknown);
});

test("maxFields disables the add button", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		maxFields: 1,
	});
	await expect.element(screen.getByRole("button", { name: "Add field" })).toBeDisabled();
});

test("disabled: add/move/delete controls disabled", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR, FIELD_SIZE]),
		disabled: true,
	});
	await expect.element(screen.getByRole("button", { name: "Add field" })).toBeDisabled();
	const rows = screen.getByRole("listitem");
	await expect
		.element(rows.first().getByRole("button", { name: "Delete field" }))
		.toBeDisabled();
	await expect
		.element(rows.first().getByRole("button", { name: "Move down" }))
		.toBeDisabled();
});

test("languages: default-language editing, translations toggle, record emitted", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps(),
		languages: ["en", "sk"],
	});
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	// only the default language filled -> plain string label
	await expect.poll(() => emitted(screen.container)[0]?.label).toBe("Color");
	// key derives from the default language
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("color");
	// reveal translations of the label editor (first toggle in the row body)
	await screen.getByRole("button", { name: "Show translations" }).first().click();
	await screen.getByRole("textbox", { name: "sk" }).fill("Farba");
	await expect
		.poll(() => emitted(screen.container)[0]?.label)
		.toEqual({ en: "Color", sk: "Farba" });
});

test("an externally set bound value resyncs the rows (harness)", async () => {
	const screen = await render(FieldsBuilderHarness, { initial: [FIELD_COLOR] });
	await expect.element(screen.getByRole("button", { name: /Color/ })).toBeInTheDocument();
	await screen.getByTestId("set-external").click();
	await expect
		.element(screen.getByRole("button", { name: /External/ }))
		.toBeInTheDocument();
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("external_field");
});

test("preview snippet renders and updates live while typing (harness)", async () => {
	const screen = await render(FieldsBuilderHarness, {
		initial: [FIELD_COLOR],
		withPreview: true,
	});
	await expect.element(screen.getByText("Preview")).toBeInTheDocument();
	await expect.element(screen.getByTestId("preview-json")).toHaveTextContent("Color");
	// a keyless just-added row previews live while its label is being typed
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Wip");
	await expect.element(screen.getByTestId("preview-json")).toHaveTextContent("Wip");
});

// ---------------------------------------------------------------------------
// regression tests for review findings
// ---------------------------------------------------------------------------

test("a def with a blank key loaded via value renders, round-trips, does not crash", async () => {
	const draft: FieldDef = { key: "", type: "text", label: "Draft" };
	const screen = await render(FieldsBuilder, baseProps([draft]));
	// no effect_update_depth_exceeded: the row renders and the def stays in value
	await expect.element(screen.getByRole("button", { name: /Draft/ })).toBeInTheDocument();
	await expect.poll(() => emitted(screen.container)).toEqual([draft]);
	// ...but it is flagged, not silently tolerated
	expect(screen.component.validate()?.valid).toBe(false);
});

test("clearing a key mid-rename keeps the field in value (key: '') instead of dropping it", async () => {
	const screen = await render(FieldsBuilder, baseProps());
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual(["color"]);
	await screen.getByRole("button", { name: "Advanced" }).click();
	const key = screen.getByLabelText("Key");
	await key.fill("");
	// still ONE field — an autosaving consumer must not see a deletion
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual([""]);
	await key.fill("colour");
	await expect
		.poll(() => emitted(screen.container).map((f) => f.key))
		.toEqual(["colour"]);
});

const EXTRA_TYPES = [
	{
		type: "text",
		label: "Text",
		extras: [
			{ key: "searchable", label: "Searchable", type: "boolean" as const, default: true },
		],
	},
	...TYPES.filter((td) => td.type !== "text"),
];

test("extras: default seeded on add, checkbox round-trips, loaded def without the key renders unchecked", async () => {
	const screen = await render(FieldsBuilder, { ...baseProps(), types: EXTRA_TYPES });
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Name");
	// default materialized into the emitted def
	await expect
		.poll(() => emitted(screen.container)[0]?.extras)
		.toEqual({ searchable: true });
	const checkbox = screen.getByRole("checkbox", { name: /Searchable/ });
	await expect.element(checkbox).toBeChecked();
	await checkbox.click();
	await expect
		.poll(() => emitted(screen.container)[0]?.extras)
		.toEqual({ searchable: false });
});

test("extras: a loaded def without the extra key shows unchecked (display matches value)", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([{ key: "name", type: "text", label: "Name" }]),
		types: EXTRA_TYPES,
	});
	await screen.getByRole("button", { name: /Name/ }).click();
	await expect
		.element(screen.getByRole("checkbox", { name: /Searchable/ }))
		.not.toBeChecked();
	// and the value was not silently mutated by rendering
	await expect.poll(() => emitted(screen.container)[0]?.extras).toBe(undefined);
});

test("async (Promise<false>) and throwing onBeforeDelete both veto", async () => {
	const asyncVeto = vi.fn(async () => false as const);
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		onBeforeDelete: asyncVeto,
	});
	await screen.getByRole("button", { name: "Delete field" }).click();
	await expect.poll(() => asyncVeto.mock.calls.length).toBe(1);
	await expect.poll(() => emitted(screen.container).map((f) => f.key)).toEqual(["color"]);
	expect(screen.getByText("Deleted", { exact: true }).query()).toBeNull();
});

test("a throwing onBeforeTypeChange vetoes and reverts the select", async () => {
	const throwing = vi.fn(() => {
		throw new Error("nope");
	});
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		onBeforeTypeChange: throwing,
	});
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByLabelText("Type").selectOptions("number");
	await expect.poll(() => throwing.mock.calls.length).toBe(1);
	await expect.poll(() => emitted(screen.container)[0]?.type).toBe("text");
	await expect.element(screen.getByLabelText("Type")).toHaveValue("text");
});

test("lock.key: false overrides keysImmutable — a saved key becomes editable", async () => {
	const screen = await render(
		FieldsBuilder,
		baseProps([{ key: "sys", type: "text", label: "System", lock: { key: false } }])
	);
	await screen.getByRole("button", { name: /System/ }).click();
	await screen.getByRole("button", { name: "Advanced" }).click();
	const key = screen.getByLabelText("Key");
	await expect.element(key).not.toHaveAttribute("readonly");
	await key.fill("sys_v2");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("sys_v2");
});

test("keysImmutable: false makes every saved key editable", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([FIELD_COLOR]),
		keysImmutable: false,
	});
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByRole("button", { name: "Advanced" }).click();
	const key = screen.getByLabelText("Key");
	await expect.element(key).not.toHaveAttribute("readonly");
	await key.fill("colour");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("colour");
});

test("derived keys avoid reservedKeys (suffix) — no inexplicable inline error", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps(),
		reservedKeys: ["color"],
	});
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("color_2");
});

test("deriveKeyFromLabel: false keeps the key empty (row not emitted)", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps(),
		deriveKeyFromLabel: false,
	});
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await expect.poll(() => emitted(screen.container)).toEqual([]);
});

test("deriveKeyFromLabel: a custom slugifier function is used", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps(),
		deriveKeyFromLabel: (label: string) => `x_${label.toLowerCase()}`,
	});
	await screen.getByRole("button", { name: "Add field" }).click();
	await screen.getByLabelText("Label").fill("Color");
	await expect.poll(() => emitted(screen.container)[0]?.key).toBe("x_color");
});

test("options: reorder + remove keep the touched bookkeeping aligned (no value re-derive)", async () => {
	const screen = await render(
		FieldsBuilder,
		baseProps([
			{
				key: "region",
				type: "select",
				label: "Region",
				options: [
					{ value: "a", label: "Alpha" },
					{ value: "b", label: "Beta" },
				],
			},
		])
	);
	await screen.getByRole("button", { name: /Region/ }).click();
	// move Alpha down (options move buttons; no row move buttons with 1 row)
	await screen.getByRole("button", { name: "Move down" }).first().click();
	await expect
		.poll(() => emitted(screen.container)[0]?.options?.map((o) => o.value))
		.toEqual(["b", "a"]);
	// focus followed the moved row (now the second .fb-option-row)
	await expect
		.poll(() => {
			const row = (document.activeElement as HTMLElement)?.closest(".fb-option-row");
			const all = [...screen.container.querySelectorAll(".fb-option-row")];
			return row ? all.indexOf(row) : -1;
		})
		.toBe(1);
	// editing a mount-loaded option's label must NOT re-derive its stored value
	await screen.getByLabelText("Choice label").first().fill("Beta Prime");
	await expect
		.poll(() => emitted(screen.container)[0]?.options?.[0])
		.toEqual({ value: "b", label: "Beta Prime" });
	// remove the first option
	await screen.getByRole("button", { name: "Remove choice" }).first().click();
	await expect
		.poll(() => emitted(screen.container)[0]?.options)
		.toEqual([{ value: "a", label: "Alpha" }]);
});

test("keyboard row move announces the new position via the live region", async () => {
	const screen = await render(FieldsBuilder, baseProps([FIELD_COLOR, FIELD_SIZE]));
	const rows = screen.getByRole("listitem");
	await rows.first().getByRole("button", { name: "Move down" }).click();
	await expect
		.poll(
			() =>
				screen.container.parentElement?.querySelector(".sr-only[aria-live]")
					?.textContent ?? ""
		)
		.toContain("Moved down: Color (2 of 2)");
});

test("external resync re-snapshots key immutability (harness)", async () => {
	const screen = await render(FieldsBuilderHarness, { initial: [FIELD_COLOR] });
	await screen.getByTestId("set-external").click();
	await screen.getByRole("button", { name: /External/ }).click();
	await screen.getByRole("button", { name: "Advanced" }).click();
	// the externally loaded key counts as saved -> read-only
	await expect.element(screen.getByLabelText("Key")).toHaveAttribute("readonly");
});

test("languages: clearing the only translation collapses the record back to a plain string", async () => {
	const screen = await render(FieldsBuilder, {
		...baseProps([{ key: "color", type: "text", label: { en: "Color", sk: "Farba" } }]),
		languages: ["en", "sk"],
	});
	await screen.getByRole("button", { name: /Color/ }).click();
	await screen.getByRole("button", { name: "Show translations" }).first().click();
	await screen.getByRole("textbox", { name: "sk" }).fill("");
	await expect.poll(() => emitted(screen.container)[0]?.label).toBe("Color");
});

test("record label without a languages prop: shows the fallback text, edits preserve other languages", async () => {
	const screen = await render(
		FieldsBuilder,
		baseProps([{ key: "color", type: "text", label: { en: "Color", de: "Farbe" } }])
	);
	await screen.getByRole("button", { name: /Color/ }).click();
	const label = screen.getByLabelText("Label");
	// shows the record's first filled entry, not an empty input
	await expect.element(label).toHaveValue("Color");
	await label.fill("Colour");
	// the edit lands on the entry that provided the text; de is preserved
	await expect
		.poll(() => emitted(screen.container)[0]?.label)
		.toEqual({ en: "Colour", de: "Farbe" });
});
