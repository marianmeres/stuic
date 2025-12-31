# Modal

A centered modal dialog with optional header and footer sections. Built on top of `Backdrop` with focus trap and scroll locking.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Controls visibility (bindable) |
| `focusTrap` | `boolean \| FocusTrapOptions` | `true` | Enable focus trapping |
| `transitionDuration` | `number` | `100` | Fade transition duration (ms) |
| `onEscape` | `() => void` | - | Callback on Escape key |
| `noScrollLock` | `boolean` | `false` | Disable body scroll lock |
| `classBackdrop` | `string` | - | CSS for backdrop overlay |
| `classInner` | `string` | - | CSS for inner width container |
| `class` | `string` | - | CSS for modal box |
| `classHeader` | `string` | - | CSS for header section |
| `classMain` | `string` | - | CSS for main content |
| `classFooter` | `string` | - | CSS for footer section |
| `labelledby` | `string` | - | ARIA labelledby ID |
| `describedby` | `string` | - | ARIA describedby ID |
| `el` | `HTMLDivElement` | - | Modal element reference (bindable) |
| `elBackdrop` | `HTMLDivElement` | - | Backdrop element reference (bindable) |

## Snippets

| Snippet | Description |
|---------|-------------|
| `header` | Optional header section |
| `children` | Main modal content |
| `footer` | Optional footer section |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Open modal, optionally track opener element |
| `close()` | Close modal |
| `setOpener(el)` | Set element to refocus when closed |
| `visibility()` | Returns object with `visible` getter |

## Usage

### Basic Modal

```svelte
<script lang="ts">
  import { Modal } from 'stuic';

  let modal: Modal;
</script>

<button onclick={(e) => modal.open(e)}>Open Modal</button>

<Modal
  bind:this={modal}
  onEscape={() => modal.close()}
>
  <div class="p-6">
    <h2>Modal Title</h2>
    <p>Modal content goes here.</p>
    <button onclick={() => modal.close()}>Close</button>
  </div>
</Modal>
```

### With Header and Footer

```svelte
<Modal bind:this={modal} onEscape={() => modal.close()}>
  {#snippet header()}
    <div class="p-4 border-b">
      <h2>Confirm Action</h2>
    </div>
  {/snippet}

  <div class="p-6">
    Are you sure you want to proceed?
  </div>

  {#snippet footer()}
    <div class="p-4 border-t flex justify-end gap-2">
      <button onclick={() => modal.close()}>Cancel</button>
      <button onclick={handleConfirm}>Confirm</button>
    </div>
  {/snippet}
</Modal>
```

### With Visibility Binding

```svelte
<script lang="ts">
  let visible = $state(false);
</script>

<button onclick={() => visible = true}>Open</button>

<Modal
  bind:visible
  onEscape={() => visible = false}
>
  <div class="p-6">Content</div>
</Modal>
```

### Custom Sizing

```svelte
<Modal
  bind:this={modal}
  classInner="max-w-lg"
  class="rounded-lg"
>
  <div class="p-6">Smaller modal</div>
</Modal>
```
