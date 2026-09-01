import { assert, test } from "vitest";
import { createBreadcrumbsT, BREADCRUMBS_MESSAGES_EN, t_default } from "./i18n.js";
import { BREADCRUMBS_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: BREADCRUMBS_MESSAGES_SK,
};

test("bundled catalogs cover every english key, with no empty values", () => {
	const enKeys = Object.keys(BREADCRUMBS_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.isTrue(!!v.trim(), `${lang}.${k} is empty`);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("breadcrumbs"), "Breadcrumb");
	assert.equal(t_default("show_all"), "Show all breadcrumbs");
	// unknown key + no fallback -> empty (same behavior as Pagination's t)
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createBreadcrumbsT translates and falls back to english", () => {
	const t = createBreadcrumbsT(BREADCRUMBS_MESSAGES_SK);
	assert.equal(t("breadcrumbs"), "Omrvinková navigácia");

	// a partial catalog is fine — missing keys come from english
	const partial = createBreadcrumbsT({ show_all: "Zobraziť všetko" });
	assert.equal(partial("show_all"), "Zobraziť všetko");
	assert.equal(partial("breadcrumbs"), BREADCRUMBS_MESSAGES_EN.breadcrumbs);
});
