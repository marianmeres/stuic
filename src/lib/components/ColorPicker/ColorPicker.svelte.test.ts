import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import ColorPicker from "./ColorPicker.svelte";
import { createColorPickerT } from "./i18n.js";
import { COLOR_PICKER_MESSAGES_SK } from "./i18n-sk.js";

// Note: browser tests don't load the component index.css, so only structure,
// attributes, event wiring and the value round-trip are asserted here — never
// computed sizes or colors.

const P = ["#ff0000", "#00ff00", "#0000ff"];

const group = (c: HTMLElement) => c.querySelector<HTMLElement>("[role=radiogroup]")!;
const radios = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>("[role=radio]"),
];
const hidden = (c: HTMLElement) =>
	c.querySelector<HTMLInputElement>("input[type=hidden]")!;
const native = (c: HTMLElement) => c.querySelector<HTMLInputElement>("input[type=color]");
const text = (c: HTMLElement) => c.querySelector<HTMLInputElement>("input[type=text]");
const checked = (c: HTMLElement) =>
	radios(c)
		.filter((r) => r.getAttribute("aria-checked") === "true")
		.map((r) => r.dataset.index);

/** What the hex field does on a keystroke, without a real keyboard. */
function typeHex(c: HTMLElement, v: string) {
	const el = text(c)!;
	el.value = v;
	el.dispatchEvent(new Event("input", { bubbles: true }));
}
/** ...and what it does on Enter / blur. */
function commitHex(c: HTMLElement) {
	text(c)!.dispatchEvent(new Event("change", { bubbles: true }));
}

// ============================================================================
// structure
// ============================================================================

test("radiogroup of swatches + clear, aria-checked, roving tabindex, hidden input", async () => {
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#00ff00",
		name: "brand",
	});
	const c = screen.container;

	expect(group(c).getAttribute("aria-label")).toBe("Color");
	expect(c.querySelector(".stuic-color-picker")).toBeTruthy();

	const r = radios(c);
	// 3 palette swatches + the clear swatch
	expect(r.length).toBe(4);
	expect(r.every((x) => x.type === "button")).toBe(true);
	// an unlabeled swatch is announced by its own color string
	expect(r.slice(0, 3).map((x) => x.getAttribute("aria-label"))).toEqual(P);
	expect(r[3].getAttribute("aria-label")).toBe("No color");
	expect(r[3].dataset.clear).toBe("");
	// the color is handed to CSS as a custom property, never parsed
	expect(r[0].style.getPropertyValue("--stuic-color-picker-swatch-color")).toBe(
		"#ff0000"
	);

	expect(checked(c)).toEqual(["1"]);
	expect(r.map((x) => x.tabIndex)).toEqual([-1, 0, -1, -1]);

	expect(hidden(c).value).toBe("#00ff00");
	expect(hidden(c).name).toBe("brand");
});

test("an empty value checks the clear swatch; an off-palette value checks nothing", async () => {
	const empty = await render(ColorPicker, { palette: P, value: "" });
	expect(checked(empty.container)).toEqual(["3"]);

	const custom = await render(ColorPicker, { palette: P, value: "#123456" });
	expect(checked(custom.container)).toEqual([]);
	// nothing checked -> the first swatch keeps the group reachable by Tab
	expect(radios(custom.container).map((x) => x.tabIndex)).toEqual([0, -1, -1, -1]);
});

test("hex spelling does not affect swatch identity", async () => {
	const screen = await render(ColorPicker, { palette: ["#ffffff"], value: "#FFF" });
	expect(checked(screen.container)).toEqual(["0"]);
});

