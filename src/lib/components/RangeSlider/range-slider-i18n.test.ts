import { assert, test } from "vitest";
import { createRangeSliderT, RANGE_SLIDER_MESSAGES_EN, t_default } from "./i18n.js";
import { RANGE_SLIDER_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: RANGE_SLIDER_MESSAGES_SK,
};

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(RANGE_SLIDER_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("minimum"), "Minimum");
	assert.equal(t_default("maximum"), "Maximum");
	// unknown key + no fallback -> empty (same behavior as the other component t's)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createRangeSliderT translates and falls back to english", () => {
	const t = createRangeSliderT(RANGE_SLIDER_MESSAGES_SK);
	assert.equal(t("minimum"), "Minimálna hodnota");

	// a partial catalog is fine — missing keys come from english
	const partial = createRangeSliderT({ minimum: "Od" });
	assert.equal(partial("minimum"), "Od");
	assert.equal(partial("maximum"), RANGE_SLIDER_MESSAGES_EN.maximum);
});
