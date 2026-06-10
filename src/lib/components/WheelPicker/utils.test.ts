import { expect, test, describe } from "vitest";
import {
	mod,
	clamp,
	forceOdd,
	normalizeOptions,
	centerGlobalIndex,
	realIndexFromGlobal,
	resolveTiles,
	homeBase,
	driftTiles,
	nextEnabledIndex,
	indexOfValue,
	nearestGlobalIndex,
	MIN_RUNWAY_PX,
} from "./utils.js";

// These pure functions ARE the WheelPicker's correctness core: scrollTop -> selected
// option, index wrap/clamp, and the loop "teleport" math. The component is a thin
// native-scroll shell around them, so this node suite carries the bulk of the proof.

describe("mod", () => {
	test("wraps positives", () => {
		expect(mod(7, 5)).toBe(2);
		expect(mod(5, 5)).toBe(0);
		expect(mod(0, 5)).toBe(0);
	});
	test("wraps negatives into [0, m)", () => {
		expect(mod(-1, 5)).toBe(4);
		expect(mod(-5, 5)).toBe(0);
		expect(mod(-7, 5)).toBe(3);
	});
	test("guards a non-positive modulus", () => {
		expect(mod(3, 0)).toBe(0);
	});
});

describe("clamp", () => {
	test("clamps to bounds", () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
	});
	test("returns lo when range is inverted", () => {
		expect(clamp(5, 10, 0)).toBe(10);
	});
});

describe("forceOdd", () => {
	test("keeps odd, bumps even, floors to >=1", () => {
		expect(forceOdd(5)).toBe(5);
		expect(forceOdd(4)).toBe(5);
		expect(forceOdd(0)).toBe(1);
		expect(forceOdd(-3)).toBe(1);
		expect(forceOdd(2)).toBe(3);
	});
});

describe("normalizeOptions", () => {
	test("primitives become {label,value}", () => {
		expect(normalizeOptions([1, 2])).toEqual([
			{ label: "1", value: 1 },
			{ label: "2", value: 2 },
		]);
		expect(normalizeOptions(["a"])).toEqual([{ label: "a", value: "a" }]);
	});
	test("objects pass through with disabled normalized to boolean", () => {
		expect(normalizeOptions([{ label: "Nine", value: 9, disabled: true }])).toEqual([
			{ label: "Nine", value: 9, disabled: true },
		]);
	});
	test("object label falls back to value when absent", () => {
		// @ts-expect-error intentionally missing label
		expect(normalizeOptions([{ value: 42 }])).toEqual([
			{ label: "42", value: 42, disabled: false },
		]);
	});
	test("empty / nullish input yields []", () => {
		expect(normalizeOptions([])).toEqual([]);
		// @ts-expect-error nullish
		expect(normalizeOptions(null)).toEqual([]);
	});
});

describe("centerGlobalIndex", () => {
	test("rounds scrollTop / itemHeight", () => {
		expect(centerGlobalIndex(0, 36)).toBe(0);
		expect(centerGlobalIndex(36, 36)).toBe(1);
		expect(centerGlobalIndex(54, 36)).toBe(2); // 1.5 rounds up
		expect(centerGlobalIndex(53, 36)).toBe(1); // 1.47 rounds down
	});
	test("absorbs sub-pixel momentum offsets", () => {
		expect(centerGlobalIndex(108.4, 36)).toBe(3);
		expect(centerGlobalIndex(107.6, 36)).toBe(3);
	});
	test("guards zero itemHeight", () => {
		expect(centerGlobalIndex(100, 0)).toBe(0);
	});
});

describe("realIndexFromGlobal", () => {
	test("loop wraps (including negatives)", () => {
		expect(realIndexFromGlobal(0, 5, true)).toBe(0);
		expect(realIndexFromGlobal(5, 5, true)).toBe(0);
		expect(realIndexFromGlobal(7, 5, true)).toBe(2);
		expect(realIndexFromGlobal(-1, 5, true)).toBe(4);
	});
	test("non-loop clamps", () => {
		expect(realIndexFromGlobal(-3, 5, false)).toBe(0);
		expect(realIndexFromGlobal(99, 5, false)).toBe(4);
		expect(realIndexFromGlobal(2, 5, false)).toBe(2);
	});
	test("guards empty options", () => {
		expect(realIndexFromGlobal(3, 0, true)).toBe(0);
	});
});

