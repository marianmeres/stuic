import { untrack } from "svelte";

/** A reactive getter: `() => someState`. */
export type WatchGetter<T> = () => T;

export interface WatchOptions {
	/**
	 * If `true`, the effect does not run on the initial pass — only once one of the
	 * sources changes afterwards.
	 * @default false
	 */
	lazy?: boolean;
}

type WatchCleanup = void | (() => void);

/**
 * Runs `effect` with the current and previous value(s) of `sources`, re-running whenever
 * a source changes. Only the source getters are tracked: the effect body runs inside
 * `untrack`, so reading other reactive state there does **not** subscribe to it. Use it
 * where a plain `$effect` would pick up incidental dependencies (e.g. a fetch keyed on a
 * query that also reads the current selection).
 *
 * It is a post-effect (`$effect`), so it must be called during component (or
 * `$effect.root`) initialization — the same rule as `$effect` itself. A function returned
 * from `effect` is run before the next run and on destroy, like an `$effect` cleanup.
 *
 * On the first run `previous` is `undefined` (single source) or `[]` (array sources),
 * which keeps destructuring like `([a, b], [prevA, prevB]) => …` safe.
 *
 * @example
 * ```ts
 * watch(
 * 	() => visible,
 * 	(isVisible, wasVisible) => {
 * 		if (wasVisible && !isVisible) opener?.focus();
 * 	}
 * );
 *
 * watch([() => query, () => page], ([q, p]) => load(q, p));
 * ```
 */
export function watch<T extends unknown[]>(
	sources: { [K in keyof T]: WatchGetter<T[K]> },
	effect: (values: T, previous: { [K in keyof T]: T[K] | undefined }) => WatchCleanup,
	options?: WatchOptions
): void;
export function watch<T>(
	source: WatchGetter<T>,
	effect: (value: T, previous: T | undefined) => WatchCleanup,
	options?: WatchOptions
): void;
export function watch(
	// the overloads carry the real types; the implementation has to accept both shapes
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sources: WatchGetter<any> | WatchGetter<any>[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	effect: (values: any, previous: any) => WatchCleanup,
	options: WatchOptions = {}
): void {
	const { lazy = false } = options;
	// `lazy` skips the first run — the sources still have to be read to subscribe
	let active = !lazy;
	let previous: unknown = Array.isArray(sources) ? [] : undefined;

	$effect(() => {
		const values: unknown = Array.isArray(sources) ? sources.map((s) => s()) : sources();
		if (!active) {
			active = true;
			previous = values;
			return;
		}
		const cleanup = untrack(() => effect(values, previous));
		previous = values;
		return cleanup;
	});
}
