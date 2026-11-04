import type { ContactFormMessages } from "./i18n.js";

/**
 * Slovak message catalog for `ContactUsForm`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     ContactUsForm,
 *     createContactFormT,
 *     CONTACT_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createContactFormT(CONTACT_FORM_MESSAGES_SK);
 * </script>
 *
 * <ContactUsForm {onSubmit} {t} />
 * ```
 */
export const CONTACT_FORM_MESSAGES_SK: ContactFormMessages = {
	"contact_form.name_label": "Meno",
	"contact_form.name_placeholder": "",
	"contact_form.email_label": "E-mail",
	"contact_form.email_placeholder": "vas@email.sk",
	"contact_form.phone_label": "Telefón",
	"contact_form.phone_placeholder": "",
	"contact_form.company_label": "Firma",
	"contact_form.company_placeholder": "",
	"contact_form.subject_label": "Predmet",
	"contact_form.subject_placeholder": "",
	"contact_form.subject_select_prompt": "Vyberte…",
	"contact_form.message_label": "Správa",
	"contact_form.message_placeholder": "Ako vám môžeme pomôcť?",
	"contact_form.submit": "Odoslať správu",
	"contact_form.submitting": "Odosiela sa…",
	"contact_form.name_required": "Meno je povinné",
	"contact_form.email_required": "E-mail je povinný",
	"contact_form.email_invalid": "Zadajte platnú e-mailovú adresu",
	"contact_form.phone_required": "Telefón je povinný",
	"contact_form.subject_required": "Predmet je povinný",
	"contact_form.company_required": "Firma je povinná",
	"contact_form.message_required": "Správa je povinná",
	"contact_form.message_too_short": "Správa musí mať aspoň {min} znakov",
	"contact_form.field_required": "Pole „{label}“ je povinné",
};
