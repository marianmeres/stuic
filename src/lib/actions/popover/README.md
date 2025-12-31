# Popover Action

A Svelte action that displays an anchored popover using CSS Anchor Positioning, with fallback to a centered modal when not supported.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable popover |
| `content` | `THC \| null` | - | Popover content (string, HTML, component, or snippet) |
| `position` | `PopoverPosition` | `"bottom"` | Placement relative to anchor |
| `trigger` | `"click" \| "hover"` | `"click"` | Trigger mode |
| `showDelay` | `number` | `100` | Delay before showing (ms) |
| `hideDelay` | `number` | `200` | Delay before hiding (ms) |
| `class` | `string` | - | Custom CSS for popover container |
| `offset` | `string` | `"0.25rem"` | Margin from anchor (CSS value) |
| `closeOthers` | `boolean` | `false` | Close other open popovers |
| `closeOnClickOutside` | `boolean` | `true` | Close on outside click (click trigger) |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `showBackdrop` | `boolean` | `true` | Show backdrop in fallback mode |
| `forceFallback` | `boolean` | `false` | Force centered modal mode |
| `onShow` | `() => void` | - | Callback when popover opens |
| `onHide` | `() => void` | - | Callback when popover closes |

## Positions

```
top-left       top        top-right
top-span-left           top-span-right

         left  [anchor]  right

bottom-span-left        bottom-span-right
bottom-left   bottom    bottom-right
```

## Usage

### Click Trigger (Default)

```svelte
<script lang="ts">
  import { popover } from 'stuic';
</script>

<button use:popover={() => ({
  content: "Hello! This is a popover."
})}>
  Click Me
</button>
```

### Hover Trigger

```svelte
<button use:popover={() => ({
  content: "Hover content here",
  trigger: "hover",
  position: "top"
})}>
  Hover Me
</button>
```

### HTML Content

```svelte
<button use:popover={() => ({
  content: { html: "<strong>Bold</strong> and <em>italic</em>" },
  position: "right"
})}>
  With HTML
</button>
```

### Component Content

```svelte
<script lang="ts">
  import MyPopoverContent from './MyPopoverContent.svelte';
</script>

<button use:popover={() => ({
  content: { component: MyPopoverContent, props: { data: someData } }
})}>
  With Component
</button>
```

### Dynamic Content

```svelte
<script lang="ts">
  let count = $state(0);
</script>

<button use:popover={() => ({
  content: `Count: ${count}`,
  position: "top"
})}>
  Count: {count}
</button>
```

### With Callbacks

```svelte
<button use:popover={() => ({
  content: "Tracked popover",
  onShow: () => console.log('Opened'),
  onHide: () => console.log('Closed')
})}>
  Tracked
</button>
```

### Close Others

```svelte
<button use:popover={() => ({
  content: "Only one at a time",
  closeOthers: true
})}>
  Exclusive
</button>
```

## Helper Function

```ts
import { isPopoverSupported } from 'stuic';

if (isPopoverSupported()) {
  // CSS Anchor Positioning is available
} else {
  // Will use fallback centered modal
}
```

## Notes

- Uses CSS Anchor Positioning API when available
- Falls back to centered modal overlay when not supported
- For hover mode, popover persists when cursor moves to the popover itself
- ARIA attributes are automatically managed (`aria-haspopup`, `aria-expanded`, `aria-controls`)
