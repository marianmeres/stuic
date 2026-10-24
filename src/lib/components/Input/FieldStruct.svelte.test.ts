import { render } from "vitest-browser-svelte";
import { userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldStruct, {
	type FieldStructField,
	type FieldStructValue,
} from "./FieldStruct.svelte";
import FieldStructHarness from "./FieldStructHarness.test.svelte";

// FieldStruct is a composite form control whose bindable `value` is ONE live
// record with a fixed, typed set of fields — the one-record sibling of
// FieldTable, rendering the same shared cells. The serialized value is carried
// by a HIDDEN <input type="hidden" name> for form participation and as the
// validate-action anchor. Every field has a real <label for>, which is how the
// tests address controls.
//
// The high-yield browser contracts:
//   - a visible label per field reaches its control; the unit is in the name
//   - each type writes its typed value; a blank REMOVES the key (checkbox excepted)
//   - a loaded record missing a field writes nothing until edited; unknown keys
//     round-trip; no key is ever invented; a non-object value does not emit on mount
//   - validate(): per-field `required`, the cell rules, `field.validate`, the
//     component-level `required`, the host validator — first offender in
//     declaration order, aria-invalid + inline message + focus
//   - readonly: a description list with labels and formatted values, no inputs,
//     the hidden input still posts
//   - unknown field types via the `cell` snippet or read-only
//   - duplicate keys do not throw; an empty label falls back to the key
//   - one FormData entry; Enter submits the host form; external resync (harness)
//
// NOTE: browser tests do not load the component's index.css, so layout is not
// observable here; the demo page covers it.

const FIELDS: FieldStructField[] = [
	{ key: "street", type: "text", label: "Street", maxLength: 20 },
	{ key: "zip", type: "text", label: "ZIP", maxLength: 10, description: "Digits only" },
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
	{ key: "fragile", type: "checkbox", label: "Fragile" },
	{ key: "since", type: "date", label: "Since" },
	{ key: "sheet", type: "url", label: "Datasheet" },
];

const RECORD: FieldStructValue = {
	street: "Main 1",
	zip: "81101",
	qty: 12,
	material: "steel",
	fragile: true,
	since: "2026-01-15",
	sheet: "https://example.com/a.pdf",
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function baseProps(value: unknown = RECORD, extra: Record<string, unknown> = {}) {
	return {
		name: "item",
		label: "Item",
		fields: FIELDS,
		value: clone(value) as FieldStructValue,
		...extra,
	};
}

function hiddenEl(container: HTMLElement) {
	const el = container.querySelector<HTMLInputElement>('input[type="hidden"]');
	if (!el) throw new Error("missing hidden input");
	return el;
}

function emitted(container: HTMLElement): FieldStructValue {
	return JSON.parse(hiddenEl(container).value || "{}");
}

function root(container: HTMLElement) {
	const el = container.querySelector<HTMLElement>(".stuic-field-struct");
	if (!el) throw new Error("missing .stuic-field-struct root");
	return el;
}

function dl(container: HTMLElement): Record<string, string> {
	const out: Record<string, string> = {};
	for (const row of container.querySelectorAll(".stuic-field-struct dl > div")) {
		const dt = row.querySelector("dt")?.textContent?.trim() ?? "";
		out[dt] = row.querySelector("dd")?.textContent?.trim() ?? "";
	}
	return out;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

test("renders one labelled control per field, in order, populated from the record; the serialized value round-trips", async () => {
	const screen = await render(FieldStruct, baseProps());
	const labels = [...screen.container.querySelectorAll(".stuic-field-struct-label")].map(
		(l) => l.textContent?.trim()
	);
	expect(labels).toEqual([
		"Street",
		"ZIP",
		"Qty (pcs)",
		"Material",
		"Fragile",
		"Since",
		"Datasheet",
	]);
	await expect.element(screen.getByLabelText("Street")).toHaveValue("Main 1");
	await expect.element(screen.getByLabelText("Qty (pcs)")).toHaveValue("12");
	await expect.element(screen.getByLabelText("Material")).toHaveValue("steel");
	await expect.element(screen.getByLabelText("Fragile")).toBeChecked();
	await expect.element(screen.getByLabelText("Since")).toHaveValue("2026-01-15");
	await expect
		.element(screen.getByLabelText("Datasheet"))
		.toHaveValue("https://example.com/a.pdf");
	expect(emitted(screen.container)).toEqual(RECORD);
	expect(root(screen.container).hasAttribute("data-readonly")).toBe(false);
	// no inner control is named: the hidden input is the only one that posts
	expect(screen.container.querySelectorAll("[name]").length).toBe(1);
});

test("a field `description` is a hint wired through aria-describedby; the error id joins it", async () => {
	const screen = await render(FieldStruct, baseProps({ zip: "x".repeat(12) }));
	const zip = screen.getByLabelText("ZIP");
	const hintId = (zip.element() as HTMLElement).getAttribute("aria-describedby")!;
	expect(hintId).toMatch(/-zip-desc$/);
	expect(document.getElementById(hintId)?.textContent?.trim()).toBe("Digits only");
	screen.component.validate();
	await expect.element(zip).toHaveAttribute("aria-invalid", "true");
	const ids = (zip.element() as HTMLElement).getAttribute("aria-describedby")!.split(" ");
	expect(ids.length).toBe(2);
	expect(document.getElementById(ids[1])?.textContent?.trim()).toBe(
		"too long (max 10 characters)"
	);
});

test("displayLanguage resolves localized field, option, hint and placeholder texts", async () => {
	const screen = await render(
		FieldStruct,
		baseProps(
			{ material: "steel" },
			{
				displayLanguage: "sk",
				fields: [
					{
						key: "street",
						type: "text",
						label: { en: "Street", sk: "Ulica" },
						placeholder: { en: "Street and number", sk: "Ulica a číslo" },
						description: { en: "With the number", sk: "S číslom" },
					},
					{
						key: "material",
						type: "select",
						label: { en: "Material", sk: "Materiál" },
						options: [{ value: "steel", label: { en: "Steel", sk: "Oceľ" } }],
					},
				] satisfies FieldStructField[],
			}
		)
	);
	await expect
		.element(screen.getByLabelText("Ulica"))
		.toHaveAttribute("placeholder", "Ulica a číslo");
	await expect.element(screen.getByText("S číslom")).toBeInTheDocument();
	await expect.element(screen.getByLabelText("Materiál")).toHaveValue("steel");
	expect(
		screen.container.querySelector('option[value="steel"]')?.textContent?.trim()
	).toBe("Oceľ");
});

// ---------------------------------------------------------------------------
// writes: typed values, blank removes the key
// ---------------------------------------------------------------------------

test("text: written as typed, trimmed on commit; clearing removes the key", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldStruct, baseProps(RECORD, { onChange }));
	const street = screen.getByLabelText("Street");
	await street.fill("Side 2 ");
	await expect.poll(() => emitted(screen.container).street).toBe("Side 2 ");
	// moving focus away commits -> trimmed
	await screen.getByLabelText("ZIP").click();
	await expect.poll(() => emitted(screen.container).street).toBe("Side 2");
	expect(onChange.mock.lastCall?.[0].street).toBe("Side 2");
	await street.fill("");
	await expect.poll(() => "street" in emitted(screen.container)).toBe(false);
	// the other keys are untouched
	expect(emitted(screen.container).zip).toBe("81101");
});

test("number: writes a number, blank removes the key, garbage is kept as typed; locale=sk reads ','", async () => {
	const screen = await render(FieldStruct, baseProps(RECORD, { locale: "sk" }));
	const qty = screen.getByLabelText("Qty (pcs)");
	await qty.fill("4,5");
	await expect.poll(() => emitted(screen.container).qty).toBe(4.5);
	await qty.fill("1 000");
	await expect.poll(() => emitted(screen.container).qty).toBe(1000);
	await qty.fill("");
	await expect.poll(() => "qty" in emitted(screen.container)).toBe(false);
	await qty.fill("abc");
	await expect.poll(() => emitted(screen.container).qty).toBe("abc");
	// blur drops the draft -> formatted for the locale
	await qty.fill("80.5");
	await screen.getByLabelText("Street").click();
	await expect.element(qty).toHaveValue("80,5");
});

test("select: writes the option value; the blank entry removes the key; a stored value outside the choices is shown and flagged", async () => {
	const screen = await render(FieldStruct, baseProps({ ...RECORD, material: "gold" }));
	const material = screen.getByLabelText("Material");
	await expect.element(material).toHaveValue("gold");
	expect(screen.component.validate()?.message).toBe(
		"Material: “gold” is not one of the choices"
	);
	await material.selectOptions("brass");
	await expect.poll(() => emitted(screen.container).material).toBe("brass");
	await expect.poll(() => screen.component.validate()?.valid).toBe(true);
	expect(screen.container.querySelector('option[value="gold"]')).toBeNull();
	await material.selectOptions("");
	await expect.poll(() => "material" in emitted(screen.container)).toBe(false);
});

test("checkbox: writes a boolean only when toggled; unchecking writes false (the key stays)", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldStruct, baseProps({ street: "x" }, { onChange }));
	const fragile = screen.getByLabelText("Fragile");
	await expect.element(fragile).not.toBeChecked();
	expect(onChange).not.toHaveBeenCalled();
	await fragile.click();
	await expect.poll(() => emitted(screen.container).fragile).toBe(true);
	await fragile.click();
	await expect.poll(() => emitted(screen.container).fragile).toBe(false);
});

