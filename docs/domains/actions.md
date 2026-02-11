# Actions Domain

## Overview

14 Svelte actions (directives) for reusable DOM behavior.

---

## Available Actions

| Action | Purpose | File |
|--------|---------|------|
| `validate` | Form field validation with i18n support | `validate.svelte.ts` |
| `focusTrap` | Keyboard focus containment (modals/dialogs) | `focus-trap.ts` |
| `autogrow` | Auto-resize textarea to content | `autogrow.svelte.ts` |
| `autoscroll` | Auto-scroll container to bottom | `autoscroll.ts` |
| `dimBehind` | Dim everything behind a target element (simplified spotlight) | `dim-behind/` |
| `fileDropzone` | Drag-and-drop file handling | `file-dropzone.svelte.ts` |
| `highlightDragover` | Visual feedback on drag-over | `highlight-dragover.svelte.ts` |
| `resizableWidth` | Draggable width resizing | `resizable-width.svelte.ts` |
| `trim` | Auto-trim whitespace from input | `trim.svelte.ts` |
| `typeahead` | Advanced autocomplete behavior | `typeahead.svelte.ts` |
| `onSubmitValidityCheck` | Form submit validation | `on-submit-validity-check.svelte.ts` |
| `popover` | Popover positioning | `popover/` |
| `spotlight` | Spotlight/coach mark overlay with cutout hole | `spotlight/` |
| `tooltip` | Tooltip positioning and display | `tooltip/` |

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
    }
  })}
/>
```

### File Dropzone

```svelte
<div
  use:fileDropzone={() => ({
    accept: "image/*",
    multiple: true,
    onDrop: (files) => handleFiles(files),
    onError: (error) => console.error(error)
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

<button onclick={() => showSpotlight('intro-step-1')}>Start Tour</button>
```

### Dim Behind

```svelte
<div
  use:dimBehind={() => ({
    open: isDimmed,
    onHide: () => isDimmed = false,
  })}
>
  Highlighted Element
</div>

<button onclick={() => showDimBehind('my-id')}>Highlight</button>
```

### Tooltip

```svelte
<button use:tooltip={{ content: "Save changes", position: "top" }}>
  Save
</button>
```

---

## Action File Patterns

**Reactive (`.svelte.ts`):** Uses `$effect()` for reactivity
```ts
// autogrow.svelte.ts
export function autogrow(el: HTMLTextAreaElement, optionsFn?: () => Options) {
  $effect(() => {
    const options = optionsFn?.() ?? {};
    // Setup with reactive options...
    return () => { /* cleanup */ };
  });
}
```

**Non-reactive (`.ts`):** Traditional Svelte action pattern
```ts
// focus-trap.ts
export function focusTrap(el: HTMLElement, options?: Options) {
  // Setup...
  return {
    update(newOptions) { /* update */ },
    destroy() { /* cleanup */ }
  };
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| src/lib/actions/index.ts | All action exports |
| src/lib/actions/validate.svelte.ts | Complex action example |
| src/lib/actions/focus-trap.ts | Traditional action pattern |
| src/lib/actions/dim-behind/ | Simplified spotlight alternative |
| src/lib/actions/spotlight/ | Spotlight/coach mark action |
| src/lib/actions/tooltip/ | Multi-file action example |
