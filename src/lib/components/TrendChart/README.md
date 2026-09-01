# TrendChart

A thin Svelte wrapper around [`@marianmeres/trend-chart`](https://github.com/marianmeres/trend-chart)
(framework-agnostic, zero-dependency single-series SVG trend chart): reactive `data`
and `options` props, lifecycle management (create/update/destroy), a `sparkline`
preset, and automatic STUIC theming (dark mode included) by mapping the chart's
`--trend-chart-*` CSS hooks to STUIC tokens.

## Installation

This component ships as an **optional subpath export** — the
`@marianmeres/trend-chart` peer dependency is NOT bundled with stuic and is only
required if you actually use this component:

```bash
npm install @marianmeres/trend-chart
```

```svelte
<script>
	import { TrendChart } from "@marianmeres/stuic/trend-chart";
</script>
```

It is deliberately not exported from the main `@marianmeres/stuic` barrel, so
consumers who don't use it never pull the dependency into their module graph.

## Usage

```svelte
<script>
	import { TrendChart } from "@marianmeres/stuic/trend-chart";

	let data = $state([3, 5, 4, 8, 6, 9, 7]);
</script>

<!-- Full chart (axes, gridlines, pan/zoom) — themed via stuic tokens -->
<TrendChart {data} />

<!-- Sparkline (no axes/grid/interaction, compact height) -->
<TrendChart {data} sparkline />

<!-- Any @marianmeres/trend-chart option passes through -->
<TrendChart
	{data}
	options={{
		smooth: true,
		endDot: true,
		formatX: (x) => new Date(x).toLocaleDateString(),
		onPointClick: (e) => console.log(e.point),
	}}
/>

<!-- Imperative API via the bindable chart instance -->
<TrendChart {data} bind:chart />
<button onclick={() => chart?.resetDomain()}>Reset zoom</button>
```

Updating `data` (reassignment or deep `$state` mutation) patches the chart in
place — pan/zoom state is preserved. Changing `options` merges them into the
running instance.

### With `Stat` (KPI card)

The first-class pairing — a sparkline in a `Stat` footer:

```svelte
<script>
	import { Stat } from "@marianmeres/stuic";
	import { TrendChart } from "@marianmeres/stuic/trend-chart";
</script>

<Stat label="Requests" value="1.2M" delta="+8.4%" trend="up" hint="last 7 days">
	{#snippet renderFooter()}
		<TrendChart data={[42, 51, 48, 63, 58, 71, 84]} sparkline />
	{/snippet}
</Stat>
```

## Props

| Prop        | Type                | Default | Description                                                                                                                                                      |
| ----------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`      | `TrendData`         | —       | The series: `DataPoint[]` or plain `number[]` shorthand (index becomes x). Reactive.                                                                             |
| `options`   | `TrendChartOptions` | —       | [`@marianmeres/trend-chart` options](https://github.com/marianmeres/trend-chart/blob/master/API.md), passed through. Reactive. Merged OVER the sparkline preset. |
| `sparkline` | `boolean`           | `false` | Preset: no axes/grid/pan/zoom/points + compact default height                                                                                                    |
| `chart`     | `TrendChart`        | —       | Bindable underlying instance (`setDomainX`, `resetDomain`, ...). `undefined` during SSR/before mount.                                                            |
| `unstyled`  | `boolean`           | `false` | Skip all default styling — including the default height; size the container yourself                                                                             |
| `class`     | `string`            | -       | Additional CSS classes for the container                                                                                                                         |
| `el`        | `HTMLElement`       | -       | Bindable element reference (the chart's container)                                                                                                               |

## CSS Variables

| Variable                               | Default                               | Description                       |
| -------------------------------------- | ------------------------------------- | --------------------------------- |
| `--stuic-trend-chart-height`           | `8rem`                                | Container height                  |
| `--stuic-trend-chart-height-sparkline` | `2.5rem`                              | Container height with `sparkline` |
| `--stuic-trend-chart-line`             | `var(--stuic-color-primary)`          | Line stroke                       |
| `--stuic-trend-chart-fill`             | `var(--stuic-color-primary)`          | Area fill base color              |
| `--stuic-trend-chart-grid`             | `var(--stuic-color-border)`           | Gridline stroke                   |
| `--stuic-trend-chart-label`            | `var(--stuic-color-muted-foreground)` | Axis label color                  |
| `--stuic-trend-chart-font`             | `var(--font-sans)`                    | Label font family                 |
| `--stuic-trend-chart-end-dot-ring`     | `var(--stuic-color-background)`       | End-dot/hover-dot ring color      |
| `--stuic-trend-chart-annotation`       | `var(--stuic-color-warning)`          | Annotation rule + label color     |
| `--stuic-trend-chart-annotation-halo`  | `var(--stuic-color-background)`       | Halo behind annotation labels     |

These map onto the chart's own `--trend-chart-*` hooks (active because the DOM
renderer's `cssVars` option defaults to `true`). Any `lineColor`/`fill`/... option
you pass still acts as the fallback inside the `var()` wrapper.

## Notes

- **Sizing**: the chart measures its container (via `ResizeObserver`), so the
  container needs a real size. The default styles provide the height
  (`--stuic-trend-chart-height`); with `unstyled` you must size it yourself, or
  pass explicit `width`/`height` in `options`.
- **SSR**: the chart is created in an effect, so the server renders an empty
  container. For static server-rendered charts use the library's
  `renderToString` directly.
- Single-series by design (the underlying library's scope): one line/area — no
  bars, pies, or multi-series.
- The chart instance is created once per container; `data`/`options` changes
  patch it in place, so pan/zoom state survives updates.
