# Components Domain

## Overview

57 Svelte 5 component directories with consistent API patterns. All use runes-based reactivity.

## Component Categories

### Layout

| Component                | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| AppShell, AppShellSimple | Page layouts with header/sidebar/content           |
| Header                   | Responsive nav header with hamburger collapse      |
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

| Component              | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| Notifications          | Toast notification system                                   |
| AlertConfirmPrompt     | Dialog factory (alert/confirm/prompt)                       |
| DismissibleMessage     | Closeable message banner                                    |
| Progress               | Progress bar                                                |
| Spinner                | Loading indicator (default SVG spinner)                     |
| SpinnerCircle          | CSS-only circular spinner with thickness/direction options  |
| SpinnerCircleOscillate | Animated Circle-based spinner with oscillating completeness |
| SpinnerUnicode         | Unicode character frame animation (17 variants)             |
| Skeleton               | Loading placeholder                                         |

### Form

| Component                                     | Purpose                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Input (FieldInput, FieldSelect, etc.)         | Form fields                                                                 |
| FieldPhoneNumber                              | International phone input with country picker                               |
| FieldObject                                   | Dual-mode JSON object editor (pretty-print/raw)                             |
| CronInput                                     | Cron expression editor with presets and validation                          |
| Fieldset                                      | Field grouping with legend                                                  |
| FieldKeyValues                                | Key-value pair editor                                                       |
| FieldAssets                                   | File/asset management                                                       |
| LoginForm, LoginFormModal                     | Standalone login form with optional modal variant                           |
| RegisterForm                                  | Standalone registration form with declarative extra fields                  |
| LoginOrRegisterForm, LoginOrRegisterFormModal | Composite login/register/verify form (3 modes, shared social-logins)        |
| EmailVerifyForm                               | Post-registration email-verify form (OtpInput + resend cooldown)            |
| OtpInput                                      | Generic N-slot one-time-code input (numeric/alphanumeric, paste-distribute) |

### Display

| Component           | Purpose                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Avatar              | User avatars with fallback                                                                           |
| UserAvatarMenu      | Avatar trigger + dropdown menu with header tile, color-scheme toggle, authed/unauthed states         |
| Pill                | Inline rounded badge/tag/chip (intent + variant + size, dismissible, dot, polymorphic span/a/button) |
| KbdShortcut         | Keyboard shortcut hints                                                                              |
| Carousel            | Image/content slider with snap, keyboard nav, wheel scroll, arrows                                   |
| ListItemButton      | List item with actions                                                                               |
| AnimatedElipsis     | Loading dots animation                                                                               |
| IconSwap            | N-state visibility swap with opacity transitions (e.g. hamburger/X)                                  |
| DataTable           | Responsive data table with paging, selection, batch actions                                          |
| ThemePreview        | Theme color swatches                                                                                 |
| AssetsPreview       | Modal-based asset/file preview with zoom, pan, swipe, area clicking                                  |
| AssetsPreviewInline | Always-visible (non-modal) asset preview with same feature set                                       |
| Book                | Interactive book/flipbook with 3D page-flip, zoom, pan, areas                                        |
| BookResponsive      | Responsive Book wrapper: auto single/dual-page + inline mode                                         |
| Circle              | SVG circular progress indicator                                                                      |
| H                   | Semantic heading (h1-h6) with separate visual/semantic levels                                        |
| Separator           | Horizontal/vertical separator line                                                                   |
| Thc                 | Flexible renderer for text, HTML, components, or snippets                                            |
| Card                | Flexible card with image, title, footer; vertical/horizontal layout                                  |
| Tree                | Hierarchical tree view with keyboard nav and drag-and-drop                                           |
| X                   | Styled close/multiply SVG icon                                                                       |
| ImageCycler         | Auto-cycling image carousel with fade transitions and preloading                                     |

### E-commerce

| Component | Purpose                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| Cart      | Shopping cart with quantity controls, pricing, summary; default/compact/summary variants |
| Checkout  | Multi-step checkout flow (14 exported sub-components: atomic + composite steps)          |

---

## Imperative validate API

Every `Field*` component that uses the `validate` action exposes a small
imperative API on its component reference, accessed via `bind:this`. Form
components (`LoginForm`, `RegisterForm`, `LoginOrRegisterForm`,
`EmailVerifyForm`) compose those into form-level `validate()` /
`scrollToFirstError()`.

### Why

The `validate` action only runs on user-driven DOM events (`change`, first
`blur`). On a pristine, never-touched field the inline `validation-box` never
mounts — which silently breaks any flow that pre-populates errors via
`customValidator` on a fresh form. The imperative API lets a submit handler
force every "sleeping" field's validator to run, rendering inline errors all
at once — no synthetic `change` events, no DOM lookups, no id-format coupling.

### The `validate` prop — defaults & opt-out

All field components that use the `validate` action treat the prop with one
consistent rule:

| `validate` value           | Action                                                     |
| -------------------------- | ---------------------------------------------------------- |
| (omitted) / `undefined`    | **Enabled** with default options (the common case)         |
| `true`                     | Enabled with default options (explicit; same as omitting)  |
| `false`                    | **Disabled** — no validation, `validate()` becomes a no-op |
| `{ customValidator, ... }` | Enabled, with `ValidateOptions` overrides applied          |

