<script lang="ts">
	import { PricingTable, type PricingTier, type BillingPeriod } from "$lib/index.js";

	let billingPeriod: BillingPeriod = $state("monthly");

	// --- Basic 3-tier example ---
	const basicTiers: PricingTier[] = [
		{
			id: "free",
			name: "Free",
			description: "For individuals getting started",
			price: { monthly: 0, annual: 0 },
			features: [
				{ label: "Up to 3 projects" },
				{ label: "Basic analytics" },
				{ label: "Community support" },
				{ label: "API access", icon: false },
			],
			ctaLabel: "Get Started",
			ctaHref: "#free",
			ctaVariant: "outline",
		},
		{
			id: "pro",
			name: "Pro",
			description: "For growing teams",
			price: { monthly: 29, annual: 290 },
			annualDiscountBadge: "Save 17%",
			highlighted: true,
			highlightedBadge: "Most Popular",
			inheritFrom: "free",
			features: [
				{ label: "Unlimited projects" },
				{ label: "Advanced analytics" },
				{ label: "Priority support" },
				{ label: "Custom integrations" },
				{ label: "API access" },
			],
			ctaLabel: "Start Free Trial",
			ctaHref: "#pro",
		},
		{
			id: "enterprise",
			name: "Enterprise",
			description: "For large organizations",
			price: { monthly: "Custom", annual: "Custom" },
			inheritFrom: "pro",
			features: [
				{ label: "Dedicated account manager" },
				{ label: "SLA guarantee" },
				{ label: "On-premise deployment" },
				{ label: "Custom contracts" },
			],
			ctaLabel: "Contact Sales",
			ctaOnClick: (tier, period) => alert(`Contact sales for ${tier.name} (${period})`),
			ctaVariant: "outline",
		},
	];

	// --- 2-tier minimal ---
	const minimalTiers: PricingTier[] = [
		{
			id: "starter",
			name: "Starter",
			description: "Everything you need to get going",
			price: { monthly: 9 },
			features: [
				{ label: "10 projects" },
				{ label: "5GB storage" },
				{ label: "Email support" },
			],
			ctaLabel: "Choose Starter",
			ctaHref: "#starter",
			ctaVariant: "outline",
		},
		{
			id: "business",
			name: "Business",
			description: "Scale without limits",
			price: { monthly: 49 },
			highlighted: true,
			highlightedBadge: "Best Value",
			inheritFrom: "starter",
			features: [
				{ label: "Unlimited projects" },
				{ label: "100GB storage" },
				{ label: "Priority phone support" },
				{ label: "Team management" },
			],
			ctaLabel: "Choose Business",
			ctaHref: "#business",
		},
	];

	// --- With disabled tier ---
	const disabledTiers: PricingTier[] = [
		{
			id: "basic",
			name: "Basic",
			price: { monthly: 5, annual: 50 },
			features: [{ label: "Core features" }, { label: "1 user" }],
			ctaLabel: "Sign Up",
			ctaHref: "#basic",
			ctaVariant: "outline",
		},
		{
			id: "team",
			name: "Team",
			price: { monthly: 25, annual: 250 },
			highlighted: true,
			highlightedBadge: "Popular",
			inheritFrom: "basic",
			features: [{ label: "Up to 10 users" }, { label: "Admin dashboard" }],
			ctaLabel: "Sign Up",
			ctaHref: "#team",
		},
		{
			id: "legacy",
			name: "Legacy",
			price: { monthly: 99, annual: 990 },
			disabled: true,
			disabledLabel: "Sold Out",
			inheritFrom: "team",
			features: [{ label: "Unlimited users" }, { label: "Custom branding" }],
		},
	];

	// --- Custom currency ---
	const euroTiers: PricingTier[] = [
		{
			id: "lite",
			name: "Lite",
			price: { monthly: 9, annual: 89 },
			annualDiscountBadge: "2 months free",
			features: [{ label: "5 projects" }, { label: "Basic reports" }],
			ctaLabel: "Get Lite",
			ctaHref: "#lite",
			ctaVariant: "outline",
		},
		{
			id: "plus",
			name: "Plus",
			price: { monthly: 19, annual: 189 },
			annualDiscountBadge: "2 months free",
			highlighted: true,
			highlightedBadge: "Recommended",
			inheritFrom: "lite",
			features: [
				{ label: "Unlimited projects" },
				{ label: "Advanced reports" },
				{ label: "Integrations" },
			],
			ctaLabel: "Get Plus",
			ctaHref: "#plus",
		},
		{
			id: "max",
			name: "Max",
			price: { monthly: 39, annual: 389 },
			annualDiscountBadge: "2 months free",
			inheritFrom: "plus",
			features: [
				{ label: "White-label" },
				{ label: "Dedicated support" },
				{ label: "Custom SLA" },
			],
			ctaLabel: "Get Max",
			ctaHref: "#max",
			ctaVariant: "outline",
		},
	];
