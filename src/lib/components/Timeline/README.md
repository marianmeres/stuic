# Timeline

Vertical event list with markers on a rail — activity feeds, audit logs, order
tracking, "our history" pages. Renders an ordered list (`<ol>`) where every item
has a marker (dot, icon bubble, or anything via snippet), an optional time label,
a title, a description and an optional footer. Data-driven: pass `items`, override
parts with snippets. Static by design — there is no "current" step; for
progress-style flows use `Stepper` (vertical orientation).

## Props

| Prop               | Type                      | Default    | Description                                                                           |
| ------------------ | ------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `items`            | `TimelineItem[]`          | required   | The events, in the order they should appear (sort them yourself)                      |
| `align`            | `"start" \| "alternate"`  | `"start"`  | Rail on the start side with content after it, or centered rail with alternating sides |
| `timePosition`     | `"inline" \| "opposite"`  | `"inline"` | Time label above the title, or in its own column on the other side of the rail        |
| `formatTime`       | `(datetime, item) => THC` | -          | Fallback label for items that have `datetime` but no `time`                           |
| `unstyled`         | `boolean`                 | `false`    | Skip all default styling                                                              |
| `class`            | `string`                  | -          | Additional CSS classes (merged via twMerge)                                           |
| `classItem`        | `string`                  | -          | Class for every item (`li`)                                                           |
| `classMarker`      | `string`                  | -          | Class for the marker                                                                  |
| `classContent`     | `string`                  | -          | Class for the content cell                                                            |
| `classTime`        | `string`                  | -          | Class for the time label (inline or opposite)                                         |
| `classTitle`       | `string`                  | -          | Class for the title                                                                   |
| `classDescription` | `string`                  | -          | Class for the description                                                             |
| `classFooter`      | `string`                  | -          | Class for the footer area                                                             |
| `el`               | `HTMLOListElement`        | -          | Element reference (bindable)                                                          |

Any other attribute (`aria-label`, `data-*`, …) is passed to the `<ol>`.

### `TimelineItem`

| Field         | Type             | Description                                                                                           |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `title`       | `THC`            | Primary line (text, html, or component — see `Thc`)                                                   |
| `description` | `THC`            | Secondary text under the title                                                                        |
| `time`        | `THC`            | Time label, preformatted ("2 hours ago"); falls back to `formatTime(datetime)` when omitted           |
| `datetime`    | `string \| Date` | Machine-readable timestamp → `<time datetime="…">` (a `Date` becomes ISO 8601); never displayed alone |
| `icon`        | `THC`            | Marker content (e.g. `{ html: iconCheck() }`); switches the marker from dot to icon bubble            |
| `intent`      | `IntentColorKey` | `"primary" \| "accent" \| "success" \| "warning" \| "destructive"` — colors the marker                |
| `href`        | `string`         | Renders the title as a link                                                                           |

## Snippet Props

All three receive `{ item, index }`.

| Snippet        | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `renderMarker` | Override the marker content entirely (avatars, badges…) for every item |
| `renderItem`   | Override the whole content cell (time, title, description, footer)     |
| `renderFooter` | Per-item footer area below the description (actions, attachments…)     |

## Usage

### Basic

```svelte
<script lang="ts">
	import { Timeline } from "@marianmeres/stuic";
</script>

<Timeline
	items={[
		{ title: "Order placed", description: "Ref #1001", time: "09:00" },
		{ title: "Payment received", time: "09:05", intent: "success" },
		{ title: "Shipped", description: "Tracking number sent", time: "Yesterday" },
	]}
/>
```

### Icons and intents

`icon` turns the dot into a bubble; `intent` colors either.

```svelte
<script lang="ts">
	import { Timeline, iconCheck, iconAlertWarning } from "@marianmeres/stuic";
</script>

<Timeline
	items={[
		{ title: "Deployed", icon: { html: iconCheck() }, intent: "success" },
		{
			title: "Health check failed",
			icon: { html: iconAlertWarning() },
			intent: "destructive",
		},
		{ title: "Rolled back", intent: "warning" },
	]}
/>
```

### Machine-readable times + a formatter

`datetime` is metadata (`<time datetime>`); `time` is what people see. Give every item
a `datetime` and one `formatTime` and skip per-item labels:

```svelte
<script lang="ts">
	const fmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
</script>

<Timeline
	items={events.map((e) => ({ title: e.message, datetime: e.createdAt }))}
	formatTime={(d) => fmt.format(new Date(d))}
/>
```

### Audit-log layout (time column)

```svelte
<Timeline {items} timePosition="opposite" />
```

