<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	/** Snapshot returned by `TimeTrap.check()`. */
	export interface TimeTrapSnapshot {
		/** Milliseconds elapsed since the timer armed. */
		elapsedMs: number;
		/** `true` when `elapsedMs < minMs`. */
		isTooFast: boolean;
		/** Epoch ms the timer armed at (client clock), or `undefined` before mount. */
		startedAt: number | undefined;
	}

	export interface Props extends Omit<HTMLInputAttributes, "value" | "name"> {
		/**
		 * Minimum time (ms) a genuine user is expected to need before submitting.
		 * Faster submissions are flagged via `isTooFast`. Default: 2000.
		 */
		minMs?: number;
		/**
		 * Whether the timer is armed. When false, `isTooFast` stays `false` and no
		 * timer runs. Default: true.
		 */
		enabled?: boolean;
		/**
		 * `true` until `minMs` has elapsed since mount, then `false`. Bindable and
		 * reactive — safe to read directly at submit time. Defaults to `true`
		 * (fail-safe: a submit before the timer arms counts as "too fast").
		 */
		isTooFast?: boolean;
		/**
		 * Milliseconds elapsed since the timer armed. Updated when the threshold
		 * flips and whenever `check()` runs. For an exact submit-time value call
		 * `check()`. Bindable. Default: 0.
		 */
		elapsedMs?: number;
		/**
		 * Epoch ms captured when the timer armed (client clock). Bindable. Also
		 * written into the rendered hidden input so it can ride along in a native
		 * form POST. NOTE: this is a client-side heuristic and is not tamper-proof;
		 * enforce real rate limiting server-side.
		 */
		startedAt?: number;
		/** Name of the rendered hidden timestamp input. Default: "_ts". */
		name?: string;
		id?: string;
		/** Underlying hidden `<input>` ref. Bindable. */
		input?: HTMLInputElement;
	}
</script>

<script lang="ts">
	import { getId } from "../../utils/get-id.js";

	let {
		minMs = 2000,
		enabled = true,
		isTooFast = $bindable(true),
		elapsedMs = $bindable(0),
		startedAt = $bindable(),
		name = "_ts",
		id = getId(),
		input = $bindable(),
		...rest
	}: Props = $props();

	/**
	 * Recompute `elapsedMs`/`isTooFast` from the current clock, write them back to
	 * the bindings, and return a fresh snapshot. Call at submit time for an exact
	 * reading (the reactive `isTooFast` binding is already accurate to timer
	 * resolution, but this also refreshes `elapsedMs`).
	 */
	export function check(): TimeTrapSnapshot {
		if (startedAt != null) {
			elapsedMs = Date.now() - startedAt;
			isTooFast = enabled ? elapsedMs < minMs : false;
		} else {
			isTooFast = enabled;
		}
		return { elapsedMs, isTooFast, startedAt };
	}

	// Re-arm nonce. Writing `startedAt`/`isTooFast`/`elapsedMs` inside the arming
	// $effect does NOT make the effect depend on them (only reads create deps), so
	// reset() can't re-arm by mutating those. Instead it bumps this tracked nonce,
	// which the $effect reads — re-running it clears the old timeout (via cleanup)
	// and schedules a fresh one from the new arm time.
	let armToken = $state(0);

	/** Re-arm the timer (e.g. after a "send another" reset). */
	export function reset(): void {
		armToken++;
	}

	// Arm on mount (client only — avoids SSR `Date.now()` in render and any
	// hydration mismatch). A single timeout flips `isTooFast` once the threshold
	// passes; no polling/ticking. Re-runs (re-arms) when `armToken` (reset),
	// `minMs`, or `enabled` change.
	$effect(() => {
		void armToken; // re-arm on reset()
		if (!enabled) {
			isTooFast = false;
			return;
		}
		const armedAt = Date.now();
		startedAt = armedAt;
		isTooFast = true;
		elapsedMs = 0;
		const t = setTimeout(() => {
			isTooFast = false;
			elapsedMs = Date.now() - armedAt;
		}, minMs);
		return () => clearTimeout(t);
	});
</script>

<input bind:this={input} {id} {name} type="hidden" value={startedAt ?? ""} {...rest} />
