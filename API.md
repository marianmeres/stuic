# API

Complete API reference for `@marianmeres/stuic`.

---

## Components

All components support these universal props:

| Prop       | Type          | Default     | Description                                   |
| ---------- | ------------- | ----------- | --------------------------------------------- |
| `unstyled` | `boolean`     | `false`     | Skip all default styling                      |
| `class`    | `string`      | `undefined` | Additional CSS classes (merged via `twMerge`) |
| `el`       | `HTMLElement` | `undefined` | Bindable element reference                    |

### Intent + Variant System

Components that support `intent` and `variant` props (Button, DismissibleMessage, etc.):

**Intent** (semantic color):

| Value         | Purpose            |
| ------------- | ------------------ |
| `primary`     | Main actions       |
| `accent`      | Secondary emphasis |
| `destructive` | Dangerous actions  |
| `warning`     | Caution states     |
| `success`     | Positive states    |

**Variant** (visual treatment):

| Value     | Purpose                             |
| --------- | ----------------------------------- |
| `solid`   | Filled background, contrasting text |
| `outline` | Transparent bg, colored border/text |
| `ghost`   | Transparent bg, subtle hover        |
| `soft`    | Muted tinted background             |
| `link`    | Minimal, text decoration only       |

```svelte
<Button intent="destructive" variant="outline">Delete</Button>
```

### Layout & Overlays

#### `AppShell`

Page layout with header, sidebar, and content areas.

```svelte
<AppShell>
	{#snippet header()}<nav>Header</nav>{/snippet}
	{#snippet sidebar()}<aside>Sidebar</aside>{/snippet}
	<main>Content</main>
</AppShell>
```

#### `Modal`

Overlay container with backdrop. Controlled programmatically.

| Prop                   | Type      | Default | Description                  |
| ---------------------- | --------- | ------- | ---------------------------- |
| `open`                 | `boolean` | `false` | Bindable open state          |
| `closeOnBackdropClick` | `boolean` | `true`  | Close when clicking backdrop |
| `closeOnEscape`        | `boolean` | `true`  | Close on Escape key          |

```svelte
<Modal bind:open={isOpen}>
	{#snippet header()}<h2>Title</h2>{/snippet}
	<p>Content</p>
	{#snippet footer()}<Button onclick={() => (isOpen = false)}>Close</Button>{/snippet}
</Modal>
```

#### `ModalDialog`

Pre-styled modal dialog with title and action buttons. Uses native `<dialog>` element with focus trap and backdrop.

| Prop               | Type       | Default     | Description                                           |
| ------------------ | ---------- | ----------- | ----------------------------------------------------- |
| `classDialog`      | `string`   | `undefined` | CSS class for the dialog element                      |
| `noClickOutsideClose` | `boolean` | `false`  | Disable close on outside click                        |
| `noEscapeClose`    | `boolean`  | `false`     | Disable close on Escape key                           |
| `noScrollLock`     | `boolean`  | `false`     | Disable body scroll lock when open                    |
| `preEscapeClose`   | `() => any` | —          | Pre-close hook for Escape. Return false to prevent.   |
| `preClose`         | `() => any` | —          | Pre-close hook. Return false to prevent.              |

**Methods:** `open(openerOrEvent?)`, `close()`

#### `Drawer`

Side panel overlay (left or right).

| Prop   | Type                | Default  | Description         |
| ------ | ------------------- | -------- | ------------------- |
| `open` | `boolean`           | `false`  | Bindable open state |
| `side` | `"left" \| "right"` | `"left"` | Panel side          |

#### `Backdrop`

Semi-transparent overlay with escape key handling, focus trap, and body scroll locking.

#### `Accordion`

Expandable sections with exclusive or multi-open modes.

| Prop   | Type      | Default | Description         |
| ------ | --------- | ------- | ------------------- |
| `open` | `boolean` | `false` | Bindable open state |

#### `WithSidePanel`

Responsive two-column layout with collapsible side panel, resizable width, and mobile-aware slide transitions.

#### `Collapsible`

Expandable/collapsible content sections.

| Prop   | Type      | Default | Description         |
| ------ | --------- | ------- | ------------------- |
| `open` | `boolean` | `false` | Bindable open state |

#### `SlidingPanels`

Panel-based navigation with slide transitions.

#### `Nav`

Navigation wrapper component.

---

### Interactive

#### `Button`

Action button with intent/variant/size system.

| Prop        | Type                                                               | Default     | Description          |
| ----------- | ------------------------------------------------------------------ | ----------- | -------------------- |
| `intent`    | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | `"primary"` | Semantic color       |
| `variant`   | `"solid" \| "outline" \| "ghost" \| "soft" \| "link"`              | `"solid"`   | Visual treatment     |
| `size`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                             | `"md"`      | Button size          |
| `icon`      | `IconRenderFn`                                                     | `undefined` | Icon render function |
| `iconRight` | `IconRenderFn`                                                     | `undefined` | Right-side icon      |
| `loading`   | `boolean`                                                          | `false`     | Show loading spinner |
| `disabled`  | `boolean`                                                          | `false`     | Disable button       |

```svelte
<Button intent="primary" variant="solid" size="lg">Click me</Button>

<Button intent="destructive" variant="outline" icon={iconTrash}>Delete</Button>
```

#### `ButtonGroupRadio`

Toggle button group for single selection.

| Prop    | Type                      | Default | Description             |
| ------- | ------------------------- | ------- | ----------------------- |
| `value` | `string`                  | `""`    | Bindable selected value |
| `items` | `Array<{ value, label }>` | `[]`    | Options                 |

```svelte
<ButtonGroupRadio
	bind:value={selected}
	items={[
		{ value: "a", label: "Option A" },
		{ value: "b", label: "Option B" },
	]}
/>
```

#### `Switch`

Boolean toggle switch.

| Prop      | Type      | Default | Description            |
| --------- | --------- | ------- | ---------------------- |
| `checked` | `boolean` | `false` | Bindable checked state |

```svelte
<Switch bind:checked={enabled} />
```

#### `TwCheck`

Styled checkbox/radio replacement.

#### `DropdownMenu`

Popover-based dropdown menu.

#### `CommandMenu`

Keyboard-driven command palette (Ctrl+K style).

#### `TypeaheadInput`

Autocomplete input with async search support.

#### `ListItemButton`

Styled list item with interactive states.

---

### Form Fields

All form fields share common props:

| Prop       | Type      | Default     | Description        |
| ---------- | --------- | ----------- | ------------------ |
| `label`    | `string`  | `undefined` | Field label        |
| `error`    | `string`  | `undefined` | Error message      |
| `hint`     | `string`  | `undefined` | Help text          |
| `required` | `boolean` | `false`     | Required indicator |

#### `FieldInput`

Text input field with label, error, and hint support.

| Prop    | Type     | Default  | Description          |
| ------- | -------- | -------- | -------------------- |
| `value` | `string` | `""`     | Bindable input value |
| `type`  | `string` | `"text"` | Input type           |

```svelte
<FieldInput bind:value={name} label="Name" required />
```

#### `FieldTextarea`

Multi-line text input.

#### `FieldSelect`

Dropdown select field.

| Prop      | Type                      | Default | Description             |
| --------- | ------------------------- | ------- | ----------------------- |
| `value`   | `string`                  | `""`    | Bindable selected value |
| `options` | `Array<{ value, label }>` | `[]`    | Select options          |

#### `FieldCheckbox`

Checkbox field with label.

#### `FieldRadios`

Radio button group.

#### `FieldFile`

File upload input.

#### `FieldSwitch`

Form-wrapped switch toggle.

#### `FieldOptions`

Multi-select options field.

#### `FieldAssets`

File/asset management field with preview.

#### `FieldKeyValues`

Key-value pair editor.

#### `FieldInputLocalized`

Multi-language input field.

#### `FieldLikeButton`

Toggle button styled as a "like" action.

#### `FieldObject`

Dual-mode JSON object editor with pretty-print and raw edit modes. Validates JSON syntax, supports recursive depth display, auto-grow textarea, and form submission via hidden input.