test("labels: object entries name the swatch, bundled ones go through t", async () => {
	const own = await render(ColorPicker, {
		palette: [{ value: "#ef4444", label: "Brand blue" }],
	});
	const r = radios(own.container)[0];
	expect(r.getAttribute("aria-label")).toBe("Brand blue");
	expect(r.getAttribute("title")).toBe("Brand blue");

	// the default palette's labels are message keys
	const sk = await render(ColorPicker, {
		t: createColorPickerT(COLOR_PICKER_MESSAGES_SK),
	});
	const rsk = radios(sk.container);
	expect(rsk[0].getAttribute("aria-label")).toBe("Červená");
	expect(rsk.at(-1)!.getAttribute("aria-label")).toBe("Žiadna farba");
	expect(group(sk.container).getAttribute("aria-label")).toBe("Farba");
});

test("empty and malformed palette entries are dropped", async () => {
	const screen = await render(ColorPicker, {
		palette: ["#ff0000", "", "   ", { value: "" }, { value: "#0000ff" }] as string[],
		allowClear: false,
	});
	expect(radios(screen.container).length).toBe(2);
});

// ============================================================================
// picking
// ============================================================================

test("clicking a swatch commits it: value, hidden input, onchange", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, { palette: P, value: "", onchange });
	const c = screen.container;

	await screen.getByRole("radio", { name: "#0000ff" }).click();
	expect(onchange.mock.calls).toEqual([["#0000ff"]]);
	expect(checked(c)).toEqual(["2"]);
	expect(hidden(c).value).toBe("#0000ff");

	await screen.getByRole("radio", { name: "No color" }).click();
	expect(onchange.mock.calls.map((a) => a[0])).toEqual(["#0000ff", ""]);
	expect(checked(c)).toEqual(["3"]);
	expect(hidden(c).value).toBe("");
});

test("allowClear=false: no clear swatch, and Delete/Backspace are ignored", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#00ff00",
		allowClear: false,
		onchange,
	});
	const c = screen.container;
	expect(radios(c).length).toBe(3);

	radios(c)[1].focus();
	await userEvent.keyboard("{Delete}{Backspace}");
	expect(checked(c)).toEqual(["1"]);
	expect(onchange).not.toHaveBeenCalled();
});

test("keyboard: arrows wrap, Home/End jump, Delete clears; focus follows", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, { palette: P, value: "#ff0000", onchange });
	const c = screen.container;
	radios(c)[0].focus();

	await userEvent.keyboard("{ArrowRight}");
	expect(checked(c)).toEqual(["1"]);
	expect(document.activeElement).toBe(radios(c)[1]);

	// wraps at the end (the clear swatch is the last member)
	await userEvent.keyboard("{ArrowRight}{ArrowRight}");
	expect(checked(c)).toEqual(["3"]);
	await userEvent.keyboard("{ArrowRight}");
	expect(checked(c)).toEqual(["0"]);
	// ...and backwards
	await userEvent.keyboard("{ArrowLeft}");
	expect(checked(c)).toEqual(["3"]);

	await userEvent.keyboard("{Home}");
	expect(checked(c)).toEqual(["0"]);
	await userEvent.keyboard("{End}");
	expect(checked(c)).toEqual(["3"]);

	await userEvent.keyboard("{Home}{Delete}");
	expect(checked(c)).toEqual(["3"]);
	expect(hidden(c).value).toBe("");

	expect(onchange.mock.calls.map((a) => a[0])).toEqual([
		"#00ff00",
		"#0000ff",
		"",
		"#ff0000",
		"",
		"#ff0000",
		"",
		"#ff0000",
		"",
	]);
});

