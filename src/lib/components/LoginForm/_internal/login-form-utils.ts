import type { LoginFormData, LoginFormValidationError } from "./login-form-types.js";
import type { TranslateFn } from "../../../types.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(
	data: LoginFormData,
	t: TranslateFn
): LoginFormValidationError[] {
	const errors: LoginFormValidationError[] = [];
	const trimmedEmail = data.email.trim();
	if (!trimmedEmail) {
		errors.push({ field: "email", message: t("login_form.email_required") });
	} else if (!EMAIL_RE.test(trimmedEmail)) {
		errors.push({ field: "email", message: t("login_form.email_invalid") });
	}
	if (!data.password) {
		errors.push({ field: "password", message: t("login_form.password_required") });
	}
	return errors;
}

export function createEmptyLoginFormData(): LoginFormData {
	return { email: "", password: "", rememberMe: true };
}
