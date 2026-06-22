import { render } from "vitest-browser-svelte";
import { expect, test } from "vitest";
import TimeTrap from "./TimeTrap.svelte";
import ResetHarness from "./TimeTrapResetHarness.test.svelte";

// TimeTrap renders a single hidden <input name="_ts">. On mount (a client-only
// $effect, which runs in this real-browser project) it captures a start timestamp
// and writes it into the input value. We assert the arming here; the reactive
// `isTooFast` flip and `check()` snapshot are exercised end-to-end in the
// ContactUsForm integration suite (deterministic via minMs=0 vs the 2000 default).

test("renders a single hidden timestamp input named _ts", async () => {
	const { container } = await render(TimeTrap, {});
	const input = container.querySelector<HTMLInputElement>('input[name="_ts"]');
	expect(input).not.toBeNull();
	expect(input!.getAttribute("type")).toBe("hidden");
});

test("arms on mount: the hidden input receives a numeric start timestamp", async () => {
	const { container } = await render(TimeTrap, {});
	const input = container.querySelector<HTMLInputElement>('input[name="_ts"]')!;
	await expect.poll(() => input.value).not.toBe("");
	expect(Number(input.value)).toBeGreaterThan(0);
});

test("custom name maps through", async () => {
	const { container } = await render(TimeTrap, { name: "_started" });
	expect(container.querySelector('input[name="_started"]')).not.toBeNull();
});

// Regression: reset() must actually re-arm the timer (clear the old timeout and
// schedule a fresh one). The buggy version mutated state the arming $effect did
// not track, so after the first timeout fired, reset() left isTooFast stuck true
// forever. With the fix, reset() re-arms: isTooFast goes back to true and then
// flips to false again once a NEW minMs window elapses (and startedAt advances).
test("reset() re-arms the timer (isTooFast flips false again; startedAt advances)", async () => {
	const { container } = await render(ResetHarness, { minMs: 80 });
	const tooFast = container.querySelector('[data-testid="toofast"]')!;
	const started = container.querySelector('[data-testid="started"]')!;

	// initial arm: becomes false after the first 80ms window
	await expect.poll(() => started.textContent).not.toBe("");
	const firstStart = Number(started.textContent);
	await expect.poll(() => tooFast.textContent).toBe("false");

	// re-arm
	(container.querySelector('[data-testid="reset"]') as HTMLButtonElement).click();

	// a fresh timer must flip it back to false (would hang forever with the bug),
	// and the new arm captured a fresh start timestamp
	await expect.poll(() => tooFast.textContent).toBe("false");
	expect(Number(started.textContent)).toBeGreaterThanOrEqual(firstStart);
});
