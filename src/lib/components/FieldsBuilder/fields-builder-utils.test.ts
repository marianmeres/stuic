import { assert, test } from "vitest";
import type { FieldDef, FieldOptionDef } from "./types.js";
import {
	DEFAULT_FIELD_TYPES,
	DEFAULT_KEY_PATTERN,
	getLocalizedText,
	isKeyReserved,
	slugifyKey,
	uniqueKey,
	validateFieldDefs,
} from "./utils.js";

// ----------------------------------------------------------------- slugifyKey

test("slugifyKey: basic label to snake_case", () => {
	assert.equal(slugifyKey("Vintage Year"), "vintage_year");
	assert.equal(slugifyKey("  Frame   number "), "frame_number");
	assert.equal(slugifyKey("already_a_key"), "already_a_key");
});

test("slugifyKey: transliterates diacritics", () => {
	assert.equal(slugifyKey("Ročník"), "rocnik");
	assert.equal(slugifyKey("Šírka (cm)"), "sirka_cm");
	assert.equal(slugifyKey("Žltá říčka"), "zlta_ricka");
});

test("slugifyKey: non-letter starts get an f_ prefix, empty stays empty", () => {
	assert.equal(slugifyKey("2024 vintage"), "f_2024_vintage");
	assert.equal(slugifyKey("42"), "f_42");
	assert.equal(slugifyKey(""), "");
	assert.equal(slugifyKey("!!!"), "");
});

test("slugifyKey: always satisfies the default key pattern (when non-empty)", () => {
	for (const input of ["Ročník", "2024 vintage", "A - B / C", "x".repeat(200)]) {
		const slug = slugifyKey(input);
		assert.ok(DEFAULT_KEY_PATTERN.test(slug), `${input} -> ${slug}`);
	}
});

test("slugifyKey: truncates to maxLength without a trailing underscore", () => {
	const slug = slugifyKey("aaa bbb ccc", 7);
	assert.equal(slug, "aaa_bbb");
	const slug2 = slugifyKey("aaa bbb", 4);
	assert.equal(slug2, "aaa");
});

// ------------------------------------------------------------------ uniqueKey

test("uniqueKey: returns base when free, suffixes when taken", () => {
	const taken = new Set(["color", "color_2"]);
	assert.equal(
		uniqueKey("color", (k) => taken.has(k)),
		"color_3"
	);
	assert.equal(
		uniqueKey("size", (k) => taken.has(k)),
		"size"
	);
	assert.equal(
		uniqueKey("", () => true),
		""
	);
});

test("uniqueKey: truncates the base so the suffixed key fits maxLength", () => {
	const base = "a".repeat(10);
	const key = uniqueKey(base, (k) => k === base, 10);
	assert.equal(key.length <= 10, true);
	assert.equal(key, "a".repeat(8) + "_2");
});

// ----------------------------------------------------------- getLocalizedText

test("getLocalizedText: plain strings, records, preference and fallbacks", () => {
	assert.equal(getLocalizedText("hello"), "hello");
	assert.equal(getLocalizedText({ en: "hello", sk: "ahoj" }, "sk"), "ahoj");
	assert.equal(getLocalizedText({ en: "hello" }, "sk"), "hello");
	assert.equal(getLocalizedText(undefined), "");
	assert.equal(getLocalizedText({}), "");
});

// -------------------------------------------------------------- isKeyReserved

test("isKeyReserved: array and predicate forms", () => {
	assert.equal(isKeyReserved("id", ["id", "type"]), true);
	assert.equal(isKeyReserved("color", ["id"]), false);
	assert.equal(
		isKeyReserved("x_internal", (k) => k.startsWith("x_")),
		true
	);
	assert.equal(isKeyReserved("anything"), false);
});

// ---------------------------------------------------------- validateFieldDefs

const TYPES = DEFAULT_FIELD_TYPES;

function def(overrides: Partial<FieldDef> = {}): FieldDef {
	return { key: "color", type: "text", label: "Color", ...overrides };
}

test("validateFieldDefs: valid list", () => {
	const res = validateFieldDefs([def(), def({ key: "size", label: "Size" })], {
		types: TYPES,
	});
	assert.equal(res.valid, true);
	assert.equal(res.message, "");
	assert.deepEqual(res.rowErrors, [null, null]);
});

test("validateFieldDefs: label required (incl. localized with defaultLanguage)", () => {
	const res = validateFieldDefs([def({ label: "" })], { types: TYPES });
	assert.equal(res.valid, false);
	assert.equal(res.rowErrors[0]?.label, "err_label_required");

	// localized: any non-empty entry counts (defaultLanguage preferred for reading)
	const res2 = validateFieldDefs([def({ label: { en: "Color" } })], {
		types: TYPES,
		defaultLanguage: "sk",
	});
	assert.equal(res2.valid, true);
});

