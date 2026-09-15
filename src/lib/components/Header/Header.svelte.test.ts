import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Header from "./Header.svelte";
import type { HeaderLocaleItem, HeaderNavItem } from "./Header.svelte";

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

// ---------------------------------------------------------------------------
// Locale switcher in collapsed mode.
//
// The locale switcher is deliberately NOT treated like a nav item: it stays
// inline next to the hamburger instead of folding into the dropdown, because
// the user who needs it most is the one who cannot read the menu it would hide
// behind. `keepLocaleOnCollapse` (default `true`) governs this in BOTH collapse
// modes, and when the inline trigger is shown the dropdown must not carry a
// duplicate locale section.
//
// Collapse is forced through `collapseThreshold` rather than the harness
// viewport: the threshold is compared against the measured inner-row width, so
// a huge value always collapses and `0` disables collapsing entirely. That
// measurement lands via ResizeObserver (async), hence the retrying
// `expect.element` assertions throughout.
const COLLAPSED = 100_000;
const EXPANDED = 0;

const LOCALES: HeaderLocaleItem[] = [
	{ id: "en", label: "English", shortLabel: "EN" },
	{ id: "sk", label: "Slovenčina", shortLabel: "SK" },
];

const ITEMS: HeaderNavItem[] = [
	{ id: "home", label: "Home", href: "#home" },
	{ id: "about", label: "About", href: "#about" },
];

const localeProps = { locales: LOCALES, activeLocale: "en" };

test("collapsed hamburger mode keeps the locale trigger inline (default)", async () => {
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		collapseThreshold: COLLAPSED,
	});
	// Both are visible side by side — the trigger did NOT fold into the menu.
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("collapsed hamburger dropdown carries no duplicate locale section", async () => {
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		localeLabel: "Language",
		collapseThreshold: COLLAPSED,
	});
	await screen.getByRole("button", { name: "Open menu" }).click();
	// Nav items are there…
	await expect.element(screen.getByRole("menuitem", { name: "Home" })).toBeVisible();
	// …the locales are not (neither the section header nor the entries).
	await expect
		.element(screen.getByRole("menuitem", { name: "Slovenčina" }))
		.not.toBeInTheDocument();
	expect(screen.container.textContent).not.toContain("Language");
});

test("keepLocaleOnCollapse:false restores the fold-into-dropdown behavior", async () => {
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		localeLabel: "Language",
		keepLocaleOnCollapse: false,
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.not.toBeInTheDocument();
	await screen.getByRole("button", { name: "Open menu" }).click();
	await expect
		.element(screen.getByRole("menuitem", { name: "Slovenčina" }))
		.toBeVisible();
	expect(screen.container.textContent).toContain("Language");
});

test("locale-only header renders no trailing hamburger when the locale stays inline", async () => {
	const screen = render(Header, {
		items: [],
		...localeProps,
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toBeVisible();
	// Nothing left to put in the dropdown → no trigger for an empty menu.
	await expect
		.element(screen.getByRole("button", { name: "Open menu" }))
		.not.toBeInTheDocument();
});

test("collapseMode:hide keeps the locale trigger visible by default", async () => {
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		collapseMode: "hide" as const,
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toBeVisible();
});

test("collapseMode:hide + keepLocaleOnCollapse:false hides the locale entirely", async () => {
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		collapseMode: "hide" as const,
		keepLocaleOnCollapse: false,
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.not.toBeInTheDocument();
	// "hide" mode never renders a trailing hamburger, so it really is gone.
	await expect
		.element(screen.getByRole("button", { name: "Open menu" }))
		.not.toBeInTheDocument();
});

// One render per test: the harness locators are page-scoped, so two headers on
// screen at once is a strict-mode violation rather than two isolated trees.
test("collapsed trigger uses the compact shortLabel", async () => {
	const screen = render(Header, {
		locales: LOCALES,
		activeLocale: "sk",
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toHaveTextContent("SK");
});

test("expanded trigger keeps the full label even when shortLabel is set", async () => {
	const screen = render(Header, {
		locales: LOCALES,
		activeLocale: "sk",
		collapseThreshold: EXPANDED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toHaveTextContent("Slovenčina");
});

test("collapsed trigger falls back to the full label when shortLabel is absent", async () => {
	const screen = render(Header, {
		locales: [
			{ id: "en", label: "English" },
			{ id: "sk", label: "Slovenčina" },
		],
		activeLocale: "sk",
		collapseThreshold: COLLAPSED,
	});
	await expect
		.element(screen.getByRole("button", { name: "Change language" }))
		.toHaveTextContent("Slovenčina");
});

test("the inline collapsed trigger still drives onLocaleChange", async () => {
	const onLocaleChange = vi.fn();
	const screen = render(Header, {
		items: ITEMS,
		...localeProps,
		onLocaleChange,
		collapseThreshold: COLLAPSED,
	});
	await screen.getByRole("button", { name: "Change language" }).click();
	// Native click, per the DropdownMenu test convention: selecting closes the
	// menu synchronously, detaching this node, which would orphan a Playwright
	// actionability promise ("Cancelled").
	(screen.getByRole("menuitem", { name: "Slovenčina" }).element() as HTMLElement).click();
	expect(onLocaleChange).toHaveBeenCalledExactlyOnceWith("sk");
});
