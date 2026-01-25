# Button

A flexible button component with semantic intents, visual variants, sizes, and optional toggle/switch behavior. Can render as a button or anchor tag.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intent` | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | - | Semantic color intent |
| `variant` | `"solid" \| "outline" \| "ghost" \| "soft" \| "link"` | `"solid"` | Visual variant (how colors are applied) |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Button size |
| `muted` | `boolean` | `false` | Reduce emphasis (lower opacity) |
| `raised` | `boolean` | `false` | 3D push effect |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `href` | `string` | - | Render as anchor tag with this URL |
| `roleSwitch` | `boolean` | `false` | Enable toggle/switch behavior |
| `checked` | `boolean` | `false` | Toggle state when `roleSwitch` is true (bindable) |
| `el` | `HTMLElement` | - | Element reference (bindable) |
| `class` | `string` | - | Additional CSS classes |

## Snippet Props

The `children` snippet receives `{ checked }` when `roleSwitch` is enabled.

## Usage

### Intent x Variant

```svelte
<script lang="ts">
  import { Button } from '@marianmeres/stuic';
</script>

<!-- Intent determines the color palette -->
<Button intent="primary">Primary</Button>
<Button intent="destructive">Destructive</Button>
<Button intent="success">Success</Button>

<!-- Variant determines how colors are applied -->
<Button intent="primary" variant="solid">Solid</Button>
<Button intent="primary" variant="outline">Outline</Button>
<Button intent="primary" variant="ghost">Ghost</Button>
<Button intent="primary" variant="soft">Soft</Button>
<Button intent="primary" variant="link">Link</Button>
```

### Sizes

```svelte
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### 3D Push Effect

```svelte
<Button intent="primary" raised>Push Me</Button>
```

### As Link

```svelte
<Button href="/dashboard" intent="primary">
  Go to Dashboard
</Button>
```

### Toggle Button

```svelte
<script lang="ts">
  import { Button } from '@marianmeres/stuic';

  let isActive = $state(false);
</script>

<Button roleSwitch bind:checked={isActive}>
  {#snippet children({ checked })}
    {checked ? 'ON' : 'OFF'}
  {/snippet}
</Button>
```

### Custom Styling

```svelte
<!-- Using unstyled for full control -->
<Button
  unstyled
  class="bg-gradient-to-red from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg"
>
  Gradient Button
</Button>

<!-- Override component tokens inline -->
<Button intent="primary" style="--stuic-button-radius: 9999px;">
  Pill Shape
</Button>
```

## CSS Variables

### Component Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-button-radius` | `--radius-md` | Border radius |
| `--stuic-button-font-family` | `--font-sans` | Font family |
| `--stuic-button-font-weight` | `--font-weight-medium` | Font weight |
| `--stuic-button-transition` | `100ms` | Transition duration |
| `--stuic-button-ring-width` | `3px` | Focus ring width |
| `--stuic-button-ring-color` | `--stuic-color-ring` | Focus ring color |
| `--stuic-button-raised-offset` | `2px` | 3D effect offset |
| `--stuic-button-raised-color` | `rgb(0 0 0 / 0.8)` | 3D shadow color |

### Size Tokens

Each size (sm, md, lg, xl) has corresponding tokens:
- `--stuic-button-padding-x-{size}`
- `--stuic-button-padding-y-{size}`
- `--stuic-button-font-size-{size}`
- `--stuic-button-min-height-{size}`

### Intent Color Tokens

Override these to customize intent colors globally:

```css
:root {
  --stuic-color-primary: var(--color-blue-600);
  --stuic-color-primary-hover: var(--color-blue-700);
  --stuic-color-primary-active: var(--color-blue-800);
  --stuic-color-primary-foreground: var(--color-white);
}
```

Available intents: `primary`, `accent`, `destructive`, `warning`, `success`

## Data Attributes

The component uses data attributes for styling:
- `data-intent` - The intent value
- `data-variant` - The variant value
- `data-size` - The size value
- `data-muted` - Present when muted
- `data-raised` - Present when raised
- `data-checked` - Present when roleSwitch is enabled and checked
