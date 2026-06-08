import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import FieldObject from "./FieldObject.svelte";

// FieldObject is a complex member of the Field* family. Like the others it wraps
// InputWrap (the <div class="stuic-input" data-size> shell + <label for={id}>), and
// it keeps a HIDDEN <input type="hidden"> that carries the serialized JSON value for
// form participation. Unlike FieldInput there is NO visible text input: a VIEW mode
// renders the parsed object as a read-only key/value tree plus one toggle <button>
// (pencil, tooltip "Edit JSON"); clicking the toggle swaps in a <textarea bind:value>
// (check icon, tooltip "Apply"). The high-yield contracts:
//   - VIEW renders keys + primitive values as text
//   - the toggle flips VIEW <-> EDIT and surfaces the <textarea>
//   - editing the textarea round-trips through bind:value to the hidden input
//   - Apply with valid JSON returns to VIEW; invalid JSON keeps EDIT + shows the box
//   - the data-size shell maps through `renderSize`
//
// The textarea is the bound value's editing surface: `bind:value` updates the bound
// `value`, and the hidden input's `{value}` is the same reactive `value` — so the
// hidden input updates after the framework flushes (assert via expect.poll).

// The hidden input carries the bound value via `{value}`; reading it back is the
// observable form contract (what a consumer's <form> submits).
function hidden(container: HTMLElement) {
	const el = container.querySelector('input[type="hidden"]');
	if (!el) throw new Error("missing hidden input");
	return el as HTMLInputElement;
}

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

test("VIEW mode renders the parsed object as a read-only key/value tree", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice","age":30}',
	});
	// keys and primitive values render as text
	await expect.element(screen.getByText("name")).toBeInTheDocument();
	await expect.element(screen.getByText("Alice")).toBeInTheDocument();
	await expect.element(screen.getByText("age")).toBeInTheDocument();
	await expect.element(screen.getByText("30")).toBeInTheDocument();
	// the hidden input carries the serialized value
	await expect
		.poll(() => hidden(screen.container).value)
		.toBe('{"name":"Alice","age":30}');
});

test("VIEW mode exposes exactly one button (the edit toggle)", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice","age":30}',
	});
	// the only interactive button in VIEW is the toggle
	await expect.element(screen.getByRole("button")).toBeInTheDocument();
});

test("data-size on the stuic-input shell maps through renderSize", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: "{}",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("clicking the toggle enters EDIT mode and surfaces a textarea of pretty-printed JSON", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice","age":30}',
	});
	// VIEW mode has no editable surface (the hidden input is type=hidden, not a textbox)
	await expect.element(screen.getByRole("textbox")).not.toBeInTheDocument();
	await screen.getByRole("button").click();
	// EDIT mode swaps in a <textarea bind:value> (role "textbox")
	const textarea = screen.getByRole("textbox");
	await expect.element(textarea).toBeInTheDocument();
	// the textarea holds the pretty-printed JSON of the object (contains the value)
	await expect
		.poll(() => (textarea.element() as HTMLTextAreaElement).value)
		.toContain("Alice");
});

test("editing the textarea round-trips through bind:value to the hidden input", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice","age":30}',
	});
	await screen.getByRole("button").click();
	const textarea = screen.getByRole("textbox");
	await textarea.fill('{"x":1}');
	// bind:value updates the bound value; the hidden input mirrors it reactively
	await expect.poll(() => hidden(screen.container).value).toBe('{"x":1}');
});

test("Apply with valid JSON returns to VIEW mode showing the new tree", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice","age":30}',
	});
	// enter EDIT
	await screen.getByRole("button").click();
	const textarea = screen.getByRole("textbox");
	await textarea.fill('{"x":1}');
	await expect.poll(() => hidden(screen.container).value).toBe('{"x":1}');
	// Apply (toggle again) — valid JSON -> back to VIEW with the new key/value
	await screen.getByRole("button").click();
	await expect.element(screen.getByText("x")).toBeInTheDocument();
	await expect.element(screen.getByText("1")).toBeInTheDocument();
});

test("Apply with invalid JSON stays in EDIT mode and renders the validation message", async () => {
	const screen = await render(FieldObject, {
		name: "obj",
		value: '{"name":"Alice"}',
	});
	// enter EDIT
	await screen.getByRole("button").click();
	const textarea = screen.getByRole("textbox");
	await textarea.fill("{not valid json");
	// Apply — invalid JSON keeps EDIT mode and shows the built-in message
	await screen.getByRole("button").click();
	await expect.element(screen.getByText(/attention/i)).toBeInTheDocument();
	// still in EDIT mode: the textarea is still present
	await expect.element(screen.getByRole("textbox")).toBeInTheDocument();
});