### Alternating sides (history page)

```svelte
<Timeline {items} align="alternate" />
```

The rail is centered and content alternates sides (`timePosition="opposite"` puts the
time on the free side). There is no automatic collapse on narrow screens — switch to
`align="start"` yourself below your breakpoint if needed.

### Custom markers (avatars)

```svelte
<Timeline {items}>
	{#snippet renderMarker({ item })}
		<Avatar src={item.actorAvatar} size="sm" />
	{/snippet}
</Timeline>
```

`renderMarker` replaces the marker for every item (`data-marker="custom"`): the box is
sized like the icon bubble but carries no background — the snippet brings its own look.

### Footer actions / custom item content

```svelte
<Timeline {items}>
	{#snippet renderFooter({ item })}
		<Button size="sm" variant="outline" onclick={() => open(item)}>Details</Button>
	{/snippet}
</Timeline>

<!-- or take over the whole content cell -->
<Timeline {items}>
	{#snippet renderItem({ item })}
		<strong>{item.title}</strong> — <em>{item.time}</em>
	{/snippet}
</Timeline>
```

### Grouping

There is no built-in "Today / Yesterday" grouping — render one `Timeline` per group
under your own headings.

## Accessibility

- Renders a real `<ol>` (explicit `role="list"`, so Safari keeps the list semantics
  despite `list-style: none`); pass `aria-label` if the page has several lists.
- Markers are `aria-hidden` — they are decorative; the time and title carry the
  information. Reading order is time → title → description → footer (in the opposite
  layout the time cell still comes first in the DOM).
- `datetime` renders a `<time>` element; without it the label is a plain `<span>`
  (the spec requires a valid date string in a bare `<time>`).

## CSS Variables

| Variable                                                           | Default                                     | Description                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `--stuic-timeline-gap`                                             | `1rem`                                      | Column gap (opposite ↔ rail ↔ content)                                                                    |
| `--stuic-timeline-gap-vertical`                                    | `1.5rem`                                    | Distance between items                                                                                    |
| `--stuic-timeline-line-height`                                     | `1.5rem`                                    | Height of the first content line; the marker centers on it                                                |
| `--stuic-timeline-connector-thickness`                             | `2px`                                       | Rail line thickness                                                                                       |
| `--stuic-timeline-connector-bg`                                    | `--stuic-color-border`                      | Rail line color                                                                                           |
| `--stuic-timeline-marker-size`                                     | `0.75rem`                                   | Dot diameter                                                                                              |
| `--stuic-timeline-marker-bg`                                       | `--stuic-color-muted-foreground`            | Dot color (no intent)                                                                                     |
| `--stuic-timeline-marker-size-icon`                                | `2rem`                                      | Icon bubble / custom marker diameter                                                                      |
| `--stuic-timeline-marker-bg-icon` / `-text-icon`                   | muted / muted-foreground                    | Icon bubble colors (no intent); an intent applies a soft tint                                             |
| `--stuic-timeline-marker-icon-size`                                | `1rem`                                      | Size of an svg inside the bubble                                                                          |
| `--stuic-timeline-marker-radius`                                   | full circle                                 | Marker radius                                                                                             |
| `--stuic-timeline-marker-ring-width` / `-ring-color`               | `2px` / `--stuic-color-background`          | Ring separating the marker from the line behind it (set the color to your card's background inside cards) |
| `--stuic-timeline-time-font-size` / `-text`                        | `--text-sm` / muted-foreground              | Time label                                                                                                |
| `--stuic-timeline-title-font-size` / `-font-weight` / `-text`      | `--text-base` / medium / foreground         | Title                                                                                                     |
| `--stuic-timeline-description-font-size` / `-text` / `-margin-top` | `--text-sm` / muted-foreground / `0.125rem` | Description                                                                                               |
| `--stuic-timeline-footer-gap` / `-margin-top`                      | `0.5rem` / `0.5rem`                         | Footer area                                                                                               |

## Data Attributes

- `data-align` - `"start" | "alternate"` (root)
- `data-time-position` - `"inline" | "opposite"` (root)
- `data-intent` - the item's intent (`li`, only when set)
- `data-marker` - `"dot" | "icon" | "custom"` (marker element)

## Layout notes

The list is a CSS grid and every item a `subgrid` row, so the rail column (sized by
the widest marker) and the opposite time column stay aligned across items without
any fixed widths. Markers of different sizes (dots and bubbles in one list) stay on
the same axis, and the rail line runs behind them — the ring (`--stuic-timeline-marker-ring-*`)
is what visually separates marker and line.