So `<FieldInput required />` works as expected — required is enforced, and a
failed `validate()` (imperative or event-driven) renders the inline error.
Use `validate={false}` to bypass stuic's validation entirely.

> **Why default-on?** Hidden-input field components (`FieldPhoneNumber`,
> `FieldCountry`, `FieldObject`, `FieldAssets`, `FieldInputLocalized`,
> `FieldKeyValues`, `FieldLikeButton`) _must_ be default-on because hidden
> inputs are excluded from native browser constraint validation — without the
> stuic action enforcing `required` in a `customValidator`, the attribute is a
> silent no-op. Plain-input field components were harmonized to the same
> default to keep the rule uniform: "`required` means required."

### Per-field methods

Available on `FieldInput`, `FieldTextarea`, `FieldCheckbox`, `FieldSelect`,
`FieldFile`, `FieldObject`, `FieldAssets`, `FieldInputLocalized`,
`FieldKeyValues`, `FieldPhoneNumber`, `FieldCountry`, `FieldLikeButton`,
`FieldRadios`, `FieldSwitch`, `FieldOptions`, and `Switch`:

| Method                  | Returns                         | Purpose                                                       |
| ----------------------- | ------------------------------- | ------------------------------------------------------------- |
| `validate()`            | `ValidationResult \| undefined` | Run the validator now. Renders the inline message if invalid. |
| `clearValidation()`     | `void`                          | Clear the inline message and `setCustomValidity`.             |
| `getValidation()`       | `ValidationResult \| undefined` | Read cached state (no re-run).                                |
| `focus()`               | `void`                          | Focus the visible interactive element.                        |
| `scrollIntoView(opts?)` | `void`                          | Scroll the field into view. Defaults to `smooth` + `center`.  |

```svelte
<script>
	let nameField = $state<FieldInput>();

	function checkName() {
		const result = nameField?.validate();
		if (result && !result.valid) {
			console.warn("Name invalid:", result.message);
		}
	}
</script>

<FieldInput bind:this={nameField} bind:value={name} label="Name" required />
<Button onclick={checkName}>Check now</Button>
```

### Form-level methods

`LoginForm`, `RegisterForm`, `LoginOrRegisterForm`, and `EmailVerifyForm` each
expose:

| Method                      | Returns   | Purpose                                                                       |
| --------------------------- | --------- | ----------------------------------------------------------------------------- |
| `validate()`                | `boolean` | Run every inner field's validator. `true` if all valid.                       |
| `scrollToFirstError(opts?)` | `boolean` | Scroll the first invalid field into view + focus it. Call after `validate()`. |

```svelte
<script>
	let loginForm = $state<LoginForm>();

	async function handleCustomSubmit() {
		if (!loginForm?.validate()) {
			loginForm?.scrollToFirstError();
			return;
		}
		await api.login(/* ... */);
	}
</script>

<LoginForm bind:this={loginForm} onSubmit={handleCustomSubmit} />
<Button onclick={handleCustomSubmit}>Submit from outside</Button>
```

### Pristine-form errors pattern

The trap: an external `errors` prop wired into each field's `customValidator`
won't render until the user touches the field. Pair the existing prop with
an imperative `validate()` call from your submit handler:

```svelte
<!-- in your submit handler -->
<script>
	function handleContinue() {
		if (!validateAllFields([nameField /* ... */])) return;
		// ...submit
	}
</script>

<FieldInput
	bind:this={nameField}
	bind:value={address.name}
	required
	validate={{
		customValidator() {
			return externalErrors.find((e) => e.field === "name")?.message || "";
		},
	}}
/>
```

