import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `RegisterForm` and `RegisterFormModal`. Also
 * the fallback of every other bundled locale, so a locale missing a key still renders
 * text.
 *
 * Keys are namespaced (`register_form.*`), so this catalog can be merged with the app's
 * own dictionary — or with other forms' catalogs — without collisions. Empty values are
 * intentional (no placeholder by default). `already_have_account` is not rendered by the
 * form itself; it is there for footers that link back to login (the Checkout flow uses
 * it).
 *
 * Placeholders are single-brace (`{min}`, `{label}`).
 */
export const REGISTER_FORM_MESSAGES_EN = {
	"register_form.email_label": "Email",
	"register_form.email_placeholder": "you@example.com",
	"register_form.password_label": "Password",
	"register_form.password_placeholder": "",
	"register_form.password_confirm_label": "Confirm password",
	"register_form.password_confirm_placeholder": "",
	"register_form.submit": "Create account",
	"register_form.submitting": "Creating account...",
	"register_form.email_required": "Email is required",
	"register_form.email_invalid": "Please enter a valid email address",
	"register_form.password_required": "Password is required",
	"register_form.password_too_short": "Password must be at least {min} characters",
	"register_form.password_confirm_required": "Please confirm your password",
	"register_form.password_mismatch": "Passwords do not match",
	"register_form.field_required": "{label} is required",
	"register_form.social_divider": "or continue with",
	"register_form.social_divider_alt": "or",
	"register_form.already_have_account": "Already have an account?",
	"register_form.modal_title": "Create account",
};

/** Every message key `RegisterForm` / `RegisterFormModal` may look up. */
export type RegisterFormMessageKey = keyof typeof REGISTER_FORM_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type RegisterFormMessages = Record<RegisterFormMessageKey, string>;

/**
 * Builds the `t` prop of `RegisterForm` / `RegisterFormModal` (and the `t` argument of
 * `validateRegisterForm`) from a message catalog. Unknown or untranslated keys fall back
 * to `fallbackMessages` (English by default), so a catalog may safely be partial and
 * never renders a raw key — nor goes stale when a later release adds a key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     RegisterForm,
 *     createRegisterFormT,
 *     REGISTER_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createRegisterFormT(REGISTER_FORM_MESSAGES_SK);
 * </script>
 *
 * <RegisterForm {onSubmit} {t} />
 * ```
 */
export function createRegisterFormT(
	messages: Partial<RegisterFormMessages> | Record<string, string>,
	fallbackMessages:
		Partial<RegisterFormMessages> | Record<string, string> = REGISTER_FORM_MESSAGES_EN
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
export const t_default: TranslateFn = createRegisterFormT(REGISTER_FORM_MESSAGES_EN);
