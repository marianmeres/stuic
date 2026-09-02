import { assert, test } from "vitest";
import { createRatingT, RATING_MESSAGES_EN, t_default } from "./i18n.js";
import { RATING_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: RATING_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(RATING_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(RATING_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("rating"), "Rating");
	assert.equal(t_default("value_of_max", { value: 3, max: 5 }), "3 of 5 stars");
	assert.equal(t_default("value_of_max", { value: "2.5", max: 5 }), "2.5 of 5 stars");
	assert.equal(t_default("required"), "Please select a rating");
	// unknown key + no fallback -> empty (same behavior as Stepper's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createRatingT translates and falls back to english", () => {
	const t = createRatingT(RATING_MESSAGES_SK);
	assert.equal(t("rating"), "Hodnotenie");
	assert.equal(t("value_of_max", { value: 4, max: 5 }), "4 z 5 hviezdičiek");

	// a partial catalog is fine — missing keys come from english
	const partial = createRatingT({ rating: "Bewertung" });
	assert.equal(partial("rating"), "Bewertung");
	assert.equal(partial("required"), RATING_MESSAGES_EN.required);
});
