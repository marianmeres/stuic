import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";
import { EMAIL_VERIFY_FORM_MESSAGES_EN } from "../EmailVerifyForm/i18n.js";
import { LOGIN_FORM_MESSAGES_EN } from "../LoginForm/i18n.js";
import { REGISTER_FORM_MESSAGES_EN } from "../RegisterForm/i18n.js";

/**
 * The built-in (English) message catalog of `LoginOrRegisterForm` and
 * `LoginOrRegisterFormModal`. Also the fallback of every other bundled locale, so a
 * locale missing a key still renders text.
 *
 * Covers the composite's **whole** `t` key space: its own `login_or_register_form.*`
 * keys, plus every key of the three forms it renders — `LoginForm` (`login_form.*`),
 * `RegisterForm` (`register_form.*`) and `EmailVerifyForm` (`email_verify_form.*`) —
 * because the `t` prop is forwarded to them. The namespaces are disjoint, so the merge
 * is collision-free.
 *
 * `mode_verify` is a spare key — the verify mode has no tab of its own; it is kept for
 * wrappers (the Checkout flow maps it).
 */
export const LOGIN_OR_REGISTER_FORM_MESSAGES_EN = {
	"login_or_register_form.mode_login": "Log in",
	"login_or_register_form.mode_register": "Sign up",
	"login_or_register_form.mode_verify": "Verify",
	"login_or_register_form.social_divider": "or continue with",
	"login_or_register_form.social_divider_alt": "or",
	"login_or_register_form.modal_title_login": "Log In",
	"login_or_register_form.modal_title_register": "Create account",
	"login_or_register_form.modal_title_verify": "Verify your email",
	...LOGIN_FORM_MESSAGES_EN,
	...REGISTER_FORM_MESSAGES_EN,
	...EMAIL_VERIFY_FORM_MESSAGES_EN,
};

/**
 * Every message key `LoginOrRegisterForm` / `LoginOrRegisterFormModal` may look up,
 * including the ones its inner forms look up through the forwarded `t`.
 */
export type LoginOrRegisterFormMessageKey =
	keyof typeof LOGIN_OR_REGISTER_FORM_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type LoginOrRegisterFormMessages = Record<LoginOrRegisterFormMessageKey, string>;

/**
 * Builds the `t` prop of `LoginOrRegisterForm` / `LoginOrRegisterFormModal` from a
 * message catalog. Unknown or untranslated keys fall back to `fallbackMessages` (English
 * by default — all four namespaces), so a catalog may safely be partial and never
 * renders a raw key — nor goes stale when a later release adds a key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     LoginOrRegisterForm,
 *     createLoginOrRegisterFormT,
 *     LOGIN_OR_REGISTER_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   // one `t` localizes the composite AND the login / register / verify forms inside
 *   const t = createLoginOrRegisterFormT(LOGIN_OR_REGISTER_FORM_MESSAGES_SK);
 * </script>
 *
 * <LoginOrRegisterForm bind:mode {onLogin} {onRegister} {t} />
 * ```
 */
export function createLoginOrRegisterFormT(
	messages: Partial<LoginOrRegisterFormMessages> | Record<string, string>,
	fallbackMessages:
		| Partial<LoginOrRegisterFormMessages>
		| Record<string, string> = LOGIN_OR_REGISTER_FORM_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createLoginOrRegisterFormT(
	LOGIN_OR_REGISTER_FORM_MESSAGES_EN
);