| Prop       | Type                         | Default  | Description                    |
| ---------- | ---------------------------- | -------- | ------------------------------ |
| `value`    | `string`                     | `""`     | Bindable JSON string           |
| `name`     | `string`                     | required | Input name for form submission |
| `label`    | `SnippetWithId \| THC`       | —        | Label content                  |
| `required` | `boolean`                    | `false`  | Required indicator             |
| `disabled` | `boolean`                    | `false`  | Disable editing                |
| `validate` | `boolean \| ValidateOptions` | —        | Enable validation              |

```svelte
<FieldObject bind:value={jsonStr} name="metadata" label="Metadata" />
```

#### `Fieldset`

Form field grouping with legend.

#### `LoginForm`

Standalone login form with email/password fields, social login support, forgot password link, remember me checkbox, and client+server validation. Supports i18n via 16 translation keys.

| Prop               | Type                         | Default  | Description                                |
| ------------------ | ---------------------------- | -------- | ------------------------------------------ |
| `formData`         | `LoginFormData`              | empty    | Bindable form data                         |
| `onSubmit`         | `(data) => void`             | required | Submit callback                            |
| `isSubmitting`     | `boolean`                    | `false`  | Disables CTA during submission             |
| `errors`           | `LoginFormValidationError[]` | `[]`     | Field-specific server errors               |
| `error`            | `string`                     | —        | General error (renders alert above form)   |
| `onForgotPassword` | `() => void`                 | —        | Forgot password link (hidden if undefined) |
| `showRememberMe`   | `boolean`                    | `true`   | Show remember me checkbox                  |
| `compact`          | `boolean`                    | `false`  | Compact layout variant                     |
| `submitButton`     | `Snippet`                    | —        | Custom CTA section                         |
| `socialLogins`     | `Snippet`                    | —        | Social/OAuth buttons below form            |
| `footer`           | `Snippet`                    | —        | Content below form (e.g., sign-up links)   |
| `notifications`    | `NotificationsStack`         | —        | Route errors to notification system        |
| `t`                | `TranslateFn`                | built-in | Translation function                       |

```svelte
<LoginForm
	onSubmit={(data) => login(data)}
	onForgotPassword={() => goto("/forgot-password")}
>
	{#snippet socialLogins()}
		<Button variant="outline" onclick={loginWithGoogle}>Google</Button>
	{/snippet}
	{#snippet footer()}
		<p>Don't have an account? <a href="/register">Sign up</a></p>
	{/snippet}
</LoginForm>
```

#### `LoginFormModal`

Modal-wrapped login form with trigger support. Inherits all `LoginForm` props plus modal-specific options.

| Prop         | Type                  | Default    | Description               |
| ------------ | --------------------- | ---------- | ------------------------- |
| `title`      | `string`              | `"Log In"` | Modal title               |
| `visible`    | `boolean`             | `false`    | Bindable modal visibility |
| `trigger`    | `Snippet<[{ open }]>` | —          | Optional trigger element  |
| `classModal` | `string`              | —          | CSS class for Modal box   |
| `noXClose`   | `boolean`             | `false`    | Hide close button         |

**Methods:** `open(openerOrEvent?)`, `close()`

```svelte
<LoginFormModal onSubmit={handleLogin}>
	{#snippet trigger({ open })}
		<Button onclick={open}>Log In</Button>
	{/snippet}
</LoginFormModal>
```

---

### Feedback & Notifications

#### `Notifications`

Toast notification system.

```svelte
<script>
	import { Notifications, createNotificationsStore } from "@marianmeres/stuic";
	const notifications = createNotificationsStore();
</script>

<Notifications store={notifications} />

<Button onclick={() => notifications.add({ text: "Saved!", type: "success" })}>
	Notify
</Button>
```

#### `AlertConfirmPrompt`

Dialog factory for alert, confirm, and prompt dialogs.

#### `DismissibleMessage`

Closeable message banner with intent styling.

| Prop          | Type                                                               | Default     | Description       |
| ------------- | ------------------------------------------------------------------ | ----------- | ----------------- |
| `intent`      | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | `"primary"` | Semantic color    |
| `dismissible` | `boolean`                                                          | `true`      | Show close button |

```svelte
<DismissibleMessage intent="warning">Please review your changes.</DismissibleMessage>
```

#### `Progress`

Progress bar.

| Prop    | Type     | Default | Description              |
| ------- | -------- | ------- | ------------------------ |
| `value` | `number` | `0`     | Current progress (0-100) |

#### `Spinner`

Loading spinner indicator.

#### `Skeleton`

Loading placeholder with animation.

---

### E-commerce

#### `Cart`

Shopping cart component with quantity controls, pricing, and summary. Supports interactive (full cart), readonly (checkout summary), and compact (popover preview) modes.

| Prop               | Type                                | Default                       | Description                                                         |
| ------------------ | ----------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| `items`            | `CartComponentItem[]`               | required                      | Cart items to display                                               |
| `variant`          | `"default" \| "compact"`            | `"default"`                   | Layout variant. Compact is smaller, scrollable, implicitly readonly |
| `formatPrice`      | `(value: number) => string`         | `(v) => (v / 100).toFixed(2)` | Format numeric price for display                                    |
| `onQuantityChange` | `(id: string, qty: number) => void` | —                             | Called when quantity changes                                        |
| `onRemove`         | `(id: string) => void`              | —                             | Called when remove is clicked                                       |
| `noThumbnails`     | `boolean`                           | `false`                       | Hide all thumbnails                                                 |
| `readonly`         | `boolean`                           | `false`                       | Hide interactive controls                                           |
| `loading`          | `boolean`                           | `false`                       | Show loading skeleton                                               |
| `updatingItems`    | `Set<string>`                       | `new Set()`                   | Item IDs currently being updated (reduced opacity)                  |
| `t`                | `TranslateFn`                       | built-in                      | Translation function for i18n                                       |

**Snippets:**

| Snippet     | Params                                        | Description                  |
| ----------- | --------------------------------------------- | ---------------------------- |
| `thumbnail` | `{ item }`                                    | Override thumbnail rendering |
| `itemRow`   | `{ item, isUpdating, readonly, formatPrice }` | Override entire item row     |
| `summary`   | `{ items, total, itemCount, formatPrice }`    | Override summary section     |
| `empty`     | —                                             | Custom empty state           |
| `footer`    | `{ items, total, itemCount }`                 | Content after summary (CTAs) |

```svelte
<Cart
	{items}
	formatPrice={(v) => `$${(v / 100).toFixed(2)}`}
	onQuantityChange={handleQuantityChange}
	onRemove={handleRemove}
/>

<!-- Readonly mode (checkout summary) -->
<Cart {items} readonly formatPrice={(v) => `$${(v / 100).toFixed(2)}`} />

<!-- Compact variant (for popovers) -->
<Cart {items} variant="compact" formatPrice={(v) => `$${(v / 100).toFixed(2)}`}>
	{#snippet footer({ total, itemCount })}
		<a href="/cart">View Cart</a>
	{/snippet}
</Cart>
```

#### Checkout

Multi-step checkout flow with 14 sub-components: 10 atomic building blocks and 4 composite step pages.

**Atomic Components:**

##### `CheckoutProgress`

Step indicator with navigation for past steps.

| Prop          | Type                           | Default     | Description              |
| ------------- | ------------------------------ | ----------- | ------------------------ |
| `steps`       | `CheckoutStep[]`               | 4-step flow | Step definitions         |
| `currentStep` | `string`                       | required    | Active step ID           |
| `onNavigate`  | `(step: CheckoutStep) => void` | —           | Past step click callback |
| `separator`   | `Snippet \| string`            | `"→"`       | Step separator           |
| `t`           | `TranslateFn`                  | built-in    | Translation function     |

##### `CheckoutOrderSummary`

Price totals display (subtotal, shipping, tax, discount, total).

| Prop          | Type                        | Default              | Description                |
| ------------- | --------------------------- | -------------------- | -------------------------- |
| `totals`      | `CheckoutOrderTotals`       | required             | Price totals               |
| `hasShipping` | `boolean`                   | `true`               | Show shipping row          |
| `formatPrice` | `(value: number) => string` | `defaultFormatPrice` | Price formatter            |
| `row`         | `Snippet`                   | —                    | Custom row rendering       |
| `extraRows`   | `Snippet`                   | —                    | Extra content before total |

##### `CheckoutCartReview`

Readonly cart display with summary.

