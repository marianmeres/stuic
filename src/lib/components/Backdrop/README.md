# Backdrop

A semi-transparent overlay with focus trap and body scroll locking. Commonly used as the background layer for modals and drawers.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `false` | Controls backdrop visibility (bindable) |
| `focusTrap` | `boolean \| FocusTrapOptions` | `true` | Enable focus trapping within backdrop |
| `fadeInDuration` | `number` | `50` | Fade in transition duration (ms) |
| `fadeOutDuration` | `number` | `150` | Fade out transition duration (ms) |
| `transitionEnabled` | `boolean` | `true` | Enable/disable transitions |
| `onEscape` | `() => void` | - | Callback when Escape key is pressed |
| `noScrollLock` | `boolean` | `false` | Disable body scroll locking |
| `el` | `HTMLDivElement` | - | Element reference (bindable) |
| `class` | `string` | - | CSS classes for backdrop |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Show backdrop, optionally track opener element |
| `close()` | Hide backdrop |
| `setOpener(el)` | Set element to refocus when closed |
| `visibility()` | Returns object with `visible` getter |

## Usage

### Basic Backdrop

```svelte
<script lang="ts">
  import { Backdrop } from 'stuic';

  let visible = $state(false);
</script>

<button onclick={() => visible = true}>Open</button>

<Backdrop
  bind:visible
  onEscape={() => visible = false}
  class="bg-black/50"
>
  <div class="m-auto p-8 bg-white rounded">
    Modal content
    <button onclick={() => visible = false}>Close</button>
  </div>
</Backdrop>
```

### With Component Methods

```svelte
<script lang="ts">
  import { Backdrop } from 'stuic';

  let backdrop: Backdrop;
</script>

<button onclick={(e) => backdrop.open(e)}>Open</button>

<Backdrop
  bind:this={backdrop}
  onEscape={() => backdrop.close()}
  class="bg-black/50"
>
  <div class="m-auto p-8 bg-white rounded">
    Content here
  </div>
</Backdrop>
```

### Without Scroll Lock

```svelte
<Backdrop bind:visible noScrollLock class="bg-black/25">
  <div>Overlay content - page still scrollable</div>
</Backdrop>
```
