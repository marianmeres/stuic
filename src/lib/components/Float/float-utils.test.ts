import { expect, test } from "vitest";
import {
	clampToViewport,
	FLOAT_PLACEMENTS,
	normalizeOffset,
	resolvePlacement,
	type FloatPlacement,
} from "./float-utils.js";

const SIZE = { width: 200, height: 100 };
const VIEW = { width: 1000, height: 800 };

test("normalizeOffset handles scalar, pair, partial and undefined", () => {
	expect(normalizeOffset(undefined)).toEqual({ x: 0, y: 0 });
	expect(normalizeOffset(16)).toEqual({ x: 16, y: 16 });
	expect(normalizeOffset({ x: 5, y: 7 })).toEqual({ x: 5, y: 7 });
	expect(normalizeOffset({ x: 5 })).toEqual({ x: 5, y: 0 });
	expect(normalizeOffset(undefined, 4)).toEqual({ x: 4, y: 4 });
});

test("resolvePlacement maps every preset to the expected corner/edge/center", () => {
	const o = 16;
	// maxX = 800, maxY = 700; centerX = 400, centerY = 350
	const expected: Record<FloatPlacement, { x: number; y: number }> = {
		"top-left": { x: 16, y: 16 },
		top: { x: 400, y: 16 },
		"top-right": { x: 784, y: 16 },
		left: { x: 16, y: 350 },
		center: { x: 400, y: 350 },
		right: { x: 784, y: 350 },
		"bottom-left": { x: 16, y: 684 },
		bottom: { x: 400, y: 684 },
		"bottom-right": { x: 784, y: 684 },
	};
	for (const placement of FLOAT_PLACEMENTS) {
		expect(resolvePlacement(placement, SIZE, VIEW, o), placement).toEqual(
			expected[placement]
		);
	}
});

test("resolvePlacement never returns a position outside [0, max]", () => {
	// offset larger than the available space gets clamped back in
	const p = resolvePlacement("top-right", SIZE, VIEW, 5000);
	expect(p.x).toBeGreaterThanOrEqual(0);
	expect(p.x).toBeLessThanOrEqual(VIEW.width - SIZE.width);
});

test("clampToViewport keeps the element fully on-screen", () => {
	expect(clampToViewport({ x: -50, y: -50 }, SIZE, VIEW)).toEqual({ x: 0, y: 0 });
	// maxX = 1000-200 = 800, maxY = 800-100 = 700
	expect(clampToViewport({ x: 5000, y: 5000 }, SIZE, VIEW)).toEqual({
		x: 800,
		y: 700,
	});
	// inside stays put
	expect(clampToViewport({ x: 123, y: 45 }, SIZE, VIEW)).toEqual({ x: 123, y: 45 });
});

test("clampToViewport honors a margin", () => {
	const m = 10;
	expect(clampToViewport({ x: -50, y: -50 }, SIZE, VIEW, m)).toEqual({
		x: 10,
		y: 10,
	});
	// maxX = 1000-200-10 = 790
	expect(clampToViewport({ x: 5000, y: 5000 }, SIZE, VIEW, m)).toEqual({
		x: 790,
		y: 690,
	});
});

test("clampToViewport pins an oversized element to the leading edge", () => {
	const big = { width: 2000, height: 100 };
	const p = clampToViewport({ x: 500, y: 500 }, big, VIEW, 0);
	expect(p.x).toBe(0); // wider than viewport -> pinned left
	expect(p.y).toBe(500); // height fits -> y unchanged
});
