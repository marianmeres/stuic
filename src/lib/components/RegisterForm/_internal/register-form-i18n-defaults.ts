import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

const DEFAULTS: Record<string, string> = {
	"register_form.email_label": "Email",
	"register_form.email_placeholder": "you@example.com",
	"register_form.password_label": "Password",
	"register_form.password_placeholder": "",
	"register_form.password_confirm_label": "Confirm password",
	"register_form.password_confirm_placeholder": "",
	"register_form.submit": "Create account",
	"register_form.submitting": "Creating account...",
	"register_form.email_required": "Email is required",
	"register_form.email_invalid": "Please enter a valid email address",
	"register_form.password_required": "Password is required",
	"register_form.password_too_short": "Password must be at least {min} characters",
	"register_form.password_confirm_required": "Please confirm your password",
	"register_form.password_mismatch": "Passwords do not match",
	"register_form.field_required": "{label} is required",
	"register_form.social_divider": "or continue with",
	"register_form.already_have_account": "Already have an account?",
	"register_form.modal_title": "Create account",
};

export function t_default(
	k: string,
	values: false | null | undefined | Record<string, string | number> = null,
	fallback: string | boolean = ""
): string {
	const out = DEFAULTS[k] ?? (typeof fallback === "string" ? fallback : "") ?? k;
	return isPlainObject(values)
		? replaceMap(out, values as Record<string, string | CallableFunction>, {
				preSearchKeyTransform: (k) => `{${k}}`,
			})
		: out;
}
