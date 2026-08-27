import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import Circle from "./Circle.svelte";
import CircleHarness from "./CircleHarness.test.svelte";

// Circle wraps utils/svg-circle.ts: the helper builds a detached <svg> which a mount
// $effect appends into the container div. Structural options (strokeWidth,
// roundedEdges, bgStrokeColor, strokeWidthRatio, circleClass/circleStyle) rebuild that
// svg; `completeness` and `rotate` go through the helper's setters instead, so they
// only rewrite attributes on the existing node.
//
// The svg has no ARIA role and lands asynchronously (mount effect), so we query the
// container directly and let expect.poll / expect.element retry.
//
// `rerender` re-seeds every prop and so rebuilds the svg unconditionally - it cannot
// tell the two paths apart. The in-place assertions therefore go through
// CircleHarness.test.svelte, which drives one prop at a time from local $state.

function svgOf(container: ParentNode) {
	const node = container.querySelector("svg");
	if (!node) throw new Error("missing svg");
	return node;
}

// radius = 50 - strokeWidth/2, circumference = 2 * PI * radius
const circumference = (strokeWidth: number) => 2 * Math.PI * (50 - strokeWidth / 2);

test("renders a single 100x100 viewBox svg into the container", async () => {
	const { container } = await render(Circle);
	await expect.poll(() => container.querySelectorAll("svg").length).toBe(1);
	await expect
		.element(page.elementLocator(svgOf(container)))
		.toHaveAttribute("viewBox", "0 0 100 100");
});

test("completeness maps to stroke-dashoffset", async () => {
	const { container } = await render(Circle, { completeness: 0.25 });
	await expect
		.poll(() =>
			Number(container.querySelector("circle")?.getAttribute("stroke-dashoffset"))
		)
		.toBeCloseTo(circumference(10) * 0.75, 5);
});

test("bgStrokeColor adds a background circle behind the progress arc", async () => {
	const { container } = await render(Circle, {
		completeness: 0.5,
		bgStrokeColor: "red",
	});
	await expect.poll(() => container.querySelectorAll("circle").length).toBe(2);
	const [bg, arc] = [...container.querySelectorAll("circle")];
	expect(bg.getAttribute("stroke")).toBe("red");
	expect(bg.hasAttribute("stroke-dasharray")).toBe(false);
	expect(arc.getAttribute("stroke")).toBe("currentColor");
});

test("animateCompletenessMs adds a stroke-dashoffset transition to the circle", async () => {
	const { container } = await render(Circle, {
		completeness: 0.3,
		animateCompletenessMs: 250,
	});
	await expect
		.poll(() => container.querySelector("circle")?.style.transitionProperty)
		.toBe("stroke-dashoffset");
	expect(container.querySelector("circle")!.style.transitionDuration).toBe("250ms");
});

test("class goes to the container, circleClass to the svg", async () => {
	const { container } = await render(Circle, {
		class: "size-16 my-container-cls",
		circleClass: "my-svg-cls",
	});
	await expect.poll(() => container.querySelectorAll("svg").length).toBe(1);
	const host = container.querySelector("div")!;
	expect(host.classList.contains("my-container-cls")).toBe(true);
	// twMerge replaces the base size utility rather than duplicating it
	expect(host.classList.contains("size-16")).toBe(true);
	expect(host.classList.contains("size-6")).toBe(false);
	expect(svgOf(container).classList.contains("my-svg-cls")).toBe(true);
});

test("completeness and rotate update the existing svg in place", async () => {
	const screen = await render(CircleHarness);
	await expect.poll(() => screen.container.querySelectorAll("svg").length).toBe(1);
	const svg = svgOf(screen.container);
	const circle = svg.querySelector("circle")!;
	expect(circle.getAttribute("transform")).toBe("rotate(-90)");

	await screen.getByTestId("set-completeness").click();
	await expect
		.poll(() => Number(circle.getAttribute("stroke-dashoffset")))
		.toBeCloseTo(circumference(10) * 0.25, 5);

	await screen.getByTestId("set-rotate").click();
	await expect.poll(() => circle.getAttribute("transform")).toBe("rotate(45)");

	// no rebuild happened: same node, still the only one
	expect(svgOf(screen.container)).toBe(svg);
	expect(screen.container.querySelectorAll("svg").length).toBe(1);
});

// Regression: the mount effect's teardown used to read the `circle` derived again,
// which by then resolved to the freshly rebuilt instance - so it removed the NEW svg
// and left the old one in the DOM, stacking one svg per structural change.
test("a structural change replaces the svg instead of stacking a second one", async () => {
	const screen = await render(CircleHarness);
	await expect.poll(() => screen.container.querySelectorAll("svg").length).toBe(1);
	const first = svgOf(screen.container);

	await screen.getByTestId("set-stroke-width").click();
	await expect
		.poll(() => screen.container.querySelector("circle")?.getAttribute("stroke-width"))
		.toBe("24");

	expect(screen.container.querySelectorAll("svg").length).toBe(1);
	expect(svgOf(screen.container)).not.toBe(first);
	expect(first.isConnected).toBe(false);

	// the rebuilt svg still reflects completeness/rotate - a fresh one would
	// otherwise be fully complete and unrotated
	const circle = screen.container.querySelector("circle")!;
	expect(circle.getAttribute("transform")).toBe("rotate(-90)");
	expect(Number(circle.getAttribute("stroke-dashoffset"))).toBeCloseTo(
		circumference(24) * 0.75,
		5
	);

	// and a second structural change still leaves exactly one
	await screen.getByTestId("set-track").click();
	await expect.poll(() => screen.container.querySelectorAll("circle").length).toBe(2);
	expect(screen.container.querySelectorAll("svg").length).toBe(1);
});
