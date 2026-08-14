import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./spotlight.container.fixture.svelte";

// Issue-C guarantees for the spotlight action: with `container` the backdrop +
// annotation are portalled into the shell and ALL coordinate math (clip-path
// outer box, hole position) is expressed in the shell's coordinate space; the
// default stays document.body with viewport coordinates.

const backdrop = () => document.querySelector<HTMLElement>(".stuic-spotlight-backdrop");
const annotation = () =>
	document.querySelector<HTMLElement>(
		".stuic-spotlight-annotation, .stuic-spotlight-annotation-fallback"
	);

test("default: backdrop goes to document.body with viewport-sized clip-path", async () => {
	const screen = await render(Fixture, { open: true });
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();
	expect(backdrop()!.parentElement).toBe(document.body);
	// borderRadius: 0 -> polygon() outer box spans the viewport
	expect(backdrop()!.style.clipPath).toContain(`${window.innerWidth}px 0`);
	await screen.rerender({ open: false });
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeNull();
});

test("container option portals the overlay into the shell with container-local coordinates", async () => {
	const screen = await render(Fixture, { open: true, useContainer: true });
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeTruthy();

	const shell = screen.getByTestId("shell").element() as HTMLElement;
	expect(backdrop()!.parentElement).toBe(shell);
	await expect.poll(() => annotation(), { timeout: 2000 }).toBeTruthy();
	expect(annotation()!.parentElement).toBe(shell);

	// clip-path outer box is the shell's 240x180 (not the viewport), and the
	// hole starts at target(40,30) - padding(4) in SHELL-local coordinates.
	const clip = backdrop()!.style.clipPath;
	expect(clip).toContain("240px 0");
	expect(clip).toContain("240px 180px");
	expect(clip).toContain("36px 26px");

	await screen.rerender({ open: false, useContainer: true });
	await expect.poll(() => backdrop(), { timeout: 2000 }).toBeNull();
});
