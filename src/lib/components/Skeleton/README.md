# Skeleton

A loading placeholder component with shimmer and pulse animations. Automatically respects `prefers-reduced-motion` for accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"text" \| "circle" \| "rectangle"` | `"rectangle"` | Shape variant |
| `width` | `string` | - | Width (e.g., "100%", "200px") |
| `height` | `string` | CSS token | Height (e.g., "1rem", "40px") |
| `size` | `string` | - | Circle shorthand (sets both width & height) |
| `lines` | `number` | `1` | Number of text lines (text variant) |
| `gap` | `string` | CSS token | Gap between lines (text variant) |
| `lastLineWidth` | `string` | `"75%"` | Last line width (text variant) |
| `animation` | `"shimmer" \| "pulse" \| "none"` | `"shimmer"` | Animation style |
| `duration` | `string` | CSS token | Animation duration |
| `rounded` | `boolean \| string` | `true` | Border radius (boolean for default, string for custom) |
| `ariaLabel` | `string` | - | Accessibility label |
| `el` | `HTMLDivElement` | - | Bindable element reference |
| `class` | `string \| string[]` | - | CSS classes |

## Usage

### Basic

```svelte
<script lang="ts">
  import { Skeleton } from '@marianmeres/stuic';
</script>

<Skeleton width="100%" height="1rem" />
```

### Variants

```svelte
<!-- Rectangle (default) -->
<Skeleton width="200px" height="100px" />

<!-- Circle -->
<Skeleton variant="circle" size="48px" />

<!-- Text block -->
<Skeleton variant="text" lines={3} />
```

### Animations

```svelte
<Skeleton animation="shimmer" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />
```

### Custom Duration

```svelte
<Skeleton duration="2s" />

<!-- Or via CSS variable -->
<Skeleton style="--stuic-skeleton-duration: 2s;" />
```

### Card Skeleton Example

```svelte
<div class="flex items-center gap-4 p-4">
  <Skeleton variant="circle" size="48px" />
  <div class="flex-1 space-y-2">
    <Skeleton height="1rem" width="60%" />
    <Skeleton height="0.75rem" width="80%" />
  </div>
</div>
```

### List Skeleton Example

```svelte
{#each Array(5) as _}
  <div class="flex items-center gap-3 py-2">
    <Skeleton variant="circle" size="32px" />
    <Skeleton width="200px" />
  </div>
{/each}
```

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` prop:

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-skeleton-bg` | `--stuic-color-muted` | Base background color |
| `--stuic-skeleton-bg-highlight` | `--stuic-color-muted-hover` | Shimmer highlight color |
| `--stuic-skeleton-height` | `1rem` | Default height for text lines |
| `--stuic-skeleton-gap` | `0.5rem` | Gap between text lines |
| `--stuic-skeleton-radius` | `--radius-sm` | Default border radius |
| `--stuic-skeleton-duration` | `1.5s` | Animation duration |
| `--stuic-skeleton-timing` | `ease-in-out` | Animation timing function |
| `--stuic-skeleton-pulse-opacity` | `0.4` | Pulse animation minimum opacity |

### Customization Examples

```css
/* Global override - different colors */
:root {
  --stuic-skeleton-bg: var(--color-gray-200);
  --stuic-skeleton-bg-highlight: var(--color-gray-300);
}

/* Global override - slower animation */
:root {
  --stuic-skeleton-duration: 2s;
}

/* Global override - sharper corners */
:root {
  --stuic-skeleton-radius: 0;
}
```

```svelte
<!-- Local override - faster animation -->
<Skeleton style="--stuic-skeleton-duration: 0.8s;" />

<!-- Local override - custom colors -->
<Skeleton style="--stuic-skeleton-bg: oklch(0.9 0.02 250);" />

<!-- Local override - no rounded corners -->
<Skeleton rounded={false} />

<!-- Local override - custom radius -->
<Skeleton rounded="1rem" />
```

## Accessibility

- Uses `role="status"` and `aria-busy="true"` by default
- Optional `ariaLabel` prop for custom screen reader text
- Automatically disables animations when `prefers-reduced-motion: reduce` is set

## Theming

The Skeleton component uses theme tokens for colors:

- Background: `--stuic-color-muted`
- Highlight: `--stuic-color-muted-hover`

These automatically adapt to light/dark mode when using the STUIC theming system.
