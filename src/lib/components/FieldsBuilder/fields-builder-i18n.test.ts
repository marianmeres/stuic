import { assert, test } from "vitest";
import { createFieldsBuilderT, FIELDS_BUILDER_MESSAGES_EN, t_default } from "./i18n.js";
import {
	FIELDS_BUILDER_DEFAULT_TYPES_SK,
	FIELDS_BUILDER_MESSAGES_SK,
} from "./i18n-sk.js";
import { DEFAULT_FIELD_TYPES } from "./utils.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: FIELDS_BUILDER_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(FIELDS_BUILDER_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(FIELDS_BUILDER_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("add_label"), "Add field");
	assert.equal(t_default("removed_field", { label: "Foo" }), "Deleted field: Foo");
	// unknown key + no fallback -> empty (unchanged legacy behavior)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createFieldsBuilderT translates and falls back to english", () => {
	const t = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK);
	assert.equal(t("add_label"), "Pridať pole");
	assert.equal(t("removed_field", { label: "Foo" }), "Zmazané pole: Foo");
	assert.equal(t("err_max_fields", { max: 3 }), "Maximálny počet polí je 3");

	// a partial catalog is fine — missing keys come from english
	const partial = createFieldsBuilderT({ add_label: "Pridať pole" });
	assert.equal(partial("add_label"), "Pridať pole");
	assert.equal(partial("empty_message"), FIELDS_BUILDER_MESSAGES_EN.empty_message);
});

test("the sk palette stays type-compatible with the default palette", () => {
	assert.deepEqual(
		FIELDS_BUILDER_DEFAULT_TYPES_SK.map((t) => t.type),
		DEFAULT_FIELD_TYPES.map((t) => t.type)
	);
	assert.deepEqual(
		FIELDS_BUILDER_DEFAULT_TYPES_SK.map((t) => !!t.supportsOptions),
		DEFAULT_FIELD_TYPES.map((t) => !!t.supportsOptions)
	);
});
