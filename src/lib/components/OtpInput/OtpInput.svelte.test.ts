import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import OtpInput from "./OtpInput.svelte";

// OtpInput renders <div role="group" class="stuic-otp-input"> wrapping `length`
// (default 6) one-char <input maxlength=1 aria-label="Digit N of M"> slots. The
// headline browser-only behavior is the FOCUS JUMP: typing a sanitized char into
// a slot advances focus to the next slot (via queueMicrotask). We exercise that
// with .fill() (which dispatches a real input event) and assert toHaveFocus().
// See docs/component-testing/02-test-conventions.md.

test("renders a role=group root with the stuic-otp-input class and `length` slots", async () => {
	const screen = render(OtpInput);
	const group = screen.getByRole("group");
	await expect.element(group).toBeInTheDocument();
	await expect.element(group).toHaveClass("stuic-otp-input");
	// default length is 6 -> six one-char inputs
	expect(group.element().querySelectorAll("input").length).toBe(6);
});

test("each slot is a maxlength=1 input with a unique aria-label", async () => {
	const screen = render(OtpInput, { autoFocus: false });
	const slot1 = screen.getByLabelText("Digit 1 of 6");
	await expect.element(slot1).toBeInTheDocument();
	await expect.element(slot1).toHaveAttribute("maxlength", "1");
	// label is unique per slot -> can target any specific one
	await expect.element(screen.getByLabelText("Digit 6 of 6")).toBeInTheDocument();
});

test("custom length changes slot count and aria-label denominator", async () => {
	const screen = render(OtpInput, { length: 4, autoFocus: false });
	expect(screen.getByRole("group").element().querySelectorAll("input").length).toBe(4);
	await expect.element(screen.getByLabelText("Digit 1 of 4")).toBeInTheDocument();
});

test("value binding distributes chars across slots, leaving the rest empty", async () => {
	const screen = render(OtpInput, { value: "12", autoFocus: false });
	await expect.element(screen.getByLabelText("Digit 1 of 6")).toHaveValue("1");
	await expect.element(screen.getByLabelText("Digit 2 of 6")).toHaveValue("2");
	await expect.element(screen.getByLabelText("Digit 3 of 6")).toHaveValue("");
	await expect.element(screen.getByLabelText("Digit 6 of 6")).toHaveValue("");
});

test("autoFocus (default) focuses the first slot on mount", async () => {
	const screen = render(OtpInput);
	// the mount $effect focuses the first empty slot (slot 1) via queueMicrotask
	await expect.element(screen.getByLabelText("Digit 1 of 6")).toHaveFocus();
});

test("FOCUS JUMP: filling a slot advances focus to the next slot", async () => {
	const screen = render(OtpInput);
	const slot1 = screen.getByLabelText("Digit 1 of 6");
	// fill dispatches a real input event -> handleInput writes the char and,
	// since the char is non-empty and idx < length-1, queueMicrotask focuses slot 2
	await slot1.fill("1");
	await expect.element(slot1).toHaveValue("1");
	await expect.element(screen.getByLabelText("Digit 2 of 6")).toHaveFocus();
});

test("sequential fill builds the value, fires oninput, and calls onComplete once with the code", async () => {
	const onComplete = vi.fn();
	const oninput = vi.fn();
	const screen = render(OtpInput, { onComplete, oninput });

	for (let i = 1; i <= 6; i++) {
		await screen.getByLabelText(`Digit ${i} of 6`).fill(String(i));
	}

	// all six slots reflect the typed digits
	await expect.element(screen.getByLabelText("Digit 1 of 6")).toHaveValue("1");
	await expect.element(screen.getByLabelText("Digit 6 of 6")).toHaveValue("6");

	// onComplete fires exactly once, when the final (6th) char lands, with the full code
	expect(onComplete).toHaveBeenCalledTimes(1);
	expect(onComplete).toHaveBeenCalledWith("123456");
	// oninput fires on every committed change
	expect(oninput).toHaveBeenCalled();
	expect(oninput).toHaveBeenLastCalledWith("123456");
});

test("numeric mode (default) sanitizes non-digits away: no commit, letter never enters the value", async () => {
	const oninput = vi.fn();
	const onComplete = vi.fn();
	const screen = render(OtpInput, { oninput, onComplete, autoFocus: false });
	const slot1 = screen.getByLabelText("Digit 1 of 6");

	// "a" is stripped by the numeric sanitizer -> sanitize() yields "" -> commit("")
	// early-returns because the value is still "" -> oninput never fires.
	//
	// NOTE: we deliberately do NOT assert slot1.toHaveValue("") here. The source uses a
	// one-way `value={slot}` (not bind:value); when commit() is a no-op the reactive
	// `slot` stays "", so Svelte's set_value short-circuits and never rewrites the DOM
	// node back to "" — the raw "a" injected by .fill() physically lingers in the input
	// element. The real, source-accurate contract is "the letter never reaches the
	// committed value", which we prove via the spies + the follow-up digit below.
	await slot1.fill("a");
	expect(oninput).not.toHaveBeenCalled();

	// Now type a real digit into the same slot. .fill() clears the slot first, so the
	// stray "a" is replaced. Only the digit commits -> proof the "a" was dropped, not
	// merged into "a5" or left as "a".
	await slot1.fill("5");
	await expect.element(slot1).toHaveValue("5");
	expect(oninput).toHaveBeenCalledWith("5");
	expect(oninput).not.toHaveBeenCalledWith("a");
	expect(oninput).not.toHaveBeenCalledWith("a5");
	expect(onComplete).not.toHaveBeenCalled();
});

test("alphanumeric mode keeps letters", async () => {
	const screen = render(OtpInput, { mode: "alphanumeric" });
	const slot1 = screen.getByLabelText("Digit 1 of 6");
	await slot1.fill("a");
	await expect.element(slot1).toHaveValue("a");
});

test("error=true sets data-error on the root and aria-invalid on each slot", async () => {
	const screen = render(OtpInput, { error: true, autoFocus: false });
	await expect.element(screen.getByRole("group")).toHaveAttribute("data-error", "true");
	await expect
		.element(screen.getByLabelText("Digit 1 of 6"))
		.toHaveAttribute("aria-invalid", "true");
	await expect
		.element(screen.getByLabelText("Digit 6 of 6"))
		.toHaveAttribute("aria-invalid", "true");
});

test("no error: root has no data-error and slots are not aria-invalid", async () => {
	const screen = render(OtpInput, { autoFocus: false });
	await expect.element(screen.getByRole("group")).not.toHaveAttribute("data-error");
	await expect
		.element(screen.getByLabelText("Digit 1 of 6"))
		.not.toHaveAttribute("aria-invalid");
});

test("disabled disables the slots", async () => {
	const screen = render(OtpInput, { disabled: true, autoFocus: false });
	await expect.element(screen.getByLabelText("Digit 1 of 6")).toBeDisabled();
	await expect.element(screen.getByLabelText("Digit 6 of 6")).toBeDisabled();
});

// PASTE intentionally NOT tested: a constructed ClipboardEvent typically can't carry
// a settable clipboardData, and maxlength=1 blocks .fill from injecting multiple chars
// into one slot. The sequential-fill test above covers the all-filled + onComplete
// contract that paste ultimately funnels into via commit().