</script>

<div class="space-y-16 py-8">
	<!-- Basic 3-tier -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Basic 3-Tier</h2>
		<p class="text-sm text-neutral-500 mb-6">
			Classic Free / Pro / Enterprise layout with billing toggle, feature inheritance,
			highlighted tier, and discount badge.
		</p>
		<PricingTable tiers={basicTiers} bind:billingPeriod />
		<p class="text-xs text-neutral-400 mt-4 text-center">
			Current billing period: <strong>{billingPeriod}</strong>
		</p>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- 2-tier minimal (no toggle) -->
	<section>
		<h2 class="text-xl font-semibold mb-2">2-Tier (Monthly Only)</h2>
		<p class="text-sm text-neutral-500 mb-6">
			When tiers only have one pricing period, the billing toggle is automatically hidden.
		</p>
		<PricingTable tiers={minimalTiers} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- With disabled tier -->
	<section>
		<h2 class="text-xl font-semibold mb-2">With Disabled Tier</h2>
		<p class="text-sm text-neutral-500 mb-6">
			The "Legacy" tier is sold out &mdash; disabled with reduced opacity and a custom label
			replacing the CTA.
		</p>
		<PricingTable tiers={disabledTiers} />
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Euro currency -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom Currency (EUR)</h2>
		<p class="text-sm text-neutral-500 mb-6">
			Table-level currency override. Annual billing selected by default.
		</p>
		<PricingTable
			tiers={euroTiers}
			currency={"EUR "}
			periodLabel={{ monthly: "/month", annual: "/year" }}
			billingPeriod="annual"
		/>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- With header children -->
	<section>
		<h2 class="text-xl font-semibold mb-2">With Header Content</h2>
		<p class="text-sm text-neutral-500 mb-6">
			Using the <code>children</code> snippet to add a headline above the tiers.
		</p>
		<PricingTable tiers={basicTiers}>
			<div class="text-center mb-2">
				<h3 class="text-2xl font-bold">Choose Your Plan</h3>
				<p class="text-neutral-500 mt-1">Start free, upgrade when you're ready.</p>
			</div>
		</PricingTable>
	</section>

	<hr class="border-neutral-200 dark:border-neutral-700" />

	<!-- Custom CSS variables -->
	<section>
		<h2 class="text-xl font-semibold mb-2">Custom CSS Variables</h2>
		<p class="text-sm text-neutral-500 mb-6">
			Flat, borderless, wide-gap layout via CSS custom properties.
		</p>
		<PricingTable
			tiers={basicTiers}
			style="
				--stuic-pricing-table-tiers-gap: 2.5rem;
				--stuic-pricing-table-tier-shadow: none;
				--stuic-pricing-table-tier-border-color: transparent;
				--stuic-pricing-table-tier-bg: var(--stuic-color-muted);
				--stuic-pricing-table-tier-radius: 1.5rem;
				--stuic-pricing-table-tier-padding: 2rem;
				--stuic-pricing-table-tier-shadow-highlighted: none;
				--stuic-pricing-table-tier-border-color-highlighted: transparent;
			"
		/>
	</section>
</div>
