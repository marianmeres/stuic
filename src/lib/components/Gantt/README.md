# Gantt

Horizontal schedule chart: a shared time axis across the top, one lane per row,
and bars for the ranges each lane occupies. The classic project plan (task per
row, progress, milestones), but the same component also draws resource lanes —
a row can hold any number of bars.

Everything is **whole-day and inclusive at both ends**: `from: "2026-09-01",
to: "2026-09-03"` is three days, and no timezone can shift a bar by one. Columns
can be days, weeks or months; bars are positioned through the columns, so a
February column is the same width as March while still holding fewer days.

Read-only by design — there is no drag-to-reschedule and no dependency arrows.
For a vertical event list (activity feeds, audit logs) use `Timeline` instead.

## Props

| Prop            | Type                                  | Default    | Description                                                           |
| --------------- | ------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `rows`          | `GanttRow[]`                          | required   | The lanes, in display order (sort them yourself)                      |
| `from`          | `string \| Date`                      | -          | Window start, inclusive. Default: the earliest date in `rows`         |
| `to`            | `string \| Date`                      | -          | Window end, inclusive. Default: the latest date in `rows`             |
| `unit`          | `"day" \| "week" \| "month"`          | `"day"`    | Column granularity; `week`/`month` snap the window out to whole units |
| `weekStartsOn`  | `1`–`7`                               | `1`        | First day of a week for `unit="week"` (1 = Monday … 7 = Sunday)       |
| `locale`        | `string`                              | -          | BCP 47 tag for month/weekday names and the default `aria-label`s      |
| `today`         | `string \| Date \| null`              | today      | The day the marker line sits on; `null` removes it                    |
| `unitWidth`     | `number \| "fit"`                     | token      | **Minimum** column width in px (the zoom); `"fit"` drops the minimum  |
| `labels`        | `boolean`                             | auto       | Show the left label column; defaults to on when any row has a `label` |
| `barLabels`     | `"inside" \| "after" \| "none"`       | `"inside"` | Where a bar's own `label` is drawn                                    |
| `onSelect`      | `(detail: GanttSelectDetail) => void` | -          | Bar click / Enter / Space — also what makes bars focusable buttons    |
| `formatColumn`  | `(column, axis) => string`            | -          | Override a unit cell's header text                                    |
| `formatGroup`   | `(group, axis) => string`             | -          | Override a group cell's header text                                   |
| `formatBarAria` | `(detail) => string`                  | -          | Override a bar's accessible name                                      |
| `unstyled`      | `boolean`                             | `false`    | Skip all default styling (the `data-*` contract stays)                |
| `class`         | `string`                              | -          | Additional CSS classes (merged via twMerge)                           |
| `classHeader`   | `string`                              | -          | Class for the sticky header                                           |
| `classRow`      | `string`                              | -          | Class for every row                                                   |
| `classRowLabel` | `string`                              | -          | Class for every left-column cell                                      |
| `classTrack`    | `string`                              | -          | Class for every row's track                                           |
| `classBar`      | `string`                              | -          | Class for every bar                                                   |
| `el`            | `HTMLElement`                         | -          | Element reference (bindable)                                          |

Any other attribute (`aria-label`, `style`, `data-*`, …) is passed to the root `<div>`.

### `GanttRow`

| Field         | Type         | Description                                                   |
| ------------- | ------------ | ------------------------------------------------------------- |
| `bars`        | `GanttBar[]` | The row's ranges — one for a classic task, several for a lane |
| `id`          | `string`     | Stable key (falls back to the index)                          |
| `label`       | `THC`        | The left column's primary line                                |
| `description` | `THC`        | Secondary line under the label                                |
| `href`        | `string`     | Renders the row label as a link                               |
| `data`        | `unknown`    | Anything of yours — handed back by `onSelect`                 |

### `GanttBar`

| Field       | Type             | Description                                                               |
| ----------- | ---------------- | ------------------------------------------------------------------------- |
| `from`      | `string \| Date` | First day, inclusive. `YYYY-MM-DD`, or a `Date` (its **local** date)      |
| `to`        | `string \| Date` | Last day, **inclusive**. Omitted = a single day                           |
| `label`     | `THC`            | Text on the bar (see `barLabels`)                                         |
| `intent`    | `IntentColorKey` | `"primary" \| "accent" \| "success" \| "warning" \| "destructive"`        |
| `progress`  | `number`         | `0`–`1` — a darker fill from the bar's start ("% complete"); clamped      |
| `milestone` | `boolean`        | Draw a diamond at `from` instead of a bar (`to` is ignored)               |
| `inset`     | `boolean`        | Draw thinner and on top — an emphasis range inside a wider bar of the row |
| `href`      | `string`         | Renders the bar as a link                                                 |
| `title`     | `string`         | Native tooltip — the cheap way to show what a bar has no room for         |
| `disabled`  | `boolean`        | Not clickable, dimmed                                                     |
| `id`        | `string`         | Stable key (falls back to the index)                                      |
| `class`     | `string`         | Additional classes for this bar                                           |
| `data`      | `unknown`        | Anything of yours — handed back by `onSelect`                             |

