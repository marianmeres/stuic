import { describe, expect, it } from "vitest";
import { formatMinorUnits, money, parseToMinorUnits } from "./money-units.js";

describe("formatMinorUnits", () => {
	it("formats cents to a major-unit decimal string (default scale=100, decimals=2)", () => {
		expect(formatMinorUnits(100)).toBe("1.00");
		expect(formatMinorUnits(1999)).toBe("19.99");
		expect(formatMinorUnits(2000)).toBe("20.00");
		expect(formatMinorUnits(0)).toBe("0.00");
	});

	it("honors custom scale/decimals", () => {
		expect(formatMinorUnits(5, { scale: 1000, decimals: 3 })).toBe("0.005");
		expect(formatMinorUnits(1250, { scale: 1000, decimals: 3 })).toBe("1.250");
	});

	it("accepts numeric strings", () => {
		expect(formatMinorUnits("1999")).toBe("19.99");
	});

	it("passes non-numeric input through stringified (not silently zeroed)", () => {
		expect(formatMinorUnits("abc")).toBe("abc");
		expect(formatMinorUnits(null)).toBe("");
		expect(formatMinorUnits(undefined)).toBe("");
	});
});

describe("parseToMinorUnits", () => {
	it("parses a major-unit decimal into integer minor units", () => {
		expect(parseToMinorUnits("1.00")).toBe(100);
		expect(parseToMinorUnits("19.99")).toBe(1999);
		// the headline contract: a whole value is not silently truncated
		expect(parseToMinorUnits("20.00")).toBe(2000);
	});

	it("honors custom scale/decimals", () => {
		expect(parseToMinorUnits("0.005", { scale: 1000, decimals: 3 })).toBe(5);
		expect(parseToMinorUnits("1.250", { scale: 1000, decimals: 3 })).toBe(1250);
	});

	it("round-trips with formatMinorUnits (including negatives)", () => {
		for (const cents of [0, 1, 99, 100, 1999, 2000, 123456, -1, -1999, -123456]) {
			expect(parseToMinorUnits(formatMinorUnits(cents))).toBe(cents);
		}
	});

	it("preserves the sign of negative amounts", () => {
		expect(formatMinorUnits(-1999)).toBe("-19.99");
		expect(parseToMinorUnits("-19.99")).toBe(-1999);
	});

	it("is NaN-safe (non-numeric → 0)", () => {
		expect(parseToMinorUnits("abc")).toBe(0);
		expect(parseToMinorUnits(null)).toBe(0);
		expect(parseToMinorUnits("")).toBe(0);
	});
});

describe("money", () => {
	// Output formatting (symbol/separators/placement) is locale-dependent, so we
	// assert the amount is present rather than pinning an exact string.
	it("formats minor units as a localized currency containing the amount", () => {
		expect(money(12345, "USD")).toMatch(/123[.,]45/);
	});

	it("treats null/undefined as zero", () => {
		expect(money(null, "USD")).toMatch(/0[.,]00/);
		expect(money(undefined, "USD")).toMatch(/0[.,]00/);
	});

	it("degrades gracefully for an invalid currency code", () => {
		// "ZZ" is not a well-formed ISO 4217 code → Intl throws → plain fallback.
		expect(money(1200, "ZZ")).toBe("12.00 ZZ");
	});
});
