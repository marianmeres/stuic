import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import { page, type LocatorSelectors } from "vitest/browser";
import { flushSync } from "svelte";
import AlertConfirmPrompt from "./AlertConfirmPrompt.svelte";
import {
	AlertConfirmPromptStack,
	createAlert,
	createConfirm,
	createPrompt,
} from "./alert-confirm-prompt-stack.svelte.js";

// AlertConfirmPrompt is a stack-driven overlay: it renders nothing until `acp.current`
// is set, at which point a {#if acp?.current} block mounts a <ModalDialog> (native
// <dialog>) and an internal $effect calls modal.open(). open() does
// waitForNextRepaint().then(() => dialog.showModal()) — so the dialog appears
// ASYNCHRONOUSLY. Every presence/absence assertion therefore goes through
// expect.element / expect.poll retries, never a synchronous read.
//
// The stack mutates a $state array that lives OUTSIDE the component (in the
// AlertConfirmPromptStack instance). After calling acp.alert()/confirm()/prompt() we
// flushSync() to push that external reactivity through the component's $effect; the
// retry loop then absorbs the repaint-deferred showModal().
//
// We drive the dialogs through the Promise-based wrappers (createAlert / createConfirm /
// createPrompt). They wire onOk/onCancel/onEscape to call acp.shift() (clearing
// `current`, which closes + unmounts the dialog) and then resolve the promise — so a
// single button click both closes the overlay and settles a value we can await.
//
// Default button labels come from the stack constructor: labelOk="OK", labelCancel=
// "Cancel". The Ok/Cancel buttons are real <button>s (Button.svelte) whose visible text
// is the label, so getByRole("button", { name: /ok/i }) targets them.

// Typed against the locator surface (LocatorSelectors) rather than
// ReturnType<typeof render> — render's result is generic in the component type
// (RenderResult<C>), and only the locator methods are used here.
const okBtn = (screen: LocatorSelectors) => screen.getByRole("button", { name: /^ok$/i });
const cancelBtn = (screen: LocatorSelectors) =>
	screen.getByRole("button", { name: /^cancel$/i });

// ---------------------------------------------------------------- ALERT

test("ALERT: setting acp.current opens the dialog and renders the message", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	// Before anything is pushed, there is no dialog (the {#if acp?.current} guard).
	expect(screen.container.querySelector("dialog")).toBeNull();

	const alert = createAlert(acp);
	// createAlert puts the message into `content`; default title is "Alert".
	void alert("Hello");
	flushSync();

	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect.element(screen.getByText("Hello")).toBeInTheDocument();
	// Alert has exactly one action button: OK (no Cancel).
	await expect.element(okBtn(screen)).toBeInTheDocument();
	await expect.element(cancelBtn(screen)).not.toBeInTheDocument();
});

test("ALERT: the focus trap lands focus on the OK button (only focusable element)", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const alert = createAlert(acp);
	void alert("Hello");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	// ModalDialog applies use:focusTrap{autoFocusFirst:true}; the box div carries no
	// positive tabindex, so the first (and only) focusable descendant in an alert is
	// the OK button — the trap focuses it on open. This is a real, focusable target,
	// not a non-interactive node.
	await expect.element(okBtn(screen)).toHaveFocus();
});

test("ALERT: clicking OK resolves the promise, clears acp.current and closes the dialog", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const alert = createAlert(acp);
	const promise = alert("Done");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	expect(acp.current).toBeTruthy();

	await okBtn(screen).click();

	// The wrapper's onOk resolves the alert promise (with undefined) ...
	await expect(promise).resolves.toBeUndefined();
	// ... shift() emptied the stack ...
	await expect.poll(() => acp.current).toBeUndefined();
	// ... so the dialog unmounts.
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

// ---------------------------------------------------------------- CONFIRM

test("CONFIRM: renders both Cancel and OK buttons", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const confirm = createConfirm(acp);
	void confirm("Sure?");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByText("Sure?")).toBeInTheDocument();
	await expect.element(cancelBtn(screen)).toBeInTheDocument();
	await expect.element(okBtn(screen)).toBeInTheDocument();
});

