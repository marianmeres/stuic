// Types
export type {
	CheckoutStep,
	CheckoutAddressData,
	CheckoutCustomerFormData,
	CheckoutLoginFormData,
	CheckoutOrderLineItem,
	CheckoutOrderTotals,
	CheckoutDeliveryOption,
	CheckoutDeliverySnapshot,
	CheckoutOrderData,
	CheckoutValidationError,
} from "./_internal/checkout-types.js";

// Utilities
export {
	defaultFormatPrice,
	validateEmail,
	validateAddress,
	validateCustomerForm,
	createEmptyAddress,
	createEmptyCustomerFormData,
	createEmptyLoginFormData,
} from "./_internal/checkout-utils.js";
