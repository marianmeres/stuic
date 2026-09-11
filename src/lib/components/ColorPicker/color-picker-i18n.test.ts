import { assert, test } from "vitest";
import { COLOR_PICKER_MESSAGES_EN, createColorPickerT, t_default } from "./i18n.js";
import { COLOR_PICKER_MESSAGES_SK } from "./i18n-sk.js";
import { COLOR_PICKER_PALETTE, COLOR_PICKER_PALETTE_THEME } from "./palettes.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: COLOR_PICKER_MESSAGES_SK,
};

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(COLOR_PICKER_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("every bundled palette label has a message key in every catalog", () => {
	const labels = [...COLOR_PICKER_PALETTE, ...COLOR_PICKER_PALETTE_THEME].map((s) =>
		typeof s === "string" ? s : s.label
	);
	for (const label of labels) {
		assert.isTrue(!!label, "a bundled swatch is missing its label");
		assert.property(COLOR_PICKER_MESSAGES_EN, label!, `en: ${label}`);
		for (const [lang, messages] of Object.entries(BUNDLED)) {
			assert.property(messages, label!, `${lang}: ${label}`);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("color"), "Color");
	assert.equal(t_default("custom_color"), "Custom color");
	assert.equal(t_default("no_color"), "No color");
	assert.equal(t_default("required"), "Please select a color");
	assert.equal(t_default("red"), "Red");
	// unknown key + no fallback -> empty
	assert.equal(t_default("nope"), "");
	// ...which is why swatch labels are looked up with themselves as fallback:
	// a consumer's own label renders verbatim
	assert.equal(t_default("Brand blue", null, "Brand blue"), "Brand blue");
});

test("createColorPickerT translates and falls back to english", () => {
	const t = createColorPickerT(COLOR_PICKER_MESSAGES_SK);
	assert.equal(t("color"), "Farba");
	assert.equal(t("red"), "Červená");
	assert.equal(t("no_color"), "Žiadna farba");

	// a partial catalog is fine — missing keys come from english
	const partial = createColorPickerT({ color: "Farbe" });
	assert.equal(partial("color"), "Farbe");
	assert.equal(partial("required"), COLOR_PICKER_MESSAGES_EN.required);
});
