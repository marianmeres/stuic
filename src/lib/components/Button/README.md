# Button

A flexible button component with style variants, sizes, and optional toggle/switch behavior. Can render as a button or anchor tag.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| string` | - | Style variant |
| `size` | `"sm" \| "md" \| "lg" \| string` | - | Button size |
| `muted` | `boolean` | `false` | Reduce text contrast for less emphasis |
| `noshadow` | `boolean` | `false` | Remove shadow effect |
| `noborder` | `boolean` | `false` | Remove border |
| `unstyled` | `boolean` | `false` | Skip all default styling |
| `inverse` | `boolean` | `false` | Transparent bg, styled on hover |
| `href` | `string` | - | Render as anchor tag with this URL |
| `roleSwitch` | `boolean` | `false` | Enable toggle/switch behavior |
| `checked` | `boolean` | `false` | Toggle state when `roleSwitch` is true (bindable) |
| `el` | `Element` | - | Element reference (bindable) |
| `class` | `string` | - | Additional CSS classes |

## Snippet Props

The `children` snippet receives `{ checked }` when `roleSwitch` is enabled.

## Usage

### Basic Variants

```svelte
<script lang="ts">
  import { Button } from 'stuic';
</script>

<Button>Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Inverse Style (Ghost Button)

```svelte
<Button inverse>
  Hover to see background
</Button>
```

### As Link

```svelte
<Button href="/dashboard">
  Go to Dashboard
</Button>
```

### Toggle Button

```svelte
<script lang="ts">
  import { Button } from 'stuic';

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
<Button
  unstyled
  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
>
  Fully Custom
</Button>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--stuic-button-bg` | `--stuic-surface-interactive` | Background color |
| `--stuic-button-text` | `--stuic-text` | Text color |
| `--stuic-button-border` | `--stuic-border-strong` | Border color |
| `--stuic-button-border-focus` | `--stuic-border-focus` | Focus ring color |

### Example Override

```css
:root {
  --stuic-button-bg: var(--color-slate-200);
  --stuic-button-border: var(--color-slate-400);
}
```
