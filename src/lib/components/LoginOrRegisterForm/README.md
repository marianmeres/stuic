# LoginOrRegisterForm

Composite form that toggles between [`LoginForm`](../LoginForm/README.md), [`RegisterForm`](../RegisterForm/README.md), and (since 3.71) [`EmailVerifyForm`](../EmailVerifyForm/). The built-in mode switcher only exposes **login/register** tabs — `"verify"` is an outcome state entered programmatically (typically after a `requiresVerification` register response).

`LoginOrRegisterForm` is the form-only component; `LoginOrRegisterFormModal` wraps it in a `Modal` with an opener trigger and a mode-aware title.

## Exports

| Export                          | Kind      | Description                          |
| ------------------------------- | --------- | ------------------------------------ |
| `LoginOrRegisterForm`           | component | Composite form                       |
| `LoginOrRegisterFormModal`      | component | Modal-wrapped composite form         |
| `LoginOrRegisterFormProps`      | type      | Props for `LoginOrRegisterForm`      |
| `LoginOrRegisterFormModalProps` | type      | Props for `LoginOrRegisterFormModal` |
| `LoginOrRegisterFormMode`       | type      | `"login" \| "register" \| "verify"`  |

## Mode behavior

- **login** — renders `LoginForm` + the shared `socialLogins` block.
- **register** — renders `RegisterForm` + the shared `socialLogins` block.
- **verify** — renders `EmailVerifyForm`. Social logins are hidden. The mode switcher is hidden (consumers transition in/out programmatically).

When the active mode changes, the relevant email is **one-shot copied** to the destination form's `email` field (login ↔ register ↔ verify) so the user does not have to re-type it. No continuous sync effect — flips are explicit.

## LoginOrRegisterForm — Props

| Prop                 | Type                               | Default   | Description                                                                                                           |
| -------------------- | ---------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `mode`               | `LoginOrRegisterFormMode`          | `"login"` | Bindable active mode.                                                                                                 |
| `loginData`          | `LoginFormData`                    | empty     | Bindable login form data (forwarded to `LoginForm`).                                                                  |
| `registerData`       | `RegisterFormData`                 | empty     | Bindable register form data (forwarded to `RegisterForm`).                                                            |
| `verifyEmail`        | `string`                           | `""`      | Bindable email used by `EmailVerifyForm` (auto-seeded on transitions).                                                |
| `onLogin`            | `(data: LoginFormData) => void`    | required  | Login submit callback.                                                                                                |
| `onRegister`         | `(data: RegisterFormData) => void` | required  | Register submit callback.                                                                                             |
| `onVerify`           | `(code: string) => void`           | -         | Verify submit callback (required only when using verify mode).                                                        |
| `onResendCode`       | `() => Promise<void> \| void`      | -         | Resend handler — when set, `EmailVerifyForm` renders the resend control.                                              |
| `isSubmitting`       | `boolean`                          | `false`   | Forwarded to all three forms.                                                                                         |
| `onForgotPassword`   | `() => void`                       | -         | Forgot-password handler for login mode.                                                                               |
| `loginProps`         | `Partial<LoginFormProps>`          | -         | Pass-through to the inner `LoginForm`.                                                                                |
| `registerProps`      | `Partial<RegisterFormProps>`       | -         | Pass-through to the inner `RegisterForm`.                                                                             |
| `verifyProps`        | `Partial<EmailVerifyFormProps>`    | -         | Pass-through to the inner `EmailVerifyForm` (e.g., `error`, `attemptsRemaining`).                                     |
| `modeSwitcher`       | `Snippet<[{ mode, setMode, t }]>`  | -         | Override the built-in `ButtonGroupRadio` switcher.                                                                    |
| `loginModeLabel`     | `string`                           | i18n      | Override the "Log in" tab label.                                                                                      |
| `registerModeLabel`  | `string`                           | i18n      | Override the "Sign up" tab label.                                                                                     |
| `socialLogins`       | `Snippet`                          | -         | Shared OAuth buttons rendered once below the active form (hidden in verify mode).                                     |
| `socialDividerLabel` | `string \| false`                  | i18n      | Override (or hide with `false`) the divider above social buttons.                                                     |
| `footer`             | `Snippet<[{ mode, setMode }]>`     | -         | Mode-aware footer.                                                                                                    |
| `notifications`      | `NotificationsStack`               | -         | Forwarded to inner forms.                                                                                             |
| `onModeChange`       | `(next, prev) => void`             | -         | Called when the active mode changes. Use to clear parent-owned mode-specific state.                                   |
| `animateHeight`      | `boolean`                          | `true`    | Smoothly animate content height on mode/content change. Respects `prefers-reduced-motion`; no effect when `unstyled`. |
| `t`                  | `TranslateFn`                      | English   | i18n function.                                                                                                        |
| `unstyled` / `class` | -                                  | -         | Standard styling escape hatches.                                                                                      |

## LoginOrRegisterFormModal — extra props

Inherits all `LoginOrRegisterForm` props, plus:

