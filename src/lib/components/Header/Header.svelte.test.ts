import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Header from "./Header.svelte";

// Header has no transition on its root, so the root <header> is present
// synchronously after render — a direct container query is reliable here
// (no need for the auto-retrying expect.element used by transitioned panels).
//
// The `safeArea` prop mirrors the established data-* toggle convention
// (data-fixed / data-collapsed): it sets an empty-string [data-safe-area]
// attribute on the root <header> when `!unstyled && safeArea`, which the
// (display-mode: standalone|fullscreen) CSS then keys off. The env()/media CSS
// effect itself cannot be exercised in this harness (no installed-PWA context,
// component CSS isn't loaded in browser tests) — only the attribute wiring is.
const root = (screen: { container: HTMLElement }) =>
	screen.container.querySelector("header") as HTMLElement;

test("safeArea:true sets an empty [data-safe-area] on the root header", () => {
	const screen = render(Header, { safeArea: true });
	const header = root(screen);
	expect(header).not.toBeNull();
	expect(header.hasAttribute("data-safe-area")).toBe(true);
	expect(header.getAttribute("data-safe-area")).toBe("");
});

test("safeArea defaults off — no [data-safe-area] attribute", () => {
	const screen = render(Header, {});
	expect(root(screen).hasAttribute("data-safe-area")).toBe(false);
});

test("unstyled suppresses [data-safe-area] even when safeArea:true", () => {
	const screen = render(Header, { safeArea: true, unstyled: true });
	expect(root(screen).hasAttribute("data-safe-area")).toBe(false);
});

test("safeArea and fixed are independent — each toggles its own data-* attribute", () => {
	const screen = render(Header, { safeArea: true, fixed: false });
	const header = root(screen);
	expect(header.hasAttribute("data-safe-area")).toBe(true);
	expect(header.hasAttribute("data-fixed")).toBe(false);
});
