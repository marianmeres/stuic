# Checkout

A **kit of composable checkout components** — not a monolithic wizard. STUIC provides 15 self-contained pieces (step containers, forms, reviews, progress indicator, complete screen) and the consumer owns the composition: which steps run, in what order, and how state flows between them.

There is deliberately **no top-level `<Checkout>`** orchestrator. If you want a linear wizard, wire it together in a single page component. If you want a single-page checkout or a novel flow, use the same parts differently.

## Components

### Step containers (one per route/screen)

| Component              | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `CheckoutReviewStep`   | Guest/login + cart review (entry point) |
| `CheckoutShippingStep` | Address + delivery option selection     |
| `CheckoutConfirmStep`  | Final order review + place-order action |
| `CheckoutCompleteStep` | Post-purchase confirmation screen       |

Each step container renders a `CheckoutProgress` indicator (unless `hideProgress`), its own heading, and exposes `onBack` / `onContinue` callbacks. The consumer maps those callbacks to route navigation or state changes.

### Building blocks (composed inside steps, or used standalone)

| Component                   | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `CheckoutProgress`          | Multi-step progress indicator (accessible stepper)      |
| `CheckoutCartReview`        | Editable line-item list                                 |
| `CheckoutOrderSummary`      | Totals (subtotal/tax/shipping/discount/total)           |
| `CheckoutOrderReview`       | Read-only order dump (items + addresses + delivery)     |
| `CheckoutOrderConfirmation` | Completed-order summary with order number & next steps  |
| `CheckoutGuestOrLoginForm`  | Guest / login switcher (segmented pill)                 |
| `CheckoutGuestForm`         | Guest-checkout fields                                   |
| `CheckoutLoginForm`         | Login (adapts the generic `LoginForm` to checkout i18n) |
| `CheckoutAddressForm`       | Structured address input                                |
| `CheckoutDeliveryOptions`   | Delivery-method selector                                |
| `CheckoutSectionHeader`     | Consistent section heading                              |

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

| Field                               | Owned by                                     | Passed to                                                                            |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `currentStep` (or equivalent)       | Route/page state                             | `CheckoutProgress`, step visibility logic                                            |
| `CheckoutCustomerFormData`          | Page `$state`                                | `CheckoutGuestForm` (two-way bind)                                                   |
| `CheckoutLoginFormData`             | Page `$state`                                | `CheckoutLoginForm` (two-way bind)                                                   |
| `shippingAddress`, `billingAddress` | Page `$state`                                | `CheckoutShippingStep` (two-way bind) — re-used by `CheckoutConfirmStep` for display |
| `selectedDeliveryId`                | Page `$state`                                | `CheckoutShippingStep` (two-way bind)                                                |
| `CheckoutOrderData` (assembled)     | Page `$state` / server                       | `CheckoutOrderReview`, `CheckoutConfirmStep`, `CheckoutCompleteStep` (read-only)     |
| Per-field validation errors         | Page `$state` (derived from server response) | Forms via `errors` prop; merged with internal errors                                 |

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

<CheckoutShippingStep
	bind:shippingAddress
	{errors}
	{onContinue}
	onBack={() => history.back()}
/>
```

The step component **does not auto-advance**. It calls `onContinue` when the user clicks "Continue"; the consumer decides whether to actually advance, retry, or show errors.

## Country-aware state/region select (`subdivisions`)

By default `CheckoutAddressForm` renders `state_or_region` as free text. For
countries where downstream logic keys on an exact subdivision code (US
sales-tax tables, shipping zones), pass `subdivisions` — lists keyed by
UPPERCASE ISO alpha-2 country code. When the selected country has an entry,
the field swaps to a fixed select storing the canonical `code`; every other
country keeps the free-text input, verbatim. stuic ships **no** subdivision
data — pass exactly what your app needs:

```svelte
<CheckoutAddressForm
	bind:address
	subdivisions={{
		US: [
			{ code: "AL", name: "Alabama" },
			{ code: "AK", name: "Alaska" },
			// ... full USPS list
		],
	}}
/>
```

Behavior details:

- **Stored value is always the `code`** ("MI") — same wire shape as free text,
  no server contract change.
- **Prefill reconciliation:** entering select mode with a legacy value
  self-heals it — `"mi"` → `"MI"`, `"Michigan"` → `"MI"` (written back into
  the bound `address`). Unrecognized values are left untouched and render as
  unselected, surfaced by validation rather than destroyed. Applies only to
  the built-in select — the `stateField` snippet owns its value entirely.
- **Country switching never clears the field** — a US → CA → US round-trip
  restores "MI".
- **Required:** while the select is active the field is required by default
  (`subdivisionRequired`, also accepts a per-country predicate
  `(countryIso) => boolean`). Countries without a list keep the plain
  `requiredFields` behavior.
- `stateFieldProps` forwards extras to the internal `FieldSelect`; the
  `stateField` snippet replaces the field entirely (receives the active
  `options`, or `null` in free-text mode) — parity with
  `countryField`/`countryFieldProps`.
- i18n: the select's empty option uses
  `checkout.address.state_or_region_select_placeholder` (default `"Select…"`).
- Forward through composite steps via
  `CheckoutShippingStep.addressFormProps`.

Note: the `validateAddress()` utility has no access to the `subdivisions`
config, so it does not enforce subdivision-required — use the component's
imperative `validate()` (step containers already do).

## Price arithmetic

**All monetary values are integers in the smallest currency unit (cents).** This applies to `CheckoutOrderLineItem.price`, `CheckoutDeliveryOption.price`, `CheckoutDeliveryOption.free_above`, and every field in `CheckoutOrderTotals`.

The built-in `defaultFormatPrice(cents)` returns `"12.99"`. Replace it via each component's `formatPrice` prop for locale-aware formatting:

```ts
const formatPrice = (cents: number) =>
	new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(
		cents / 100
	);
