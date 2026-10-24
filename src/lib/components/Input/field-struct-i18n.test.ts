import { assert, test } from "vitest";
import {
	createFieldStructT,
	FIELD_STRUCT_MESSAGES_EN,
	t_default,
} from "./field-struct-i18n.js";
import { FIELD_STRUCT_MESSAGES_SK } from "./field-struct-i18n-sk.js";
import { FIELD_TABLE_MESSAGES_EN } from "./field-table-i18n.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: FIELD_STRUCT_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(FIELD_STRUCT_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(FIELD_STRUCT_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("the shared cell rules keep FieldTable's wording", () => {
	for (const k of [
		"err_number",
		"err_url",
		"err_date",
		"err_select_unknown",
		"err_maxlength",
		"err_country",
	] as const) {
		assert.equal(FIELD_STRUCT_MESSAGES_EN[k], FIELD_TABLE_MESSAGES_EN[k], k);
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("err_required"), "This field is required");
	assert.equal(
		t_default("err_field_required", { field: "Street" }),
		"Street is required"
	);
	assert.equal(
		t_default("err_field", { field: "ZIP", message: "too long (max 10 characters)" }),
		"ZIP: too long (max 10 characters)"
	);
	assert.equal(t_default("yes"), "Yes");
	// unknown key + no fallback -> empty (unchanged legacy behavior)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
	// a non-string fallback must never reach the DOM as "true"
	assert.equal(t_default("nope", null, true), "nope");
});

test("createFieldStructT translates and falls back to english", () => {
	const t = createFieldStructT(FIELD_STRUCT_MESSAGES_SK);
	assert.equal(t("err_required"), "Toto pole je povinné");
	assert.equal(t("err_field_required", { field: "Ulica" }), "Pole „Ulica“ je povinné");
	assert.equal(t("no"), "Nie");

	// a partial catalog is fine — missing keys come from english
	const partial = createFieldStructT({ yes: "Áno" });
	assert.equal(partial("yes"), "Áno");
	assert.equal(partial("no"), FIELD_STRUCT_MESSAGES_EN.no);
	assert.equal(partial("err_number"), FIELD_STRUCT_MESSAGES_EN.err_number);
});

test("an explicit fallback catalog replaces english", () => {
	const t = createFieldStructT({ yes: "Y" }, { no: "N" });
	assert.equal(t("yes"), "Y");
	assert.equal(t("no"), "N");
	// not in either catalog, and no string fallback -> empty, never a raw key
	assert.equal(t("err_number"), "");
});