| Prop                  | Type                  | Default                                                        | Description                                                             |
| --------------------- | --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `title`               | `string`              | mode-aware ("Log In" / "Create account" / "Verify your email") | Modal title.                                                            |
| `visible`             | `boolean`             | `false`                                                        | Bindable modal visibility.                                              |
| `trigger`             | `Snippet<[{ open }]>` | -                                                              | Optional trigger element rendered outside the modal.                    |
| `classModal`          | `string`              | -                                                              | Class for the Modal box.                                                |
| `classInner`          | `string`              | -                                                              | Class for the Modal inner width container.                              |
| `classForm`           | `string`              | -                                                              | Class forwarded to the inner `LoginOrRegisterForm`.                     |
| `noXClose`            | `boolean`             | `false`                                                        | Hide the close (X) button.                                              |
| `onClose`             | `() => false \| void` | -                                                              | Pre-close hook. Return `false` to prevent close.                        |
| `noClickOutsideClose` | `boolean`             | `true`                                                         | Disable backdrop-click close (default-on to protect typed credentials). |

**Methods:** `open(openerOrEvent?)`, `close()` — exposed via `bind:this`.

## Usage

### Basic toggle

```svelte
<script lang="ts">
	import { LoginOrRegisterForm } from "@marianmeres/stuic";
</script>

<LoginOrRegisterForm
	onLogin={(data) => api.login(data)}
	onRegister={(data) => api.register(data)}
	onForgotPassword={() => goto("/forgot-password")}
/>
```

### Programmatic verify flow

```svelte
<script lang="ts">
	import { LoginOrRegisterForm } from "@marianmeres/stuic";

	let mode = $state<"login" | "register" | "verify">("login");
	let verifyEmail = $state("");

	async function handleRegister(data) {
		const { requiresVerification } = await api.register(data);
		if (requiresVerification) {
			verifyEmail = data.email;
			mode = "verify";
		}
	}

	async function handleVerify(code: string) {
		await api.verifyEmail({ email: verifyEmail, code });
		// success — go back to login (or directly into the app)
		mode = "login";
	}
</script>

<LoginOrRegisterForm
	bind:mode
	bind:verifyEmail
	onLogin={api.login}
	onRegister={handleRegister}
	onVerify={handleVerify}
	onResendCode={() => api.resendCode({ email: verifyEmail })}
/>
```

### Modal with trigger + shared OAuth

```svelte
<LoginOrRegisterFormModal bind:mode onLogin={api.login} onRegister={api.register}>
	{#snippet trigger({ open })}
		<Button onclick={open}>Sign in / Sign up</Button>
	{/snippet}
	{#snippet socialLogins()}
		<Button variant="outline" onclick={loginWithGoogle}>Google</Button>
		<Button variant="outline" onclick={loginWithGitHub}>GitHub</Button>
	{/snippet}
</LoginOrRegisterFormModal>
```

## CSS Variables

Prefix: `--stuic-login-or-register-form-*`

| Variable                                                      | Purpose                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--stuic-login-or-register-form-gap`                          | Vertical gap                                                                                                                                                                                                                |
| `--stuic-login-or-register-form-switcher-margin-bottom`       | Spacing below the mode switcher                                                                                                                                                                                             |
| `--stuic-login-or-register-form-social-margin-top`            | Margin above social block                                                                                                                                                                                                   |
| `--stuic-login-or-register-form-social-gap`                   | Gap between social buttons                                                                                                                                                                                                  |
| `--stuic-login-or-register-form-social-divider-color`         | Divider text color                                                                                                                                                                                                          |
| `--stuic-login-or-register-form-social-divider-line-color`    | Divider line color                                                                                                                                                                                                          |
| `--stuic-login-or-register-form-social-divider-font-size`     | Divider text size                                                                                                                                                                                                           |
| `--stuic-login-or-register-form-social-divider-margin-bottom` | Divider bottom margin                                                                                                                                                                                                       |
| `--stuic-login-or-register-form-height-transition-duration`   | Height animation duration (`animateHeight`)                                                                                                                                                                                 |
| `--stuic-login-or-register-form-height-transition-easing`     | Height animation easing (`animateHeight`)                                                                                                                                                                                   |
| `--stuic-login-or-register-form-height-clip-margin`           | `overflow-clip-margin` while the height animates — how far focus rings / borders may paint past the clip edge so they aren't sliced mid-transition. Default `0.5rem`; raise it if inner controls have larger rings/shadows. |

## i18n keys

| Key                                           | English default     |
| --------------------------------------------- | ------------------- |
| `login_or_register_form.mode_login`           | `Log in`            |
| `login_or_register_form.mode_register`        | `Sign up`           |
| `login_or_register_form.mode_verify`          | `Verify`            |
| `login_or_register_form.modal_title_login`    | `Log In`            |
| `login_or_register_form.modal_title_register` | `Create account`    |
| `login_or_register_form.modal_title_verify`   | `Verify your email` |
| `login_or_register_form.social_divider`       | `or continue with`  |

## See also

- [LoginForm](../LoginForm/README.md) — inner form for login mode.
- [RegisterForm](../RegisterForm/README.md) — inner form for register mode.
- [EmailVerifyForm](../EmailVerifyForm/) — inner form for verify mode.
