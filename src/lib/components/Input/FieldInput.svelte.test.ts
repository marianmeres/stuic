import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldInput from "./FieldInput.svelte";

// FieldInput is the FLAGSHIP of the Field* family (all wrap InputWrap, which renders
// the <div class="stuic-input" data-size> shell, a <label for={id}>, and the control).
// The high-yield, browser-only contracts:
//   - label/for ↔ input id association  -> getByLabelText() finds the real <input>
//   - value/type/required/disabled prop -> input DOM contract
//   - the `trim` action (default on)    -> trailing/leading ws stripped on `change`
//   - the `validate` action             -> customValidator message shows/hides in the
//                                          .validation-box (inject a stub validator per
//                                          docs/component-testing/03 — no live validation)
// Both `trim` and `validate` listen on the native `change` event; Playwright's .fill()
// only fires `input`, so we dispatch a real `change` (the same path onSubmit uses).
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

test("renders the stuic-input shell (data-size=md) with a label associated to a text input", async () => {
	const screen = await render(FieldInput, { label: "Email" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// label `for` ↔ input `id` association is the contract: getByLabelText finds the input
	const input = screen.getByLabelText("Email");
	await expect.element(input).toBeInTheDocument();
	// default type is text
	await expect.element(input).toHaveAttribute("type", "text");
});

test("value prop populates the input; type and renderSize map through", async () => {
	const screen = await render(FieldInput, {
		label: "Secret",
		value: "hello",
		type: "password",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
	const input = screen.getByLabelText("Secret");
	await expect.element(input).toHaveValue("hello");
	await expect.element(input).toHaveAttribute("type", "password");
});

test("required marks the input required", async () => {
	const screen = await render(FieldInput, { label: "Name", required: true });
	await expect.element(screen.getByLabelText("Name")).toBeRequired();
});

test("disabled disables the input", async () => {
	const screen = await render(FieldInput, { label: "Locked", disabled: true });
	await expect.element(screen.getByLabelText("Locked")).toBeDisabled();
});

test("trim (default on) strips surrounding whitespace on change", async () => {
	const screen = await render(FieldInput, { label: "Trimmed" });
	const input = screen.getByLabelText("Trimmed");
	await input.fill("  spaced  ");
	fireChange(input.element());
	// the trim action sets el.value = value.trim() and syncs the bound value
	await expect.element(input).toHaveValue("spaced");
});

test("useTrim=false leaves surrounding whitespace intact", async () => {
	const screen = await render(FieldInput, { label: "Raw", useTrim: false });
	const input = screen.getByLabelText("Raw");
	await input.fill("  kept  ");
	fireChange(input.element());
	await expect.element(input).toHaveValue("  kept  ");
});

test("validate: a failing customValidator renders its message in the validation box", async () => {
	const customValidator = vi.fn((v: unknown) =>
		v === "secret" ? undefined : "must be secret"
	);
	const screen = await render(FieldInput, {
		label: "Code",
		validate: { customValidator },
	});
	const input = screen.getByLabelText("Code");

	await input.fill("wrong");
	fireChange(input.element());
	await expect.element(screen.getByText("must be secret")).toBeInTheDocument();
	expect(customValidator).toHaveBeenCalled();
});

test("validate: fixing the value clears the validation message", async () => {
	const customValidator = (v: unknown) => (v === "secret" ? undefined : "must be secret");
	const screen = await render(FieldInput, {
		label: "Code",
		validate: { customValidator },
	});
	const input = screen.getByLabelText("Code");

	await input.fill("wrong");
	fireChange(input.element());
	await expect.element(screen.getByText("must be secret")).toBeInTheDocument();

	await input.fill("secret");
	fireChange(input.element());
	await expect.element(screen.getByText("must be secret")).not.toBeInTheDocument();
});

test("description text is rendered below the input", async () => {
	const screen = await render(FieldInput, {
		label: "Field",
		description: "Helpful hint",
	});
	await expect.element(screen.getByText("Helpful hint")).toBeInTheDocument();
});

test("passes through arbitrary input attributes via ...rest (e.g. placeholder)", async () => {
	const screen = await render(FieldInput, { label: "Search", placeholder: "Type here" });
	await expect
		.element(screen.getByLabelText("Search"))
		.toHaveAttribute("placeholder", "Type here");
});
