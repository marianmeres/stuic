# Stat

A KPI/stat card: a metric label, a prominent value, and an optional delta with trend
arrow and color-coded semantics (up/down/flat), plus an optional hint, corner icon, and
footer area (e.g. for a sparkline). Renders as a `<div>`, or as an `<a>`/`<button>` when
`href`/`onclick` is provided.

## Usage

```svelte
<script>
	import { Stat } from "@marianmeres/stuic";
	// optional, for the sparkline footer example below (see TrendChart's README):
	import { TrendChart } from "@marianmeres/stuic/trend-chart";
</script>

<!-- Basic -->
<Stat
	label="Total Revenue"
	value="$45,231.89"
	delta="+20.1%"
	trend="up"
	hint="vs. last month"
/>

<!-- Trend down (auto-colored destructive) -->
<Stat
	label="Bounce Rate"
	value="47.3%"
	delta="+2.4%"
	trend="up"
	trendIntent="destructive"
/>

<!-- Down is good here: override the auto color mapping -->
<Stat label="Churn" value="2.1%" delta="-0.4%" trend="down" trendIntent="success" />

<!-- With a corner icon -->
<Stat label="Active Users" value="2,338" delta="+180" trend="up">
	{#snippet renderIcon()}
		{@html iconUser({ size: 20 })}
	{/snippet}
</Stat>

<!-- Clickable (renders as <a>) -->
<Stat
	href="/analytics/revenue"
	label="Revenue"
	value="$45,231"
	delta="+20.1%"
	trend="up"
/>

<!-- Footer (sparkline, actions, ...) — first-class pairing with the TrendChart
     wrapper (subpath import; optional @marianmeres/trend-chart peer dep) -->
<Stat label="Requests" value="1.2M" delta="+8.4%" trend="up">
	{#snippet renderFooter()}
		<TrendChart data={[42, 51, 48, 63, 58, 71, 84]} sparkline />
	{/snippet}
</Stat>

<!-- Full override -->
<Stat>
	<div class="p-4">Completely custom content</div>
</Stat>
```

## Props