test("CONFIRM: clicking OK resolves true and closes the dialog", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const confirm = createConfirm(acp);
	const promise = confirm("Proceed?");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	await okBtn(screen).click();

	await expect(promise).resolves.toBe(true);
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("CONFIRM: clicking Cancel resolves false and closes the dialog", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const confirm = createConfirm(acp);
	const promise = confirm("Proceed?");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	await cancelBtn(screen).click();

	await expect(promise).resolves.toBe(false);
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

// ---------------------------------------------------------------- PROMPT

test("PROMPT: renders a text input alongside OK / Cancel", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const prompt = createPrompt(acp);
	void prompt("Name?");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByText("Name?")).toBeInTheDocument();
	// PROMPT mounts a FieldInput -> a real <input type="text"> (role "textbox").
	await expect.element(screen.getByRole("textbox")).toBeInTheDocument();
	await expect.element(okBtn(screen)).toBeInTheDocument();
});

test("PROMPT: filling the input and clicking OK resolves the typed value", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const prompt = createPrompt(acp);
	// default value "" so the input starts empty.
	const promise = prompt("Name?");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const input = screen.getByRole("textbox");
	await input.fill("Marian");
	// The OK handler reads current.value, which is bound to the input via bind:value.
	await okBtn(screen).click();

	await expect(promise).resolves.toBe("Marian");
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("PROMPT: a default value pre-fills the input and resolves unchanged on OK", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const prompt = createPrompt(acp);
	const promise = prompt("Name?", "Anonymous");
	flushSync();

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByRole("textbox")).toHaveValue("Anonymous");

	await okBtn(screen).click();
	await expect(promise).resolves.toBe("Anonymous");
});

// ---------------------------------------------------------------- ESCAPE

test("ESCAPE: pressing Escape on the dialog resolves the confirm wrapper to false and closes", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	const confirm = createConfirm(acp);
	const promise = confirm("Sure?");
	flushSync();

	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	// The Escape listener lives on the <dialog> (ModalDialog's onkeydown handler, keyed
	// off e.key === "Escape"). It runs preEscapeClose -> current.onEscape (the wrapper's,
	// which shifts the stack and resolves false), then closes.
	const el = dialog.element() as HTMLDialogElement;
	el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	await expect(promise).resolves.toBe(false);
	await expect.poll(() => acp.current).toBeUndefined();
	// Re-query via the role locator (it polls the live DOM); wrapping the now-detached
	// `el` in page.elementLocator throws on the removed node.
	await expect.element(dialog).not.toBeInTheDocument();
});

// ---------------------------------------------------------------- STACKING

test("STACK: dismissing the current alert reveals the next queued one without closing", async () => {
	const acp = new AlertConfirmPromptStack();
	const screen = render(AlertConfirmPrompt, { acp });

	// Two plain alerts; their default onOk is acp.shift, so clicking OK advances the
	// stack. Only the head (current) is shown at a time.
	acp.alert("First");
	acp.alert("Second");
	flushSync();

	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect.element(screen.getByText("First")).toBeInTheDocument();
	expect(acp.length).toBe(2);
	const el = dialog.element();

	// Click OK -> shift() drops "First"; acp.current is now "Second" (still truthy), so
	// the component's $effect calls modal.open() again (a no-op while already visible)
	// rather than modal.close() — the {#if acp?.current} guard stays true and the dialog
	// is never torn down. (preClose={() => !acp.length} is the secondary guard that would
	// also veto a close() while length>0, but here close() is never reached.) Current just
	// re-renders with the new head.
	await okBtn(screen).click();

	await expect.poll(() => acp.length).toBe(1);
	await expect.element(screen.getByText("Second")).toBeInTheDocument();
	// Same <dialog> element is still mounted (it was never torn down).
	await expect.element(page.elementLocator(el)).toBeInTheDocument();
});
