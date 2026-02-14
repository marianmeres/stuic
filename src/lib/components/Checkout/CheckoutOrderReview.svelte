<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutAddressData,
		CheckoutDeliverySnapshot,
		CheckoutOrderData,
		CheckoutOrderLineItem,
	} from "./_internal/checkout-types.js";

	const DEFAULT_EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** The order data to display */
		order: CheckoutOrderData;

		/**
		 * Format price (cents -> display string).
		 * Default: defaultFormatPrice
		 */
		formatPrice?: (value: number) => string;

		/**
		 * Edit callbacks for each section.
		 * If undefined for a section, that section's edit button is hidden.
		 */
		onEditItems?: () => void;
		onEditShippingAddress?: () => void;
		onEditBillingAddress?: () => void;
		onEditDelivery?: () => void;

		/**
		 * HTML string for the edit button icon.
		 * Default: a small pencil SVG.
		 */
		editIcon?: string;

		/** Override items section rendering */
		itemsSection?: Snippet<
			[
				{
					items: CheckoutOrderLineItem[];
					formatPrice: (v: number) => string;
					onEdit?: () => void;
				},
			]
		>;

		/** Override shipping address section rendering */
		shippingSection?: Snippet<
			[
				{
					address: CheckoutAddressData;
					onEdit?: () => void;
				},
			]
		>;

		/** Override billing address section rendering */
		billingSection?: Snippet<
			[
				{
					address?: CheckoutAddressData;
					shippingAddress?: CheckoutAddressData;
					isSameAsShipping: boolean;
					onEdit?: () => void;
				},
			]
		>;

		/** Override delivery method section rendering */
		deliverySection?: Snippet<
			[
				{
					delivery: CheckoutDeliverySnapshot;
					formatPrice: (v: number) => string;
					onEdit?: () => void;
				},
			]
		>;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { defaultFormatPrice } from "./_internal/checkout-utils.js";
	import H from "../H/H.svelte";

	let {
		order,
		formatPrice: formatPriceProp,
		onEditItems,
		onEditShippingAddress,
		onEditBillingAddress,
		onEditDelivery,
		editIcon = DEFAULT_EDIT_ICON,
		itemsSection,
		shippingSection,
		billingSection,
		deliverySection,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);
	let fp = $derived(formatPriceProp ?? defaultFormatPrice);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-review", classProp)
	);

	let isBillingSameAsShipping = $derived.by(() => {
		const s = order.shipping_address;
		const b = order.billing_address;
		if (!b || !s) return true;
		return (
			s.name === b.name &&
			s.street === b.street &&
			s.city === b.city &&
			s.postal_code === b.postal_code &&
			s.country === b.country &&
			(s.phone ?? "") === (b.phone ?? "")
		);
	});
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Items Section -->
	{#if itemsSection}
		{@render itemsSection({ items: order.items, formatPrice: fp, onEdit: onEditItems })}
	{:else}
		<section
			class={unstyled ? undefined : "stuic-checkout-review-section stuic-checkout-card"}
		>
			<div class={unstyled ? undefined : "stuic-checkout-review-section-header"}>
				<H level={4} class={unstyled ? undefined : "stuic-checkout-review-heading"}>
					{t("checkout.review.items_title")}
				</H>
				{#if onEditItems}
					<Button variant="ghost" size="sm" onclick={onEditItems}>
						{#if editIcon}{@html editIcon}{/if}
						{t("checkout.review.edit")}
					</Button>
				{/if}
			</div>
			<div class={unstyled ? undefined : "stuic-checkout-review-items"}>
				{#each order.items as item (item.product_id)}
					<div class={unstyled ? undefined : "stuic-checkout-review-item"}>
						<span>{item.quantity} &times; {item.name}</span>
						<span>{fp(item.price * item.quantity)}</span>
					</div>
					{#if item.quantity > 1}
						<span class={unstyled ? undefined : "stuic-checkout-review-item-each"}>
							{t("checkout.review.each", { price: fp(item.price) })}
						</span>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	<!-- Shipping Address Section -->
	{#if order.shipping_address}
		{#if shippingSection}
			{@render shippingSection({
				address: order.shipping_address,
				onEdit: onEditShippingAddress,
			})}
		{:else}
			<section
				class={unstyled ? undefined : "stuic-checkout-review-section stuic-checkout-card"}
			>
				<div class={unstyled ? undefined : "stuic-checkout-review-section-header"}>
					<H level={4} class={unstyled ? undefined : "stuic-checkout-review-heading"}>
						{t("checkout.review.shipping_title")}
					</H>
					{#if onEditShippingAddress}
						<Button variant="ghost" size="sm" onclick={onEditShippingAddress}>
							{#if editIcon}{@html editIcon}{/if}
							{t("checkout.review.edit")}
						</Button>
					{/if}
				</div>
				<div class={unstyled ? undefined : "stuic-checkout-review-address"}>
					<div>{order.shipping_address.name}</div>
					<div>{order.shipping_address.street}</div>
					<div>{order.shipping_address.city} {order.shipping_address.postal_code}</div>
					<div>{order.shipping_address.country}</div>
					{#if order.shipping_address.phone}
						<div>{order.shipping_address.phone}</div>
					{/if}
				</div>
			</section>
		{/if}
	{/if}

	<!-- Billing Address Section -->
	{#if billingSection}
		{@render billingSection({
			address: order.billing_address,
			shippingAddress: order.shipping_address,
			isSameAsShipping: isBillingSameAsShipping,
			onEdit: onEditBillingAddress,
		})}
	{:else}
		<section
			class={unstyled ? undefined : "stuic-checkout-review-section stuic-checkout-card"}
		>
			<div class={unstyled ? undefined : "stuic-checkout-review-section-header"}>
				<H level={4} class={unstyled ? undefined : "stuic-checkout-review-heading"}>
					{t("checkout.review.billing_title")}
				</H>
				{#if onEditBillingAddress}
					<Button variant="ghost" size="sm" onclick={onEditBillingAddress}>
						{#if editIcon}{@html editIcon}{/if}
						{t("checkout.review.edit")}
					</Button>
				{/if}
			</div>
			{#if isBillingSameAsShipping}
				<p class={unstyled ? undefined : "stuic-checkout-review-billing-same"}>
					{t("checkout.review.billing_same")}
				</p>
			{:else if order.billing_address}
				<div class={unstyled ? undefined : "stuic-checkout-review-address"}>
					<div>{order.billing_address.name}</div>
					<div>{order.billing_address.street}</div>
					<div>{order.billing_address.city} {order.billing_address.postal_code}</div>
					<div>{order.billing_address.country}</div>
					{#if order.billing_address.phone}
						<div>{order.billing_address.phone}</div>
					{/if}
				</div>
			{/if}
		</section>
	{/if}

	<!-- Delivery Method Section -->
	{#if order.delivery_option}
		{#if deliverySection}
			{@render deliverySection({
				delivery: order.delivery_option,
				formatPrice: fp,
				onEdit: onEditDelivery,
			})}
		{:else}
			<section
				class={unstyled ? undefined : "stuic-checkout-review-section stuic-checkout-card"}
			>
				<div class={unstyled ? undefined : "stuic-checkout-review-section-header"}>
					<H level={4} class={unstyled ? undefined : "stuic-checkout-review-heading"}>
						{t("checkout.review.delivery_title")}
					</H>
					{#if onEditDelivery}
						<Button variant="ghost" size="sm" onclick={onEditDelivery}>
							{#if editIcon}{@html editIcon}{/if}
							{t("checkout.review.edit")}
						</Button>
					{/if}
				</div>
				<div class={unstyled ? undefined : "stuic-checkout-review-delivery"}>
					<span>{order.delivery_option.name}</span>
					<span>
						{#if order.delivery_option.price === 0}
							{t("checkout.summary.free")}
						{:else}
							{fp(order.delivery_option.price)}
						{/if}
					</span>
				</div>
				{#if order.delivery_option.estimated_time}
					<p class={unstyled ? undefined : "stuic-checkout-review-delivery-estimate"}>
						{order.delivery_option.estimated_time}
					</p>
				{/if}
			</section>
		{/if}
	{/if}
</div>