test("date writes ISO and clearing removes the key; url is validated, not coerced", async () => {
	const screen = await render(FieldStruct, baseProps());
	const since = screen.getByLabelText("Since");
	await since.fill("2026-02-03");
	await expect.poll(() => emitted(screen.container).since).toBe("2026-02-03");
	await since.fill("");
	await expect.poll(() => "since" in emitted(screen.container)).toBe(false);
	const sheet = screen.getByLabelText("Datasheet");
	await sheet.fill("not a url");
	await expect.poll(() => emitted(screen.container).sheet).toBe("not a url");
	expect(screen.component.validate()?.message).toBe(
		"Datasheet: must be a web address starting with http:// or https://"
	);
});

test("country: the label reaches the trigger, picking writes the ISO code; readonly shows the name", async () => {
	const fields: FieldStructField[] = [
		{ key: "city", type: "text", label: "City" },
		{
			key: "country",
			type: "country",
			label: "Country",
			countryList: ["SK", "CZ", "AT"],
		},
	];
	const screen = await render(FieldStruct, baseProps({ city: "Vienna" }, { fields }));
	expect(screen.container.querySelectorAll('input[type="hidden"]').length).toBe(1);
	const trigger = screen.getByLabelText("Country");
	await expect.element(trigger).toHaveAttribute("aria-haspopup", "menu");
	await trigger.click();
	await screen.getByPlaceholder("Search country...").fill("Aus");
	await expect.element(screen.getByRole("menuitem", { name: /Austria/ })).toBeVisible();
	await userEvent.keyboard("{Enter}");
	await expect.poll(() => emitted(screen.container).country).toBe("AT");
	await expect.element(trigger).toHaveTextContent("Austria");

	const ro = await render(
		FieldStruct,
		baseProps({ city: "Vienna", country: "AT" }, { fields, readonly: true })
	);
	expect(dl(ro.container)["Country"]).toMatch(/Austria$/);
});

