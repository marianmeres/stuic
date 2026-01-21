# ModalDialog

A modal component using the native HTML `<dialog>` element with `showModal()`. Provides built-in backdrop, focus management, and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `noClickOutsideClose` | `boolean` | `false` | Disable close on outside click |
| `noEscapeClose` | `boolean` | `false` | Disable close on Escape key |
| `noScrollLock` | `boolean` | `false` | Disable body scroll lock |
| `preEscapeClose` | `() => any` | - | Hook before Escape close (return `false` to prevent) |
| `preClose` | `() => any` | - | Hook before any close (return `false` to prevent) |
| `type` | `string` | - | Optional UI hint (added as `data-type` attribute) |
| `class` | `string` | - | CSS for content box |
| `classDialog` | `string` | - | CSS for dialog element |
| `ariaLabelledby` | `string` | - | ID reference for aria-labelledby |
| `ariaDescribedby` | `string` | - | ID reference for aria-describedby |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Open modal with `showModal()`, optionally track opener |
| `close()` | Close modal |
| `setOpener(el)` | Set element to refocus when closed |
| `visibility()` | Returns object with `visible` getter |

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

### Check Visibility State

```svelte
<script lang="ts">
  let dialog: ModalDialog;

  function logVisibility() {
    console.log('Is visible:', dialog.visibility().visible);
  }
</script>
```

## CSS Variables

### Component Tokens

Override to customize appearance:

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-modal-dialog-radius` | `--radius-lg` | Border radius of content box |
| `--stuic-modal-dialog-transition` | `150ms` | Animation/transition duration |
| `--stuic-modal-dialog-backdrop` | `rgb(0 0 0 / 0.4)` | Backdrop overlay color |
| `--stuic-modal-dialog-bg` | `--stuic-color-surface` | Content box background |
| `--stuic-modal-dialog-text` | `--stuic-color-surface-foreground` | Content box text color |
| `--stuic-modal-dialog-shadow` | `--shadow-xl` | Content box shadow |

### Customization Examples

```css
/* Global override - all dialogs */
:root {
  --stuic-modal-dialog-radius: 0;
  --stuic-modal-dialog-backdrop: rgb(0 0 0 / 0.7);
}
```

```svelte
<!-- Local override - single dialog -->
<ModalDialog
  bind:this={dialog}
  style="--stuic-modal-dialog-radius: 9999px;"
>
  Content with pill-shaped radius
</ModalDialog>
```

## Relationship to Modal

`Modal` is a higher-level component built on top of `ModalDialog`.

| Feature | ModalDialog | Modal |
|---------|-------------|-------|
| Layout | Raw content | Header/main/footer structure |
| Styling | Minimal | Pre-styled box with backgrounds |
| Sizing | Manual | Responsive (fullscreen mobile, centered desktop) |
| Use case | Full control | Quick conventional modals |

Use `ModalDialog` when you need complete control over the modal content and styling. Use `Modal` for conventional modal dialogs with header/footer sections.
