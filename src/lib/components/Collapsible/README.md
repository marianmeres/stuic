# Collapsible

A component that truncates content to a specified number of lines with an expand/collapse toggle. Automatically detects if truncation is needed and only shows the toggle when content overflows.

The toggle renders a **rotating chevron** by default (points down when collapsed, rotates 180° to point up when expanded). Height changes snap by default; pass `animate` to transition them instead.

## Props

| Prop                 | Type             | Default    | Description                                                                                          |
| -------------------- | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `children`           | `Snippet`        | -          | Content to display                                                                                   |
| `lines`              | `number`         | `1`        | Number of lines to show when collapsed                                                               |
| `expanded`           | `boolean`        | `false`    | Expanded state (bindable)                                                                            |
| `collapsedIndicator` | `string`         | -          | Text shown when collapsed. Opts **out** of the chevron (see below)                                   |
| `expandedIndicator`  | `string`         | -          | Text shown when expanded. Opts **out** of the chevron (see below)                                    |
| `animate`            | `boolean`        | `false`    | Opt-in: smoothly animate the height between collapsed/expanded. Respects `prefers-reduced-motion`    |
| `toggleAlign`        | `ToggleAlign`    | `"bottom"` | Vertical alignment of the toggle button — `"bottom"` \| `"top"` \| `"top-when-expanded"` (see below) |
| `class`              | `string`         | -          | Container element class                                                                              |
| `classContent`       | `string`         | -          | Content wrapper class                                                                                |
| `classToggle`        | `string`         | -          | Toggle button class                                                                                  |
| `style`              | `string`         | -          | Inline styles (for CSS variable overrides)                                                           |
| `el`                 | `HTMLDivElement` | -          | Bind reference to container element                                                                  |
| `t`                  | `TranslateFn`    | -          | Optional translate function                                                                          |

## Usage

### Basic Usage

```svelte
<script>
	import { Collapsible } from "stuic";
</script>

<Collapsible>
	This is a long text that will be truncated to one line with an ellipsis and a toggle
	button to expand it.
</Collapsible>
```

### Multiple Lines

```svelte
<Collapsible lines={3}>
	This content will be truncated to 3 lines before showing the expand toggle. Add more
	content here to see the effect.
</Collapsible>
```

### Animated Height (opt-in)

```svelte
<Collapsible lines={2} animate>
	Expanding and collapsing transitions the height instead of snapping.
</Collapsible>
```

Nothing animates unless you ask for it. With `animate`, the content is wrapped in a
`.stuic-collapsible-viewport` element whose height is driven to the natural height of the
(un)clamped content and transitioned; tune the duration with
`--stuic-collapsible-transition`. Under `prefers-reduced-motion: reduce` the height snaps,
exactly as it does without the prop.

### Toggle Alignment

`toggleAlign` (`CollapsibleToggleAlign`) controls where the toggle button sits vertically:

| Value                 | Collapsed | Expanded |
| --------------------- | --------- | -------- |
| `"bottom"` (default)  | bottom    | bottom   |
| `"top"`               | top       | top      |
| `"top-when-expanded"` | bottom    | top      |

```svelte
<!-- default: always next to the last clamped line -->
<Collapsible lines={2}>Content.</Collapsible>

<!-- always at the top, e.g. next to a heading-like first line -->
<Collapsible lines={2} toggleAlign="top">Content.</Collapsible>

<!-- bottom while collapsed, top once expanded — so the toggle does not run away
     down a long expanded paragraph -->
<Collapsible lines={2} toggleAlign="top-when-expanded">Content.</Collapsible>
```

### Indicators

The default indicator is a chevron that rotates 180° between the two states. Passing
**either** `collapsedIndicator` or `expandedIndicator` switches to plain text indicators;
the one you omit falls back to its legacy arrow (`↓` / `↑`).

```svelte
<!-- rotating chevron (default) -->
<Collapsible>Content.</Collapsible>

<!-- plain text indicators -->
<Collapsible collapsedIndicator="▼" expandedIndicator="▲">
	Content with custom expand/collapse indicators.
</Collapsible>
```

### Controlled State

```svelte
<script>
	import { Collapsible } from "stuic";

	let expanded = $state(false);
</script>

<button onclick={() => (expanded = !expanded)}> Toggle externally </button>

<Collapsible bind:expanded>This collapsible can be controlled from outside.</Collapsible>
```

### Custom Styling

```svelte
<Collapsible
	class="bg-gray-100 p-4 rounded"
	classContent="text-sm text-gray-600"
	classToggle="text-blue-500 font-bold"
>
	Styled collapsible content.
</Collapsible>
```

### CSS Variable Overrides

```svelte
<!-- Local override via inline style -->
<Collapsible style="--stuic-collapsible-toggle-opacity: 1;">
	Always fully visible toggle button.
</Collapsible>
```

## CSS Variables

Override to customize appearance:

| Variable                                   | Default                    | Description                                                       |
| ------------------------------------------ | -------------------------- | ----------------------------------------------------------------- |
| `--stuic-collapsible-toggle-opacity`       | `0.7`                      | Toggle button opacity                                             |
| `--stuic-collapsible-toggle-opacity-hover` | `1`                        | Hover opacity                                                     |
| `--stuic-collapsible-toggle-padding-x`     | `calc(var(--spacing) * 2)` | Horizontal padding                                                |
| `--stuic-collapsible-toggle-padding-y`     | `0.25rem`                  | Vertical padding                                                  |
| `--stuic-collapsible-chevron-size`         | `16px`                     | Chevron width/height                                              |
| `--stuic-collapsible-chevron-color`        | `currentColor`             | Chevron color                                                     |
| `--stuic-collapsible-transition`           | `150ms`                    | Transition duration (opacity, chevron rotation, `animate` height) |
| `--stuic-collapsible-ring-width`           | `2px`                      | Focus ring width                                                  |
| `--stuic-collapsible-ring-color`           | `--stuic-color-ring`       | Focus ring color                                                  |

### Global Override

```css
:root {
	--stuic-collapsible-toggle-opacity: 0.5;
	--stuic-collapsible-toggle-opacity-hover: 0.8;
}
```

## Accessibility

- The toggle is a real `<button>` carrying `aria-expanded`, which is also the hook the CSS
  uses to rotate the chevron.
- The chevron SVG is `aria-hidden`; the button's accessible name comes from `aria-label`
  (`t("more")` / `t("less")`), so it is announced even in chevron mode.
- Motion (chevron rotation and the opt-in height transition) is gated behind
  `prefers-reduced-motion: no-preference`.
