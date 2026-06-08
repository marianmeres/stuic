import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import Progress from "./Progress.svelte";

// Progress renders one of two internal components based on `type`:
//   - type="bar"    -> _internal/Bar.svelte    (root .stuic-progress-bar, inner .bar)
//   - type="circle" -> _internal/Circle.svelte (root .stuic-progress-circle, SVG via svgCircle())
//
// Neither has an ARIA role, so we locate roots by class via container.querySelector
// and wrap raw elements in a Locator (page.elementLocator) so DOM assertions auto-retry.
// The circle's SVG is appended inside an $effect (async on mount), so the retry loop
// of expect.element is what lets us observe it.

function el(root: ParentNode, selector: string) {
	const node = root.querySelector(selector);
	if (!node) throw new Error(`missing element for selector: ${selector}`);
	return page.elementLocator(node);
}

// svgCircle geometry (verified against utils/svg-circle.ts):
//   strokeWidth = 10 (passed by Circle.svelte)
//   radius        = 50 - strokeWidth/2 = 45
//   circumference = 2 * PI * 45 = 282.7433388230814  -> stroke-dasharray
//   stroke-dashoffset = circumference * (1 - completeness), completeness = progress/100
const CIRCUMFERENCE = 2 * Math.PI * 45;

test("default type=bar renders the bar markup (.stuic-progress-bar > .bar)", async () => {
	const { container } = await render(Progress);
	const bar = el(container, ".stuic-progress-bar");
	await expect.element(bar).toBeInTheDocument();
	await expect.element(bar).toHaveClass("stuic-progress-bar");
	// inner accent element
	await expect.element(el(container, ".stuic-progress-bar > .bar")).toBeInTheDocument();
	// not the circle variant
	expect(container.querySelector(".stuic-progress-circle")).toBeNull();
});

test("bar: progress -> inner .bar inline width percentage (genuine layout read)", async () => {
	const { container } = await render(Progress, { progress: 42 });
	// Bar.svelte sets style="width:{clamped}%; {styleBar}"
	await expect.element(el(container, ".bar")).toHaveStyle({ width: "42%" });
});

test("bar: rendered pixel width is ~half the track at progress=50 (real browser layout)", async () => {
	const { container } = await render(Progress, { progress: 50 });
	const track = container.querySelector(".stuic-progress-bar") as HTMLElement;
	const fill = container.querySelector(".stuic-progress-bar > .bar") as HTMLElement;
	// The computed read jsdom can't do: wait for layout, then compare ACTUAL
	// rendered widths. width:50% of a 100%-wide track -> ~0.5 of the track px.
	await expect.poll(() => track.getBoundingClientRect().width).toBeGreaterThan(0);
	const ratio = fill.getBoundingClientRect().width / track.getBoundingClientRect().width;
	expect(ratio).toBeGreaterThan(0.45);
	expect(ratio).toBeLessThan(0.55);
});

test("bar: progress is clamped to [0,100] in the inline width", async () => {
	const over = await render(Progress, { progress: 150 });
	await expect.element(el(over.container, ".bar")).toHaveStyle({ width: "100%" });

	const under = await render(Progress, { progress: -10 });
	await expect.element(el(under.container, ".bar")).toHaveStyle({ width: "0%" });
});

test("bar: classBar is merged onto the inner .bar (twMerge keeps base class)", async () => {
	const { container } = await render(Progress, { progress: 10, classBar: "my-bar-extra" });
	const innerBar = el(container, ".bar");
	await expect.element(innerBar).toHaveClass("bar");
	await expect.element(innerBar).toHaveClass("my-bar-extra");
});

test("type=circle renders the circle root and an SVG with a 100x100 viewBox", async () => {
	const { container } = await render(Progress, { type: "circle", progress: 50 });
	const circleRoot = el(container, ".stuic-progress-circle");
	await expect.element(circleRoot).toBeInTheDocument();
	await expect.element(circleRoot).toHaveClass("stuic-progress-circle");
	// no bar variant
	expect(container.querySelector(".stuic-progress-bar")).toBeNull();
	// svgCircle() appends an <svg> inside an $effect -> retry loop observes it
	const svg = el(container, ".stuic-progress-circle svg");
	await expect.element(svg).toBeInTheDocument();
	await expect.element(svg).toHaveAttribute("viewBox", "0 0 100 100");
});

test("circle: progress -> stroke-dasharray (circumference) and computed stroke-dashoffset", async () => {
	const { container } = await render(Progress, { type: "circle", progress: 50 });
	// The progress arc is the LAST <circle> (a bg circle is prepended because
	// bgStrokeColor is set). Its dasharray is the full circumference, and its
	// dashoffset = circumference * (1 - progress/100).
	const circles = () =>
		container.querySelectorAll(".stuic-progress-circle svg circle");

	// wait for the SVG to be mounted (two circles: bg + progress)
	await expect.poll(() => circles().length).toBeGreaterThanOrEqual(2);

	const arc = page.elementLocator(circles()[circles().length - 1]);
	await expect
		.element(arc)
		.toHaveAttribute("stroke-dasharray", String(CIRCUMFERENCE));
	// progress=50 -> completeness 0.5 -> offset = circumference * 0.5
	await expect
		.element(arc)
		.toHaveAttribute("stroke-dashoffset", String(CIRCUMFERENCE * 0.5));
});

test("circle: progress=0 leaves the arc fully offset (empty ring)", async () => {
	const { container } = await render(Progress, { type: "circle", progress: 0 });
	const circles = () =>
		container.querySelectorAll(".stuic-progress-circle svg circle");
	await expect.poll(() => circles().length).toBeGreaterThanOrEqual(2);

	const arc = page.elementLocator(circles()[circles().length - 1]);
	// completeness 0 -> dashoffset == circumference (full circle hidden)
	await expect
		.element(arc)
		.toHaveAttribute("stroke-dashoffset", String(CIRCUMFERENCE));
});

test("class prop is merged onto the chosen variant root", async () => {
	const { container } = await render(Progress, { progress: 5, class: "my-root-extra" });
	const root = el(container, ".stuic-progress-bar");
	await expect.element(root).toHaveClass("stuic-progress-bar");
	await expect.element(root).toHaveClass("my-root-extra");
});
