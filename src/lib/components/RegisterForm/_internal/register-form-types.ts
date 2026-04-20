import type { HTMLInputAttributes } from "svelte/elements";

export interface RegisterFormData {
	email: string;
	password: string;
	passwordConfirm: string;
	/** Values for consumer-defined extraFields, keyed by field name. */
	extra: Record<string, unknown>;
}

export interface RegisterFormValidationError {
	field: string;
	message: string;
}

/** Declarative descriptor for a consumer-defined FieldInput-style extra field. */
export interface RegisterFieldConfig {
	/** Key under formData.extra where the value lives. Must be unique. */
	name: string;
	/** Visible label (already translated; RegisterForm does not apply `t()` here). */
	label: string;
	/** FieldInput `type`. Default "text". */
	type?: "text" | "email" | "tel" | "url" | "password" | "number";
	placeholder?: string;
	required?: boolean;
	autocomplete?: HTMLInputAttributes["autocomplete"];
	/** Initial value to seed into formData.extra[name] if undefined. */
	initialValue?: unknown;
	/**
	 * Synchronous validator. Return empty string / undefined for "valid".
	 * Return a message string for "invalid" (wired into the same allErrors pipeline).
	 */
	validate?: (value: unknown, data: RegisterFormData) => string | undefined;
	/** Render before core fields ("top") or after passwordConfirm ("bottom"). Default "bottom". */
	position?: "top" | "bottom";
	/** Extra passthrough props merged onto FieldInput. */
	props?: Record<string, unknown>;
}
