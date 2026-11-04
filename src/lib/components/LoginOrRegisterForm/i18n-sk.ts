import { EMAIL_VERIFY_FORM_MESSAGES_SK } from "../EmailVerifyForm/i18n-sk.js";
import { LOGIN_FORM_MESSAGES_SK } from "../LoginForm/i18n-sk.js";
import { REGISTER_FORM_MESSAGES_SK } from "../RegisterForm/i18n-sk.js";
import type { LoginOrRegisterFormMessages } from "./i18n.js";

/**
 * Slovak message catalog for `LoginOrRegisterForm` / `LoginOrRegisterFormModal` —
 * including the Slovak catalogs of the login, register and verify forms it renders (the
 * `t` prop is forwarded to them). Opt-in — English stays the built-in default, and this
 * module is only pulled into a bundle when it is actually imported (the component itself
 * never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     LoginOrRegisterForm,
 *     createLoginOrRegisterFormT,
 *     LOGIN_OR_REGISTER_FORM_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createLoginOrRegisterFormT(LOGIN_OR_REGISTER_FORM_MESSAGES_SK);
 * </script>
 *
 * <LoginOrRegisterForm bind:mode {onLogin} {onRegister} {t} />
 * ```
 */
export const LOGIN_OR_REGISTER_FORM_MESSAGES_SK: LoginOrRegisterFormMessages = {
	"login_or_register_form.mode_login": "Prihlásenie",
	"login_or_register_form.mode_register": "Registrácia",
	"login_or_register_form.mode_verify": "Overenie",
	"login_or_register_form.social_divider": "alebo pokračujte cez",
	"login_or_register_form.social_divider_alt": "alebo",
	"login_or_register_form.modal_title_login": "Prihlásenie",
	"login_or_register_form.modal_title_register": "Registrácia",
	"login_or_register_form.modal_title_verify": "Overte svoj e-mail",
	...LOGIN_FORM_MESSAGES_SK,
	...REGISTER_FORM_MESSAGES_SK,
	...EMAIL_VERIFY_FORM_MESSAGES_SK,
};