For aggregation across many fields, see
[validate-fields utilities](./utils.md#field-validation-aggregators).

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

## RegisterForm

Standalone registration form. Mirrors `LoginForm` conventions: `formData`, `onSubmit`, validation, errors, i18n, notifications, social-logins. Adds declarative `extraFields` (top/bottom positioning, custom validators) and an `extraFieldsSlot` escape hatch (e.g., terms checkbox).

### Exports

| Export                        | Kind      | Description                                   |
| ----------------------------- | --------- | --------------------------------------------- |
| `RegisterForm`                | component | Main register form                            |
| `RegisterFormProps`           | type      | Props for RegisterForm                        |
| `RegisterFormData`            | type      | `{ email, password, passwordConfirm, extra }` |
| `RegisterFormValidationError` | type      | `{ field, message }`                          |
| `RegisterFieldConfig`         | type      | Declarative extra-field descriptor            |
| `createEmptyRegisterFormData` | function  | Factory for an empty `RegisterFormData`       |

### Key Props

| Prop                  | Type                            | Default  | Description                             |
| --------------------- | ------------------------------- | -------- | --------------------------------------- |
| `formData`            | `RegisterFormData`              | empty    | Bindable form data                      |
| `onSubmit`            | `(data) => void`                | required | Submit callback                         |
| `isSubmitting`        | `boolean`                       | `false`  | Disables CTA                            |
| `errors`              | `RegisterFormValidationError[]` | `[]`     | Field-specific server errors            |
| `error`               | `string`                        | —        | General error (alert above form)        |
| `showPasswordConfirm` | `boolean`                       | `true`   | Render password-confirm field           |
| `passwordMinLength`   | `number`                        | `8`      | Min password length (input + validator) |
| `extraFields`         | `RegisterFieldConfig[]`         | `[]`     | Declarative extra fields (top/bottom)   |
| `extraFieldsSlot`     | `Snippet`                       | —        | Escape-hatch for non-FieldInput extras  |
| `submitButton`        | `Snippet`                       | —        | Custom CTA section                      |
| `socialLogins`        | `Snippet`                       | —        | OAuth buttons below form                |
| `footer`              | `Snippet`                       | —        | Content below form                      |
| `notifications`       | `NotificationsStack`            | —        | Route errors to notifications           |
| `compact`             | `boolean`                       | `false`  | Compact layout                          |
| `t`                   | `TranslateFn`                   | built-in | Translation function                    |

### CSS Tokens

Prefix: `--stuic-register-form-*`

`gap`, `gap-row`, `social-margin-top`, `social-gap`, `social-divider-color`, `social-divider-line-color`, `social-divider-font-size`, `social-divider-margin-bottom`

---

## LoginOrRegisterForm

Composite form that toggles between `LoginForm`, `RegisterForm`, and (since 3.71) `EmailVerifyForm`. The mode switcher only exposes login/register tabs; verify is an outcome state entered programmatically (typically after a `requiresVerification` register response).

### Exports

| Export                          | Kind      | Description                         |
| ------------------------------- | --------- | ----------------------------------- |
| `LoginOrRegisterForm`           | component | Composite form                      |
| `LoginOrRegisterFormModal`      | component | Modal-wrapped variant               |
| `LoginOrRegisterFormProps`      | type      | Props for the composite form        |
| `LoginOrRegisterFormModalProps` | type      | Props for the modal                 |
| `LoginOrRegisterFormMode`       | type      | `"login" \| "register" \| "verify"` |

### Key Props

| Prop            | Type                            | Default   | Description                                                                |
| --------------- | ------------------------------- | --------- | -------------------------------------------------------------------------- |
| `mode`          | `LoginOrRegisterFormMode`       | `"login"` | Bindable active mode                                                       |
| `loginData`     | `LoginFormData`                 | empty     | Bindable login form data                                                   |
| `registerData`  | `RegisterFormData`              | empty     | Bindable register form data                                                |
| `verifyEmail`   | `string`                        | `""`      | Bindable email used by EmailVerifyForm (auto-seeded on transitions)        |
| `onLogin`       | `(data) => void`                | required  | Login submit callback                                                      |
| `onRegister`    | `(data) => void`                | required  | Register submit callback                                                   |
| `onVerify`      | `(code: string) => void`        | —         | Verify submit callback (required only when using verify mode)              |
| `onResendCode`  | `() => Promise<void> \| void`   | —         | Resend handler — when set, EmailVerifyForm renders the resend control      |
| `loginProps`    | `Partial<LoginFormProps>`       | —         | Pass-through to inner LoginForm                                            |
| `registerProps` | `Partial<RegisterFormProps>`    | —         | Pass-through to inner RegisterForm                                         |
| `verifyProps`   | `Partial<EmailVerifyFormProps>` | —         | Pass-through to inner EmailVerifyForm (e.g., `error`, `attemptsRemaining`) |
| `modeSwitcher`  | `Snippet`                       | —         | Override the built-in ButtonGroupRadio                                     |
| `socialLogins`  | `Snippet`                       | —         | Shared OAuth buttons (hidden in verify mode)                               |
| `footer`        | `Snippet<[{ mode, setMode }]>`  | —         | Mode-aware footer                                                          |
| `isSubmitting`  | `boolean`                       | `false`   | Forwarded to all three forms                                               |
| `notifications` | `NotificationsStack`            | —         | Routes errors to notifications                                             |
| `t`             | `TranslateFn`                   | built-in  | Translation function                                                       |

### Modal additions (`LoginOrRegisterFormModal`)

Inherits all `LoginOrRegisterForm` props, plus:

| Prop       | Type                  | Default    | Description                                                                 |
| ---------- | --------------------- | ---------- | --------------------------------------------------------------------------- |
| `title`    | `string`              | mode-aware | Modal title (defaults to "Log In" / "Create account" / "Verify your email") |
| `visible`  | `boolean`             | `false`    | Bindable visibility                                                         |
| `trigger`  | `Snippet<[{ open }]>` | —          | Optional trigger element                                                    |
| `noXClose` | `boolean`             | `false`    | Hide close button                                                           |

### CSS Tokens

Prefix: `--stuic-login-or-register-form-*`

`gap`, `switcher-margin-bottom`, `social-margin-top`, `social-gap`, `social-divider-*`

### i18n

| Key                                           | Default             |
| --------------------------------------------- | ------------------- |
| `login_or_register_form.mode_login`           | `Log in`            |
| `login_or_register_form.mode_register`        | `Sign up`           |
| `login_or_register_form.mode_verify`          | `Verify`            |
| `login_or_register_form.modal_title_login`    | `Log In`            |
| `login_or_register_form.modal_title_register` | `Create account`    |
| `login_or_register_form.modal_title_verify`   | `Verify your email` |
| `login_or_register_form.social_divider`       | `or continue with`  |

---

## EmailVerifyForm

Post-registration email-verify form. Drop-in peer to `LoginForm` / `RegisterForm`. Renders a heading, a subhead with the bolded email address, a general error banner, an `OtpInput` (default 6 digits, auto-submits on completion), an optional attempts hint, a primary submit button, and an optional resend control with built-in cooldown countdown.

### Exports

| Export                 | Kind      | Description               |
| ---------------------- | --------- | ------------------------- |
| `EmailVerifyForm`      | component | Email-verify form         |
| `EmailVerifyFormProps` | type      | Props for EmailVerifyForm |

### Key Props

| Prop                    | Type                          | Default  | Description                                               |
| ----------------------- | ----------------------------- | -------- | --------------------------------------------------------- |
| `email`                 | `string`                      | required | Email shown in the subhead                                |
| `onSubmit`              | `(code: string) => void`      | required | Called with the entered code (auto + manual submit)       |
| `onResend`              | `() => Promise<void> \| void` | —        | When set, renders the resend control                      |
| `resendCooldownSeconds` | `number`                      | `30`     | Cooldown after a successful resend                        |
| `isSubmitting`          | `boolean`                     | `false`  | Disables submit + OtpInput                                |
| `error`                 | `string`                      | —        | General error (alert + applies error styling to OtpInput) |
| `attemptsRemaining`     | `number`                      | —        | Inline "{count} attempts remaining" hint                  |
| `codeLength`            | `number`                      | `6`      | Forwarded to OtpInput                                     |
| `otpInputProps`         | `Partial<OtpInputProps>`      | —        | Pass-through to inner OtpInput                            |
| `notifications`         | `NotificationsStack`          | —        | Route errors to notifications                             |
| `submitButton`          | `Snippet`                     | —        | Override submit section                                   |
| `footer`                | `Snippet`                     | —        | Content below resend control                              |
| `t`                     | `TranslateFn`                 | built-in | Translation function                                      |

### CSS Tokens

Prefix: `--stuic-email-verify-form-*`

`gap`, `subheading-color`, `attempts-color`, `resend-color`, `resend-flash-color`

### i18n keys

`email_verify_form.heading`, `subheading`, `submit`, `submitting`, `resend_prompt`, `resend`, `resend_cooldown`, `resent`, `attempts_remaining`

---

## OtpInput

Generic N-slot one-time-code input. 6 numeric digits by default, configurable to 4–8. Building block for email-verify, future 2FA, and password-reset OTP flows.

### Exports

| Export          | Kind      | Description        |
| --------------- | --------- | ------------------ |
| `OtpInput`      | component | OTP input          |
| `OtpInputProps` | type      | Props for OtpInput |

### Key Props

| Prop           | Type                          | Default           | Description                                          |
| -------------- | ----------------------------- | ----------------- | ---------------------------------------------------- |
| `value`        | `string`                      | `""`              | Bindable concatenated value                          |
| `length`       | `number`                      | `6`               | Number of slots                                      |
| `onComplete`   | `(code: string) => void`      | —                 | Fired when all slots are filled                      |
| `oninput`      | `(value: string) => void`     | —                 | Fired on every change                                |
| `error`        | `boolean`                     | `false`           | Renders error styling + `aria-invalid`               |
| `disabled`     | `boolean`                     | `false`           | Disables all slots                                   |
| `autoFocus`    | `boolean`                     | `true`            | Auto-focus first empty slot on mount                 |
| `mode`         | `"numeric" \| "alphanumeric"` | `"numeric"`       | Restrict input characters                            |
| `autocomplete` | `string`                      | `"one-time-code"` | Pass-through to first slot for browser/iOS auto-fill |

### Behavior

- Auto-advance on input; backspace clears or jumps back
- Arrow keys navigate without modifying values
- Paste anywhere distributes from slot 0 (after sanitization + truncation)
- iOS / Android SMS auto-fill works via `autocomplete="one-time-code"` on slot 0
- Each slot announces `aria-label="Digit {n+1} of {length}"`
- Enter bubbles native submit to surrounding `<form>`

### CSS Tokens

Prefix: `--stuic-otp-input-*`

`gap`, `slot-size`, `font-size`, `bg`, `color`, `radius`, `border-width`, `border-color`, `border-color-focus`, `border-color-error`, `transition`

Falls back to shared structural tokens `--stuic-radius`, `--stuic-border-width`, `--stuic-transition`.

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

## Card

Flexible, responsive card for displaying content in a contained box. Supports images (top or side), titles, descriptions, footers, and interactive states.

### Exports

| Export        | Kind      | Description                  |
| ------------- | --------- | ---------------------------- |
| `Card`        | component | Main card component          |
| `CardProps`   | type      | Props type                   |
| `CardVariant` | type      | `"vertical" \| "horizontal"` |

### Key Props

| Prop                  | Type          | Default      | Description                                       |
| --------------------- | ------------- | ------------ | ------------------------------------------------- |
| `image`               | `string`      | —            | Image URL                                         |
| `eyebrow`             | `THC`         | —            | Small label above title                           |
| `title`               | `THC`         | —            | Card title                                        |
| `description`         | `THC`         | —            | Short description                                 |
| `variant`             | `CardVariant` | `"vertical"` | Layout direction                                  |
| `href`                | `string`      | —            | Renders as `<a>`                                  |
| `onclick`             | `(e) => void` | —            | Renders as `<button>`                             |
| `disabled`            | `boolean`     | `false`      | Disable interaction                               |
| `horizontalThreshold` | `number`      | `480`        | Width (px) to auto-switch to vertical; 0 disables |

Snippets: `children`, `renderImage`, `renderBadge`, `renderContent`, `renderFooter`.

### CSS Tokens

Prefix: `--stuic-card-*`

`bg`, `bg-hover`, `border`, `border-hover`, `padding`, `content-gap`, `image-aspect-ratio`, `image-object-fit`, `image-width-horizontal`, `radius`, `shadow`, `shadow-hover`, `ring-width`, `ring-color`, `eyebrow-font-size`, `eyebrow-text`, `title-font-size`, `title-font-weight`, `title-text`, `description-font-size`, `description-text`, `opacity-disabled`

---

## CronInput

Cron expression editor with preset selector, manual 5-field editor, raw expression input, human-readable descriptions, and next-run calculation.

### Exports

| Export                 | Kind      | Description                                      |
| ---------------------- | --------- | ------------------------------------------------ |
| `CronInput`            | component | Main cron editor                                 |
| `CronInputProps`       | type      | Props type                                       |
| `CronPreset`           | type      | Preset interface `{ label, value }`              |
| `CronInputMode`        | type      | `"predefined" \| "manual"`                       |
| `CRON_DEFAULT_PRESETS` | constant  | Default preset array (11 common schedules)       |
| `CronNextRun`          | class     | Reactive helper for standalone cron calculations |

### Key Props

| Prop              | Type                    | Default       | Description                     |
| ----------------- | ----------------------- | ------------- | ------------------------------- |
| `value`           | `string`                | `"* * * * *"` | Bindable cron expression        |
| `mode`            | `CronInputMode`         | —             | Bindable; predefined or manual  |
| `showPresets`     | `boolean`               | `true`        | Show preset selector            |
| `showFields`      | `boolean`               | `true`        | Show 5-column field editor      |
| `showRawInput`    | `boolean`               | `true`        | Show raw expression input       |
| `showDescription` | `boolean`               | `true`        | Show human-readable description |
| `showNextRun`     | `boolean`               | `true`        | Show next run time              |
| `presets`         | `CronPreset[]`          | default set   | Custom presets                  |
| `onchange`        | `(expr, valid) => void` | —             | Change callback                 |

Integrates with `InputWrap` — supports `label`, `description`, `renderSize`, `required`, `disabled`, `validate`, `labelLeft`, `below`.

### CronNextRun Class

Reactive helper for standalone cron calculations:

```ts
const next = new CronNextRun("0 9 * * 1-5");
next.nextRun; // Date | null
next.nextRunFormatted; // "YYYY-MM-DD HH:MM"
next.valid; // boolean
next.destroy(); // cleanup timer
```

### CSS Tokens

Prefix: `--stuic-cron-input-*`

`fields-gap`, `section-gap`, `field-label-text`, `summary-text`, `error-text`, `field-bg`, `field-border`, `field-border-focus`

---

## Header

Responsive navigation header with leading slot, logo, nav items, locale switcher, action icon buttons, avatar, and configurable responsive collapse. Two collapse modes:

- `"hamburger"` (default): nav items fold into a trailing dropdown along with the locale switcher and (if interactive) the avatar.
- `"hide"`: nav items are hidden entirely — no trailing hamburger. Avatar + actions stay visible. Common "app shell" pattern where a leading hamburger opens a side drawer.

### Exports

| Export                             | Kind      | Description                        |
| ---------------------------------- | --------- | ---------------------------------- |
| `Header`                           | component | Main header component              |
| `HeaderProps`                      | type      | Props type                         |
| `HeaderNavItem`                    | type      | Nav item interface                 |
| `HeaderActionItem`                 | type      | Action icon-button interface       |
| `HeaderLocaleItem`                 | type      | Locale switcher item               |
| `HeaderCollapseMode`               | type      | `"hamburger" \| "hide"`            |
| `HeaderLeadingHamburger`           | type      | `boolean \| "collapsed"`           |
| `HEADER_BASE_CLASSES`              | constant  | `"stuic-header"`                   |
| `HEADER_CONTENT_CLASSES`           | constant  | `"stuic-header-content"`           |
| `HEADER_LEADING_CLASSES`           | constant  | `"stuic-header-leading"`           |
| `HEADER_LEADING_HAMBURGER_CLASSES` | constant  | `"stuic-header-leading-hamburger"` |
| `HEADER_LOGO_CLASSES`              | constant  | `"stuic-header-logo"`              |
| `HEADER_NAV_CLASSES`               | constant  | `"stuic-header-nav"`               |
| `HEADER_NAV_ITEM_CLASSES`          | constant  | `"stuic-header-nav-item"`          |
| `HEADER_ACTIONS_CLASSES`           | constant  | `"stuic-header-actions"`           |
| `HEADER_ACTION_CLASSES`            | constant  | `"stuic-header-action"`            |
| `HEADER_END_CLASSES`               | constant  | `"stuic-header-end"`               |
| `HEADER_HAMBURGER_CLASSES`         | constant  | `"stuic-header-hamburger"`         |
| `HEADER_LOCALE_CLASSES`            | constant  | `"stuic-header-locale"`            |

### HeaderNavItem

```ts
interface HeaderNavItem {
	id: string | number;
	label: THC;
	href?: string;
	target?: string;
	onclick?: () => void;
	icon?: THC;
	active?: boolean;
	disabled?: boolean;
	class?: string;
}
```

### HeaderActionItem

```ts
interface HeaderActionItem {
	id: string | number;
	icon?: THC; // visible content (ignored when render is provided)
	label: THC; // aria-label
	onclick?: () => void;
	href?: string;
	target?: string;
	active?: boolean;
	disabled?: boolean;
	class?: string;
	/** Optional custom renderer — replaces the default <Button> while
	 *  keeping Header-owned positioning + collapse behavior. */
	render?: Snippet<
		[
			{
				action: HeaderActionItem;
				class: string;
				isCollapsed: boolean;
				onclick: () => void;
			},
		]
	>;
}
```

### Key Props

| Prop                    | Type                         | Default               | Description                                                                                |
| ----------------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `leading`               | `Snippet<[{ isCollapsed }]>` | —                     | Leading (left) slot. Overrides `leadingHamburger`.                                         |
| `leadingHamburger`      | `boolean \| "collapsed"`     | `false`               | Built-in leading hamburger (`"collapsed"` = only below threshold).                         |
| `onLeadingHamburger`    | `() => void`                 | —                     | Click handler for the leading hamburger (typically opens a drawer).                        |
| `leadingHamburgerIcon`  | `THC`                        | menu icon             | Icon override for the leading hamburger.                                                   |
| `leadingHamburgerLabel` | `string`                     | `"Open menu"`         | Aria-label for the leading hamburger.                                                      |
| `logo`                  | `Snippet`                    | —                     | Logo/brand snippet.                                                                        |
| `projectName`           | `string`                     | —                     | Simple text logo alternative.                                                              |
| `navVariant`            | `ButtonVariant`              | `"ghost"`             | Button variant for nav items + locale trigger.                                             |
| `items`                 | `HeaderNavItem[]`            | `[]`                  | Nav items — inline expanded, dropdown collapsed (hamburger mode).                          |
| `actions`               | `HeaderActionItem[]`         | `[]`                  | Action icon buttons. Always visible.                                                       |
| `onActionSelect`        | `(action) => void`           | —                     | Called after per-item `onclick`.                                                           |
| `avatar`                | `Snippet`                    | —                     | Avatar snippet (far right).                                                                |
| `avatarOnClick`         | `() => void`                 | —                     | Makes avatar interactive. In `"hamburger"` mode it folds into the dropdown when collapsed. |
| `avatarLabel`           | `THC`                        | `"Account"`           | Label for the avatar entry inside the collapsed dropdown.                                  |
| `locales`               | `HeaderLocaleItem[]`         | `[]`                  | Locale items. Switcher only renders when 2+.                                               |
| `activeLocale`          | `string`                     | —                     | Current locale id.                                                                         |
| `onLocaleChange`        | `(localeId) => void`         | —                     | Locale selection callback.                                                                 |
| `localeLabel`           | `THC`                        | `"Language"`          | Section header inside the collapsed dropdown.                                              |
| `contentMaxWidth`       | `string \| number`           | —                     | Inner content row max-width (outer header stays 100%).                                     |
| `collapseThreshold`     | `number`                     | `768`                 | Width (px) to collapse; 0 disables.                                                        |
| `collapseMode`          | `"hamburger" \| "hide"`      | `"hamburger"`         | Collapse behavior. See top of section.                                                     |
| `keepLocaleOnCollapse`  | `boolean`                    | `false`               | Keep locale switcher visible when collapsed (only `collapseMode === "hide"`).              |
| `fixed`                 | `boolean`                    | `false`               | Fixed positioning at top.                                                                  |
| `isCollapsed`           | `boolean`                    | —                     | Bindable: collapsed state.                                                                 |
| `isMenuOpen`            | `boolean`                    | —                     | Bindable: hamburger menu open.                                                             |
| `dropdownPosition`      | `DropdownMenuPosition`       | `"bottom-span-right"` | Position of the collapsed dropdown.                                                        |
| `iconSize`              | `number`                     | `24`                  | Hamburger/X icon size in px.                                                               |
| `onSelect`              | `(item) => void`             | —                     | Item selection callback (both modes).                                                      |

Snippets: `leading({ isCollapsed })`, `logo`, `avatar`, `children({ isCollapsed, items, offsetWidth })`. `HeaderActionItem.render` is a per-action snippet.

Class slots: `class`, `classContent`, `classLeading`, `classLeadingHamburger`, `classLogo`, `classNav`, `classNavItem`, `classNavItemActive`, `classActions`, `classAction`, `classActionActive`, `classEnd`, `classAvatar`, `classLocale`, `classHamburger`, `classDropdown`.

### App-shell pattern (`collapseMode="hide"`)

Common pattern for app interfaces: the leading hamburger opens a side drawer for navigation, while avatar + action buttons (search, notifications, cart…) remain accessible in the top bar even on narrow viewports.

```svelte
<Header projectName="App" items={navItems} <!-- inline expanded, hidden collapsed -->
	actions={[
		{ id: "search", icon: { html: iconSearch() }, label: "Search", onclick: openSearch },
		{ id: "cart", icon: { html: iconCart() }, label: "Cart", onclick: openCart },
	]}
	collapseMode="hide" leadingHamburger="collapsed" onLeadingHamburger={() =>
		(drawerOpen = true)}
	{locales}
	{activeLocale}
	onLocaleChange={(id) => (activeLocale = id)}
	avatarOnClick={() => goto("/me")}
	>
	{#snippet avatar()}<Avatar initials="MM" autoColor />{/snippet}
</Header>
```

See [Header/README.md](../../src/lib/components/Header/README.md) for the breakdown of which markup branch handles each requirement of this pattern.

### CSS Tokens

Prefix: `--stuic-header-*`

`padding-x`, `padding-y`, `gap`, `min-height`, `nav-gap`, `content-max-width`, `project-name-font-weight`, `z-index`, `bg`, `text`, `border-width`, `border-color`, `nav-item-bg-active`, `nav-item-text-active`

---

## Tree

Accessible, keyboard-navigable hierarchical tree view with optional drag-and-drop reordering and localStorage persistence.

### Exports

| Export                  | Kind      | Description                          |
| ----------------------- | --------- | ------------------------------------ |
| `Tree`                  | component | Main tree component                  |
| `TreeProps`             | type      | Props type                           |
| `TreeMoveEvent`         | type      | Drag-drop event interface            |
| `TreeDropPosition`      | type      | `"before" \| "after" \| "inside"`    |
| `TREE_BASE_CLASSES`     | constant  | `"stuic-tree"`                       |
| `TREE_ITEM_CLASSES`     | constant  | `"stuic-tree-item"`                  |
| `TREE_CHILDREN_CLASSES` | constant  | `"stuic-tree-children"`              |
| `TreeNodeDTO`           | type      | Re-exported from `@marianmeres/tree` |

### Key Props

| Prop              | Type                                 | Default  | Description                          |
| ----------------- | ------------------------------------ | -------- | ------------------------------------ |
| `items`           | `TreeNodeDTO<T>[]`                   | required | Tree data                            |
| `renderItem`      | `Snippet<[item, depth, isExpanded]>` | —        | Custom item content                  |
| `renderIcon`      | `Snippet<[item, depth, isExpanded]>` | —        | Custom item icon                     |
| `activeId`        | `string`                             | —        | Selected item ID                     |
| `isActive`        | `(item) => boolean`                  | —        | Custom active check                  |
| `onSelect`        | `(item) => void`                     | —        | Item selection callback              |
| `onToggle`        | `(item, expanded) => void`           | —        | Branch toggle callback               |
| `sort`            | `(a, b) => number`                   | —        | Sort comparator (per-level)          |
| `defaultExpanded` | `boolean`                            | `false`  | Default expand state                 |
| `expandedIds`     | `Set<string>`                        | —        | Initially expanded IDs               |
| `persistState`    | `boolean`                            | `false`  | Save expand state to localStorage    |
| `draggable`       | `boolean`                            | `false`  | Enable drag-and-drop                 |
| `isDraggable`     | `(item) => boolean`                  | —        | Per-item drag control                |
| `isDropTarget`    | `(item) => boolean`                  | —        | Per-item drop target control         |
| `onMove`          | `(event) => void \| false`           | —        | Drop handler; return false to reject |
| `dragExpandDelay` | `number`                             | `800`    | Auto-expand delay (ms) on drag hover |

Features: arrow-key navigation, Home/End, Enter/Space, roving tabindex, slide transitions (respects `prefers-reduced-motion`).

### CSS Tokens

Prefix: `--stuic-tree-*`

`indent`, `item-padding-x`, `item-padding-y`, `item-height`, `item-font-size`, `item-gap`, `chevron-opacity`, `icon-opacity`, `item-opacity-dragging`, `item-bg`, `item-text`, `item-bg-hover`, `item-text-hover`, `item-bg-active`, `item-text-active`, `item-bg-focus`, `item-text-focus`, `drop-indicator-color`, `drop-indicator-height`, `item-bg-dragover`

---

## UserAvatarMenu

Thin opinionated wrapper around `Avatar` + `DropdownMenu` for the common "user avatar in the header opens a small menu" pattern. Renders in both authenticated (header tile, View profile, color-scheme toggle, Logout) and unauthenticated (Login, Register) states from the same trigger position. Color scheme is the one built-in side effect; everything else is consumer callbacks.

### Exports

| Export                      | Kind      | Description                                                                         |
| --------------------------- | --------- | ----------------------------------------------------------------------------------- |
| `UserAvatarMenu`            | component | Main component                                                                      |
| `UserAvatarMenuProps`       | type      | Props type                                                                          |
| `UserAvatarMenuIdentity`    | type      | `{ email, name?, src?, roles? }`                                                    |
| `UserAvatarMenuActions`     | type      | `{ onProfile?, onSettings?, onLogout?, onLoginOrRegister?, onLogin?, onRegister? }` |
| `UserAvatarMenuLabels`      | type      | Label overrides (all optional, English defaults)                                    |
| `UserAvatarMenuColorScheme` | type      | `boolean \| { enabled?, onToggle?, isDark? }`                                       |

### Key Props

| Prop             | Type                                          | Default | Description                                                       |
| ---------------- | --------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `identity`       | `UserAvatarMenuIdentity \| null`              | `null`  | Current user. `null` / `undefined` → unauthenticated mode.        |
| `actions`        | `UserAvatarMenuActions`                       | `{}`    | Handlers; missing → corresponding item hidden.                    |
| `labels`         | `UserAvatarMenuLabels`                        | English | Translated strings for built-in items.                            |
| `colorScheme`    | `boolean \| { enabled?, onToggle?, isDark? }` | `true`  | Built-in dark/light toggle. `false` to disable.                   |
| `showHeaderTile` | `boolean`                                     | `true`  | Render avatar+email tile inside the dropdown (auth only).         |
| `showRoles`      | `boolean`                                     | `false` | Render `identity.roles` under the email in the header tile.       |
| `extraItems`     | `DropdownMenuItem[]`                          | —       | Appended to the standard item set.                                |
| `items`          | `DropdownMenuItem[]`                          | —       | Full override of items (trigger + shell still render).            |
| `avatar`         | `Partial<AvatarProps>`                        | —       | Forwarded to the default trigger Avatar (and header-tile Avatar). |
| `position`       | `DropdownMenuPosition`                        | —       | Forwarded to `DropdownMenu`.                                      |
| `classDropdown`  | `string`                                      | —       | Forwarded.                                                        |
| `classTrigger`   | `string`                                      | —       | Class merged onto the default trigger `<button>`.                 |
| `trigger`        | `Snippet<[{ isOpen, toggle, triggerProps }]>` | —       | Custom trigger snippet (replaces default Avatar trigger).         |
| `headerTile`     | `Snippet<[{ identity }]>`                     | —       | Custom header-tile snippet (replaces default avatar+email tile).  |
| `isOpen`         | `boolean`                                     | `false` | Bindable open state.                                              |

### Default item order

**Authenticated:** header tile → View profile → Settings → Color scheme → Divider → Logout → `extraItems`. Each rendered only if its precondition (handler present, etc.) holds.

**Unauthenticated:** Login or register → Login → Register → Color scheme → `extraItems`. Each rendered only if the corresponding handler is provided. The three are independent — pass any combination. The combined `onLoginOrRegister` (typically opening a `LoginOrRegisterFormModal`) is the most common variant. No header tile.

### Opinionated decisions

- Color scheme is the only built-in side effect (`ColorScheme.toggle()` + re-read on select). Opt out with `colorScheme={false}`.
- English label defaults; consumers pass `labels` for i18n. No i18n library imported.
- No auth state ownership, no router, no modal triggering — all consumer callbacks.

### CSS Tokens

Prefix: `--stuic-user-avatar-menu-*`

`dropdown-width` (16rem), `trigger-radius`, `trigger-opacity-hover`, `trigger-outline-color`, `transition`, `header-gap`, `header-padding`, `header-margin-bottom`, `header-bg`, `header-color`, `header-radius`, `header-email-font-size`, `header-email-color`, `header-roles-font-size`, `header-roles-color`, `header-roles-opacity`

The dropdown has a fixed `width` so every instance opens identically — short and long content alike. Email, name, and roles truncate with `text-overflow: ellipsis`. Header tile defaults: `--stuic-color-muted` bg + `--stuic-color-muted-foreground` text.

---

## Key Files

| File                                    | Purpose                                               |
| --------------------------------------- | ----------------------------------------------------- |
| src/lib/components/Button/              | Reference implementation                              |
| src/lib/components/Modal/               | Complex component example                             |
| src/lib/components/Input/               | Form field patterns (incl. FieldObject)               |
| src/lib/components/LoginForm/           | Standalone login form + modal variant                 |
| src/lib/components/RegisterForm/        | Standalone registration form                          |
| src/lib/components/LoginOrRegisterForm/ | Composite login/register/verify form + modal          |
| src/lib/components/EmailVerifyForm/     | Post-registration email-verify form                   |
| src/lib/components/OtpInput/            | N-slot one-time-code input                            |
| src/lib/components/Checkout/            | E-commerce checkout flow (14 exported sub-components) |
| src/lib/components/Card/                | Card with image/title/footer variants                 |
| src/lib/components/Tree/                | Hierarchical tree with drag-and-drop                  |
| src/lib/components/UserAvatarMenu/      | Avatar trigger + dropdown for user menu               |
| src/lib/index.ts                        | All component exports                                 |
