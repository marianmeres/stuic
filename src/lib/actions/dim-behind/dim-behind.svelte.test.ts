import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import Fixture from "./dim-behind.fixture.svelte";

// The dimBehind backdrop manager is one ref-counted backdrop PER CONTAINER
// (default: document.body). These are the Issue-C guarantees: distinct
// containers get one backdrop each, a shared container still ref-counts to a
// single one, and the default stays a body-level singleton.

const backdrops = () =>
	Array.from(document.querySelectorAll<HTMLElement>(".stuic-dim-behind-backdrop"));

// The backdrop is removed on a transitionend + timeout fallback — poll.
const waitGone = () => expect.poll(() => backdrops().length, { timeout: 2000 }).toBe(0);

test("default: backdrop is appended to document.body", async () => {
	const screen = await render(Fixture, { aOpen: true });
	expect(backdrops()).toHaveLength(1);
	expect(backdrops()[0].parentElement).toBe(document.body);
	await screen.rerender({ aOpen: false });
	await waitGone();
});

test("two instances without container share ONE body-level backdrop (ref-counted)", async () => {
	const screen = await render(Fixture, { aOpen: true, bOpen: true });
	expect(backdrops()).toHaveLength(1);
	// closing one keeps the shared backdrop alive
	await screen.rerender({ aOpen: false, bOpen: true });
	expect(backdrops()).toHaveLength(1);
	// closing the last releases it
	await screen.rerender({ aOpen: false, bOpen: false });
	await waitGone();
});

test("two instances in DIFFERENT containers get one backdrop each", async () => {
	const screen = await render(Fixture, {
		aOpen: true,
		bOpen: true,
		useContainers: true,
	});
	const all = backdrops();
	expect(all).toHaveLength(2);
	const a = screen.getByTestId("container-a").element();
	const b = screen.getByTestId("container-b").element();
	expect(all.some((el) => el.parentElement === a)).toBe(true);
	expect(all.some((el) => el.parentElement === b)).toBe(true);

	// closing A removes only A's backdrop
	await screen.rerender({ aOpen: false, bOpen: true, useContainers: true });
	await expect.poll(() => backdrops().length, { timeout: 2000 }).toBe(1);
	expect(backdrops()[0].parentElement).toBe(b);

	await screen.rerender({ aOpen: false, bOpen: false, useContainers: true });
	await waitGone();
});

test("two instances in the SAME container still ref-count to one backdrop", async () => {
	const screen = await render(Fixture, {
		aOpen: true,
		bOpen: true,
		useContainers: true,
		sameContainer: true,
	});
	expect(backdrops()).toHaveLength(1);
	const a = screen.getByTestId("container-a").element();
	expect(backdrops()[0].parentElement).toBe(a);

	await screen.rerender({
		aOpen: false,
		bOpen: true,
		useContainers: true,
		sameContainer: true,
	});
	expect(backdrops()).toHaveLength(1);

	await screen.rerender({
		aOpen: false,
		bOpen: false,
		useContainers: true,
		sameContainer: true,
	});
	await waitGone();
});
