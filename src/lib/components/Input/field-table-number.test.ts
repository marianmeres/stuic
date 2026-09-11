import { assert, test } from "vitest";
import {
	decimalSeparator,
	formatCellNumber,
	parseCellNumber,
} from "./field-table-number.js";

test("decimalSeparator: '.' for en, ',' for sk, '.' for garbage", () => {
	assert.equal(decimalSeparator("en"), ".");
	assert.equal(decimalSeparator("en-US"), ".");
	assert.equal(decimalSeparator("sk"), ",");
	assert.equal(decimalSeparator("de-DE"), ",");
	assert.equal(decimalSeparator("not-a-locale-!!"), ".");
});

test("parse: '.' is always the decimal separator", () => {
	assert.deepEqual(parseCellNumber("4.2", "sk"), { ok: true, value: 4.2 });
	assert.deepEqual(parseCellNumber("4.2", "en"), { ok: true, value: 4.2 });
	assert.deepEqual(parseCellNumber("12", "sk"), { ok: true, value: 12 });
	assert.deepEqual(parseCellNumber("-3.5", "en"), { ok: true, value: -3.5 });
	assert.deepEqual(parseCellNumber(".5", "en"), { ok: true, value: 0.5 });
	// a trailing dot mid-typing is a number, not an error
	assert.deepEqual(parseCellNumber("4.", "en"), { ok: true, value: 4 });
});

test("parse: ',' is the decimal separator only under a ','-locale", () => {
	assert.deepEqual(parseCellNumber("4,2", "sk"), { ok: true, value: 4.2 });
	assert.deepEqual(parseCellNumber("4,2", "de"), { ok: true, value: 4.2 });
	assert.deepEqual(parseCellNumber("4,2", "en"), { ok: false });
	// never silently read as grouping
	assert.deepEqual(parseCellNumber("1,000", "en"), { ok: false });
});

test("parse: inner whitespace incl. NBSP is stripped", () => {
	assert.deepEqual(parseCellNumber("1 000", "en"), { ok: true, value: 1000 });
	assert.deepEqual(parseCellNumber("1 000", "sk"), { ok: true, value: 1000 });
	assert.deepEqual(parseCellNumber("1 000,5", "sk"), { ok: true, value: 1000.5 });
	assert.deepEqual(parseCellNumber("  12  ", "en"), { ok: true, value: 12 });
});

test("parse: two separators, garbage, exponents and hex are errors", () => {
	assert.deepEqual(parseCellNumber("1.2.3", "en"), { ok: false });
	assert.deepEqual(parseCellNumber("1,2,3", "sk"), { ok: false });
	assert.deepEqual(parseCellNumber("1,000.5", "sk"), { ok: false });
	assert.deepEqual(parseCellNumber("abc", "en"), { ok: false });
	assert.deepEqual(parseCellNumber("12abc", "en"), { ok: false });
	assert.deepEqual(parseCellNumber("1e3", "en"), { ok: false });
	assert.deepEqual(parseCellNumber("0x10", "en"), { ok: false });
	assert.deepEqual(parseCellNumber("-", "en"), { ok: false });
	assert.deepEqual(parseCellNumber(".", "en"), { ok: false });
});

test("parse: blank is null, not an error", () => {
	assert.deepEqual(parseCellNumber("", "en"), { ok: true, value: null });
	assert.deepEqual(parseCellNumber("   ", "sk"), { ok: true, value: null });
});

test("parse: a unicode minus reads as a minus sign", () => {
	assert.deepEqual(parseCellNumber("−5", "en"), { ok: true, value: -5 });
});

test("format: locale decimal separator, no grouping, no rounding of 4.2", () => {
	assert.equal(formatCellNumber(4.2, "sk"), "4,2");
	assert.equal(formatCellNumber(4.2, "en"), "4.2");
	assert.equal(formatCellNumber(1000, "en"), "1000");
	assert.equal(formatCellNumber(1000000.25, "sk"), "1000000,25");
	assert.equal(formatCellNumber(-3, "en"), "-3");
	assert.equal(formatCellNumber(0.1 + 0.2, "en"), "0.30000000000000004");
});

test("format: latin digits regardless of locale; non-finite is blank", () => {
	assert.equal(formatCellNumber(12, "ar-EG"), "12");
	assert.equal(formatCellNumber(NaN, "en"), "");
	assert.equal(formatCellNumber(Infinity, "en"), "");
});

test("format ∘ parse round-trips under both locales", () => {
	for (const locale of ["en", "sk"]) {
		for (const n of [0, 1, -1, 4.2, 1000, 0.001, 123456.789]) {
			const r = parseCellNumber(formatCellNumber(n, locale), locale);
			assert.deepEqual(r, { ok: true, value: n }, `${locale}: ${n}`);
		}
	}
});
