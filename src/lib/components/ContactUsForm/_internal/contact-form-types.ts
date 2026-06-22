import type { HTMLInputAttributes } from "svelte/elements";

export interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	subject: string;
	company: string;
	message: string;
	/** Values for consumer-defined extraFields, keyed by field name. */
	extra: Record<string, unknown>;
}

export interface ContactFormValidationError {
	field: string;
	message: string;
}

/**
 * Anti-bot signals surfaced as the 2nd argument to `onSubmit`.
 *
 * Report-only: ContactUsForm never blocks a submit on these — enforce them
 * server-side (drop / rate-limit / queue-for-review). `isLikelyBot` is a
 * convenience OR of the individual signals.
 */
export interface ContactBotCheck {
	/** Raw honeypot value. A non-empty value means a bot filled the hidden trap. */
	honeypot: string;
	/** `true` when the honeypot was filled. */
	honeypotFilled: boolean;
	/** Milliseconds between form mount and submit. */
	elapsedMs: number;
	/** `true` when `elapsedMs < minMs` (submitted suspiciously fast). */
	isTooFast: boolean;
	/** The configured minimum fill time (ms). */
	minMs: number;
	/** `honeypotFilled || isTooFast`. */
	isLikelyBot: boolean;
}

/** Declarative descriptor for a consumer-defined FieldInput-style extra field. */
export interface ContactFieldConfig {
	/** Key under `formData.extra` where the value lives. Must be unique. */
	name: string;
	/** Visible label (already translated; ContactUsForm does not apply `t()` here). */
	label: string;
	/** FieldInput `type`. Default "text". */
	type?: "text" | "email" | "tel" | "url" | "number";
	placeholder?: string;
	required?: boolean;
	autocomplete?: HTMLInputAttributes["autocomplete"];
	/** Initial value to seed into `formData.extra[name]` if undefined. */
	initialValue?: unknown;
	/**
	 * Synchronous validator. Return empty string / undefined for "valid".
	 * Return a message string for "invalid" (wired into the same error pipeline).
	 */
	validate?: (value: unknown, data: ContactFormData) => string | undefined;
	/** Render before the message field ("top") or after it ("bottom"). Default "bottom". */
	position?: "top" | "bottom";
	/** Extra passthrough props merged onto FieldInput. */
	props?: Record<string, unknown>;
}
