<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutOrderData,
		CheckoutStep,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Order data to review and display totals */
		order: CheckoutOrderData;

		// -- State --

		/** Whether the step is loading (shows skeletons) */
		isLoading?: boolean;

		/** Error message (e.g. payment failure) */
		error?: string | null;

		/**
		 * Validation errors from server (e.g., missing address, no delivery selected).
		 * Displayed as a list above the CTA.
		 */
		validationErrors?: CheckoutValidationError[];

		/** Whether the order passed validation and is ready for payment */
		isValid?: boolean;

		/** Whether payment is being initiated */
		isSubmitting?: boolean;

		// -- Progress --

		currentStep?: string;
		steps?: CheckoutStep[];
		onStepNavigate?: (step: CheckoutStep) => void;

		// -- Actions --

		/** Called when "Place Order" is clicked */
		onPlaceOrder?: () => void;

		/** Called when "Back" link is clicked */
		onBack?: () => void;

		// -- Edit callbacks (passed through to OrderReview) --

		onEditItems?: () => void;
		onEditShippingAddress?: () => void;
		onEditBillingAddress?: () => void;
		onEditDelivery?: () => void;

		// -- Formatting --

		formatPrice?: (v: number) => string;

		// -- Labels --

		placeOrderLabel?: string;
		processingLabel?: string;

		// -- Overrides --

		/** Override entire left column */
		leftColumn?: Snippet;

		/** Override entire right column */
		rightColumn?: Snippet;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;

		hLevel?: HLevel;
		hRenderLevel?: HLevel;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import Skeleton from "../Skeleton/Skeleton.svelte";
	import CheckoutOrderReview from "./CheckoutOrderReview.svelte";
	import CheckoutOrderSummary from "./CheckoutOrderSummary.svelte";
	import CheckoutProgress from "./CheckoutProgress.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import H, { type HLevel } from "../H/H.svelte";
	import CheckoutSectionHeader from "./CheckoutSectionHeader.svelte";

	let {
		order,
		isLoading = false,
		error,
		validationErrors,
		isValid = true,
		isSubmitting = false,
		currentStep = "confirm",
		steps,
		onStepNavigate,
		onPlaceOrder,
		onBack,
		onEditItems,
		onEditShippingAddress,
		onEditBillingAddress,
		onEditDelivery,
		formatPrice,
		placeOrderLabel,
		processingLabel,
		leftColumn,
		rightColumn,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),

		hLevel = 3,
		hRenderLevel = 3,
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-confirm-step", classProp)
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
		<div class={unstyled ? undefined : "stuic-checkout-confirm-step-grid"}>
			<div class={unstyled ? undefined : "stuic-checkout-confirm-step-left"}>
				{#each [1, 2, 3] as _, i (i)}
					<Skeleton variant="rectangle" height="5rem" />
				{/each}
			</div>
			<div class={unstyled ? undefined : "stuic-checkout-confirm-step-right"}>
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
				<Skeleton height="2.5rem" />
			</div>
		</div>
	{:else}
		<DismissibleMessage message={error} intent="destructive" onDismiss={false} />

		<!-- Back link -->
		{#if onBack}
			<div class={unstyled ? undefined : "stuic-checkout-step-back"}>
				<Button type="button" variant="link" size="sm" onclick={onBack}>
					{t("checkout.step.back_to_shipping")}
				</Button>
			</div>
		{/if}

		<div class={unstyled ? undefined : "stuic-checkout-confirm-step-grid"}>
			<!-- Left Column: Order Review -->
			<div class={unstyled ? undefined : "stuic-checkout-confirm-step-left"}>
				{#if leftColumn}
					{@render leftColumn()}
				{:else}
					<CheckoutOrderReview
						{order}
						{formatPrice}
						{onEditItems}
						{onEditShippingAddress}
						{onEditBillingAddress}
						{onEditDelivery}
						t={tProp}
						{unstyled}
					/>
				{/if}
			</div>

			<!-- Right Column: Summary + Place Order -->
			<div class={unstyled ? undefined : "stuic-checkout-confirm-step-right"}>
				{#if rightColumn}
					{@render rightColumn()}
				{:else}
					<div class={unstyled ? undefined : "stuic-checkout-confirm-step-sidebar"}>
						<CheckoutSectionHeader noMinHeight>
							<H level={hLevel} renderLevel={hRenderLevel}>
								{t("checkout.step.summary_title")}
							</H>
						</CheckoutSectionHeader>
						<CheckoutOrderSummary
							totals={order.totals}
							hasShipping={!!order.delivery_option_id}
							{formatPrice}
							t={tProp}
							{unstyled}
						/>

						<!-- Validation Errors -->
						{#if validationErrors && validationErrors.length > 0}
							<div
								class={unstyled ? undefined : "stuic-checkout-confirm-step-validation"}
								role="alert"
							>
								<p>{t("checkout.step.validation_errors")}</p>
								<ul>
									{#each validationErrors as err}
										<li>{err.message}</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Place Order CTA -->
						<Button
							intent="primary"
							class="w-full mt-4"
							disabled={!isValid || isSubmitting}
							onclick={onPlaceOrder}
							aria-busy={isSubmitting}
						>
							{isSubmitting
								? (processingLabel ?? t("checkout.step.processing"))
								: (placeOrderLabel ?? t("checkout.step.place_order"))}
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
