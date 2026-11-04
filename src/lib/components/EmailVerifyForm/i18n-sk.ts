import type { EmailVerifyFormMessages } from "./i18n.js";

/**
 * Slovak message catalog for `EmailVerifyForm`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
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
export const EMAIL_VERIFY_FORM_MESSAGES_SK: EmailVerifyFormMessages = {
	"email_verify_form.heading": "Skontrolujte si e-mail",
	"email_verify_form.subheading": "Na adresu {email} sme poslali 6-miestny kód",
	"email_verify_form.submit": "Overiť",
	"email_verify_form.submitting": "Overuje sa…",
	"email_verify_form.resend_prompt": "Kód neprišiel?",
	"email_verify_form.resend": "Poslať kód znova",
	"email_verify_form.resend_cooldown": "Znova poslať o {seconds} s",
	"email_verify_form.resent": "Nový kód bol odoslaný",
	"email_verify_form.attempts_remaining": "Zostávajúce pokusy: {count}",
};
