import { assert, test } from "vitest";
import type {
	FieldColumnDef,
	FieldDef,
	FieldOptionDef,
	FieldTypeDef,
	FieldTypeExtraDef,
} from "./types.js";
import {
	DEFAULT_FIELD_TYPES,
	DEFAULT_KEY_PATTERN,
	getLocalizedText,
	isKeyReserved,
	resolveColumnTypes,
	seedExtraDefaults,
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

test("getLocalizedText: a preference chain is honoured in order before the first-entry fallback", () => {
	const text = { de: "hallo", en: "hello", sk: "ahoj" };
	assert.equal(getLocalizedText(text, ["sk", "en"]), "ahoj");
	// preferred missing -> next in the chain, NOT the record's first entry
	assert.equal(getLocalizedText(text, ["cs", "en"]), "hello");
	// an empty entry counts as missing
	assert.equal(getLocalizedText({ de: "hallo", sk: "" }, ["sk", "en"]), "hallo");
	// whole chain missing -> first non-empty entry
	assert.equal(getLocalizedText(text, ["cs", "hu"]), "hallo");
	assert.equal(getLocalizedText(text, []), "hallo");
	// a plain string ignores the chain
	assert.equal(getLocalizedText("plain", ["sk", "en"]), "plain");
	// same resolver as the library-wide `tr()`: a JSON-encoded record works too
	assert.equal(getLocalizedText('{"en":"hello","sk":"ahoj"}', "sk"), "ahoj");
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

test("validateFieldDefs: string extras are bounded by `maxlength` (booleans/selects are not)", () => {
	const types = [
		{
			type: "number",
			label: "Number",
			extras: [
				{ key: "unit", label: "Unit", type: "string" as const, maxlength: 5 },
				{ key: "note", label: "Note", type: "string" as const },
				{ key: "flag", label: "Flag", type: "boolean" as const },
			],
		},
		...TYPES.filter((td) => td.type !== "number"),
	];
	const num = (extras?: Record<string, unknown>) =>
		def({ key: "energy", label: "Energy", type: "number", extras });

	assert.equal(validateFieldDefs([num({ unit: "kJ" })], { types }).valid, true);
	assert.equal(
		validateFieldDefs([num({ unit: "kilojoules" })], { types }).rowErrors[0]?.extras,
		"err_extra_maxlength"
	);
	// the message names the offending extra
	assert.equal(
		validateFieldDefs([num({ unit: "kilojoules" })], {
			types,
			t: (k, v) => `${k}:${v?.label}:${v?.max}`,
		}).message,
		"err_extra_maxlength:Unit:5"
	);
	// ...in the display language when set, falling back to the default language
	const localizedExtras: FieldTypeExtraDef[] = [
		{ key: "unit", label: { en: "Unit", sk: "Jednotka" }, type: "string", maxlength: 5 },
		{ key: "note", label: { en: "Note" }, type: "string", maxlength: 5 },
	];
	const localizedTypes: FieldTypeDef[] = types.map((td) =>
		td.type !== "number" ? td : { ...td, extras: localizedExtras }
	);
	const tLabel = (k: string, v?: Record<string, string | number>) => `${k}:${v?.label}`;
	assert.equal(
		validateFieldDefs([num({ unit: "kilojoules" })], {
			types: localizedTypes,
			defaultLanguage: "en",
			displayLanguage: "sk",
			t: tLabel,
		}).message,
		"err_extra_maxlength:Jednotka"
	);
	assert.equal(
		validateFieldDefs([num({ note: "too long" })], {
			types: localizedTypes,
			defaultLanguage: "en",
			displayLanguage: "sk",
			t: tLabel,
		}).message,
		"err_extra_maxlength:Note"
	);
	// no `maxlength` declared -> unbounded
	assert.equal(
		validateFieldDefs([num({ note: "x".repeat(500) })], { types }).valid,
		true
	);
	// a non-string value under a string extra round-trips instead of erroring
	assert.equal(validateFieldDefs([num({ unit: 1234567890 })], { types }).valid, true);
	// absent extras are not an error (extras are never required)
	assert.equal(validateFieldDefs([num(undefined)], { types }).valid, true);
	// and without a palette there is nothing to validate against
	assert.equal(validateFieldDefs([num({ unit: "kilojoules" })]).valid, true);
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

// ------------------------------------------------------ columns (supportsColumns)

const COLUMN_TYPES: FieldTypeDef[] = [
	{ type: "text", label: "Text" },
	{
		type: "number",
		label: "Number",
		extras: [{ key: "unit", label: "Unit", type: "string", maxlength: 4 }],
	},
	{ type: "select", label: "Choice", supportsOptions: true },
];

const TABLE_TYPES: FieldTypeDef[] = [
	...TYPES,
	{
		type: "table",
		label: "Table",
		supportsColumns: true,
		columnTypes: COLUMN_TYPES,
		maxColumns: 3,
	},
];

function col(overrides: Partial<FieldColumnDef> = {}): FieldColumnDef {
	return { key: "part_name", type: "text", label: "Part name", ...overrides };
}

function table(columns?: FieldColumnDef[], overrides: Partial<FieldDef> = {}): FieldDef {
	return def({
		key: "bom",
		type: "table",
		label: "Bill of materials",
		columns,
		...overrides,
	});
}

test("columns: a supportsColumns def needs at least one column, and at most maxColumns", () => {
	const none = validateFieldDefs([table()], { types: TABLE_TYPES });
	assert.equal(none.valid, false);
	assert.equal(none.rowErrors[0]?.columns, "err_columns_required");
	assert.equal(none.rowErrors[0]?.columnErrors, undefined);
	assert.equal(none.message, "err_columns_required");

	const empty = validateFieldDefs([table([])], { types: TABLE_TYPES });
	assert.equal(empty.rowErrors[0]?.columns, "err_columns_required");

	const four = validateFieldDefs(
		[table([col(), col({ key: "b" }), col({ key: "c" }), col({ key: "d" })])],
		{ types: TABLE_TYPES, t: (k, v) => (k === "err_max_columns" ? `max ${v?.max}` : k) }
	);
	assert.equal(four.valid, false);
	assert.equal(four.rowErrors[0]?.columns, "max 3");

	// a valid 3-column table
	const ok = validateFieldDefs(
		[
			table([
				col(),
				col({
					key: "quantity",
					type: "number",
					label: "Quantity",
					extras: { unit: "pcs" },
				}),
				col({
					key: "material",
					type: "select",
					label: "Material",
					options: [
						{ value: "steel", label: "Steel" },
						{ value: "brass", label: "Brass" },
					],
				}),
			]),
		],
		{ types: TABLE_TYPES }
	);
	assert.equal(ok.valid, true);
	assert.deepEqual(ok.rowErrors, [null]);
});

test("columns: `columns` is ignored on types without supportsColumns (retained data)", () => {
	// a text field carrying columns from an earlier `table` life is fine
	const res = validateFieldDefs([def({ columns: [col({ label: "" })] })], {
		types: TABLE_TYPES,
	});
	assert.equal(res.valid, true);
});

test("columns: label is required in the default language, key follows pattern / length / uniqueness within the field", () => {
	const res = validateFieldDefs(
		[
			table([
				col({ label: "" }),
				col({ key: "Bad Key", label: "B" }),
				col({ key: "x".repeat(99), label: "C" }),
				col({ key: "dup", label: "D" }),
				col({ key: "dup", label: "E" }),
				col({ key: "", label: "F" }),
			]),
		],
		{
			types: [
				...TYPES,
				{ ...TABLE_TYPES[TABLE_TYPES.length - 1], maxColumns: undefined },
			],
		}
	);
	assert.equal(res.valid, false);
	const ce = res.rowErrors[0]?.columnErrors ?? [];
	assert.equal(ce.length, 6);
	assert.equal(ce[0]?.label, "err_label_required");
	assert.equal(ce[1]?.key, "err_key_pattern");
	assert.equal(ce[2]?.key, "err_key_maxlength");
	assert.equal(ce[3]?.key, "err_column_key_duplicate");
	assert.equal(ce[4]?.key, "err_column_key_duplicate");
	assert.equal(ce[5]?.key, "err_key_required");
	// the row summary names the FIRST offending column, 1-based
	assert.equal(res.rowErrors[0]?.columns, "err_column");
	const named = validateFieldDefs([table([col(), col({ key: "b", label: "" })])], {
		types: TABLE_TYPES,
		t: (k, v) => (k === "err_column" ? `Column ${v?.position}: ${v?.message}` : k),
	});
	assert.equal(named.rowErrors[0]?.columns, "Column 2: err_label_required");
	assert.deepEqual(named.rowErrors[0]?.columnErrors, [
		null,
		{ label: "err_label_required" },
	]);

	// localized label: the default-language entry is what counts
	const localized = validateFieldDefs([table([col({ label: { en: "Part" } })])], {
		types: TABLE_TYPES,
		defaultLanguage: "sk",
	});
	// any non-empty entry is accepted (same fallback as field labels)
	assert.equal(localized.valid, true);
});

test("columns: the same column key in two different fields is fine, and reservedKeys do not apply", () => {
	const res = validateFieldDefs(
		[
			table([col({ key: "id" })]),
			table([col({ key: "id" })], { key: "specs", label: "Specs" }),
		],
		{ types: TABLE_TYPES, reservedKeys: ["id"] }
	);
	assert.equal(res.valid, true);
});

test("columns: a select column needs options with non-empty unique values", () => {
	const sel = (options?: FieldOptionDef[]) =>
		table([col({ key: "m", type: "select", label: "Material", options })]);
	const ce = (defs: FieldDef[]) =>
		validateFieldDefs(defs, { types: TABLE_TYPES }).rowErrors[0]?.columnErrors?.[0];
	assert.equal(ce([sel(undefined)])?.options, "err_options_required");
	assert.equal(
		ce([sel([{ value: "", label: "A" }])])?.options,
		"err_option_value_required"
	);
	assert.equal(
		ce([
			sel([
				{ value: "a", label: "A" },
				{ value: "a", label: "B" },
			]),
		])?.options,
		"err_option_value_duplicate"
	);
	assert.equal(
		validateFieldDefs([sel([{ value: "a", label: "A" }])], { types: TABLE_TYPES }).valid,
		true
	);
});

test("columns: a string extra of a column is bounded by its maxlength", () => {
	const num = (extras?: Record<string, unknown>) =>
		table([col({ key: "q", type: "number", label: "Qty", extras })]);
	assert.equal(
		validateFieldDefs([num({ unit: "pcs" })], { types: TABLE_TYPES }).valid,
		true
	);
	const res = validateFieldDefs([num({ unit: "pieces" })], {
		types: TABLE_TYPES,
		t: (k, v) => (k === "err_extra_maxlength" ? `${v?.label} > ${v?.max}` : k),
	});
	assert.equal(res.rowErrors[0]?.columnErrors?.[0]?.extras, "Unit > 4");
});

test("columns: an unknown column type is not validated, but its key still occupies the column key space", () => {
	const res = validateFieldDefs(
		[
			table([
				col({ key: "legacy", type: "wormhole", label: "" }),
				col({ key: "b", label: "B" }),
			]),
		],
		{ types: TABLE_TYPES }
	);
	assert.equal(res.valid, true);
	const res2 = validateFieldDefs(
		[
			table([
				col({ key: "b", type: "wormhole", label: "" }),
				col({ key: "b", label: "B" }),
			]),
		],
		{ types: TABLE_TYPES }
	);
	assert.equal(res2.rowErrors[0]?.columnErrors?.[0], null);
	assert.equal(res2.rowErrors[0]?.columnErrors?.[1]?.key, "err_column_key_duplicate");
});

test("columns: the default column palette is `types` minus every supportsColumns entry; a nested supportsColumns entry is a plain type", () => {
	const tableEntry = TABLE_TYPES[TABLE_TYPES.length - 1];
	assert.deepEqual(resolveColumnTypes(tableEntry, TABLE_TYPES), COLUMN_TYPES);
	assert.deepEqual(
		resolveColumnTypes({ columnTypes: undefined }, TABLE_TYPES).map((t) => t.type),
		TYPES.map((t) => t.type)
	);
	// without an explicit palette, a table column may take any non-table type
	const noPalette: FieldTypeDef[] = [
		...TYPES,
		{ type: "table", label: "Table", supportsColumns: true },
	];
	assert.equal(
		validateFieldDefs([table([col({ type: "date" })])], { types: noPalette }).valid,
		true
	);
	// a `table` column is unknown there (never nests) — skipped, not an error
	assert.equal(
		validateFieldDefs([table([col({ type: "table", label: "" })])], { types: noPalette })
			.valid,
		true
	);
	// a supportsColumns entry listed INSIDE columnTypes is validated as a plain type
	const nested: FieldTypeDef[] = [
		...TYPES,
		{
			type: "table",
			label: "Table",
			supportsColumns: true,
			columnTypes: [{ type: "table", label: "Table", supportsColumns: true }],
		},
	];
	const res = validateFieldDefs([table([col({ type: "table", label: "" })])], {
		types: nested,
	});
	// ...and nothing nested: a column's errors are label / key / options / extras only
	assert.deepEqual(res.rowErrors[0]?.columnErrors?.[0], { label: "err_label_required" });
});

test("columns: the summary message is always a string when only column errors exist", () => {
	const res = validateFieldDefs([table([col({ label: "" })])], { types: TABLE_TYPES });
	assert.equal(typeof res.message, "string");
	assert.equal(res.message, "err_column");
	// and a label error on the row itself still wins the summary
	const both = validateFieldDefs([table([col({ label: "" })], { label: "" })], {
		types: TABLE_TYPES,
	});
	assert.equal(both.message, "err_label_required");
});

// ---------------------------------------------------------- seedExtraDefaults

test("seedExtraDefaults: materializes declared defaults into a missing / partial bag, returns the same bag when nothing is seeded", () => {
	const entry: FieldTypeDef = {
		type: "number",
		label: "Number",
		extras: [
			{ key: "unit", label: "Unit", type: "string", default: "kJ" },
			{ key: "flag", label: "Flag", type: "boolean", default: true },
			{ key: "note", label: "Note", type: "string" },
		],
	};
	assert.deepEqual(seedExtraDefaults(undefined, entry), { unit: "kJ", flag: true });
	// existing values are never overwritten
	assert.deepEqual(seedExtraDefaults({ unit: "%" }, entry), { unit: "%", flag: true });
	const full = { unit: "%", flag: false };
	assert.equal(seedExtraDefaults(full, entry), full);
	const plain: FieldTypeDef = { type: "text", label: "Text" };
	assert.equal(seedExtraDefaults(undefined, plain), undefined);
	assert.equal(seedExtraDefaults(undefined, undefined), undefined);
});
