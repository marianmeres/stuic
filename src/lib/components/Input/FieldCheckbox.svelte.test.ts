import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldCheckbox from "./FieldCheckbox.svelte";

// FieldCheckbox is the structural ODD-ONE-OUT of the Field* family: NO InputWrap.
// The root is a <label class="stuic-checkbox" data-size> that wraps a native
// <input type="checkbox" bind:checked> plus the label text. So there's no
// .stuic-input shell and no `for`/`id` round-trip to lean on — we locate the
// control directly via getByRole("checkbox").
// The high-yield, browser-only contracts:
//   - checked prop      -> the native checkbox's checked DOM state
//   - clicking          -> toggles checked (real native checkbox, one flip per click)
//   - required/disabled -> input DOM contract
//   - label text        -> rendered (getByText)
//   - data-size         -> on the root <label class="stuic-checkbox">
//   - the `validate` action -> customValidator message shows/hides in the
//                              .validation-box (inject a stub validator keyed off the
//                              checked state — no live validation)
// The `validate` action listens on the native `change` event. A user click fires
// `change` natively; programmatic toggles dispatch one explicitly.
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

// The root shell here is the <label class="stuic-checkbox">, not the .stuic-input
// that InputWrap-based fields render.
function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-checkbox");
	if (!el) throw new Error("missing .stuic-checkbox wrapper");
	return page.elementLocator(el);
}

test("renders a native checkbox with the label text and data-size=md on the root label", async () => {
	const screen = await render(FieldCheckbox, { label: "Accept terms" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	const cb = screen.getByRole("checkbox");
	await expect.element(cb).toBeInTheDocument();
	await expect.element(cb).toHaveAttribute("type", "checkbox");
	await expect.element(screen.getByText("Accept terms")).toBeInTheDocument();
});

test("checked=true renders the checkbox checked", async () => {
	const screen = await render(FieldCheckbox, { label: "On", checked: true });
	await expect.element(screen.getByRole("checkbox")).toBeChecked();
});

test("checked=false renders the checkbox unchecked", async () => {
	const screen = await render(FieldCheckbox, { label: "Off", checked: false });
	await expect.element(screen.getByRole("checkbox")).not.toBeChecked();
});

test("clicking the checkbox toggles its checked state", async () => {
	const screen = await render(FieldCheckbox, { label: "Toggle", checked: false });
	const cb = screen.getByRole("checkbox");
	await expect.element(cb).not.toBeChecked();
	await cb.click();
	await expect.element(cb).toBeChecked();
});

test("renderSize maps through to data-size on the root label", async () => {
	const screen = await render(FieldCheckbox, { label: "Big", renderSize: "lg" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("required marks the checkbox required", async () => {
	const screen = await render(FieldCheckbox, { label: "Must", required: true });
	await expect.element(screen.getByRole("checkbox")).toBeRequired();
});

test("disabled disables the checkbox", async () => {
	const screen = await render(FieldCheckbox, { label: "Locked", disabled: true });
	await expect.element(screen.getByRole("checkbox")).toBeDisabled();
});

test("validate: checking an invalid box renders the message; unchecking clears it", async () => {
	// keyed off the element's live checked state: invalid while checked
	// el is typed as the union the validate action declares; narrow to read `.checked`.
	const customValidator = vi.fn(
		(
			_v: unknown,
			_ctx: unknown,
			el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		) => ((el as HTMLInputElement).checked ? "no good" : undefined)
	);
	const screen = await render(FieldCheckbox, {
		label: "Agree",
		checked: false,
		validate: { customValidator },
	});
	const cb = screen.getByRole("checkbox");

	// starts valid (unchecked) -> no message
	await expect.element(screen.getByText("no good")).not.toBeInTheDocument();

	// click to check -> native change fires validate -> message shows
	await cb.click();
	fireChange(cb.element());
	await expect.element(screen.getByText("no good")).toBeInTheDocument();
	expect(customValidator).toHaveBeenCalled();

	// click again to uncheck -> validator passes -> message clears
	await cb.click();
	fireChange(cb.element());
	await expect.element(screen.getByText("no good")).not.toBeInTheDocument();
});
