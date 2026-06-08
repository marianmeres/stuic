import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldPhoneNumber from "./FieldPhoneNumber.svelte";

// FieldPhoneNumber wraps InputWrap (the <div class="stuic-input" data-size> shell,
// a <label for={id}>, and the control). Its control is a <input type="tel"> whose
// `id` matches the label `for`, so getByLabelText(label) finds the tel input.
//
// Unlike a plain text Field, the BOUND value is not the tel input's value: the tel
// input only carries the LOCAL number part (_localNumber). On `oninput`, the internal
// handleInput composes the full E.164 value (`+{dialCode}{cleaned}`) and writes it to a
// HIDDEN <input type="hidden"> (rendered by default since validate is on). That hidden
// input is the form-participation / validation surface and the thing a consumer observes.
//
// syncToValue() sets `value` synchronously but dispatches the `change` (that drives the
// validator) on the hidden input one tick later, so hidden-value / validation assertions
// are effect/tick-driven — use expect.poll / expect.element retries, never a fixed sleep.

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

const hidden = (container: HTMLElement) =>
	container.querySelector('input[type="hidden"]') as HTMLInputElement | null;

test("renders the stuic-input shell (data-size=md) with a label associated to the tel input", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	// label `for` ↔ tel input `id` association: getByLabelText returns the tel input
	const input = screen.getByLabelText("Phone");
	await expect.element(input).toBeInTheDocument();
	await expect.element(input).toHaveAttribute("type", "tel");
});

test("renders the PhonePrefixPicker trigger button before the tel input", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	// PhonePrefixPicker renders a <button type="button"> as its trigger. We only assert
	// it exists — opening/selecting from its dropdown is a separate Tier-3 task.
	const trigger = screen.container.querySelector("button");
	expect(trigger).not.toBeNull();
});

test("defaultCountry=SK seeds the +421 dial code in the picker trigger", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	// The trigger text is derived from the selected country's dial code.
	const trigger = screen.container.querySelector("button")!;
	await expect.poll(() => trigger.textContent).toContain("+421");
});

test("renders the hidden form input by default (validate is on)", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const h = hidden(screen.container);
	expect(h).not.toBeNull();
	expect(h!.getAttribute("name")).toBe("phone");
});

test("COMPOSE CONTRACT: filling the tel input composes the E.164 value into the hidden input", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const input = screen.getByLabelText("Phone");

	// Typing the local number; handleInput composes `+{SK dial code}{digits}`.
	await input.fill("905123456");

	// The hidden input value is effect/tick-driven (syncToValue dispatches change after a
	// tick) — poll for it rather than reading synchronously.
	await expect.poll(() => hidden(screen.container)?.value).toBe("+421905123456");
});

test("compose strips formatting chars (spaces, dashes, parens) from the local number", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const input = screen.getByLabelText("Phone");

	await input.fill("905 123 456");
	await expect.poll(() => hidden(screen.container)?.value).toBe("+421905123456");
});

test("editing the local number recomposes the hidden value", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const input = screen.getByLabelText("Phone");

	await input.fill("905123456");
	await expect.poll(() => hidden(screen.container)?.value).toBe("+421905123456");

	// Re-fill with a different local number → recompose.
	await input.fill("908000000");
	await expect.poll(() => hidden(screen.container)?.value).toBe("+421908000000");
});

test("an external value prop populates the hidden input and the tel local-number part", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		value: "+421905123456",
		name: "phone",
	});
	// The $effect parses the value: hidden carries the full E.164, tel carries the local part.
	await expect.poll(() => hidden(screen.container)?.value).toBe("+421905123456");
	await expect.element(screen.getByLabelText("Phone")).toHaveValue("905123456");
});

test("renderSize maps to the data-size shell attribute", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("disabled disables the tel input", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
		disabled: true,
	});
	await expect.element(screen.getByLabelText("Phone")).toBeDisabled();
});

test("description text is rendered", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
		description: "Include area code",
	});
	await expect.element(screen.getByText("Include area code")).toBeInTheDocument();
});

test("validate: a clearly-invalid number shows the built-in validation message", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const input = screen.getByLabelText("Phone");

	// Local "1" composes to "+4211", which the built-in validatePhoneNumber rejects.
	// handleInput → syncToValue dispatches `change` on the hidden input after a tick,
	// running the validator; the message renders in the .validation-box.
	await input.fill("1");

	await expect.element(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
});

test("validate: fixing the value clears the validation message", async () => {
	const screen = await render(FieldPhoneNumber, {
		label: "Phone",
		defaultCountry: "SK",
		name: "phone",
	});
	const input = screen.getByLabelText("Phone");

	await input.fill("1");
	await expect.element(screen.getByText(/invalid phone number/i)).toBeInTheDocument();

	// A valid local number recomposes to a valid E.164 → the message clears.
	await input.fill("905123456");
	await expect.element(screen.getByText(/invalid phone number/i)).not.toBeInTheDocument();
});
