<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CheckoutOrderData, CheckoutStep } from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Completed order data */
		order: CheckoutOrderData;

		/** Order ID */
		orderId: string;

		/** Whether confirmation email was sent */
		emailSent?: boolean;

		// -- State --

		/** Whether the step is loading (e.g., completing payment in background) */
		isLoading?: boolean;

		/** Error message */
		error?: string | null;

		// -- Progress --

		currentStep?: string;
		steps?: CheckoutStep[];
		onStepNavigate?: (step: CheckoutStep) => void;

		// -- Actions --

		/** Called when "Continue Shopping" is clicked */
		onContinueShopping?: () => void;

		/** Called when "Return to Checkout" is clicked (from error state) */
		onReturnToCheckout?: () => void;

		// -- Formatting --

		formatPrice?: (v: number) => string;

		// -- Pass-through to CheckoutOrderConfirmation --

		/** Success icon HTML override */
		successIcon?: string;

		/** Override the confirmation header */
		header?: Snippet<[{ orderId: string }]>;

		/** Override order number display */
		orderNumber?: Snippet<[{ orderId: string }]>;

		/** Additional content after the confirmation */
		confirmationFooter?: Snippet<[{ orderId: string; order: CheckoutOrderData }]>;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import Skeleton from "../Skeleton/Skeleton.svelte";
	import CheckoutOrderConfirmation from "./CheckoutOrderConfirmation.svelte";
	import CheckoutProgress from "./CheckoutProgress.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";

	let {
		order,
		orderId,
		emailSent,
		isLoading = false,
		error,
		currentStep = "complete",
		steps,
		onStepNavigate,
		onContinueShopping,
		onReturnToCheckout,
		formatPrice,
		successIcon,
		header,
		orderNumber,
		confirmationFooter,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-complete-step", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Progress -->
	<CheckoutProgress
		{steps}
		{currentStep}
		onNavigate={onStepNavigate}
		t={tProp}
		{unstyled}
	/>

	{#if isLoading}
		<div class={unstyled ? undefined : "stuic-checkout-complete-step-loading"}>
			<Skeleton variant="circle" height="4rem" width="4rem" />
			<Skeleton height="2rem" width="60%" />
			<Skeleton height="1rem" width="40%" />
			<Skeleton variant="rectangle" height="12rem" />
		</div>
	{:else if error}
		<div class={unstyled ? undefined : "stuic-checkout-complete-step-error"}>
			<div class={unstyled ? undefined : "stuic-checkout-alert"} role="alert">
				{error}
			</div>
			<div class={unstyled ? undefined : "stuic-checkout-complete-step-error-actions"}>
				{#if onReturnToCheckout}
					<Button variant="outline" onclick={onReturnToCheckout}>
						{t("checkout.step.return_to_checkout")}
					</Button>
				{/if}
				{#if onContinueShopping}
					<Button intent="primary" onclick={onContinueShopping}>
						{t("checkout.complete.continue_shopping")}
					</Button>
				{/if}
			</div>
		</div>
	{:else}
		<CheckoutOrderConfirmation
			{order}
			{orderId}
			{emailSent}
			{formatPrice}
			{onContinueShopping}
			{successIcon}
			{header}
			{orderNumber}
			footer={confirmationFooter}
			t={tProp}
			{unstyled}
		/>
	{/if}
</div>
