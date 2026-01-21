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
| `onBackdropClick` | `() => void` | - | Callback when backdrop area is clicked |
| `noScrollLock` | `boolean` | `false` | Disable body scroll locking |
| `el` | `HTMLDivElement` | - | Element reference (bindable) |
| `class` | `string` | - | Additional CSS classes |

## Methods

| Method | Description |
|--------|-------------|
| `open(opener?)` | Show backdrop, optionally track opener element |
| `close()` | Hide backdrop |
| `setOpener(el)` | Set element to refocus when closed |
| `visibility()` | Returns object with `visible` getter |

## CSS Variables

Override these tokens to customize appearance:

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-backdrop-bg` | `rgb(0 0 0 / 0.5)` | Background color |
| `--stuic-backdrop-z-index` | `10` | Stacking order |

### Global Override

```css
:root {
  --stuic-backdrop-bg: rgb(0 0 0 / 0.7);
  --stuic-backdrop-z-index: 50;
}
```

### Local Override

```svelte
<Backdrop
  bind:visible
  style="--stuic-backdrop-bg: rgb(0 0 0 / 0.8);"
>
  ...
</Backdrop>
```

### Tailwind Class Override

You can still override styles using Tailwind classes via the `class` prop:

```svelte
<Backdrop bind:visible class="bg-black/25">
  ...
</Backdrop>
```

## Usage

### Basic Backdrop

```svelte
<script lang="ts">
  import { Backdrop } from '@marianmeres/stuic';

  let visible = $state(false);
</script>

<button onclick={() => visible = true}>Open</button>

<Backdrop
  bind:visible
  onEscape={() => visible = false}
  onBackdropClick={() => visible = false}
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
  import { Backdrop } from '@marianmeres/stuic';

  let backdrop: Backdrop;
</script>

<button onclick={(e) => backdrop.open(e)}>Open</button>

<Backdrop
  bind:this={backdrop}
  onEscape={() => backdrop.close()}
>
  <div class="m-auto p-8 bg-white rounded">
    Content here
  </div>
</Backdrop>
```

### Custom Styling

```svelte
<!-- Lighter overlay -->
<Backdrop bind:visible class="bg-black/25">
  <div>Overlay content</div>
</Backdrop>

<!-- Blur effect with CSS variable override -->
<Backdrop
  bind:visible
  class="backdrop-blur-sm"
  style="--stuic-backdrop-bg: rgb(0 0 0 / 0.3);"
>
  <div>Blurred backdrop content</div>
</Backdrop>

<!-- Higher z-index for stacking -->
<Backdrop
  bind:visible
  style="--stuic-backdrop-z-index: 100;"
>
  <div>High priority overlay</div>
</Backdrop>
```

### Without Scroll Lock

```svelte
<Backdrop bind:visible noScrollLock>
  <div>Overlay content - page still scrollable</div>
</Backdrop>
```