| Prop          | Type                        | Default              | Description        |
| ------------- | --------------------------- | -------------------- | ------------------ |
| `items`       | `CartComponentItem[]`       | required             | Cart items         |
| `formatPrice` | `(value: number) => string` | `defaultFormatPrice` | Price formatter    |
| `onEditCart`  | `() => void`                | —                    | Edit cart callback |
| `thumbnail`   | `Snippet`                   | —                    | Custom thumbnail   |
| `title`       | `Snippet \| string`         | `"Order Summary"`    | Header title       |

##### `CheckoutGuestForm`

Guest checkout form with email, name, phone, and optional B2B fields.

| Prop            | Type                                       | Default     | Description                |
| --------------- | ------------------------------------------ | ----------- | -------------------------- |
| `formData`      | `CheckoutCustomerFormData`                 | empty       | Bindable form data         |
| `onSubmit`      | `(data: CheckoutCustomerFormData) => void` | required    | Submit callback            |
| `isSubmitting`  | `boolean`                                  | `false`     | Disables CTA               |
| `errors`        | `CheckoutValidationError[]`                | `[]`        | Server validation errors   |
| `showB2bFields` | `boolean`                                  | `true`      | Show B2B section           |
| `fields`        | `object`                                   | all visible | Field visibility overrides |
| `validate`      | `(data) => CheckoutValidationError[]`      | —           | Custom validator           |

##### `CheckoutLoginForm`

Login form for checkout context. Wraps the standalone `LoginForm` component with checkout-specific i18n key mapping (`checkout.login.*` prefix).

| Prop               | Type                                    | Default  | Description              |
| ------------------ | --------------------------------------- | -------- | ------------------------ |
| `formData`         | `CheckoutLoginFormData`                 | empty    | Bindable login data      |
| `onSubmit`         | `(data: CheckoutLoginFormData) => void` | required | Submit callback          |
| `isSubmitting`     | `boolean`                               | `false`  | Disables CTA             |
| `errors`           | `CheckoutValidationError[]`             | `[]`     | Field errors             |
| `error`            | `string`                                | —        | General error message    |
| `onForgotPassword` | `() => void`                            | —        | Forgot password callback |
| `socialLogins`     | `Snippet`                               | —        | Social/OAuth buttons     |
| `footer`           | `Snippet`                               | —        | Content below form       |

##### `CheckoutGuestOrLoginForm`

Composite component combining guest and login forms with multiple display modes and optional modal login.

| Prop            | Type                                                    | Default    | Description                                |
| --------------- | ------------------------------------------------------- | ---------- | ------------------------------------------ |
| `guestForm`     | `object`                                                | —          | Guest form config (pass-through)           |
| `loginForm`     | `object`                                                | —          | Login form config (pass-through)           |
| `formMode`      | `"guest-only" \| "login-only" \| "tabbed" \| "stacked"` | `"tabbed"` | Display mode                               |
| `activeTab`     | `"guest" \| "login"`                                    | `"guest"`  | Bindable active tab                        |
| `loginModal`    | `object`                                                | —          | Open LoginFormModal instead of inline form |
| `heading`       | `Snippet \| string`                                     | —          | Heading above forms                        |
| `notifications` | `NotificationsStack`                                    | —          | Notifications integration                  |

When `loginModal` is provided, clicking the login tab opens a `LoginFormModal` instead of showing an inline login form. Accepts config: `title`, `classModal`, `classInner`, `classForm`, `noXClose`, `onClose`, `showRememberMe`.

##### `CheckoutAddressForm`

Address input fieldset with configurable required fields.

| Prop             | Type                        | Default                                  | Description                                |
| ---------------- | --------------------------- | ---------------------------------------- | ------------------------------------------ |
| `address`        | `CheckoutAddressData`       | empty                                    | Bindable address data                      |
| `label`          | `string`                    | `"address"`                              | Prefix for field IDs                       |
| `errors`         | `CheckoutValidationError[]` | `[]`                                     | Validation errors                          |
| `requiredFields` | `string[]`                  | name, street, city, postal_code, country | Required fields                            |
| `countryField`   | `Snippet`                   | —                                        | Custom country field (replaces text input) |

##### `CheckoutDeliveryOptions`

Delivery method radio selection with free shipping threshold logic.

| Prop          | Type                         | Default              | Description                             |
| ------------- | ---------------------------- | -------------------- | --------------------------------------- |
| `options`     | `CheckoutDeliveryOption[]`   | required             | Available delivery options              |
| `selectedId`  | `string`                     | —                    | Bindable selected option ID             |
| `onSelect`    | `(optionId: string) => void` | —                    | Selection callback                      |
| `subtotal`    | `number`                     | `0`                  | Order subtotal (for free shipping calc) |
| `isUpdating`  | `boolean`                    | `false`              | Reduced opacity during API calls        |
| `formatPrice` | `(value: number) => string`  | `defaultFormatPrice` | Price formatter                         |
| `option`      | `Snippet`                    | —                    | Custom option card                      |

##### `CheckoutOrderReview`

Full order review display with per-section edit callbacks.

| Prop                    | Type                        | Default              | Description            |
| ----------------------- | --------------------------- | -------------------- | ---------------------- |
| `order`                 | `CheckoutOrderData`         | required             | Order data             |
| `formatPrice`           | `(value: number) => string` | `defaultFormatPrice` | Price formatter        |
| `onEditItems`           | `() => void`                | —                    | Edit items callback    |
| `onEditShippingAddress` | `() => void`                | —                    | Edit shipping callback |
| `onEditBillingAddress`  | `() => void`                | —                    | Edit billing callback  |
| `onEditDelivery`        | `() => void`                | —                    | Edit delivery callback |

##### `CheckoutOrderConfirmation`

Order success screen with details and continue shopping CTA.

| Prop                 | Type                        | Default              | Description                |
| -------------------- | --------------------------- | -------------------- | -------------------------- |
| `order`              | `CheckoutOrderData`         | required             | Completed order            |
| `orderId`            | `string`                    | required             | Order ID for display       |
| `emailSent`          | `boolean`                   | `false`              | Show email confirmation    |
| `formatPrice`        | `(value: number) => string` | `defaultFormatPrice` | Price formatter            |
| `onContinueShopping` | `() => void`                | —                    | Continue shopping callback |

**Composite Step Components:**

##### `CheckoutReviewStep`

Cart review + guest/login forms in 2-column layout.

| Prop          | Type                                                    | Default              | Description                                                                              |
| ------------- | ------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `items`       | `CartComponentItem[]`                                   | required             | Cart items                                                                               |
| `guestForm`   | `object`                                                | —                    | Guest form config (`formData`, `onSubmit`, `isSubmitting`, `errors`)                     |
| `loginForm`   | `object`                                                | —                    | Login form config (`formData`, `onSubmit`, `isSubmitting`, `errors`, `onForgotPassword`) |
| `formMode`    | `"guest-only" \| "login-only" \| "tabbed" \| "stacked"` | `"tabbed"`           | Form display mode                                                                        |
| `onEditCart`  | `() => void`                                            | —                    | Edit cart callback                                                                       |
| `formatPrice` | `(v: number) => string`                                 | `defaultFormatPrice` | Price formatter                                                                          |
| `leftColumn`  | `Snippet`                                               | —                    | Override left column                                                                     |
| `rightColumn` | `Snippet`                                               | —                    | Override right column                                                                    |

##### `CheckoutShippingStep`

Shipping/billing addresses + delivery selection with sidebar summary.

| Prop                    | Type                       | Default  | Description                 |
| ----------------------- | -------------------------- | -------- | --------------------------- |
| `order`                 | `CheckoutOrderData`        | required | Order data for totals       |
| `deliveryOptions`       | `CheckoutDeliveryOption[]` | required | Available delivery options  |
| `shippingAddress`       | `CheckoutAddressData`      | —        | Bindable shipping address   |
| `billingAddress`        | `CheckoutAddressData`      | —        | Bindable billing address    |
| `billingSameAsShipping` | `boolean`                  | `true`   | Bindable toggle             |
| `selectedDeliveryId`    | `string`                   | —        | Bindable delivery selection |
| `onContinue`            | `() => void`               | —        | Continue callback           |
| `onBack`                | `() => void`               | —        | Back callback               |
| `countryField`          | `Snippet`                  | —        | Custom country field        |

