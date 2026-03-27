<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type { ButtonVariant } from "../Button/Button.svelte";

	export type BillingPeriod = "monthly" | "annual";

	export interface PricingFeature {
		/** Feature label */
		label: THC;
		/** true = checkmark (default), false = dash/not-included, or THC for custom icon */
		icon?: boolean | THC;
	}

	export interface PricingTier {
		/** Unique identifier */
		id: string;
		/** Tier display name */
		name: THC;
		/** Short description or tagline */
		description?: THC;
		/** Price per billing period */
		price: {
			monthly?: number | string;
			annual?: number | string;
		};
		/** Currency symbol (e.g. "$", "EUR"). Overrides table-level currency. */
		currency?: string;
		/** Billing period label overrides (e.g. "/mo", "/year") */
		periodLabel?: {
			monthly?: string;
			annual?: string;
		};
		/** Discount badge text for annual billing (e.g. "Save 20%") */
		annualDiscountBadge?: THC;
		/** Feature list for this tier */
		features?: PricingFeature[];
		/** Reference tier id for inheritance ("Everything in {tierName}, plus...") */
		inheritFrom?: string;
		/** Custom inheritance label. Defaults to "Everything in {tierName}, plus..." */
		inheritLabel?: THC;
		/** CTA button label */
		ctaLabel?: THC;
		/** CTA button onclick handler */
		ctaOnClick?: (tier: PricingTier, billingPeriod: BillingPeriod) => void;
		/** CTA button href (renders as anchor) */
		ctaHref?: string;
		/** CTA button intent color */
		ctaIntent?: IntentColorKey;
		/** CTA button variant */
		ctaVariant?: ButtonVariant;
		/** Mark this tier as highlighted/recommended */
		highlighted?: boolean;
		/** Badge text for highlighted tier (e.g. "Most Popular") */
		highlightedBadge?: THC;
		/** Disabled/sold-out state */
		disabled?: boolean;
		/** Disabled reason text (e.g. "Sold out", "Coming soon") */
		disabledLabel?: THC;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Array of pricing tier definitions */
		tiers: PricingTier[];
		/** Currently active billing period (bindable) */
		billingPeriod?: BillingPeriod;
		/** Show the monthly/annual toggle */
		showBillingToggle?: boolean;
		/** Label for monthly option in toggle */
		monthlyLabel?: string;
		/** Label for annual option in toggle */
		annualLabel?: string;
		/** Currency symbol applied to all tiers (can be overridden per-tier) */
		currency?: string;
		/** Default period labels (can be overridden per-tier) */
		periodLabel?: {
			monthly?: string;
			annual?: string;
		};
		/** Custom snippet to override the entire billing toggle area */
		renderToggle?: Snippet<[{ billingPeriod: BillingPeriod; toggle: () => void }]>;
		/** Custom snippet to override how each tier card renders */
		renderTier?: Snippet<
			[{ tier: PricingTier; billingPeriod: BillingPeriod; index: number }]
		>;
		/** Custom snippet to override the CTA button area per tier */
		renderCta?: Snippet<[{ tier: PricingTier; billingPeriod: BillingPeriod }]>;
		/** Custom snippet to override the feature list area per tier */
		renderFeatures?: Snippet<
			[{ tier: PricingTier; features: PricingFeature[]; inheritFrom?: PricingTier }]
		>;
		/** Custom snippet for the feature icon */
		renderFeatureIcon?: Snippet<[{ feature: PricingFeature; included: boolean }]>;
		/** Header area above tiers */
		children?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for root */
		class?: string;
		/** Additional CSS classes for the tiers grid */
		classTiers?: string;
		/** Additional CSS classes applied to each tier card */
		classTier?: string;
		/** Bindable element reference */
		el?: HTMLElement;
		/** Inline style */
		style?: string;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { getTHCStringContent } from "../Thc/Thc.svelte";
	import Button from "../Button/Button.svelte";
	import ButtonGroupRadio from "../ButtonGroupRadio/ButtonGroupRadio.svelte";

	let {
		tiers,
		billingPeriod = $bindable("monthly"),
		showBillingToggle = true,
		monthlyLabel = "Monthly",
		annualLabel = "Annual",
		currency = "$",
		periodLabel = { monthly: "/mo", annual: "/yr" },
		renderToggle,
		renderTier,
		renderCta,
		renderFeatures,
		renderFeatureIcon,
		children,
		unstyled = false,
		class: classProp,
		classTiers: classTiersProp,
		classTier: classTierProp,
		el = $bindable(),
		style,
		...rest
	}: Props = $props();

	function getInheritedTier(tier: PricingTier): PricingTier | undefined {
		if (!tier.inheritFrom) return undefined;
		return tiers.find((t) => t.id === tier.inheritFrom);
	}

	function formatPrice(
		tier: PricingTier,
		period: BillingPeriod
	): { display: string; isNumeric: boolean } {
		const raw = tier.price[period];
		if (raw === undefined || raw === null) return { display: "", isNumeric: false };
		if (typeof raw === "string") return { display: raw, isNumeric: false };
		const curr = tier.currency ?? currency;
		return { display: `${curr}${raw}`, isNumeric: true };
	}

	function getPeriodLabel(tier: PricingTier, period: BillingPeriod): string {
		return tier.periodLabel?.[period] ?? periodLabel?.[period] ?? "";
	}

	function toggle() {
		billingPeriod = billingPeriod === "monthly" ? "annual" : "monthly";
	}

	let hasBothPeriods = $derived(
		tiers.some((t) => t.price.monthly !== undefined && t.price.annual !== undefined)
	);

	let _class = $derived(unstyled ? classProp : twMerge("stuic-pricing-table", classProp));
	let _classTiers = $derived(
		unstyled ? classTiersProp : twMerge("stuic-pricing-table-tiers", classTiersProp)
	);
</script>

<div bind:this={el} class={_class} {style} {...rest}>
	{@render children?.()}

	{#if showBillingToggle && hasBothPeriods}
		{#if renderToggle}
			{@render renderToggle({ billingPeriod, toggle })}
		{:else}
			<ButtonGroupRadio
				value={billingPeriod}
				options={[
					{ label: monthlyLabel, value: "monthly" },
					{ label: annualLabel, value: "annual" },
				]}
				onButtonClick={(i) => {
					billingPeriod = i === 0 ? "monthly" : "annual";
				}}
				{unstyled}
				style="
					width: auto;
					--stuic-button-group-radius: 9999px;
					--stuic-button-group-padding: 0.25rem;
					--stuic-button-group-bg: var(--stuic-color-muted);
					--stuic-button-group-border-width: 0;
					--stuic-button-group-button-bg-active: var(--stuic-color-background);
					--stuic-button-group-button-text-active: var(--stuic-color-foreground);
					--stuic-button-group-button-bg-active-hover: var(--stuic-color-background);
					--stuic-button-group-button-text-active-hover: var(--stuic-color-foreground);
				"
				classButtonActive="shadow"
			/>
		{/if}
	{/if}

	<div class={_classTiers} role="list">
		{#each tiers as tier, index (tier.id)}
			{#if renderTier}
				{@render renderTier({ tier, billingPeriod, index })}
			{:else}
				{@const priceInfo = formatPrice(tier, billingPeriod)}
				{@const inheritedTier = getInheritedTier(tier)}
				{@const tierClass = unstyled
					? classTierProp
					: twMerge("stuic-pricing-table-tier", classTierProp)}

				<div
					class={tierClass}
					data-highlighted={!unstyled && tier.highlighted ? "" : undefined}
					data-disabled={!unstyled && tier.disabled ? "" : undefined}
					aria-disabled={tier.disabled ? "true" : undefined}
					role="listitem"
				>
					{#if tier.highlighted && tier.highlightedBadge}
						<div class={unstyled ? undefined : "stuic-pricing-table-badge"}>
							<Thc thc={tier.highlightedBadge} />
						</div>
					{/if}

					<div class={unstyled ? undefined : "stuic-pricing-table-tier-header"}>
						<div class={unstyled ? undefined : "stuic-pricing-table-tier-name"}>
							<Thc thc={tier.name} />
						</div>
						{#if tier.description}
							<div class={unstyled ? undefined : "stuic-pricing-table-tier-description"}>
								<Thc thc={tier.description} />
							</div>
						{/if}
					</div>

					<div class={unstyled ? undefined : "stuic-pricing-table-price"}>
						{#if priceInfo.display}
							<span class={unstyled ? undefined : "stuic-pricing-table-price-value"}>
								{priceInfo.display}
							</span>
							{#if priceInfo.isNumeric}
								<span class={unstyled ? undefined : "stuic-pricing-table-price-period"}>
									{getPeriodLabel(tier, billingPeriod)}
								</span>
							{/if}
						{/if}
						{#if billingPeriod === "annual" && tier.annualDiscountBadge}
							<span class={unstyled ? undefined : "stuic-pricing-table-discount-badge"}>
								<Thc thc={tier.annualDiscountBadge} />
							</span>
						{/if}
					</div>

					<div class={unstyled ? undefined : "stuic-pricing-table-cta"}>
						{#if renderCta}
							{@render renderCta({ tier, billingPeriod })}
						{:else if tier.disabled && tier.disabledLabel}
							<Button disabled unstyled={unstyled} class="w-full">
								{#snippet children()}<Thc thc={tier.disabledLabel!} />{/snippet}
							</Button>
						{:else if tier.ctaLabel}
							<Button
								intent={tier.ctaIntent ?? (tier.highlighted ? "primary" : undefined)}
								variant={tier.ctaVariant ?? (tier.highlighted ? "solid" : "outline")}
								href={tier.ctaHref}
								onclick={tier.ctaOnClick
									? () => tier.ctaOnClick!(tier, billingPeriod)
									: undefined}
								disabled={tier.disabled}
								class="w-full"
							>
								{#snippet children()}<Thc thc={tier.ctaLabel!} />{/snippet}
							</Button>
						{/if}
					</div>

					<div class={unstyled ? undefined : "stuic-pricing-table-features"}>
						{#if renderFeatures}
							{@render renderFeatures({
								tier,
								features: tier.features ?? [],
								inheritFrom: inheritedTier,
							})}
						{:else}
							{#if inheritedTier}
								<div class={unstyled ? undefined : "stuic-pricing-table-inherit"}>
									{#if tier.inheritLabel}
										<Thc thc={tier.inheritLabel} />
									{:else}
										Everything in <strong>{getTHCStringContent(inheritedTier.name)}</strong>, plus&hellip;
									{/if}
								</div>
							{/if}

							{#if tier.features?.length}
								<ul class={unstyled ? undefined : "stuic-pricing-table-feature-list"}>
									{#each tier.features as feature}
										{@const included = feature.icon !== false}
										<li
											class={unstyled ? undefined : "stuic-pricing-table-feature-item"}
											data-included={!unstyled && included ? "" : undefined}
										>
											<span
												class={unstyled ? undefined : "stuic-pricing-table-feature-icon"}
												aria-hidden="true"
											>
												{#if renderFeatureIcon}
													{@render renderFeatureIcon({ feature, included })}
												{:else if feature.icon === true || feature.icon === undefined}
													&#x2713;
												{:else if feature.icon === false}
													&#x2014;
												{:else}
													<Thc thc={feature.icon} />
												{/if}
											</span>
											<span class={unstyled ? undefined : "stuic-pricing-table-feature-label"}>
												<Thc thc={feature.label} />
											</span>
										</li>
									{/each}
								</ul>
							{/if}
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
