import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

const DEFAULTS: Record<string, string> = {
	"contact_form.name_label": "Name",
	"contact_form.name_placeholder": "",
	"contact_form.email_label": "Email",
	"contact_form.email_placeholder": "you@example.com",
	"contact_form.phone_label": "Phone",
	"contact_form.phone_placeholder": "",
	"contact_form.company_label": "Company",
	"contact_form.company_placeholder": "",
	"contact_form.subject_label": "Subject",
	"contact_form.subject_placeholder": "",
	"contact_form.subject_select_prompt": "Select…",
	"contact_form.message_label": "Message",
	"contact_form.message_placeholder": "How can we help?",
	"contact_form.submit": "Send message",
	"contact_form.submitting": "Sending...",
	"contact_form.name_required": "Name is required",
	"contact_form.email_required": "Email is required",
	"contact_form.email_invalid": "Please enter a valid email address",
	"contact_form.phone_required": "Phone is required",
	"contact_form.subject_required": "Subject is required",
	"contact_form.company_required": "Company is required",
	"contact_form.message_required": "Message is required",
	"contact_form.message_too_short": "Message must be at least {min} characters",
	"contact_form.field_required": "{label} is required",
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
