import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test, beforeAll } from "vitest";
import { createRawSnippet } from "svelte";
import Collapsible from "./Collapsible.svelte";

// The browser test env loads NO component/Tailwind CSS (setupFiles is only
// vitest-browser-svelte; no test imports the stuic aggregator stylesheet). The
// component emits the Tailwind `line-clamp-{n}` utility classes and relies on the
// consumer's Tailwind build to supply the actual clamping rules. To exercise the
// genuine browser-only measurement (`scrollHeight > clientHeight`), we inject the
// exact `line-clamp` declarations Tailwind would generate — otherwise the text is
// never visually clamped, clientHeight === scrollHeight, and needsCollapse never
// flips. This provides the consumer-side CSS contract, not the behavior under test.
beforeAll(() => {
	const style = document.createElement("style");
	style.textContent = [1, 2, 3]
		.map(
			(n) =>
				`.line-clamp-${n}{overflow:hidden;display:-webkit-box;` +
				`-webkit-box-orient:vertical;-webkit-line-clamp:${n};line-clamp:${n};}`
		)
		.join("\n");
	document.head.appendChild(style);
});

// Collapsible's whole reason to exist is a layout read that jsdom CANNOT do:
// inside an $effect it measures `contentEl.scrollHeight > contentEl.clientHeight`
// (after `containerWidth` from bind:clientWidth is known) to decide whether the
// content actually overflows the clamped line count. jsdom returns 0 for every
// layout metric, so `needsCollapse` would never flip there; real Chromium computes
// real layout. We force overflow by constraining the root width (style is forwarded
// to the root) and using a long string against line-clamp-1.
//
// The root <div class="stuic-collapsible"> and the content wrapper
// (.stuic-collapsible > div > div, carrying line-clamp-{lines}) have no ARIA role,
// so we locate them by class via container.querySelector + page.elementLocator
// (cf. Avatar/Progress). The toggle is a real <button> -> getByRole("button").

const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

function el(root: ParentNode, selector: string) {
	const node = root.querySelector(selector);
	if (!node) throw new Error(`missing element for selector: ${selector}`);
	return page.elementLocator(node);
}

// ~40+ word sentence — wraps far beyond a single line inside a 200px-wide root,
// so line-clamp-1 truncates and scrollHeight exceeds clientHeight.
const LONG =
	"This is a deliberately long sentence written to overflow a single clamped " +
	"line so that the collapsible component measures real layout in a real browser " +
	"and decides that the content genuinely needs to collapse behind a toggle button.";

test("renders the root and content wrapper with the clamped line-clamp class", async () => {
	const { container } = await render(Collapsible, {
		children: text("Hi"),
		lines: 1,
		style: "width: 200px",
	});
	const root = el(container, ".stuic-collapsible");
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-collapsible");
	// `style` is forwarded verbatim to the root — this is what constrains the width
	// and forces the long text to wrap (the whole premise of the overflow test).
	expect(root.element().getAttribute("style") ?? "").toContain("width: 200px");

	// the flex-1 content wrapper (.stuic-collapsible > div > div) carries the clamp
	const content = el(container, ".stuic-collapsible > div > div");
	await expect.element(content).toHaveClass("flex-1");
	await expect.element(content).toHaveClass("line-clamp-1");
});

test("OVERFLOW: long text + lines=1 + narrow width -> toggle appears with the default chevron", async () => {
	// The jsdom-impossible read: real Chromium lays out the wrapped long string,
	// the $effect sees scrollHeight > clientHeight, needsCollapse flips true, and
	// the toggle button is conditionally rendered.
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
	});

	// toggle only exists when needsCollapse is true — await it (effect-driven)
	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	await expect.element(toggle).toHaveClass("stuic-collapsible-toggle");

	// default indicator is the rotating chevron (an <svg>), not a text arrow. The
	// 180deg rotation itself is CSS keyed off aria-expanded, which the browser test
	// env does not load (see the beforeAll note) — assert the state attribute that
	// drives it instead.
	expect(toggle.element().querySelector("svg.stuic-collapsible-chevron")).not.toBeNull();
	await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
	// the chevron is decorative; the button carries the accessible name
	await expect.element(toggle).toHaveAccessibleName("More...");

	// content is still clamped while collapsed
	const content = el(container, ".stuic-collapsible > div > div");
	await expect.element(content).toHaveClass("line-clamp-1");
});

test("EXPAND: clicking the toggle removes the clamp and flips aria-expanded", async () => {
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
	});

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();

	const content = el(container, ".stuic-collapsible > div > div");
	await expect.element(content).toHaveClass("line-clamp-1");

	await toggle.click();

	// expanded -> clamp class is dropped (no line-clamp-1)...
	await expect.element(content).not.toHaveClass("line-clamp-1");
	// ...and the chevron's rotation hook + accessible name follow the state
	await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
	await expect.element(toggle).toHaveAccessibleName("Less...");
});

