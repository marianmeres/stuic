import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, test } from "vitest";
import { createContactFormT, CONTACT_FORM_MESSAGES_EN, t_default } from "./i18n.js";
import { CONTACT_FORM_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: CONTACT_FORM_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

/** Every `"contact_form.*"` string literal in the component's own (non-test) sources. */
function referencedKeys(): string[] {
	const here = dirname(fileURLToPath(import.meta.url));
	const files = [here, join(here, "_internal")].flatMap((dir) => {
		try {
			return readdirSync(dir).map((f) => join(dir, f));
		} catch {
			return [];
		}
	});
	const re = /["'`](contact_form\.[a-z0-9_]+)["'`]/g;
	const out = new Set<string>();
	for (const f of files) {
		if (!/\.(svelte|ts)$/.test(f) || /\.test\.|\/i18n(-\w+)?\.ts$/.test(f)) continue;
		for (const m of readFileSync(f, "utf8").matchAll(re)) out.add(m[1]);
	}
	return [...out].sort();
}

test("the english catalog covers every key the component references", () => {
	const keys = referencedKeys();
	assert.isAbove(keys.length, 0, "source scan found nothing");
	for (const k of keys)
		assert.property(
			CONTACT_FORM_MESSAGES_EN,
			k,
			`${k} missing from CONTACT_FORM_MESSAGES_EN`
		);
});

test("bundled catalogs cover every english key, empty only where english is", () => {
	const enKeys = Object.keys(CONTACT_FORM_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			const en = (CONTACT_FORM_MESSAGES_EN as Record<string, string>)[k];
			assert.equal(!v.trim(), !en.trim(), `${lang}.${k}: emptiness differs from english`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(CONTACT_FORM_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("contact_form.email_label"), "Email");
	assert.equal(
		t_default("contact_form.message_too_short", { min: 20 }),
		"Message must be at least 20 characters"
	);
	assert.equal(
		t_default("contact_form.field_required", { label: "Budget" }),
		"Budget is required"
	);
	// unknown key + no fallback -> empty
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createContactFormT translates and falls back to english", () => {
	const t = createContactFormT(CONTACT_FORM_MESSAGES_SK);
	assert.equal(
		t("contact_form.field_required", { label: "Rozpočet" }),
		"Pole „Rozpočet“ je povinné"
	);

	// a partial catalog is fine — missing keys come from english
	const partial = createContactFormT({ "contact_form.email_label": "E-mail" });
	assert.equal(partial("contact_form.email_label"), "E-mail");
	assert.equal(
		partial("contact_form.message_label"),
		CONTACT_FORM_MESSAGES_EN["contact_form.message_label"]
	);

	// an app-wide dictionary works as-is: namespaced keys don't collide
	const app = createContactFormT({
		"other_ns.submit": "x",
		"contact_form.email_label": "E-mail",
	});
	assert.equal(app("contact_form.email_label"), "E-mail");
	assert.equal(
		app("contact_form.message_label"),
		CONTACT_FORM_MESSAGES_EN["contact_form.message_label"]
	);
});
