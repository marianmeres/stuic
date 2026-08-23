import type {
	RegisterFieldConfig,
	RegisterFormData,
	RegisterFormValidationError,
} from "./register-form-types.js";
import type { TranslateFn } from "../../../types.js";
import { t_default } from "./register-form-i18n-defaults.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Options for {@link validateRegisterForm}. Mirror the same-named props. */
export interface ValidateRegisterFormOptions {
	/** Validate the email field. Default: true */
	showEmail?: boolean;
	/** Validate the password field. Default: true */
	showPassword?: boolean;
	/** Validate the confirm field. Ignored when `showPassword` is false. Default: true */
	showPasswordConfirm?: boolean;
	/** Minimum password length. Default: 8 */
	passwordMinLength?: number;
}

/**
 * Validate a `RegisterFormData` shape. Exported so consumers running their own
 * submit handler can reuse the exact same rules `RegisterForm` applies. `t`
 * defaults to the built-in English strings.
 *
 * `options.showEmail` / `options.showPassword` mirror the same-named props:
 * a field that is not rendered is not validated (identity-first / passwordless
 * signup, where the credential is established outside the form).
 */
export function validateRegisterForm(
	data: RegisterFormData,
	t: TranslateFn = t_default,
	extraFields: RegisterFieldConfig[] = [],
	options: ValidateRegisterFormOptions = {}
): RegisterFormValidationError[] {
	const {
		showEmail = true,
		showPassword = true,
		showPasswordConfirm = true,
		passwordMinLength = 8,
	} = options;
	const errors: RegisterFormValidationError[] = [];

	if (showEmail) {
		const trimmedEmail = (data.email ?? "").trim();
		if (!trimmedEmail) {
			errors.push({ field: "email", message: t("register_form.email_required") });
		} else if (!EMAIL_RE.test(trimmedEmail)) {
			errors.push({ field: "email", message: t("register_form.email_invalid") });
		}
	}

	if (showPassword) {
		if (!data.password) {
			errors.push({
				field: "password",
				message: t("register_form.password_required"),
			});
		} else if (data.password.length < passwordMinLength) {
			errors.push({
				field: "password",
				message: t("register_form.password_too_short", { min: passwordMinLength }),
			});
		}
	}

	if (showPassword && showPasswordConfirm) {
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