test("validateFieldDefs: key required / pattern / maxlength / duplicate / reserved", () => {
	const res = validateFieldDefs(
		[
			def({ key: "" }),
			def({ key: "Bad Key", label: "B" }),
			def({ key: "dup", label: "C" }),
			def({ key: "dup", label: "D" }),
			def({ key: "id", label: "E" }),
			def({ key: "x".repeat(99), label: "F" }),
		],
		{ types: TYPES, reservedKeys: ["id"] }
	);
	assert.equal(res.valid, false);
	assert.equal(res.rowErrors[0]?.key, "err_key_required");
	assert.equal(res.rowErrors[1]?.key, "err_key_pattern");
	assert.equal(res.rowErrors[2]?.key, "err_key_duplicate");
	assert.equal(res.rowErrors[3]?.key, "err_key_duplicate");
	assert.equal(res.rowErrors[4]?.key, "err_key_reserved");
	assert.equal(res.rowErrors[5]?.key, "err_key_maxlength");
	// the summary message is the first error found
	assert.equal(res.message, "err_key_required");
});

test("validateFieldDefs: custom keyPattern and keyMaxLength", () => {
	const res = validateFieldDefs([def({ key: "UPPER" })], {
		types: TYPES,
		keyPattern: /^[A-Z]+$/,
		keyMaxLength: 10,
	});
	assert.equal(res.valid, true);
});

test("validateFieldDefs: choice types need >=1 option with non-empty unique values", () => {
	const select = (options?: FieldOptionDef[]) =>
		def({ key: "c", label: "C", type: "select", options });
	assert.equal(
		validateFieldDefs([select(undefined)], { types: TYPES }).rowErrors[0]?.options,
		"err_options_required"
	);
	assert.equal(
		validateFieldDefs([select([{ value: "", label: "A" }])], { types: TYPES })
			.rowErrors[0]?.options,
		"err_option_value_required"
	);
	assert.equal(
		validateFieldDefs(
			[
				select([
					{ value: "a", label: "A" },
					{ value: "a", label: "B" },
				]),
			],
			{ types: TYPES }
		).rowErrors[0]?.options,
		"err_option_value_duplicate"
	);
	assert.equal(
		validateFieldDefs(
			[
				select([
					{ value: "a", label: "A" },
					{ value: "b", label: "B" },
				]),
			],
			{ types: TYPES }
		).valid,
		true
	);
});

test("validateFieldDefs: unknown types round-trip without blocking, keys still occupy the key space", () => {
	const res = validateFieldDefs(
		[def({ key: "mystery", label: "", type: "wormhole" }), def({ key: "color" })],
		{ types: TYPES }
	);
	// the unknown row is not validated at all (empty label tolerated) ...
	assert.equal(res.valid, true);
	// ... but its key still collides with a known row's key
	const res2 = validateFieldDefs(
		[def({ key: "color", label: "X", type: "wormhole" }), def({ key: "color" })],
		{ types: TYPES }
	);
	assert.equal(res2.rowErrors[0], null); // unknown row: no errors reported
	assert.equal(res2.rowErrors[1]?.key, "err_key_duplicate");
});

test("validateFieldDefs: maxFields", () => {
	const res = validateFieldDefs([def(), def({ key: "b", label: "B" })], {
		types: TYPES,
		maxFields: 1,
	});
	assert.equal(res.valid, false);
	assert.equal(res.message, "err_max_fields");
});

test("validateFieldDefs: t translates and receives values", () => {
	const res = validateFieldDefs([def({ key: "x".repeat(99), label: "F" })], {
		types: TYPES,
		t: (k, values) => (k === "err_key_maxlength" ? `too long ${values?.max}` : k),
	});
	assert.equal(res.rowErrors[0]?.key, "too long 63");
});

test("validateFieldDefs: without types option, options/type membership is not checked", () => {
	const res = validateFieldDefs([def({ type: "anything" })], {});
	assert.equal(res.valid, true);
});

test("validateFieldDefs: pattern/length run on the RAW key — padded keys fail", () => {
	const res = validateFieldDefs([def({ key: "color " })], { types: TYPES });
	assert.equal(res.valid, false);
	assert.equal(res.rowErrors[0]?.key, "err_key_pattern");
	// but presence is still a trimmed check
	const res2 = validateFieldDefs([def({ key: "   " })], { types: TYPES });
	assert.equal(res2.rowErrors[0]?.key, "err_key_required");
});
