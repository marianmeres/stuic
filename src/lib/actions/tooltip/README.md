# Tooltip Action

A Svelte action that displays a tooltip anchored to an element using CSS Anchor Positioning. Only works in browsers that support CSS Anchor Positioning.

## Options

| Option     | Type              | Default | Description                               |
| ---------- | ----------------- | ------- | ----------------------------------------- |
| `enabled`  | `boolean`         | `true`  | Enable/disable tooltip                    |
| `content`  | `string \| null`  | -       | Tooltip text (falls back to `aria-label`) |
| `position` | `TooltipPosition` | `"top"` | Placement relative to anchor              |
| `class`    | `string`          | -       | Custom CSS for tooltip                    |
| `onShow`   | `() => void`      | -       | Callback when tooltip shows               |
| `onHide`   | `() => void`      | -       | Callback when tooltip hides               |

## Positions

```
top-left    top    top-right

   left  [anchor]  right

bottom-left bottom bottom-right
```

## Usage

### Basic Tooltip

```svelte
<script lang="ts">
	import { tooltip } from "stuic";
</script>

<button use:tooltip={() => ({ content: "Save your changes" })}> Save </button>
```

### Using aria-label

```svelte
<!-- Content is taken from aria-label when not specified -->
<button aria-label="Delete item" use:tooltip> Delete </button>
```

### Different Positions

```svelte
<button use:tooltip={() => ({ content: "Top", position: "top" })}> Top </button>

<button use:tooltip={() => ({ content: "Bottom", position: "bottom" })}> Bottom </button>

<button use:tooltip={() => ({ content: "Left", position: "left" })}> Left </button>

<button use:tooltip={() => ({ content: "Right", position: "right" })}> Right </button>
```

### Custom Styling

```svelte
<button
	use:tooltip={() => ({
		content: "Custom styled tooltip",
		class: "bg-blue-600 text-white",
	})}
>
	Styled
</button>
```

### Conditional Tooltip

```svelte
<script lang="ts">
	let showTooltip = $state(true);
</script>

<button
	use:tooltip={() => ({
		content: "Conditional tooltip",
		enabled: showTooltip,
	})}
>
	Conditional
</button>
```

### With Callbacks

```svelte
<button
	use:tooltip={() => ({
		content: "Tracked tooltip",
		onShow: () => console.log("Tooltip shown"),
		onHide: () => console.log("Tooltip hidden"),
	})}
>
	Tracked
</button>
```

## Helper Function

```ts
import { isTooltipSupported } from "stuic";

if (isTooltipSupported()) {
	// CSS Anchor Positioning is available
} else {
	// Tooltip will not work
}
```

## Notes

- Requires CSS Anchor Positioning support (no fallback)
- Shows on hover or focus with 200ms delay
- Tooltip persists when hovering over it
- ARIA attributes are automatically managed (`aria-describedby`, `aria-expanded`)
- Maximum width is 16rem (256px) by default

## CSS Variables

| Variable               | Default                   | Description        |
| ---------------------- | ------------------------- | ------------------ |
| `--stuic-tooltip-bg`   | `--stuic-surface-overlay` | Tooltip background |
| `--stuic-tooltip-text` | `--stuic-text-inverse`    | Tooltip text color |

### Example Override

```css
:root {
	--stuic-tooltip-bg: var(--color-indigo-900);
	--stuic-tooltip-text: var(--color-indigo-100);
}
```

**Note:** Tooltip CSS variables may not work with inline style props because tooltips are created outside the anchor's DOM tree. Set them in your global CSS.

## Browser Support

Check [Can I Use - CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning) for current browser support. As of 2025, supported in Chrome 125+ and Edge 125+.
