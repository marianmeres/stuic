import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

const DEFAULTS: Record<string, string> = {
	"login_or_register_form.mode_login": "Log in",
	"login_or_register_form.mode_register": "Sign up",
	"login_or_register_form.social_divider": "or continue with",
	"login_or_register_form.modal_title_login": "Log In",
	"login_or_register_form.modal_title_register": "Create account",
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
