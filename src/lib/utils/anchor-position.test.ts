import { expect, test } from "vitest";
import { buildPositionTryFallbacks } from "./anchor-position.js";

// Fast node-side companion to the browser hard proof: the pure
// position-try-fallbacks string builder needs no DOM, so it stays in the node
// project as a cheap regression net (docs/component-testing/04-hard-cases-and-e2e.md).

const FLIPS = "flip-block, flip-inline, flip-block flip-inline";

test("top/bottom append inline span-left/span-right variants", () => {
	expect(buildPositionTryFallbacks("top")).toBe(
		`${FLIPS}, top span-left, top span-right`
	);
	expect(buildPositionTryFallbacks("bottom")).toBe(
		`${FLIPS}, bottom span-left, bottom span-right`
	);
});

test("left/right append block span-top/span-bottom variants", () => {
	expect(buildPositionTryFallbacks("left")).toBe(
		`${FLIPS}, left span-top, left span-bottom`
	);
	expect(buildPositionTryFallbacks("right")).toBe(
		`${FLIPS}, right span-top, right span-bottom`
	);
});

test("centered/unknown positions fall back to flips only", () => {
	expect(buildPositionTryFallbacks("center")).toBe(FLIPS);
	expect(buildPositionTryFallbacks("")).toBe(FLIPS);
});
