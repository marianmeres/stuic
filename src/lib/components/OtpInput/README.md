# OtpInput

Generic N-slot one-time-code input. 6 digits by default, configurable. Building block for email verification, 2FA, and password-reset OTP flows.

## Usage

```svelte
<script lang="ts">
	import { OtpInput } from "@marianmeres/stuic";

	let code = $state("");
</script>

<OtpInput
	bind:value={code}
	length={6}
	onComplete={(c) => console.log("Got code:", c)}
/>
```

## Props

| Prop           | Type                            | Default            | Description                                                       |
| -------------- | ------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `value`        | `string`                        | `""`               | Bindable concatenated value                                       |
| `length`       | `number`                        | `6`                | Number of slots                                                   |
| `onComplete`   | `(code: string) => void`        | —                  | Fired when all slots are filled                                   |
| `oninput`      | `(value: string) => void`       | —                  | Fired on every change                                             |
| `error`        | `boolean`                       | `false`            | Renders error styling + `aria-invalid`                            |
| `disabled`     | `boolean`                       | `false`            | Disables all slots                                                |
| `autoFocus`    | `boolean`                       | `true`             | Auto-focus the first empty slot on mount                          |
| `mode`         | `"numeric" \| "alphanumeric"`   | `"numeric"`        | Restrict input characters                                         |
| `autocomplete` | `string`                        | `"one-time-code"`  | Pass-through to first slot for browser/iOS auto-fill              |
| `unstyled`     | `boolean`                       | `false`            | Skip default styling                                              |
| `class`        | `string`                        | —                  | Additional CSS classes on the root                                |
| `el`           | `HTMLDivElement`                | —                  | Bindable root element ref                                         |

## Behavior

- **Auto-advance**: typing in slot K moves focus to slot K+1.
- **Backspace**: clears current slot; if already empty, jumps to and clears slot K-1.
- **Arrow keys**: ←/→ navigate without modifying values.
- **Paste**: any slot accepts paste; the pasted string is sanitized to allowed chars, truncated to `length`, and distributed across all slots starting from slot 0.
- **iOS/Android SMS auto-fill**: first slot has `autocomplete="one-time-code"` by default. The OS auto-fills the full code into slot 0 — the input handler distributes it.
- **Click**: focusing a filled slot selects its content (for easy overwrite).
- **Enter**: bubbles a native submit to the surrounding `<form>`.
- **Accessibility**: each slot gets `aria-label="Digit {n+1} of {length}"`.

## CSS Tokens

Prefix: `--stuic-otp-input-*`

`gap`, `slot-size`, `font-size`, `bg`, `color`, `radius`, `border-width`, `border-color`, `border-color-focus`, `border-color-error`, `transition`

The shared structural tokens `--stuic-radius`, `--stuic-border-width`, and `--stuic-transition` are used as fallbacks.
