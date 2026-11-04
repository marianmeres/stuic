import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `EmailVerifyForm`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Keys are namespaced (`email_verify_form.*`), so this catalog can be merged with the
 * app's own dictionary — or with other forms' catalogs — without collisions.
 *
 * Placeholders are single-brace (`{email}`, `{seconds}`, `{count}`).
 */
export const EMAIL_VERIFY_FORM_MESSAGES_EN = {
	"email_verify_form.heading": "Check your email",
	"email_verify_form.subheading": "We sent a 6-digit code to {email}",
	"email_verify_form.submit": "Verify",
	"email_verify_form.submitting": "Verifying...",
	"email_verify_form.resend_prompt": "Didn't receive it?",
	"email_verify_form.resend": "Resend code",
	"email_verify_form.resend_cooldown": "Resend available in {seconds}s",
	"email_verify_form.resent": "New code sent",
	"email_verify_form.attempts_remaining": "{count} attempts remaining",
};

/** Every message key `EmailVerifyForm` may look up. */
export type EmailVerifyFormMessageKey = keyof typeof EMAIL_VERIFY_FORM_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type EmailVerifyFormMessages = Record<EmailVerifyFormMessageKey, string>;

/**
 * Builds the `t` prop of `EmailVerifyForm` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a catalog
 * may safely be partial and never renders a raw key — nor goes stale when a later release
 * adds a key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     EmailVerifyForm,
 *     createEmailVerifyFormT,
 *     EMAIL_VERIFY_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createEmailVerifyFormT(EMAIL_VERIFY_FORM_MESSAGES_SK);
 * </script>
 *
 * <EmailVerifyForm {email} {onSubmit} {t} />
 * ```
 */
export function createEmailVerifyFormT(
	messages: Partial<EmailVerifyFormMessages> | Record<string, string>,
	fallbackMessages:
		| Partial<EmailVerifyFormMessages>
		| Record<string, string> = EMAIL_VERIFY_FORM_MESSAGES_EN
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
export const t_default: TranslateFn = createEmailVerifyFormT(
	EMAIL_VERIFY_FORM_MESSAGES_EN
);