##### `CheckoutConfirmStep`

Order review + place order CTA with sidebar summary.

| Prop                    | Type                        | Default  | Description                |
| ----------------------- | --------------------------- | -------- | -------------------------- |
| `order`                 | `CheckoutOrderData`         | required | Order to confirm           |
| `validationErrors`      | `CheckoutValidationError[]` | `[]`     | Validation errors          |
| `isValid`               | `boolean`                   | `true`   | Enable/disable place order |
| `isSubmitting`          | `boolean`                   | `false`  | Processing state           |
| `onPlaceOrder`          | `() => void`                | —        | Place order callback       |
| `onBack`                | `() => void`                | —        | Back callback              |
| `onEditItems`           | `() => void`                | —        | Edit items callback        |
| `onEditShippingAddress` | `() => void`                | —        | Edit shipping callback     |

##### `CheckoutCompleteStep`

Order confirmation with loading/error/success states.

| Prop                 | Type                | Default  | Description                   |
| -------------------- | ------------------- | -------- | ----------------------------- |
| `order`              | `CheckoutOrderData` | required | Completed order               |
| `orderId`            | `string`            | required | Order ID                      |
| `emailSent`          | `boolean`           | `false`  | Email confirmation flag       |
| `isLoading`          | `boolean`           | `false`  | Show loading skeleton         |
| `error`              | `string \| null`    | —        | Error message                 |
| `onContinueShopping` | `() => void`        | —        | Continue shopping callback    |
| `onReturnToCheckout` | `() => void`        | —        | Return callback (error state) |

All composite step components also accept `currentStep`, `steps`, `onStepNavigate` (for CheckoutProgress), and `t` (TranslateFn).

**Checkout Utilities:**

```ts
import {
	defaultFormatPrice, // (cents: number) => string — "12.99"
	validateEmail, // (email, t) => string | null
	validateAddress, // (address, prefix, t) => CheckoutValidationError[]
	validateCustomerForm, // (data, t) => CheckoutValidationError[]
	validateLoginForm, // (data, t) => CheckoutValidationError[]
	createEmptyAddress, // () => CheckoutAddressData
	createEmptyCustomerFormData, // () => CheckoutCustomerFormData
	createEmptyLoginFormData, // () => CheckoutLoginFormData
} from "@marianmeres/stuic";
```

**Checkout Types:**

```ts
import type {
	CheckoutStep,
	CheckoutAddressData,
	CheckoutCustomerFormData,
	CheckoutLoginFormData,
	CheckoutOrderLineItem,
	CheckoutOrderTotals,
	CheckoutDeliveryOption,
	CheckoutDeliverySnapshot,
	CheckoutOrderData,
	CheckoutValidationError,
} from "@marianmeres/stuic";
```

---

### Display

#### `Avatar`

User avatar with fallback to initials or icon.

| Prop   | Type     | Default     | Description                           |
| ------ | -------- | ----------- | ------------------------------------- |
| `src`  | `string` | `undefined` | Image source                          |
| `alt`  | `string` | `""`        | Alt text / name for initials fallback |
| `size` | `number` | `40`        | Size in pixels                        |

```svelte
<Avatar src="/photo.jpg" alt="John Doe" size={48} />
<Avatar alt="John Doe" />
<!-- Shows "JD" initials -->
```

#### `KbdShortcut`

Keyboard shortcut display.

```svelte
<KbdShortcut keys={["Ctrl", "K"]} />
```

#### `Carousel`

Image/content slider with scroll snap, keyboard navigation, wheel scroll, optional arrows, and active item tracking via IntersectionObserver.

| Prop                | Type                                              | Default     | Description                                        |
| ------------------- | ------------------------------------------------- | ----------- | -------------------------------------------------- |
| `items`             | `CarouselItem[]`                                  | required    | Array of carousel items                            |
| `itemsPerView`      | `number`                                          | `1`         | Number of items visible per view                   |
| `peekPercent`       | `number`                                          | `0`         | Percentage of next item to show as peek (0-50)     |
| `gap`               | `number \| string`                                | `undefined` | Gap between items                                  |
| `trackActive`       | `boolean`                                         | `false`     | Enable active item tracking                        |
| `syncActiveOnScroll`| `boolean`                                         | `false`     | Sync active item based on scroll position          |
| `activeIndex`       | `number`                                          | `0`         | Currently active item index (bindable)             |
| `value`             | `string \| number`                                | `undefined` | Currently active item ID (bindable)                |
| `snap`              | `boolean`                                         | `true`      | Enable scroll snap behavior                        |
| `snapAlign`         | `"start" \| "center" \| "end"`                    | `"start"`   | Snap alignment                                     |
| `keyboard`          | `boolean`                                         | `true`      | Enable keyboard navigation (arrows, Home, End)     |
| `loop`              | `boolean`                                         | `false`     | Allow cycling from last to first and vice versa    |
| `scrollBehavior`    | `ScrollBehavior`                                  | `"smooth"`  | Scroll behavior for programmatic navigation        |
| `scrollbar`         | `boolean`                                         | `true`      | Show scrollbar on hover                            |
| `wheelScroll`       | `boolean`                                         | `true`      | Enable horizontal scrolling via mouse wheel        |
| `arrows`            | `boolean`                                         | `false`     | Show prev/next arrow buttons                       |
| `minItemWidth`      | `number`                                          | `undefined` | Minimum item width (px) for auto-fit               |
| `onActiveChange`    | `(item: CarouselItem, index: number) => void`     | —           | Callback when active item changes                  |
| `renderItem`        | `Snippet<[{ item, index, active }]>`              | —           | Custom render snippet for items                    |

**Methods:** `goTo(index)`, `goToId(id)`, `next()`, `previous()`

```svelte
<Carousel
	items={slides}
	itemsPerView={3}
	gap={16}
	arrows
	trackActive
	syncActiveOnScroll
>
	{#snippet renderItem({ item, index, active })}
		<img src={item.data.src} alt={item.data.alt} />
	{/snippet}
</Carousel>
```

#### `AnimatedElipsis`

Animated loading dots ("...").

#### `IconSwap`

Swap visibility between N states with opacity transitions. Commonly used for hamburger/X icon toggle, but supports any content.

| Prop         | Type                       | Default  | Description                                       |
| ------------ | -------------------------- | -------- | ------------------------------------------------- |
| `states`     | `Array<string \| Snippet>` | required | Array of visual states (HTML strings or Snippets) |
| `active`     | `number`                   | `0`      | Index of the currently visible state (bindable)   |
| `duration`   | `number`                   | `300`    | Transition duration in ms                         |
| `easing`     | `string`                   | `"ease"` | CSS transition-timing-function                    |
| `stateClass` | `string`                   | —        | Additional CSS classes for each state wrapper     |

**CSS Variables:** `--stuic-icon-swap-duration`, `--stuic-icon-swap-easing`

```svelte
<script>
	import { IconSwap } from "@marianmeres/stuic";
	import { iconMenu, iconX } from "@marianmeres/stuic";
	let isOpen = $state(false);
</script>

<button onclick={() => (isOpen = !isOpen)}>
	<IconSwap active={isOpen ? 1 : 0} states={[iconMenu(), iconX()]} />
</button>
```

#### `DataTable`

Responsive data table with paging, row selection, batch actions, and mobile card view.

| Prop               | Type                                          | Default  | Description                                         |
| ------------------ | --------------------------------------------- | -------- | --------------------------------------------------- |
| `columns`          | `DataTableColumn<T>[]`                        | required | Column definitions                                  |
| `data`             | `T[]`                                         | required | Row data objects                                    |
| `getRowId`         | `(row: T, index: number) => string \| number` | index    | Unique row ID extractor                             |
| `paging`           | `PagingCalcResult`                            | —        | Paging calculation from `@marianmeres/paging-store` |
| `onPageChange`     | `(offset: number) => void`                    | —        | Page navigation callback                            |
| `selectable`       | `boolean`                                     | `false`  | Enable row selection checkboxes                     |
| `selected`         | `Set<string \| number>`                       | —        | Bindable set of selected row IDs                    |
| `selectOnRowClick` | `boolean`                                     | `false`  | Toggle selection on row click                       |
| `onRowClick`       | `(row: T, index: number) => void`             | —        | Row click callback                                  |
| `loading`          | `boolean`                                     | `false`  | Show loading overlay                                |
| `t`                | `TranslateFn`                                 | built-in | Translation function for i18n                       |

