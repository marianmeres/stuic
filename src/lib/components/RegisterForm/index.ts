export {
	default as RegisterForm,
	type Props as RegisterFormProps,
} from "./RegisterForm.svelte";

export {
	default as RegisterFormModal,
	type Props as RegisterFormModalProps,
} from "./RegisterFormModal.svelte";

export {
	createEmptyRegisterFormData,
	validateRegisterForm,
} from "./_internal/register-form-utils.js";
export type { ValidateRegisterFormOptions } from "./_internal/register-form-utils.js";

export type {
	RegisterFormData,
	RegisterFormValidationError,
	RegisterFieldConfig,
} from "./_internal/register-form-types.js";

export {
	createRegisterFormT,
	REGISTER_FORM_MESSAGES_EN,
	type RegisterFormMessageKey,
	type RegisterFormMessages,
} from "./i18n.js";

export { REGISTER_FORM_MESSAGES_SK } from "./i18n-sk.js";
