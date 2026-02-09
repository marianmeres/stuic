<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutAddressData,
		CheckoutDeliveryOption,
		CheckoutOrderData,
		CheckoutStep,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Order data (for totals display in sidebar) */
		order: CheckoutOrderData;

		/** Available delivery options */
		deliveryOptions: CheckoutDeliveryOption[];

		// -- State --

		/** Whether the step is loading (shows skeletons) */
		isLoading?: boolean;

		/** Error message */
		error?: string | null;

		/** Whether the continue action is in progress */
		isSubmitting?: boolean;

		// -- Progress --

		currentStep?: string;
		steps?: CheckoutStep[];
		onStepNavigate?: (step: CheckoutStep) => void;

		// -- Addresses --

		/** Shipping address (bindable) */
		shippingAddress?: CheckoutAddressData;
		shippingErrors?: CheckoutValidationError[];

		/** Billing address (bindable) */
		billingAddress?: CheckoutAddressData;
		billingErrors?: CheckoutValidationError[];

		/** Whether billing is same as shipping (bindable). Default: true */
		billingSameAsShipping?: boolean;

		// -- Delivery --

		/** Selected delivery option ID (bindable) */
		selectedDeliveryId?: string;

		/** Whether delivery selection is being processed (API call in flight) */
		isSelectingDelivery?: boolean;

		/** Called when a delivery option is selected */
		onSelectDelivery?: (optionId: string) => void;

		// -- Actions --

		/** Called when "Continue to Review" is clicked */
		onContinue?: () => void;

		/** Called when "Back" link is clicked */
		onBack?: () => void;

		// -- Formatting --

		formatPrice?: (v: number) => string;

		// -- Labels --

		continueLabel?: string;
		continuingLabel?: string;

		// -- Overrides --

		/** Country field snippet passed through to both address forms */
		countryField?: Snippet<
			[
				{
					value: string;
					onchange: (value: string) => void;
					error?: string;
					label: string;
					id: string;
				},
			]
		>;

		/** Override left column entirely */
		leftColumn?: Snippet;

		/** Override right column entirely */
		rightColumn?: Snippet;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import FieldCheckbox from "../Input/FieldCheckbox.svelte";
	import Skeleton from "../Skeleton/Skeleton.svelte";
	import CheckoutAddressForm from "./CheckoutAddressForm.svelte";
	import CheckoutDeliveryOptions from "./CheckoutDeliveryOptions.svelte";
	import CheckoutOrderSummary from "./CheckoutOrderSummary.svelte";
	import CheckoutProgress from "./CheckoutProgress.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { createEmptyAddress } from "./_internal/checkout-utils.js";

	let {
		order,
		deliveryOptions,
		isLoading = false,
		error,
		isSubmitting = false,
		currentStep = "shipping",
		steps,
		onStepNavigate,
		shippingAddress = $bindable(createEmptyAddress()),
		shippingErrors,
		billingAddress = $bindable(createEmptyAddress()),
		billingErrors,
		billingSameAsShipping = $bindable(true),
		selectedDeliveryId = $bindable(),
		isSelectingDelivery = false,
		onSelectDelivery,
		onContinue,
		onBack,
		formatPrice,
		continueLabel,
		continuingLabel,
		countryField,
		leftColumn,
		rightColumn,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-shipping-step", classProp)
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
		<!-- Skeleton grid -->
		<div class={unstyled ? undefined : "stuic-checkout-shipping-step-grid"}>
			<div class={unstyled ? undefined : "stuic-checkout-shipping-step-left"}>
				{#each [1, 2, 3, 4] as _, i (i)}
					<Skeleton variant="rectangle" height="5rem" />
				{/each}
			</div>
			<div class={unstyled ? undefined : "stuic-checkout-shipping-step-right"}>
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
			</div>
		</div>
	{:else}
		{#if error}
			<div class={unstyled ? undefined : "stuic-checkout-alert"} role="alert">{error}</div>
		{/if}

		<div class={unstyled ? undefined : "stuic-checkout-shipping-step-grid"}>
			<!-- Left Column -->
			<div class={unstyled ? undefined : "stuic-checkout-shipping-step-left"}>
				{#if leftColumn}
					{@render leftColumn()}
				{:else}
					<!-- Back link -->
					{#if onBack}
						<button
							type="button"
							class={unstyled ? undefined : "stuic-checkout-shipping-step-back"}
							onclick={onBack}
						>
							{t("checkout.step.back_to_review")}
						</button>
					{/if}

					<!-- Shipping Address -->
					<section>
						<h3
							class={unstyled
								? undefined
								: "stuic-checkout-shipping-step-section-heading"}
						>
							{t("checkout.step.shipping_address_title")}
						</h3>
						<CheckoutAddressForm
							bind:address={shippingAddress}
							label="shipping"
							errors={shippingErrors}
							{countryField}
							t={tProp}
							{unstyled}
						/>
					</section>

					<!-- Billing Toggle -->
					<FieldCheckbox
						bind:checked={billingSameAsShipping}
						label={t("checkout.step.billing_same")}
						class={unstyled ? undefined : "stuic-checkout-shipping-step-billing-toggle"}
					/>

					<!-- Billing Address (conditional) -->
					{#if !billingSameAsShipping}
						<section>
							<h3
								class={unstyled
									? undefined
									: "stuic-checkout-shipping-step-section-heading"}
							>
								{t("checkout.step.billing_address_title")}
							</h3>
							<CheckoutAddressForm
								bind:address={billingAddress}
								label="billing"
								errors={billingErrors}
								{countryField}
								t={tProp}
								{unstyled}
							/>
						</section>
					{/if}

					<!-- Delivery Options -->
					<section>
						<h3
							class={unstyled
								? undefined
								: "stuic-checkout-shipping-step-section-heading"}
						>
							{t("checkout.step.delivery_title")}
						</h3>
						<CheckoutDeliveryOptions
							options={deliveryOptions}
							bind:selectedId={selectedDeliveryId}
							onSelect={onSelectDelivery}
							subtotal={order.totals.subtotal}
							isUpdating={isSelectingDelivery}
							formatPrice={formatPrice}
							t={tProp}
							{unstyled}
						/>
					</section>
				{/if}
			</div>

			<!-- Right Column (Sticky Sidebar) -->
			<div class={unstyled ? undefined : "stuic-checkout-shipping-step-right"}>
				{#if rightColumn}
					{@render rightColumn()}
				{:else}
					<div class={unstyled ? undefined : "stuic-checkout-shipping-step-sidebar"}>
						<h3
							class={unstyled
								? undefined
								: "stuic-checkout-shipping-step-section-heading"}
						>
							{t("checkout.step.summary_title")}
						</h3>
						<CheckoutOrderSummary
							totals={order.totals}
							hasShipping={!!order.delivery_option_id}
							formatPrice={formatPrice}
							t={tProp}
							{unstyled}
						/>

						<Button
							intent="primary"
							class="w-full"
							disabled={isSubmitting}
							onclick={onContinue}
						>
							{isSubmitting
								? (continuingLabel ?? t("checkout.step.saving"))
								: (continueLabel ?? t("checkout.step.continue_to_review"))}
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
