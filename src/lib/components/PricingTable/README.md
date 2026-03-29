# PricingTable

A data-driven pricing tiers component for displaying plan comparisons with feature lists, billing period toggle, and call-to-action buttons. Supports tier inheritance ("Everything in Free, plus..."), highlighted/recommended tiers, and disabled states.

## Usage

```svelte
<script>
	import { PricingTable, type PricingTier } from "@marianmeres/stuic";

	const tiers: PricingTier[] = [
		{
			id: "free",
			name: "Free",
			description: "For individuals getting started",
			price: { monthly: 0, annual: 0 },
			features: [
				{ label: "Up to 3 projects" },
				{ label: "Basic analytics" },
				{ label: "Community support" },
			],
			ctaLabel: "Get Started",
			ctaHref: "/signup?plan=free",
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
			],
			ctaLabel: "Start Free Trial",
			ctaHref: "/signup?plan=pro",
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
			],
			ctaLabel: "Contact Sales",
			ctaOnClick: (tier, period) => console.log("Contact", tier.id, period),
			ctaVariant: "outline",
		},
	];
</script>

<PricingTable {tiers} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tiers` | `PricingTier[]` | **required** | Array of pricing tier definitions |
| `billingPeriod` | `BillingPeriod` | `"monthly"` | Currently active billing period (bindable) |
| `showBillingToggle` | `boolean` | `true` | Show the monthly/annual toggle |
| `monthlyLabel` | `string` | `"Monthly"` | Label for monthly option in toggle |
| `annualLabel` | `string` | `"Annual"` | Label for annual option in toggle |
| `currency` | `string` | `"$"` | Currency symbol applied to all tiers (overridable per-tier) |
| `periodLabel` | `{ monthly?: string; annual?: string }` | `{ monthly: "/mo", annual: "/yr" }` | Default period labels |
| `renderToggle` | `Snippet` | - | Override the billing toggle area |
| `renderTier` | `Snippet` | - | Override each tier card entirely |
| `renderCta` | `Snippet` | - | Override the CTA button area per tier |
| `renderFeatures` | `Snippet` | - | Override the feature list area per tier |
| `renderFeatureIcon` | `Snippet` | - | Override feature icons |
| `children` | `Snippet` | - | Header area above tiers |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `class` | `string` | - | Additional CSS classes for root |
| `classTiers` | `string` | - | Additional CSS classes for tiers grid |
| `classTier` | `string` | - | Additional CSS classes for each tier card |
| `classToggle` | `string` | - | Additional CSS classes for the billing toggle ButtonGroupRadio |
| `styleToggle` | `string` | - | Additional inline styles for the billing toggle ButtonGroupRadio |
| `el` | `HTMLElement` | - | Bindable element reference |
| `style` | `string` | - | Inline style (useful for CSS variable overrides) |

## PricingTier

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | **required** | Unique identifier |
| `name` | `THC` | **required** | Tier display name |
| `description` | `THC` | - | Short description or tagline |
| `price` | `{ monthly?: number \| string; annual?: number \| string }` | **required** | Price per billing period. Strings like `"Free"` or `"Custom"` render as-is. |
| `currency` | `string` | - | Override table-level currency for this tier |
| `periodLabel` | `{ monthly?: string; annual?: string }` | - | Override period labels for this tier |
| `annualDiscountBadge` | `THC` | - | Badge text shown when annual is selected (e.g. "Save 20%") |
| `features` | `PricingFeature[]` | - | Feature list for this tier |
| `inheritFrom` | `string` | - | Tier id to inherit from ("Everything in X, plus...") |
| `inheritLabel` | `THC` | - | Custom inheritance text |
| `ctaLabel` | `THC` | - | CTA button label |
| `ctaOnClick` | `(tier, period) => void` | - | CTA click handler |
| `ctaHref` | `string` | - | CTA as anchor link |
| `ctaIntent` | `IntentColorKey` | `"primary"` (highlighted) | CTA color intent |
| `ctaVariant` | `ButtonVariant` | `"solid"` (highlighted) / `"outline"` | CTA visual variant |
| `highlighted` | `boolean` | `false` | Mark as recommended/popular |
| `highlightedBadge` | `THC` | - | Badge text (e.g. "Most Popular") |
| `disabled` | `boolean` | `false` | Disabled/sold-out state |
| `disabledLabel` | `THC` | - | Text shown instead of CTA when disabled |

## PricingFeature

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `THC` | **required** | Feature label |
| `icon` | `boolean \| THC` | `true` | `true` = checkmark, `false` = dash, or custom THC |

## CSS Variables

### Layout

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-gap` | `2rem` | Gap between toggle and tiers |
| `--stuic-pricing-table-tiers-gap` | `1.5rem` | Gap between tier cards |
| `--stuic-pricing-table-tier-min-width` | `280px` | Minimum tier card width (controls grid breakpoints) |
| `--stuic-pricing-table-tier-padding` | `1.5rem` | Tier card padding |
| `--stuic-pricing-table-tier-gap` | `1.5rem` | Gap between sections within a tier |

### Tier Card

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-tier-bg` | card/background | Tier background |
| `--stuic-pricing-table-tier-border-color` | border | Tier border color |
| `--stuic-pricing-table-tier-border-width` | border-width | Tier border width |
| `--stuic-pricing-table-tier-radius` | radius-container | Tier border radius |
| `--stuic-pricing-table-tier-shadow` | shadow | Tier box shadow |

### Highlighted Tier

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-tier-border-color-highlighted` | primary | Highlighted border color |
| `--stuic-pricing-table-tier-border-width-highlighted` | `2px` | Highlighted border width |
| `--stuic-pricing-table-tier-shadow-highlighted` | shadow-hover | Highlighted shadow |
| `--stuic-pricing-table-tier-scale-highlighted` | `1.02` | Desktop scale transform |

### Badge

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-badge-bg` | primary | Badge background |
| `--stuic-pricing-table-badge-color` | primary-foreground | Badge text color |
| `--stuic-pricing-table-badge-font-size` | text-xs | Badge font size |
| `--stuic-pricing-table-badge-padding` | `0.25rem 0.75rem` | Badge padding |

### Toggle

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-toggle-bg` | muted | Toggle track background |
| `--stuic-pricing-table-toggle-bg-active` | background | Active option background |
| `--stuic-pricing-table-toggle-color` | muted-foreground | Option text color |
| `--stuic-pricing-table-toggle-color-active` | foreground | Active option text color |

### Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-pricing-table-tier-name-font-size` | text-lg | Tier name size |
| `--stuic-pricing-table-tier-description-font-size` | text-sm | Description size |
| `--stuic-pricing-table-price-font-size` | text-4xl | Price size |
| `--stuic-pricing-table-price-period-font-size` | text-sm | Period label size |
