import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./watch.fixture.svelte";

// `watch` is an $effect wrapper: it tracks only its source getters, runs the body
// untracked and hands over the previous values. Real browser so $effect runs.

const settle = () => new Promise((r) => setTimeout(r, 50));

test("runs once on mount with the initial values and an empty previous tuple", async () => {
	const onRun = vi.fn();
	await render(Fixture, { onRun });
	await expect.poll(() => onRun.mock.calls.length).toBe(1);
	expect(onRun).toHaveBeenLastCalledWith([0, "x"], [], 0);
});

test("re-runs when a source changes, passing the previous values", async () => {
	const onRun = vi.fn();
	const screen = await render(Fixture, { onRun });
	await expect.poll(() => onRun.mock.calls.length).toBe(1);

	await screen.getByTestId("inc-a").click();
	await expect.poll(() => onRun.mock.calls.length).toBe(2);
	expect(onRun).toHaveBeenLastCalledWith([1, "x"], [0, "x"], 0);

	await screen.getByTestId("set-b").click();
	await expect.poll(() => onRun.mock.calls.length).toBe(3);
	expect(onRun).toHaveBeenLastCalledWith([1, "y"], [1, "x"], 0);
});

test("state read only inside the body is not a dependency", async () => {
	const onRun = vi.fn();
	const screen = await render(Fixture, { onRun });
	await expect.poll(() => onRun.mock.calls.length).toBe(1);

	await screen.getByTestId("inc-untracked").click();
	await screen.getByTestId("inc-untracked").click();
	await settle();
	expect(onRun).toHaveBeenCalledTimes(1);

	// the next source change sees the latest untracked value
	await screen.getByTestId("inc-a").click();
	await expect.poll(() => onRun.mock.calls.length).toBe(2);
	expect(onRun).toHaveBeenLastCalledWith([1, "x"], [0, "x"], 2);
});

test("lazy: skips the mount run; the first call carries the mount values as previous", async () => {
	const onRun = vi.fn();
	const screen = await render(Fixture, { onRun, lazy: true });
	await settle();
	expect(onRun).not.toHaveBeenCalled();

	await screen.getByTestId("inc-a").click();
	await expect.poll(() => onRun.mock.calls.length).toBe(1);
	expect(onRun).toHaveBeenLastCalledWith([1, "x"], [0, "x"], 0);
});

test("a returned cleanup runs before the next run and on unmount", async () => {
	const onRun = vi.fn();
	const onCleanup = vi.fn();
	const screen = await render(Fixture, { onRun, onCleanup });
	await expect.poll(() => onRun.mock.calls.length).toBe(1);
	expect(onCleanup).not.toHaveBeenCalled();

	await screen.getByTestId("inc-a").click();
	await expect.poll(() => onRun.mock.calls.length).toBe(2);
	expect(onCleanup).toHaveBeenCalledTimes(1);

	await screen.unmount();
	await expect.poll(() => onCleanup.mock.calls.length).toBe(2);
});
