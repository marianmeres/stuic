# CopyButton

Click-to-copy button with built-in feedback. It **is a `Button`** (same `intent`,
`variant`, `size` and theming) that writes `text` to the clipboard on click, flips to a
"copied" state (check icon, success intent, localized label/name, screen-reader
announcement) for a moment, and reports the outcome through `onCopied` / `onError`.

The clipboard write itself is a standalone utility — `copyToClipboard()` — so the same
logic can be used programmatically, without the button.

## Props

Everything `Button` accepts (except the toggle/link/spinner extras) plus:

| Prop               | Type                                        | Default            | Description                                                                                     |
| ------------------ | ------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `text`             | `string \| () => string \| Promise<string>` | required           | What to copy. A getter is resolved on click (sync or async)                                     |
| `label`            | `THC \| true`                               | -                  | Visible label. Omit for an icon-only button (accessible name from `t("copy")`); `true` = "Copy" |
| `labelCopied`      | `THC`                                       | `t("copied")`      | Label while copied (only with `label`)                                                          |
| `labelError`       | `THC`                                       | `t("copy_failed")` | Label while in error (only with `label`)                                                        |
| `icon`             | `string \| false`                           | copy icon          | Idle icon (svg/html string). `false` = no icons at all                                          |
| `iconCopied`       | `string \| false`                           | check icon         | Copied icon                                                                                     |
| `iconError`        | `string \| false`                           | × icon             | Error icon                                                                                      |
| `feedbackDuration` | `number`                                    | `2000`             | How long (ms) the copied/error feedback stays. `0` = until the next click                       |
| `intentCopied`     | `IntentColorKey \| false`                   | `"success"`        | Button intent while copied. `false` keeps `intent`                                              |
| `intentError`      | `IntentColorKey \| false`                   | `"destructive"`    | Button intent while in error. `false` keeps `intent`                                            |
| `onCopied`         | `(text: string) => void`                    | -                  | Fired after a successful copy with the copied text                                              |
| `onError`          | `(error: unknown) => void`                  | -                  | Fired when the copy failed (clipboard unavailable / denied, getter threw)                       |
| `onclick`          | `(e: MouseEvent) => void`                   | -                  | Runs before copying; `e.preventDefault()` skips the copy                                        |
| `t`                | `TranslateFn`                               | English            | i18n (see below)                                                                                |
| `variant`          | `ButtonVariant`                             | `"ghost"`          | Button variant (CopyButton's default differs from Button's `"solid"`)                           |
| `size`             | `ButtonSize`                                | `"sm"`             | Button size (CopyButton's default differs from Button's `"md"`)                                 |
| `unstyled`         | `boolean`                                   | `false`            | Skip all default styling                                                                        |
| `class`            | `string`                                    | -                  | Additional CSS classes (merged via twMerge)                                                     |
| `classIcon`        | `string`                                    | -                  | Class for the icon wrapper                                                                      |
| `classLabel`       | `string`                                    | -                  | Class for the label wrapper                                                                     |
| `el`               | `HTMLElement`                               | -                  | Button element reference (bindable)                                                             |

## Snippet Props

| Snippet    | Description                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `children` | Override the whole button content. Receives `{ state: "idle" \| "copied" \| "error", copied }` |

## Usage

### Icon-only (default)

```svelte
<script lang="ts">
	import { CopyButton } from "@marianmeres/stuic";
	const apiKey = "sk-live-…";
</script>

<code>{apiKey}</code>
<CopyButton text={apiKey} />
```

### With a label

```svelte
<!-- "Copy" → "Copied" (localized defaults) -->
<CopyButton text={url} label />

<!-- custom labels, regular button look -->
<CopyButton
	text={url}
	label="Copy link"
	labelCopied="Link copied!"
	variant="outline"
	size="md"
/>
```

### Notify when copied

The component announces the result to assistive tech by itself (a visually hidden live
region). For a visible app-level notification, hook `onCopied` / `onError` into your
notifications stack:

