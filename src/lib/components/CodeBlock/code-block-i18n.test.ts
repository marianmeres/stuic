import { assert, test } from "vitest";
import { createCodeBlockT, CODE_BLOCK_MESSAGES_EN, t_default } from "./i18n.js";
import { CODE_BLOCK_MESSAGES_SK } from "./i18n-sk.js";
import { COPY_BUTTON_MESSAGES_EN } from "../CopyButton/i18n.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: CODE_BLOCK_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(CODE_BLOCK_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(CODE_BLOCK_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("the catalog includes CopyButton's keys, so one `t` localizes the copy button too", () => {
	for (const k of Object.keys(COPY_BUTTON_MESSAGES_EN)) {
		assert.property(CODE_BLOCK_MESSAGES_EN, k);
	}
});

test("t_default: english texts, the {count} placeholder", () => {
	assert.equal(t_default("copy"), "Copy");
	assert.equal(t_default("show_less"), "Show less");
	assert.equal(t_default("show_all_lines", { count: 40 }), "Show all 40 lines");
	const sk = createCodeBlockT(CODE_BLOCK_MESSAGES_SK);
	assert.equal(sk("show_all_lines", { count: 3 }), "Zobraziť všetky riadky (3)");
	// a partial catalog falls back to english
	assert.equal(createCodeBlockT({ copy: "Kopírovať" })("show_less"), "Show less");
});
