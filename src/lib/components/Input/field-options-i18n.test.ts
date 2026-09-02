import { assert, test } from "vitest";
import {
	createFieldOptionsT,
	FIELD_OPTIONS_MESSAGES_EN,
	t_default,
} from "./field-options-i18n.js";
import { FIELD_OPTIONS_MESSAGES_SK } from "./field-options-i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: FIELD_OPTIONS_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(FIELD_OPTIONS_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(FIELD_OPTIONS_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("submit"), "Submit");
	assert.equal(t_default("chips_placeholder"), "Nothing selected");
	assert.equal(t_default("chips_remove", { value: "Foo" }), "Remove Foo");
	assert.equal(t_default("add_new", { value: "Foo" }), 'Add "Foo"...');
	assert.equal(t_default("arrange_tab", { value: 3 }), "Arrange (3)");
	// unknown key + no fallback -> empty (unchanged legacy behavior)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
	// a non-string fallback must never reach the DOM as "true"
	assert.equal(t_default("nope", null, true), "nope");
});

test("createFieldOptionsT translates and falls back to english", () => {
	const t = createFieldOptionsT(FIELD_OPTIONS_MESSAGES_SK);
	assert.equal(t("submit"), "Potvrdiť");
	assert.equal(t("chips_remove", { value: "Foo" }), "Odstrániť Foo");
	assert.equal(t("removed_item", { value: "Foo" }), "Odstránené: Foo");

	// a partial catalog is fine — missing keys come from english
	const partial = createFieldOptionsT({ chips_placeholder: "No tags" });
	assert.equal(partial("chips_placeholder"), "No tags");
	assert.equal(partial("chips_open"), FIELD_OPTIONS_MESSAGES_EN.chips_open);
	assert.equal(partial("submit"), FIELD_OPTIONS_MESSAGES_EN.submit);
});

test("an explicit fallback catalog replaces english", () => {
	const t = createFieldOptionsT({ chips_placeholder: "No tags" }, { chips_open: "Pick" });
	assert.equal(t("chips_placeholder"), "No tags");
	assert.equal(t("chips_open"), "Pick");
	// not in either catalog, and no string fallback -> empty, never a raw key
	assert.equal(t("submit"), "");
});