test("a loaded record missing a field renders it empty and writes nothing until edited; unknown keys round-trip; no key is invented", async () => {
	const seeded = { street: "Main 1", legacy: "L", nested: { a: 1 } };
	const screen = await render(FieldStruct, baseProps(seeded));
	await expect.element(screen.getByLabelText("Qty (pcs)")).toHaveValue("");
	await expect.element(screen.getByLabelText("Fragile")).not.toBeChecked();
	expect(emitted(screen.container)).toEqual(seeded);
	await screen.getByLabelText("Qty (pcs)").fill("3");
	await expect.poll(() => emitted(screen.container)).toEqual({ ...seeded, qty: 3 });
	const allowed = new Set([...Object.keys(seeded), ...FIELDS.map((f) => f.key)]);
	for (const k of Object.keys(emitted(screen.container))) {
		expect(allowed.has(k), `leaked key ${k}`).toBe(true);
	}
});

test("a non-object value renders every field empty and does not emit on mount; the first edit emits an object", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldStruct, baseProps("" as unknown, { onChange }));
	await expect.element(screen.getByLabelText("Street")).toHaveValue("");
	expect(hiddenEl(screen.container).value).toBe("{}");
	expect(onChange).not.toHaveBeenCalled();
	await screen.getByLabelText("Street").fill("x");
	await expect.poll(() => emitted(screen.container)).toEqual({ street: "x" });
	expect(onChange.mock.lastCall?.[0]).toEqual({ street: "x" });
});

