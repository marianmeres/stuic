import { assert, test } from "vitest";
import {
	createFieldTableT,
	FIELD_TABLE_MESSAGES_EN,
	t_default,
} from "./field-table-i18n.js";
import { FIELD_TABLE_MESSAGES_SK } from "./field-table-i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: FIELD_TABLE_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(FIELD_TABLE_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(FIELD_TABLE_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("add_row"), "Add row");
	assert.equal(t_default("row_label", { row: 3 }), "Row 3");
	assert.equal(t_default("move_row_up", { row: 2 }), "Move row 2 up");
	assert.equal(
		t_default("err_cell", { row: 3, column: "Qty", message: "not a number" }),
		"Row 3, Qty: not a number"
	);
	assert.equal(
		t_default("moved_row", { position: 1, total: 4 }),
		"Row moved to position 1 of 4"
	);
	// unknown key + no fallback -> empty (unchanged legacy behavior)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
	// a non-string fallback must never reach the DOM as "true"
	assert.equal(t_default("nope", null, true), "nope");
});

test("createFieldTableT translates and falls back to english", () => {
	const t = createFieldTableT(FIELD_TABLE_MESSAGES_SK);
	assert.equal(t("add_row"), "Pridať riadok");
	assert.equal(t("remove_row", { row: 2 }), "Odstrániť riadok 2");
	assert.equal(t("err_max_rows", { max: 100 }), "Maximálny počet riadkov je 100");

	// a partial catalog is fine — missing keys come from english
	const partial = createFieldTableT({ add_row: "Pridať riadok" });
	assert.equal(partial("add_row"), "Pridať riadok");
	assert.equal(partial("empty_message"), FIELD_TABLE_MESSAGES_EN.empty_message);
	assert.equal(partial("err_number"), FIELD_TABLE_MESSAGES_EN.err_number);
});

test("an explicit fallback catalog replaces english", () => {
	const t = createFieldTableT({ add_row: "Add" }, { empty_message: "Nothing" });
	assert.equal(t("add_row"), "Add");
	assert.equal(t("empty_message"), "Nothing");
	// not in either catalog, and no string fallback -> empty, never a raw key
	assert.equal(t("err_number"), "");
});