| Prop             | Type                                                             | Default  | Description                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`          | `THC`                                                            | -        | Small label above the value (metric name)                                                                                                      |
| `value`          | `THC \| number`                                                  | -        | The primary metric value, preformatted (e.g. `"$45,231.89"`)                                                                                   |
| `delta`          | `THC \| number`                                                  | -        | Delta/change indicator, preformatted (e.g. `"+20.1%"`)                                                                                         |
| `trend`          | `"up" \| "down" \| "flat"`                                       | -        | Trend direction — drives the arrow and (via `trendIntent="auto"`) the delta color                                                              |
| `trendIntent`    | `"auto" \| "success" \| "destructive" \| "warning" \| "neutral"` | `"auto"` | Delta color semantics. `"auto"` maps up→success, down→destructive, flat→neutral. Set explicitly for metrics where down is good (churn, costs). |
| `showTrendArrow` | `boolean`                                                        | `true`   | Show the trend direction arrow next to the delta                                                                                               |
| `hint`           | `THC`                                                            | -        | Secondary text next to the delta (e.g. "vs. last month")                                                                                       |
| `href`           | `string`                                                         | -        | Renders stat as `<a>`                                                                                                                          |
| `onclick`        | `(e: MouseEvent) => void`                                        | -        | Renders stat as `<button>`                                                                                                                     |
| `disabled`       | `boolean`                                                        | `false`  | Disabled state (reduced opacity, no interaction)                                                                                               |
| `unstyled`       | `boolean`                                                        | `false`  | Skip all default styling                                                                                                                       |
| `class`          | `string`                                                         | -        | Additional CSS classes for the stat shell                                                                                                      |
| `classLabel`     | `string`                                                         | -        | Additional CSS classes for the label                                                                                                           |
| `classValue`     | `string`                                                         | -        | Additional CSS classes for the value                                                                                                           |
| `classDelta`     | `string`                                                         | -        | Additional CSS classes for the delta                                                                                                           |
| `classHint`      | `string`                                                         | -        | Additional CSS classes for the hint                                                                                                            |
| `classFooter`    | `string`                                                         | -        | Additional CSS classes for the footer                                                                                                          |
| `el`             | `HTMLElement`                                                    | -        | Bindable element reference                                                                                                                     |

## Snippets

| Snippet        | Parameters | Description                                       |
| -------------- | ---------- | ------------------------------------------------- |
| `children`     | -          | Overrides the entire stat body                    |
| `renderIcon`   | -          | Icon area in the top-right corner (next to label) |
| `renderFooter` | -          | Footer area (sparkline, actions, metadata)        |

## CSS Variables

| Variable                              | Default                                                   | Description                         |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| `--stuic-stat-bg`                     | `var(--stuic-color-card, var(--stuic-color-background))`  | Background color                    |
| `--stuic-stat-bg-hover`               | `var(--stuic-color-card-hover, var(--stuic-color-muted))` | Hover background (interactive only) |
| `--stuic-stat-border-width`           | `1px`                                                     | Border width                        |
| `--stuic-stat-border`                 | `var(--stuic-color-border)`                               | Border color                        |
| `--stuic-stat-border-hover`           | `var(--stuic-color-border-hover)`                         | Hover border color                  |
| `--stuic-stat-radius`                 | `var(--radius-lg)`                                        | Border radius                       |
| `--stuic-stat-shadow`                 | `var(--shadow-sm)`                                        | Box shadow                          |
| `--stuic-stat-shadow-hover`           | `var(--shadow-md)`                                        | Hover box shadow                    |
| `--stuic-stat-transition`             | `150ms`                                                   | Transition duration                 |
| `--stuic-stat-padding`                | `1rem`                                                    | Padding                             |
| `--stuic-stat-gap`                    | `0.375rem`                                                | Vertical gap between rows           |
| `--stuic-stat-meta-gap`               | `0.5rem`                                                  | Gap between delta and hint          |
| `--stuic-stat-delta-gap`              | `0.25rem`                                                 | Gap between arrow and delta text    |
| `--stuic-stat-label-font-size`        | `var(--text-sm)`                                          | Label font size                     |
| `--stuic-stat-label-font-weight`      | `var(--font-weight-medium)`                               | Label font weight                   |
| `--stuic-stat-label-text`             | `var(--stuic-color-muted-foreground)`                     | Label text color                    |
| `--stuic-stat-value-font-size`        | `var(--text-2xl)`                                         | Value font size                     |
| `--stuic-stat-value-font-weight`      | `var(--font-weight-semibold)`                             | Value font weight                   |
| `--stuic-stat-value-line-height`      | `1.2`                                                     | Value line height                   |
| `--stuic-stat-value-text`             | `var(--stuic-color-foreground)`                           | Value text color                    |
| `--stuic-stat-delta-font-size`        | `var(--text-sm)`                                          | Delta font size                     |
| `--stuic-stat-delta-font-weight`      | `var(--font-weight-medium)`                               | Delta font weight                   |
| `--stuic-stat-delta-text-success`     | `var(--stuic-color-success)`                              | Delta color (success intent)        |
| `--stuic-stat-delta-text-destructive` | `var(--stuic-color-destructive)`                          | Delta color (destructive intent)    |
| `--stuic-stat-delta-text-warning`     | `var(--stuic-color-warning)`                              | Delta color (warning intent)        |
| `--stuic-stat-delta-text-neutral`     | `var(--stuic-color-muted-foreground)`                     | Delta color (neutral intent)        |
| `--stuic-stat-hint-font-size`         | `var(--text-sm)`                                          | Hint font size                      |
| `--stuic-stat-hint-text`              | `var(--stuic-color-muted-foreground)`                     | Hint text color                     |
| `--stuic-stat-icon-text`              | `var(--stuic-color-muted-foreground)`                     | Corner icon color                   |
| `--stuic-stat-ring-width`             | `3px`                                                     | Focus ring width                    |
| `--stuic-stat-ring-color`             | `var(--stuic-color-ring)`                                 | Focus ring color                    |
| `--stuic-stat-opacity-disabled`       | `0.5`                                                     | Disabled opacity                    |

## Notes

- The stat fills its parent container (`width: 100%; height: 100%`). Control sizing via
  the parent element (typically a CSS grid of KPI cards).
- The arrow shows the **direction** (`trend`), the color shows the **sentiment**
  (`trendIntent`). They are deliberately independent: a downward trend can be colored
  as success (churn, costs, error rate) via `trendIntent="success"`.
- Values and deltas are rendered as-is — format numbers/percentages/currencies yourself
  (e.g. via `Intl.NumberFormat`). Bare `number` values are stringified verbatim.
- The trend arrow is `aria-hidden`; make sure the delta text itself carries the sign
  (`"+20.1%"`, `"-3%"`) so the direction survives for screen readers.
- All content props (`label`, `value`, `delta`, `hint`) accept the THC type (plain
  string, HTML, component, or snippet).
- When using `href` or `onclick`, the entire stat becomes interactive with hover
  effects. Avoid placing interactive elements inside `renderFooter` in this case, as it
  creates invalid nested interactive HTML.
- Footer sticks to the bottom of the stat via `margin-top: auto` (relevant in
  equal-height grids).
- For a sparkline footer, the first-class pairing is the `TrendChart` wrapper
  (`import { TrendChart } from "@marianmeres/stuic/trend-chart"`) — a subpath
  export whose `@marianmeres/trend-chart` peer dependency stays opt-in (nothing
  is bundled unless you use it). See `src/lib/components/TrendChart/README.md`.