test("duplicate field keys do not throw (first wins, console.warn); an empty label falls back to the key", async () => {
	const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	try {
		const screen = await render(
			FieldStruct,
			baseProps(
				{ sku: "a" },
				{
					fields: [
						{ key: "sku", type: "text", label: "" },
						{ key: "sku", type: "number", label: "SKU again" },
						{ key: "qty", type: "number", label: "Qty" },
					] satisfies FieldStructField[],
				}
			)
		);
		const labels = [
			...screen.container.querySelectorAll(".stuic-field-struct-label"),
		].map((l) => l.textContent?.trim());
		expect(labels).toEqual(["sku", "Qty"]);
		await expect.element(screen.getByLabelText("sku")).toHaveValue("a");
		expect(warn).toHaveBeenCalled();
		expect(String(warn.mock.calls[0][0])).toContain('"sku"');
	} finally {
		warn.mockRestore();
	}
});

// ---------------------------------------------------------------------------
// validation
// ---------------------------------------------------------------------------

test("validate(): per-field `required` — summary 'X is required', inline message, aria-invalid, focus on the first offender", async () => {
	const screen = await render(
		FieldStruct,
		baseProps(
			{},
			{
				fields: [
					{ key: "street", type: "text", label: "Street", required: true },
					{ key: "city", type: "text", label: "City", required: true },
				] satisfies FieldStructField[],
			}
		)
	);
	// nothing is flagged before validation ran (or the field was blurred)
	expect(screen.container.querySelector("[aria-invalid]")).toBeNull();
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("Street is required");
	await expect.element(screen.getByText("Street is required")).toBeVisible();
	const street = screen.getByLabelText("Street");
	await expect.element(street).toHaveAttribute("aria-invalid", "true");
	await expect.element(street).toHaveFocus();
	// both offenders carry the inline message
	expect(screen.container.querySelectorAll(".stuic-field-struct-error").length).toBe(2);
	await expect.element(screen.getByText("This field is required").first()).toBeVisible();
	await street.fill("Main");
	await expect.poll(() => screen.component.validate()?.message).toBe("City is required");
	await expect.element(street).not.toHaveAttribute("aria-invalid");
	await screen.getByLabelText("City").fill("Town");
	await expect.poll(() => screen.component.validate()?.valid).toBe(true);
	expect(screen.container.querySelector("[aria-invalid]")).toBeNull();
	screen.component.clearValidation();
	expect(screen.component.getValidation()).toBeUndefined();
});

test("validate(): the first invalid field in declaration order as 'Field: message'; `field.validate` after the built-in rule; the host validator last", async () => {
	const customValidator = vi.fn(() => "consumer says no");
	const screen = await render(
		FieldStruct,
		baseProps(
			{ zip: "x".repeat(12), qty: 30, since: "2026-13-45" },
			{
				fields: [
					...FIELDS.filter((f) => f.key !== "qty"),
					{
						key: "qty",
						type: "number",
						label: "Qty",
						validate: (v: unknown) =>
							typeof v === "number" && v > 20 ? "too many" : undefined,
					},
				],
				validate: { customValidator },
			}
		)
	);
	expect(screen.component.validate()?.message).toBe("ZIP: too long (max 10 characters)");
	await expect.element(screen.getByLabelText("ZIP")).toHaveFocus();
	await screen.getByLabelText("ZIP").fill("81101");
	await expect
		.poll(() => screen.component.validate()?.message)
		.toBe("Since: not a valid date");
	// the native date input shows empty for it, the value is untouched
	await expect.element(screen.getByLabelText("Since")).toHaveValue("");
	expect(emitted(screen.container).since).toBe("2026-13-45");
	await screen.getByLabelText("Since").fill("2026-01-01");
	await expect.poll(() => screen.component.validate()?.message).toBe("Qty: too many");
	expect(customValidator).not.toHaveBeenCalled();
	await screen.getByLabelText("Qty").fill("2");
	await expect.poll(() => screen.component.validate()?.message).toBe("consumer says no");
	expect(customValidator).toHaveBeenCalled();
});

