# Components Domain

## Overview

45 Svelte 5 component directories with consistent API patterns. All use runes-based reactivity.

## Component Categories

### Layout

| Component                | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| AppShell, AppShellSimple | Page layouts with header/sidebar/content           |
| Modal, ModalDialog       | Overlay containers                                 |
| Drawer                   | Side panel overlay                                 |
| Backdrop                 | Semi-transparent overlay with escape/focus trap    |
| Collapsible              | Expandable sections                                |
| Accordion                | Exclusive/multi-open expandable sections           |
| SlidingPanels            | Panel transitions                                  |
| TabbedMenu               | Tab navigation                                     |
| Nav                      | Navigation wrapper                                 |
| WithSidePanel            | Two-column layout with collapsible/resizable panel |

### Interactive

| Component            | Purpose                                     |
| -------------------- | ------------------------------------------- |
| Button               | Actions with intent/variant/size            |
| ButtonGroupRadio     | Toggle group (single selection)             |
| Switch               | Boolean toggle                              |
| TwCheck              | Styled checkbox/radio                       |
| DropdownMenu         | Popover menu                                |
| CommandMenu          | Command palette (keyboard-driven)           |
| TypeaheadInput       | Autocomplete input                          |
| ColorScheme          | Dark/light mode management with persistence |
| HoverExpandableWidth | Width-expanding container on hover          |

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

| Component                             | Purpose                                           |
| ------------------------------------- | ------------------------------------------------- |
| Input (FieldInput, FieldSelect, etc.) | Form fields                                       |
| FieldObject                           | Dual-mode JSON object editor (pretty-print/raw)   |
| Fieldset                              | Field grouping with legend                        |
| FieldKeyValues                        | Key-value pair editor                             |
| FieldAssets                           | File/asset management                             |
| LoginForm, LoginFormModal             | Standalone login form with optional modal variant |

### Display

| Component       | Purpose                                                             |
| --------------- | ------------------------------------------------------------------- |
| Avatar          | User avatars with fallback                                          |
| KbdShortcut     | Keyboard shortcut hints                                             |
| Carousel        | Image/content slider with snap, keyboard nav, wheel scroll, arrows  |
| ListItemButton  | List item with actions                                              |
| AnimatedElipsis | Loading dots animation                                              |
| IconSwap        | N-state visibility swap with opacity transitions (e.g. hamburger/X) |
| DataTable       | Responsive data table with paging, selection, batch actions         |
| ThemePreview    | Theme color swatches                                                |
| AssetsPreview       | Modal-based asset/file preview with zoom, pan, swipe, area clicking |
| AssetsPreviewInline | Always-visible (non-modal) asset preview with same feature set      |
| Book                | Interactive book/flipbook with 3D page-flip, zoom, pan, areas      |
| BookResponsive      | Responsive Book wrapper: auto single/dual-page + inline mode       |
| Circle          | SVG circular progress indicator                                     |
| H               | Semantic heading (h1-h6) with separate visual/semantic levels       |
| Separator       | Horizontal/vertical separator line                                  |
| Thc             | Flexible renderer for text, HTML, components, or snippets           |
| X               | Styled close/multiply SVG icon                                      |

### E-commerce

| Component | Purpose                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| Cart      | Shopping cart with quantity controls, pricing, summary; default/compact/summary variants |
| Checkout  | Multi-step checkout flow (14 exported sub-components: atomic + composite steps)          |

---

## LoginForm

Standalone login form with optional modal variant. Supports social logins, forgot password, remember me, client+server validation, i18n, and notifications integration.

### Exports

| Export                     | Kind      | Description                                   |
| -------------------------- | --------- | --------------------------------------------- |
| `LoginForm`                | component | Main login form                               |
| `LoginFormModal`           | component | Modal-wrapped login form with trigger support |
| `LoginFormProps`           | type      | Props for LoginForm                           |
| `LoginFormModalProps`      | type      | Props for LoginFormModal                      |
| `LoginFormData`            | type      | `{ email, password, rememberMe }`             |
| `LoginFormValidationError` | type      | `{ field, message }`                          |

