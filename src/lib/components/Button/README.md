# Button

A flexible button component with semantic intents, visual variants, sizes, and optional toggle/switch behavior. Can render as a button or anchor tag.

## Props

| Prop         | Type                                                               | Default   | Description                                       |
| ------------ | ------------------------------------------------------------------ | --------- | ------------------------------------------------- |
| `intent`     | `"primary" \| "accent" \| "destructive" \| "warning" \| "success"` | -         | Semantic color intent                             |
| `variant`    | `"solid" \| "outline" \| "ghost" \| "soft" \| "link"`              | `"solid"` | Visual variant (how colors are applied)           |
| `size`       | `"sm" \| "md" \| "lg" \| "xl"`                                     | `"md"`    | Button size                                       |
| `muted`      | `boolean`                                                          | `false`   | Reduce emphasis (lower opacity)                   |
| `raised`     | `boolean`                                                          | `false`   | 3D push effect                                    |
| `unstyled`   | `boolean`                                                          | `false`   | Skip all default styling                          |
| `href`       | `string`                                                           | -         | Render as anchor tag with this URL                |
| `roleSwitch` | `boolean`                                                          | `false`   | Enable toggle/switch behavior                     |
| `checked`    | `boolean`                                                          | `false`   | Toggle state when `roleSwitch` is true (bindable) |
| `el`         | `HTMLElement`                                                      | -         | Element reference (bindable)                      |
| `iconButton` | `boolean`                                                          | `false`   | Icon-only button (implies aspect1, adds CSS hook) |
| `iconSwap`   | `[string \| Snippet, string \| Snippet]`                           | -         | Two icon states with swap animation (implies iconButton) |
| `x`          | `boolean \| XProps`                                                | -         | Normalized "X" icon button shortcut (close/dismiss) |
| `nav`        | `"prev" \| "next" \| ButtonNavProps`                               | -         | Normalized prev/next icon button shortcut (arrow by default; `x` wins on conflict) |
| `iconEdge`   | `"leading" \| "trailing"`                                          | -         | Trim icon-side padding to the y-padding (pill + edge-flush icon; pair with `roundedFull`) |
| `class`      | `string`                                                           | -         | Additional CSS classes                            |

## Snippet Props

The `children` snippet receives `{ checked }` when `roleSwitch` is enabled.

## Usage

### Intent x Variant

```svelte
<script lang="ts">
	import { Button } from "@marianmeres/stuic";
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
<Button href="/dashboard" intent="primary">Go to Dashboard</Button>
```

### Toggle Button

```svelte
<script lang="ts">
	import { Button } from "@marianmeres/stuic";

	let isActive = $state(false);
</script>

<Button roleSwitch bind:checked={isActive}>
	{#snippet children({ checked })}
		{checked ? "ON" : "OFF"}
	{/snippet}
</Button>
```

### Icon Button

```svelte
<!-- Icon-only buttons -->
<Button iconButton intent="primary">{@html iconPlus()}</Button>
<Button iconButton roundedFull variant="ghost">{@html iconSettings()}</Button>

<!-- X buttons are icon buttons automatically -->
<Button x />

<!-- Icon swap: two states driven by checked -->
<Button iconSwap={[iconPlus(), iconMinus()]} roleSwitch bind:checked roundedFull />
```

### Nav (prev / next)

Shortcut for a normalized prev/next navigation icon button (square, fully
rounded, arrow icon). Mirrors the `x` shortcut pattern — single `nav`
prop carries the direction so contradictory props are impossible.

```svelte
<!-- Shorthand: default arrow in the correct direction -->
<Button nav="prev" />
<Button nav="next" />

<!-- Cascades intent / variant / size like `x` -->
<Button nav="prev" intent="primary" size="sm" />
<Button nav="next" variant="ghost" />

<!-- Override the default arrow (e.g. chevron) via object form -->
<Button nav={{ direction: "prev", icon: iconChevronLeft() }} />
<Button nav={{ direction: "next", icon: iconChevronRight({ size: 18 }) }} />
```

Notes:

- `nav` implies `iconButton` (square + fully-rounded).
- `ghost + nav + roundedFull` auto-applies the same neutral overlay hover
  used by the rounded X — handy for carousels/lightboxes on imagery.
- If both `x` and `nav` are set on the same Button, `x` takes precedence.

Global CSS targeting for all icon buttons:

```css
.stuic-button[data-icon-button] {
	--stuic-button-radius: 9999px;
}
```

### Pill with edge-flush icon (`iconEdge`)

The "rounded icon button with label" look: a pill-shaped button whose leading (or
trailing) icon sits the same distance from the edge as a rounded icon (nav) button.
`iconEdge` trims the icon-side horizontal padding down to the vertical padding — it's
size-aware and uses logical properties, so `leading`/`trailing` follow text direction
(RTL-safe). It does NOT round the button on its own; pair it with `roundedFull`.

```svelte
<Button roundedFull iconEdge="leading">{@html iconArrowLeft({ size: 24 })} Back</Button>
<Button roundedFull iconEdge="trailing">Next {@html iconArrowRight({ size: 24 })}</Button>
```

Notes:

- `iconEdge` is composable — it only trims padding, so it also works on a
  default-radius (non-pill) button if you want the icon flush without the pill shape.
- You compose the icon + label yourself in `children` (no default icon, unlike `nav`),
  so it works with any icon. Use `size: 24` to match the nav button's arrow.

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
<Button intent="primary" style="--stuic-button-radius: 9999px;">Pill Shape</Button>
```

## CSS Variables

### Component Tokens

| Variable                       | Default                | Description         |
| ------------------------------ | ---------------------- | ------------------- |
| `--stuic-button-radius`        | `--radius-md`          | Border radius       |
| `--stuic-button-font-family`   | `--font-sans`          | Font family         |
| `--stuic-button-font-weight`   | `--font-weight-medium` | Font weight         |
| `--stuic-button-transition`    | `100ms`                | Transition duration |
| `--stuic-button-ring-width`    | `3px`                  | Focus ring width    |
| `--stuic-button-ring-color`    | `--stuic-color-ring`   | Focus ring color    |
| `--stuic-button-raised-offset` | `2px`                  | 3D effect offset    |
| `--stuic-button-raised-color`  | `rgb(0 0 0 / 0.8)`     | 3D shadow color     |

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
- `data-rounded-full` - Present when roundedFull
- `data-icon-edge` - Set to `"leading"` or `"trailing"` when iconEdge is set
- `data-aspect1` - Present when aspect1 (or iconButton, or x, or nav)
- `data-icon-button` - Present when iconButton (or x, or nav)
- `data-x` - Present when x is set
- `data-nav` - Set to `"prev"` or `"next"` when nav is set
