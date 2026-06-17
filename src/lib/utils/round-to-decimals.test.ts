import { describe, expect, it } from "vitest";
import { roundToDecimals } from "./round-to-decimals.js";

describe("roundToDecimals", () => {
	it("rounds to the requested number of decimals", () => {
		expect(roundToDecimals(1.006, 2)).toBe(1.01);
		expect(roundToDecimals(1.004, 2)).toBe(1);
		expect(roundToDecimals(123.456, 2)).toBe(123.46);
		expect(roundToDecimals(123.454, 2)).toBe(123.45);
	});

	it("inherits Math.round's float-edge behavior (1.005 → 1, not 1.01)", () => {
		// 1.005 is not exactly representable in IEEE-754 — it lands just under, so
		// it rounds down. Matches Math.round and the carsinc original this ports.
		expect(roundToDecimals(1.005, 2)).toBe(1);
	});

	it("defaults to 5 decimal places", () => {
		expect(roundToDecimals(3.14159265)).toBe(3.14159);
	});

	it("handles 0 decimals (integer rounding)", () => {
		expect(roundToDecimals(2.5, 0)).toBe(3);
		expect(roundToDecimals(2.4, 0)).toBe(2);
	});

	it("is a no-op for already-short values", () => {
		expect(roundToDecimals(19.99, 2)).toBe(19.99);
		expect(roundToDecimals(0, 2)).toBe(0);
	});

	it("rounds negative values", () => {
		expect(roundToDecimals(-1.005, 2)).toBe(-1); // -1.005 * 100 = -100.49.. → -100
		expect(roundToDecimals(-1.236, 2)).toBe(-1.24);
	});
});
