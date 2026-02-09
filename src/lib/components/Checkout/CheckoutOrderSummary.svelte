<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CheckoutOrderTotals } from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Price totals to display */
		totals: CheckoutOrderTotals;

		/**
		 * Whether a shipping method has been selected.
		 * When false, shipping row shows a dash instead of a price.
		 * Default: true
		 */
		hasShipping?: boolean;

		/**
		 * Format a number (in cents) to a display string.
		 * Default: defaultFormatPrice (cents / 100, 2 decimal places)
		 */
		formatPrice?: (value: number) => string;

		/**
		 * Override rendering of any individual row.
		 * Receives the label, formatted value string, and row type flags.
		 */
		row?: Snippet<
			[
				{
					label: string;
					value: string;
					isTotal?: boolean;
					isDiscount?: boolean;
					isShipping?: boolean;
				},
			]
		>;

		/**
		 * Inject extra rows before the total line.
		 * Useful for coupons, gift cards, etc.
		 */
		extraRows?: Snippet<[{ formatPrice: (v: number) => string }]>;

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

	let {
		totals,
		hasShipping = true,
		formatPrice: formatPriceProp,
		row,
		extraRows,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);
	let fp = $derived(formatPriceProp ?? defaultFormatPrice);

	let shippingValue = $derived.by(() => {
		if (!hasShipping) return t("checkout.summary.not_selected");
		if (totals.shipping === 0) return t("checkout.summary.free");
		return fp(totals.shipping);
	});

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-summary", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Subtotal -->
	{#if row}
		{@render row({
			label: t("checkout.summary.subtotal"),
			value: fp(totals.subtotal),
		})}
	{:else}
		<div class={unstyled ? undefined : "stuic-checkout-summary-row"}>
			<span>{t("checkout.summary.subtotal")}</span>
			<span>{fp(totals.subtotal)}</span>
		</div>
	{/if}

	<!-- Shipping -->
	{#if row}
		{@render row({
			label: t("checkout.summary.shipping"),
			value: shippingValue,
			isShipping: true,
		})}
	{:else}
		<div class={unstyled ? undefined : "stuic-checkout-summary-row"}>
			<span>{t("checkout.summary.shipping")}</span>
			<span>{shippingValue}</span>
		</div>
	{/if}

	<!-- Tax (conditional) -->
	{#if totals.tax > 0}
		{#if row}
			{@render row({
				label: t("checkout.summary.tax"),
				value: fp(totals.tax),
			})}
		{:else}
			<div class={unstyled ? undefined : "stuic-checkout-summary-row"}>
				<span>{t("checkout.summary.tax")}</span>
				<span>{fp(totals.tax)}</span>
			</div>
		{/if}
	{/if}

	<!-- Discount (conditional) -->
	{#if totals.discount > 0}
		{#if row}
			{@render row({
				label: t("checkout.summary.discount"),
				value: `-${fp(totals.discount)}`,
				isDiscount: true,
			})}
		{:else}
			<div
				class={unstyled
					? undefined
					: "stuic-checkout-summary-row stuic-checkout-summary-row--discount"}
			>
				<span>{t("checkout.summary.discount")}</span>
				<span>-{fp(totals.discount)}</span>
			</div>
		{/if}
	{/if}

	<!-- Extra rows slot -->
	{#if extraRows}
		{@render extraRows({ formatPrice: fp })}
	{/if}

	<!-- Total (with separator) -->
	{#if row}
		{@render row({
			label: t("checkout.summary.total"),
			value: fp(totals.total),
			isTotal: true,
		})}
	{:else}
		<div
			class={unstyled
				? undefined
				: "stuic-checkout-summary-row stuic-checkout-summary-row--total"}
		>
			<span>{t("checkout.summary.total")}</span>
			<span>{fp(totals.total)}</span>
		</div>
	{/if}
</div>
