# Utils Domain

## Overview

44 utility modules for common tasks. Organized by category.

---

## Reactive State (.svelte.ts)

State utilities using Svelte 5 runes:

| Util                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `localStorageState`    | Persist state to localStorage     |
| `sessionStorageState`  | Persist state to sessionStorage   |
| `breakpoint`           | Reactive responsive breakpoint    |
| `devicePointer`        | Detect pointer type (mouse/touch) |
| `prefersReducedMotion` | Detect motion preference          |
| `observeExists`        | Observe element existence         |
| `inputHistory`         | Input undo/redo history           |
| `switch`               | Toggle state factory              |

### Example: Persistent State

```ts
import { localStorageState } from "@marianmeres/stuic";

let theme = localStorageState("theme", "light");
// theme.value is reactive and persisted
theme.value = "dark";
```

---

## DOM Utilities

| Util               | Purpose                  |
| ------------------ | ------------------------ |
| `qsa`              | querySelectorAll wrapper |
| `bodyScrollLocker` | Lock/unlock body scroll  |
| `getId`            | Generate unique IDs      |

---

## String / Data

| Util          | Purpose                        |
| ------------- | ------------------------------ |
| `ucfirst`     | Capitalize first letter        |
| `nl2br`       | Convert newlines to `<br>`     |
| `unaccent`    | Remove diacritics              |
| `escapeRegex` | Escape regex special chars     |
| `strHash`     | Simple string hash             |
| `tr`          | Simple i18n translation helper |
| `replaceMap`  | Bulk string replacement        |

---

## Functions

| Util             | Purpose                      |
| ---------------- | ---------------------------- |
| `debounce`       | Debounce function calls      |
| `throttle`       | Throttle function calls      |
| `sleep`          | Promise-based delay          |
| `seconds`        | Time unit conversion         |
| `eventEmitter`   | Pub/sub event pattern        |
| `eventModifiers` | Keyboard/mouse event helpers |

### Example: Debounce

```ts
import { debounce } from "@marianmeres/stuic";

const search = debounce((query: string) => {
	fetchResults(query);
}, 300);
```

---

## Type Checks

| Util        | Purpose                   |
| ----------- | ------------------------- |
| `isNullish` | Check null/undefined      |
| `isImage`   | Check if file is image    |
| `isBrowser` | Check browser environment |
| `isMac`     | Check macOS               |

---

## Data Handling

| Util                 | Purpose             |
| -------------------- | ------------------- |
| `maybeJsonParse`     | Safe JSON.parse     |
| `maybeJsonStringify` | Safe JSON.stringify |
| `omit`               | Omit object keys    |
| `pick`               | Pick object keys    |

---

## Visual

| Util           | Purpose                         |
| -------------- | ------------------------------- |
| `twMerge`      | Tailwind class merging          |
| `colors`       | Color manipulation              |
| `avatarColors` | Deterministic avatar colors     |
| `paint`        | HSL color generation            |
| `svgCircle`    | SVG progress ring (DOM node)    |
| `oscillate`    | Value oscillation for animation |

### Example: Class Merging

```ts
import { twMerge } from "@marianmeres/stuic";

// Handles Tailwind class conflicts
twMerge("px-4 py-2", "px-6"); // => "py-2 px-6"
```

---

## URL

| Util            | Purpose                                 |
| --------------- | --------------------------------------- |
| `resolveUrl`    | Resolve relative URL against base URL   |
| `resolveSrcset` | Resolve all URLs within a srcset string |

---

## Files

| Util               | Purpose                  |
| ------------------ | ------------------------ |
| `fileFromBlobUrl`  | Convert blob URL to File |
| `forceDownload`    | Trigger file download    |
| `preloadImg`       | Preload images           |
| `getFileTypeLabel` | Human-readable file type |

---

## Storage

| Util                  | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `StorageAbstraction`  | Unified class over localStorage/sessionStorage/memory      |
| `MemoryStorage`       | In-memory storage fallback (SSR-safe)                      |
| `localStorageValue`   | Non-reactive value backed by localStorage (get/set/remove) |
| `sessionStorageValue` | Non-reactive value backed by sessionStorage                |
| `memoryStorageValue`  | Non-reactive value backed by in-memory storage             |

### Example: Storage Abstraction