test("TEXT INDICATORS: passing either indicator opts out of the chevron", async () => {
	const { getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
		collapsedIndicator: "▼",
		expandedIndicator: "▲",
	});

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	expect(toggle.element().querySelector("svg.stuic-collapsible-chevron")).toBeNull();
	await expect.element(toggle).toHaveTextContent("▼");

	await toggle.click();
	await expect.element(toggle).toHaveTextContent("▲");
});

test("TEXT INDICATORS: one custom indicator -> the other keeps its legacy arrow", async () => {
	const { getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
		collapsedIndicator: "more...",
	});

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	expect(toggle.element().querySelector("svg.stuic-collapsible-chevron")).toBeNull();
	await expect.element(toggle).toHaveTextContent("more...");

	await toggle.click();
	await expect.element(toggle).toHaveTextContent("↑");
});

test('toggleAlign="top-when-expanded": row flips items-end -> items-start only while expanded', async () => {
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
		toggleAlign: "top-when-expanded",
	});

	const row = el(container, ".stuic-collapsible > div");
	await expect.element(row).toHaveClass("items-end");

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	await toggle.click();

	await expect.element(row).toHaveClass("items-start");
	await expect.element(row).not.toHaveClass("items-end");

	// ...and back down when collapsed again
	await toggle.click();
	await expect.element(row).toHaveClass("items-end");
	await expect.element(row).not.toHaveClass("items-start");
});

test('toggleAlign="top": row is items-start in BOTH states', async () => {
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
		toggleAlign: "top",
	});

	const row = el(container, ".stuic-collapsible > div");
	// already top-aligned while collapsed — this is what separates "top" from
	// "top-when-expanded"
	await expect.element(row).toHaveClass("items-start");
	await expect.element(row).not.toHaveClass("items-end");

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	await toggle.click();

	await expect.element(row).toHaveClass("items-start");
	await expect.element(row).not.toHaveClass("items-end");
});

test("toggleAlign defaults to bottom in both states", async () => {
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
	});

	const row = el(container, ".stuic-collapsible > div");
	await expect.element(row).toHaveClass("items-end");

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	await toggle.click();

	await expect.element(row).toHaveClass("items-end");
	await expect.element(row).not.toHaveClass("items-start");
});

test("animate=false renders NO viewport wrapper (default DOM is unchanged)", async () => {
	const { container } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
	});

	await expect
		.poll(() => container.querySelector(".stuic-collapsible > div > div"))
		.not.toBeNull();
	expect(container.querySelector(".stuic-collapsible-viewport")).toBeNull();
	// the clamped content div is still the direct flex child
	const content = el(container, ".stuic-collapsible > div > div");
	await expect.element(content).toHaveClass("line-clamp-1");
});

test("ANIMATE: viewport wrapper is inserted and autoHeight locks its height in px", async () => {
	// Another genuinely browser-only assertion: the `autoHeight` attachment reads
	// the inner element's offsetHeight (0 under jsdom) and writes it back as an
	// inline `height`, which is what the CSS height transition interpolates.
	const { container, getByRole } = await render(Collapsible, {
		children: text(LONG),
		lines: 1,
		style: "width: 200px",
		animate: true,
	});

	const viewport = el(container, ".stuic-collapsible-viewport");
	await expect.element(viewport).toBeInTheDocument();
	await expect.element(viewport).toHaveClass("flex-1");

	// the clamped content is now nested one level deeper, inside the viewport
	const content = el(container, ".stuic-collapsible-viewport > div");
	await expect.element(content).toHaveClass("line-clamp-1");

	// height locked from `auto` to a real px value on mount
	const collapsedH = () =>
		parseFloat((viewport.element() as HTMLElement).style.height || "0");
	await expect.poll(collapsedH).toBeGreaterThan(0);
	const before = collapsedH();

	const toggle = getByRole("button");
	await expect.element(toggle).toBeInTheDocument();
	await toggle.click();

	// unclamping grows the measured inner -> the ResizeObserver re-measure (deferred
	// one frame) drives the viewport height up to the full content height
	await expect.poll(collapsedH).toBeGreaterThan(before);
});

test("FITS: short text in one line -> needsCollapse false -> NO toggle button", async () => {
	// Negative of the layout read: "Hi" fits inside one clamped line at 200px, so
	// scrollHeight === clientHeight, needsCollapse stays false, and the toggle is
	// never rendered. (Again, impossible to assert under jsdom's zeroed layout.)
	const { container } = await render(Collapsible, {
		children: text("Hi"),
		lines: 1,
		style: "width: 200px",
	});

	// first wait for the content wrapper so layout has settled before the negative
	await expect
		.poll(() => container.querySelector(".stuic-collapsible > div > div"))
		.not.toBeNull();

	// no overflow -> no toggle button; assert it is (and stays) absent
	await expect
		.poll(() => container.querySelector(".stuic-collapsible-toggle"))
		.toBeNull();
	expect(container.querySelector(".stuic-collapsible-toggle")).toBeNull();
});