test("component-level `required`: every field blank fails; a per-field required message wins over it", async () => {
	const screen = await render(FieldStruct, baseProps({}, { required: true }));
	const res = screen.component.validate();
	expect(res?.valid).toBe(false);
	expect(res?.message).toBe("At least one field is required");
	await screen.getByLabelText("Street").fill("x");
	await expect.poll(() => screen.component.validate()?.valid).toBe(true);

	const both = await render(
		FieldStruct,
		baseProps(
			{},
			{
				required: true,
				fields: [{ key: "street", type: "text", label: "Street", required: true }],
			}
		)
	);
	expect(both.component.validate()?.message).toBe("Street is required");
});

test("a field edited and blurred shows its inline error without validate()", async () => {
	const screen = await render(FieldStruct, baseProps(RECORD, { locale: "en" }));
	const qty = screen.getByLabelText("Qty (pcs)");
	await qty.fill("x");
	await screen.getByLabelText("Street").click();
	await expect.element(qty).toHaveAttribute("aria-invalid", "true");
	await expect.element(screen.getByText("not a number", { exact: true })).toBeVisible();
});

test("validate={false} disables validation entirely", async () => {
	const screen = await render(
		FieldStruct,
		baseProps({}, { required: true, validate: false })
	);
	expect(screen.component.validate()).toBeUndefined();
});

test("i18n: a Slovak `t` renders Slovak messages", async () => {
	const { createFieldStructT } = await import("./field-struct-i18n.js");
	const { FIELD_STRUCT_MESSAGES_SK } = await import("./field-struct-i18n-sk.js");
	const screen = await render(
		FieldStruct,
		baseProps(
			{ qty: "abc" },
			{
				t: createFieldStructT(FIELD_STRUCT_MESSAGES_SK),
				fields: [
					{ key: "street", type: "text", label: "Ulica", required: true },
					{ key: "qty", type: "number", label: "Množstvo" },
				] satisfies FieldStructField[],
			}
		)
	);
	expect(screen.component.validate()?.message).toBe("Pole „Ulica“ je povinné");
	await expect.element(screen.getByText("Toto pole je povinné")).toBeVisible();
	await expect.element(screen.getByText("nie je číslo")).toBeVisible();
	await screen.getByLabelText("Ulica").fill("x");
	await expect
		.poll(() => screen.component.validate()?.message)
		.toBe("Množstvo: nie je číslo");
});

// ---------------------------------------------------------------------------
// readonly
// ---------------------------------------------------------------------------

test("readonly: a description list of labels and formatted values, no inputs, the hidden input still posts", async () => {
	const screen = await render(
		FieldStruct,
		baseProps(
			{ ...RECORD, qty: 4.5, fragile: false, since: "" },
			{ readonly: true, locale: "sk" }
		)
	);
	expect(root(screen.container).hasAttribute("data-readonly")).toBe(true);
	expect(
		screen.container.querySelectorAll("input:not([type=hidden]), select").length
	).toBe(0);
	expect(dl(screen.container)).toEqual({
		Street: "Main 1",
		ZIP: "81101",
		Qty: "4,5 pcs",
		Material: "Steel",
		Fragile: "No",
		Since: "—",
		Datasheet: "https://example.com/a.pdf",
	});
	// a url value is a link
	expect(
		screen.container.querySelector(".stuic-field-struct dd a")?.getAttribute("href")
	).toBe("https://example.com/a.pdf");
	expect(emitted(screen.container)).toEqual({
		...RECORD,
		qty: 4.5,
		fragile: false,
		since: "",
	});
	// the readonly treatment lands on the wrap
	expect(
		screen.container.querySelector(".input-wrap.stuic-field-struct-wrap-readonly")
	).not.toBeNull();
	// validation still runs against the stored record
	expect(screen.component.validate()?.valid).toBe(true);
});

test("readonly never shows a raw key where a label exists; a non-object value is all dashes", async () => {
	const screen = await render(
		FieldStruct,
		baseProps(null as unknown, {
			readonly: true,
			fields: [{ key: "street", type: "text", label: { en: "Street", sk: "Ulica" } }],
			displayLanguage: "sk",
		})
	);
	expect(dl(screen.container)).toEqual({ Ulica: "—" });
	expect(screen.container.textContent).not.toContain("street");
});

