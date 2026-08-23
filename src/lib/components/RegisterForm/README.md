# RegisterForm

Standalone registration form. Same conventions as [`LoginForm`](../LoginForm/README.md): `formData`, `onSubmit`, internal + server validation, i18n, optional `notifications`, social-logins snippet. Adds **declarative extra fields** (top/bottom positioning, custom validators) and an **`extraFieldsSlot` escape hatch** for non-FieldInput extras (e.g., a terms-of-service checkbox).

It also covers **identity-first signup**, where the account identity is established by an external party (OAuth provider, invite token, magic link) _before_ the account exists: `showEmail` / `showPassword` unmount the credential fields, `credentialsSlot` replaces them, and `socialPosition="top"` puts the provider buttons above the credentials rather than after the CTA.

`RegisterForm` is the form-only component; `RegisterFormModal` wraps it in a `Modal` with an opener trigger.

## Exports

| Export                        | Kind      | Description                                      |
| ----------------------------- | --------- | ------------------------------------------------ |
| `RegisterForm`                | component | Form component                                   |
| `RegisterFormModal`           | component | Modal-wrapped form with optional trigger snippet |
| `RegisterFormProps`           | type      | Props for `RegisterForm`                         |
| `RegisterFormModalProps`      | type      | Props for `RegisterFormModal`                    |
| `RegisterFormData`            | type      | `{ email, password, passwordConfirm, extra }`    |
| `RegisterFormValidationError` | type      | `{ field, message }`                             |
| `RegisterFieldConfig`         | type      | Declarative extra-field descriptor               |
| `createEmptyRegisterFormData` | function  | Factory for an empty `RegisterFormData`          |
| `validateRegisterForm`        | function  | `(data, t?, extraFields?, opts?) => Error[]`     |
| `ValidateRegisterFormOptions` | type      | Options for `validateRegisterForm`               |

## `RegisterFieldConfig`

```ts
interface RegisterFieldConfig {
	name: string; // unique key under formData.extra
	label: string; // already-translated
	type?: "text" | "email" | "tel" | "url" | "password" | "number";
	placeholder?: string;
	required?: boolean;
	autocomplete?: HTMLInputAttributes["autocomplete"];
	initialValue?: unknown;
	validate?: (value: unknown, data: RegisterFormData) => string | undefined;
	position?: "top" | "bottom"; // default "bottom"
	props?: Record<string, unknown>; // passthrough to FieldInput
}
```

## RegisterForm — Props