test("columns caps the row; ArrowDown/Up step by the rendered row and never wrap", async () => {
	const screen = await render(ColorPicker, {
		palette: ["#000000", "#111111", "#222222", "#333333", "#444444", "#555555"],
		columns: 3,
		allowClear: false,
		value: "#000000",
	});
	const c = screen.container;
	expect(group(c).dataset.columns).toBe("3");
	expect(group(c).style.getPropertyValue("--stuic-color-picker-columns")).toBe("3");

	// The vertical step is measured from the rendered rows, so it needs real
	// layout — and browser tests don't load index.css. Lay the group out by hand
	// (three 20px swatches + two 2px gaps fit, a fourth does not).
	const style = document.createElement("style");
	style.textContent = `[role="radiogroup"]{display:flex;flex-wrap:wrap;gap:2px;max-width:66px}
		[role="radio"]{width:20px;height:20px}`;
	document.head.append(style);
	try {
		radios(c)[0].focus();
		await userEvent.keyboard("{ArrowDown}");
		expect(checked(c)).toEqual(["3"]);
		// no row below -> no-op (not a wrap)
		await userEvent.keyboard("{ArrowDown}");
		expect(checked(c)).toEqual(["3"]);
		await userEvent.keyboard("{ArrowUp}");
		expect(checked(c)).toEqual(["0"]);
		await userEvent.keyboard("{ArrowUp}");
		expect(checked(c)).toEqual(["0"]);
	} finally {
		style.remove();
	}
});

// ============================================================================
// custom color
// ============================================================================

test("custom prop selects which controls render", async () => {
	const both = await render(ColorPicker, { palette: P });
	expect(!!native(both.container)).toBe(true);
	expect(!!text(both.container)).toBe(true);

	const onlyNative = await render(ColorPicker, { palette: P, custom: "native" });
	expect(!!native(onlyNative.container)).toBe(true);
	expect(!!text(onlyNative.container)).toBe(false);

	const onlyText = await render(ColorPicker, { palette: P, custom: "text" });
	expect(!!native(onlyText.container)).toBe(false);
	expect(!!text(onlyText.container)).toBe(true);

	const none = await render(ColorPicker, { palette: P, custom: false });
	expect(!!native(none.container)).toBe(false);
	expect(!!text(none.container)).toBe(false);
});

test("the native input mirrors hex values and falls back to black otherwise", async () => {
	const hex = await render(ColorPicker, { palette: P, value: "#00FF00" });
	expect(native(hex.container)!.value).toBe("#00ff00");

	// a token reference / empty value has no hex representation
	const token = await render(ColorPicker, {
		palette: P,
		value: "var(--stuic-color-primary)",
	});
	expect(native(token.container)!.value).toBe("#000000");
	// ...and is still what the form submits
	expect(hidden(token.container).value).toBe("var(--stuic-color-primary)");
});

test("the native input previews on input and commits on change", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, { palette: P, value: "", onchange });
	const c = screen.container;
	const n = native(c)!;

	n.value = "#abcdef";
	n.dispatchEvent(new Event("input", { bubbles: true }));
	await expect.poll(() => hidden(c).value).toBe("#abcdef");
	// dragging the OS picker updates the value (so bind:value previews) but is
	// not a commit
	expect(onchange).not.toHaveBeenCalled();

	n.dispatchEvent(new Event("change", { bubbles: true }));
	expect(onchange.mock.calls).toEqual([["#abcdef"]]);
});

test("hex field: normalizes on commit, previews while typing, fires onchange once", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, { palette: P, value: "", onchange });
	const c = screen.container;

	typeHex(c, "#0f0");
	await expect.poll(() => hidden(c).value).toBe("#00ff00");
	expect(onchange).not.toHaveBeenCalled();

	commitHex(c);
	expect(onchange.mock.calls).toEqual([["#00ff00"]]);
	// the shorthand is normalized in the field too, and the palette picks it up
	await expect.poll(() => text(c)!.value).toBe("#00ff00");
	expect(checked(c)).toEqual(["1"]);
});

test("hex field: a partial or invalid value never commits and snaps back", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#ff0000",
		onchange,
	});
	const c = screen.container;

	// half-typed: no preview, no event, and the draft is left alone
	typeHex(c, "#0f");
	expect(hidden(c).value).toBe("#ff0000");
	expect(text(c)!.value).toBe("#0f");

	typeHex(c, "nonsense");
	commitHex(c);
	expect(onchange).not.toHaveBeenCalled();
	await expect.poll(() => text(c)!.value).toBe("#ff0000");
	expect(hidden(c).value).toBe("#ff0000");
});