### Key Props (LoginForm)

| Prop               | Type                         | Default  | Description                                |
| ------------------ | ---------------------------- | -------- | ------------------------------------------ |
| `formData`         | `LoginFormData`              | empty    | Bindable form data                         |
| `onSubmit`         | `(data) => void`             | required | Submit callback                            |
| `isSubmitting`     | `boolean`                    | `false`  | Disables CTA                               |
| `errors`           | `LoginFormValidationError[]` | `[]`     | Field-specific server errors               |
| `error`            | `string`                     | —        | General error (renders alert above form)   |
| `onForgotPassword` | `() => void`                 | —        | Forgot password link (hidden if undefined) |
| `showRememberMe`   | `boolean`                    | `true`   | Show remember me checkbox                  |
| `submitButton`     | `Snippet`                    | —        | Custom CTA section                         |
| `socialLogins`     | `Snippet`                    | —        | Social/OAuth buttons below form            |
| `footer`           | `Snippet`                    | —        | Content below form (e.g., sign-up links)   |
| `notifications`    | `NotificationsStack`         | —        | Route errors to notification system        |
| `compact`          | `boolean`                    | `false`  | Compact layout (remember+submit in 1 row)  |
| `t`                | `TranslateFn`                | built-in | Translation function                       |

### Key Props (LoginFormModal)

Inherits all LoginForm props, plus:

| Prop         | Type                  | Default    | Description               |
| ------------ | --------------------- | ---------- | ------------------------- |
| `title`      | `string`              | `"Log In"` | Modal title               |
| `visible`    | `boolean`             | `false`    | Bindable modal visibility |
| `trigger`    | `Snippet<[{ open }]>` | —          | Optional trigger element  |
| `classModal` | `string`              | —          | CSS class for Modal box   |
| `noXClose`   | `boolean`             | `false`    | Hide close button         |

### CSS Tokens

Prefix: `--stuic-login-form-*`

`gap`, `gap-row`, `forgot-margin-y`, `forgot-margin-x`, `social-margin-top`, `social-gap`, `social-divider-color`, `social-divider-font-size`, `social-divider-margin-bottom`

### i18n

16 translation keys with `login_form.*` prefix covering labels, placeholders, validation messages, and social divider text.

---

## FieldObject

Dual-mode JSON object editor with pretty-print and raw edit modes.

### Key Props

| Prop       | Type                         | Default  | Description                    |
| ---------- | ---------------------------- | -------- | ------------------------------ |
| `value`    | `string`                     | —        | Bindable JSON string           |
| `name`     | `string`                     | required | Input name for form submission |
| `label`    | `SnippetWithId \| THC`       | —        | Label content                  |
| `required` | `boolean`                    | `false`  | Required indicator             |
| `disabled` | `boolean`                    | `false`  | Disable editing                |
| `validate` | `boolean \| ValidateOptions` | —        | Enable validation              |

Features: pretty-print display with recursive depth, edit mode with auto-grow textarea, JSON syntax validation on apply, hidden input for form submission, responsive nested rendering.

Exported from Input: `FieldObject`, `FieldObjectProps`.

---

## Checkout Components

14 exported sub-components organized as atomic building blocks + composite step pages.
CSS is split into modular partials (`_*.css`) imported by `index.css`.

### Atomic Components

