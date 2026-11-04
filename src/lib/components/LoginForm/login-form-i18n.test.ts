import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, test } from "vitest";
import { createLoginFormT, LOGIN_FORM_MESSAGES_EN, t_default } from "./i18n.js";
import { LOGIN_FORM_MESSAGES_SK } from "./i18n-sk.js";

const BUNDLED: Record<string, Record<string, string>> = {
	sk: LOGIN_FORM_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

/** Every `"login_form.*"` string literal in the component's own (non-test) sources. */
function referencedKeys(): string[] {
	const here = dirname(fileURLToPath(import.meta.url));
	const files = [here, join(here, "_internal")].flatMap((dir) => {
		try {
			return readdirSync(dir).map((f) => join(dir, f));
		} catch {
			return [];
		}
	});
	const re = /["'`](login_form\.[a-z0-9_]+)["'`]/g;
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
			LOGIN_FORM_MESSAGES_EN,
			k,
			`${k} missing from LOGIN_FORM_MESSAGES_EN`
		);
});

test("bundled catalogs cover every english key, empty only where english is", () => {
	const enKeys = Object.keys(LOGIN_FORM_MESSAGES_EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			const en = (LOGIN_FORM_MESSAGES_EN as Record<string, string>)[k];
			assert.equal(!v.trim(), !en.trim(), `${lang}.${k}: emptiness differs from english`);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(LOGIN_FORM_MESSAGES_EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts and interpolates", () => {
	assert.equal(t_default("login_form.submit"), "Log In");
	assert.equal(t_default("login_form.modal_title"), "Log In");
	// unknown key + no fallback -> empty
	assert.equal(t_default("nope"), "");
	assert.equal(t_default("nope", null, "hi"), "hi");
});

test("createLoginFormT translates and falls back to english", () => {
	const t = createLoginFormT(LOGIN_FORM_MESSAGES_SK);
	assert.equal(t("login_form.password_required", null), "Heslo je povinné");

	// a partial catalog is fine — missing keys come from english
	const partial = createLoginFormT({ "login_form.submit": "Prihlásiť sa" });
	assert.equal(partial("login_form.submit"), "Prihlásiť sa");
	assert.equal(
		partial("login_form.forgot_password"),
		LOGIN_FORM_MESSAGES_EN["login_form.forgot_password"]
	);

	// an app-wide dictionary works as-is: namespaced keys don't collide
	const app = createLoginFormT({
		"other_ns.submit": "x",
		"login_form.submit": "Prihlásiť sa",
	});
	assert.equal(app("login_form.submit"), "Prihlásiť sa");
	assert.equal(
		app("login_form.forgot_password"),
		LOGIN_FORM_MESSAGES_EN["login_form.forgot_password"]
	);
});
