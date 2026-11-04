export { default as LoginForm, type Props as LoginFormProps } from "./LoginForm.svelte";

export {
	default as LoginFormModal,
	type Props as LoginFormModalProps,
} from "./LoginFormModal.svelte";

export type {
	LoginFormData,
	LoginFormValidationError,
} from "./_internal/login-form-types.js";

export {
	createLoginFormT,
	LOGIN_FORM_MESSAGES_EN,
	type LoginFormMessageKey,
	type LoginFormMessages,
} from "./i18n.js";

export { LOGIN_FORM_MESSAGES_SK } from "./i18n-sk.js";
