import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldSwitch from "./FieldSwitch.svelte";

// FieldSwitch wraps <Switch> inside InputWrap. InputWrap renders the
// <div class="stuic-input" data-size> shell + a <label for={id}>; the control
// is a <Switch> whose root <label class="stuic-switch"> holds a hidden
// <input type="checkbox"> carrying the checked state (implicit role "checkbox").
//
// EXCEPTION to the Field* norm: the InputWrap <label for={id}> is NOT associated
// to the checkbox — FieldSwitch never forwards `id` onto the inner Switch input —
// so getByLabelText() can't reach the control here. We locate the checked state
// via getByRole("checkbox") and assert the label text via getByText().
//
// TOGGLE GOTCHA (see Switch/Switch.svelte.test.ts): the hidden checkbox sits
// dead-center of the .stuic-switch label, so a default centered .click() lands on
// the input and double-toggles to a no-op. We click the switch label OFF-CENTER.
const HIT = { position: { x: 2, y: 2 } } as const;

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

function switchLabel(container: HTMLElement) {
	const el = container.querySelector(".stuic-switch");
	if (!el) throw new Error("missing .stuic-switch label");
	return page.elementLocator(el);
}

test("renders the stuic-input shell (data-size=md) with the label and a checkbox control", async () => {
	const screen = await render(FieldSwitch, { label: "Notifications" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// the InputWrap label text renders
	await expect.element(screen.getByText("Notifications")).toBeInTheDocument();
	// the Switch's hidden checkbox is the interactive control
	await expect.element(screen.getByRole("checkbox")).toBeInTheDocument();
});

test("checked=true is reflected in the checkbox", async () => {
	const screen = await render(FieldSwitch, { label: "On", checked: true });
	await expect.element(screen.getByRole("checkbox")).toBeChecked();
});

test("checked=false leaves the checkbox unchecked", async () => {
	const screen = await render(FieldSwitch, { label: "Off", checked: false });
	await expect.element(screen.getByRole("checkbox")).not.toBeChecked();
});

test("clicking the switch label off-center toggles the checkbox (reactivity proof)", async () => {
	const screen = await render(FieldSwitch, { label: "Toggle", checked: false });
	const input = screen.getByRole("checkbox");
	await expect.element(input).not.toBeChecked();

	// off-center click hits the label cleanly (centered click would double-toggle)
	await switchLabel(screen.container).click(HIT);
	await expect.element(input).toBeChecked();

	// toggle back
	await switchLabel(screen.container).click(HIT);
	await expect.element(input).not.toBeChecked();
});

test("disabled marks the checkbox disabled (no click)", async () => {
	const screen = await render(FieldSwitch, { label: "Locked", disabled: true });
	// A label wrapping a disabled control is not actionable; assert the contract directly.
	await expect.element(screen.getByRole("checkbox")).toBeDisabled();
	// the InputWrap label still renders
	await expect.element(screen.getByText("Locked")).toBeInTheDocument();
});

test("required marks the checkbox required", async () => {
	const screen = await render(FieldSwitch, { label: "Must", required: true });
	await expect.element(screen.getByRole("checkbox")).toBeRequired();
});

test("name is forwarded to the hidden checkbox for form participation", async () => {
	const screen = await render(FieldSwitch, { label: "Field", name: "newsletter" });
	await expect
		.element(screen.getByRole("checkbox"))
		.toHaveAttribute("name", "newsletter");
});

test("renderSize maps through to the data-size on the stuic-input wrapper", async () => {
	const screen = await render(FieldSwitch, { label: "Big", renderSize: "lg" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("description text is rendered below the control", async () => {
	const screen = await render(FieldSwitch, {
		label: "Field",
		description: "Helpful hint",
	});
	await expect.element(screen.getByText("Helpful hint")).toBeInTheDocument();
});
