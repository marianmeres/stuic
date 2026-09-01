import { assert, test } from "vitest";
import { createCopyButtonT, COPY_BUTTON_MESSAGES_EN, t_default } from "./i18n.js";
import { COPY_BUTTON_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: COPY_BUTTON_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(COPY_BUTTON_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(COPY_BUTTON_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("copy"), "Copy");
	assert.equal(t_default("copied"), "Copied");
	assert.equal(t_default("copy_failed"), "Copy failed");
	// unknown key + no fallback -> empty (same behavior as Stepper's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createCopyButtonT translates and falls back to english", () => {
	const t = createCopyButtonT(COPY_BUTTON_MESSAGES_SK);
	assert.equal(t("copy"), "Kopírovať");
	assert.equal(t("copied"), "Skopírované");

	// a partial catalog is fine — missing keys come from english
	const partial = createCopyButtonT({ copied: "Hotovo" });
	assert.equal(partial("copied"), "Hotovo");
	assert.equal(partial("copy"), COPY_BUTTON_MESSAGES_EN.copy);
});
