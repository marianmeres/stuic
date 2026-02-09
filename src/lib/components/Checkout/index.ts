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

export {
	default as CheckoutAddressForm,
	type Props as CheckoutAddressFormProps,
} from "./CheckoutAddressForm.svelte";

export {
	default as CheckoutDeliveryOptions,
	type Props as CheckoutDeliveryOptionsProps,
} from "./CheckoutDeliveryOptions.svelte";

export {
	default as CheckoutOrderReview,
	type Props as CheckoutOrderReviewProps,
} from "./CheckoutOrderReview.svelte";

export {
	default as CheckoutOrderConfirmation,
	type Props as CheckoutOrderConfirmationProps,
} from "./CheckoutOrderConfirmation.svelte";

export {
	default as CheckoutReviewStep,
	type Props as CheckoutReviewStepProps,
} from "./CheckoutReviewStep.svelte";

export {
	default as CheckoutShippingStep,
	type Props as CheckoutShippingStepProps,
} from "./CheckoutShippingStep.svelte";

export {
	default as CheckoutConfirmStep,
	type Props as CheckoutConfirmStepProps,
} from "./CheckoutConfirmStep.svelte";

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