**Snippets:** `cell`, `batchActions`, `empty`, `mobileRow`

```svelte
<DataTable
	columns={[
		{ key: "name", label: "Name" },
		{ key: "email", label: "Email" },
		{ key: "role", label: "Role", align: "center" },
	]}
	data={users}
	selectable
	bind:selected={selectedIds}
/>
```

#### `ThemePreview`

Theme color swatch preview.

---

### Utility Components

#### `Book`

Interactive book/flipbook reader with 3D CSS page flip animation, zoom, pan, swipe, clickable areas, and responsive single-page mode.

| Prop             | Type                                                          | Default        | Description                                   |
| ---------------- | ------------------------------------------------------------- | -------------- | --------------------------------------------- |
| `pages`          | `BookPage[]`                                                  | required       | Ordered array of book pages                   |
| `baseUrl`        | `string`                                                      | `undefined`    | Fallback base URL for relative page src       |
| `activeSpread`   | `number`                                                      | `0`            | Currently active spread index (bindable)      |
| `keyboard`       | `boolean`                                                     | `true`         | Enable keyboard navigation                    |
| `swipe`          | `boolean`                                                     | `true`         | Enable swipe gesture navigation               |
| `duration`       | `number`                                                      | `500`          | Flip animation duration in ms                 |
| `zoom`           | `boolean`                                                     | `true`         | Enable zoom capability                        |
| `zoomLevels`     | `readonly number[]`                                           | `[1,1.5,2,3]`  | Discrete zoom levels                          |
| `clampPan`       | `boolean`                                                     | `false`        | Clamp panning within bounds                   |
| `singlePage`     | `boolean`                                                     | `false`        | Force single-page layout                      |
| `responsive`     | `boolean`                                                     | `true`         | Auto-switch to single-page when narrow        |
| `onSpreadChange` | `(spread: BookSpread, index: number) => void`                 | —              | Callback when active spread changes           |
| `onPageClick`    | `(data: { page: BookPage; x: number; y: number }) => void`   | —              | Callback on page click (coordinates 0–1)      |
| `onAreaClick`    | `(data: { area: BookPageArea; page: BookPage }) => void`      | —              | Callback when clickable area is clicked       |
| `renderPage`     | `Snippet<[{ page, position }]>`                               | —              | Custom page render snippet                    |

**Exported helpers:** `buildSpreads(pages)`, `buildSinglePageSpreads(pages)`, `buildSheets(spreads)`, `computeBookPageSize(pages)`

**Types:** `BookPage`, `BookPageArea`, `BookSpread`, `BookSheet`, `BookCollection`

```svelte
<Book
	pages={[
		{ id: 1, src: "/cover.jpg", width: 800, height: 1100 },
		{ id: 2, src: "/page1.jpg", width: 800, height: 1100 },
		{ id: 3, src: "/page2.jpg", width: 800, height: 1100 },
	]}
	bind:activeSpread
/>
```

#### `BookResponsive`

Responsive wrapper around Book that intelligently switches between book mode (dual/single-page) and an inline asset preview mode based on container width. Inherits all Book props except `responsive` and `singlePage` (managed internally).

| Prop              | Type                  | Default     | Description                                             |
| ----------------- | --------------------- | ----------- | ------------------------------------------------------- |
| `minPageWidth`    | `number`              | `150`       | Min page width (px) before switching to single-page     |
| `debounce`        | `number`              | `150`       | Resize debounce delay in ms                             |
| `inlineThreshold` | `number`              | `480`       | Container width (px) below which switches to inline (0 = disabled) |
| `forceInline`     | `boolean`             | `false`     | Force inline asset preview mode                         |
| `noPrevNext`      | `boolean`             | `false`     | Hide prev/next arrow buttons                            |
| `classControls`   | `string`              | `undefined` | Custom class for prev/next buttons                      |
| `noModeSwitch`    | `boolean`             | `false`     | Hide the book/inline toggle button                      |
| `initialMode`     | `"book" \| "inline"`  | `undefined` | Override auto-detection on mount                        |

**Exported utility:** `bookPagesToAssets(pages)` — Converts `BookPage[]` to `AssetPreview[]` for inline mode.

```svelte
<BookResponsive
	pages={bookPages}
	inlineThreshold={600}
	onAreaClick={handleAreaClick}
/>
```

#### `Circle`

SVG-based circular progress indicator with configurable stroke width and rotation.

| Prop          | Type     | Default | Description            |
| ------------- | -------- | ------- | ---------------------- |
| `value`       | `number` | `0`     | Progress value (0-100) |
| `strokeWidth` | `number` | `8`     | Stroke width           |

#### `H`

Semantic heading element (h1-h6) with separate visual and semantic levels.

| Prop          | Type  | Default     | Description                                  |
| ------------- | ----- | ----------- | -------------------------------------------- |
| `level`       | `1-6` | `2`         | Semantic heading level                       |
| `renderLevel` | `1-6` | `undefined` | Visual heading level (overrides visual size) |

#### `Separator`

Horizontal or vertical separator line with optional decorative `aria-hidden` mode.

| Prop          | Type                         | Default        | Description           |
| ------------- | ---------------------------- | -------------- | --------------------- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Separator orientation |

#### `ColorScheme`

Dark/light mode toggle management. Includes `ColorSchemeLocal` (localStorage-based) and `ColorSchemeSystemAware` (system preference sync).

#### `Thc`

Flexible content renderer that accepts text, HTML, components, or snippets (THC = Text/Html/Component).

#### `HoverExpandableWidth`

Element that expands width on hover with delayed transitions and shadow effects.

#### `AssetsPreview`

Modal-based asset/file preview gallery with zoom, pan, pinch-zoom, swipe navigation, clickable area overlays, and download controls. Opens in a full-screen ModalDialog.

| Prop              | Type                                                              | Default     | Description                                  |
| ----------------- | ----------------------------------------------------------------- | ----------- | -------------------------------------------- |
| `assets`          | `string[] \| AssetPreview[]`                                      | required    | Asset URLs or asset objects                  |
| `baseUrl`         | `string`                                                          | `undefined` | Fallback base URL for relative asset URLs    |
| `modalClassDialog`| `string`                                                          | `undefined` | CSS class for the modal dialog               |
| `modalClass`      | `string`                                                          | `undefined` | CSS class for the modal container            |
| `classControls`   | `string`                                                          | `undefined` | CSS class for control buttons                |
| `t`               | `TranslateFn`                                                     | built-in    | Translation function                         |
| `onDelete`        | `(asset: AssetPreview, index: number, { close }) => void`         | —           | Delete handler (shows delete button)         |
| `onAreaClick`     | `(data: { area: AssetArea; asset: AssetPreviewNormalized }) => void` | —        | Callback for clickable area on image         |
| `noName`          | `boolean`                                                         | `false`     | Hide file name display                       |
| `clampPan`        | `boolean`                                                         | `true`      | Clamp panning within image bounds            |
| `noDownload`      | `boolean`                                                         | `false`     | Hide download button                         |
| `noPrevNext`      | `boolean`                                                         | `false`     | Hide prev/next arrows                        |
| `noZoom`          | `boolean`                                                         | `false`     | Disable all zooming                          |
| `noZoomButtons`   | `boolean`                                                         | `false`     | Hide zoom buttons (gestures still work)      |
| `noDots`          | `boolean`                                                         | `false`     | Never show pagination dots                   |
| `noCurrentOfTotal`| `boolean`                                                         | `false`     | Never show "x / y" counter                   |

**Methods:** `open(index?)`, `close()`

**Types:** `AssetPreview`, `AssetPreviewUrlObj`, `AssetArea`

**Utility:** `getAssetIcon(ext)` — Returns icon function for file extension.

```svelte
<AssetsPreview
	assets={[
		{ url: { full: "/photo.jpg", thumb: "/photo-thumb.jpg" }, name: "Photo", type: "image/jpeg" },
		"/document.pdf",
	]}
	onDelete={(asset, i, { close }) => { deleteAsset(i); close(); }}
/>
```

#### `AssetsPreviewInline`

