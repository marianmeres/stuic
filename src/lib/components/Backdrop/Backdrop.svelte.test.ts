import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createRawSnippet } from "svelte";
import Backdrop from "./Backdrop.svelte";

// Backdrop is the portal primitive under Modal/Drawer: when `visible`, it renders a
// <div role="presentation" tabindex="-1" class="stuic-backdrop"> with a focus trap, locks body
// scroll, fires onBackdropClick on a mousedown whose target is the root itself (not a child),
// and — only when an onEscape prop is supplied so the window listener installs — fires onEscape
// on a topmost Escape keydown. It has a bindable `visible`, so we render with visible:true to
// open it. We never flip `visible` after mount (that needs a fixture) — the false case is a
// separate render.
//
// IMPORTANT locator note: the root carries role="presentation" AND tabindex="-1". Per the ARIA
// presentation-conflict-resolution rule, a focusable element (tabindex makes it focusable)
// cannot be presentational, so the accessibility tree computes NO role for this <div> — it is
// NOT queryable via getByRole("presentation"). We therefore locate the root by its base class
// (.stuic-backdrop) and wrap the raw node in a Locator (page.elementLocator) so DOM assertions
// auto-retry, mirroring the Drawer test's treatment of the same root. We still assert the
// role="presentation" *attribute* explicitly (it's a real authored contract).

// A real <button> child so the focus trap has something focusable to auto-focus on mount.
const buttonChild = () =>
	createRawSnippet(() => ({
		render: () => `<button data-testid="child">Go</button>`,
	}));

// Locate the backdrop root by base class and wrap it in a retrying Locator.
const backdropRoot = (container: Element) =>
	container.querySelector(".stuic-backdrop") as HTMLElement | null;

test("renders the stuic-backdrop root with role=presentation and tabindex=-1 when visible", async () => {
	const screen = render(Backdrop, { visible: true });
	const root = backdropRoot(screen.container);
	expect(root).not.toBeNull();
	const loc = page.elementLocator(root!);
	await expect.element(loc).toBeInTheDocument();
	await expect.element(loc).toHaveClass("stuic-backdrop");
	await expect.element(loc).toHaveAttribute("role", "presentation");
	await expect.element(loc).toHaveAttribute("tabindex", "-1");
});

test("renders nothing when visible is false", async () => {
	const screen = render(Backdrop, { visible: false });
	// {#if visible} is false -> no backdrop root in the DOM at all.
	expect(backdropRoot(screen.container)).toBeNull();
});

test("renders children inside the backdrop and the focus trap auto-focuses the child", async () => {
	const screen = render(Backdrop, { visible: true, children: buttonChild() });
	// The child lives inside the backdrop root...
	const child = screen.getByTestId("child");
	await expect.element(child).toBeInTheDocument();
	expect(screen.container.querySelector(".stuic-backdrop button")).not.toBeNull();
	// ...and the focus trap auto-focuses the first focusable element on mount.
	await expect.element(child).toHaveFocus();
});

test("onBackdropClick fires on a mousedown whose target IS the backdrop root", async () => {
	const onBackdropClick = vi.fn();
	const screen = render(Backdrop, { visible: true, onBackdropClick });
	const root = backdropRoot(screen.container);
	// Make sure the root has actually mounted before we dispatch.
	await expect.element(page.elementLocator(root!)).toBeInTheDocument();
	// Dispatching directly on the root makes e.target === el -> handler fires.
	root!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
	expect(onBackdropClick).toHaveBeenCalledOnce();
});

test("onBackdropClick does NOT fire when the mousedown target is a child (e.target !== root)", async () => {
	const onBackdropClick = vi.fn();
	const screen = render(Backdrop, {
		visible: true,
		onBackdropClick,
		children: buttonChild(),
	});
	const child = screen.getByTestId("child");
	await expect.element(child).toBeInTheDocument();
	const childEl = child.element() as HTMLElement;
	// Event bubbles to the root listener, but e.target is the child -> guard skips it.
	childEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
	expect(onBackdropClick).not.toHaveBeenCalled();
});

test("onEscape fires on a window Escape keydown (listener installs because onEscape is provided)", async () => {
	const onEscape = vi.fn();
	const screen = render(Backdrop, { visible: true, onEscape });
	// Wait until the root has mounted (and thus the window keydown listener's $effect has run)
	// before dispatching — same gate the Drawer test uses for its Escape assertion.
	await expect
		.element(page.elementLocator(backdropRoot(screen.container)!))
		.toBeInTheDocument();
	// The keydown listener lives on window and only exists because onEscape was passed.
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	expect(onEscape).toHaveBeenCalledOnce();
});

test("a non-Escape window keydown does not fire onEscape", async () => {
	const onEscape = vi.fn();
	const screen = render(Backdrop, { visible: true, onEscape });
	// Gate on mount so the listener is genuinely installed; this makes the negative meaningful
	// (the listener exists and still ignores a non-Escape key) rather than passing because the
	// listener simply wasn't there yet.
	await expect
		.element(page.elementLocator(backdropRoot(screen.container)!))
		.toBeInTheDocument();
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
	expect(onEscape).not.toHaveBeenCalled();
});

test("onEscape does NOT fire when the keydown was already handled (defaultPrevented)", async () => {
	const onEscape = vi.fn();
	const screen = render(Backdrop, { visible: true, onEscape });
	await expect
		.element(page.elementLocator(backdropRoot(screen.container)!))
		.toBeInTheDocument();
	// Source guard: `if (e.defaultPrevented) return;` — a nested overlay that already consumed
	// the Escape marks the event handled, so the Backdrop must not double-fire onEscape.
	const e = new KeyboardEvent("keydown", {
		key: "Escape",
		bubbles: true,
		cancelable: true,
	});
	e.preventDefault();
	window.dispatchEvent(e);
	expect(onEscape).not.toHaveBeenCalled();
});

test("firing Escape with onEscape omitted is a harmless no-op (no listener installed)", async () => {
	// Source guard in the $effect: `if (!visible || typeof onEscape !== 'function') return;`
	// With no onEscape the window keydown $effect bails, so no listener exists. We can't assert a
	// spy here; this is a smoke contract that the omitted-callback path neither throws nor mutates
	// visibility (Backdrop has no internal Escape->close wiring — close is caller-driven).
	const screen = render(Backdrop, { visible: true });
	const root = backdropRoot(screen.container);
	await expect.element(page.elementLocator(root!)).toBeInTheDocument();
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	await expect.element(page.elementLocator(root!)).toBeInTheDocument();
});
