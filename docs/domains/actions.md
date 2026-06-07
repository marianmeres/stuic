# Actions Domain

## Overview

15 Svelte actions (directives) for reusable DOM behavior.

---

## Available Actions

| Action                    | Purpose                                                       | File                                 |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| `validate`                | Form field validation with i18n support                       | `validate.svelte.ts`                 |
| `focusTrap`               | Keyboard focus containment (modals/dialogs)                   | `focus-trap.ts`                      |
| `autogrow`                | Auto-resize textarea to content                               | `autogrow.svelte.ts`                 |
| `autoscroll`              | Auto-scroll container to bottom                               | `autoscroll.ts`                      |
| `dimBehind`               | Dim everything behind a target element (simplified spotlight) | `dim-behind/`                        |
| `fileDropzone`            | Drag-and-drop file handling                                   | `file-dropzone.svelte.ts`            |
| `highlightDragover`       | Visual feedback on drag-over                                  | `highlight-dragover.svelte.ts`       |
| `resizableWidth`          | Draggable width resizing                                      | `resizable-width.svelte.ts`          |
| `trim`                    | Auto-trim whitespace from input                               | `trim.svelte.ts`                     |
| `typeahead`               | Advanced autocomplete behavior                                | `typeahead.svelte.ts`                |
| `onSubmitValidityCheck`   | Form submit validation                                        | `on-submit-validity-check.svelte.ts` |
| `popover`                 | Popover positioning                                           | `popover/`                           |
| `spotlight`               | Spotlight/coach mark overlay with cutout hole                 | `spotlight/`                         |
| `tooltip`                 | Tooltip positioning and display                               | `tooltip/`                           |
| `createTour` / `tourStep` | Multi-step onboarding tour (built on spotlight)               | `onboarding/`                        |

---

## Usage Patterns

### Basic Action

```svelte
<div use:focusTrap>
	<button>First focusable</button>
	<button>Last focusable</button>
</div>
```

### Action with Options

```svelte
<textarea use:autogrow={{ minRows: 3, maxRows: 10 }} />
```

### Action with Reactive Options

Actions using `$effect()` accept a function returning options:

```svelte
<input
	use:validate={() => ({
		enabled: formEnabled,
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

### Imperative validate() trigger

The `validate` action only runs `_doValidate` in response to user-driven DOM
events (`change`, first `blur`). On a pristine, never-touched field the inline
validation message never mounts — which silently breaks any flow that
pre-populates errors via `customValidator` on a fresh form.

Pass a `setDoValidate` callback to capture a reference to the action's internal
validator function and trigger it imperatively (e.g., from a submit handler):

```svelte
<script>
	let doValidate: (() => void) | undefined = $state();

	function handleSubmit() {
		// Force every "sleeping" field's validator to run, rendering inline
		// errors even on fields the user never touched.
		doValidate?.();
		// ...check validationResult.valid here, or use validateAllFields().
	}
</script>

<input
	required
	use:validate={() => ({
		enabled: true,
		setValidationResult: (res) => (validationResult = res),
		setDoValidate: (fn) => (doValidate = fn),
	})}
/>
```

> **You generally don't write this by hand.** Every STUIC `Field*` component
> already wires `setDoValidate` internally and exposes the result as
> `export function validate()` on its component reference. See the
> [Components domain doc](./components.md#imperative-validate-api) for the
> per-field method list and the [validate-fields utility](./utils.md) for
> `validateAllFields()` / `scrollToFirstInvalidField()` aggregators.

### Pristine forms and external errors

A common trap: setting an `errors` prop on a brand-new form and expecting the
inline messages to render. They won't — the `validate` action's
`customValidator` is only invoked on user events. Two fixes:

1. **Wrap the form in `<form use:onSubmitValidityCheck>`** and listen for
   `submit_valid` / `submit_invalid` (works for native submit flows).
2. **Call the field component's imperative `validate()` from your submit
   handler** (works for any flow — wizards, multi-step, custom CTAs).

### Hidden inputs and `required`

Per the HTML spec, `<input type="hidden">` is _barred from constraint
validation_ — `validity.valueMissing` stays `false` regardless of the
`required` attribute, and native browser submit blocking is skipped. Several
STUIC field components (`FieldPhoneNumber`, `FieldCountry`, `FieldObject`,
`FieldAssets`, `FieldInputLocalized`, `FieldKeyValues`, `FieldLikeButton`)
use a hidden input to participate in `FormData`, so they each enforce
`required` themselves inside their `customValidator`:

```ts
customValidator(val, ctx, el) {
    if (required && (val == null || val === "")) {
        return "This field requires attention. Please review and try again.";
    }
    return userValidator?.(val, ctx, el) || "";
}
```

This means `<FieldCountry required />` and `<FieldPhoneNumber required />`
correctly fail validation when empty — both through the imperative
`validate()` path and via `use:onSubmitValidityCheck`. Without this wrap
they'd silently accept empty values.

### `onSubmitValidityCheck` and synthetic events

On submit the action walks `form.elements` and synthetically dispatches
`input` + `change` on each control, so custom `validate` listeners run even on
fields the user never touched. `form.elements` includes CSS-hidden controls
(`display:none` does **not** remove an element — only `disabled` or being
outside the form does), so this fan-out reaches every wired input.

Two element types are deliberately exempt from the synthetic dispatch:

- **`type="radio"`** — dispatching `change` auto-selects the last radio in the
  group, which is wrong.
- **`type="file"`** — a file input's value is read-only to script, so a
  synthetic `change` can't re-validate it; worse, it re-triggers any dropzone /
  upload listener bound to the input. `FieldAssets` wires its hidden
  `<input type="file">` through `fileDropzone`, so a re-fired `change` would
  re-run `processFiles` with the previously-picked file still in `inputEl.files`
  — duplicating the asset and firing a real re-upload on every save. File inputs
  are still read for native constraint validation (`required`); only the event
  dispatch is skipped. (`FieldAssets` additionally clears its file input after
  consuming a selection, both as defense-in-depth and to allow re-selecting the
  same file twice in a row.)

### File Dropzone

```svelte
<div
	use:fileDropzone={() => ({
		accept: "image/*",
		multiple: true,
		onDrop: (files) => handleFiles(files),
		onError: (error) => console.error(error),
	})}
