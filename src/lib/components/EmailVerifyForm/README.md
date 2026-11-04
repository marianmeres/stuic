# EmailVerifyForm

"Check your email" form used after registration. Drop-in peer to `LoginForm` / `RegisterForm` — same prop conventions (`onSubmit`, `isSubmitting`, `error`, `notifications`, `t`, `unstyled`, `class`).

The form owns:

- A heading + subhead that displays the email the code was sent to.
- An `OtpInput` (default 6 digits) that auto-submits on completion.
- A general error banner via `DismissibleMessage`.
- An optional inline "attempts remaining" hint.
- An optional "Resend code" control with built-in cooldown countdown.

## Usage

```svelte
<script lang="ts">
	import { EmailVerifyForm } from "@marianmeres/stuic";

	async function handleVerify(code: string) {
		// POST /api/verify with { email, code }
	}

	async function handleResend() {
		// POST /api/resend-code with { email }
	}
</script>

<EmailVerifyForm
	email="user@example.com"
	onSubmit={handleVerify}
	onResend={handleResend}
	resendCooldownSeconds={30}
	error={errorMessage}
/>
```

## Props

| Prop                    | Type                          | Default  | Description                                              |
| ----------------------- | ----------------------------- | -------- | -------------------------------------------------------- |
| `email`                 | `string`                      | required | Email address shown in the subhead                       |
| `onSubmit`              | `(code: string) => void`      | required | Called with the entered code (auto on complete + manual) |
| `onResend`              | `() => Promise<void> \| void` | —        | When set, renders a resend control                       |
| `resendCooldownSeconds` | `number`                      | `30`     | Cooldown after a successful resend                       |
| `isSubmitting`          | `boolean`                     | `false`  | Disables submit + OtpInput                               |
| `error`                 | `string`                      | —        | General error (renders alert + applies error styling)    |
| `attemptsRemaining`     | `number`                      | —        | Inline hint, e.g. "3 attempts remaining"                 |
| `codeLength`            | `number`                      | `6`      | Forwarded to OtpInput                                    |
| `otpInputProps`         | `Partial<OtpInputProps>`      | —        | Pass-through props for the inner OtpInput                |
| `notifications`         | `NotificationsStack`          | —        | Route errors to notification system                      |
| `submitButton`          | `Snippet`                     | —        | Override submit section                                  |
| `footer`                | `Snippet`                     | —        | Content below the resend control                         |
| `heading`               | `string \| false`             | —        | Override heading text, or `false` to suppress entirely   |
| `t`                     | `TranslateFn`                 | English  | i18n function — see [i18n](#i18n)                        |
| `unstyled`              | `boolean`                     | `false`  | Skip default styling                                     |
| `class`                 | `string`                      | —        | Additional CSS classes on the form root                  |
| `el`                    | `HTMLFormElement`             | —        | Bindable form element                                    |

## i18n

Built-in English; bundled Slovak (`EMAIL_VERIFY_FORM_MESSAGES_SK`) is opt-in. `createEmailVerifyFormT(messages)` builds the `t` prop from a catalog; a key the catalog lacks falls back to English, so the catalog may be partial. Same model as [LoginForm's i18n](../LoginForm/README.md#i18n).

```svelte
<script lang="ts">
	import {
		EmailVerifyForm,
		createEmailVerifyFormT,
		EMAIL_VERIFY_FORM_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createEmailVerifyFormT(EMAIL_VERIFY_FORM_MESSAGES_SK);
</script>

<EmailVerifyForm {email} {onSubmit} {t} />
```

Keys (`EMAIL_VERIFY_FORM_MESSAGES_EN`):

| Key                                    | Default                             |
| -------------------------------------- | ----------------------------------- |
| `email_verify_form.heading`            | `Check your email`                  |
| `email_verify_form.subheading`         | `We sent a 6-digit code to {email}` |
| `email_verify_form.submit`             | `Verify`                            |
| `email_verify_form.submitting`         | `Verifying...`                      |
| `email_verify_form.resend_prompt`      | `Didn't receive it?`                |
| `email_verify_form.resend`             | `Resend code`                       |
| `email_verify_form.resend_cooldown`    | `Resend available in {seconds}s`    |
| `email_verify_form.resent`             | `New code sent`                     |
| `email_verify_form.attempts_remaining` | `{count} attempts remaining`        |

## CSS Tokens

Prefix: `--stuic-email-verify-form-*`

`gap`, `subheading-color`, `attempts-color`, `resend-color`, `resend-flash-color`
