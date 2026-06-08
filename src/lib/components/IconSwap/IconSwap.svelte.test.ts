import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import { createRawSnippet } from "svelte";
import IconSwap from "./IconSwap.svelte";

// IconSwap renders a plain <span class="stuic-icon-swap" data-active={index}> with
// one inner <span class="stuic-icon-swap-state"> per state (no ARIA role on either),
// so we locate roots by class via container.querySelector and wrap raw elements in a
// Locator (page.elementLocator) so DOM assertions auto-retry. States are passed as
// HTML strings (rendered via {@html}) or Snippets.
//
// prefers-reduced-motion can't be controlled per-test (cf. the Skeleton decision), so
// we never assert the default 300ms duration: with duration={0} the min path yields 0
// regardless of the media query, making the CSS custom property deterministic.

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-icon-swap");
	if (!el) throw new Error("missing .stuic-icon-swap root");
	return page.elementLocator(el);
}

const STATES = ["<i>one</i>", "<i>two</i>", "<i>three</i>"];

// tiny helper for static-text snippet states
const text = (s: string) =>
	createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

test("root has stuic-icon-swap class and one state span per state", async () => {
	const { container } = await render(IconSwap, { states: STATES });
	const root = rootLocator(container);
	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-icon-swap");
	expect(container.querySelectorAll(".stuic-icon-swap-state")).toHaveLength(3);
});

test('data-active reflects the active index as a string (active=1 -> "1")', async () => {
	const { container } = await render(IconSwap, { states: STATES, active: 1 });
	await expect.element(rootLocator(container)).toHaveAttribute("data-active", "1");
});

test("the active state span is visible; the others are aria-hidden with no data-visible", async () => {
	const { container } = await render(IconSwap, { states: STATES, active: 1 });
	const spans = container.querySelectorAll(".stuic-icon-swap-state");

	// active (index 1): data-visible="true", aria-hidden="false"
	const active = page.elementLocator(spans[1]);
	await expect.element(active).toHaveAttribute("data-visible", "true");
	await expect.element(active).toHaveAttribute("aria-hidden", "false");

	// inactive (index 0 and 2): aria-hidden="true", no data-visible attribute
	const inactive0 = page.elementLocator(spans[0]);
	await expect.element(inactive0).toHaveAttribute("aria-hidden", "true");
	await expect.element(inactive0).not.toHaveAttribute("data-visible");

	const inactive2 = page.elementLocator(spans[2]);
	await expect.element(inactive2).toHaveAttribute("aria-hidden", "true");
	await expect.element(inactive2).not.toHaveAttribute("data-visible");
});

test('active=99 clamps to the last index (3 states -> data-active="2")', async () => {
	const { container } = await render(IconSwap, { states: STATES, active: 99 });
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-active", "2");
	// and the clamped index is the one marked visible
	const spans = container.querySelectorAll(".stuic-icon-swap-state");
	await expect
		.element(page.elementLocator(spans[2]))
		.toHaveAttribute("data-visible", "true");
});

test('active=-5 clamps to 0 (data-active="0")', async () => {
	const { container } = await render(IconSwap, { states: STATES, active: -5 });
	const root = rootLocator(container);
	await expect.element(root).toHaveAttribute("data-active", "0");
	const spans = container.querySelectorAll(".stuic-icon-swap-state");
	await expect
		.element(page.elementLocator(spans[0]))
		.toHaveAttribute("data-visible", "true");
});

test("duration={0} sets the --stuic-icon-swap-duration custom property to 0ms", async () => {
	// toHaveStyle can't parse a bare custom property, so read the inline style attribute
	// string instead. duration={0} -> Math.min path yields 0 regardless of reduced-motion.
	const { container } = await render(IconSwap, { states: STATES, duration: 0 });
	const style = rootLocator(container).element().getAttribute("style") ?? "";
	expect(style).toContain("--stuic-icon-swap-duration: 0ms");
});

test("easing maps to the --stuic-icon-swap-easing custom property", async () => {
	const { container } = await render(IconSwap, {
		states: STATES,
		easing: "linear",
	});
	const style = rootLocator(container).element().getAttribute("style") ?? "";
	expect(style).toContain("--stuic-icon-swap-easing: linear");
});

test("snippet states render alongside string states", async () => {
	const { container } = await render(IconSwap, {
		states: [text("alpha"), "<i>beta</i>"],
		active: 0,
	});
	const root = rootLocator(container);
	// the snippet's text content renders
	await expect.element(root).toHaveTextContent("alpha");
	// two state spans, snippet one is active/visible
	expect(container.querySelectorAll(".stuic-icon-swap-state")).toHaveLength(2);
	const spans = container.querySelectorAll(".stuic-icon-swap-state");
	await expect
		.element(page.elementLocator(spans[0]))
		.toHaveAttribute("data-visible", "true");
});
