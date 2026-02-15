<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CheckoutOrderData } from "./_internal/checkout-types.js";

	const DEFAULT_SUCCESS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Completed order data */
		order: CheckoutOrderData;

		/** Order ID for display */
		orderId: string;

		/** Whether confirmation email was sent to customer */
		emailSent?: boolean;

		/**
		 * Format price (cents → display string).
		 * Default: defaultFormatPrice
		 */
		formatPrice?: (value: number) => string;

		/**
		 * Called when "Continue Shopping" is clicked.
		 * If undefined, the button is hidden.
		 */
		onContinueShopping?: () => void;

		/**
		 * Success icon HTML string.
		 * Default: green checkmark circle SVG (64px).
		 */
		successIcon?: string;

		/** Override the header section (icon + title + subtitle) */
		header?: Snippet<[{ orderId: string }]>;

		/** Override the order number display */
		orderNumber?: Snippet<[{ orderId: string }]>;

		/** Additional content at the bottom (e.g., track order link, support info) */
		footer?: Snippet<[{ orderId: string; order: CheckoutOrderData }]>;

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
	import Cart from "../Cart/Cart.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { defaultFormatPrice } from "./_internal/checkout-utils.js";
	import H, { type HLevel } from "../H/H.svelte";
	import CheckoutSectionHeader from "./CheckoutSectionHeader.svelte";
	import CheckoutOrderSummary from "./CheckoutOrderSummary.svelte";

	let {
		order,
		orderId,
		emailSent = false,
		formatPrice: formatPriceProp,
		onContinueShopping,
		successIcon,
		header,
		orderNumber,
		footer,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		hLevel = 2,
		hRenderLevel = 2,
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);
	let fp = $derived(formatPriceProp ?? defaultFormatPrice);
	let successIconHtml = $derived(successIcon ?? DEFAULT_SUCCESS_ICON);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-confirmation", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Header -->
	{#if header}
		{@render header({ orderId })}
	{:else}
		<CheckoutSectionHeader>
			<div class="flex flex-col items-center">
				<div class={unstyled ? undefined : "stuic-checkout-confirmation-icon"}>
					{@html successIconHtml}
				</div>
				<H
					level={hLevel}
					renderLevel={hRenderLevel}
					class={unstyled ? undefined : "stuic-checkout-confirmation-title"}
				>
					{t("checkout.complete.title")}
				</H>
				<p class={unstyled ? undefined : "stuic-checkout-confirmation-subtitle"}>
					{t("checkout.complete.subtitle")}
				</p>
			</div>
		</CheckoutSectionHeader>
	{/if}

	<!-- Order Number -->
	{#if orderNumber}
		{@render orderNumber({ orderId })}
	{:else}
		<div class={unstyled ? undefined : "stuic-checkout-confirmation-order-number"}>
			<span>{t("checkout.complete.order_number")}</span>
			<code>{orderId}</code>
		</div>
	{/if}

	<!-- Email Notification -->
	{#if emailSent && order.customer_email}
		<p class={unstyled ? undefined : "stuic-checkout-confirmation-email"}>
			{t("checkout.complete.email_sent", { email: order.customer_email })}
		</p>
	{/if}

	<!-- Items -->
	<section class={unstyled ? undefined : "stuic-checkout-card"}>
		<CheckoutSectionHeader>
			<H
				level={3}
				class={unstyled ? undefined : "stuic-checkout-confirmation-section-title"}
			>
				{t("checkout.complete.items_title")}
			</H>
		</CheckoutSectionHeader>
		<Cart
			variant="summary"
			items={order.items.map((item) => ({
				id: item.product_id,
				name: item.name,
				unitPrice: item.price,
				quantity: item.quantity,
				lineTotal: item.price * item.quantity,
			}))}
			formatPrice={formatPriceProp}
			{unstyled}
		/>
	</section>

	<!-- Shipping Details -->
	{#if order.shipping_address || order.delivery_option}
		<section class={unstyled ? undefined : "stuic-checkout-card"}>
			<CheckoutSectionHeader noMinHeight>
				<H
					level={3}
					class={unstyled ? undefined : "stuic-checkout-confirmation-section-title"}
				>
					{t("checkout.complete.shipping_title")}
				</H>
			</CheckoutSectionHeader>
			<div class={unstyled ? undefined : "stuic-checkout-confirmation-shipping-grid"}>
				{#if order.shipping_address}
					<div>
						<CheckoutSectionHeader noMinHeight class="mb-1">
							<H
								level={4}
								class={unstyled
									? undefined
									: "stuic-checkout-confirmation-subsection-label"}
							>
								{t("checkout.complete.address_label")}
							</H>
						</CheckoutSectionHeader>
						<div class={unstyled ? undefined : "stuic-checkout-confirmation-address"}>
							<div>{order.shipping_address.name}</div>
							<div>{order.shipping_address.street}</div>
							<div>
								{order.shipping_address.city}, {order.shipping_address.postal_code}
							</div>
							<div>{order.shipping_address.country}</div>
						</div>
					</div>
				{/if}
				{#if order.delivery_option}
					<div>
						<CheckoutSectionHeader noMinHeight class="mb-1">
							<H
								level={4}
								class={unstyled
									? undefined
									: "stuic-checkout-confirmation-subsection-label"}
							>
								{t("checkout.complete.delivery_label")}
							</H>
						</CheckoutSectionHeader>
						<div>{order.delivery_option.name}</div>
						<div
							class={unstyled ? undefined : "stuic-checkout-confirmation-delivery-detail"}
						>
							{#if order.delivery_option.price === 0}
								{t("checkout.summary.free")}
							{:else}
								{fp(order.delivery_option.price)}
							{/if}
							{#if order.delivery_option.estimated_time}
								&mdash; {order.delivery_option.estimated_time}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Order Totals -->
	<section class={unstyled ? undefined : "stuic-checkout-card"}>
		<CheckoutSectionHeader noMinHeight>
			<H
				level={3}
				class={unstyled ? undefined : "stuic-checkout-confirmation-section-title"}
			>
				{t("checkout.complete.totals_title")}
			</H>
		</CheckoutSectionHeader>
		<CheckoutOrderSummary
			totals={order.totals}
			formatPrice={formatPriceProp}
			t={tProp}
			{unstyled}
		/>
	</section>

	<!-- Continue Shopping CTA -->
	{#if onContinueShopping}
		<div class={unstyled ? undefined : "stuic-checkout-confirmation-cta"}>
			<Button intent="primary" onclick={onContinueShopping}>
				{t("checkout.complete.continue_shopping")}
			</Button>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer({ orderId, order })}
	{/if}
</div>
