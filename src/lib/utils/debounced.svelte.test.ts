import { render } from "vitest-browser-svelte";
import { expect, test, vi } from "vitest";
import Fixture from "./debounced.fixture.svelte";

// `Debounced` mirrors a getter into reactive state after a quiet period. Real browser so
// $state/$effect run and `bind:value` reacts to `.fill()` (fires `input`).

const text = (el: Element) => el.textContent?.trim();

test("current starts at the source value and catches up `wait` ms after the last change", async () => {
	const screen = await render(Fixture, { wait: 300 });
	await expect.element(screen.getByTestId("debounced")).toHaveTextContent("init");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("no");

	await screen.getByTestId("q").fill("abc");
	await expect.element(screen.getByTestId("raw")).toHaveTextContent("abc");
	// still the old value right after typing, with a timer pending
	expect(text(screen.getByTestId("debounced").element())).toBe("init");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("yes");

	await expect.element(screen.getByTestId("debounced")).toHaveTextContent("abc");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("no");
});

test("changes inside the quiet period coalesce — intermediate values never surface", async () => {
	const onDebounced = vi.fn();
	const screen = await render(Fixture, { wait: 300, onDebounced });
	await expect.poll(() => onDebounced.mock.calls.length).toBe(1);
	expect(onDebounced).toHaveBeenLastCalledWith("init");

	await screen.getByTestId("q").fill("a");
	await screen.getByTestId("q").fill("ab");
	await screen.getByTestId("q").fill("abc");

	await expect.element(screen.getByTestId("debounced")).toHaveTextContent("abc");
	expect(onDebounced.mock.calls.map((c) => c[0])).toEqual(["init", "abc"]);
});

test("updateImmediately skips the wait", async () => {
	const screen = await render(Fixture, { wait: 5000 });
	await screen.getByTestId("q").fill("zzz");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("yes");

	await screen.getByTestId("flush").click();
	await expect.element(screen.getByTestId("debounced")).toHaveTextContent("zzz");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("no");
});

test("cancel drops the pending timer and keeps the old value", async () => {
	const screen = await render(Fixture, { wait: 200 });
	await screen.getByTestId("q").fill("qqq");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("yes");

	await screen.getByTestId("cancel").click();
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("no");
	// well past the original wait — nothing fired
	await new Promise((r) => setTimeout(r, 300));
	expect(text(screen.getByTestId("debounced").element())).toBe("init");
});

test("setImmediately overrides the value without waiting", async () => {
	const screen = await render(Fixture, { wait: 5000 });
	await screen.getByTestId("q").fill("typed");
	await screen.getByTestId("set").click();
	await expect.element(screen.getByTestId("debounced")).toHaveTextContent("forced");
	await expect.element(screen.getByTestId("pending")).toHaveTextContent("no");
});
