# LoginForm

Standalone login form with email/password fields, optional social/OAuth buttons, forgot-password link, remember-me checkbox, and client + server validation. Ships with English defaults for 16 i18n keys; pass a `t` function to translate.

`LoginForm` is the form-only component; `LoginFormModal` wraps it in a `Modal` with an opener trigger.

## Exports

| Export                     | Kind      | Description                                       |
| -------------------------- | --------- | ------------------------------------------------- |
| `LoginForm`                | component | Form component                                    |
| `LoginFormModal`           | component | Modal-wrapped form with optional trigger snippet  |
| `LoginFormProps`           | type      | Props for `LoginForm`                             |
| `LoginFormModalProps`      | type      | Props for `LoginFormModal`                        |
| `LoginFormData`            | type      | `{ email, password, rememberMe }`                 |
| `LoginFormValidationError` | type      | `{ field, message }`                              |
| `createEmptyLoginFormData` | function  | Factory for an empty `LoginFormData`               |
| `validateLoginForm`        | function  | `(data, t) => LoginFormValidationError[]`         |

## LoginForm — Props

| Prop                  | Type                                              | Default  | Description                                                                          |
| --------------------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `formData`            | `LoginFormData`                                   | empty    | Bindable form data.                                                                  |
| `onSubmit`            | `(data: LoginFormData) => void`                   | required | Called when client-side validation passes.                                            |
| `isSubmitting`        | `boolean`                                         | `false`  | Disables the CTA during submission.                                                  |
| `errors`              | `LoginFormValidationError[]`                      | `[]`     | Field-specific server errors (merged with internal validation).                       |
| `error`               | `string`                                          | -        | General error rendered as a `DismissibleMessage` above the form.                      |
| `onForgotPassword`    | `() => void`                                      | -        | Click handler for the "Forgot password?" link. Link is hidden when undefined.         |
| `showRememberMe`      | `boolean`                                         | `true`   | Render the remember-me checkbox.                                                     |
| `submitLabel`         | `string`                                          | i18n     | Override the CTA label.                                                              |
| `submittingLabel`     | `string`                                          | i18n     | Override the CTA label while submitting.                                             |
| `submitButton`        | `Snippet<[{ isSubmitting, disabled }]>`           | -        | Override the entire CTA section.                                                     |
| `socialLogins`        | `Snippet`                                         | -        | Social/OAuth buttons rendered below the form. A divider is shown above when set.     |
| `socialDividerLabel`  | `string \| false`                                 | i18n     | Override (or hide with `false`) the divider above social buttons.                    |
| `footer`              | `Snippet`                                         | -        | Content below the form (e.g., sign-up links).                                        |
| `notifications`       | `NotificationsStack`                              | -        | When set, general errors are also pushed via `notifications.error()`.                 |
| `t`                   | `TranslateFn`                                     | English  | i18n function.                                                                       |
| `unstyled` / `class`  | -                                                 | -        | Standard styling escape hatches.                                                     |
| `el`                  | `HTMLFormElement`                                 | -        | Bindable form element.                                                               |

### Imperative methods

`bind:this` exposes:

| Method                                | Returns   | Purpose                                                                  |
| ------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `validate()`                          | `boolean` | Forces every inner field's validator to run. `true` if all valid.        |
| `scrollToFirstError(opts?)`           | `boolean` | Scrolls + focuses the first invalid field. Call after `validate()`.      |

These are essential for pristine-form errors (server errors set via the `errors` prop won't render until the user touches each field). See [`docs/domains/components.md#imperative-validate-api`](../../../docs/domains/components.md#imperative-validate-api) for the full pattern.

## LoginFormModal — extra props

Inherits all `LoginForm` props, plus:

| Prop                  | Type                                | Default                                | Description                                                                   |
| --------------------- | ----------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `title`               | `string`                            | `"Log In"` (i18n)                     | Modal title.                                                                  |
| `visible`             | `boolean`                           | `false`                                | Bindable modal visibility.                                                    |
| `trigger`             | `Snippet<[{ open }]>`               | -                                      | Optional trigger element rendered outside the modal.                          |
| `classModal`          | `string`                            | -                                      | Class for the Modal box.                                                      |
| `classInner`          | `string`                            | -                                      | Class for the Modal inner width container.                                    |
| `classForm`           | `string`                            | -                                      | Class forwarded to the inner `LoginForm`.                                     |
| `noXClose`            | `boolean`                           | `false`                                | Hide the close (X) button.                                                    |
| `onClose`             | `() => false \| void`               | -                                      | Pre-close hook. Return `false` to prevent close.                              |
| `noClickOutsideClose` | `boolean`                           | `true`                                 | Disable backdrop-click close (default-on to protect typed credentials).        |

**Methods:** `open(openerOrEvent?)`, `close()` — exposed via `bind:this`.

## Usage

### Basic form

```svelte
<script lang="ts">
	import { LoginForm } from "@marianmeres/stuic";
</script>

<LoginForm
	onSubmit={(data) => login(data)}
	onForgotPassword={() => goto("/forgot-password")}
/>
```

### With social logins + footer

```svelte
<LoginForm onSubmit={handleLogin}>
	{#snippet socialLogins()}
		<Button variant="outline" onclick={loginWithGoogle}>Google</Button>
		<Button variant="outline" onclick={loginWithGitHub}>GitHub</Button>
	{/snippet}
	{#snippet footer()}
		<p>Don't have an account? <a href="/register">Sign up</a></p>
	{/snippet}
</LoginForm>
```

### Modal with trigger

```svelte
<LoginFormModal onSubmit={handleLogin}>
	{#snippet trigger({ open })}
		<Button onclick={open}>Log In</Button>
	{/snippet}
</LoginFormModal>
```

### Imperative validation from a custom CTA

```svelte
<script lang="ts">
	import { LoginForm } from "@marianmeres/stuic";
	let form = $state<LoginForm>();

	function submit() {
		if (!form?.validate()) {
			form?.scrollToFirstError();
			return;
		}
		// ... actually submit ...
	}
</script>

<LoginForm bind:this={form} onSubmit={submit} />
<Button onclick={submit}>Submit from outside</Button>
```

## CSS Variables

Prefix: `--stuic-login-form-*`

| Variable                                          | Purpose                                |
| ------------------------------------------------- | -------------------------------------- |
| `--stuic-login-form-gap`                          | Vertical gap between sections          |
| `--stuic-login-form-gap-row`                      | Gap inside multi-column rows           |
| `--stuic-login-form-forgot-margin-y`              | Forgot-password link vertical margin   |
| `--stuic-login-form-forgot-margin-x`              | Forgot-password link horizontal margin |
| `--stuic-login-form-social-margin-top`            | Margin above social buttons block       |
| `--stuic-login-form-social-gap`                   | Gap between social buttons              |
| `--stuic-login-form-social-divider-color`         | Divider text color                     |
| `--stuic-login-form-social-divider-font-size`     | Divider text size                      |
| `--stuic-login-form-social-divider-margin-bottom` | Divider bottom margin                  |

## i18n keys

All keys are under the `login_form.*` namespace and cover labels, placeholders, validation messages, the submit/submitting CTA, the social divider, and modal title. See `_internal/login-form-i18n-defaults.ts` for the full list and English defaults.
