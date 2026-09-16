import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import FieldColorPicker from "./FieldColorPicker.svelte";
import FieldInput from "./FieldInput.svelte";
import FieldColorPickerHarness from "./FieldColorPickerHarness.test.svelte";
import { createColorPickerT } from "../ColorPicker/i18n.js";
import { COLOR_PICKER_MESSAGES_SK } from "../ColorPicker/i18n-sk.js";

// FieldColorPicker = the InputWrap shell (<div class="stuic-input" data-size>, a
// <label for={id} id="{id}-label">, description / validation / below boxes) around a
// <ColorPicker>. The `for` associates with nothing — a radiogroup is a <div> — so the
// swatch group is named by `aria-labelledby` → `{id}-label` instead. The picker's own
// hidden input runs the validate action; its result is caught and handed to InputWrap.
//
// Browser tests load no component CSS, so only structure / aria / wiring is asserted
// (the shell-vs-picker CSS interplay is verified on the demo page).

const P = ["#ff0000", "#00ff00", "#0000ff"];

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const shell = (c: HTMLElement) => c.querySelector<HTMLElement>(".stuic-input")!;
const group = (c: HTMLElement) => c.querySelector<HTMLElement>("[role=radiogroup]");
const radios = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>("[role=radio]"),
];
const hidden = (c: HTMLElement) =>
	c.querySelector<HTMLInputElement>("input[type=hidden]")!;
const checked = (c: HTMLElement) =>
	radios(c)
		.filter((r) => r.getAttribute("aria-checked") === "true")
		.map((r) => r.dataset.index);
const validationBox = (c: HTMLElement) => c.querySelector(".validation-box");

type Api = {
	validate: () => { valid: boolean; message?: string } | undefined;
	clearValidation: () => void;
	getValidation: () => { valid: boolean } | undefined;
	focus: () => void;
	scrollIntoView: (o?: ScrollIntoViewOptions) => void;
};

// ============================================================================
// shell + naming
// ============================================================================

test("renders the stuic-input shell with a visible label, the picker and the description", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Page colour",
		description: "Used for buttons",
		palette: P,
	});
	const c = screen.container;
	expect(shell(c).getAttribute("data-size")).toBe("md");
	expect(c.querySelector(".label-box label")?.textContent?.trim()).toBe("Page colour");
	expect(c.querySelector(".stuic-color-picker")).toBeTruthy();
	expect(c.querySelector(".desc-box")?.textContent).toContain("Used for buttons");
	// an input-looking border around a swatch grid would be a box inside a box
	expect(
		c.querySelector(".input-wrap")?.classList.contains("input-wrap-transparent")
	).toBe(true);
});

test("label markup matches FieldInput given the same props", async () => {
	const props = {
		label: "Name",
		description: "Hint",
		required: true,
		classLabel: "text-primary",
		labelLeft: false,
		labelLeftBreakpoint: 0,
	};
	const input = (await render(FieldInput, props)).container;
	const picker = (await render(FieldColorPicker, props)).container;

	const cls = (c: HTMLElement, sel: string) => c.querySelector(sel)?.className;
	for (const sel of [".stuic-input", ".label-box", ".label-box label", ".desc-box"]) {
		expect(cls(picker, sel), sel).toBe(cls(input, sel));
	}
	expect(cls(picker, ".label-box")).not.toContain("left");
	expect(cls(picker, ".label-box label")).toContain("text-primary");
});

test("the visible label names the radiogroup (aria-labelledby, no competing aria-label)", async () => {
	const screen = await render(FieldColorPicker, { label: "Page colour", palette: P });
	const c = screen.container;
	await expect
		.element(screen.getByRole("radiogroup", { name: "Page colour" }))
		.toBeInTheDocument();
	const g = group(c)!;
	expect(g.getAttribute("aria-label")).toBe(null);
	const target = c.querySelector(`#${g.getAttribute("aria-labelledby")}`);
	expect(target?.tagName).toBe("LABEL");
});

test("a snippet label names the group too", async () => {
	const screen = await render(FieldColorPicker, { label: text("Brand"), palette: P });
	await expect
		.element(screen.getByRole("radiogroup", { name: "Brand" }))
		.toBeInTheDocument();
});

test("no label → no dangling aria-labelledby; the picker keeps its own (translated) name", async () => {
	const en = await render(FieldColorPicker, { palette: P });
	expect(group(en.container)!.getAttribute("aria-labelledby")).toBe(null);
	expect(group(en.container)!.getAttribute("aria-label")).toBe("Color");

	const sk = await render(FieldColorPicker, {
		palette: P,
		t: createColorPickerT(COLOR_PICKER_MESSAGES_SK),
	});
	expect(group(sk.container)!.getAttribute("aria-label")).toBe("Farba");
	expect(radios(sk.container).at(-1)!.getAttribute("aria-label")).toBe("Žiadna farba");
});

// ============================================================================
// validation
// ============================================================================

