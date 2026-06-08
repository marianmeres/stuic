import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, vi } from "vitest";
import FieldKeyValues from "./FieldKeyValues.svelte";

// FieldKeyValues wraps InputWrap (→ the <div class="stuic-input" data-size> shell), but
// unlike FieldInput/FieldTextarea it manages a *list* of key/value entries and serializes
// them to a JSON object string carried by a HIDDEN <input type="hidden"> (default "{}")
// for form participation. The visible UI per entry is a key <input type="text">
// (placeholder "Key") + a value <textarea> (placeholder "Value") + a remove <button>;
// plus a single "Add" button. Empty state renders "No entries".
//
// The high-yield, browser-only contracts:
//   - initial parse: value='{"a":1}' -> one entry rendered with key "a" / value "1"
//   - the bound-value round-trip: visible oninput -> updateEntry -> syncToValue sets the
//     bound value AND (after a tick) dispatches a `change` on the hidden input, so the
//     hidden input's serialized value updates (effect/tick-driven -> assert with retries)
//   - add / remove mutate that serialized hidden value
//   - data-size on the .stuic-input shell
//   - validation: the wrapped customValidator runs on the hidden input's `change` and
//     surfaces in the .validation-box (duplicate keys / required-with-no-entries)
//
// NOTE: the <label for={id}> points at the InputWrap *wrapper* id, not at any visible
// control, so getByLabelText does NOT find a usable input here — we locate the visible
// controls by placeholder/role per the component's actual a11y contract.

function wrap(container: HTMLElement) {
	const el = container.querySelector(".stuic-input");
	if (!el) throw new Error("missing .stuic-input wrapper");
	return page.elementLocator(el);
}

// The serialized bound value lives on the hidden input; syncToValue() updates it after a
// tick, so read it through a poll-friendly getter.
function hiddenValue(container: HTMLElement) {
	const el = container.querySelector<HTMLInputElement>('input[type="hidden"]');
	if (!el) throw new Error("missing hidden input");
	return el.value;
}

test("renders the stuic-input shell (data-size=sm default) with the hidden input defaulting to {}", async () => {
	// renderSize defaults to "sm" for this component (see Props default)
	const screen = await render(FieldKeyValues, { name: "kv", value: "{}" });
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "sm");
	await expect.poll(() => hiddenValue(screen.container)).toBe("{}");
});

test("renderSize maps through to the shell data-size", async () => {
	const screen = await render(FieldKeyValues, {
		name: "kv",
		value: "{}",
		renderSize: "lg",
	});
	await expect.element(wrap(screen.container)).toHaveAttribute("data-size", "lg");
});

test("empty value shows the 'No entries' empty state and only the Add button", async () => {
	const screen = await render(FieldKeyValues, { name: "kv", value: "{}" });
	await expect.element(screen.getByText("No entries")).toBeInTheDocument();
	await expect.element(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
	// no entry rows yet -> no Key input, no remove button
	expect(screen.container.querySelector('input[placeholder="Key"]')).toBeNull();
});

test("initial parse: value='{\"a\":1}' renders one entry with key 'a' and value '1'", async () => {
	const screen = await render(FieldKeyValues, { name: "kv", value: '{"a":1}' });
	// the key input is single-line text, the value control is a textarea
	await expect.element(screen.getByPlaceholder("Key")).toHaveValue("a");
	// 1 is not a string, so it is JSON.stringify'd to "1" for display
	await expect.element(screen.getByPlaceholder("Value")).toHaveValue("1");
	// a remove button exists for the entry
	await expect
		.element(screen.getByRole("button", { name: /remove entry/i }))
		.toBeInTheDocument();
});

test("add + edit round-trip: filling key/value serializes to the hidden input", async () => {
	const onChange = vi.fn();
	const screen = await render(FieldKeyValues, { name: "kv", value: "{}", onChange });

	// empty -> click Add -> a Key input + Value textarea appear
	await screen.getByRole("button", { name: "Add" }).click();
	const key = screen.getByPlaceholder("Key");
	const valuee = screen.getByPlaceholder("Value");
	await expect.element(key).toBeInTheDocument();
	await expect.element(valuee).toBeInTheDocument();

	// fill the entry; oninput -> updateEntry -> syncToValue. "bar" does not look like
	// JSON (no leading { or [) so parseJsonValue keeps it as the plain string "bar".
	await key.fill("foo");
	await valuee.fill("bar");

	// the serialized hidden value is effect/tick-driven -> poll until it settles
	await expect.poll(() => hiddenValue(screen.container)).toBe('{"foo":"bar"}');
	// onChange is invoked with the serialized value
	expect(onChange).toHaveBeenCalledWith('{"foo":"bar"}');
});

test("remove: deleting the only entry resets the hidden value back to {}", async () => {
	const screen = await render(FieldKeyValues, { name: "kv", value: '{"a":"b"}' });
	// sanity: starts populated
	await expect.element(screen.getByPlaceholder("Key")).toHaveValue("a");
	await expect.poll(() => hiddenValue(screen.container)).toBe('{"a":"b"}');

	await screen.getByRole("button", { name: /remove entry/i }).click();

	// back to the empty state and the empty serialized value
	await expect.poll(() => hiddenValue(screen.container)).toBe("{}");
	await expect.element(screen.getByText("No entries")).toBeInTheDocument();
});

test("custom addLabel / emptyMessage / placeholders map through", async () => {
	const screen = await render(FieldKeyValues, {
		name: "kv",
		value: "{}",
		addLabel: "Add pair",
		emptyMessage: "Nothing here",
		keyPlaceholder: "K",
		valuePlaceholder: "V",
	});
	await expect.element(screen.getByText("Nothing here")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Add pair" }))
		.toBeInTheDocument();

	await screen.getByRole("button", { name: "Add pair" }).click();
	await expect.element(screen.getByPlaceholder("K")).toBeInTheDocument();
	await expect.element(screen.getByPlaceholder("V")).toBeInTheDocument();
});

test("validation: duplicate keys surface 'Duplicate keys are not allowed' in the validation box", async () => {
	// Two entries with the same key. serializeValue collapses them in the JSON object,
	// but the wrapped validator inspects the `entries` array directly, so it sees the
	// duplicate. Validation runs when syncToValue dispatches `change` on the hidden input.
	const screen = await render(FieldKeyValues, { name: "kv", value: "{}" });

	await screen.getByRole("button", { name: "Add" }).click();
	await screen.getByRole("button", { name: "Add" }).click();

	// scope to this render's container (not page-global) so the two key inputs we
	// target are unambiguously the ones from this mount
	const keys = screen.getByPlaceholder("Key");
	// fill both key inputs with the same key -> duplicate
	await keys.nth(0).fill("dup");
	await keys.nth(1).fill("dup");

	await expect
		.element(screen.getByText("Duplicate keys are not allowed"))
		.toBeInTheDocument();
});

test("validation: required with no non-empty keys surfaces 'At least one entry is required'", async () => {
	const screen = await render(FieldKeyValues, {
		name: "kv",
		value: "{}",
		required: true,
	});
	// Add an entry but leave the key empty -> no non-empty keys.
	await screen.getByRole("button", { name: "Add" }).click();
	// Type into the value so syncToValue fires `change` on the hidden input and runs the
	// validator while there is still no non-empty key.
	await screen.getByPlaceholder("Value").fill("orphan");

	await expect
		.element(screen.getByText("At least one entry is required"))
		.toBeInTheDocument();
});
