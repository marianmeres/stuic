import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import AppShellSimple from "./AppShellSimple.svelte";

// AppShellSimple is a role-less sticky-header shell: header/rail/aside are
// snippet-conditional (rendered only when the snippet prop is passed), while
// <main data-shell="main"> ALWAYS renders and hosts `children`. The regions carry
// no aria roles (except <main>'s implicit role "main"), so we locate them via
// container.querySelector('[data-shell="..."]') and wrap presence/text reads in
// page.elementLocator so they ride the expect.element auto-retry loop (the
// Collapsible/Avatar pattern). Absence is asserted with a synchronous toBeNull()
// (a locator cannot auto-retry toward "not in the document"), but only AFTER an
// awaited expect.element on <main> has proven the component is mounted — so the
// negative reads never run against a not-yet-rendered tree.
//
// The component sets svelte context and reads clientHeight/offsetWidth; it persists
// NO state (no localStorage, no store, no Nav/ThemePreview), so no beforeEach reset
// is needed. It exposes no events, no imperative API, no links and no spies to
// exercise — the contract here is purely structural: which regions exist for a given
// prop set, that children land inside <main>, and that `headerStyle` is forwarded
// verbatim onto the <header> style attribute.

// Static-text children snippet -> a single root element with known text.
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// Locate a data-shell region as an auto-retrying locator (or throw if absent).
function shell(root: ParentNode, name: string) {
	const node = root.querySelector(`[data-shell="${name}"]`);
	if (!node) throw new Error(`missing element for data-shell="${name}"`);
	return page.elementLocator(node);
}

test("only children: <main> renders with the child text; header/rail/aside are absent", async () => {
	const screen = render(AppShellSimple, { children: text("page body") });

	// <main> has the implicit ARIA role "main"; auto-retry proves it is mounted.
	const main = screen.getByRole("main");
	await expect.element(main).toBeInTheDocument();
	await expect.element(main).toHaveAttribute("data-shell", "main");
	await expect.element(main).toHaveTextContent("page body");

	// Mount confirmed above -> the snippet-conditional regions are genuinely absent.
	expect(screen.container.querySelector('[data-shell="header"]')).toBeNull();
	expect(screen.container.querySelector('[data-shell="rail"]')).toBeNull();
	expect(screen.container.querySelector('[data-shell="aside"]')).toBeNull();
});

test('header snippet: <header data-shell="header"> renders with its content', async () => {
	const screen = render(AppShellSimple, {
		header: text("the header"),
		children: text("page body"),
	});

	const header = shell(screen.container, "header");
	await expect.element(header).toBeInTheDocument();
	await expect.element(header).toHaveTextContent("the header");
	// It is the <header> element (not some other tag carrying the marker).
	expect(header.element().tagName).toBe("HEADER");

	// main still renders alongside the header.
	await expect.element(screen.getByRole("main")).toHaveTextContent("page body");
});

test("headerStyle is forwarded verbatim onto the header's style attribute", async () => {
	const screen = render(AppShellSimple, {
		header: text("styled header"),
		headerStyle: "background: red",
		children: text("page body"),
	});

	const header = shell(screen.container, "header");
	await expect.element(header).toBeInTheDocument();
	// `style={headerStyle}` is a full-string binding, so Svelte writes it via
	// setAttribute -> getAttribute returns the raw authored string (not a CSSOM
	// reserialization). toContain tolerates any browser-added trailing semicolon.
	expect(header.element().getAttribute("style") ?? "").toContain("background: red");
});

test('rail snippet: <div data-shell="rail"> renders with its content', async () => {
	const screen = render(AppShellSimple, {
		rail: text("rail content"),
		children: text("page body"),
	});

	const rail = shell(screen.container, "rail");
	await expect.element(rail).toBeInTheDocument();
	await expect.element(rail).toHaveTextContent("rail content");
	expect(rail.element().tagName).toBe("DIV");

	// Mount confirmed -> rail does not imply a header or aside region.
	expect(screen.container.querySelector('[data-shell="header"]')).toBeNull();
	expect(screen.container.querySelector('[data-shell="aside"]')).toBeNull();
});

test('aside snippet: <aside data-shell="aside"> renders with its content', async () => {
	const screen = render(AppShellSimple, {
		aside: text("aside content"),
		children: text("page body"),
	});

	const aside = shell(screen.container, "aside");
	await expect.element(aside).toBeInTheDocument();
	await expect.element(aside).toHaveTextContent("aside content");
	expect(aside.element().tagName).toBe("ASIDE");

	expect(screen.container.querySelector('[data-shell="header"]')).toBeNull();
	expect(screen.container.querySelector('[data-shell="rail"]')).toBeNull();
});

test("all snippets together: header + rail + aside + main all render", async () => {
	const screen = render(AppShellSimple, {
		header: text("H"),
		rail: text("R"),
		aside: text("A"),
		children: text("M"),
	});

	// Each region present with its own content (auto-retried).
	await expect.element(shell(screen.container, "header")).toHaveTextContent("H");
	await expect.element(shell(screen.container, "rail")).toHaveTextContent("R");
	await expect.element(shell(screen.container, "aside")).toHaveTextContent("A");

	const main = screen.getByRole("main");
	await expect.element(main).toBeInTheDocument();
	await expect.element(main).toHaveTextContent("M");
});
