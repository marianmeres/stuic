# RegisterForm

Standalone registration form. Same conventions as [`LoginForm`](../LoginForm/README.md): `formData`, `onSubmit`, internal + server validation, i18n, optional `notifications`, social-logins snippet. Adds **declarative extra fields** (top/bottom positioning, custom validators) and an **`extraFieldsSlot` escape hatch** for non-FieldInput extras (e.g., a terms-of-service checkbox).

`RegisterForm` is the form-only component; `RegisterFormModal` wraps it in a `Modal` with an opener trigger.

## Exports

| Export                          | Kind      | Description                                       |
| ------------------------------- | --------- | ------------------------------------------------- |
| `RegisterForm`                  | component | Form component                                    |
| `RegisterFormModal`             | component | Modal-wrapped form with optional trigger snippet  |
| `RegisterFormProps`             | type      | Props for `RegisterForm`                          |
| `RegisterFormModalProps`        | type      | Props for `RegisterFormModal`                     |
| `RegisterFormData`              | type      | `{ email, password, passwordConfirm, extra }`     |
| `RegisterFormValidationError`   | type      | `{ field, message }`                              |
| `RegisterFieldConfig`           | type      | Declarative extra-field descriptor                |
| `createEmptyRegisterFormData`   | function  | Factory for an empty `RegisterFormData`            |
| `validateRegisterForm`          | function  | `(data, t, extraFields, opts) => Error[]`         |

## `RegisterFieldConfig`

```ts
interface RegisterFieldConfig {
	name: string;                                                  // unique key under formData.extra
	label: string;                                                 // already-translated
	type?: "text" | "email" | "tel" | "url" | "password" | "number";
	placeholder?: string;
	required?: boolean;
	autocomplete?: HTMLInputAttributes["autocomplete"];
	initialValue?: unknown;
	validate?: (value: unknown, data: RegisterFormData) => string | undefined;
	position?: "top" | "bottom";                                   // default "bottom"
	props?: Record<string, unknown>;                               // passthrough to FieldInput
}
```

## RegisterForm — Props

| Prop                  | Type                                              | Default  | Description                                                                          |
| --------------------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `formData`            | `RegisterFormData`                                | empty    | Bindable form data.                                                                  |
| `onSubmit`            | `(data: RegisterFormData) => void`                | required | Called after client-side validation passes.                                          |
| `isSubmitting`        | `boolean`                                         | `false`  | Disables the CTA during submission.                                                  |
| `errors`              | `RegisterFormValidationError[]`                   | `[]`     | Field-specific server errors (merged with internal validation).                       |
| `error`               | `string`                                          | -        | General error rendered as a `DismissibleMessage` above the form.                      |
| `showPasswordConfirm` | `boolean`                                         | `true`   | Render the password-confirm field.                                                   |
| `passwordMinLength`   | `number`                                          | `8`      | Minimum password length (fed into both the FieldInput attribute and the validator).   |
| `extraFields`         | `RegisterFieldConfig[]`                           | `[]`     | Declarative extra fields. Rendered as `FieldInput`s positioned top or bottom.         |
| `extraFieldsSlot`     | `Snippet<[{ formData, fieldError }]>`             | -        | Escape hatch for non-FieldInput extras. Rendered after declarative bottom fields.    |
| `submitLabel`         | `string`                                          | i18n     | Override the CTA label.                                                              |
| `submittingLabel`     | `string`                                          | i18n     | Override the CTA label while submitting.                                             |
| `submitButton`        | `Snippet<[{ isSubmitting, disabled }]>`           | -        | Override the entire CTA section.                                                     |
| `socialLogins`        | `Snippet`                                         | -        | Social/OAuth buttons. A divider is shown above when set.                              |
| `socialDividerLabel`  | `string \| false`                                 | i18n     | Override (or hide with `false`) the divider above social buttons.                    |
| `footer`              | `Snippet`                                         | -        | Content below the form (e.g., "Already have an account? Log in").                    |
| `notifications`       | `NotificationsStack`                              | -        | When set, general errors are also pushed via `notifications.error()`.                 |
| `t`                   | `TranslateFn`                                     | English  | i18n function.                                                                       |
| `unstyled` / `class`  | -                                                 | -        | Standard styling escape hatches.                                                     |
| `el`                  | `HTMLFormElement`                                 | -        | Bindable form element.                                                               |

### Imperative methods (via `bind:this`)

| Method                         | Returns   | Purpose                                                                  |
| ------------------------------ | --------- | ------------------------------------------------------------------------ |
| `validate()`                   | `boolean` | Forces every inner field's validator to run. `true` if all valid.        |
| `scrollToFirstError(opts?)`    | `boolean` | Scrolls + focuses the first invalid field. Call after `validate()`.      |

## RegisterFormModal — extra props

Inherits all `RegisterForm` props, plus:

| Prop          | Type                            | Default                              | Description                                                |
| ------------- | ------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| `title`       | `string`                        | `"Create account"` (i18n)            | Modal title.                                               |
| `visible`     | `boolean`                       | `false`                              | Bindable modal visibility.                                 |
| `trigger`     | `Snippet<[{ open }]>`           | -                                    | Optional trigger element rendered outside the modal.       |
| `classModal`  | `string`                        | -                                    | Class for the Modal box.                                   |
| `classInner`  | `string`                        | -                                    | Class for the Modal inner width container.                 |
| `classForm`   | `string`                        | -                                    | Class forwarded to the inner `RegisterForm`.                |
| `noXClose`    | `boolean`                       | `false`                              | Hide the close (X) button.                                 |
| `onClose`     | `() => false \| void`           | -                                    | Pre-close hook. Return `false` to prevent close.           |

**Methods:** `open(openerOrEvent?)`, `close()` — exposed via `bind:this`.

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

### Modal with trigger

```svelte
<RegisterFormModal onSubmit={signup}>
	{#snippet trigger({ open })}
		<Button onclick={open}>Sign up</Button>
	{/snippet}
</RegisterFormModal>
```

## CSS Variables

Prefix: `--stuic-register-form-*`

| Variable                                              | Purpose                       |
| ----------------------------------------------------- | ----------------------------- |
| `--stuic-register-form-gap`                           | Vertical gap between sections |
| `--stuic-register-form-gap-row`                       | Gap inside multi-column rows  |
| `--stuic-register-form-social-margin-top`             | Margin above social block     |
| `--stuic-register-form-social-gap`                    | Gap between social buttons    |
| `--stuic-register-form-social-divider-color`          | Divider text color            |
| `--stuic-register-form-social-divider-line-color`     | Divider line color            |
| `--stuic-register-form-social-divider-font-size`      | Divider text size             |
| `--stuic-register-form-social-divider-margin-bottom`  | Divider bottom margin         |

## i18n keys

Under the `register_form.*` namespace. See `_internal/register-form-i18n-defaults.ts` for the full list and English defaults.

## See also

- [LoginForm](../LoginForm/README.md) — login counterpart.
- [LoginOrRegisterForm](../LoginOrRegisterForm/README.md) — composite that toggles between login, register, and verify modes.
- [EmailVerifyForm](../EmailVerifyForm/) — post-registration verify code form, often used in tandem.
