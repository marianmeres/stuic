# X

A simple SVG close/dismiss icon (X shape) with configurable stroke width.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `strokeWidth` | `0.5 \| 1 \| 1.5 \| 2 \| 2.5 \| 3 \| 3.5 \| 4` | `2` | Stroke width of the X lines |
| `class` | `string` | - | CSS classes (default size is `size-6` / 1.5rem) |

## Usage

### Basic Close Icon

```svelte
<script lang="ts">
  import { X } from 'stuic';
</script>

<button>
  <X />
</button>
```

### Different Sizes

```svelte
<X class="size-4" />
<X class="size-6" />
<X class="size-8" />
```

### Different Stroke Widths

```svelte
<X strokeWidth={1} />
<X strokeWidth={2} />
<X strokeWidth={3} />
```

### With Custom Color

```svelte
<X class="text-red-500" />
<X class="text-gray-400" />
```

### In a Close Button

```svelte
<button
  onclick={handleClose}
  class="p-2 hover:bg-gray-100 rounded-full"
>
  <X strokeWidth={1.5} class="size-5" />
</button>
```

### In a Dismissible Element

```svelte
<div class="flex items-center justify-between p-4 bg-blue-100 rounded">
  <span>Notification message</span>
  <button onclick={() => visible = false}>
    <X class="size-4 text-blue-600 hover:text-blue-800" />
  </button>
</div>
```
