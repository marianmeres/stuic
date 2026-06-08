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

test("OVERFLOW: long text + lines=1 + narrow width -> toggle appears with collapsed indicator", async () => {
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

	// collapsed -> default collapsed indicator "↓"
	await expect.element(toggle).toHaveTextContent("↓");

	// content is still clamped while collapsed
	const content = el(container, ".stuic-collapsible > div > div");
	await expect.element(content).toHaveClass("line-clamp-1");
});

test("EXPAND: clicking the toggle removes the clamp and flips the indicator to ↑", async () => {
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
	// ...and the indicator becomes the expanded "↑"
	await expect.element(toggle).toHaveTextContent("↑");
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
