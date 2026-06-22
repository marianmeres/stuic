# ContactUsForm

Drop-in "contact us" form built from the STUIC `Field*` primitives. Same conventions as [`RegisterForm`](../RegisterForm/README.md): bindable `formData`, an `onSubmit` callback, inline + server validation, i18n via `t`, optional `notifications`, declarative `extraFields`, and an `extraFieldsSlot` escape hatch.

By default it renders the **absolute minimum** — an **Email** and a **Message** field — and everything else is opt-in via `show*` toggles, `extraFields`, or the slot. There are **no server wirings**: you get the data (and the bot signals) in `onSubmit` and decide what to do with them.

## Bot protection

Two **client-side, server-less** anti-bot primitives are rendered by default and reused from the Input package — [`Honeypot`](../Input/README.md#honeypot--time-trap-anti-bot-primitives) and [`TimeTrap`](../Input/README.md#honeypot--time-trap-anti-bot-primitives):

- **Honeypot** — a hidden field real users never see; a non-empty value means a bot filled it.
- **TimeTrap** — flags submits that arrive faster than a human plausibly could (`timeTrapMinMs`, default 2000).

These are **report-only**: the form **never blocks** a submit because of them. Instead it hands you a `botCheck` object as the **second argument** to `onSubmit` — you enforce server-side (drop / rate-limit / queue for review). This is the right division of labor for a server-less component: the library provides the signals, your backend decides. For hard protection against targeted bots in 2026 you still want a real challenge (Cloudflare Turnstile / hCaptcha) verified on your server — render its widget through the `extraFieldsSlot`.

## Exports

| Export                       | Kind      | Description                                                |
| ---------------------------- | --------- | ---------------------------------------------------------- |
| `ContactUsForm`              | component | The form component                                         |
| `ContactUsFormProps`         | type      | Props for `ContactUsForm`                                  |
| `ContactFormData`            | type      | `{ name, email, phone, subject, company, message, extra }` |
| `ContactBotCheck`            | type      | Anti-bot signals passed as the 2nd `onSubmit` arg          |
| `ContactFormValidationError` | type      | `{ field, message }`                                       |
| `ContactFieldConfig`         | type      | Declarative extra-field descriptor                         |
| `createEmptyContactFormData` | function  | Factory for an empty `ContactFormData`                     |
| `ValidateContactFormOptions` | type      | Options accepted by the internal validator                 |

## `ContactBotCheck`

```ts
interface ContactBotCheck {
	honeypot: string; // raw honeypot value ("" = clean)
	honeypotFilled: boolean; // true when the trap was filled
	elapsedMs: number; // ms between form mount and submit
	isTooFast: boolean; // elapsedMs < minMs
	minMs: number; // the configured timeTrapMinMs
	isLikelyBot: boolean; // honeypotFilled || isTooFast
}
```

## `ContactFieldConfig`

```ts
interface ContactFieldConfig {
	name: string; // unique key under formData.extra
	label: string; // already-translated
	type?: "text" | "email" | "tel" | "url" | "number";
	placeholder?: string;
	required?: boolean;
	autocomplete?: HTMLInputAttributes["autocomplete"];
	initialValue?: unknown;
	validate?: (value: unknown, data: ContactFormData) => string | undefined;
	position?: "top" | "bottom"; // default "bottom"
	props?: Record<string, unknown>; // passthrough to FieldInput
}
```

## Props

| Prop                 | Type                                                         | Default  | Description                                                                                                         |
| -------------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `formData`           | `ContactFormData`                                            | empty    | Bindable form data.                                                                                                 |
| `onSubmit`           | `(data: ContactFormData, botCheck: ContactBotCheck) => void` | required | Called after client-side validation passes. `botCheck` is report-only.                                              |
| `isSubmitting`       | `boolean`                                                    | `false`  | Disables the CTA during submission.                                                                                 |
| `errors`             | `ContactFormValidationError[]`                               | `[]`     | Field-specific server errors (merged with internal validation).                                                     |
| `error`              | `string`                                                     | -        | General error rendered as a `DismissibleMessage` above the form.                                                    |
| `showName`           | `boolean`                                                    | `false`  | Render the Name field.                                                                                              |
| `requireName`        | `boolean`                                                    | `true`   | Require Name (only applies when shown).                                                                             |
| `showPhone`          | `boolean`                                                    | `false`  | Render the Phone field.                                                                                             |
| `requirePhone`       | `boolean`                                                    | `false`  | Require Phone (only applies when shown).                                                                            |
| `showSubject`        | `boolean`                                                    | `false`  | Render the Subject field (free text).                                                                               |
| `requireSubject`     | `boolean`                                                    | `false`  | Require Subject (only applies when shown).                                                                          |
| `subjectValues`      | `string[]`                                                   | -        | If set, Subject renders as a `<select>` of these values (and is auto-shown). A blank "Select…" prompt is prepended. |
| `showCompany`        | `boolean`                                                    | `false`  | Render the Company field.                                                                                           |
| `requireCompany`     | `boolean`                                                    | `false`  | Require Company (only applies when shown).                                                                          |
| `messageMinLength`   | `number`                                                     | `0`      | Minimum message length. `0` disables the check.                                                                     |
| `extraFields`        | `ContactFieldConfig[]`                                       | `[]`     | Declarative extra fields, positioned top or bottom.                                                                 |
| `extraFieldsSlot`    | `Snippet<[{ formData, fieldError }]>`                        | -        | Escape hatch for non-FieldInput extras (consent checkbox, captcha widget).                                          |
| `useHoneypot`        | `boolean`                                                    | `true`   | Render the hidden honeypot trap.                                                                                    |
| `honeypotName`       | `string`                                                     | `"link"` | Honeypot field name. Avoid browser-autofill tokens (`url`/`name`/`email`/…).                                        |
| `useTimeTrap`        | `boolean`                                                    | `true`   | Render the time-trap.                                                                                               |
| `timeTrapMinMs`      | `number`                                                     | `2000`   | Minimum plausible human fill time (ms).                                                                             |
| `submitLabel`        | `string`                                                     | i18n     | Override the CTA label.                                                                                             |
| `submittingLabel`    | `string`                                                     | i18n     | Override the CTA label while submitting.                                                                            |
| `submitButton`       | `Snippet<[{ isSubmitting, disabled }]>`                      | -        | Override the entire CTA section.                                                                                    |
| `footer`             | `Snippet`                                                    | -        | Content below the form.                                                                                             |
| `notifications`      | `NotificationsStack`                                         | -        | When set, general errors are also pushed via `notifications.error()`.                                               |
| `t`                  | `TranslateFn`                                                | English  | i18n function.                                                                                                      |
| `unstyled` / `class` | -                                                            | -        | Standard styling escape hatches.                                                                                    |
| `el`                 | `HTMLFormElement`                                            | -        | Bindable form element.                                                                                              |

### Imperative methods (via `bind:this`)

| Method                      | Returns   | Purpose                                                             |
| --------------------------- | --------- | ------------------------------------------------------------------- |
| `validate()`                | `boolean` | Forces every visible field's validator to run. `true` if all valid. |
| `scrollToFirstError(opts?)` | `boolean` | Scrolls + focuses the first invalid field. Call after `validate()`. |

## Usage

### Basic (Email + Message only)

```svelte
<script lang="ts">
	import { ContactUsForm } from "@marianmeres/stuic";

	async function send(data, botCheck) {
		// Enforce the bot signals on YOUR server — the form never blocks.
		await fetch("/api/contact", {
			method: "POST",
			body: JSON.stringify({ ...data, botCheck }),
		});
	}
</script>

<ContactUsForm onSubmit={send} />
```

### Standard layout (Name + Subject)

```svelte
<ContactUsForm onSubmit={send} showName showSubject requireSubject />
```

### Subject as a dropdown

Pass `subjectValues` to render the Subject as a `<select>` (the field is shown
automatically; the bound value is still the chosen string in `formData.subject`).

```svelte
<ContactUsForm
	onSubmit={send}
	requireSubject
	subjectValues={["General enquiry", "Sales", "Support", "Feedback"]}
/>
```

### Reacting to the bot signals

```svelte
<script lang="ts">
	import { ContactUsForm } from "@marianmeres/stuic";

	function onSubmit(data, botCheck) {
		if (botCheck.isLikelyBot) {
			// Silently accept on the client so bots don't learn; drop on the server.
			console.warn("likely bot", botCheck);
		}
		send(data, botCheck);
	}
</script>

<ContactUsForm {onSubmit} timeTrapMinMs={3000} />
```

### With a consent checkbox (extraFieldsSlot)

```svelte
<script lang="ts">
	import { ContactUsForm, FieldCheckbox } from "@marianmeres/stuic";

	let formData = $state({
		name: "",
		email: "",
		phone: "",
		subject: "",
		company: "",
		message: "",
		extra: { consent: false },
	});
</script>

<ContactUsForm bind:formData onSubmit={send}>
	{#snippet extraFieldsSlot({ formData, fieldError })}
		<FieldCheckbox
			bind:checked={formData.extra.consent}
			label="I agree to be contacted"
			error={fieldError("consent")}
		/>
	{/snippet}
</ContactUsForm>
```

### Declarative extra field

```svelte
<ContactUsForm
	onSubmit={send}
	extraFields={[
		{ name: "orderId", label: "Order number", position: "top", autocomplete: "off" },
	]}
/>
```

## CSS Variables

Prefix: `--stuic-contact-us-form-*`

| Variable                      | Purpose                       |
| ----------------------------- | ----------------------------- |
| `--stuic-contact-us-form-gap` | Vertical gap between sections |

## i18n keys

Under the `contact_form.*` namespace. See `_internal/contact-form-i18n-defaults.ts` for the full list and English defaults.

## See also

- [Input](../Input/README.md) — the `Field*` primitives this form is built from, including the `Honeypot` and `TimeTrap` anti-bot primitives.
- [RegisterForm](../RegisterForm/README.md) — same form conventions (declarative extras, `extraFieldsSlot`, imperative API).