A bar that falls entirely outside the window is **dropped**, not pinned to the
edge — a hairline at the window's edge reads as "starts today", which is exactly
the wrong thing to tell a planner. A bar that only overhangs is clipped and
flagged with `data-clipped-start` / `data-clipped-end` (squared-off corners).

## Snippet Props

| Snippet          | Argument            | Description                                                             |
| ---------------- | ------------------- | ----------------------------------------------------------------------- |
| `renderBar`      | `GanttSelectDetail` | Override the whole bar body (progress, label)                           |
| `renderRowLabel` | `{ row, index }`    | Override the left column's cell                                         |
| `renderCorner`   | `{ axis }`          | The header's top-left cell, above the labels                            |
| `empty`          | –                   | Shown instead of the rows when `rows` is empty (the axis still renders) |

`GanttSelectDetail` is `{ bar, row, rowIndex, barIndex, placement, point }` —
`placement` is `{ start, end, clippedStart, clippedEnd, days }` in 0..1 track
fractions for a bar, and `point` is the 0..1 position of a milestone. Exactly one
of the two is set.

## Usage

### A project plan

```svelte
<script lang="ts">
	import { Gantt, type GanttRow } from "@marianmeres/stuic";

	const rows: GanttRow[] = [
		{
			label: "Design",
			description: "2 people",
			bars: [
				{
					from: "2026-09-07",
					to: "2026-09-18",
					label: "Wireframes",
					intent: "primary",
					progress: 0.65,
				},
			],
		},
		{
			label: "Build",
			bars: [
				{
					from: "2026-09-15",
					to: "2026-10-09",
					label: "Implementation",
					intent: "primary",
				},
			],
		},
		{
			label: "Launch",
			bars: [
				{ from: "2026-10-15", milestone: true, label: "Go live", intent: "success" },
			],
		},
	];
</script>

<Gantt {rows} onSelect={(d) => console.log(d.row.label, d.bar.from)} />
```

### Resource lanes (several bars per row)

`inset` draws a thinner bar on top of a wider one — the wide bar is the whole
occupancy, the thin one the part that matters.

```svelte
<Gantt
	rows={[
		{
			label: "Truck #1",
			bars: [
				{
					from: "2026-09-02",
					to: "2026-09-06",
					intent: "primary",
					title: "Job A — out to return",
				},
				{
					from: "2026-09-03",
					to: "2026-09-05",
					intent: "success",
					inset: true,
					title: "Job A — event days",
				},
			],
		},
	]}
	from="2026-09-01"
	to="2026-09-14"
/>
```

### Zoom, scales and fitting

```svelte
<!-- a bindable zoom -->
<input type="range" min="12" max="80" bind:value={unitWidth} />
<Gantt {rows} {unitWidth} />

<!-- coarser scales; the window snaps out to whole weeks / months -->
<Gantt {rows} unit="week" weekStartsOn={7} />
<Gantt {rows} unit="month" unitWidth={90} barLabels="none" />

<!-- no horizontal scroll: the columns divide the available width -->
<Gantt {rows} unitWidth="fit" barLabels="after" />
```

The chart always fills its parent. `unitWidth` is a **minimum**: when the axis
needs less width than the frame has, the columns share out what is left — so there
is never a dead gutter to the right of the last column — and when it needs more,
the frame scrolls horizontally. `unitWidth="fit"` drops the minimum entirely: the
columns always divide the available width, so the chart never scrolls sideways.

Bar labels that sit past their bar (`barLabels="after"`, and every milestone
label) are clipped at the chart's right edge rather than extending the scroll
area — a label is never worth a scrollbar on a chart that otherwise fits.

### Sticky header

The header is already `position: sticky`; give the chart a height and it sticks
while the rows scroll under it. The left label column is sticky horizontally at
all times.

```svelte
<Gantt {rows} style="--stuic-gantt-max-height: 20rem;" />
```

### Empty

```svelte
<Gantt rows={[]} from="2026-09-01" to="2026-09-21">
	{#snippet empty()}
		<EmptyState title="Nothing planned" description="Widen the window." />
	{/snippet}
</Gantt>
```

## Geometry helpers

The date → track math is a separate, browser-free module, exported for building
your own axis-aligned overlays (a "capacity" strip, a legend, a print layout):

```ts
import { buildGanttAxis, placeRange, placePoint } from "@marianmeres/stuic";

const axis = buildGanttAxis("2026-09-01", "2026-09-30", { unit: "day" });
placeRange("2026-09-03", "2026-09-04", axis);
// → { start: 0.0666…, end: 0.1333…, clippedStart: false, clippedEnd: false, days: 2 }
placePoint("2026-09-15", axis); // → 0.4833… (the middle of that day)
```

`buildGanttAxis` **throws** on an unparseable or backwards window, and on one
that would need more than `GANTT_MAX_COLUMNS` (2000) columns — at that zoom
nothing is readable, and quietly building 100k nodes is worse than saying so.

