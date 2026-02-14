<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CartComponentItem } from "../Cart/Cart.svelte";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		/** Cart items in stuic CartComponentItem format */
		items: CartComponentItem[];

		/**
		 * Format a number (in cents) to a display string.
		 * Default: defaultFormatPrice (cents / 100, 2 decimal places)
		 */
		formatPrice?: (value: number) => string;

		/**
		 * Called when "Edit Cart" is clicked.
		 * If undefined, the edit action is not rendered.
		 */
		onEditCart?: () => void;

		/** Override thumbnail rendering (passed through to Cart) */
		thumbnail?: Snippet<[{ item: CartComponentItem }]>;

		/**
		 * Override the Cart's summary section.
		 * Passed through to Cart's `summary` snippet.
		 */
		summary?: Snippet<
			[
				{
					items: CartComponentItem[];
					total: number;
					itemCount: number;
					formatPrice: (v: number) => string;
				},
			]
		>;

		/** Override the title (default: "Order Summary") */
		title?: Snippet | string;

		/** Override the edit action */
		editAction?: Snippet<[{ onEditCart?: () => void }]>;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { defaultFormatPrice } from "./_internal/checkout-utils.js";
	import Cart from "../Cart/Cart.svelte";
	import Button from "../Button/Button.svelte";
	import { H } from "../H/index.js";

	let {
		items,
		formatPrice: formatPriceProp,
		onEditCart,
		thumbnail,
		summary: summaryProp,
		title: titleProp,
		editAction,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);
	let fp = $derived(formatPriceProp ?? defaultFormatPrice);

	let total = $derived(items.reduce((sum, item) => sum + item.lineTotal, 0));
	let itemCount = $derived(items.reduce((sum, item) => sum + item.quantity, 0));

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-cart-review", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Header bar -->
	<div class={unstyled ? undefined : "stuic-checkout-cart-review-header"}>
		{#if typeof titleProp === "function"}
			{@render titleProp()}
		{:else}
			<H level={3} class={unstyled ? undefined : "stuic-checkout-cart-review-title"}>
				{typeof titleProp === "string" ? titleProp : t("checkout.cart.title")}
			</H>
		{/if}

		{#if editAction}
			{@render editAction({ onEditCart })}
		{:else if onEditCart}
			<Button variant="outline" size="sm" onclick={onEditCart}>
				{t("checkout.cart.edit")}
			</Button>
		{/if}
	</div>

	<!-- Cart (readonly) -->
	<Cart {items} readonly formatPrice={fp} {thumbnail} t={tProp} {unstyled}>
		{#snippet summary({
			items: _items,
			total: _total,
			itemCount: _itemCount,
			formatPrice: _fp,
		})}
			{#if summaryProp}
				{@render summaryProp({
					items: _items,
					total: _total,
					itemCount: _itemCount,
					formatPrice: _fp,
				})}
			{:else}
				<div class={unstyled ? undefined : "stuic-checkout-cart-review-summary"}>
					<span>
						{t("checkout.cart.subtotal")}
						({_itemCount === 1
							? t("checkout.cart.item_count_1")
							: t("checkout.cart.item_count_n", { count: _itemCount })})
					</span>
					<span class={unstyled ? undefined : "stuic-checkout-cart-review-summary-total"}>
						{_fp(_total)}
					</span>
				</div>
			{/if}
		{/snippet}
	</Cart>
</div>
