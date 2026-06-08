import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldTextarea from "./FieldTextarea.svelte";

// FieldTextarea mirrors FieldInput (both wrap InputWrap → the <div class="stuic-input"
// data-size> shell, a <label for={id}>, and the control), except the control is a
// <textarea> (role "textbox") and autogrow is on by default. The high-yield,
// browser-only contracts:
//   - label/for ↔ textarea id association -> getByLabelText() finds the real <textarea>
//   - value/required/disabled prop        -> textarea DOM contract
//   - the `trim` action (default on)      -> trailing/leading ws stripped on `change`
//   - the `validate` action               -> customValidator message shows/hides in the
//                                            .validation-box (inject a stub validator —
//                                            no live validation)
//   - autogrow (browser-only)             -> computed height grows for a tall value
// Both `trim` and `validate` listen on the native `change` event; Playwright's .fill()
// only fires `input`, so we dispatch a real `change` (the same path onSubmit uses).
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

test("renders the stuic-input shell (data-size=md) with a label associated to a textarea", async () => {
	const screen = await render(FieldTextarea, { label: "Bio" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// label `for` ↔ textarea `id` association is the contract: getByLabelText finds it
	const textarea = screen.getByLabelText("Bio");
	await expect.element(textarea).toBeInTheDocument();
	// the control is a textbox role
	await expect.element(screen.getByRole("textbox")).toBeInTheDocument();
});

test("value prop populates the textarea; renderSize maps through", async () => {
	const screen = await render(FieldTextarea, {
		label: "Notes",
		value: "hello",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
	await expect.element(screen.getByLabelText("Notes")).toHaveValue("hello");
});

test("required marks the textarea required", async () => {
	const screen = await render(FieldTextarea, { label: "Name", required: true });
	await expect.element(screen.getByLabelText("Name")).toBeRequired();
});

test("disabled disables the textarea", async () => {
	const screen = await render(FieldTextarea, { label: "Locked", disabled: true });
	await expect.element(screen.getByLabelText("Locked")).toBeDisabled();
});

test("trim (default on) strips surrounding whitespace on change", async () => {
	const screen = await render(FieldTextarea, { label: "Trimmed" });
	const textarea = screen.getByLabelText("Trimmed");
	await textarea.fill("  spaced  ");
	fireChange(textarea.element());
	// the trim action sets el.value = value.trim() and syncs the bound value
	await expect.element(textarea).toHaveValue("spaced");
});

test("useTrim=false leaves surrounding whitespace intact", async () => {
	const screen = await render(FieldTextarea, { label: "Raw", useTrim: false });
	const textarea = screen.getByLabelText("Raw");
	await textarea.fill("  kept  ");
	fireChange(textarea.element());
	await expect.element(textarea).toHaveValue("  kept  ");
});

test("validate: a failing customValidator renders its message in the validation box", async () => {
	const customValidator = vi.fn((v: unknown) =>
		v === "secret" ? undefined : "must be secret"
	);
	const screen = await render(FieldTextarea, {
		label: "Code",
		validate: { customValidator },
	});
	const textarea = screen.getByLabelText("Code");

	await textarea.fill("wrong");
	fireChange(textarea.element());
	await expect.element(screen.getByText("must be secret")).toBeInTheDocument();
	expect(customValidator).toHaveBeenCalled();
});

test("validate: fixing the value clears the validation message", async () => {
	const customValidator = (v: unknown) => (v === "secret" ? undefined : "must be secret");
	const screen = await render(FieldTextarea, {
		label: "Code",
		validate: { customValidator },
	});
	const textarea = screen.getByLabelText("Code");

	await textarea.fill("wrong");
	fireChange(textarea.element());
	await expect.element(screen.getByText("must be secret")).toBeInTheDocument();

	await textarea.fill("secret");
	fireChange(textarea.element());
	await expect.element(screen.getByText("must be secret")).not.toBeInTheDocument();
});

test("description text is rendered below the textarea", async () => {
	const screen = await render(FieldTextarea, {
		label: "Field",
		description: "Helpful hint",
	});
	await expect.element(screen.getByText("Helpful hint")).toBeInTheDocument();
});

test("passes through arbitrary textarea attributes via ...rest (e.g. placeholder)", async () => {
	const screen = await render(FieldTextarea, {
		label: "Search",
		placeholder: "Type here",
	});
	await expect
		.element(screen.getByLabelText("Search"))
		.toHaveAttribute("placeholder", "Type here");
});

test("autogrow (default on): a tall multi-line value renders taller than a short one", async () => {
	// autogrow is browser-only (it reads scrollHeight); compare the computed offsetHeight
	// of a single-line value against a many-line value with a tolerant > comparison.
	const screen = await render(FieldTextarea, { label: "Grow" });
	const locator = screen.getByLabelText("Grow");
	const textarea = locator.element() as HTMLTextAreaElement;

	await locator.fill("one line");
	fireChange(textarea);
	await expect.poll(() => textarea.offsetHeight).toBeGreaterThan(0);
	const shortHeight = textarea.offsetHeight;

	const tall = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join("\n");
	await locator.fill(tall);
	fireChange(textarea);
	// autogrow must have expanded the element to fit the extra rows
	await expect.poll(() => textarea.offsetHeight).toBeGreaterThan(shortHeight);
});
