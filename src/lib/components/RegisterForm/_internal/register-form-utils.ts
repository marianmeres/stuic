import type {
	RegisterFieldConfig,
	RegisterFormData,
	RegisterFormValidationError,
} from "./register-form-types.js";
import type { TranslateFn } from "../../../types.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(
	data: RegisterFormData,
	t: TranslateFn,
	extraFields: RegisterFieldConfig[] = [],
	options: { showPasswordConfirm?: boolean; passwordMinLength?: number } = {}
): RegisterFormValidationError[] {
	const { showPasswordConfirm = true, passwordMinLength = 8 } = options;
	const errors: RegisterFormValidationError[] = [];

	const trimmedEmail = data.email.trim();
	if (!trimmedEmail) {
		errors.push({ field: "email", message: t("register_form.email_required") });
	} else if (!EMAIL_RE.test(trimmedEmail)) {
		errors.push({ field: "email", message: t("register_form.email_invalid") });
	}

	if (!data.password) {
		errors.push({ field: "password", message: t("register_form.password_required") });
	} else if (data.password.length < passwordMinLength) {
		errors.push({
			field: "password",
			message: t("register_form.password_too_short", { min: passwordMinLength }),
		});
	}

	if (showPasswordConfirm) {
		if (!data.passwordConfirm) {
			errors.push({
				field: "passwordConfirm",
				message: t("register_form.password_confirm_required"),
			});
		} else if (data.password && data.password !== data.passwordConfirm) {
			errors.push({
				field: "passwordConfirm",
				message: t("register_form.password_mismatch"),
			});
		}
	}

	for (const cfg of extraFields) {
		const value = data.extra?.[cfg.name];
		const asString =
			typeof value === "string" ? value : value == null ? "" : String(value);
		if (cfg.required && !asString.trim()) {
			errors.push({
				field: cfg.name,
				message: t("register_form.field_required", { label: cfg.label }),
			});
			continue;
		}
		if (cfg.validate) {
			const msg = cfg.validate(value, data);
			if (msg) errors.push({ field: cfg.name, message: msg });
		}
	}

	return errors;
}

export function createEmptyRegisterFormData(): RegisterFormData {
	return { email: "", password: "", passwordConfirm: "", extra: {} };
}
