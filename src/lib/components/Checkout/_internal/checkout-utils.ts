import type {
	CheckoutAddressData,
	CheckoutCustomerFormData,
	CheckoutLoginFormData,
	CheckoutValidationError,
} from "./checkout-types.js";
import type { TranslateFn } from "../../../types.js";

// ====================================================================
// Default price formatter
// ====================================================================

/**
 * Converts cents (integer) to a simple decimal string: 1299 → "12.99"
 * Host projects typically override this with locale-aware formatting.
 */
export function defaultFormatPrice(cents: number): string {
	return (cents / 100).toFixed(2);
}

// ====================================================================
// Email validation
// ====================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string, t: TranslateFn): string | null {
	const trimmed = email.trim();
	if (!trimmed) return t("checkout.guest.email_required");
	if (!EMAIL_RE.test(trimmed)) return t("checkout.guest.email_invalid");
	return null;
}

// ====================================================================
// Customer form validation
// ====================================================================

export function validateCustomerForm(
	data: CheckoutCustomerFormData,
	t: TranslateFn
): CheckoutValidationError[] {
	const errors: CheckoutValidationError[] = [];
	const emailError = validateEmail(data.email, t);
	if (emailError) errors.push({ field: "email", message: emailError });
	return errors;
}

// ====================================================================
// Address validation
// ====================================================================

const REQUIRED_ADDRESS_FIELDS = [
	"name",
	"street",
	"city",
	"postal_code",
	"country",
] as const;

export function validateAddress(
	address: CheckoutAddressData,
	prefix: string,
	t: TranslateFn
): CheckoutValidationError[] {
	const errors: CheckoutValidationError[] = [];
	for (const field of REQUIRED_ADDRESS_FIELDS) {
		const value = address[field];
		if (!value || !String(value).trim()) {
			const label = t(`checkout.address.${field}_label`);
			errors.push({
				field: `${prefix}.${field}`,
				message: t("checkout.address.field_required", { field: label }),
			});
		}
	}
	return errors;
}

// ====================================================================
// Login form validation
// ====================================================================

export function validateLoginForm(
	data: CheckoutLoginFormData,
	t: TranslateFn
): CheckoutValidationError[] {
	const errors: CheckoutValidationError[] = [];
	const trimmedEmail = data.email.trim();
	if (!trimmedEmail) {
		errors.push({ field: "email", message: t("checkout.login.email_required") });
	} else if (!EMAIL_RE.test(trimmedEmail)) {
		errors.push({ field: "email", message: t("checkout.login.email_invalid") });
	}
	if (!data.password) {
		errors.push({ field: "password", message: t("checkout.login.password_required") });
	}
	return errors;
}

// ====================================================================
// Empty data factories
// ====================================================================

export function createEmptyAddress(): CheckoutAddressData {
	return { name: "", street: "", city: "", postal_code: "", country: "", phone: "" };
}

export function createEmptyCustomerFormData(): CheckoutCustomerFormData {
	return {
		email: "",
		first_name: "",
		last_name: "",
		phone: "",
		company_name: "",
		tax_id: "",
		vat_number: "",
	};
}

export function createEmptyLoginFormData(): CheckoutLoginFormData {
	return { email: "", password: "" };
}
