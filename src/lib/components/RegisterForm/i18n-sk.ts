import type { RegisterFormMessages } from "./i18n.js";

/**
 * Slovak message catalog for `RegisterForm` / `RegisterFormModal`. Opt-in — English
 * stays the built-in default, and this module is only pulled into a bundle when it is
 * actually imported (the component itself never references it).
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
export const REGISTER_FORM_MESSAGES_SK: RegisterFormMessages = {
	"register_form.email_label": "E-mail",
	"register_form.email_placeholder": "vas@email.sk",
	"register_form.password_label": "Heslo",
	"register_form.password_placeholder": "",
	"register_form.password_confirm_label": "Potvrdenie hesla",
	"register_form.password_confirm_placeholder": "",
	"register_form.submit": "Vytvoriť účet",
	"register_form.submitting": "Vytvára sa účet…",
	"register_form.email_required": "E-mail je povinný",
	"register_form.email_invalid": "Zadajte platnú e-mailovú adresu",
	"register_form.password_required": "Heslo je povinné",
	"register_form.password_too_short": "Heslo musí mať aspoň {min} znakov",
	"register_form.password_confirm_required": "Potvrďte heslo",
	"register_form.password_mismatch": "Heslá sa nezhodujú",
	"register_form.field_required": "Pole „{label}“ je povinné",
	"register_form.social_divider": "alebo pokračujte cez",
	"register_form.social_divider_alt": "alebo",
	"register_form.already_have_account": "Už máte účet?",
	"register_form.modal_title": "Registrácia",
};