test("`disabled`: every control is disabled", async () => {
	const screen = await render(FieldStruct, baseProps(RECORD, { disabled: true }));
	await expect.element(screen.getByLabelText("Street")).toBeDisabled();
	await expect.element(screen.getByLabelText("Fragile")).toBeDisabled();
	await expect.element(screen.getByLabelText("Material")).toBeDisabled();
});

// ---------------------------------------------------------------------------
// custom cells, harness contracts
// ---------------------------------------------------------------------------

test("an unknown field type renders read-only (round-trips) without a `cell` snippet", async () => {
	const screen = await render(
		FieldStruct,
		baseProps(
			{ color: "red", name: "x" },
			{
				fields: [
					{ key: "name", type: "text", label: "Name" },
					{ key: "color", type: "color", label: "Color" },
				] satisfies FieldStructField[],
			}
		)
	);
	expect(
		screen.container.querySelector(".stuic-field-cell-readonly")?.textContent?.trim()
	).toBe("red");
	await screen.getByLabelText("Name").fill("y");
	await expect.poll(() => emitted(screen.container)).toEqual({ color: "red", name: "y" });
});

test("an unknown field type renders through `cell` with a working setValue (harness)", async () => {
	const screen = await render(FieldStructHarness, {
		initial: { name: "x", color: "red" },
		initialFields: [
			{ key: "name", type: "text", label: "Name" },
			{ key: "color", type: "color", label: "Color" },
		] satisfies FieldStructField[],
		withCell: true,
	});
	const custom = screen.getByTestId("custom-color");
	await expect.element(custom).toHaveValue("red");
	// the snippet put the given id on its control, so the field label reaches it
	await expect.element(screen.getByLabelText("Color")).toHaveValue("red");
	await custom.fill("blue");
	await expect
		.poll(() => JSON.parse(screen.getByTestId("bound").element().textContent || "{}"))
		.toEqual({ name: "x", color: "blue" });
});

test("FormData of a wrapping form holds exactly one entry, under `name`; Enter in a control submits (harness)", async () => {
	const screen = await render(FieldStructHarness, {
		initial: clone(RECORD),
		initialFields: FIELDS,
	});
	const form = screen.getByTestId("form").element() as HTMLFormElement;
	const fd = [...new FormData(form).entries()];
	expect(fd.length).toBe(1);
	expect(fd[0][0]).toBe("address");
	expect(JSON.parse(String(fd[0][1]))).toEqual(RECORD);
	await screen.getByLabelText("Street").click();
	await userEvent.keyboard("{Enter}");
	await expect.element(screen.getByTestId("submitted")).toHaveTextContent("1");
});

test("external bind:value reassignment resyncs the record; toggling readonly keeps it (harness)", async () => {
	const screen = await render(FieldStructHarness, {
		initial: clone(RECORD),
		initialFields: FIELDS,
	});
	await screen.getByLabelText("Street").fill("Edited");
	await expect
		.element(screen.getByTestId("bound"))
		.toHaveTextContent('"street":"Edited"');
	await screen.getByTestId("set-external").click();
	await expect.element(screen.getByLabelText("Street")).toHaveValue("External");
	await expect.element(screen.getByLabelText("Qty (pcs)")).toHaveValue("");
	await expect
		.element(screen.getByTestId("bound"))
		.toHaveTextContent('{"street":"External","zip":"999"}');
	await screen.getByTestId("toggle-readonly").click();
	await expect.poll(() => dl(screen.container)["Street"]).toBe("External");
	await screen.getByTestId("toggle-readonly").click();
	await expect.element(screen.getByLabelText("Street")).toHaveValue("External");
});

test("`fields` changing keeps the record's data (harness)", async () => {
	const screen = await render(FieldStructHarness, {
		initial: clone(RECORD),
		initialFields: FIELDS,
	});
	await screen.getByTestId("drop-field").click();
	// the Datasheet field is gone from the UI...
	await expect
		.poll(() => screen.container.querySelectorAll(".stuic-field-struct-field").length)
		.toBe(6);
	// ...but its value is preserved, and editing keeps it
	await screen.getByLabelText("Street").fill("S2");
	await expect
		.poll(() => JSON.parse(screen.getByTestId("bound").element().textContent || "{}"))
		.toEqual({ ...RECORD, street: "S2" });
});
