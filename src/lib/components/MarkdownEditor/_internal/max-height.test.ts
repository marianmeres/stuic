import { assert, describe, test } from "vitest";
import {
	computeParentAvailable,
	DEFAULT_MAX_HEIGHT_VAR,
	maxHeightToCss,
	surfaceMaxHeight,
} from "./max-height.js";

describe("maxHeightToCss", () => {
	test("number → px", () => assert.equal(maxHeightToCss(320), "320px"));
	test("string passthrough", () => assert.equal(maxHeightToCss("40rem"), "40rem"));
	test("trims string", () => assert.equal(maxHeightToCss("  60vh "), "60vh"));
	test("nullish / empty → null", () => {
		assert.isNull(maxHeightToCss(undefined));
		assert.isNull(maxHeightToCss(null));
		assert.isNull(maxHeightToCss(""));
		assert.isNull(maxHeightToCss("   "));
	});
	test("non-finite number → null", () => {
		assert.isNull(maxHeightToCss(NaN));
		assert.isNull(maxHeightToCss(Infinity));
	});
});

// --- "long content" -------------------------------------------------------
// A long document must stop growing the surface (else the toolbar scrolls out
// of view). Even with NO parent constraint the surface keeps a finite cap, so
// the inner content scrolls instead.
describe("surfaceMaxHeight — long content / fixed cap", () => {
	test("no parent measurement → base cap unchanged", () => {
		assert.equal(surfaceMaxHeight(DEFAULT_MAX_HEIGHT_VAR, null), DEFAULT_MAX_HEIGHT_VAR);
		assert.equal(surfaceMaxHeight("40rem", null), "40rem");
	});
	test("default cap is a finite length, not 'none'", () => {
		// Guards against regressing to unbounded growth.
		assert.notInclude(DEFAULT_MAX_HEIGHT_VAR, "none");
		assert.include(DEFAULT_MAX_HEIGHT_VAR, "32rem");
	});
	test("non-positive parent height is ignored (falls back to base)", () => {
		assert.equal(surfaceMaxHeight("40rem", 0), "40rem");
		assert.equal(surfaceMaxHeight("40rem", -50), "40rem");
	});
});

// --- "available parent" ---------------------------------------------------
// When the parent constrains height, cap to the SMALLER of the configured cap
// and the measured available height.
describe("surfaceMaxHeight — capped to parent", () => {
	test("wraps base + available in min()", () => {
		assert.equal(surfaceMaxHeight("40rem", 300), "min(40rem, 300px)");
		assert.equal(
			surfaceMaxHeight(DEFAULT_MAX_HEIGHT_VAR, 480),
			`min(${DEFAULT_MAX_HEIGHT_VAR}, 480px)`
		);
	});
	test("rounds sub-pixel available", () => {
		assert.equal(surfaceMaxHeight("40rem", 299.6), "min(40rem, 300px)");
	});
});

describe("computeParentAvailable", () => {
	test("constrained parent → space from surface top to parent content bottom", () => {
		// parent bottom at 600, surface starts at 200 → 400px available
		assert.equal(computeParentAvailable({ fromTop: 200, parentBottom: 600 }), 400);
	});
	test("subtracts parent border + padding + bottom gap", () => {
		assert.equal(
			computeParentAvailable({
				fromTop: 100,
				parentBottom: 600,
				parentBorderBottom: 2,
				parentPaddingBottom: 8,
				bottomGap: 16,
			}),
			474 // 600 - 2 - 8 - 100 - 16
		);
	});
	test("floors sub-pixel results", () => {
		assert.equal(computeParentAvailable({ fromTop: 100.4, parentBottom: 500.9 }), 400);
	});
	test("non-positive → null (parent smaller than surface offset / not laid out)", () => {
		assert.isNull(computeParentAvailable({ fromTop: 600, parentBottom: 600 }));
		assert.isNull(computeParentAvailable({ fromTop: 700, parentBottom: 600 }));
	});

	// End-to-end: measured value flows into the surface cap.
	test("feeds surfaceMaxHeight — constrained parent caps below the base", () => {
		const available = computeParentAvailable({ fromTop: 150, parentBottom: 550 }); // 400
		assert.equal(
			surfaceMaxHeight(DEFAULT_MAX_HEIGHT_VAR, available),
			`min(${DEFAULT_MAX_HEIGHT_VAR}, 400px)`
		);
	});
});
