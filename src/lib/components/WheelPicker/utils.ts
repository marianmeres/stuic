// ============================================================================
// WheelPicker — framework-free index math
//
// The component leans entirely on native scroll + CSS scroll-snap. ALL of its
// correctness-critical logic is the pure index arithmetic below: turning a
// scrollTop into a selected option, wrapping/clamping indices, and computing the
// "teleport" that makes the loop infinite. Keeping it here (no Svelte, no DOM)
// means it is exhaustively unit-testable in the fast node project (utils.test.ts).
// ============================================================================

export interface WheelPickerOption<T = string | number> {
	/** Visible text for the row (and what gets announced to screen readers). */
	label: string;
	/** The value committed to `bind:value` when this row is selected. */
	value: T;
	/** When true the row cannot be selected (auto-skipped on settle/keyboard). */
	disabled?: boolean;
}

/** What callers may pass: a bare primitive (used as both label and value) or a full option. */
export type WheelPickerOptionInput<T = string | number> =
	| string
	| number
	| WheelPickerOption<T>;

/** Px runway (each direction from the home tile) the loop buffer must guarantee so a
 *  realistic fling never runs off the rendered content before it comes to rest. */
export const MIN_RUNWAY_PX = 2400;

/** Positive modulo — `((n % m) + m) % m` — so negative indices wrap correctly. */
export function mod(n: number, m: number): number {
	if (m <= 0) return 0;
	return ((n % m) + m) % m;
}

export function clamp(n: number, lo: number, hi: number): number {
	if (hi < lo) return lo;
	return Math.min(hi, Math.max(lo, n));
}

/** Force an integer >= 1 and odd, so there is always a single exact center row. */
export function forceOdd(n: number): number {
	let v = Math.max(1, Math.round(n));
	if (v % 2 === 0) v += 1;
	return v;
}

/** Normalize mixed input to `{ label, value, disabled }`. */
export function normalizeOptions<T = string | number>(
	options: WheelPickerOptionInput<T>[]
): WheelPickerOption<T>[] {
	return (options ?? []).map((o) => {
		if (o !== null && typeof o === "object" && "value" in o) {
			const opt = o as WheelPickerOption<T>;
			return {
				label: String(opt.label ?? opt.value),
				value: opt.value,
				disabled: !!opt.disabled,
			};
		}
		return { label: String(o), value: o as unknown as T };
	});
}

/**
 * The rendered row whose center currently sits under the selection band.
 * With the top/bottom center spacer, row `j` is centered exactly when
 * `scrollTop === j * itemHeight`, so the global (buffered) index is a rounded ratio.
 */
export function centerGlobalIndex(scrollTop: number, itemHeight: number): number {
	if (itemHeight <= 0) return 0;
	return Math.round(scrollTop / itemHeight);
}

/** Map a global (buffered) index to the real option index — wrap when looping, clamp otherwise. */
export function realIndexFromGlobal(
	globalIndex: number,
	n: number,
	loop: boolean
): number {
	if (n <= 0) return 0;
	return loop ? mod(globalIndex, n) : clamp(globalIndex, 0, n - 1);
}

/**
 * Number of identical tiles to render for the infinite buffer. Auto-grows (staying
 * odd, min 3) until the runway from the home tile to either end covers both the
 * viewport and `MIN_RUNWAY_PX`, so a single fling can't exhaust the buffer at rest.
 * Returns 1 when not looping (single copy, clamped).
 */
export function resolveTiles(
	requested: number,
	n: number,
	itemHeight: number,
	containerHeight: number,
	loop: boolean,
	minRunwayPx: number = MIN_RUNWAY_PX
): number {
	if (!loop || n <= 0) return 1;
	let tiles = Math.max(3, Math.round(requested));
	if (tiles % 2 === 0) tiles += 1;
	const tilePx = n * itemHeight;
	if (tilePx > 0) {
		const need = Math.max(containerHeight, minRunwayPx);
		// runway on each side = floor(tiles/2) full tiles
		while (Math.floor(tiles / 2) * tilePx < need) tiles += 2;
	}
	return tiles;
}

/** Global index of real index 0 in the middle (home) tile. */
export function homeBase(tiles: number, n: number): number {
	return Math.floor(tiles / 2) * n;
}

/**
 * How many whole tiles the centered row has drifted from the home tile.
 * Floor-based (which tile are we in), NOT round-based: after teleporting by this
 * many tiles the center lands back in the home tile with drift 0 — no oscillation,
 * and the real index (`gi mod n`) is unchanged, so the teleport is invisible.
 */
export function driftTiles(globalIndex: number, n: number, homeTile: number): number {
	if (n <= 0) return 0;
	return Math.floor(globalIndex / n) - homeTile;
}

/**
 * Nearest selectable (non-disabled) real index starting at `start`, searching in
 * `dir`. Returns `start` (reduced) if it is already enabled. Loop wraps; non-loop
 * stops at the edge and returns the last index reached even if disabled. If every
 * option is disabled, returns the reduced start.
 */
export function nextEnabledIndex(
	start: number,
	dir: 1 | -1,
	options: readonly { disabled?: boolean }[],
	loop: boolean
): number {
	const n = options.length;
	if (n === 0) return start;
	let i = loop ? mod(start, n) : clamp(start, 0, n - 1);
	for (let step = 0; step < n; step++) {
		if (!options[i]?.disabled) return i;
		let next = i + dir;
		if (loop) {
			next = mod(next, n);
		} else if (next < 0 || next > n - 1) {
			return i; // hit the edge, give up
		}
		i = next;
	}
	return i; // all disabled
}

/** Index of the option matching `value` (strict equality), or -1. */
export function indexOfValue<T>(options: WheelPickerOption<T>[], value: T): number {
	return options.findIndex((o) => o.value === value);
}

/**
 * Global index of the copy of `realIndex` NEAREST `currentGlobal` (shortest signed path,
 * ties resolve forward). This is what makes a wrap travel naturally: from 59 with n=60,
 * targeting real 0 returns currentGlobal+1 (one step down) rather than rewinding 59 rows
 * up to the same tile's 0. Used for programmatic/keyboard moves in loop mode.
 */
export function nearestGlobalIndex(
	currentGlobal: number,
	realIndex: number,
	n: number
): number {
	if (n <= 0) return currentGlobal;
	let delta = mod(realIndex - mod(currentGlobal, n), n); // 0..n-1
	if (delta > n / 2) delta -= n; // fold into (-n/2, n/2]
	return currentGlobal + delta;
}
