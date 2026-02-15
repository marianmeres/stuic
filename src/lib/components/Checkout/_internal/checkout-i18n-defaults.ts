import { isPlainObject } from "../../../utils/is-plain-object.js";
import { replaceMap } from "../../../utils/replace-map.js";

/**
 * Complete default English i18n map for all Checkout components.
 * Each component documents which keys it uses.
 */
const DEFAULTS: Record<string, string> = {
	// -- CheckoutProgress (01) --
	"checkout.progress.label": "Checkout progress",
	"checkout.step.review": "Review",
	"checkout.step.shipping": "Shipping",
	"checkout.step.confirm": "Confirm",
	"checkout.step.complete": "Complete",

	// -- CheckoutOrderSummary (02) --
	"checkout.summary.subtotal": "Subtotal",
	"checkout.summary.shipping": "Shipping",
	"checkout.summary.tax": "Tax",
	"checkout.summary.discount": "Discount",
	"checkout.summary.total": "Total",
	"checkout.summary.free": "Free",
	"checkout.summary.not_selected": "\u2014",

	// -- CheckoutCartReview (03) --
	"checkout.cart.title": "Order Summary",
	"checkout.cart.edit": "Edit Cart",
	"checkout.cart.subtotal": "Subtotal",
	"checkout.cart.item_count_1": "1 item",
	"checkout.cart.item_count_n": "{count} items",

	// -- CheckoutGuestForm (04) --
	"checkout.guest.email_label": "Email",
	"checkout.guest.email_placeholder": "you@example.com",
	"checkout.guest.email_required": "Email is required",
	"checkout.guest.email_invalid": "Please enter a valid email address",
	"checkout.guest.first_name_label": "First Name",
	"checkout.guest.first_name_placeholder": "",
	"checkout.guest.last_name_label": "Last Name",
	"checkout.guest.last_name_placeholder": "",
	"checkout.guest.phone_label": "Phone",
	"checkout.guest.phone_placeholder": "",
	"checkout.guest.b2b_toggle": "Business Information (optional)",
	"checkout.guest.company_name_label": "Company Name",
	"checkout.guest.tax_id_label": "Tax ID",
	"checkout.guest.vat_number_label": "VAT Number",
	"checkout.guest.submit": "Continue to Shipping",
	"checkout.guest.submitting": "Starting checkout...",

	// -- CheckoutLoginForm (05) --
	"checkout.login.email_label": "Email",
	"checkout.login.email_placeholder": "you@example.com",
	"checkout.login.password_label": "Password",
	"checkout.login.password_placeholder": "",
	"checkout.login.submit": "Log In",
	"checkout.login.submitting": "Logging in...",
	"checkout.login.forgot_password": "Forgot password?",
	"checkout.login.email_required": "Email is required",
	"checkout.login.email_invalid": "Please enter a valid email address",
	"checkout.login.password_required": "Password is required",
	"checkout.login.social_divider": "or continue with",

	// -- CheckoutAddressForm (06) --
	"checkout.address.name_label": "Full Name",
	"checkout.address.name_placeholder": "",
	"checkout.address.street_label": "Street Address",
	"checkout.address.street_placeholder": "",
	"checkout.address.city_label": "City",
	"checkout.address.city_placeholder": "",
	"checkout.address.postal_code_label": "Postal Code",
	"checkout.address.postal_code_placeholder": "",
	"checkout.address.country_label": "Country",
	"checkout.address.country_placeholder": "",
	"checkout.address.phone_label": "Phone",
	"checkout.address.phone_placeholder": "",
	"checkout.address.required_marker": "*",
	"checkout.address.field_required": "{field} is required",

	// -- CheckoutDeliveryOptions (07) --
	"checkout.delivery.label": "Delivery method",
	"checkout.delivery.free": "Free",
	"checkout.delivery.free_applied": "Free shipping applied!",
	"checkout.delivery.free_above": "Free for orders over {threshold}",
	"checkout.delivery.estimated": "Estimated: {time}",
	"checkout.delivery.none_available": "No delivery options available.",

	// -- CheckoutOrderReview (08) --
	"checkout.review.items_title": "Items",
	"checkout.review.edit": "Edit",
	"checkout.review.shipping_title": "Shipping Address",
	"checkout.review.billing_title": "Billing Address",
	"checkout.review.billing_same": "Same as shipping",
	"checkout.review.delivery_title": "Delivery Method",
	"checkout.review.each": "{price} each",

	// -- CheckoutOrderConfirmation (09) --
	"checkout.complete.title": "Order Confirmed!",
	"checkout.complete.subtitle": "Thank you for your order.",
	"checkout.complete.order_number": "Order Number",
	"checkout.complete.email_sent": "A confirmation email has been sent to {email}.",
	"checkout.complete.items_title": "Items",
	"checkout.complete.shipping_title": "Shipping Details",
	"checkout.complete.address_label": "Address",
	"checkout.complete.delivery_label": "Delivery",
	"checkout.complete.totals_title": "Order Total",
	"checkout.complete.continue_shopping": "Continue Shopping",

	// -- CheckoutGuestOrLoginForm (composite) --
	"checkout.guest_or_login.guest_tab": "Guest",
	"checkout.guest_or_login.login_tab": "Log In",

	// -- Composite Steps (10–13) --
	"checkout.step.contact_title": "Contact Information",
	"checkout.step.or_divider": "or",
	"checkout.step.guest_tab": "Guest",
	"checkout.step.login_tab": "Log In",
	"checkout.step.shipping_address_title": "Shipping Address",
	"checkout.step.billing_address_title": "Billing Address",
	"checkout.step.billing_same": "Billing address same as shipping",
	"checkout.step.delivery_title": "Delivery Method",
	"checkout.step.summary_title": "Order Summary",
	"checkout.step.back_to_review": "\u2190 Back to Cart Review",
	"checkout.step.back_to_shipping": "\u2190 Back to Shipping",
	"checkout.step.continue_to_shipping": "Continue to Shipping",
	"checkout.step.continue_to_review": "Continue to Review",
	"checkout.step.saving": "Saving...",
	"checkout.step.place_order": "Place Order",
	"checkout.step.processing": "Processing Payment...",
	"checkout.step.select_delivery": "Please select a delivery method",
	"checkout.step.validation_errors":
		"Please fix the following issues before placing your order:",
	"checkout.step.return_to_checkout": "Return to Checkout",
};

/**
 * Internal default translation function for Checkout components.
 * Matches the pattern used by Cart and DataTable in stuic.
 */
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
