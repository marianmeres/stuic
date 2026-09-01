import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import TrendChart from "./TrendChart.svelte";

// TrendChart wraps the imperative @marianmeres/trend-chart class: the component
// renders a container <div class="stuic-trend-chart"> and the chart appends its
// <svg class="trend-chart"> to it from an $effect (browser only). GOTCHA: the
// chart measures its container, and component tests load no CSS — a bare div has
// zero height and renders nothing. Every test therefore passes explicit
// width/height via `options`, exactly what a CSS-less consumer would do.
const SIZE = { width: 300, height: 80 };

function rootEl(container: HTMLElement) {
	const el = container.querySelector(".stuic-trend-chart");
	if (!el) throw new Error("missing .stuic-trend-chart root");
	return el as HTMLElement;
}

test("renders the chart svg inside the styled container", async () => {
	const { container } = await render(TrendChart, {
		data: [3, 5, 4, 8, 6],
		options: SIZE,
	});
	const root = rootEl(container);
	// chart is created in an $effect after mount — poll for the svg
	await expect.element(page.elementLocator(root)).toBeInTheDocument();
	await expect.poll(() => root.querySelector("svg.trend-chart")).not.toBeNull();
	// default look has axes -> text labels present
	await expect.poll(() => root.querySelectorAll("svg text").length).toBeGreaterThan(0);
	// and a rendered line path with real geometry
	const line = root.querySelector("svg .trend-chart-line") as SVGPathElement | null;
	expect(line?.getAttribute("d")).toMatch(/^M/);
});

test("sparkline preset: data-sparkline attr, no axis labels rendered", async () => {
	const { container } = await render(TrendChart, {
		data: [3, 5, 4, 8, 6],
		sparkline: true,
		options: SIZE,
	});
	const root = rootEl(container);
	expect(root.hasAttribute("data-sparkline")).toBe(true);
	await expect.poll(() => root.querySelector("svg.trend-chart")).not.toBeNull();
	// xAxis/yAxis/grid all off -> no <text> anywhere
	expect(root.querySelectorAll("svg text").length).toBe(0);
});

test("options merge OVER the sparkline preset (axes can be re-enabled)", async () => {
	const { container } = await render(TrendChart, {
		data: [3, 5, 4, 8, 6],
		sparkline: true,
		options: { ...SIZE, yAxis: true },
	});
	const root = rootEl(container);
	await expect.poll(() => root.querySelector("svg.trend-chart")).not.toBeNull();
	// y axis back on -> labels again
	await expect.poll(() => root.querySelectorAll("svg text").length).toBeGreaterThan(0);
});

test("data prop change updates the chart in place (same svg, new path)", async () => {
	const screen = await render(TrendChart, {
		data: [1, 2, 3, 4, 5],
		options: SIZE,
	});
	const root = rootEl(screen.container);
	await expect.poll(() => root.querySelector("svg .trend-chart-line")).not.toBeNull();
	const svgBefore = root.querySelector("svg.trend-chart");
	const dBefore = root.querySelector("svg .trend-chart-line")!.getAttribute("d");

	await screen.rerender({ data: [5, 1, 9, 2, 7] });

	await expect
		.poll(() => root.querySelector("svg .trend-chart-line")!.getAttribute("d"))
		.not.toBe(dBefore);
	// updated, not recreated: same svg element instance
	expect(root.querySelector("svg.trend-chart")).toBe(svgBefore);
});

test("unmount destroys the chart (svg detached)", async () => {
	const screen = await render(TrendChart, {
		data: [3, 5, 4],
		options: SIZE,
	});
	const root = rootEl(screen.container);
	await expect.poll(() => root.querySelector("svg.trend-chart")).not.toBeNull();
	screen.unmount();
	expect(root.querySelector("svg")).toBeNull();
});

test("unstyled drops the class and data-sparkline; chart still renders", async () => {
	const { container } = await render(TrendChart, {
		data: [3, 5, 4],
		sparkline: true,
		unstyled: true,
		options: SIZE,
	});
	const root = container.firstElementChild as HTMLElement;
	expect(root).not.toBeNull();
	expect(root.classList.contains("stuic-trend-chart")).toBe(false);
	expect(root.hasAttribute("data-sparkline")).toBe(false);
	await expect.poll(() => root.querySelector("svg.trend-chart")).not.toBeNull();
});
