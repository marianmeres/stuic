import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

const DEFAULTS: Record<string, string> = {
	"login_form.email_label": "Email",
	"login_form.email_placeholder": "you@example.com",
	"login_form.password_label": "Password",
	"login_form.password_placeholder": "",
	"login_form.submit": "Log In",
	"login_form.submitting": "Logging in...",
	"login_form.forgot_password": "Forgot password?",
	"login_form.email_required": "Email is required",
	"login_form.email_invalid": "Please enter a valid email address",
	"login_form.password_required": "Password is required",
	"login_form.remember_me": "Remember me",
	"login_form.remember_me_tooltip": "Stay signed in on this device",
	"login_form.social_divider": "or continue with",
	"login_form.modal_title": "Log In",
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
