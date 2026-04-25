import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

const DEFAULTS: Record<string, string> = {
	"email_verify_form.heading": "Check your email",
	"email_verify_form.subheading": "We sent a 6-digit code to {email}",
	"email_verify_form.submit": "Verify",
	"email_verify_form.submitting": "Verifying...",
	"email_verify_form.resend_prompt": "Didn't receive it?",
	"email_verify_form.resend": "Resend code",
	"email_verify_form.resend_cooldown": "Resend available in {seconds}s",
	"email_verify_form.resent": "New code sent",
	"email_verify_form.attempts_remaining": "{count} attempts remaining",
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
