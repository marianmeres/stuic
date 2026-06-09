import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import AppShell from "./AppShell.svelte";

// AppShell is a slot-driven application shell. Every region is a Snippet prop and
// renders ONLY when provided, except content/page/page-main which ALWAYS render.
// There are no events and no imperative API to exercise here, so we drive it purely
// through snippet props (createRawSnippet) and assert the data-shell region contracts:
//   - the always-present regions exist (content / page / <main data-shell="page-main">);
//   - each conditional region (rail/header/sidebar-left/page-header/page-footer/
//     sidebar-right/footer) is present iff its snippet is passed, and absent otherwise;
//   - children render INSIDE page-main (getByRole("main"));
//   - pageFlexGrow maps to the emitted flex token on data-shell="page".
// Most regions are not landmark-named, so we locate them via
// screen.container.querySelector('[data-shell="..."]') and assert null vs non-null.
// The query reads are synchronous, but AppShell has no async/reactive open/close
// transitions — regions are static for a given set of props — so a direct read after
// render is deterministic here; text/visibility assertions still go through
// expect.element auto-retry.

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

// Convenience: the conditional regions, by their data-shell marker.
const CONDITIONAL_REGIONS = [
	"rail",
	"header",
	"sidebar-left",
	"page-header",
	"page-footer",
	"sidebar-right",
	"footer",
] as const;

test("only children: always-present regions render, every conditional region is absent", async () => {
	const screen = render(AppShell, { children: text("page body") });

	// Root shell with default id and the data-shell marker.
	const shell = screen.container.querySelector('[data-shell="shell"]');
	expect(shell).not.toBeNull();
	expect(shell!.id).toBe("shell");

	// Always-present regions.
	expect(screen.container.querySelector('[data-shell="content"]')).not.toBeNull();
	expect(screen.container.querySelector('[data-shell="page"]')).not.toBeNull();
	const main = screen.getByRole("main");
	await expect.element(main).toBeInTheDocument();

	// page-main is the <main> and holds the children content.
	const mainEl = screen.container.querySelector('[data-shell="page-main"]');
	expect(mainEl).not.toBeNull();
	expect(mainEl!.tagName).toBe("MAIN");
	await expect.element(main).toHaveTextContent("page body");

	// No conditional region is rendered when its snippet is not provided.
	for (const region of CONDITIONAL_REGIONS) {
		expect(screen.container.querySelector(`[data-shell="${region}"]`)).toBeNull();
	}
});

test("id prop overrides the shell element id", async () => {
	const screen = render(AppShell, { id: "my-shell", children: text("body") });
	const shell = screen.container.querySelector('[data-shell="shell"]');
	expect(shell).not.toBeNull();
	expect(shell!.id).toBe("my-shell");
});

test("rail snippet renders the rail region (a <div>) with its content", async () => {
	const screen = render(AppShell, {
		rail: text("rail content"),
		children: text("body"),
	});

	const rail = screen.container.querySelector('[data-shell="rail"]');
	expect(rail).not.toBeNull();
	expect(rail!.tagName).toBe("DIV");
	await expect.element(page.elementLocator(rail!)).toHaveTextContent("rail content");
});

test("header snippet renders the header region as a <header>", async () => {
	const screen = render(AppShell, {
		header: text("header content"),
		children: text("body"),
	});

	const header = screen.container.querySelector('[data-shell="header"]');
	expect(header).not.toBeNull();
	expect(header!.tagName).toBe("HEADER");
	await expect.element(page.elementLocator(header!)).toHaveTextContent("header content");
});

test("sidebarLeft + sidebarRight render both <aside> regions with distinct content", async () => {
	const screen = render(AppShell, {
		sidebarLeft: text("left sidebar"),
		sidebarRight: text("right sidebar"),
		children: text("body"),
	});

	const left = screen.container.querySelector('[data-shell="sidebar-left"]');
	const right = screen.container.querySelector('[data-shell="sidebar-right"]');
	expect(left).not.toBeNull();
	expect(right).not.toBeNull();
	expect(left!.tagName).toBe("ASIDE");
	expect(right!.tagName).toBe("ASIDE");
	// Content landed in the correct region (scoped, auto-retrying).
	await expect.element(page.elementLocator(left!)).toHaveTextContent("left sidebar");
	await expect.element(page.elementLocator(right!)).toHaveTextContent("right sidebar");
});

test("pageHeader + pageFooter render both regions inside the page", async () => {
	const screen = render(AppShell, {
		pageHeader: text("page header content"),
		pageFooter: text("page footer content"),
		children: text("body"),
	});

	const pageHeader = screen.container.querySelector('[data-shell="page-header"]');
	const pageFooter = screen.container.querySelector('[data-shell="page-footer"]');
	expect(pageHeader).not.toBeNull();
	expect(pageFooter).not.toBeNull();
	expect(pageHeader!.tagName).toBe("HEADER");
	expect(pageFooter!.tagName).toBe("FOOTER");
	await expect
		.element(page.elementLocator(pageHeader!))
		.toHaveTextContent("page header content");
	await expect
		.element(page.elementLocator(pageFooter!))
		.toHaveTextContent("page footer content");

	// Both live inside data-shell="page".
	const pageEl = screen.container.querySelector('[data-shell="page"]');
	expect(pageEl).not.toBeNull();
	expect(pageEl!.contains(pageHeader)).toBe(true);
	expect(pageEl!.contains(pageFooter)).toBe(true);
});

test("footer snippet renders the footer region as a <footer>", async () => {
	const screen = render(AppShell, {
		footer: text("footer content"),
		children: text("body"),
	});

	const footer = screen.container.querySelector('[data-shell="footer"]');
	expect(footer).not.toBeNull();
	expect(footer!.tagName).toBe("FOOTER");
	await expect.element(page.elementLocator(footer!)).toHaveTextContent("footer content");
});

test("pageFlexGrow maps to the emitted flex token on data-shell=page (default 3 -> flex-[3])", async () => {
	const screen = render(AppShell, { children: text("body") });
	// default pageFlexGrow=3 -> flexMap[3] = "flex-[3]".
	const pageEl = screen.container.querySelector('[data-shell="page"]');
	expect(pageEl).not.toBeNull();
	await expect.element(page.elementLocator(pageEl!)).toHaveClass("flex-[3]");
});

test("pageFlexGrow={2} maps to flex-[2] on data-shell=page", async () => {
	const screen = render(AppShell, { pageFlexGrow: 2, children: text("body") });
	const pageEl = screen.container.querySelector('[data-shell="page"]');
	expect(pageEl).not.toBeNull();
	await expect.element(page.elementLocator(pageEl!)).toHaveClass("flex-[2]");
});

test("pageFlexGrow={0}: page gets flex-1 and sidebars collapse to flex-none", async () => {
	// 0 is the only falsy pageFlexGrow: flexMap[0] === "flex-1", and the sidebar
	// flex class toggles `pageFlexGrow ? "flex-1" : "flex-none"` -> "flex-none".
	const screen = render(AppShell, {
		pageFlexGrow: 0,
		sidebarLeft: text("left sidebar"),
		children: text("body"),
	});

	const pageEl = screen.container.querySelector('[data-shell="page"]');
	expect(pageEl).not.toBeNull();
	await expect.element(page.elementLocator(pageEl!)).toHaveClass("flex-1");

	const left = screen.container.querySelector('[data-shell="sidebar-left"]');
	expect(left).not.toBeNull();
	await expect.element(page.elementLocator(left!)).toHaveClass("flex-none");
});
