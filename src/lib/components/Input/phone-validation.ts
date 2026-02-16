import { isValidPhoneNumber } from "libphonenumber-js/min";

/**
 * Built-in phone number validator for FieldPhoneNumber.
 * Validates E.164 format (e.g. "+421905123456").
 *
 * Returns error message if invalid, undefined if valid or empty.
 * Empty values are not validated — use the `required` attribute for that.
 *
 * Compatible with the `customValidator` signature of the validate action.
 */
export function validatePhoneNumber(
	value: unknown,
	_context?: Record<string, unknown>,
	_el?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): string | undefined {
	if (!value || typeof value !== "string") return undefined;
	try {
		if (isValidPhoneNumber(value)) return undefined;
		return "Invalid phone number";
	} catch {
		return "Invalid phone number";
	}
}
