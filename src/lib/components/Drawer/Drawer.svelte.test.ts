import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createRawSnippet } from "svelte";
import Drawer from "./Drawer.svelte";

// Drawer wraps Backdrop: the visible panel is a <div role="dialog" aria-modal="true"> portaled
// inside the .stuic-backdrop root. Like Modal/ModalDialog the panel mounts behind a transition,
// so every visibility assertion uses expect.element (auto-retry) — never a synchronous read.
//
// Wiring confirmed against source (Drawer.svelte / Backdrop.svelte):
//   - onEscape: Backdrop installs the window keydown listener, but ONLY while visible AND
//     onEscape is a function (Backdrop.svelte $effect). So onEscape MUST be passed for the
//     listener to exist; a window Escape keydown then calls it.
//   - onOutside: Drawer forwards `onmousedown={() => onOutside?.()}` to the Backdrop root via
//     {...rest}; the inner panel's own onmousedown calls stopPropagation/stopImmediatePropagation
//     when onOutside is set. So a mousedown that reaches the .stuic-backdrop root fires onOutside,
//     while a mousedown originating on the panel is swallowed and never reaches it.

// A real <button> child so the Backdrop's focus trap has something to auto-focus.
const buttonChild = () =>
	createRawSnippet(() => ({ render: () => `<button>Go</button>` }));

test("visible:true renders the backdrop + a role=dialog panel with aria-modal and children", async () => {
	const screen = render(Drawer, {
		visible: true,
		position: "right",
		children: buttonChild(),
	});

	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	await expect.element(dialog).toHaveAttribute("aria-modal", "true");

	// children render inside the panel
	await expect.element(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();

	// the panel lives inside the Backdrop root
	expect(screen.container.querySelector(".stuic-backdrop")).not.toBeNull();
});

test("the focus trap auto-focuses the button child inside the open Drawer", async () => {
	const screen = render(Drawer, {
		visible: true,
		children: buttonChild(),
	});
	// Backdrop's focus trap is on by default and auto-focuses the first focusable descendant.
	await expect.element(screen.getByRole("button", { name: "Go" })).toHaveFocus();
});

test("visible:false renders no dialog", async () => {
	const screen = render(Drawer, {
		visible: false,
		children: buttonChild(),
	});
	// Backdrop is {#if visible} -> nothing portaled, no dialog, no backdrop root.
	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
	expect(screen.container.querySelector(".stuic-backdrop")).toBeNull();
});

test("labelledby / describedby map to aria-* attributes on the dialog panel", async () => {
	const screen = render(Drawer, {
		visible: true,
		labelledby: "the-title",
		describedby: "the-desc",
		children: buttonChild(),
	});
	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();
	// Drawer wires aria-labelledby={labelledby} / aria-describedby={describedby} on the panel.
	await expect.element(dialog).toHaveAttribute("aria-labelledby", "the-title");
	await expect.element(dialog).toHaveAttribute("aria-describedby", "the-desc");
});

test("onEscape fires on a window Escape keydown while the Drawer is open", async () => {
	const onEscape = vi.fn();
	const screen = render(Drawer, {
		visible: true,
		onEscape,
		children: buttonChild(),
	});

	// Wait until the panel has actually mounted (and thus the Backdrop's window keydown
	// listener is installed) before dispatching.
	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

	// The window keydown listener is installed inside Backdrop's $effect; awaiting the
	// dialog above flushes it, but we still poll (matching Modal/Backdrop) so a one-tick
	// scheduling delay can't flake the spy assertion.
	await expect.poll(() => onEscape.mock.calls.length).toBe(1);
});

test("onOutside fires on a mousedown on the backdrop root", async () => {
	const onOutside = vi.fn();
	const screen = render(Drawer, {
		visible: true,
		onOutside,
		children: buttonChild(),
	});

	await expect.element(screen.getByRole("dialog")).toBeInTheDocument();

	const backdropRoot = screen.container.querySelector(".stuic-backdrop") as HTMLElement;
	expect(backdropRoot).not.toBeNull();

	// wrap the raw backdrop root in a locator (repo idiom) so the role assertion auto-retries
	await expect
		.element(page.elementLocator(backdropRoot))
		.toHaveAttribute("role", "presentation");

	// Drawer forwards onmousedown={() => onOutside?.()} onto this root.
	backdropRoot.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

	expect(onOutside).toHaveBeenCalledOnce();
});

test("a mousedown originating on the panel does NOT fire onOutside (panel stops propagation)", async () => {
	const onOutside = vi.fn();
	const screen = render(Drawer, {
		visible: true,
		onOutside,
		children: buttonChild(),
	});

	const dialog = screen.getByRole("dialog");
	await expect.element(dialog).toBeInTheDocument();

	// A mousedown on the panel would bubble up to the backdrop root, but the panel's own
	// onmousedown calls stopPropagation/stopImmediatePropagation when onOutside is set, so it
	// never reaches the backdrop handler.
	const panel = dialog.element() as HTMLElement;
	panel.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

	expect(onOutside).not.toHaveBeenCalled();
});
