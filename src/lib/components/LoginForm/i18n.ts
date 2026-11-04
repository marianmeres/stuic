import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `LoginForm` and `LoginFormModal`. Also the
 * fallback of every other bundled locale, so a locale missing a key still renders text.
 *
 * Keys are namespaced (`login_form.*`), so this catalog can be merged with the app's
 * own dictionary — or with other forms' catalogs — without collisions. Empty values are
 * intentional (no placeholder by default).
 */
export const LOGIN_FORM_MESSAGES_EN = {
	"login_form.email_label": "Email",
	"login_form.email_placeholder": "you@example.com",
	"login_form.password_label": "Password",
	"login_form.password_placeholder": "",
	"login_form.submit": "Log In",
	"login_form.submitting": "Logging in...",
	"login_form.forgot_password": "Forgot password?",
	"login_form.email_required": "Email is required",
	"login_form.email_invalid": "Please enter a valid email address",
	"login_form.password_required": "Password is required",
	"login_form.remember_me": "Remember me",
	"login_form.remember_me_tooltip": "Stay signed in on this device",
	"login_form.social_divider": "or continue with",
	"login_form.modal_title": "Log In",
};

/** Every message key `LoginForm` / `LoginFormModal` may look up. */
export type LoginFormMessageKey = keyof typeof LOGIN_FORM_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type LoginFormMessages = Record<LoginFormMessageKey, string>;

/**
 * Builds the `t` prop of `LoginForm` / `LoginFormModal` from a message catalog. Unknown
 * or untranslated keys fall back to `fallbackMessages` (English by default), so a catalog
 * may safely be partial and never renders a raw key — nor goes stale when a later release
 * adds a key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { LoginForm, createLoginFormT, LOGIN_FORM_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createLoginFormT(LOGIN_FORM_MESSAGES_SK);
 * </script>
 *
 * <LoginForm {onSubmit} {t} />
 * ```
 */
export function createLoginFormT(
	messages: Partial<LoginFormMessages> | Record<string, string>,
	fallbackMessages:
		Partial<LoginFormMessages> | Record<string, string> = LOGIN_FORM_MESSAGES_EN
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
export const t_default: TranslateFn = createLoginFormT(LOGIN_FORM_MESSAGES_EN);
