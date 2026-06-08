import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./SlidingPanels.fixture.svelte";

// SlidingPanels drives an imperative, async transition (`show(panel)`):
//   waitForNextRepaint() -> sleep(duration) -> swap active panel.
// The snippet args (`show`) can't be wired to a clickable element from a
// `.svelte.test.ts`, so we use the conventions escape hatch: a fixture that
// composes the real component with markup and a "go B" / "go A" button per panel.
// (see docs/component-testing/02-test-conventions.md and the brief.)
//
// Contract under test = the POST-TRANSITION outcome with destroyInactive (default
// TRUE): both panels render initially (B starts off-screen, not destroyed), and
// after the transition the *previously active* panel is removed from the DOM while
// the target panel is shown. We assert which panel content is present after the
// transition settles — never the translate classes. `expect.element` auto-retries,
// so it absorbs the ~60ms transition without any fixed sleep.

test("both panels render initially; A is active, B is present but off-screen (not destroyed)", async () => {
	const screen = render(Fixture, { duration: 60 });
	// destroyInactive defaults true, but the *inactive* panel is only destroyed
	// AFTER a transition — on initial mount both A and B are in the DOM.
	await expect.element(screen.getByText("Panel A")).toBeInTheDocument();
	await expect.element(screen.getByText("Panel B")).toBeInTheDocument();
	// Their drive buttons are both present too.
	await expect.element(screen.getByRole("button", { name: /go B/i })).toBeInTheDocument();
	await expect.element(screen.getByRole("button", { name: /go A/i })).toBeInTheDocument();
});

test("show('B'): after the transition completes, Panel A is destroyed and Panel B is shown", async () => {
	const screen = render(Fixture, { duration: 60 });

	await screen.getByRole("button", { name: /go B/i }).click();

	// After the ~60ms transition settles, destroyInactive removes panel A from the
	// DOM entirely; the retry loop polls until the removal lands.
	await expect.element(screen.getByText("Panel A")).not.toBeInTheDocument();
	await expect.element(screen.getByText("Panel B")).toBeInTheDocument();
});

test("show('B') then show('A'): Panel B is destroyed and Panel A is shown again", async () => {
	const screen = render(Fixture, { duration: 60 });

	// Transition A -> B.
	await screen.getByRole("button", { name: /go B/i }).click();
	await expect.element(screen.getByText("Panel A")).not.toBeInTheDocument();
	await expect.element(screen.getByText("Panel B")).toBeInTheDocument();

	// Now transition B -> A using the button that lives inside panel B.
	await screen.getByRole("button", { name: /go A/i }).click();

	// Panel B is destroyed; Panel A is re-mounted and shown.
	await expect.element(screen.getByText("Panel B")).not.toBeInTheDocument();
	await expect.element(screen.getByText("Panel A")).toBeInTheDocument();
});
