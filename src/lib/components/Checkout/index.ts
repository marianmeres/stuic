// Components
export {
	default as CheckoutProgress,
	type Props as CheckoutProgressProps,
} from "./CheckoutProgress.svelte";

export {
	default as CheckoutOrderSummary,
	type Props as CheckoutOrderSummaryProps,
} from "./CheckoutOrderSummary.svelte";

export {
	default as CheckoutCartReview,
	type Props as CheckoutCartReviewProps,
} from "./CheckoutCartReview.svelte";

export {
	default as CheckoutGuestForm,
	type Props as CheckoutGuestFormProps,
} from "./CheckoutGuestForm.svelte";

export {
	default as CheckoutLoginForm,
	type Props as CheckoutLoginFormProps,
} from "./CheckoutLoginForm.svelte";

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
	validateLoginForm,
	createEmptyAddress,
	createEmptyCustomerFormData,
	createEmptyLoginFormData,
} from "./_internal/checkout-utils.js";
