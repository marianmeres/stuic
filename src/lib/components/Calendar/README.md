# Calendar

An accessible month grid for picking a single date or a date range — the picker
inside [`FieldDate` / `FieldDateRange`](../Input/README.md#date-and-date-range-fields),
usable on its own wherever a calendar should sit inline (a booking widget, a filter
sidebar, a dashboard). Values are calendar dates in ISO `YYYY-MM-DD` form; the grid,
"today", week numbers and DST-safe day stepping come from
[`@marianmeres/calendar-utils`](https://github.com/marianmeres/calendar-utils), the
day / month names from `Intl` via `locale`.

- **Single or range** selection (`mode`), with hover / keyboard range preview
- **Full keyboard grid** (APG date-picker pattern): roving tabindex, arrows, Home/End,
  PageUp/PageDown (± Shift), Enter/Space
- **Bounds and blackouts**: `min` / `max` / `isDateDisabled`
- **Navigation**: prev/next, or native month + year selects (`captionLayout="dropdown"`)
- **Multiple months** side by side, fixed 6-week height, ISO week numbers
- **Localized** (`locale` for names, `t` for UI texts; Slovak bundled), announced
  selections via a live region, 44px touch targets on coarse pointers

## Usage

```svelte
<script lang="ts">
	import { Calendar } from "@marianmeres/stuic";

	let date = $state<string | null>(null); // "YYYY-MM-DD"
	let start = $state<string | null>(null);
	let end = $state<string | null>(null);
</script>

<!-- single date -->
<Calendar bind:value={date} showToday showClear />

<!-- range, two months, Sunday-first week, next 90 days only -->
<Calendar
	mode="range"
	bind:start
	bind:end
	months={2}
	weekStartsOn={7}
	min={todayIso()}
	max={addDaysIso(todayIso(), 90)}
/>

<!-- date of birth: dropdown caption -->
<Calendar
	bind:value={dob}
	captionLayout="dropdown"
	yearRange={[1920, 2026]}
	max={todayIso()}
/>

<!-- blackout weekends -->
<Calendar bind:value={date} isDateDisabled={(_iso, cell) => cell.isWeekend} />
```

## Props

| Prop              | Type                               | Default    | Description                                                                                          |
| ----------------- | ---------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `mode`            | `"single" \| "range"`              | `"single"` | `"single"` binds `value`; `"range"` binds `start` + `end`                                            |
| `value`           | `string \| null`                   | `null`     | The selected date, `YYYY-MM-DD` (bindable; single mode)                                              |
| `start`, `end`    | `string \| null`                   | `null`     | The range ends, `YYYY-MM-DD` (bindable; range mode)                                                  |
| `view`            | `{ year, month }`                  | selection  | The first displayed month (bindable). Defaults to the month of the selection, else the current month |
| `months`          | `number`                           | `1`        | Consecutive months rendered side by side (they wrap on narrow containers)                            |
| `min`, `max`      | `string \| null`                   | -          | Earliest / latest selectable date (inclusive); days and navigation beyond are disabled               |
| `isDateDisabled`  | `(iso, cell: DayCell) => boolean`  | -          | Disable individual days (blackouts, weekends, …). They stay keyboard-reachable, never selectable     |
| `weekStartsOn`    | `1 \| 2 \| … \| 7`                 | `1`        | First day of the week, ISO numbering (1 = Monday … 7 = Sunday)                                       |
| `weekendDays`     | `Weekday[]`                        | `[6, 7]`   | Days flagged `data-weekend`                                                                          |
| `locale`          | `string`                           | browser    | BCP 47 locale of the day / month names and the spoken day labels                                     |
| `zone`            | `string`                           | local      | IANA zone that decides which day is "today"                                                          |
| `captionLayout`   | `"label" \| "dropdown"`            | `"label"`  | Plain "September 2026" caption, or native month + year `<select>`s (fast for far-away years)         |
| `yearRange`       | `[number, number]`                 | see note   | Years offered by the dropdown caption. Defaults to the `min` / `max` years, else today −100 … +20    |
| `showWeekNumbers` | `boolean`                          | `false`    | ISO week number column (always Monday-based, per ISO 8601, regardless of `weekStartsOn`)             |
| `showOutsideDays` | `boolean`                          | `true`     | Render the previous / next month's filler days (selectable; picking one navigates)                   |
| `fixedWeeks`      | `boolean`                          | `false`    | Always render 6 weeks so the height never jumps while navigating                                     |
| `showToday`       | `boolean`                          | `false`    | Footer "Today" button — navigates to and focuses today (does **not** select it)                      |
| `showClear`       | `boolean`                          | `false`    | Footer "Clear" button                                                                                |
| `disabled`        | `boolean`                          | `false`    | Whole calendar non-interactive                                                                       |
| `focusOnMount`    | `boolean`                          | `false`    | Move focus into the grid once mounted (what the fields do when their dialog opens)                   |
| `t`               | `TranslateFn`                      | English    | UI texts — see [i18n](#i18n)                                                                         |
| `onSelect`        | `(value: string \| null) => void`  | -          | Single mode: a date was picked (or cleared)                                                          |
| `onRangeChange`   | `(r: CalendarRangeChange) => void` | -          | Range mode: `{ start, end, complete }` after every pick / clear (`complete` once both ends are set)  |
| `onViewChange`    | `(view: { year, month }) => void`  | -          | The displayed month changed (buttons, keyboard, dropdowns, an off-screen selection)                  |
| `unstyled`        | `boolean`                          | `false`    | Skip all `stuic-calendar*` classes (the nav / footer `Button`s keep theirs)                          |
| `class`           | `string`                           | -          | Additional classes for the root                                                                      |
| `classMonth`      | `string`                           | -          | Each month block                                                                                     |
| `classHeader`     | `string`                           | -          | Each month's header row (prev / caption / next)                                                      |
| `classCaption`    | `string`                           | -          | The caption                                                                                          |
| `classGrid`       | `string`                           | -          | The `<table>`                                                                                        |
| `classWeekday`    | `string`                           | -          | The weekday header cells                                                                             |
| `classCell`       | `string`                           | -          | The day cells (`<td>`)                                                                               |
| `classDay`        | `string`                           | -          | The day buttons                                                                                      |
| `classFooter`     | `string`                           | -          | The footer row                                                                                       |
| `el`              | `HTMLDivElement`                   | -          | Root element reference (bindable)                                                                    |

Any other attribute (`aria-label`, `data-*`, …) is passed to the root `<div role="group">`.

### Values

Every date is a plain `YYYY-MM-DD` string — zone-independent, sortable, what
`<input type="date">` and most APIs already speak. Loose input is tolerated on the way
in: a datetime string is reduced to its date portion **as written** (never shifted
through a zone), a `Date` to its local calendar date, a Luxon `DateTime` to its own-zone
date; unparseable input counts as empty. What the component writes back is always strict
ISO. The helpers are exported: `isIsoDate`, `parseIsoDate`, `normalizeIsoDate`,
`toIsoDate`, `todayIso`, `addDaysIso`, `addMonthsIso`, `compareIso`, `daysBetweenIso`,
`rangeLengthIso`, `formatIsoDate`, `formatIsoDateRange`.

### Range selection

The first pick is the **anchor**, the second completes the range — in either order (an
earlier second pick becomes the start). A third pick starts over. While an anchor waits,
the hovered (mouse) or focused (keyboard) day previews the range. A `start` passed in
without an `end` is treated as a waiting anchor, so one more pick completes it.

## Snippets

| Snippet     | Parameters         | Description                                                                               |
| ----------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `renderDay` | `CalendarDayState` | Custom day content (event dots, prices, …). The button, its states and a11y stay in place |
| `footer`    | -                  | Extra footer content, on the end side of the Today / Clear buttons (e.g. a "Done" button) |

`CalendarDayState`: `{ iso, day, cell, selected, rangeStart, rangeEnd, inRange, preview, today, outside, weekend, disabled }` — `cell` is the calendar-utils `DayCell` (Luxon `date`, `weekNumber`, …).

```svelte
<Calendar bind:value={date}>
	{#snippet renderDay(s)}
		<span class="relative">
			{s.day}
			{#if events.has(s.iso)}<span
					class="absolute -bottom-2 size-1 rounded-full bg-current"
				></span>{/if}
		</span>
	{/snippet}
</Calendar>
```

## Methods

Accessed via a `bind:this` reference.

| Method                      | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `focus()`                   | Focus the day that is currently in the tab order     |
| `prevMonth()`/`nextMonth()` | Step the view one month (no-op beyond `min` / `max`) |
| `goToMonth(year, month)`    | Show a specific month                                |
| `goToDate(iso)`             | Bring the month containing `iso` on screen           |
| `goToToday()`               | Navigate to and focus today (does not select it)     |
| `getView()`                 | The first displayed month, `{ year, month }`         |

## Keyboard

The grid is a single tab stop (roving tabindex on the day buttons):

| Key                         | Action                                                    |
| --------------------------- | --------------------------------------------------------- |
| `←` / `→`                   | Previous / next day                                       |
| `↑` / `↓`                   | Same weekday, previous / next week                        |
| `Home` / `End`              | First / last day of the week (per `weekStartsOn`)         |
| `PageUp` / `PageDown`       | Same day, previous / next month (clamped to month length) |
| `Shift+PageUp` / `PageDown` | Same day, previous / next year                            |
| `Enter` / `Space`           | Select the focused day                                    |

Stepping past the visible months navigates the view; stepping is clamped to `min` /
`max`. Disabled days are focusable (so the grid stays navigable) but cannot be selected.

## Accessibility

- `<table role="grid" aria-labelledby={caption}>`; each day is a `<button>` inside a
  `<td role="gridcell" aria-selected>` with a full spoken `aria-label`
  ("Tuesday, February 10, 2026, today"), `aria-current="date"` on today and
  `aria-disabled` on unavailable days.
- Selections and the "select an end date" step are announced through a polite live
  region; nav buttons and the dropdown selects are labelled.
- Day buttons are 40px, 44px on coarse pointers (`--stuic-calendar-day-size`).

## Data attributes

Styling hooks, set only when applicable (empty-string attributes):

- root: `data-mode`, `data-months`, `data-disabled`
- day button: `data-iso`, `data-selected`, `data-range-start`, `data-range-end`,
  `data-in-range` (strictly inside a complete range), `data-preview`, `data-today`,
  `data-outside`, `data-weekend`, `aria-disabled`
- day cell (`<td>`): `data-in-range` (the whole committed band, ends included),
  `data-preview`, `data-band-start`, `data-band-end` (rounded outer corners), `data-outside`

## i18n

Day and month names come from `Intl` (`locale`). Everything else — nav labels, Today /
Clear / Done, the live announcements, the fields' placeholder / dialog title / validation
messages — goes through `t`. English is built in; Slovak ships bundled and opt-in
(importing it is what pulls it into your bundle). Placeholders are mustache-style
(`{{value}}`).

```svelte
<script>
	import { Calendar, createCalendarT, CALENDAR_MESSAGES_SK } from "@marianmeres/stuic";
	const t = createCalendarT(CALENDAR_MESSAGES_SK);
	// or partial: reword one text, keep English elsewhere
	const t2 = createCalendarT({ today: "Now" });
</script>

<Calendar bind:value locale="sk" {t} showToday />
```

| Key                                        | English                                                     | Used by                                |
| ------------------------------------------ | ----------------------------------------------------------- | -------------------------------------- |
| `prev_month` / `next_month`                | Previous month / Next month                                 | Nav buttons                            |
| `month` / `year`                           | Month / Year                                                | Dropdown caption labels (sr-only)      |
| `week`                                     | Wk                                                          | Week-number column header              |
| `week_number`                              | Week {{value}}                                              | Week-number cell label                 |
| `day_today`                                | today                                                       | Appended to today's spoken label       |
| `today` / `clear` / `done` / `close`       | Today / Clear / Done / Close                                | Footer + dialog buttons                |
| `select_start` / `select_end`              | Select a start date / Select an end date                    | Live region (range)                    |
| `selected_date` / `selected_range`         | Selected {{value}} / Selected {{start}} to {{end}}          | Live region                            |
| `placeholder_date` / `placeholder_range`   | Select a date / Select a date range                         | `FieldDate` / `FieldDateRange` trigger |
| `dialog_title_date` / `dialog_title_range` | Select date / Select date range                             | Field dialog title                     |
| `clear_value`                              | Clear selection                                             | Field × button                         |
| `field_req_att`                            | This field requires attention. Please review and try again. | Field validation (required)            |
| `date_invalid`                             | Please enter a valid date.                                  | Field validation                       |
| `date_disabled`                            | This date is not available.                                 | Field validation (`isDateDisabled`)    |
| `date_before_min` / `date_after_max`       | Date must be on or after/before {{value}}.                  | Field validation (`min` / `max`)       |
| `range_incomplete`                         | Please select both a start and an end date.                 | `FieldDateRange` validation            |

## CSS Variables

| Variable                                 | Default                                   | Description                                |
| ---------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `--stuic-calendar-bg`                    | `transparent`                             | Root background                            |
| `--stuic-calendar-text`                  | `var(--stuic-color-foreground)`           | Root text color                            |
| `--stuic-calendar-font-family`           | `var(--font-sans)`                        | Font family                                |
| `--stuic-calendar-gap`                   | `1.5rem`                                  | Gap between months (`months > 1`)          |
| `--stuic-calendar-header-gap`            | `0.25rem`                                 | Gap in the header row                      |
| `--stuic-calendar-header-margin-bottom`  | `0.5rem`                                  | Space between header and grid              |
| `--stuic-calendar-footer-gap`            | `0.5rem`                                  | Gap between footer buttons                 |
| `--stuic-calendar-footer-margin-top`     | `0.5rem`                                  | Space above the footer                     |
| `--stuic-calendar-day-size`              | `2.5rem` (`2.75rem` on `pointer: coarse`) | Width and height of a day cell             |
| `--stuic-calendar-day-radius`            | `var(--stuic-radius)`                     | Day button / band corner radius            |
| `--stuic-calendar-day-font-size`         | `var(--text-sm)`                          | Day number size                            |
| `--stuic-calendar-day-font-weight`       | `var(--font-weight-normal)`               | Day number weight                          |
| `--stuic-calendar-day-text`              | `var(--stuic-color-foreground)`           | Day text                                   |
| `--stuic-calendar-day-bg-hover`          | `var(--stuic-color-muted)`                | Day hover background                       |
| `--stuic-calendar-day-text-outside`      | `var(--stuic-color-muted-foreground)`     | Filler (adjacent month) day text           |
| `--stuic-calendar-day-opacity-outside`   | `0.6`                                     | Filler day opacity                         |
| `--stuic-calendar-day-text-weekend`      | (inherits day text)                       | Weekend day text — set it to tint weekends |
| `--stuic-calendar-day-opacity-disabled`  | `0.35`                                    | Disabled day opacity                       |
| `--stuic-calendar-day-bg-selected`       | `var(--stuic-color-primary)`              | Selected day / range end background        |
| `--stuic-calendar-day-text-selected`     | `var(--stuic-color-primary-foreground)`   | Selected day text                          |
| `--stuic-calendar-day-bg-selected-hover` | `var(--stuic-color-primary-hover)`        | Selected day hover background              |
| `--stuic-calendar-day-bg-range`          | primary @ 15%                             | The band behind a complete range           |
| `--stuic-calendar-day-text-range`        | `var(--stuic-color-foreground)`           | Text of days inside the range              |
| `--stuic-calendar-day-bg-preview`        | primary @ 8%                              | The band behind the hover / focus preview  |
| `--stuic-calendar-today-text`            | `var(--stuic-color-primary)`              | Today's number color (when not selected)   |
| `--stuic-calendar-today-font-weight`     | `var(--font-weight-semibold)`             | Today's number weight                      |
| `--stuic-calendar-weekday-text`          | `var(--stuic-color-muted-foreground)`     | Weekday header text                        |
| `--stuic-calendar-weekday-font-size`     | `var(--text-xs)`                          | Weekday header size                        |
| `--stuic-calendar-weekday-font-weight`   | `var(--font-weight-medium)`               | Weekday header weight                      |
| `--stuic-calendar-week-number-text`      | `var(--stuic-color-muted-foreground)`     | Week-number column text                    |
| `--stuic-calendar-week-number-font-size` | `var(--text-xs)`                          | Week-number size                           |
| `--stuic-calendar-caption-text`          | `var(--stuic-color-foreground)`           | Caption text                               |
| `--stuic-calendar-caption-font-size`     | `var(--text-base)`                        | Caption size                               |
| `--stuic-calendar-caption-font-weight`   | `var(--font-weight-semibold)`             | Caption weight                             |
| `--stuic-calendar-select-bg`             | `var(--stuic-color-input)`                | Dropdown caption select background         |
| `--stuic-calendar-select-text`           | `var(--stuic-color-foreground)`           | Dropdown caption select text               |
| `--stuic-calendar-select-border`         | `var(--stuic-color-border)`               | Dropdown caption select border             |
| `--stuic-calendar-select-radius`         | `var(--stuic-radius)`                     | Dropdown caption select radius             |
| `--stuic-calendar-border-width`          | `var(--stuic-border-width)`               | Dropdown caption select border width       |
| `--stuic-calendar-ring-width`            | `2px`                                     | Focus ring width                           |
| `--stuic-calendar-ring-color`            | `var(--stuic-color-ring)`                 | Focus ring color                           |
| `--stuic-calendar-transition`            | `var(--stuic-transition)`                 | Day background / color transition          |

```css
/* circles instead of rounded squares, bigger cells */
:root {
	--stuic-calendar-day-radius: 9999px;
	--stuic-calendar-day-size: 3rem;
}
```

## Notes

- The calendar is `display: inline-flex` and sizes to its content (7 × day size per
  month); put it in a flex/grid parent to center it.
- `view` is only defaulted once (from the selection at mount). Afterwards the view
  follows the user; an externally written selection that is off screen is brought on
  screen, browsing away from it is never undone.
- `today` is computed when the grid is (re)built; a calendar left open across midnight
  updates on the next navigation.
- `weekNumber` is the ISO week (Monday-based) even with a Sunday-first `weekStartsOn` —
  a calendar-utils convention, documented there.
- The nav / footer buttons are stuic `Button`s (`variant="ghost" size="sm"`) and keep
  their own styling under `unstyled`.
