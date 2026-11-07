import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { afterEach, expect, test, vi } from "vitest";
import Fixture from "./breakpoint.fixture.svelte";

// Real browser: `innerWidth` from `svelte/reactivity/window` listens to the window's
// `resize`, and `page.viewport()` is what fires it.

afterEach(() => {
	vi.restoreAllMocks();
});

test("tracks the window width across the Tailwind ladder", async () => {
	await page.viewport(1300, 800);
	const screen = await render(Fixture);
	await expect.element(screen.getByTestId("current")).toHaveTextContent("xl");
	await expect.element(screen.getByTestId("md")).toHaveTextContent("md");

	await page.viewport(700, 800);
	await expect.element(screen.getByTestId("current")).toHaveTextContent("sm");
	await expect.element(screen.getByTestId("md")).toHaveTextContent("below-md");

	await page.viewport(500, 800);
	await expect.element(screen.getByTestId("current")).toHaveTextContent("none");
});

// The singleton is created lazily by whichever component reads `instance` first. It must not
// belong to that component: once the first reader unmounts, every later reader must still see
// the window move — and Svelte must not warn `derived_inert` on every resize.
test("the singleton outlives the component that created it", async () => {
	const warn = vi.spyOn(console, "warn");

	await page.viewport(1300, 800);
	const first = await render(Fixture);
	await expect.element(first.getByTestId("current")).toHaveTextContent("xl");
	first.unmount();

	const second = await render(Fixture);
	await expect.element(second.getByTestId("current")).toHaveTextContent("xl");

	await page.viewport(700, 800);
	await expect.element(second.getByTestId("current")).toHaveTextContent("sm");
	await expect.element(second.getByTestId("md")).toHaveTextContent("below-md");

	await page.viewport(1100, 800);
	await expect.element(second.getByTestId("current")).toHaveTextContent("lg");

	const inert = warn.mock.calls.filter((args) => String(args[0]).includes("derived_inert"));
	expect(inert).toEqual([]);
});