test("hex field: accepts any CSS color, and emptying it clears", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, { palette: P, value: "#ff0000", onchange });
	const c = screen.container;

	typeHex(c, "rgb(0 0 255)");
	commitHex(c);
	expect(onchange.mock.calls).toEqual([["rgb(0 0 255)"]]);

	typeHex(c, "");
	commitHex(c);
	expect(onchange.mock.calls.at(-1)).toEqual([""]);
	expect(hidden(c).value).toBe("");
});

test("hex field: emptying it does not clear when allowClear=false", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#ff0000",
		allowClear: false,
		onchange,
	});
	const c = screen.container;

	typeHex(c, "");
	commitHex(c);
	expect(onchange).not.toHaveBeenCalled();
	await expect.poll(() => text(c)!.value).toBe("#ff0000");
});

test("blurring the hex field drops an uncommitted draft", async () => {
	const screen = await render(ColorPicker, { palette: P, value: "#ff0000" });
	const c = screen.container;
	text(c)!.focus();
	typeHex(c, "#0f");
	text(c)!.blur();
	await expect.poll(() => text(c)!.value).toBe("#ff0000");
});

test("the hex field follows a color picked elsewhere", async () => {
	const screen = await render(ColorPicker, { palette: P, value: "" });
	const c = screen.container;
	await screen.getByRole("radio", { name: "#0000ff" }).click();
	await expect.poll(() => text(c)!.value).toBe("#0000ff");
});

// ============================================================================
// disabled / validation
// ============================================================================

test("disabled: every control is disabled and nothing submits", async () => {
	const onchange = vi.fn();
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#ff0000",
		disabled: true,
		onchange,
	});
	const c = screen.container;

	expect(radios(c).every((r) => r.disabled)).toBe(true);
	expect(native(c)!.disabled).toBe(true);
	expect(text(c)!.disabled).toBe(true);
	expect(hidden(c).disabled).toBe(true);
	expect(group(c).getAttribute("aria-disabled")).toBe("true");
	expect(c.querySelector(".stuic-color-picker")!.getAttribute("data-disabled")).toBe("");

	// a disabled button cannot be clicked, but the keyboard path is ours to guard
	radios(c)[0].dispatchEvent(
		new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
	);
	expect(onchange).not.toHaveBeenCalled();
});

test("required: the built-in validator rejects an empty value", async () => {
	const setValidationResult = vi.fn();
	const screen = await render(ColorPicker, {
		palette: P,
		value: "",
		required: true,
		name: "brand",
		setValidationResult,
	});
	const c = screen.container;
	expect(group(c).getAttribute("aria-required")).toBe("true");

	const picker = screen.component as unknown as {
		validate: () => { valid: boolean } | undefined;
		getValidation: () => { valid: boolean } | undefined;
		clearValidation: () => void;
	};

	expect(picker.validate()?.valid).toBe(false);
	expect(setValidationResult).toHaveBeenCalled();
	await expect.poll(() => group(c).getAttribute("aria-invalid")).toBe("true");

	await screen.getByRole("radio", { name: "#ff0000" }).click();
	// the commit re-dispatches change on the hidden input, so validation re-runs
	await expect.poll(() => picker.getValidation()?.valid).toBe(true);
	await expect.poll(() => group(c).getAttribute("aria-invalid")).toBe(null);

	picker.clearValidation();
	expect(picker.getValidation()).toBe(undefined);
});

test("unstyled drops the classes but keeps the semantics", async () => {
	const screen = await render(ColorPicker, {
		palette: P,
		value: "#ff0000",
		unstyled: true,
		class: "my-picker",
	});
	const c = screen.container;
	expect(c.querySelector(".stuic-color-picker")).toBe(null);
	expect(c.querySelector(".my-picker")).toBeTruthy();
	expect(radios(c).length).toBe(4);
	expect(checked(c)).toEqual(["0"]);
	// styling hooks are gone, aria is not
	expect(radios(c)[0].dataset.selected).toBe(undefined);
	expect(radios(c)[0].getAttribute("aria-checked")).toBe("true");
});
