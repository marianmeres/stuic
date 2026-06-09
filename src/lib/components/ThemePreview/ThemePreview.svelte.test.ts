import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import ThemePreview from "./ThemePreview.svelte";

// ThemePreview is a heavy presentational design-token showcase (it mounts Nav,
// Buttons, Switches, FieldInput, FieldCheckbox, DismissibleMessage). The
// BEHAVIORAL contracts worth asserting are the snippet overrides (header /
// sidebar / footer REPLACE their defaults) and the boolean toggles
// (showLabels / showInputs / compact). The root <div class="stuic-theme-preview">
// has no ARIA role, so we locate it by its base class and wrap with
// page.elementLocator (the Card/Avatar pattern). Because the test env loads NO
// component/Tailwind CSS, we assert presence/text and the single spacing token
// the component emits directly (p-4 / p-2) — never computed styles.
//
// The default sidebar renders a Nav whose persistState defaults TRUE, so it
// reads/writes localStorage. We clear it before each test so the Nav's group
// expand/collapse state is deterministic (and the activeId="dashboard"
// auto-expand is what surfaces "Dashboard", not stale stored state).
beforeEach(() => localStorage.clear());

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-theme-preview");
	if (!el) throw new Error("missing .stuic-theme-preview root");
	return page.elementLocator(el);
}

test("renders the root <div class=stuic-theme-preview> with default p-4 spacing", async () => {
	const { container } = render(ThemePreview);
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-theme-preview");
	// compact defaults false -> "gap-4 p-4" spacing tokens are emitted directly.
	await expect.element(root).toHaveClass("p-4");
});

test("default header renders the 'Theme Preview' h1", async () => {
	const screen = render(ThemePreview);
	const heading = screen.getByRole("heading", { level: 1, name: "Theme Preview" });
	await expect.element(heading).toBeInTheDocument();
	await expect.element(heading).toHaveTextContent("Theme Preview");
});

test("header snippet REPLACES the default header: custom text shows, 'Theme Preview' is gone", async () => {
	const { container } = render(ThemePreview, {
		header: text("Custom Header"),
	});
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Custom Header")).toBeInTheDocument();
	// The override means the default <h1>Theme Preview</h1> is never rendered.
	await expect
		.element(screen.getByRole("heading", { level: 1, name: "Theme Preview" }))
		.not.toBeInTheDocument();
});

test("footer snippet REPLACES the default footer: custom text shows, default footer text is gone", async () => {
	const { container } = render(ThemePreview, {
		footer: text("Custom Footer"),
	});
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Custom Footer")).toBeInTheDocument();
	// Default footer renders "Theme tokens demonstration" — the override drops it.
	await expect
		.element(screen.getByText("Theme tokens demonstration"))
		.not.toBeInTheDocument();
});

test("showLabels defaults true -> .section-label headings exist (e.g. 'Inputs')", async () => {
	const { container } = render(ThemePreview);
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Inputs")).toBeInTheDocument();
	// And at least one section-label is in the DOM.
	expect(container.querySelector(".section-label")).not.toBeNull();
});

test("showLabels=false removes every .section-label heading", async () => {
	const { container } = render(ThemePreview, { showLabels: false });
	// Wait for the root to mount, then assert no section labels exist at all.
	await expect.element(rootLocator(container)).toBeInTheDocument();
	expect(container.querySelector(".section-label")).toBeNull();
});

test("showInputs defaults true -> the 'Hey ho' FieldCheckbox renders", async () => {
	const { container } = render(ThemePreview);
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Hey ho")).toBeInTheDocument();
});

test("showInputs=false removes the Inputs section (no 'Hey ho' checkbox)", async () => {
	const { container } = render(ThemePreview, { showInputs: false });
	const screen = page.elementLocator(container);
	// Mount the root first, then assert the Inputs-only checkbox is absent.
	await expect.element(rootLocator(container)).toBeInTheDocument();
	await expect.element(screen.getByText("Hey ho")).not.toBeInTheDocument();
});

test("compact=true switches the root spacing token from p-4 to p-2", async () => {
	const { container } = render(ThemePreview, { compact: true });
	const root = rootLocator(container);
	await expect.element(root).toHaveClass("p-2");
	await expect.element(root).not.toHaveClass("p-4");
});

test("default sidebar Nav auto-expands the active group -> 'Dashboard' renders without a click", async () => {
	const { container } = render(ThemePreview);
	const screen = page.elementLocator(container);
	// activeId="dashboard" matches an item in the "Navigation" group, so the group
	// auto-expands and the "Dashboard" leaf renders. Auto-retry tolerates the Nav's
	// slide transition. Kept tolerant: just assert the label is present.
	await expect.element(screen.getByText("Dashboard")).toBeInTheDocument();
});

test("sidebar snippet REPLACES the default sidebar (its v1.0.0 footer is gone)", async () => {
	const { container } = render(ThemePreview, {
		sidebar: text("Custom Sidebar"),
	});
	const screen = page.elementLocator(container);
	await expect.element(screen.getByText("Custom Sidebar")).toBeInTheDocument();
	// Default sidebar renders a "v1.0.0" footer span — the override removes it.
	await expect.element(screen.getByText("v1.0.0")).not.toBeInTheDocument();
});