describe("resolveTiles", () => {
	const H = 36;
	const containerH = 5 * H; // 180

	test("non-loop is always a single copy", () => {
		expect(resolveTiles(3, 60, H, containerH, false)).toBe(1);
	});
	test("empty options -> 1", () => {
		expect(resolveTiles(3, 0, H, containerH, true)).toBe(1);
	});
	test("result is always odd and >= 3", () => {
		for (const n of [1, 2, 3, 5, 12, 24, 60]) {
			const t = resolveTiles(3, n, H, containerH, true);
			expect(t).toBeGreaterThanOrEqual(3);
			expect(t % 2).toBe(1);
		}
	});
	test("every result satisfies the runway invariant floor(tiles/2)*tilePx >= need", () => {
		for (const n of [1, 2, 3, 4, 5, 12, 24, 60]) {
			const tiles = resolveTiles(3, n, H, containerH, true);
			const tilePx = n * H;
			expect(Math.floor(tiles / 2) * tilePx).toBeGreaterThanOrEqual(
				Math.max(containerH, MIN_RUNWAY_PX)
			);
		}
	});
	test("large N stays compact (60 items -> 5 tiles, not dozens)", () => {
		// tilePx=2160 < MIN_RUNWAY_PX(2400) so it bumps once: floor(5/2)*2160=4320 >= 2400
		expect(resolveTiles(3, 60, H, containerH, true)).toBe(5);
	});
	test("small N auto-bumps so floor(tiles/2)*tilePx covers the runway", () => {
		const n = 4;
		const tiles = resolveTiles(3, n, H, containerH, true);
		const tilePx = n * H;
		expect(Math.floor(tiles / 2) * tilePx).toBeGreaterThanOrEqual(
			Math.max(containerH, MIN_RUNWAY_PX)
		);
	});
	test("requested acts as an odd floor", () => {
		// requested 7 -> never fewer than 7 even when fewer would satisfy runway
		expect(resolveTiles(7, 60, H, containerH, true)).toBe(7);
		// even requested is bumped odd
		expect(resolveTiles(6, 60, H, containerH, true)).toBe(7);
	});
});

describe("homeBase / driftTiles — the loop teleport invariant", () => {
	test("homeBase puts real 0 in the middle tile", () => {
		expect(homeBase(5, 10)).toBe(20); // floor(5/2)=2 tiles down * 10
		expect(homeBase(3, 60)).toBe(60);
	});
	test("driftTiles is floor-based (which tile), not rounded", () => {
		const n = 10;
		const homeTile = 2; // tiles=5
		expect(driftTiles(2 * n + 0, n, homeTile)).toBe(0); // home tile start
		expect(driftTiles(2 * n + 9, n, homeTile)).toBe(0); // still home tile (no premature jump)
		expect(driftTiles(3 * n + 0, n, homeTile)).toBe(1); // one tile down
		expect(driftTiles(0, n, homeTile)).toBe(-2); // two tiles up
	});
	test("teleporting by driftTiles returns to the home tile AND preserves the value", () => {
		const n = 7;
		const tiles = 5;
		const homeTile = Math.floor(tiles / 2);
		const hb = homeBase(tiles, n);
		for (let gi = 0; gi < tiles * n; gi++) {
			const drift = driftTiles(gi, n, homeTile);
			const teleported = gi - drift * n; // == scrollTop - drift*tilePx, in index units
			// lands back in the home tile -> drift becomes 0 (no oscillation)
			expect(driftTiles(teleported, n, homeTile)).toBe(0);
			// real index (the committed value) is unchanged by the teleport
			expect(mod(teleported, n)).toBe(mod(gi, n));
			// and it really is within the home tile's index range
			expect(teleported).toBeGreaterThanOrEqual(hb);
			expect(teleported).toBeLessThan(hb + n);
		}
	});
});

