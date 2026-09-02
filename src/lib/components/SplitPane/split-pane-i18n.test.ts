import { assert, test } from "vitest";
import { createSplitPaneT, SPLIT_PANE_MESSAGES_EN, t_default } from "./i18n.js";
import { SPLIT_PANE_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: SPLIT_PANE_MESSAGES_SK,
};

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(SPLIT_PANE_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("resize"), "Resize");
	// unknown key + no fallback -> empty (same behavior as the other components' t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createSplitPaneT translates and falls back to english", () => {
	const t = createSplitPaneT(SPLIT_PANE_MESSAGES_SK);
	assert.equal(t("resize"), "Zmeniť veľkosť");

	// a partial catalog is fine — missing keys come from english
	const partial = createSplitPaneT({});
	assert.equal(partial("resize"), SPLIT_PANE_MESSAGES_EN.resize);
});
