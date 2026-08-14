import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./popover.container.fixture.svelte";

// Issue-C guarantee for the popover action: the optional `container` option
// portals the popover element into the given shell (so it can interleave with
// the shell's stacking context); without it, the default stays document.body.

const popoverEl = () =>
	document.querySelector<HTMLElement>(".stuic-popover, .stuic-popover-fallback");

test("default: popover is appended to document.body", async () => {
	const screen = await render(Fixture, { open: true });
	await expect.poll(() => popoverEl(), { timeout: 2000 }).toBeTruthy();
	// anchored mode appends the popover element itself; fallback wraps it —
	// either way the top-most created node must live directly under body
	const el = popoverEl()!;
	const topMost = el.classList.contains("stuic-popover")
		? el
		: el.closest(".stuic-popover-wrapper")!;
	expect(topMost.parentElement).toBe(document.body);
	await screen.rerender({ open: false });
	await expect.poll(() => popoverEl(), { timeout: 2000 }).toBeNull();
});

test("container option portals the popover into the shell", async () => {
	const screen = await render(Fixture, { open: true, useContainer: true });
	await expect.poll(() => popoverEl(), { timeout: 2000 }).toBeTruthy();
	const shell = screen.getByTestId("shell").element();
	expect(shell.contains(popoverEl()!)).toBe(true);
	await screen.rerender({ open: false, useContainer: true });
	await expect.poll(() => popoverEl(), { timeout: 2000 }).toBeNull();
});