describe("nextEnabledIndex", () => {
	const opts = [
		{ disabled: false },
		{ disabled: true },
		{ disabled: true },
		{ disabled: false },
		{ disabled: false },
	];
	test("returns the start when it is enabled", () => {
		expect(nextEnabledIndex(0, 1, opts, false)).toBe(0);
		expect(nextEnabledIndex(3, -1, opts, false)).toBe(3);
	});
	test("skips disabled in the travel direction", () => {
		expect(nextEnabledIndex(1, 1, opts, false)).toBe(3); // 1,2 disabled -> 3
		expect(nextEnabledIndex(2, -1, opts, false)).toBe(0); // 2,1 disabled -> 0
	});
	test("non-loop gives up at the edge (returns last reached even if disabled)", () => {
		const allTailDisabled = [{ disabled: false }, { disabled: true }, { disabled: true }];
		expect(nextEnabledIndex(2, 1, allTailDisabled, false)).toBe(2);
	});
	test("loop wraps around to find an enabled option", () => {
		const wrap = [{ disabled: true }, { disabled: true }, { disabled: false }];
		expect(nextEnabledIndex(0, -1, wrap, true)).toBe(2); // 0,-1->2 enabled
	});
	test("all-disabled returns the reduced start without looping forever", () => {
		const allOff = [{ disabled: true }, { disabled: true }];
		expect(nextEnabledIndex(0, 1, allOff, true)).toBe(0);
		expect(nextEnabledIndex(5, 1, allOff, true)).toBe(mod(5, 2));
	});
	test("empty options returns start unchanged", () => {
		expect(nextEnabledIndex(3, 1, [], false)).toBe(3);
	});
});

describe("nearestGlobalIndex — wrap travels the short way", () => {
	const n = 60;
	test("59 -> 00 advances forward one step (no rewind)", () => {
		// at global 59 (real 59), targeting real 0 should go to 60 (one step down), not 0
		expect(nearestGlobalIndex(59, 0, n)).toBe(60);
		expect(mod(nearestGlobalIndex(59, 0, n), n)).toBe(0);
	});
	test("00 -> 59 steps backward one (the short way up)", () => {
		expect(nearestGlobalIndex(0, 59, n)).toBe(-1);
		expect(mod(nearestGlobalIndex(0, 59, n), n)).toBe(59);
	});
	test("works from any tile offset, always shortest signed delta", () => {
		const hb = 5 * n; // some home-tile base
		expect(nearestGlobalIndex(hb + 59, 0, n)).toBe(hb + 60); // forward 1
		expect(nearestGlobalIndex(hb + 0, 59, n)).toBe(hb - 1); // back 1
		expect(nearestGlobalIndex(hb + 10, 12, n)).toBe(hb + 12); // forward 2
		expect(nearestGlobalIndex(hb + 12, 10, n)).toBe(hb + 10); // back 2
	});
	test("the result always reduces to the requested real index", () => {
		for (let cur = 0; cur < 2 * n; cur++) {
			for (const r of [0, 1, 30, 59]) {
				expect(mod(nearestGlobalIndex(cur, r, n), n)).toBe(r);
			}
		}
	});
	test("never travels more than half the wheel", () => {
		for (let cur = 0; cur < 2 * n; cur++) {
			for (let r = 0; r < n; r++) {
				expect(Math.abs(nearestGlobalIndex(cur, r, n) - cur)).toBeLessThanOrEqual(n / 2);
			}
		}
	});
	test("ties (exactly half) resolve forward", () => {
		expect(nearestGlobalIndex(0, 30, n)).toBe(30); // +30, not -30
	});
	test("guards empty options", () => {
		expect(nearestGlobalIndex(7, 0, 0)).toBe(7);
	});
});

describe("indexOfValue", () => {
	const opts = normalizeOptions([10, 20, 30]);
	test("finds by strict value equality", () => {
		expect(indexOfValue(opts, 20)).toBe(1);
		expect(indexOfValue(opts, 30)).toBe(2);
	});
	test("returns -1 when absent", () => {
		expect(indexOfValue(opts, 99)).toBe(-1);
	});
});
