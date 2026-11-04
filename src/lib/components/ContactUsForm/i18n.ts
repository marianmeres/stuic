import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `ContactUsForm`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Keys are namespaced (`contact_form.*`), so this catalog can be merged with the app's
 * own dictionary — or with other forms' catalogs — without collisions. Empty values are
 * intentional (no placeholder by default).
 *
 * Placeholders are single-brace (`{min}`, `{label}`).
 */
export const CONTACT_FORM_MESSAGES_EN = {
	"contact_form.name_label": "Name",
	"contact_form.name_placeholder": "",
	"contact_form.email_label": "Email",
	"contact_form.email_placeholder": "you@example.com",
	"contact_form.phone_label": "Phone",
	"contact_form.phone_placeholder": "",
	"contact_form.company_label": "Company",
	"contact_form.company_placeholder": "",
	"contact_form.subject_label": "Subject",
	"contact_form.subject_placeholder": "",
	"contact_form.subject_select_prompt": "Select…",
	"contact_form.message_label": "Message",
	"contact_form.message_placeholder": "How can we help?",
	"contact_form.submit": "Send message",
	"contact_form.submitting": "Sending...",
	"contact_form.name_required": "Name is required",
	"contact_form.email_required": "Email is required",
	"contact_form.email_invalid": "Please enter a valid email address",
	"contact_form.phone_required": "Phone is required",
	"contact_form.subject_required": "Subject is required",
	"contact_form.company_required": "Company is required",
	"contact_form.message_required": "Message is required",
	"contact_form.message_too_short": "Message must be at least {min} characters",
	"contact_form.field_required": "{label} is required",
};

/** Every message key `ContactUsForm` may look up. */
export type ContactFormMessageKey = keyof typeof CONTACT_FORM_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type ContactFormMessages = Record<ContactFormMessageKey, string>;

/**
 * Builds the `t` prop of `ContactUsForm` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key — nor goes stale when a later release adds a key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     ContactUsForm,
 *     createContactFormT,
 *     CONTACT_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *
 *   // full locale, plus a form specific tweak
 *   const t = createContactFormT({
 *     ...CONTACT_FORM_MESSAGES_SK,
 *     "contact_form.submit": "Napíšte nám",
 *   });
 * </script>
 *
 * <ContactUsForm {onSubmit} {t} />
 * ```
 */
export function createContactFormT(
	messages: Partial<ContactFormMessages> | Record<string, string>,
	fallbackMessages:
		Partial<ContactFormMessages> | Record<string, string> = CONTACT_FORM_MESSAGES_EN
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
export const t_default: TranslateFn = createContactFormT(CONTACT_FORM_MESSAGES_EN);
