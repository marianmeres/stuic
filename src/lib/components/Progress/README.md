# Progress

A progress indicator available as either a horizontal bar or circular display.

## Props

| Prop       | Type                | Default | Description                                                  |
| ---------- | ------------------- | ------- | ------------------------------------------------------------ |
| `type`     | `"bar" \| "circle"` | `"bar"` | Display type                                                 |
| `progress` | `number`            | `0`     | Progress value (0-100)                                       |
| `class`    | `string`            | -       | CSS classes for container                                    |
| `style`    | `string`            | -       | Inline styles for container (use for CSS variable overrides) |
| `classBar` | `string`            | -       | CSS classes for bar fill (bar type only)                     |
| `styleBar` | `string`            | -       | Inline styles for bar fill (bar type only)                   |

## Usage

### Basic Bar

```svelte
<script lang="ts">
	import { Progress } from "@marianmeres/stuic";

	let progress = $state(0);
</script>

<Progress {progress} />
```

### Circle Progress

```svelte
<Progress type="circle" progress={75} />
```

### Animated Progress

```svelte
<script lang="ts">
	let progress = $state(0);

	function start() {
		progress = 0;
		const interval = setInterval(() => {
			progress += 10;
			if (progress >= 100) clearInterval(interval);
		}, 300);
	}
</script>

<Progress {progress} />
<button onclick={start}>Start</button>
```

### Custom Sizing

```svelte
<!-- Taller bar -->
<Progress progress={60} style="--stuic-progress-height: 1rem;" />

<!-- Larger circle -->
<Progress type="circle" progress={75} style="--stuic-progress-circle-size: 6rem;" />
```

### Custom Colors

```svelte
<!-- Override accent color inline -->
<Progress progress={80} style="--stuic-progress-accent: var(--stuic-color-success);" />

<!-- Using Tailwind classes -->
<Progress progress={60} classBar="bg-green-500" />
```

### With Border Radius

```svelte
<Progress progress={50} style="--stuic-progress-radius: var(--radius-full);" />
```

## CSS Variables

### Component Tokens

Override globally in `:root` or locally via `style` prop:

| Variable                               | Default                     | Description                         |
| -------------------------------------- | --------------------------- | ----------------------------------- |
| `--stuic-progress-bg`                  | `--stuic-color-muted`       | Track background color              |
| `--stuic-progress-accent`              | `--stuic-color-primary`     | Progress fill color                 |
| `--stuic-progress-height`              | `calc(var(--spacing) * 2)`  | Bar height (0.5rem)                 |
| `--stuic-progress-radius`              | `--radius-sm`               | Border radius                       |
| `--stuic-progress-transition`          | `100ms`                     | Animation duration                  |
| `--stuic-progress-circle-size`         | `calc(var(--spacing) * 16)` | Circle dimensions (4rem)            |
| `--stuic-progress-circle-stroke-width` | `10`                        | Circle stroke width (viewBox units) |

### Example Overrides

```css
/* Global override */
:root {
	--stuic-progress-accent: var(--stuic-color-accent);
	--stuic-progress-height: calc(var(--spacing) * 3);
	--stuic-progress-radius: var(--radius-full);
}
```

```svelte
<!-- Local override -->
<Progress
	progress={75}
	style="--stuic-progress-accent: var(--stuic-color-success); --stuic-progress-height: 1rem;"
/>
```

## Theming

The component uses theme color tokens:

- `--stuic-color-muted` for the track background
- `--stuic-color-primary` for the progress fill

These automatically adapt to light/dark mode when using a properly configured theme.

To show different states (success, warning, error), override the accent color:

```svelte
<Progress progress={100} style="--stuic-progress-accent: var(--stuic-color-success);" />

<Progress progress={90} style="--stuic-progress-accent: var(--stuic-color-warning);" />

<Progress
	progress={50}
	style="--stuic-progress-accent: var(--stuic-color-destructive);"
/>
```
