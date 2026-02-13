# Components Domain

## Overview

39 Svelte 5 components with consistent API patterns. All use runes-based reactivity.

## Component Categories

### Layout

| Component                | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| AppShell, AppShellSimple | Page layouts with header/sidebar/content |
| Modal, ModalDialog       | Overlay containers                       |
| Drawer                   | Side panel overlay                       |
| Collapsible              | Expandable sections                      |
| SlidingPanels            | Panel transitions                        |
| TabbedMenu               | Tab navigation                           |
| Nav                      | Navigation wrapper                       |

### Interactive

| Component        | Purpose                           |
| ---------------- | --------------------------------- |
| Button           | Actions with intent/variant/size  |
| ButtonGroupRadio | Toggle group (single selection)   |
| Switch           | Boolean toggle                    |
| TwCheck          | Styled checkbox/radio             |
| DropdownMenu     | Popover menu                      |
| CommandMenu      | Command palette (keyboard-driven) |
| TypeaheadInput   | Autocomplete input                |

### Feedback

| Component          | Purpose                               |
| ------------------ | ------------------------------------- |
| Notifications      | Toast notification system             |
| AlertConfirmPrompt | Dialog factory (alert/confirm/prompt) |
| DismissibleMessage | Closeable message banner              |
| Progress           | Progress bar                          |
| Spinner            | Loading indicator                     |
| Skeleton           | Loading placeholder                   |

### Form

| Component                             | Purpose                    |
| ------------------------------------- | -------------------------- |
| Input (FieldInput, FieldSelect, etc.) | Form fields                |
| Fieldset                              | Field grouping with legend |
| FieldKeyValues                        | Key-value pair editor      |
| FieldAssets                           | File/asset management      |

### Display

| Component       | Purpose                                                             |
| --------------- | ------------------------------------------------------------------- |
| Avatar          | User avatars with fallback                                          |
| KbdShortcut     | Keyboard shortcut hints                                             |
| Carousel        | Image/content slider                                                |
| ListItemButton  | List item with actions                                              |
| AnimatedElipsis | Loading dots animation                                              |
| IconSwap        | N-state visibility swap with opacity transitions (e.g. hamburger/X) |
| DataTable       | Responsive data table with paging, selection, batch actions         |
| ThemePreview    | Theme color swatches                                                |

### E-commerce

| Component | Purpose                                                                                   |
| --------- | ----------------------------------------------------------------------------------------- |
| Cart      | Shopping cart with quantity controls, pricing, summary; default/compact/readonly variants |
| Checkout  | Multi-step checkout flow (13 sub-components: atomic + composite steps)                    |

---

## Checkout Components

13 sub-components organized as atomic building blocks + composite step pages.

### Atomic Components

| Component                 | Purpose                                                         | Key Props                                            |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| CheckoutProgress          | Step indicator with navigation                                  | `currentStep`, `steps`, `onNavigate`, `separator`    |
| CheckoutOrderSummary      | Price totals display (subtotal, shipping, tax, discount, total) | `totals`, `formatPrice`, `row`, `extraRows`          |
| CheckoutCartReview        | Readonly cart display with summary                              | `items`, `onEditCart`, `thumbnail`, `title`          |
| CheckoutGuestForm         | Guest checkout form (email, name, phone, B2B fields)            | `formData`, `onSubmit`, `showB2bFields`, `fields`    |
| CheckoutLoginForm         | Login form (email + password)                                   | `formData`, `onSubmit`, `onForgotPassword`, `footer` |
| CheckoutAddressForm       | Address input fieldset                                          | `address`, `label`, `requiredFields`, `countryField` |
| CheckoutDeliveryOptions   | Delivery method radio selection with free shipping logic        | `options`, `selectedId`, `onSelect`, `subtotal`      |
| CheckoutOrderReview       | Full order review with edit callbacks per section               | `order`, `onEditItems`, `onEditShippingAddress`      |
| CheckoutOrderConfirmation | Order success screen with details                               | `order`, `orderId`, `onContinueShopping`             |

### Composite Step Components

