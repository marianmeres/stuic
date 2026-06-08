import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { expect, test } from "vitest";
import Spinner from "./Spinner.svelte";

// Spinner has no ARIA role — it is decorative radial-bars markup.
// We locate the root via its `.stuic-spinner` class and wrap the raw
// element in a Locator (page.elementLocator) so DOM assertions auto-retry.
// Markup is rendered synchronously on mount (no $effect / async), so the
// container query is reliable immediately after `await render(...)`.

function rootLocator(container: HTMLElement) {
	const el = container.querySelector(".stuic-spinner");
	if (!el) throw new Error("missing .stuic-spinner root");
	return page.elementLocator(el);
}

function bars(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>(".stuic-spinner-bar"));
}

// jest-dom's toHaveStyle cannot parse CSS custom properties, so read the
// inline-declared --stuic-spinner-duration value directly off the root.
function durationVar(container: HTMLElement) {
	const el = container.querySelector(".stuic-spinner") as HTMLElement;
	return getComputedStyle(el).getPropertyValue("--stuic-spinner-duration").trim();
}

test("renders root .stuic-spinner with default geometry (size=md -> 18px, duration 750ms)", async () => {
	const { container } = await render(Spinner);
	const root = rootLocator(container);

	await expect.element(root).toBeInTheDocument();
	await expect.element(root).toHaveClass("stuic-spinner");
	// containerSize = sizeMap[md] (6) * 3 = 18px, applied as inline width/height
	await expect.element(root).toHaveStyle({ width: "18px", height: "18px" });
	// duration is exposed as a CSS custom property on the root
	expect(durationVar(container)).toBe("750ms");
});

test("count -> number of .stuic-spinner-bar elements (default 8)", async () => {
	const { container } = await render(Spinner);
	expect(bars(container)).toHaveLength(8);
});

test("count prop controls the number of bars", async () => {
	const { container } = await render(Spinner, { count: 12 });
	expect(bars(container)).toHaveLength(12);
});

test("size -> container pixel dimensions (sm=15px, lg=30px)", async () => {
	const sm = await render(Spinner, { size: "sm" });
	// sizeMap[sm] (5) * 3 = 15px
	await expect
		.element(rootLocator(sm.container))
		.toHaveStyle({ width: "15px", height: "15px" });

	const lg = await render(Spinner, { size: "lg" });
	// sizeMap[lg] (10) * 3 = 30px
	await expect
		.element(rootLocator(lg.container))
		.toHaveStyle({ width: "30px", height: "30px" });
});

test("thickness -> bar width in px (normal=2px default, thick=4px)", async () => {
	const def = await render(Spinner);
	const defBar = page.elementLocator(bars(def.container)[0]);
	// thicknessMap[normal] = 2 -> style:width="2px"
	await expect.element(defBar).toHaveStyle({ width: "2px" });

	const thick = await render(Spinner, { thickness: "thick" });
	const thickBar = page.elementLocator(bars(thick.container)[0]);
	// thicknessMap[thick] = 4 -> style:width="4px"
	await expect.element(thickBar).toHaveStyle({ width: "4px" });
});

test("bar height derives from size (md: barLength 6 - 1 = 5px)", async () => {
	const { container } = await render(Spinner);
	const bar = page.elementLocator(bars(container)[0]);
	// barHeight = barLength - 1 = 5
	await expect.element(bar).toHaveStyle({ height: "5px" });
});

test("rounded -> bar border-radius in px", async () => {
	const { container } = await render(Spinner, { rounded: 7 });
	const bar = page.elementLocator(bars(container)[0]);
	await expect.element(bar).toHaveStyle({ borderRadius: "7px" });
});

test("duration prop is reflected in the --stuic-spinner-duration custom property", async () => {
	const { container } = await render(Spinner, { duration: 1200 });
	expect(durationVar(container)).toBe("1200ms");
});

test("class prop is merged onto the root (twMerge keeps stuic-spinner)", async () => {
	const { container } = await render(Spinner, { class: "my-extra" });
	const root = rootLocator(container);
	await expect.element(root).toHaveClass("stuic-spinner");
	await expect.element(root).toHaveClass("my-extra");
});