>
	Drop files here
</div>
```

### Spotlight

```svelte
<div
	use:spotlight={() => ({
		content: "Check out this feature!",
		position: "bottom",
		id: "intro-step-1",
	})}
>
	Target Element
</div>

<button onclick={() => showSpotlight("intro-step-1")}>Start Tour</button>
```

### Dim Behind

```svelte
<div
	use:dimBehind={() => ({
		open: isDimmed,
		onHide: () => (isDimmed = false),
	})}
>
	Highlighted Element
</div>

<button onclick={() => showDimBehind("my-id")}>Highlight</button>
```

### Tooltip

```svelte
<button use:tooltip={{ content: "Save changes", position: "top" }}> Save </button>
```

### Onboarding Tour

```svelte
<script>
	import { createTour, tourStep } from "@marianmeres/stuic";

	const tour = createTour({
		steps: [
			{ id: "header", title: "Welcome", content: "This is the top." },
			{ id: "save-btn", title: "Save", content: "Click here to save." },
		],
		onEnd: () => console.log("Tour complete!"),
	});
</script>

<header use:tourStep={[tour, "header"]}>...</header>
<button use:tourStep={[tour, "save-btn"]}>Save</button>
<button onclick={tour.start}>Start Tour</button>
```

Steps can also target elements by CSS **selector** instead of `use:tourStep` — useful when the target lives inside a reusable component:

```svelte
<!-- Component adds a stable data attribute (no tour knowledge) -->
<button data-tour-id="download">Download</button>

<!-- Tour config references it by selector -->
{ id: "dl-step", title: "Download", content: "...", selector: '[data-tour-id="download"]' }
```

Features: step navigation (next/prev/skip), selector-based step targeting, persistent state via `storageKey`, custom shell snippets, `confirmSkip` callback, wait-for-element mechanism, Escape key support, step lifecycle callbacks (`onEnter`/`onLeave`).

---

## Action File Patterns

**Reactive (`.svelte.ts`):** Uses `$effect()` for reactivity

```ts
// autogrow.svelte.ts
export function autogrow(el: HTMLTextAreaElement, optionsFn?: () => Options) {
	$effect(() => {
		const options = optionsFn?.() ?? {};
		// Setup with reactive options...
		return () => {
			/* cleanup */
		};
	});
}
```

**Non-reactive (`.ts`):** Traditional Svelte action pattern

```ts
// focus-trap.ts
export function focusTrap(el: HTMLElement, options?: Options) {
	// Setup...
	return {
		update(newOptions) {
			/* update */
		},
		destroy() {
			/* cleanup */
		},
	};
}
```

---

## Key Files

| File                               | Purpose                          |
| ---------------------------------- | -------------------------------- |
| src/lib/actions/index.ts           | All action exports               |
| src/lib/actions/validate.svelte.ts | Complex action example           |
| src/lib/actions/focus-trap.ts      | Traditional action pattern       |
| src/lib/actions/dim-behind/        | Simplified spotlight alternative |
| src/lib/actions/spotlight/         | Spotlight/coach mark action      |
| src/lib/actions/tooltip/           | Multi-file action example        |
| src/lib/actions/onboarding/        | Multi-step onboarding tour       |
