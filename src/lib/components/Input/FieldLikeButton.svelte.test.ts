import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldLikeButton from "./FieldLikeButton.svelte";

// FieldLikeButton is a Field* member that wraps InputWrap, but its control is split:
// a visible <button> (role "button", type "button") shows the rendered value, and a
// hidden <input type="hidden"> carries the value + name for form participation. Because
// the real control is hidden (and the <label for> targets the hidden input's id), we
// can't use getByLabelText() to drive it — we query the hidden input directly and read
// the visible button via role/text.
//
// The default renderer expects JSON: it shows JSON.stringify(JSON.parse(value)).
// Validation here is BUILT IN (no customValidator stub): the hidden input's validate
// action runs JSON.parse (and a required check) — but ONLY when `validate` is passed
// as a BOOLEAN. The source wires the built-in validator inside a
// `typeof validateProp === "boolean"` branch, so the default (`undefined`) installs no
// validator at all; the validation tests below pass `validate: true` to enable it.
// Like the rest of the family, validation listens on the native `change` event, so we
// dispatch a real one.
const fireChange = (el: Element) =>
	el.dispatchEvent(new Event("change", { bubbles: true }));

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

test("renders the stuic-input shell (data-size=md) with the InputWrap label", async () => {
	const screen = await render(FieldLikeButton, { label: "Payload", value: '{"a":1}' });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "md");
	await expect.element(screen.getByText("Payload")).toBeInTheDocument();
});

test("renderSize maps through to the wrapper data-size", async () => {
	const screen = await render(FieldLikeButton, {
		label: "Payload",
		value: '{"a":1}',
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("the visible button (default JSON renderer) shows the normalized value", async () => {
	const screen = await render(FieldLikeButton, { label: "Payload", value: '{"a":1}' });
	const button = screen.getByRole("button");
	await expect.element(button).toHaveTextContent('{"a":1}');
	await expect.element(button).toHaveAttribute("type", "button");
});

test("the hidden input carries the value and name for form participation", async () => {
	const screen = await render(FieldLikeButton, {
		label: "Payload",
		value: '{"a":1}',
		name: "payload",
	});
	const hidden = screen.container.querySelector(
		'input[type="hidden"]'
	) as HTMLInputElement;
	expect(hidden).toBeTruthy();
	expect(hidden.value).toBe('{"a":1}');
	expect(hidden.getAttribute("name")).toBe("payload");
});

test("built-in validation: non-JSON value renders the invalid message on change", async () => {
	// The built-in JSON customValidator is only wired when `validate` is a BOOLEAN
	// (see the `typeof validateProp === "boolean"` branch in the source). Leaving
	// `validate` at its `undefined` default spreads nothing and installs no validator,
	// so no message would ever render. Pass `validate` (=== true) to enable it.
	const screen = await render(FieldLikeButton, {
		label: "Payload",
		value: "not json",
		validate: true,
	});
	const hidden = screen.container.querySelector(
		'input[type="hidden"]'
	) as HTMLInputElement;
	fireChange(hidden);
	await expect.element(screen.getByText(/invalid/i)).toBeInTheDocument();
});

test("built-in validation: valid JSON value produces no validation message", async () => {
	const screen = await render(FieldLikeButton, {
		label: "Payload",
		value: '{"a":1}',
		validate: true,
	});
	const hidden = screen.container.querySelector(
		'input[type="hidden"]'
	) as HTMLInputElement;
	fireChange(hidden);
	await expect.element(screen.getByText(/invalid/i)).not.toBeInTheDocument();
});

test("built-in validation: required + empty value renders the attention message on change", async () => {
	const screen = await render(FieldLikeButton, {
		label: "Payload",
		value: "",
		required: true,
		validate: true,
	});
	const hidden = screen.container.querySelector(
		'input[type="hidden"]'
	) as HTMLInputElement;
	fireChange(hidden);
	await expect.element(screen.getByText(/attention/i)).toBeInTheDocument();
});