```

## i18n

Every component accepts an optional `t?: TranslateFn` prop. Sensible English defaults are provided — see `_internal/checkout-i18n-defaults.ts` for the full key set (~140 keys, all prefixed `checkout.*`). Override by passing your own `t` function on each component, or at the step-container level (step containers forward `t` to their children).

`CheckoutLoginForm` internally bridges `checkout.login.*` keys to the generic `LoginForm` component's `login_form.*` keys, so you only need one consistent prefix.

When `CheckoutGuestOrLoginForm` is wired to `LoginOrRegisterFormModal` via the optional `loginOrRegisterModal` prop, the same bridging is applied to `register_form.*` (→ `checkout.register.*`), `email_verify_form.*` (→ `checkout.verify.*`), and `login_or_register_form.*` (→ `checkout.login_or_register.*`) — so the entire login + register + verify flow stays under the `checkout.*` prefix.

## Login + register + verify in checkout

By default `CheckoutGuestOrLoginForm` in tabbed mode renders an inline `<CheckoutLoginForm>` in the login tab. For apps with self-registration, pass `loginOrRegisterModal` to wire the login tab to a `LoginOrRegisterFormModal` instead — giving you login, register, and post-register OTP verification in a single modal:

```svelte
<script lang="ts">
	import {
		CheckoutGuestOrLoginForm,
		createEmptyCustomerFormData,
		createEmptyLoginFormData,
		type LoginOrRegisterFormMode,
		type LoginFormData,
		type RegisterFormData,
	} from "@marianmeres/stuic";

	let formData = $state(createEmptyCustomerFormData());
	let loginFormData = $state(createEmptyLoginFormData());

	let mode = $state<LoginOrRegisterFormMode>("login");
	let verifyEmail = $state("");
	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);

	const loginProps = $derived({ error: formError ?? undefined, showRememberMe: true });
	const registerProps = $derived({ error: formError ?? undefined });
	const verifyProps = $derived({
		error: formError ?? undefined,
		heading: false as const,
	});

	async function onLogin(d: LoginFormData) {
		// ... call API; on `requiresVerification`, flip:
		//     verifyEmail = d.email; mode = "verify";
	}
	async function onRegister(d: RegisterFormData) {
		// ... call API; on success, flip to verify:
		//     verifyEmail = d.email; mode = "verify";
	}
	async function onVerify(code: string) {
		// ... call API; on success, modal closes via consumer-managed state.
	}
	async function onResendCode() {
		/* ... */
	}
</script>

<CheckoutGuestOrLoginForm
	formMode="tabbed"
	guestForm={{ formData, onSubmit: handleStartCheckout, isSubmitting, errors: [] }}
	loginForm={{ formData: loginFormData, onSubmit: onLogin, isSubmitting }}
	loginOrRegisterModal={{
		mode,
		verifyEmail,
		onLogin,
		onRegister,
		onVerify,
		onResendCode,
		onForgotPassword: () => {
			/* ... */
		},
		onModeChange: (next) => {
			// mirror mode changes back into our local state and clear errors
			mode = next;
			formError = null;
		},
		isSubmitting,
		loginProps,
		registerProps,
		verifyProps,
		onClose: () => {
			formError = null;
			mode = "login";
		},
	}}
/>
```

**State sync.** `mode` and `verifyEmail` flow one-way from prop into the modal — programmatically flipping `mode = "verify"` (e.g., on a `requiresVerification` server response) updates the modal. To observe modal-driven changes (user clicks the "Sign up" tab, etc.), wire `onModeChange` and update your local state there.

**Precedence.** `loginOrRegisterModal` takes precedence over `loginModal`. If both are passed, only `loginOrRegisterModal` is wired up (and a dev-mode `console.warn` fires).

**i18n.** All `register_form.*` / `email_verify_form.*` / `login_or_register_form.*` keys are bridged to `checkout.register.*` / `checkout.verify.*` / `checkout.login_or_register.*` respectively, so a single `t` function with a unified `checkout.*` prefix covers the full flow.

## Accessibility

- `CheckoutProgress` renders past/current/future steps with `aria-current="step"` on the active step.
- Form submissions do **not** automatically move focus to the first error field. Consumers wanting this behavior should do it in their `onContinue` handler after receiving validation errors.
- `CheckoutGuestOrLoginForm` uses `ButtonGroupRadio` (`role="radiogroup"`) for the guest/login switch; focus does not auto-move to the panel heading on switch.

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
