import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Modal from "./Modal.svelte";

// Modal wraps ModalDialog (native <dialog>). It exposes a bindable `visible` prop:
// rendering with visible:true triggers the internal $effect -> modalDialog.open(),
// which itself does waitForNextRepaint().then(() => dialog.showModal()). The open is
// therefore ASYNCHRONOUS — every presence assertion goes through expect.element's
// retry loop, never a synchronous read. `children` is a required Snippet.
//
// A snippet that renders a real <button> gives the focus trap (use:focusTrap on the
// <dialog>, autoFocusFirst=true) a target to land on, so we can assert focus too.
const button = (label: string) =>
	createRawSnippet(() => ({ render: () => `<button>${label}</button>` }));

// Loose text snippets for header/footer.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("visible:true opens the dialog asynchronously and renders children", async () => {
	const screen = render(Modal, { visible: true, children: button("Go") });
	const dialog = screen.getByRole("dialog");
	// expect.element retries absorb the waitForNextRepaint().then(showModal) delay.
	await expect.element(dialog).toBeInTheDocument();
	// The .stuic-modal box renders inside the dialog...
	expect(screen.container.querySelector(".stuic-modal")).not.toBeNull();
	// ...and the children snippet is rendered.
	await expect.element(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
});

test("focus trap moves focus to the first focusable child once open", async () => {
	const screen = render(Modal, { visible: true, children: button("Go") });
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	// use:focusTrap with autoFocusFirst auto-focuses the first focusable descendant.
	await expect.element(screen.getByRole("button", { name: "Go" })).toHaveFocus();
});

test("header / footer snippets render their content", async () => {
	const screen = render(Modal, {
		visible: true,
		children: button("Go"),
		header: text("Modal title"),
		footer: text("Modal actions"),
	});
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	await expect.element(screen.getByText("Modal title")).toBeInTheDocument();
	await expect.element(screen.getByText("Modal actions")).toBeInTheDocument();
});

test("labelledby / describedby map to aria-* attributes on the dialog", async () => {
	const screen = render(Modal, {
		visible: true,
		children: button("Go"),
		labelledby: "the-title",
		describedby: "the-desc",
	});
	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect.element(dialog).toHaveAttribute("aria-labelledby", "the-title");
	await expect.element(dialog).toHaveAttribute("aria-describedby", "the-desc");
});

test("Escape calls onEscape and closes the dialog", async () => {
	const onEscape = vi.fn();
	const screen = render(Modal, { visible: true, children: button("Go"), onEscape });
	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	// Opening alone must not fire onEscape (guards against spurious wiring on mount).
	expect(onEscape).not.toHaveBeenCalled();

	// The escape listener lives on the <dialog> (onkeydown={_onEscapeKeydown}), keyed off
	// e.key === "Escape". It runs preEscapeClose (-> Modal.handlePreEscapeClose -> onEscape)
	// then close(), which sets visible=false and removes the dialog ({#if visible}).
	const el = dialog.element() as HTMLDialogElement;
	el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	await expect.poll(() => onEscape.mock.calls.length).toBe(1);
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("escaped key other than Escape neither fires onEscape nor closes", async () => {
	const onEscape = vi.fn();
	const screen = render(Modal, { visible: true, children: button("Go"), onEscape });
	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	const el = dialog.element() as HTMLDialogElement;
	el.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));

	// The handler bails out before any async work for non-Escape keys, so onEscape is
	// never scheduled. Re-query through the role tree (not the cached element) to prove the
	// dialog is genuinely still mounted/open rather than just re-asserting a stale ref.
	expect(onEscape).not.toHaveBeenCalled();
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
	expect(onEscape).not.toHaveBeenCalled();
});
