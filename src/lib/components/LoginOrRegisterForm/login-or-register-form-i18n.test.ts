import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, test } from "vitest";
import {
	createLoginOrRegisterFormT,
	LOGIN_OR_REGISTER_FORM_MESSAGES_EN,
	t_default,
} from "./i18n.js";
import { LOGIN_OR_REGISTER_FORM_MESSAGES_SK } from "./i18n-sk.js";
import { EMAIL_VERIFY_FORM_MESSAGES_EN } from "../EmailVerifyForm/i18n.js";
import { LOGIN_FORM_MESSAGES_EN } from "../LoginForm/i18n.js";
import { REGISTER_FORM_MESSAGES_EN } from "../RegisterForm/i18n.js";

const EN: Record<string, string> = LOGIN_OR_REGISTER_FORM_MESSAGES_EN;

const BUNDLED: Record<string, Record<string, string>> = {
	sk: LOGIN_OR_REGISTER_FORM_MESSAGES_SK,
};

const placeholders = (s: string) => (s.match(/{\s*\w+\s*}/g) ?? []).sort();

/** Every `"login_or_register_form.*"` string literal in the component's own sources. */
function referencedKeys(): string[] {
	const here = dirname(fileURLToPath(import.meta.url));
	const re = /["'`](login_or_register_form\.[a-z0-9_]+)["'`]/g;
	const out = new Set<string>();
	for (const f of readdirSync(here)) {
		if (!/\.(svelte|ts)$/.test(f) || /\.test\.|^i18n(-\w+)?\.ts$/.test(f)) continue;
		for (const m of readFileSync(join(here, f), "utf8").matchAll(re)) out.add(m[1]);
	}
	return [...out].sort();
}

test("the english catalog covers every key the component references", () => {
	const keys = referencedKeys();
	assert.isAbove(keys.length, 0, "source scan found nothing");
	for (const k of keys) assert.property(EN, k, `${k} missing`);
});

test("the catalog spans the inner forms' key spaces too (`t` is forwarded to them)", () => {
	for (const child of [
		LOGIN_FORM_MESSAGES_EN,
		REGISTER_FORM_MESSAGES_EN,
		EMAIL_VERIFY_FORM_MESSAGES_EN,
	]) {
		for (const [k, v] of Object.entries(child)) assert.equal(EN[k], v, k);
	}
});

test("bundled catalogs cover every english key, empty only where english is", () => {
	const enKeys = Object.keys(EN).sort();
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		assert.deepEqual(Object.keys(messages).sort(), enKeys, `${lang}: key drift`);
		for (const [k, v] of Object.entries(messages)) {
			assert.equal(
				!v.trim(),
				!EN[k].trim(),
				`${lang}.${k}: emptiness differs from english`
			);
		}
	}
});

test("bundled catalogs keep the english placeholders", () => {
	for (const [lang, messages] of Object.entries(BUNDLED)) {
		for (const [k, v] of Object.entries(EN)) {
			assert.deepEqual(
				placeholders(messages[k]),
				placeholders(v),
				`${lang}.${k}: placeholder mismatch`
			);
		}
	}
});

test("t_default keeps the built-in english texts", () => {
	assert.equal(t_default("login_or_register_form.mode_register"), "Sign up");
	assert.equal(t_default("login_form.submit"), "Log In");
	assert.equal(t_default("nope"), "");
});

test("createLoginOrRegisterFormT translates all four namespaces, falls back to english", () => {
	const t = createLoginOrRegisterFormT(LOGIN_OR_REGISTER_FORM_MESSAGES_SK);
	assert.equal(t("login_or_register_form.mode_login"), "Prihlásenie");
	assert.equal(t("login_form.submit"), "Prihlásiť sa");
	assert.equal(
		t("register_form.password_too_short", { min: 8 }),
		"Heslo musí mať aspoň 8 znakov"
	);
	assert.equal(t("email_verify_form.submit"), "Overiť");

	// partial: an inner form's key the catalog lacks still comes from english
	const partial = createLoginOrRegisterFormT({ "login_form.submit": "Dnu" });
	assert.equal(partial("login_form.submit"), "Dnu");
	assert.equal(partial("register_form.submit"), "Create account");
	assert.equal(partial("email_verify_form.resend"), "Resend code");
});
