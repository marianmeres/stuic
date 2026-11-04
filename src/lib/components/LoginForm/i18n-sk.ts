import type { LoginFormMessages } from "./i18n.js";

/**
 * Slovak message catalog for `LoginForm` / `LoginFormModal`. Opt-in — English stays the
 * built-in default, and this module is only pulled into a bundle when it is actually
 * imported (the component itself never references it).
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
export const LOGIN_FORM_MESSAGES_SK: LoginFormMessages = {
	"login_form.email_label": "E-mail",
	"login_form.email_placeholder": "vas@email.sk",
	"login_form.password_label": "Heslo",
	"login_form.password_placeholder": "",
	"login_form.submit": "Prihlásiť sa",
	"login_form.submitting": "Prihlasuje sa…",
	"login_form.forgot_password": "Zabudli ste heslo?",
	"login_form.email_required": "E-mail je povinný",
	"login_form.email_invalid": "Zadajte platnú e-mailovú adresu",
	"login_form.password_required": "Heslo je povinné",
	"login_form.remember_me": "Zapamätať si ma",
	"login_form.remember_me_tooltip": "Ponechať prihlásenie na tomto zariadení",
	"login_form.social_divider": "alebo pokračujte cez",
	"login_form.modal_title": "Prihlásenie",
};