## Accessibility

- A bar with `onSelect` renders as a `<button>` (focusable, Enter/Space), with
  `href` as an `<a>`, and otherwise as a `<span role="img">`.
- Every bar gets an `aria-label` built from the row and bar labels plus the
  localized date range — only plain-string labels can contribute, so give
  html/component labels a `title` or use `formatBarAria`.
- The gridlines, weekend shading and the today line are `aria-hidden`.

## CSS Variables

| Variable                              | Default                          | Description                       |
| ------------------------------------- | -------------------------------- | --------------------------------- |
| `--stuic-gantt-unit-width`            | `2.5rem`                         | One column (the horizontal zoom)  |
| `--stuic-gantt-label-width`           | `12rem`                          | The sticky left column            |
| `--stuic-gantt-row-height`            | `2.5rem`                         | Minimum row height                |
| `--stuic-gantt-max-height`            | `none`                           | Set it to get a sticky header     |
| `--stuic-gantt-bg`                    | `--stuic-color-background`       | Frame background                  |
| `--stuic-gantt-border-color`          | `--stuic-color-border`           | Frame, row and column borders     |
| `--stuic-gantt-font-size`             | `--text-base`                    | Base size                         |
| `--stuic-gantt-header-bg`             | `--stuic-color-surface`          | Both header tiers                 |
| `--stuic-gantt-header-text`           | `--stuic-color-foreground`       | Header text                       |
| `--stuic-gantt-header-font-size`      | `--text-xs`                      | Header text size                  |
| `--stuic-gantt-header-padding`        | `0.25rem 0.375rem`               | Header cell padding               |
| `--stuic-gantt-header-sub-text`       | `--stuic-color-muted-foreground` | Weekday / week-number line        |
| `--stuic-gantt-grid-line-color`       | `--stuic-color-border`           | Column separators                 |
| `--stuic-gantt-weekend-bg`            | `--stuic-color-muted`            | Saturday/Sunday shading           |
| `--stuic-gantt-today-color`           | `--stuic-color-destructive`      | Today line and header flag        |
| `--stuic-gantt-today-width`           | `2px`                            | Today line thickness              |
| `--stuic-gantt-row-bg-hover`          | translucent muted                | Row hover (keeps shading visible) |
| `--stuic-gantt-label-bg`              | `--stuic-color-background`       | Left column (must stay opaque)    |
| `--stuic-gantt-label-padding`         | `0.375rem 0.75rem`               | Left column padding               |
| `--stuic-gantt-label-font-size`       | `--text-base`                    | Row title size                    |
| `--stuic-gantt-label-text`            | `--stuic-color-foreground`       | Row title color                   |
| `--stuic-gantt-description-font-size` | `--text-xs`                      | Row description size              |
| `--stuic-gantt-description-text`      | `--stuic-color-muted-foreground` | Row description color             |
| `--stuic-gantt-bar-height`            | `1.25rem`                        | Bar height                        |
| `--stuic-gantt-bar-height-inset`      | `0.625rem`                       | `inset` bar height                |
| `--stuic-gantt-bar-bg`                | `--stuic-color-muted-foreground` | Bar fill (per-intent overrides)   |
| `--stuic-gantt-bar-text`              | `--stuic-color-background`       | Bar label color                   |
| `--stuic-gantt-bar-font-size`         | `--text-xs`                      | Bar label size                    |
| `--stuic-gantt-bar-padding-inline`    | `0.375rem`                       | Bar label inset                   |
| `--stuic-gantt-bar-progress-bg`       | bar color, darkened              | The `progress` fill               |
| `--stuic-gantt-bar-opacity-disabled`  | `0.45`                           | Disabled bar                      |
| `--stuic-gantt-milestone-size`        | `0.875rem`                       | Diamond size                      |
| `--stuic-gantt-empty-padding`         | `2rem 1rem`                      | Empty area padding                |

Structural tokens are resolved as fallbacks at the usage sites, so
`--stuic-gantt-radius` → `--stuic-radius-container` (the frame),
`--stuic-gantt-bar-radius` → `--stuic-radius` (bars),
`--stuic-gantt-border-width` → `--stuic-border-width`, and
`--stuic-gantt-transition` → `--stuic-transition`.

## Data attributes

Kept in `unstyled` mode too — they describe the data, not the styling.

| Element           | Attributes                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| root              | `data-unit`, `data-fit`, `data-labels`, `data-bar-labels`                                                               |
| header group cell | `data-group` (`"2026-09"` / `"2026"`)                                                                                   |
| header unit cell  | `data-date`, `data-weekend`, `data-today`                                                                               |
| gridline          | `data-weekend`, `data-today`                                                                                            |
| today line        | `data-today-marker`                                                                                                     |
| row               | `data-row-id`                                                                                                           |
| bar               | `data-kind` (`bar`/`milestone`), `data-intent`, `data-inset`, `data-disabled`, `data-clipped-start`, `data-clipped-end` |