| Prop                        | Type                                    | Default    | Description                                                                                                                                           |
| --------------------------- | --------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formData`                  | `RegisterFormData`                      | empty      | Bindable form data.                                                                                                                                   |
| `onSubmit`                  | `(data: RegisterFormData) => void`      | required   | Called after client-side validation passes.                                                                                                           |
| `isSubmitting`              | `boolean`                               | `false`    | Disables the CTA during submission.                                                                                                                   |
| `submitDisabled`            | `boolean`                               | `false`    | Consumer-owned submit block. Disables the CTA **and** blocks `onSubmit`.                                                                              |
| `errors`                    | `RegisterFormValidationError[]`         | `[]`       | Field-specific server errors (merged with internal validation). See [Server errors](#server-supplied-errors).                                         |
| `error`                     | `string`                                | -          | General error rendered as a `DismissibleMessage` above the form.                                                                                      |
| `showEmail`                 | `boolean`                               | `true`     | Render the email field. `false` **unmounts** it and skips its validation.                                                                             |
| `showPassword`              | `boolean`                               | `true`     | Render the password field (and, transitively, the confirm field).                                                                                     |
| `showPasswordConfirm`       | `boolean`                               | `true`     | Render the password-confirm field. Subordinate to `showPassword`.                                                                                     |
| `passwordMinLength`         | `number`                                | `8`        | Minimum password length (fed into both the FieldInput attribute and the validator).                                                                   |
| `credentialsSlot`           | `Snippet<[{ formData, fieldError }]>`   | -          | Rendered at the credentials position (after the core fields, before bottom extra fields).                                                             |
| `emailFieldProps`           | `Partial<FieldInputProps>`              | -          | Passthrough props for the built-in email field.                                                                                                       |
| `passwordFieldProps`        | `Partial<FieldInputProps>`              | -          | Passthrough props for the built-in password field.                                                                                                    |
| `passwordConfirmFieldProps` | `Partial<FieldInputProps>`              | -          | Passthrough props for the built-in confirm field.                                                                                                     |
| `extraFields`               | `RegisterFieldConfig[]`                 | `[]`       | Declarative extra fields. Rendered as `FieldInput`s positioned top or bottom.                                                                         |
| `extraFieldsSlot`           | `Snippet<[{ formData, fieldError }]>`   | -          | Escape hatch for non-FieldInput extras. Rendered after declarative bottom fields.                                                                     |
| `submitLabel`               | `string`                                | i18n       | Override the CTA label.                                                                                                                               |
| `submittingLabel`           | `string`                                | i18n       | Override the CTA label while submitting.                                                                                                              |
| `submitButton`              | `Snippet<[{ isSubmitting, disabled }]>` | -          | Override the entire CTA section. `disabled` is `isSubmitting \|\| submitDisabled`.                                                                    |
| `socialLogins`              | `Snippet`                               | -          | Social/OAuth buttons. A divider is shown when set.                                                                                                    |
| `socialPosition`            | `"top" \| "bottom"`                     | `"bottom"` | `"top"` renders the block above the credentials, with the divider **below** the buttons.                                                              |
| `socialDividerLabel`        | `string \| false`                       | i18n       | Override (or hide with `false`) the divider. Defaults to `social_divider` ("or continue with") at the bottom, `social_divider_alt` ("or") at the top. |
| `footer`                    | `Snippet`                               | -          | Content below the form (e.g., "Already have an account? Log in").                                                                                     |
| `notifications`             | `NotificationsStack`                    | -          | When set, general errors are also pushed via `notifications.error()`.                                                                                 |
| `t`                         | `TranslateFn`                           | English    | i18n function.                                                                                                                                        |
| `unstyled` / `class`        | -                                       | -          | Standard styling escape hatches.                                                                                                                      |
| `el`                        | `HTMLFormElement`                       | -          | Bindable form element.                                                                                                                                |

### Imperative methods (via `bind:this`)

| Method                      | Returns   | Purpose                                                                                                                            |
| --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `validate()`                | `boolean` | Forces every rendered field's validator to run. `true` if all valid.                                                               |
| `scrollToFirstError(opts?)` | `boolean` | Scrolls + focuses the first invalid field. Call after `validate()`.                                                                |
| `focusField(name)`          | `boolean` | Focuses `"email"` / `"password"` / `"passwordConfirm"` or any `extraFields` name. `false` if that field is not currently rendered. |

### Field render order

```
general error alert (`error`)
top-position extra fields
social block            ← only when socialPosition="top" (divider BELOW the buttons)
email / password / confirm   ← each present only if its show* prop is true
credentialsSlot
bottom-position extra fields
extraFieldsSlot
submit CTA
social block            ← default (divider ABOVE the buttons)
footer
```

## RegisterFormModal — extra props

Inherits all `RegisterForm` props, plus:

| Prop         | Type                  | Default                   | Description                                          |
| ------------ | --------------------- | ------------------------- | ---------------------------------------------------- |
| `title`      | `string`              | `"Create account"` (i18n) | Modal title.                                         |
| `visible`    | `boolean`             | `false`                   | Bindable modal visibility.                           |
| `trigger`    | `Snippet<[{ open }]>` | -                         | Optional trigger element rendered outside the modal. |
| `classModal` | `string`              | -                         | Class for the Modal box.                             |
| `classInner` | `string`              | -                         | Class for the Modal inner width container.           |
| `classForm`  | `string`              | -                         | Class forwarded to the inner `RegisterForm`.         |
| `noXClose`   | `boolean`             | `false`                   | Hide the close (X) button.                           |
| `onClose`    | `() => false \| void` | -                         | Pre-close hook. Return `false` to prevent close.     |

**Methods:** `open(openerOrEvent?)`, `close()`, plus the inner form's `validate()`, `scrollToFirstError(opts?)` and `focusField(name)` — all exposed via `bind:this`. The three forwarded ones are no-ops (returning `true` / `false` / `false`) while the modal is closed, since the form isn't mounted then.

## Usage

### Basic

```svelte
<script lang="ts">
	import { RegisterForm } from "@marianmeres/stuic";
</script>

<RegisterForm onSubmit={(data) => signup(data)} />
```

### With declarative extra fields

```svelte
<RegisterForm
	onSubmit={signup}
	extraFields={[
		{
			name: "fullName",
			label: "Full name",
			required: true,
			position: "top",
			autocomplete: "name",
		},
		{
			name: "company",
			label: "Company",
			position: "bottom",
		},
	]}
/>
```

### With a terms-of-service checkbox (extraFieldsSlot)

```svelte
<script lang="ts">
	import { RegisterForm, FieldCheckbox } from "@marianmeres/stuic";

	let formData = $state({
		email: "",
		password: "",
		passwordConfirm: "",
		extra: { tos: false },
	});

	function validateTos(value: unknown) {
		return value ? undefined : "You must accept the terms.";
	}