test("required + empty: validate() puts the message in the validation box; a pick clears it", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		required: true,
	});
	const c = screen.container;
	const api = screen.component as unknown as Api;

	expect(validationBox(c)).toBe(null);
	expect(api.validate()?.valid).toBe(false);
	await expect
		.poll(() => validationBox(c)?.textContent?.trim())
		.toBe("Please select a color");
	expect(shell(c).classList.contains("invalid")).toBe(true);
	expect(api.getValidation()?.valid).toBe(false);
	await expect.poll(() => group(c)!.getAttribute("aria-invalid")).toBe("true");

	await screen.getByRole("radio", { name: "#00ff00" }).click();
	await expect.poll(() => validationBox(c)).toBe(null);
	expect(api.getValidation()?.valid).toBe(true);
});

test("clearValidation() removes the message", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		required: true,
	});
	const c = screen.container;
	const api = screen.component as unknown as Api;
	api.validate();
	await expect.poll(() => validationBox(c)).not.toBe(null);
	api.clearValidation();
	await expect.poll(() => validationBox(c)).toBe(null);
	expect(api.getValidation()).toBe(undefined);
});

test("a custom validator's message lands in the validation box", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		value: "#ff0000",
		validate: { customValidator: (v: unknown) => (v === "#ff0000" ? "No red" : "") },
	});
	(screen.component as unknown as Api).validate();
	await expect
		.poll(() => validationBox(screen.container)?.textContent?.trim())
		.toBe("No red");
});

test("validate={false} disables the built-in validator", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		required: true,
		validate: false,
	});
	expect((screen.component as unknown as Api).validate()).toBe(undefined);
	expect(validationBox(screen.container)).toBe(null);
});

// ============================================================================
// passthrough to ColorPicker
// ============================================================================

test("value, onchange and name behave as on a bare ColorPicker", async () => {
	const onchange = vi.fn();
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		value: "#00ff00",
		name: "accent",
		onchange,
	});
	const c = screen.container;
	expect(checked(c)).toEqual(["1"]);
	expect(hidden(c).name).toBe("accent");
	expect(hidden(c).value).toBe("#00ff00");

	await screen.getByRole("radio", { name: "#0000ff" }).click();
	expect(onchange.mock.calls).toEqual([["#0000ff"]]);
	expect(hidden(c).value).toBe("#0000ff");
});

test("bind:value is two-way", async () => {
	const screen = await render(FieldColorPickerHarness, { initial: "#ff0000" });
	const c = screen.container;
	expect(checked(c)).toEqual(["0"]);

	// external write → picker
	await screen.getByTestId("set").click();
	await expect.poll(() => checked(c)).toEqual(["2"]);
	await expect.poll(() => hidden(c).value).toBe("#0000ff");

	// user pick → binding
	await screen.getByRole("radio", { name: "#00ff00" }).click();
	await expect.element(screen.getByTestId("bound")).toHaveTextContent("#00ff00");
});

test("palette, columns, custom, allowClear, classInput, classSwatch reach the picker", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		columns: 2,
		custom: "text",
		allowClear: false,
		classInput: "my-picker",
		classSwatch: "my-swatch",
	});
	const c = screen.container;
	expect(radios(c).length).toBe(3);
	expect(group(c)!.getAttribute("data-columns")).toBe("2");
	expect(c.querySelector("input[type=color]")).toBe(null);
	expect(c.querySelector("input[type=text]")).toBeTruthy();
	expect(c.querySelector(".stuic-color-picker")!.classList.contains("my-picker")).toBe(
		true
	);
	expect(radios(c).every((r) => r.classList.contains("my-swatch"))).toBe(true);
});

test("disabled: every picker control is disabled and the shell is marked", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		value: "#ff0000",
		disabled: true,
	});
	const c = screen.container;
	expect(shell(c).classList.contains("disabled")).toBe(true);
	expect(radios(c).every((r) => r.disabled)).toBe(true);
	expect(hidden(c).disabled).toBe(true);
	expect(group(c)!.getAttribute("aria-disabled")).toBe("true");
});

test("required marks the label and the group", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		required: true,
	});
	const c = screen.container;
	expect(c.querySelector(".label-box label")!.className).toContain("after:content-['*']");
	expect(group(c)!.getAttribute("aria-required")).toBe("true");
});

test("renderSize, class, below reach the shell; rest props land on the picker root", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		renderSize: "lg",
		class: "my-field",
		below: text("Preview strip"),
		"data-testid": "cp",
	});
	const c = screen.container;
	expect(shell(c).getAttribute("data-size")).toBe("lg");
	expect(shell(c).classList.contains("my-field")).toBe(true);
	expect(c.querySelector(".below-box")?.textContent).toContain("Preview strip");
	await expect.element(screen.getByTestId("cp")).toHaveClass("stuic-color-picker");
});

// ============================================================================
// focus / scroll (the ValidatableField contract)
// ============================================================================

test("focus() moves to the checked swatch", async () => {
	const screen = await render(FieldColorPicker, {
		label: "Accent",
		palette: P,
		value: "#0000ff",
	});
	(screen.component as unknown as Api).focus();
	expect(document.activeElement?.getAttribute("aria-label")).toBe("#0000ff");
});

test("scrollIntoView() reaches the picker with smooth + center defaults", async () => {
	const spy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
	try {
		const screen = await render(FieldColorPicker, { label: "Accent", palette: P });
		(screen.component as unknown as Api).scrollIntoView({ block: "start" });
		expect(spy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
		expect(spy.mock.contexts[0]).toBe(
			screen.container.querySelector(".stuic-color-picker")
		);
	} finally {
		spy.mockRestore();
	}
});
