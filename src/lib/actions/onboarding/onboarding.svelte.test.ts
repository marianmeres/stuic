import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./onboarding.container.fixture.svelte";

// What a RUN owns, and what it does not.
//
// The registry (`stepId -> HTMLElement`) is a cache filled the first time each
// step resolves, and `advanceTo` never queries the DOM for a step it already
// holds. That makes it per-RUN state for a `selector` step — its element can be
// destroyed and rebuilt between two runs, and a detached node measures all
// zeroes, so the cutout collapses into the top-left corner without a warning.
// `start()` therefore drops resolved targets before it walks.
//
// It drops SELECTOR-resolved ones only. A `use:tourStep` step is maintained by
// the action itself and has no selector to fall back on, so clearing one whose
// element is still mounted would strand it — `waitForElement` would wait out a
// registration that already happened and the step would be skipped. That is the
// failure the second test exists to catch; it is the one a blanket
// `registry.clear()` would ship.

const backdrop = () => document.querySelector<HTMLElement>(".stuic-spotlight-backdrop");
const title = () => document.querySelector<HTMLElement>(".stuic-onboarding-title");

/** The hole's top-left, as `buildClipPath` writes it for padding 0 / radius 0. */
const holeOrigin = (el: HTMLElement) => {
	const r = el.getBoundingClientRect();
	return `${r.left}px ${r.top}px`;
};

test("a selector step re-resolves on the next run, after its element was replaced", async () => {
	const screen = await render(Fixture, { storageKey: "stuic-test:tour-selector" });

	await screen.getByTestId("start").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();

	const first = screen.getByTestId("target").element() as HTMLElement;
	// Captured while it is still ATTACHED — once it is not, its rect is all
	// zeroes and reads back as the polygon's own outer corner.
	const firstOrigin = holeOrigin(first);
	expect(backdrop()!.style.clipPath).toContain(firstOrigin);

	await screen.getByTestId("skip").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeNull();

	// The tab body / keyed block goes away and comes back somewhere else. Run 1's
	// node is now detached, and the registry is still holding it.
	await screen.rerender({ storageKey: "stuic-test:tour-selector", swapped: true });
	const second = screen.getByTestId("target").element() as HTMLElement;
	expect(second).not.toBe(first);

	await screen.getByTestId("reset").click();
	await screen.getByTestId("start").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();

	// The cutout is around the node that is on screen NOW. Without the clear it
	// would be around run 1's detached node, whose rect is all zeroes — so the
	// hole would collapse to nothing in the top-left corner.
	await expect
		.poll(() => backdrop()?.style.clipPath, { timeout: 2000 })
		.toContain(holeOrigin(second));
	const clip = backdrop()!.style.clipPath;
	expect(clip).not.toContain(firstOrigin);
	// The five hole vertices, i.e. everything after the outer box's five.
	expect(clip.split(", ").slice(6).join(", ")).not.toMatch(/^(0px 0px, ){4}0px 0px/);
});

test("an action-registered step survives the same second run", async () => {
	const screen = await render(Fixture, {
		useAction: true,
		storageKey: "stuic-test:tour-action",
	});

	await screen.getByTestId("start").click();
	await expect.poll(() => title()?.textContent, { timeout: 2000 }).toBe("Step one");

	await screen.getByTestId("skip").click();
	await expect.poll(() => title(), { timeout: 2000 }).toBeNull();

	await screen.getByTestId("reset").click();
	await screen.getByTestId("start").click();

	// Nothing remounted, so the action never re-registered — the entry `start()`
	// found is the one it left alone. A blanket clear would instead wait out
	// `waitForElement`, skip the only step, and end the tour immediately.
	await expect.poll(() => title()?.textContent, { timeout: 2000 }).toBe("Step one");
	await expect.element(screen.getByTestId("active")).toHaveTextContent("yes");
});

test("reset() still owns the persisted flag, and start() still does not clear it", async () => {
	const screen = await render(Fixture, { storageKey: "stuic-test:tour-seen" });

	await screen.getByTestId("start").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();
	await screen.getByTestId("skip").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeNull();

	// Asserted through behaviour rather than through `tour.seen`, which reads
	// storage directly and is deliberately not reactive.
	await screen.getByTestId("start").click();
	await expect.element(screen.getByTestId("active")).toHaveTextContent("no");
	expect(backdrop()).toBeNull();

	await screen.getByTestId("reset").click();
	await screen.getByTestId("start").click();
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();
});