</script>

<RegisterForm bind:formData onSubmit={signup}>
	{#snippet extraFieldsSlot({ formData, fieldError })}
		<FieldCheckbox
			bind:checked={formData.extra.tos}
			label="I accept the terms of service"
			error={fieldError("tos")}
			validate={{ customValidator: () => validateTos(formData.extra.tos) }}
		/>
	{/snippet}
</RegisterForm>
```

### Identity-first signup (OAuth / invite / magic link)

Once an external party has confirmed who the user is, the credential fields are not merely unnecessary — they are wrong (a password field on a Google-backed account creates an account with two identities). Unmount them and put your own summary in their place. Fields required on _both_ paths (a workspace id, an invite code) belong above the choice, which is what `socialPosition="top"` is for.

```svelte
<script lang="ts">
	import { RegisterForm } from "@marianmeres/stuic";

	let identity = $state<{ provider: string; email: string } | null>(null);
	let form = $state<RegisterForm>();
</script>

<RegisterForm
	bind:this={form}
	{onSubmit}
	showEmail={!identity}
	showPassword={!identity}
	showPasswordConfirm={false}
	socialPosition="top"
	socialLogins={identity ? undefined : providerButtons}
	credentialsSlot={identity ? identityRow : undefined}
	emailFieldProps={{ label: "Owner email" }}
	submitDisabled={identityExpired}
	submitLabel="Create workspace"
	extraFields={[
		{ name: "tenant_id", label: "Workspace id", position: "top", required: true },
	]}
/>

{#snippet providerButtons()}
	<Button onclick={connectProvider}>Continue with Google</Button>
{/snippet}

{#snippet identityRow()}
	<!-- provider mark, confirmed address, "use a different account", expiry notice -->
{/snippet}
```

Call `form.focusField("tenant_id")` right after the provider confirms: the button the user clicked is about to unmount, and without an explicit move focus falls to `<body>` — a keyboard user's next Tab restarts at the top of the document.

Other shapes the same three props cover:

| Flow                       | Props                                       |
| -------------------------- | ------------------------------------------- |
| Invite / token (email set) | `showEmail={false}`                         |
| Magic link / passwordless  | `showPassword={false}`                      |
| SSO-only tenant            | both `false` — only tenant fields are asked |
| Default                    | both `true` — nothing changes               |

Unmounting (rather than hiding) is load-bearing, not cosmetic: the form is `novalidate`, so a hidden `required` input produces no browser bubble, but `onSubmitValidityCheck` still reads its validity and routes the submit to `submit_invalid` — the CTA would become a button that does nothing at all, with no message anywhere.

### Per-field labels without a custom `t`

```svelte
<RegisterForm
	{onSubmit}
	emailFieldProps={{ label: "Owner email", autocomplete: "email" }}
	passwordFieldProps={{ label: "Password", description: "At least 8 characters." }}
/>
```

Applied **after** the component's own props, so `label`, `placeholder`, `description`, `autocomplete`, `renderSize`, `classInput`… all override cleanly. Two keys are handled specially instead of blindly overwritten:

- **`validate`** is _composed_: your `customValidator` runs when there is no server/internal error for that field, so the wiring that renders `errors` can't be knocked out by accident. (`validate: false` is ignored for the same reason — use `extraFields` if you need a fully bespoke field.)
- **`value`** is ignored; the field is bound to `formData`.

> `RegisterFieldConfig.props` (extra fields) has **no** such protection — it stays an unrestricted spread, so a `validate` passed there does replace the error wiring.

### Modal with trigger

```svelte
<RegisterFormModal onSubmit={signup}>
	{#snippet trigger({ open })}
		<Button onclick={open}>Sign up</Button>
	{/snippet}
</RegisterFormModal>
```

## Server-supplied errors

`errors` is consumer-owned — the form renders it but cannot clear it. An entry for a field **this form renders** is therefore tied to the value that field held when the error arrived, and goes **stale** as soon as the user edits it: it stops blocking submit and disappears from the inline messages on that field's next validation run (change / blur / submit). Typing the rejected value back in makes it live again, since that exact value is known-bad.

The rule in one line: **errors the user can fix here clear themselves; everything else is yours to clear.** Without the first half the form used to wedge permanently — the field's validator kept reporting the server error whatever the user typed, so every later submit was routed to `submit_invalid` and `onSubmit` never fired again, including the handler that would have cleared the errors.

This means the ordinary flow just works, with no extra wiring:

```svelte
<RegisterForm {onSubmit} errors={serverErrors} error={generalError} />
```

```ts
async function onSubmit(data: RegisterFormData) {
	isSubmitting = true;
	const res = await api.signup(data); // clearing `serverErrors` here is optional
	serverErrors = res.fieldErrors ?? [];
	isSubmitting = false;
}
```

Notes:

- An error whose `field` isn't rendered here — one you display yourself from `extraFieldsSlot` / `credentialsSlot` via `fieldError(name)`, or a core field switched off by `showEmail` / `showPassword` / `showPasswordConfirm` — **keeps blocking until you drop it from `errors`**, exactly as before. Nothing in the form can answer it, and auto-clearing it would let the form post past a block you set deliberately (an unchecked terms box, a failed captcha). For a purely client-side gate, prefer `submitDisabled`.
- Errors are painted as soon as they arrive; no extra click is needed.
- Staleness is keyed on the errors' _content_, not the array identity, so passing a freshly built array on every render (`errors={cond ? [{...}] : []}`) is safe.
- An identical error redelivered after a resubmit is treated as fresh, so a second rejection with the same message shows up again. If you post from your own handler instead of `onSubmit`, call `validate()` first — that is what marks the round trip.
- The other STUIC forms (`LoginForm`, `ContactUsForm`, `CheckoutGuestForm`) share the `errors` prop name but **not** this lifecycle yet: theirs stay until the consumer clears them.

## CSS Variables

Prefix: `--stuic-register-form-*`

| Variable                                             | Purpose                                            |
| ---------------------------------------------------- | -------------------------------------------------- |
| `--stuic-register-form-gap`                          | Vertical gap between sections                      |
| `--stuic-register-form-gap-row`                      | Gap inside multi-column rows                       |
| `--stuic-register-form-social-margin-top`            | Margin above social block (default position)       |
| `--stuic-register-form-social-margin-bottom`         | Margin below social block (`socialPosition="top"`) |
| `--stuic-register-form-social-gap`                   | Gap between social buttons                         |
| `--stuic-register-form-social-divider-color`         | Divider text color                                 |
| `--stuic-register-form-social-divider-line-color`    | Divider line color                                 |
| `--stuic-register-form-social-divider-font-size`     | Divider text size                                  |
| `--stuic-register-form-social-divider-margin-bottom` | Divider bottom margin (default position)           |
| `--stuic-register-form-social-divider-margin-top`    | Divider top margin (`socialPosition="top"`)        |
| `--stuic-register-form-credentials-margin-bottom`    | Bottom margin of the `credentialsSlot` wrapper     |
| `--stuic-register-form-field-margin-bottom`          | Bottom margin of each field inside the form        |

The social block carries `data-position="top" \| "bottom"` (suppressed under `unstyled`) if you want to target either placement from your own CSS. Note that the `top` variant hard-resets `margin-top` to `0`, so `--stuic-register-form-social-margin-top` applies to the default position only.

`credentialsSlot` content is wrapped in `.stuic-register-form-credentials` (suppressed under `unstyled`) so it inherits the same bottom rhythm the fields have — the form itself is a zero-gap flex column.

## Gotchas

- **Empty social slot.** `socialLogins` is gated on the _snippet being passed_, not on it rendering anything. A consumer that passes a placeholder snippet while it discovers which providers exist gets the wrapper margins and a divider around nothing — pass `socialLogins={undefined}` until you know, or reserve the height inside the snippet and pass `socialDividerLabel={false}`.
- **`RegisterFieldConfig.props` is an unrestricted spread** — unlike the core `*FieldProps`, a `validate` passed there replaces the error wiring.
- **Reserved `extraFields` names.** `"email"`, `"password"` and `"passwordConfirm"` belong to the core fields: an extra field using one of them still renders, but `focusField()` resolves to the core field, and both share one `fieldError()` entry. Duplicate `extraFields` names collide the same way (one ref slot, one error entry).
- **Hiding a core field does not reset its value.** `showEmail={false}` still submits whatever `formData.email` last held — clear it (or set it to the established identity) when you switch mid-flow.
- **`LoginOrRegisterForm`** renders its own shared social block, so it owns `socialLogins` / `socialPosition` / `socialDividerLabel` at the wrapper level; they are excluded from its `registerProps` type rather than silently ignored.

## i18n keys

Under the `register_form.*` namespace. See `_internal/register-form-i18n-defaults.ts` for the full list and English defaults.

## See also

- [LoginForm](../LoginForm/README.md) — login counterpart.
- [LoginOrRegisterForm](../LoginOrRegisterForm/README.md) — composite that toggles between login, register, and verify modes.
- [EmailVerifyForm](../EmailVerifyForm/) — post-registration verify code form, often used in tandem.
