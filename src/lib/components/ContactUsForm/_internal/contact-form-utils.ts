import type {
	ContactFieldConfig,
	ContactFormData,
	ContactFormValidationError,
} from "./contact-form-types.js";
import type { TranslateFn } from "../../../types.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidateContactFormOptions {
	showName?: boolean;
	requireName?: boolean;
	showPhone?: boolean;
	requirePhone?: boolean;
	showSubject?: boolean;
	requireSubject?: boolean;
	showCompany?: boolean;
	requireCompany?: boolean;
	/** Minimum message length. 0 (default) disables the check. */
	messageMinLength?: number;
	extraFields?: ContactFieldConfig[];
}

export function validateContactForm(
	data: ContactFormData,
	t: TranslateFn,
	options: ValidateContactFormOptions = {}
): ContactFormValidationError[] {
	const {
		showName = false,
		requireName = true,
		showPhone = false,
		requirePhone = false,
		showSubject = false,
		requireSubject = false,
		showCompany = false,
		requireCompany = false,
		messageMinLength = 0,
		extraFields = [],
	} = options;

	const errors: ContactFormValidationError[] = [];

	// Email — always present, always validated.
	const trimmedEmail = data.email.trim();
	if (!trimmedEmail) {
		errors.push({ field: "email", message: t("contact_form.email_required") });
	} else if (!EMAIL_RE.test(trimmedEmail)) {
		errors.push({ field: "email", message: t("contact_form.email_invalid") });
	}

	// Message — always present, always required.
	const trimmedMessage = data.message.trim();
	if (!trimmedMessage) {
		errors.push({ field: "message", message: t("contact_form.message_required") });
	} else if (messageMinLength > 0 && trimmedMessage.length < messageMinLength) {
		errors.push({
			field: "message",
			message: t("contact_form.message_too_short", { min: messageMinLength }),
		});
	}

	// Optional toggled fields — only validated when shown AND required.
	if (showName && requireName && !data.name.trim()) {
		errors.push({ field: "name", message: t("contact_form.name_required") });
	}
	if (showPhone && requirePhone && !data.phone.trim()) {
		errors.push({ field: "phone", message: t("contact_form.phone_required") });
	}
	if (showSubject && requireSubject && !data.subject.trim()) {
		errors.push({ field: "subject", message: t("contact_form.subject_required") });
	}
	if (showCompany && requireCompany && !data.company.trim()) {
		errors.push({ field: "company", message: t("contact_form.company_required") });
	}

	// Consumer-defined extra fields.
	for (const cfg of extraFields) {
		const value = data.extra?.[cfg.name];
		const asString =
			typeof value === "string" ? value : value == null ? "" : String(value);
		if (cfg.required && !asString.trim()) {
			errors.push({
				field: cfg.name,
				message: t("contact_form.field_required", { label: cfg.label }),
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

export function createEmptyContactFormData(): ContactFormData {
	return {
		name: "",
		email: "",
		phone: "",
		subject: "",
		company: "",
		message: "",
		extra: {},
	};
}
