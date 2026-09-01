import { assert, test } from "vitest";
import { createContextMenuT, CONTEXT_MENU_MESSAGES_EN, t_default } from "./i18n.js";
import { CONTEXT_MENU_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: CONTEXT_MENU_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(CONTEXT_MENU_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(CONTEXT_MENU_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("context_menu"), "Context menu");
	// unknown key + no fallback -> empty (same behavior as Stepper's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createContextMenuT translates and falls back to english", () => {
	const t = createContextMenuT(CONTEXT_MENU_MESSAGES_SK);
	assert.equal(t("context_menu"), "Kontextové menu");

	// a partial catalog is fine — missing keys come from english
	const partial = createContextMenuT({});
	assert.equal(partial("context_menu"), CONTEXT_MENU_MESSAGES_EN.context_menu);
});
