# Checkout

A **kit of composable checkout components** — not a monolithic wizard. STUIC provides 15 self-contained pieces (step containers, forms, reviews, progress indicator, complete screen) and the consumer owns the composition: which steps run, in what order, and how state flows between them.

There is deliberately **no top-level `<Checkout>`** orchestrator. If you want a linear wizard, wire it together in a single page component. If you want a single-page checkout or a novel flow, use the same parts differently.

## Components

### Step containers (one per route/screen)

| Component | Purpose |
| --- | --- |
| `CheckoutReviewStep` | Guest/login + cart review (entry point) |
| `CheckoutShippingStep` | Address + delivery option selection |
| `CheckoutConfirmStep` | Final order review + place-order action |
| `CheckoutCompleteStep` | Post-purchase confirmation screen |

Each step container renders a `CheckoutProgress` indicator (unless `hideProgress`), its own heading, and exposes `onBack` / `onContinue` callbacks. The consumer maps those callbacks to route navigation or state changes.

### Building blocks (composed inside steps, or used standalone)

| Component | Purpose |
| --- | --- |
| `CheckoutProgress` | Multi-step progress indicator (accessible stepper) |
| `CheckoutCartReview` | Editable line-item list |
| `CheckoutOrderSummary` | Totals (subtotal/tax/shipping/discount/total) |
| `CheckoutOrderReview` | Read-only order dump (items + addresses + delivery) |
| `CheckoutOrderConfirmation` | Completed-order summary with order number & next steps |
| `CheckoutGuestOrLoginForm` | Tabbed guest / login |
| `CheckoutGuestForm` | Guest-checkout fields |
| `CheckoutLoginForm` | Login (adapts the generic `LoginForm` to checkout i18n) |
| `CheckoutAddressForm` | Structured address input |
| `CheckoutDeliveryOptions` | Delivery-method selector |
| `CheckoutSectionHeader` | Consistent section heading |

## State ownership

The consumer owns the entire order shape — typically `CheckoutOrderData` from the exported types:

```ts
import type {
    CheckoutOrderData,
    CheckoutAddressData,
    CheckoutCustomerFormData,
    CheckoutLoginFormData,
    CheckoutDeliveryOption,
} from "@marianmeres/stuic";
```

**Field → owner table:**

| Field | Owned by | Passed to |
| --- | --- | --- |
| `currentStep` (or equivalent) | Route/page state | `CheckoutProgress`, step visibility logic |
| `CheckoutCustomerFormData` | Page `$state` | `CheckoutGuestForm` (two-way bind) |
| `CheckoutLoginFormData` | Page `$state` | `CheckoutLoginForm` (two-way bind) |
| `shippingAddress`, `billingAddress` | Page `$state` | `CheckoutShippingStep` (two-way bind) — re-used by `CheckoutConfirmStep` for display |
| `selectedDeliveryId` | Page `$state` | `CheckoutShippingStep` (two-way bind) |
| `CheckoutOrderData` (assembled) | Page `$state` / server | `CheckoutOrderReview`, `CheckoutConfirmStep`, `CheckoutCompleteStep` (read-only) |
| Per-field validation errors | Page `$state` (derived from server response) | Forms via `errors` prop; merged with internal errors |

Each form exposes a bindable value plus an `errors` prop for server-driven validation messages. Internal client-side validation (via `validateCustomerForm` / `validateAddress` / `validateLoginForm`) fires on submit and populates internal error state, which is merged with the `errors` prop for display.

## Validation flow

Client-side validation helpers live in `@marianmeres/stuic`:

```ts
import {
    validateCustomerForm,
    validateAddress,
    validateLoginForm,
    validateEmail,
} from "@marianmeres/stuic";
```

Each returns `CheckoutValidationError[]`:

```ts
interface CheckoutValidationError {
    field: string; // e.g. "email" or "shipping.street"
    message: string;
}
```

### Pattern for a step

```svelte
<script lang="ts">
    import {
        CheckoutShippingStep,
        CheckoutAddressForm,
        validateAddress,
        type CheckoutAddressData,
        type CheckoutValidationError,
    } from "@marianmeres/stuic";

    let shippingAddress = $state<CheckoutAddressData>(/* ... */);
    let errors = $state<CheckoutValidationError[]>([]);

    async function onContinue() {
        // 1) Client-side gate
        const clientErrors = validateAddress(shippingAddress, "shipping", t);
        if (clientErrors.length) {
            errors = clientErrors;
            return;
        }
        // 2) Server round-trip; merge any server errors
        const res = await submitShipping(shippingAddress);
        if (!res.ok) {
            errors = res.errors;
            return;
        }
        // 3) Advance
        goto("/checkout/confirm");
    }
</script>

<CheckoutShippingStep bind:shippingAddress {errors} {onContinue} onBack={() => history.back()} />
```

The step component **does not auto-advance**. It calls `onContinue` when the user clicks "Continue"; the consumer decides whether to actually advance, retry, or show errors.

## Price arithmetic

**All monetary values are integers in the smallest currency unit (cents).** This applies to `CheckoutOrderLineItem.price`, `CheckoutDeliveryOption.price`, `CheckoutDeliveryOption.free_above`, and every field in `CheckoutOrderTotals`.

The built-in `defaultFormatPrice(cents)` returns `"12.99"`. Replace it via each component's `formatPrice` prop for locale-aware formatting:

```ts
const formatPrice = (cents: number) =>
    new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" })
        .format(cents / 100);
```

## i18n

Every component accepts an optional `t?: TranslateFn` prop. Sensible English defaults are provided — see `_internal/checkout-i18n-defaults.ts` for the full key set (~140 keys, all prefixed `checkout.*`). Override by passing your own `t` function on each component, or at the step-container level (step containers forward `t` to their children).

`CheckoutLoginForm` internally bridges `checkout.login.*` keys to the generic `LoginForm` component's `login_form.*` keys, so you only need one consistent prefix.

## Accessibility

- `CheckoutProgress` renders past/current/future steps with `aria-current="step"` on the active step.
- Form submissions do **not** automatically move focus to the first error field. Consumers wanting this behavior should do it in their `onContinue` handler after receiving validation errors.
- `CheckoutGuestOrLoginForm` uses the underlying `TabbedMenu` semantics; focus does not auto-move to the tab-panel heading on tab switch.

## Address equality (advanced)

```ts
import { addressesEqual } from "@marianmeres/stuic";

addressesEqual(order.shipping_address, order.billing_address);
```

Returns `true` when either address is missing or when every `CheckoutAddressData` field matches (nullish values treated as empty strings). Used internally by `CheckoutOrderReview` to decide whether to show a separate billing block.

## Empty-state factories

```ts
import {
    createEmptyAddress,
    createEmptyCustomerFormData,
    createEmptyLoginFormData,
} from "@marianmeres/stuic";
```

Use these to initialize `$state` with the correct shape.

## Conventions

Every component in this family:

- Exposes `unstyled?: boolean`, `class?: string`, `el?: HTMLElement` (bindable).
- Accepts `t?: TranslateFn` for i18n.
- Uses cents-integer price values.
- Uses `stuic-checkout-*` CSS classes; tokens live in the individual `_*.css` files in this directory.

## Limitations

- **No top-level orchestrator.** By design; consumers wire up step navigation.
- **No generic `<T>` for line items.** `CheckoutOrderLineItem` is a fixed shape; use `itemsSection` / `cell` snippets for custom rendering.
- **No automatic focus-on-error management.** Left to the consumer.
- **No example route in `/src/routes`** yet — see the step-pattern snippet above for the shape consumers generally follow.