| Component                 | Purpose                                                         | Key Props                                                       |
| ------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| CheckoutProgress          | Step indicator with navigation                                  | `currentStep`, `steps`, `onNavigate`, `separator`               |
| CheckoutOrderSummary      | Price totals display (subtotal, shipping, tax, discount, total) | `totals`, `formatPrice`, `row`, `extraRows`                     |
| CheckoutCartReview        | Readonly cart display with summary                              | `items`, `onEditCart`, `thumbnail`, `title`                     |
| CheckoutGuestForm         | Guest checkout form (email, name, phone, B2B fields)            | `formData`, `onSubmit`, `showB2bFields`, `fields`               |
| CheckoutLoginForm         | Login form (wraps standalone LoginForm with checkout i18n)      | `formData`, `onSubmit`, `onForgotPassword`, `footer`            |
| CheckoutGuestOrLoginForm  | Composite guest/login with tabbed/stacked/single modes + modal  | `guestForm`, `loginForm`, `formMode`, `activeTab`, `loginModal` |
| CheckoutAddressForm       | Address input fieldset                                          | `address`, `label`, `requiredFields`, `countryField`            |
| CheckoutDeliveryOptions   | Delivery method radio selection with free shipping logic        | `options`, `selectedId`, `onSelect`, `subtotal`                 |
| CheckoutOrderReview       | Full order review with edit callbacks per section               | `order`, `onEditItems`, `onEditShippingAddress`                 |
| CheckoutOrderConfirmation | Order success screen with details                               | `order`, `orderId`, `onContinueShopping`                        |

**Internal (not exported):** `CheckoutSectionHeader` — reusable section header with left/right layout.

### Composite Step Components

All step components support `hideProgress?: boolean` to hide the built-in progress indicator (e.g. when rendered externally).

| Component            | Purpose                                           | Combines                                                   |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| CheckoutReviewStep   | Cart review + guest/login forms (2-column layout) | CartReview + GuestOrLoginForm (tabbed/stacked/single mode) |
| CheckoutShippingStep | Shipping + billing addresses + delivery selection | AddressForm (×2) + DeliveryOptions + OrderSummary sidebar  |
| CheckoutConfirmStep  | Order review + place order CTA                    | OrderReview + OrderSummary sidebar + validation errors     |
| CheckoutCompleteStep | Order confirmation with loading/error states      | Progress + OrderConfirmation (or error/loading fallback)   |

### CheckoutGuestOrLoginForm

Composite component combining guest and login forms with multiple display modes:

| FormMode       | Behavior                                              |
| -------------- | ----------------------------------------------------- |
| `"tabbed"`     | Pill-style tab switcher between guest/login (default) |
| `"stacked"`    | Both forms vertically stacked with "or" divider       |
| `"guest-only"` | Only guest form                                       |
| `"login-only"` | Only login form                                       |

Key props: `guestForm`, `loginForm` (pass-through config objects), `activeTab` (bindable: `"guest"` | `"login"`), `formMode`, `heading`, `hLevel`, `loginModal`.

`loginModal` prop: When provided, clicking the login tab opens a `LoginFormModal` instead of showing an inline login form. Accepts modal config: `title`, `classModal`, `classInner`, `classForm`, `noXClose`, `onClose`, `showRememberMe`.

Exported type: `CheckoutFormMode` (`"guest-only" | "login-only" | "tabbed" | "stacked"`).

### Checkout Architecture

- **i18n**: Full translation support via `t?: TranslateFn` on every component; 100+ default English keys
- **Validation**: Built-in validators (`validateEmail`, `validateAddress`, `validateCustomerForm`, `validateLoginForm`)
- **Factory helpers**: `createEmptyAddress()`, `createEmptyCustomerFormData()`, `createEmptyLoginFormData()`
- **Price formatting**: `defaultFormatPrice(cents)` — all prices in smallest currency unit (cents)
- **CSS tokens**: `--stuic-checkout-*` prefix; modular CSS partials (`_shared.css`, `_*.css`) in `Checkout/`
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

| File                          | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| src/lib/components/Button/    | Reference implementation                              |
| src/lib/components/Modal/     | Complex component example                             |
| src/lib/components/Input/     | Form field patterns (incl. FieldObject)               |
| src/lib/components/LoginForm/ | Standalone login form + modal variant                 |
| src/lib/components/Checkout/  | E-commerce checkout flow (14 exported sub-components) |
| src/lib/index.ts              | All component exports                                 |
