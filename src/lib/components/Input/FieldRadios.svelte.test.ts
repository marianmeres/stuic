import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldRadios from "./FieldRadios.svelte";

// FieldRadios is a Field* radio group. Unlike the InputWrap-based fields (which render
// a <div class="stuic-input"> shell + <label for={id}>), FieldRadios renders its OWN
// shell: <div class="stuic-radios" data-size> containing one radio per option via
// _internal/FieldRadioInternal.svelte. Each radio is <input type="radio" bind:group {value}
// {name}> wrapped in a <label class="radio-box"> whose text is the option label — so the
// radio's ACCESSIBLE NAME is the label. Locate radios with getByRole("radio", { name }).
// For plain-string options, each radio's `value` defaults to its label, and `value` on the
// component drives the shared `bind:group` (i.e. which radio is checked).
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

// FieldRadios' shell is `.stuic-radios` (not the InputWrap `.stuic-input`).
function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-radios");
	if (!el) throw new Error("missing .stuic-radios wrapper");
	return page.elementLocator(el);
}

const OPTIONS = ["Apple", "Banana", "Cherry"];

test("renders the stuic-radios shell (data-size=md) with one accessible radio per option", async () => {
	const screen = await render(FieldRadios, { options: OPTIONS });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// accessible name = label (label-box text wraps the radio input)
	for (const name of OPTIONS) {
		await expect.element(screen.getByRole("radio", { name })).toBeInTheDocument();
	}
});

test("renderSize maps through to data-size on the shell", async () => {
	const screen = await render(FieldRadios, { options: OPTIONS, renderSize: "lg" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("value selects the matching radio; the others are not checked", async () => {
	const screen = await render(FieldRadios, { options: OPTIONS, value: "Banana" });
	await expect.element(screen.getByRole("radio", { name: "Banana" })).toBeChecked();
	await expect.element(screen.getByRole("radio", { name: "Apple" })).not.toBeChecked();
	await expect.element(screen.getByRole("radio", { name: "Cherry" })).not.toBeChecked();
});

test("clicking another radio moves the selection via bind:group (reactivity)", async () => {
	const screen = await render(FieldRadios, { options: OPTIONS, value: "Banana" });
	const cherry = screen.getByRole("radio", { name: "Cherry" });

	await cherry.click();

	// the clicked radio is now checked...
	await expect.element(cherry).toBeChecked();
	// ...and the previously-selected one is no longer checked (single shared group)
	await expect.element(screen.getByRole("radio", { name: "Banana" })).not.toBeChecked();
});

test("disabled disables the radios", async () => {
	const screen = await render(FieldRadios, { options: OPTIONS, disabled: true });
	// do NOT click — just assert the disabled contract
	await expect.element(screen.getByRole("radio", { name: "Apple" })).toBeDisabled();
});

test("validate: a failing customValidator renders its message in the validation box", async () => {
	const customValidator = (value: unknown) =>
		value === "Banana" ? undefined : "pick Banana";
	const screen = await render(FieldRadios, {
		options: OPTIONS,
		value: "Apple",
		validate: { customValidator },
	});
	const apple = screen.getByRole("radio", { name: "Apple" });

	// the trim/validate actions fire on the native change event
	fireChange(apple.element());

	await expect.element(screen.getByText("pick Banana")).toBeInTheDocument();
});

test("validate: a passing customValidator renders no message", async () => {
	const customValidator = (value: unknown) =>
		value === "Banana" ? undefined : "pick Banana";
	const screen = await render(FieldRadios, {
		options: OPTIONS,
		value: "Banana",
		validate: { customValidator },
	});
	const banana = screen.getByRole("radio", { name: "Banana" });

	fireChange(banana.element());

	await expect.element(screen.getByText("pick Banana")).not.toBeInTheDocument();
});
