# ModalDialog

A modal component using the native HTML `<dialog>` element with `showModal()`. Provides built-in backdrop, focus management, and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `noClickOutsideClose` | `boolean` | `false` | Disable close on outside click |
| `noEscapeClose` | `boolean` | `false` | Disable close on Escape key |
| `preEscapeClose` | `() => any` | - | Hook before Escape close (return `false` to prevent) |
| `preClose` | `() => any` | - | Hook before any close (return `false` to prevent) |
| `type` | `string` | - | Optional UI hint (added as `data-type` attribute) |
| `class` | `string` | - | CSS for content box |
| `classDialog` | `string` | - | CSS for dialog element |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Open modal with `showModal()`, optionally track opener |
| `close()` | Close modal |
| `setOpener(el)` | Set element to refocus when closed |

## Usage

### Basic Dialog

```svelte
<script lang="ts">
  import { ModalDialog } from 'stuic';

  let dialog: ModalDialog;
</script>

<button onclick={(e) => dialog.open(e)}>Open Dialog</button>

<ModalDialog bind:this={dialog} class="p-6 rounded-lg max-w-md">
  <h2>Dialog Title</h2>
  <p>This uses the native dialog element.</p>
  <button onclick={() => dialog.close()}>Close</button>
</ModalDialog>
```

### With Pre-close Validation

```svelte
<script lang="ts">
  let hasUnsavedChanges = $state(false);
</script>

<ModalDialog
  bind:this={dialog}
  preClose={() => {
    if (hasUnsavedChanges) {
      return confirm('Discard unsaved changes?');
    }
  }}
  class="p-6 rounded-lg"
>
  <form>
    <input oninput={() => hasUnsavedChanges = true} />
    <button type="button" onclick={() => dialog.close()}>Close</button>
  </form>
</ModalDialog>
```

### Prevent Outside Click Close

```svelte
<ModalDialog
  bind:this={dialog}
  noClickOutsideClose
  class="p-6 rounded-lg"
>
  <p>Click outside won't close this dialog.</p>
  <button onclick={() => dialog.close()}>Close</button>
</ModalDialog>
```

### Async Pre-close Hook

```svelte
<ModalDialog
  bind:this={dialog}
  preEscapeClose={async () => {
    const shouldClose = await confirmAction();
    return shouldClose;
  }}
>
  Content
</ModalDialog>
```

## Differences from Modal

| Feature | Modal | ModalDialog |
|---------|-------|-------------|
| Implementation | Custom backdrop | Native `<dialog>` |
| Backdrop | Via `Backdrop` component | Native `::backdrop` |
| Browser support | All modern | Requires `<dialog>` support |
| Stacking | Manual z-index | Top layer (always on top) |
| Accessibility | Manual ARIA | Built-in |