| Component            | Purpose                                           | Combines                                                      |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| CheckoutReviewStep   | Cart review + guest/login forms (2-column layout) | CartReview + GuestForm/LoginForm (tabbed/stacked/single mode) |
| CheckoutShippingStep | Shipping + billing addresses + delivery selection | AddressForm (×2) + DeliveryOptions + OrderSummary sidebar     |
| CheckoutConfirmStep  | Order review + place order CTA                    | OrderReview + OrderSummary sidebar + validation errors        |
| CheckoutCompleteStep | Order confirmation with loading/error states      | Progress + OrderConfirmation (or error/loading fallback)      |

### Checkout Architecture

- **i18n**: Full translation support via `t?: TranslateFn` on every component; 100+ default English keys
- **Validation**: Built-in validators (`validateEmail`, `validateAddress`, `validateCustomerForm`, `validateLoginForm`)
- **Factory helpers**: `createEmptyAddress()`, `createEmptyCustomerFormData()`, `createEmptyLoginFormData()`
- **Price formatting**: `defaultFormatPrice(cents)` — all prices in smallest currency unit (cents)
- **CSS tokens**: `--stuic-checkout-*` prefix; extensive design tokens in `Checkout/index.css`
- **Data types**: `CheckoutOrderData`, `CheckoutAddressData`, `CheckoutDeliveryOption`, `CheckoutOrderTotals`, etc.
- **Snippet overrides**: Every component offers snippet props to replace default sections

---

## Props Pattern

All components share universal props:

```ts
interface CommonProps {
	unstyled?: boolean; // Skip all default styling
	class?: string; // Additional CSS classes (merged via twMerge)
	el?: HTMLElement; // Bindable element reference
}
```

### Full Props Example

```svelte
<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export interface Props extends Omit<HTMLButtonAttributes, "children"> {
		children?: Snippet;
		intent?: "primary" | "accent" | "destructive" | "warning" | "success";
		variant?: "solid" | "outline" | "ghost" | "soft" | "link";
		unstyled?: boolean;
		class?: string;
		el?: HTMLButtonElement;
	}
</script>

<script lang="ts">
	let {
		children,
		intent = "primary",
		variant = "solid",
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();
</script>
```

---

## Snippet Pattern

Content passed via Svelte 5 snippets (not slots):

```svelte
<Modal>
	{#snippet header()}
		<h2>Modal Title</h2>
	{/snippet}

	<p>Modal content goes here.</p>

	{#snippet footer()}
		<Button>Close</Button>
	{/snippet}
</Modal>
```

### Snippet with Parameters

```svelte
<Carousel items={images}>
	{#snippet renderItem({ item, index, active })}
		<img src={item.src} class:active />
	{/snippet}
</Carousel>
```

---

## Intent + Variant System

**Intent** defines semantic meaning (color palette):

- `primary` - Main actions
- `accent` - Secondary emphasis
- `destructive` - Dangerous actions
- `warning` - Caution states
- `success` - Positive states

**Variant** defines visual treatment:

- `solid` - Filled background, contrasting text
- `outline` - Transparent bg, colored border/text
- `ghost` - Transparent bg, subtle hover
- `soft` - Muted tinted background
- `link` - Minimal, text decoration only

```svelte
<Button intent="destructive" variant="outline">Delete</Button>
<Button intent="success" variant="soft">Saved</Button>
```

---

## CSS Architecture

### Data Attributes (not classes)

Variants use data attributes for CSS targeting:

```svelte
<button
  class="stuic-button"
  data-intent={intent}
  data-variant={variant}
  data-size={size}
>
```

### Internal Variables Pattern

Components use private CSS vars (`--_*`) set by intent/variant:

```css
/* Intent sets color palette */
.stuic-button[data-intent="primary"] {
	--_color: var(--stuic-color-primary);
	--_fg: var(--stuic-color-primary-foreground);
}

/* Variant determines how colors apply */
.stuic-button[data-variant="solid"] {
	--_bg: var(--_color);
	--_text: var(--_fg);
}

/* Base styles use internal vars */
.stuic-button {
	background: var(--_bg);
	color: var(--_text);
}
```

---

## Key Files

| File                         | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| src/lib/components/Button/   | Reference implementation                     |
| src/lib/components/Modal/    | Complex component example                    |
| src/lib/components/Input/    | Form field patterns                          |
| src/lib/components/Checkout/ | E-commerce checkout flow (13 sub-components) |
| src/lib/index.ts             | All component exports                        |