```ts
import { StorageAbstraction } from "@marianmeres/stuic";

const storage = new StorageAbstraction("local");
storage.set("user", { name: "John" });
storage.get("user"); // { name: 'John' }
```

---

## Design Tokens

| Util                | Purpose                     |
| ------------------- | --------------------------- |
| `generateCssTokens` | Convert token schema to CSS |
| `toCssString`       | Format tokens as CSS string |

---

## Field Validation Aggregators

Helpers for orchestrating `validate()` across multiple `Field*` components.
Pair with the per-field imperative API documented in the
[Components domain](./components.md#imperative-validate-api).

| Util                           | Purpose                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `validateAllFields`            | Run `validate()` on every provided field ref. Returns `true` if all valid.         |
| `findFirstInvalidField`        | Return the first ref whose cached `getValidation()` is invalid.                    |
| `scrollToFirstInvalidField`    | Scroll the first invalid field into view + focus (call after `validateAllFields`). |
| `ValidatableField` (interface) | Minimal shape every STUIC `Field*` satisfies — your own components can too.        |

```ts
import { scrollToFirstInvalidField, validateAllFields } from "@marianmeres/stuic";

let nameField = $state<FieldInput>();
let emailField = $state<FieldInput>();
let countryField = $state<FieldCountry>();

function handleContinue() {
	const allValid = validateAllFields([nameField, emailField, countryField]);
	if (!allValid) {
		scrollToFirstInvalidField([nameField, emailField, countryField]);
		return;
	}
	// ...submit
}
```

`undefined` / `null` entries are skipped so callers can spread conditional refs
without filtering first.

---

## Server-Error Lifecycle (.svelte.ts)

Used by every STUIC form that takes an `errors` prop (`LoginForm`,
`RegisterForm`, `ContactUsForm`, `CheckoutGuestForm`) — and available for your
own forms.

| Util                        | Purpose                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `createExternalFieldErrors` | Gives a consumer-owned `errors` prop a lifecycle: entries on rendered fields self-clear. |
| `repaintFieldErrors`        | Paints a field's message as soon as the error exists, not on the next interaction.       |
| `FieldError` (interface)    | `{ field, message }` — every form's `*ValidationError` satisfies it.                     |

`errors` is consumer-owned: a form can render it but cannot clear it. Taken
literally that wedges the form — the field's `customValidator` keeps reporting
the server error whatever the user types, so every later submit is routed to
`submit_invalid` and the consumer's own handler (the one that would have cleared
the errors) never runs. `createExternalFieldErrors` remembers the value each
field held when a set of errors arrived and drops an entry once the user edits
that field; entries for fields the form does not render keep applying, since no
edit there can answer them.

`repaintFieldErrors` covers the other half: inline messages come from each
field's own validation run (on `change` / first blur), so a form-level validator
result — computed _after_ the submit-time validity walk already re-ran every
field — used to paint nothing at all on the first click.

```svelte
<script lang="ts">
	import {
		createExternalFieldErrors,
		repaintFieldErrors,
	} from "@marianmeres/stuic/utils";

	let { errors: externalErrors = [], formData = $bindable(initial) } = $props();

	const external = createExternalFieldErrors({
		errors: () => externalErrors,
		isRendered: (f) => f === "email" || f === "password",
		valueOf: (f) => formData[f] ?? "",
	});

	let allErrors = $derived([...internalErrors, ...external.live]);
	repaintFieldErrors(() => allErrors, fieldByName);

	function submit() {
		if (!internalErrors.length && !external.live.length) {
			external.markSubmitted(); // arms identical-repeat detection
			onSubmit(formData);
		}
	}
</script>
```

Both register `$effect`s, so call them during component initialization.

---

## Key Files

| File                                     | Purpose                                      |
| ---------------------------------------- | -------------------------------------------- |
| src/lib/utils/index.ts                   | All utility exports                          |
| src/lib/utils/tw-merge.ts                | Critical for class merging                   |
| src/lib/utils/persistent-state.svelte.ts | Reactive storage pattern (runes-based)       |
| src/lib/utils/storage-abstraction.ts     | Non-reactive storage (localStorage, etc.)    |
| src/lib/utils/validate-fields.ts         | Form-level validation aggregators            |
| src/lib/utils/design-tokens.ts           | Re-exports from `@marianmeres/design-tokens` |