```svelte
<script lang="ts">
	import { CopyButton, Notifications, NotificationsStack } from "@marianmeres/stuic";
	const notifications = new NotificationsStack();
</script>

<CopyButton
	text={shareUrl}
	label="Copy link"
	onCopied={() => notifications.success("Link copied to clipboard")}
	onError={() => notifications.error("Could not copy — please copy the link manually")}
/>

<Notifications {notifications} />
```

### Lazy / async text

Pass a getter when the value is expensive to build or only known at click time. Keep
it fast — browsers tie clipboard writes to the user gesture, and Safari is strict
about it.

```svelte
<CopyButton text={() => JSON.stringify(exportData(), null, 2)} label="Copy JSON" />

<CopyButton
	text={async () => (await fetch("/api/share-link")).text()}
	label="Copy share link"
/>
```

### Feedback tuning

```svelte
<!-- keep the base intent while copied, and stay "copied" until the next click -->
<CopyButton
	text={x}
	intent="primary"
	variant="solid"
	intentCopied={false}
	feedbackDuration={0}
	label
/>

<!-- no icons, text only -->
<CopyButton text={x} icon={false} label="Copy" labelCopied="✓ Copied" />
```

### Custom content

```svelte
<CopyButton text={x} variant="soft">
	{#snippet children({ state, copied })}
		{copied ? "🎉 Got it" : state === "error" ? "😬 Nope" : "Grab it"}
	{/snippet}
</CopyButton>
```

### Programmatic copy

`copyToClipboard(text)` is the same write the button performs: the async Clipboard
API with a `document.execCommand("copy")` fallback (insecure contexts, older
browsers, a rejected async write). It resolves once the text is on the clipboard and
rejects only when every path failed. Call it from a user gesture.

```ts
import { copyToClipboard, isCopyToClipboardSupported } from "@marianmeres/stuic";

async function share() {
	try {
		await copyToClipboard(location.href);
		notifications.success("Copied");
	} catch (e) {
		notifications.error("Copy failed");
	}
}

// decide up-front whether to offer copying at all (always false during SSR)
if (isCopyToClipboardSupported()) {
	/* … */
}
```

### i18n

English is built in; Slovak is bundled and opt-in. Any partial catalog works — missing
keys fall back to English.

```svelte
<script lang="ts">
	import {
		CopyButton,
		createCopyButtonT,
		COPY_BUTTON_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createCopyButtonT(COPY_BUTTON_MESSAGES_SK);
</script>

<CopyButton text={x} {t} />
```

| Key           | English       | Used for                                            |
| ------------- | ------------- | --------------------------------------------------- |
| `copy`        | `Copy`        | Idle accessible name (icon-only) and `label={true}` |
| `copied`      | `Copied`      | Copied name/label and the live announcement         |
| `copy_failed` | `Copy failed` | Error name/label and the live announcement          |

## Accessibility

- Icon-only mode gets an `aria-label` that tracks the state (`Copy` → `Copied` /
  `Copy failed`). With a `label`, the visible text is the name.
- A visually hidden `role="status"` live region next to the button announces the
  outcome, so screen-reader users hear "Copied" without the icon.
- The feedback intent swap is a color cue only — the icon and the text change too.
- The icon wrapper is `aria-hidden`.

## CSS Variables

The button surface (colors, padding, radius, focus ring) themes via the
`--stuic-button-*` tokens. CopyButton adds:

| Variable                                | Default  | Description                                                      |
| --------------------------------------- | -------- | ---------------------------------------------------------------- |
| `--stuic-copy-button-icon-size`         | `1.25em` | Icon size (any `svg` inside the icon wrapper)                    |
| `--stuic-copy-button-icon-pop-duration` | `200ms`  | Length of the icon "pop" when the state changes                  |
| `--stuic-copy-button-icon-pop-scale`    | `0.6`    | Scale the pop starts from (`prefers-reduced-motion` disables it) |

## Data Attributes

- `data-state` - `"idle" | "copied" | "error"` (kept even when `unstyled`)
- plus everything `Button` sets (`data-variant`, `data-size`, `data-intent`,
  `data-icon-button` in icon-only mode, …)