Always-visible (non-modal) variant of AssetsPreview with the same zoom, pan, swipe, and area clicking features. For embedding asset galleries directly in layouts.

| Prop              | Type                                                              | Default     | Description                                  |
| ----------------- | ----------------------------------------------------------------- | ----------- | -------------------------------------------- |
| `assets`          | `string[] \| AssetPreview[]`                                      | required    | Asset URLs or asset objects                  |
| `baseUrl`         | `string`                                                          | `undefined` | Fallback base URL for relative asset URLs    |
| `initialIndex`    | `number`                                                          | `0`         | Starting asset index                         |
| `currentIndex`    | `number`                                                          | `0`         | Current display index (bindable)             |
| `class`           | `string`                                                          | `undefined` | Container CSS class                          |
| `classControls`   | `string`                                                          | `undefined` | CSS class for control buttons                |
| `t`               | `TranslateFn`                                                     | built-in    | Translation function                         |
| `onDelete`        | `(asset, index, { close }) => void`                               | —           | Delete handler                               |
| `onAreaClick`     | `(data: { area: AssetArea; asset: AssetPreviewNormalized }) => void` | —        | Callback for clickable area on image         |
| `noName`          | `boolean`                                                         | `false`     | Hide file name display                       |
| `clampPan`        | `boolean`                                                         | `true`      | Clamp panning within bounds                  |
| `noDownload`      | `boolean`                                                         | `false`     | Hide download button                         |
| `noPrevNext`      | `boolean`                                                         | `false`     | Hide prev/next arrows                        |
| `noZoom`          | `boolean`                                                         | `false`     | Disable all zooming                          |
| `noZoomButtons`   | `boolean`                                                         | `false`     | Hide zoom buttons (gestures still work)      |
| `noDots`          | `boolean`                                                         | `false`     | Never show pagination dots                   |
| `noCurrentOfTotal`| `boolean`                                                         | `false`     | Never show "x / y" counter                   |

**Methods:** `goTo(index)`, `next()`, `previous()`

```svelte
<AssetsPreviewInline
	assets={imageUrls}
	bind:currentIndex
/>
```

#### `X`

Styled SVG close/multiply icon with configurable stroke width.

---

## Actions

Svelte use-directives for reusable DOM behavior. Import from `@marianmeres/stuic`.

### `validate`

Form field validation with i18n support.

```svelte
<input
	use:validate={() => ({
		enabled: true,
		customValidator: (value) => {
			if (!value) return "Required";
			if (value.length < 3) return "Min 3 characters";
		},
		setValidationResult: (result) => {
			validationState = result;
		},
	})}
/>
```

### `focusTrap`

Trap keyboard focus within an element (for modals/dialogs).

```svelte
<div use:focusTrap>
	<button>First</button>
	<button>Last</button>
</div>
```

### `autogrow`

Auto-resize textarea height to match content.

```svelte
<textarea use:autogrow />
```

### `autoscroll`

Auto-scroll a container to the bottom on content changes.

```svelte
<div use:autoscroll>
	{#each messages as msg}<p>{msg}</p>{/each}
</div>
```

### `dimBehind`

Dim everything behind a target element (simplified spotlight alternative).

```svelte
<div
	use:dimBehind={() => ({
		open: isDimmed,
		onHide: () => (isDimmed = false),
	})}
>
	Highlighted Element
</div>
```

### `fileDropzone`

Drag-and-drop file handling.

```svelte
<div
	use:fileDropzone={() => ({
		accept: "image/*",
		multiple: true,
		onDrop: (files) => handleFiles(files),
	})}
>
	Drop files here
</div>
```

### `highlightDragover`

Visual feedback (class toggle) on drag-over.

```svelte
<div use:highlightDragover>Drop target</div>
```

### `resizableWidth`

Make an element's width draggable.

```svelte
<div use:resizableWidth={() => ({ minWidth: 200, maxWidth: 600 })}>Resizable</div>
```

### `trim`

Auto-trim whitespace from input values.

```svelte
<input use:trim />
```

### `typeahead`

Advanced autocomplete behavior for inputs.

### `onSubmitValidityCheck`

Form-level submit validation.

```svelte
<form use:onSubmitValidityCheck>
	<input required />
	<button type="submit">Submit</button>
</form>
```

### `popover`

Anchored popover positioning.

```svelte
<button use:popover={{ content: "Popover text" }}> Hover me </button>
```

### `spotlight`

Spotlight/coach mark overlay that highlights a target element by dimming everything else behind a backdrop with a cutout hole. Includes built-in annotation support positioned next to the target.

**Options:**

| Option                 | Type                | Default     | Description                                                      |
| ---------------------- | ------------------- | ----------- | ---------------------------------------------------------------- |
| `enabled`              | `boolean`           | `true`      | Whether the spotlight is enabled                                 |
| `content`              | `THC \| null`       | `undefined` | Annotation content (string, {html}, {component, props}, snippet) |
| `position`             | `SpotlightPosition` | `"bottom"`  | Annotation placement relative to target                          |
| `padding`              | `number`            | `8`         | Padding around target in the cutout (px)                         |
| `borderRadius`         | `number`            | `8`         | Border radius of the cutout hole (px)                            |
| `class`                | `string`            | `undefined` | Custom class for annotation                                      |
| `classBackdrop`        | `string`            | `undefined` | Custom class for backdrop                                        |
| `offset`               | `string`            | `"0.5rem"`  | Annotation offset from target (CSS value)                        |
| `closeOnEscape`        | `boolean`           | `true`      | Close on Escape key                                              |
| `closeOnBackdropClick` | `boolean`           | `true`      | Close on backdrop click                                          |
| `scrollIntoView`       | `boolean`           | `true`      | Scroll target into view before showing                           |
| `open`                 | `boolean`           | `undefined` | Reactive programmatic control                                    |
| `id`                   | `string`            | `undefined` | ID for registry-based control                                    |
| `onShow`               | `() => void`        | `undefined` | Callback when spotlight opens                                    |
| `onHide`               | `() => void`        | `undefined` | Callback when spotlight hides                                    |

**Registry functions:**

- `showSpotlight(id)` — Show a spotlight by ID
- `hideSpotlight(id)` — Hide a spotlight by ID
- `isSpotlightOpen(id)` — Check if a spotlight is open

```svelte
<script>
	import { spotlight, showSpotlight } from "@marianmeres/stuic";
</script>

<!-- Attach to target, control via registry -->
<div
	use:spotlight={() => ({
		content: "Check out this feature!",
		position: "bottom",
		id: "intro",
	})}
>
	Target
</div>

<button onclick={() => showSpotlight("intro")}>Show</button>

<!-- Or control via reactive open prop -->
<div
	use:spotlight={() => ({
		content: { html: "<p>Step 1 of 3</p>" },
		open: tourStep === 1,
		onHide: () => {
			tourStep = 0;
		},
	})}
>
	Tour Target
</div>
```

### `tooltip`

Tooltip display from `aria-label`.

```svelte
<button use:tooltip aria-label="Save changes"> Save </button>
```

---

## Utilities

Import from `@marianmeres/stuic`.

### Reactive State

#### `localStorageState(key, initial)`

Persist reactive state to localStorage.

**Parameters:**

- `key` (string) — Storage key
- `initial` (T) — Initial value

**Returns:** `{ value: T }` — Reactive state object

```ts
import { localStorageState } from "@marianmeres/stuic";
let theme = localStorageState("theme", "light");
theme.value = "dark"; // Persisted and reactive
```

#### `sessionStorageState(key, initial)`

Same as `localStorageState` but uses sessionStorage.

#### `breakpoint()`

Reactive responsive breakpoint detection.

```ts
import { breakpoint } from "@marianmeres/stuic";
let bp = breakpoint();
// bp.current — "sm" | "md" | "lg" | "xl" | "2xl"
```

#### `devicePointer()`

Detect pointer type (mouse/touch).

#### `prefersReducedMotion()`

Detect user's reduced motion preference.

#### `observeExists(selector)`

Reactively observe whether a DOM element matching a selector exists.

#### `inputHistory(initial)`

Input undo/redo history manager.

#### `switchState(initial)`

Toggle state factory.

### DOM

#### `qsa(selector, parent?)`

Type-safe `querySelectorAll` wrapper.

**Parameters:**

