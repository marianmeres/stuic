import { assert, test } from "vitest";
import { createDataTableT, DATA_TABLE_MESSAGES_EN, t_default } from "./i18n.js";
import { DATA_TABLE_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: DATA_TABLE_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(DATA_TABLE_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(DATA_TABLE_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("no_data"), "No data");
	assert.equal(t_default("page_x_of_y", { page: 2, pageCount: 5 }), "Page 2 of 5");
	assert.equal(t_default("x_rows_selected", { count: 3 }), "3 selected");
	// unknown key + no fallback -> empty (unchanged legacy behavior)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createDataTableT translates and falls back to english", () => {
	const t = createDataTableT(DATA_TABLE_MESSAGES_SK);
	assert.equal(t("no_rows_selected"), "Nič nie je vybrané");
	assert.equal(t("page_x_of_y", { page: 2, pageCount: 5 }), "Strana 2 z 5");
	assert.equal(
		t("all_results_selected", { totalCount: 42 }),
		"Vybrané všetky výsledky (42)."
	);

	// a partial catalog is fine — missing keys come from english
	const partial = createDataTableT({ no_data: "Žiadne údaje" });
	assert.equal(partial("no_data"), "Žiadne údaje");
	assert.equal(partial("next_page"), DATA_TABLE_MESSAGES_EN.next_page);
});
