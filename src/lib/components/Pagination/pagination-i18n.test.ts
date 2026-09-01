import { assert, test } from "vitest";
import { createPaginationT, PAGINATION_MESSAGES_EN, t_default } from "./i18n.js";
import { PAGINATION_MESSAGES_SK } from "./i18n-sk.js";
import { DATA_TABLE_MESSAGES_EN } from "../DataTable/i18n.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: PAGINATION_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(PAGINATION_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(PAGINATION_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("previous_page"), "Prev");
	assert.equal(t_default("page_x_of_y", { page: 2, pageCount: 5 }), "Page 2 of 5");
	assert.equal(t_default("go_to_page_x", { page: 7 }), "Go to page 7");
	// unknown key + no fallback -> empty (same behavior as DataTable's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createPaginationT translates and falls back to english", () => {
	const t = createPaginationT(PAGINATION_MESSAGES_SK);
	assert.equal(t("previous_page"), "Späť");
	assert.equal(t("page_x_of_y", { page: 2, pageCount: 5 }), "Strana 2 z 5");

	// a partial catalog is fine — missing keys come from english
	const partial = createPaginationT({ next_page: "Ďalej" });
	assert.equal(partial("next_page"), "Ďalej");
	assert.equal(partial("previous_page"), PAGINATION_MESSAGES_EN.previous_page);
});

test("shared keys stay in sync with DataTable (one merged catalog serves both)", () => {
	for (const k of ["previous_page", "next_page", "page_x_of_y"] as const) {
		assert.equal(PAGINATION_MESSAGES_EN[k], DATA_TABLE_MESSAGES_EN[k], k);
	}
});