- `selector` (string) — CSS selector
- `parent` (Element, optional) — Parent element. Default: `document`

**Returns:** `Element[]`

#### `bodyScrollLocker`

Lock/unlock body scroll (for modals).

```ts
import { bodyScrollLocker } from "@marianmeres/stuic";
bodyScrollLocker.lock();
bodyScrollLocker.unlock();
```

#### `anchorName(prefix?)`

Generate CSS anchor-positioning names.

#### `getId(prefix?)`

Generate unique DOM IDs.

### String & Data

#### `ucfirst(str)`

Capitalize first letter.

#### `nl2br(str)`

Convert newlines to `<br>` tags.

#### `unaccent(str)`

Remove diacritics from string.

#### `escapeRegex(str)`

Escape regex special characters.

#### `strHash(str)`

Simple string hash function.

#### `tr(key, translations, params?)`

Simple i18n translation helper.

```ts
import { tr } from "@marianmeres/stuic";
const t = tr("greeting", { en: "Hello {name}", sk: "Ahoj {name}" }, { name: "World" });
```

#### `replaceMap(str, map)`

Bulk string replacement.

### Functions

#### `debounce(fn, delay)`

Debounce function calls.

**Parameters:**

- `fn` (Function) — Function to debounce
- `delay` (number) — Delay in milliseconds

**Returns:** Debounced function with `.cancel()` method

```ts
import { debounce } from "@marianmeres/stuic";
const search = debounce((q: string) => fetchResults(q), 300);
```

#### `throttle(fn, delay)`

Throttle function calls.

#### `sleep(ms)`

Promise-based delay.

```ts
import { sleep } from "@marianmeres/stuic";
await sleep(1000);
```

#### `seconds(n)`

Convert seconds to milliseconds.

#### `eventEmitter()`

Pub/sub event pattern.

```ts
import { eventEmitter } from "@marianmeres/stuic";
const emitter = eventEmitter();
emitter.on("change", (data) => console.log(data));
emitter.emit("change", { value: 42 });
```

#### `eventModifiers`

Keyboard/mouse event helpers (e.g., `onEnter`, `onEscape`).

### Type Checks

#### `isNullish(value)`

Check if value is `null` or `undefined`.

#### `isPlainObject(value)`

Check if value is a plain object.

#### `isImage(file)`

Check if a file is an image (by MIME type or extension).

#### `isBrowser`

Boolean — `true` in browser environment.

#### `isMac`

Boolean — `true` on macOS.

### Data Handling

#### `maybeJsonParse(str)`

Safe `JSON.parse` — returns `undefined` on failure instead of throwing.

#### `maybeJsonStringify(value)`

Safe `JSON.stringify`.

#### `toInteger(value, fallback?)`

Safe integer conversion.

#### `omit(obj, keys)`

Omit keys from object.

#### `pick(obj, keys)`

Pick keys from object.

### Visual

#### `twMerge(...classes)`

Tailwind-aware class merging. Handles conflicts correctly.

```ts
import { twMerge } from "@marianmeres/stuic";
twMerge("px-4 py-2", "px-6"); // => "py-2 px-6"
```

#### `colors`

Color manipulation utilities.

#### `avatarColors(name)`

Generate deterministic avatar colors from a name string.

#### `paint(hue)`

HSL color generation.

#### `svgCircle(radius, strokeWidth)`

Generate SVG circle path data.

#### `oscillate(min, max, step)`

Value oscillation for animations.

### URL

#### `resolveUrl(url, baseUrl?)`

Resolve a possibly relative URL against an optional base URL. Returns the original URL if no baseUrl or on error.

**Parameters:**

- `url` (string) — URL to resolve
- `baseUrl` (string, optional) — Base URL to resolve against

**Returns:** `string`

```ts
import { resolveUrl } from "@marianmeres/stuic";
resolveUrl("images/photo.jpg", "https://example.com/books/1/");
// => "https://example.com/books/1/images/photo.jpg"
```

#### `resolveSrcset(srcset, baseUrl?)`

Resolve all URLs within a srcset string against an optional base URL.

**Parameters:**

- `srcset` (string) — Srcset string with relative URLs
- `baseUrl` (string, optional) — Base URL to resolve against

**Returns:** `string`

### Files

#### `fileFromBlobUrl(blobUrl, filename)`

Convert a blob URL to a File object.

#### `forceDownload(url, filename)`

Trigger browser file download.

#### `preloadImg(src)`

Preload an image and return a Promise.

#### `getFileTypeLabel(filename)`

Human-readable file type label from filename.

### Design Tokens

#### `generateThemeCss(schema, prefix?)`

Generate a complete CSS string for a theme, including both light and dark mode blocks.

**Parameters:**

- `schema` (ThemeSchema) — Theme definition with `light` and optional `dark` modes
- `prefix` (string, optional) — CSS variable prefix. Default: `"stuic-"`

**Returns:** `string` — Complete CSS with `:root {}` and `:root.dark {}` blocks

**Example:**

```ts
import type { ThemeSchema } from "@marianmeres/stuic";
import { generateThemeCss } from "@marianmeres/stuic";
import stone from "@marianmeres/stuic/themes/stone";

const custom: ThemeSchema = {
	light: {
		...stone.light,
		colors: {
			...stone.light.colors,
			intent: {
				...stone.light.colors.intent,
				primary: { DEFAULT: "#3b82f6", foreground: "#ffffff", hover: "#2563eb" },
			},
		},
	},
	dark: stone.dark,
};

const css = generateThemeCss(custom);
```

#### `generateCssTokens(schema, prefix?, mode?)`

Lower-level function: convert a single `TokenSchema` to a token record.

**Parameters:**

- `schema` (TokenSchema) — Single-mode schema (light or dark)
- `prefix` (string, optional) — CSS variable prefix. Default: `"stuic-"`
- `mode` (`"light" | "dark"`, optional) — Affects surface-intent derivation. Default: `"light"`

**Returns:** `GeneratedTokens` — `Record<string, string>` of CSS custom property names to values

#### `toCssString(tokens, selector?)`

Format a token record as a CSS selector block.

**Parameters:**

- `tokens` (GeneratedTokens) — Token record from `generateCssTokens`
- `selector` (string, optional) — CSS selector. Default: `":root"`

**Returns:** `string` — CSS block string

#### `createDarkOverride(baseTokens, overrides)`

Create a filtered dark mode token set from base tokens and overrides.

**Parameters:**

- `baseTokens` (GeneratedTokens) — Light mode tokens (used as key filter)
- `overrides` (Partial\<GeneratedTokens\>) — Dark mode values

**Returns:** `GeneratedTokens`

---

## Icons

Re-exported icon render functions from `@marianmeres/icons-fns`. Import from `@marianmeres/stuic`.

### File Type Icons

`iconFile`, `iconFileBinary`, `iconFileCode`, `iconFileImage`, `iconFileMusic`, `iconFilePdf`, `iconFileRichtext`, `iconFileSlides`, `iconFileSpreadsheet`, `iconFileText`, `iconFileWord`, `iconFileZip`

### Book Icons

`iconBookOpen`

### Alert Icons

`iconAlertSuccess`, `iconAlertInfo`, `iconAlertError`, `iconAlertWarning`, `iconRefresh`

### Action Icons

`iconArrowDown`, `iconArrowLeft`, `iconArrowRight`, `iconArrowUp`, `iconDownload`, `iconMinus`, `iconPlus`, `iconTrash`, `iconZoomIn`, `iconZoomOut`

### UI Control Icons

`iconCheck`, `iconChevronDown`, `iconChevronLeft`, `iconChevronRight`, `iconChevronUp`, `iconCircle`, `iconCircleCheckBig`, `iconDot`, `iconEllipsisVertical`, `iconGrip`, `iconGripHorizontal`, `iconGripVertical`, `iconLanguages`, `iconMenu`, `iconPencil`, `iconSearch`, `iconSettings`, `iconSquare`, `iconUser`, `iconX`

### Brand Icons

`iconApple`, `iconFacebook`, `iconGithub`, `iconGoogle`, `iconInstagram`, `iconMicrosoft`, `iconTwitterX`, `iconXbox`, `iconYoutube`

---

## Types

All components export their Props type:

```ts
import type {
	ButtonProps,
	ModalProps,
	FieldInputProps,
	ListItemButtonProps,
} from "@marianmeres/stuic";
```

