<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { CheckoutDeliveryOption } from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Available delivery options */
		options: CheckoutDeliveryOption[];

		/**
		 * Currently selected option ID.
		 * Bindable for reactive state management.
		 */
		selectedId?: string;

		/**
		 * Called when an option is selected.
		 * Fires in addition to the bindable update.
		 */
		onSelect?: (optionId: string) => void;

		/**
		 * Current order subtotal in cents.
		 * Used to determine if free shipping threshold is met.
		 */
		subtotal?: number;

		/**
		 * Whether the component is currently updating (e.g., API call in flight).
		 * Reduces opacity and disables interaction.
		 */
		isUpdating?: boolean;

		/**
		 * Format price (cents -> display string).
		 * Default: defaultFormatPrice
		 */
		formatPrice?: (value: number) => string;

		/**
		 * Override rendering of an individual delivery option card.
		 */
		option?: Snippet<
			[
				{
					option: CheckoutDeliveryOption;
					selected: boolean;
					free: boolean;
					effectivePrice: number;
					formatPrice: (v: number) => string;
					isUpdating: boolean;
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
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import FieldRadioInternal from "../Input/_internal/FieldRadioInternal.svelte";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { defaultFormatPrice } from "./_internal/checkout-utils.js";

	let {
		options,
		selectedId = $bindable(),
		onSelect,
		subtotal = 0,
		isUpdating = false,
		formatPrice: formatPriceProp,
		option: optionSnippet,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);
	let fp = $derived(formatPriceProp ?? defaultFormatPrice);

	// stuic-radios provides the custom radio input styling context
	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-radios stuic-checkout-delivery", classProp)
	);

	// Filter to active options, sorted by sort_order
	let activeOptions = $derived(
		options.filter((o) => o.is_active).sort((a, b) => a.sort_order - b.sort_order)
	);

	function isFree(opt: CheckoutDeliveryOption): boolean {
		return (
			opt.price === 0 || (opt.free_above != null && (subtotal ?? 0) >= opt.free_above)
		);
	}

	function getEffectivePrice(opt: CheckoutDeliveryOption): number {
		return isFree(opt) ? 0 : opt.price;
	}

	// Required by FieldRadioInternal (unused — no validation on delivery options)
	let _validation = $state<ValidationResult | undefined>();
</script>

<div
	bind:this={el}
	class={_class}
	role="radiogroup"
	aria-label={t("checkout.delivery.label")}
	data-updating={isUpdating || undefined}
	{...rest}
>
	{#if activeOptions.length === 0}
		<p class={unstyled ? undefined : "stuic-checkout-delivery-empty"}>
			{t("checkout.delivery.none_available")}
		</p>
	{:else}
		{#each activeOptions as opt (opt.id)}
			{@const free = isFree(opt)}
			{@const price = getEffectivePrice(opt)}
			{@const selected = selectedId === opt.id}

			{#if optionSnippet}
				{@render optionSnippet({
					option: opt,
					selected,
					free,
					effectivePrice: price,
					formatPrice: fp,
					isUpdating,
				})}
			{:else}
				<FieldRadioInternal
					name="delivery-option"
					bind:group={selectedId}
					value={opt.id}
					disabled={isUpdating}
					onchange={() => onSelect?.(opt.id)}
					bind:validation={_validation}
					classRadioBox={unstyled
						? undefined
						: twMerge(
								"stuic-checkout-delivery-option",
								selected && "stuic-checkout-delivery-option--selected",
								"pr-4"
							)}
					classInputBox="ml-0"
					classLabelBox="ml-0"
				>
					{#snippet label({ id })}
						<div class={unstyled ? undefined : "stuic-checkout-delivery-option-header"}>
							<span class={unstyled ? undefined : "stuic-checkout-delivery-option-name"}>
								{opt.name}
							</span>
							<span
								class={unstyled
									? undefined
									: twMerge(
											"stuic-checkout-delivery-option-price",
											free && "stuic-checkout-delivery-option-price--free"
										)}
							>
								{free ? t("checkout.delivery.free") : fp(price)}
							</span>
						</div>

						{#if opt.description}
							<p
								class={unstyled
									? undefined
									: "stuic-checkout-delivery-option-description"}
							>
								{opt.description}
							</p>
						{/if}

						{#if opt.estimated_time}
							<p class={unstyled ? undefined : "stuic-checkout-delivery-option-estimate"}>
								{t("checkout.delivery.estimated", { time: opt.estimated_time })}
							</p>
						{/if}

						{#if free && opt.free_above}
							<p class={unstyled ? undefined : "stuic-checkout-delivery-option-free-msg"}>
								{t("checkout.delivery.free_applied")}
							</p>
						{:else if opt.free_above && !free}
							<p
								class={unstyled ? undefined : "stuic-checkout-delivery-option-threshold"}
							>
								{t("checkout.delivery.free_above", { threshold: fp(opt.free_above) })}
							</p>
						{/if}
					{/snippet}
				</FieldRadioInternal>
			{/if}
		{/each}
	{/if}
</div>