Naming pattern: `{ComponentName}Props`

Additional exported types include:

- `BookPage`, `BookPageArea`, `BookSpread`, `BookSheet`, `BookCollection` — Book component types
- `AssetPreview`, `AssetPreviewUrlObj`, `AssetArea` — AssetPreview types
- `CarouselItem` — Carousel item type
- `LoginFormData`, `LoginFormValidationError` — Login form types
- `CartComponentItem`, `CartVariant` — Cart component types
- `CheckoutStep`, `CheckoutAddressData`, `CheckoutCustomerFormData`, `CheckoutLoginFormData`, `CheckoutOrderLineItem`, `CheckoutOrderTotals`, `CheckoutDeliveryOption`, `CheckoutDeliverySnapshot`, `CheckoutOrderData`, `CheckoutValidationError`, `CheckoutFormMode` — Checkout types
- `DataTableColumn` — DataTable column definition type
- `FieldAsset`, `FieldAssetUrlObj`, `FieldAssetWithBlobUrl` — Asset field types
- `FieldOption` — Option type for FieldOptions
- `KeyValueEntry` — Entry type for FieldKeyValues
- `ButtonVariant`, `ButtonSize` — Button enum types

### Theme Types

```ts
import type {
	ThemeSchema, // { light: TokenSchema; dark?: TokenSchema }
	TokenSchema, // Core schema for a single mode (light or dark)
	ColorPair, // { DEFAULT, foreground, hover?, active?, foregroundHover?, foregroundActive? }
	ColorValue, // { DEFAULT, hover?, active? }
	SingleColor, // string | ColorValue
	IntentColorKey, // "primary" | "accent" | "destructive" | "warning" | "success"
	RolePairedKey, // "background" | "surface" | "muted"
	RoleSingleKey, // "foreground" | "border" | "input" | "ring"
	GeneratedTokens, // Record<string, string>
} from "@marianmeres/stuic";
```

---

## Design Tokens

### Global Theme Tokens

Defined in theme CSS files (`src/lib/themes/css/`). Override in `:root {}`.

#### Intent Colors

Each intent (`primary`, `accent`, `destructive`, `warning`, `success`) provides:

| Token                                      | Purpose              |
| ------------------------------------------ | -------------------- |
| `--stuic-color-{intent}`                   | Base color           |
| `--stuic-color-{intent}-hover`             | Hover state          |
| `--stuic-color-{intent}-active`            | Active/pressed state |
| `--stuic-color-{intent}-foreground`        | Text on base         |
| `--stuic-color-{intent}-foreground-hover`  | Text on hover        |
| `--stuic-color-{intent}-foreground-active` | Text on active       |

#### Surface Intent Colors

Derived via `color-mix()` for callouts/alerts:

| Token                                       | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `--stuic-color-surface-{intent}`            | 15% tint of intent on background |
| `--stuic-color-surface-{intent}-foreground` | Contrast text                    |
| `--stuic-color-surface-{intent}-border`     | 30% tint border                  |

#### Role Colors

| Token                      | Purpose         | Variants                           |
| -------------------------- | --------------- | ---------------------------------- |
| `--stuic-color-background` | Page background | `-hover`, `-active`, `-foreground` |
| `--stuic-color-surface`    | Cards, modals   | `-hover`, `-active`, `-foreground` |
| `--stuic-color-surface-1`  | Deeper surface  | `-hover`, `-active`, `-foreground` |
| `--stuic-color-muted`      | De-emphasized   | `-hover`, `-active`, `-foreground` |
| `--stuic-color-foreground` | Default text    | `-hover`, `-active`                |
| `--stuic-color-border`     | Default borders | `-hover`, `-active`                |
| `--stuic-color-input`      | Form field bg   | `-hover`, `-active`                |
| `--stuic-color-ring`       | Focus ring      |                                    |

### Component Tokens

Each component defines customization tokens. Override globally in `:root {}` or locally via `style` attribute.

| Component          | Prefix                          | Key Tokens                                                                                                                                                                                                                    |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button             | `--stuic-button-*`              | `bg`, `text`, `border`, `ring-color`, `radius`, `padding-x-{size}`                                                                                                                                                            |
| Switch             | `--stuic-switch-*`              | `accent`                                                                                                                                                                                                                      |
| Input              | `--stuic-input-*`               | `accent`, `accent-error`                                                                                                                                                                                                      |
| Progress           | `--stuic-progress-*`            | `bg`, `accent`                                                                                                                                                                                                                |
| ListItemButton     | `--stuic-list-item-button-*`    | `bg`, `text`, `border`, `bg-hover`, `text-hover`                                                                                                                                                                              |
| ButtonGroupRadio   | `--stuic-button-group-*`        | `bg`, `text`, `border`, `accent`, `bg-active`, `text-active`                                                                                                                                                                  |
| TabbedMenu         | `--stuic-tabbed-menu-*`         | `tab-bg`, `tab-text`, `tab-bg-active`, `tab-text-active`, `border`                                                                                                                                                            |
| DismissibleMessage | `--stuic-dismissible-message-*` | `bg`, `text`, `border`                                                                                                                                                                                                        |
| Notifications      | `--stuic-notification-*`        | `bg`, `text`, `border`                                                                                                                                                                                                        |
| Tooltip            | `--stuic-tooltip-*`             | `bg`, `text`                                                                                                                                                                                                                  |
| Popover            | `--stuic-popover-*`             | `bg`, `text`, `border`                                                                                                                                                                                                        |
| Skeleton           | `--stuic-skeleton-*`            | `bg`, `bg-highlight`, `duration`                                                                                                                                                                                              |
| Spotlight          | `--stuic-spotlight-*`           | `backdrop-bg`, `annotation-bg`, `annotation-text`, `annotation-border`                                                                                                                                                        |
| Cart               | `--stuic-cart-*`                | `gap`, `item-padding`, `item-radius`, `item-border-color`, `item-bg`, `thumbnail-size`, `quantity-border-color`, `remove-color`, `summary-border-color`, `compact-max-height`, `transition`                                   |
| LoginForm          | `--stuic-login-form-*`          | `gap`, `gap-row`, `forgot-margin-y`, `forgot-margin-x`, `social-margin-top`, `social-gap`, `social-divider-color`, `social-divider-font-size`, `social-divider-margin-bottom`                                                 |
| Checkout           | `--stuic-checkout-*`            | `input-border`, `input-bg`, `input-focus-ring`, `input-radius`, `card-border`, `card-bg`, `card-radius`, `step-gap`, `progress-*`, `summary-*`, `guest-*`, `login-*`, `address-*`, `delivery-*`, `review-*`, `confirmation-*` |

### CSS Variable Naming Convention

```
--stuic-{component}-{element?}-{property}-{state?}
```

| Segment   | Examples                                                             |
| --------- | -------------------------------------------------------------------- |
| component | `button`, `list-item-button`, `modal` (full names, no abbreviations) |
| element   | `track`, `thumb`, `icon` (optional)                                  |
| property  | `bg`, `text`, `border`, `ring`, `shadow`, `radius`, `padding`        |
| state     | `hover`, `active`, `focus`, `disabled`, `error`                      |

### Available Themes (29)

Default theme: `stone`.

```ts
// Import pre-built CSS
import "@marianmeres/stuic/themes/css/blue-orange.css";

// Import theme definition object (to extend/customize)
import stone from "@marianmeres/stuic/themes/stone";
```

stone, gray, zinc, dds, blue-orange, cyan-red, cyan-slate, emerald-amber-forest, emerald-pink, fuchsia-emerald, indigo-amber, lime-fuchsia-neon, orange-pink-sunset, pink-emerald, pink-teal, purple-yellow, rainbow, red-blue, red-cyan, red-sky, red-sky-slate, rose-teal, sky-amber, slate-cyan, slate-teal-ocean, stone-orange-earth, teal-rose, violet-lime, violet-rose-dusk

### Dark Mode

Dark mode is controlled by adding `class="dark"` to the `<html>` element. Theme tokens automatically switch values. No `dark:` Tailwind prefix needed.

```css
/* Override dark mode tokens */
:root.dark {
	--stuic-color-background: var(--color-stone-900);
	--stuic-color-foreground: var(--color-stone-50);
}
```
