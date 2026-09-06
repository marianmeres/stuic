# DescriptionList

The term-and-value list — the read-only block on every detail page, drawer and back-office
panel. Renders the HTML the spec intends: `<dl>` › `<div>` per pair › `<dt>` + `<dd>`, with
an optional second `<dd>` qualifying the value. No ARIA is added or needed — a `<dl>`
already has list semantics, which is the reason to render one instead of nested `<div>`s.

Two ways to feed it, both first-class: `items` for flat lists, `children` for markup-heavy
ones. The CSS is written on the _structure_ (`dl > div > dt`), so a hand-written
`<div><dt/><dd/></div>` renders identically to a generated row.

The default layout (`"auto"`) puts the label **over** the value while the list is narrow
and **beside** it once the list itself is wide enough — a container query, not a media
query, so a narrow list inside a wide page stays stacked.

Not an editor (that is `FieldKeyValues`), not a table. A run of numbers that should be a
table is a table.

## Props

| Prop               | Type                                   | Default      | Description                                                                                    |
| ------------------ | -------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `items`            | `DescriptionListItem[]`                | -            | The rows, in order. Data-driven form                                                           |
| `children`         | `Snippet`                              | -            | Compositional form: rendered inside the `<dl>` _instead of_ `items`                            |
| `layout`           | `"auto" \| "stacked" \| "columns"`     | `"auto"`     | Label over value, label beside value, or the former until the list is `columnsFrom` wide       |
| `columnsFrom`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"sm"`       | The **list's own** width at which `"auto"` flips: 20 / 24 / 28 / 32 / 36rem. Only for `"auto"` |
| `divide`           | `"none" \| "inside" \| "outside"`      | `"inside"`   | Hairlines between rows only, around the whole list as well, or none                            |
| `wrap`             | `"anywhere" \| "truncate" \| "normal"` | `"anywhere"` | How a long value behaves. Per-row override via `item.wrap`                                     |
| `valueAlign`       | `"start" \| "end"`                     | `"start"`    | Text alignment of the value column (`"end"` is the totals shape)                               |
| `emptyValue`       | `THC`                                  | `"—"`        | Rendered when an item's `value` is `undefined`, `null` or `""`. Pass `""` for an empty cell    |
| `renderLabel`      | `Snippet<[DescriptionListSnippetArg]>` | -            | Override the `<dt>` content for every row                                                      |
| `renderValue`      | `Snippet<[DescriptionListSnippetArg]>` | -            | Override the value `<dd>` content for every row                                                |
| `renderItem`       | `Snippet<[DescriptionListSnippetArg]>` | -            | Override the whole row _content_ (the `<div>` stays — it is what the grid is on)               |
| `unstyled`         | `boolean`                              | `false`      | Skip all default styling (no classes, no data attributes)                                      |
| `class`            | `string`                               | -            | Additional CSS classes on the `<dl>` (merged via twMerge)                                      |
| `classItem`        | `string`                               | -            | Class for every row `<div>`                                                                    |
| `classLabel`       | `string`                               | -            | Class for every `<dt>`                                                                         |
| `classValue`       | `string`                               | -            | Class for every value `<dd>`                                                                   |
| `classDescription` | `string`                               | -            | Class for every description `<dd>`                                                             |
| `el`               | `HTMLDListElement`                     | -            | Element reference (bindable)                                                                   |

Any other attribute (`aria-label`, `data-*`, `style`, `lang`, …) is passed to the `<dl>`.

Empty `items` with no `children` renders **nothing** — not even the `<dl>`: an empty list
with `divide="outside"` would otherwise draw two rules around a void.

### `DescriptionListItem`

| Field              | Type                  | Description                                                                                             |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `key`              | `string \| number`    | Keyed `{#each}` identity. Falls back to the index                                                       |
| `label`            | `THC`                 | The term (`<dt>`). Required                                                                             |
| `value`            | `THC \| number`       | The details (`<dd>`). A number is `String()`-ed; missing → `emptyValue`                                 |
| `description`      | `THC`                 | A second `<dd>` under the value — a unit, a qualifier. In the columns state it sits under the value     |
| `href`             | `string`              | Wraps the value in `<a href>`. Plain link only; anything more is the snippet / `children` form          |
| `title`            | `string`              | `title` on the value `<dd>`. Auto-filled from a plain-string value under `wrap="truncate"` unless given |
| `labelLang`        | `string`              | `lang` on the `<dt>`                                                                                    |
| `valueLang`        | `string`              | `lang` on the value `<dd>`                                                                              |
| `emphasis`         | `boolean`             | `data-emphasis` on the row: full-strength label color and semibold value — the _Total_ row              |
| `wrap`             | `DescriptionListWrap` | Per-row override of the list's `wrap`                                                                   |
| `class`            | `string`              | Class for this row, merged after `classItem`                                                            |
| `classLabel`       | `string`              | Class for this `<dt>`, merged after `classLabel`                                                        |
| `classValue`       | `string`              | Class for this value `<dd>`, merged after `classValue`                                                  |
| `classDescription` | `string`              | Class for this description `<dd>`, merged after `classDescription`                                      |

### Snippet Props

All three receive `DescriptionListSnippetArg` = `{ item, index }`, as in `Timeline`.

## Usage

### Basic

```svelte
<script lang="ts">
	import { DescriptionList } from "@marianmeres/stuic";
</script>

<DescriptionList
	items={[
		{ label: "Reference", value: "REF-2026-0042" },
		{ label: "Created", value: "Sep 1, 2026" },
		{ label: "Owner", value: null }, // renders the em dash
	]}
/>
```

### A detail block (the reference shape)

Stacked while narrow, two columns once the list itself has room, interior hairlines, a
truncated URL that stays reachable through its `title`, and a qualifier line under a count:

```svelte
<DescriptionList
	class="mt-3 text-sm"
	items={[
		{ label: "Reference", value: doc.reference, classValue: "font-mono font-semibold" },
		{
			label: "Share link",
			value: shareUrl(doc),
			href: shareUrl(doc),
			wrap: "truncate",
		},
		{
			label: "Downloads",
			value: downloadCount,
			description: "in the last 30 days",
			classValue: "tabular-nums",
		},
	]}
/>
```

### Totals

```svelte
<DescriptionList
	layout="columns"
	valueAlign="end"
	divide="none"
	style="--stuic-description-list-label-width: 1fr;"
	items={[
		{ label: "Subtotal", value: "$120.00" },
		{ label: "Tax", value: "$25.20" },
		{ label: "Total", value: "$145.20", emphasis: true, class: "border-t mt-1 pt-2" },
	]}
/>
```

### The `children` form

For rows the data form cannot express — a link with `target`/`rel`, a conditional row, a
button inside a value. The structural CSS styles it identically, so **no layout utility is
needed on the consumer side**; `data-wrap` and `data-emphasis` on a hand-written row are
honoured by the same selectors the data form uses.

```svelte
<DescriptionList class="mt-3 text-sm">
	<div>
		<dt>Reference</dt>
		<dd class="font-mono text-base font-semibold">{doc.reference}</dd>
	</div>
	<div data-wrap="truncate">
		<dt>Share link</dt>
		<dd title={shareUrl(doc)}>
			<a href={shareUrl(doc)} target="_blank" rel="noopener noreferrer">
				{shareUrl(doc)}
			</a>
		</dd>
	</div>
	{#if downloadCount !== null}
		<div>
			<dt>Downloads</dt>
			<dd class="tabular-nums">{downloadCount}</dd>
			<dd>in the last 30 days</dd>
		</div>
	{/if}
</DescriptionList>
```

One `<div>` per pair is the contract: it is what the spec provides for grouping a term with
its details, and it is what lets each row be a grid without subgrid. Bare `<dt>`/`<dd>`
children of the `<dl>` are valid HTML but get no row styling.

### Snippet overrides

```svelte
<DescriptionList {items}>
	{#snippet renderValue({ item })}
		<Pill label={item.value} intent="success" />
	{/snippet}
</DescriptionList>
```

## Layout

`layout="auto"` makes the `<dl>` an inline-size container (named
`stuic-description-list`) and switches the **rows** to a two-column grid at `columnsFrom` —
an element cannot query itself, so the query is on the list and the styling is on its rows.

Two consequences worth knowing:

- **The list measures itself, not the viewport.** A 200px-wide list on a 1400px page stays
  stacked. That is the whole point: `sm:` would have flipped it while it was still 200px.
- **`container-type: inline-size` gives the `<dl>` inline-axis size containment**, so its
  min-content contribution to a flex parent is zero — the list can sit beside a fixed-width
  element and shrink to whatever is left. `min-w-0 flex-1` on the consumer side is already
  there (the base rule sets `min-width: 0` in the static layouts too).

The breakpoint is a prop on a fixed scale rather than a token because
`@container (min-width: var(--x))` is not valid CSS — size queries take literals only. The
scale is Tailwind's own `@xs`…`@xl`, so a consumer who would have typed `@min-[24rem]`
writes `columnsFrom="sm"`.

## Dividers

`divide="inside"` (default) draws `n − 1` rules — a list inside a card, drawer or panel,
where the box supplies the outer edge; the first and last rows sit flush with it.
`divide="outside"` draws `n + 1` and keeps the outer padding — a list loose on a page,
where the top and bottom lines are what close it. `divide="none"` draws none.

## Wrapping

`wrap="anywhere"` (default) never lets a value push the page sideways. It is
`overflow-wrap: anywhere` and not `break-word` on purpose: only `anywhere` is counted in
min-content sizing, so an inline-block inside a value cannot overflow the column it was
meant to respect.

`wrap="truncate"` clips to one line with an ellipsis — for a value that is chrome (an ID, a
URL that is also a link). The `title` is auto-filled from a plain-string value so the
clipped text stays reachable; for an html/component/snippet value there is no string to put
there, so pass `item.title`. A `href` value must stay `display: inline` for the `<dd>`'s
`text-overflow` to clip it — do not make the link `inline-block`.

`wrap="normal"` leaves the browser default. Any of the three can be set per row via
`item.wrap` (or `data-wrap` on a hand-written row), which wins over the list-level value.

## CSS Variables

| Variable                                              | Default                               | Description                                                                                |
| ----------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `--stuic-description-list-label-width`                | `minmax(7rem, 10rem)`                 | Label track (any `grid-template-columns` value; not declared — fallback at the usage site) |
| `--stuic-description-list-gap-x`                      | `1.5rem`                              | Label ↔ value, columns state                                                               |
| `--stuic-description-list-gap-y`                      | `0.125rem`                            | Label ↕ value, stacked state                                                               |
| `--stuic-description-list-item-padding-y`             | `0.5rem`                              | Row padding, both states                                                                   |
| `--stuic-description-list-rule-color`                 | `var(--stuic-color-border)`           | Hairline color                                                                             |
| `--stuic-description-list-rule-width`                 | `1px`                                 | Hairline thickness                                                                         |
| `--stuic-description-list-label-font-size`            | `var(--text-sm)`                      | Label size                                                                                 |
| `--stuic-description-list-label-font-weight`          | `var(--font-weight-medium)`           | Label weight                                                                               |
| `--stuic-description-list-label-text`                 | `var(--stuic-color-muted-foreground)` | Label color                                                                                |
| `--stuic-description-list-value-text`                 | `var(--stuic-color-foreground)`       | Value color (size is inherited)                                                            |
| `--stuic-description-list-description-font-size`      | `var(--text-sm)`                      | Description size                                                                           |
| `--stuic-description-list-description-text`           | `var(--stuic-color-muted-foreground)` | Description color                                                                          |
| `--stuic-description-list-label-text-emphasis`        | `var(--stuic-color-foreground)`       | Label color on an `emphasis` row                                                           |
| `--stuic-description-list-value-font-weight-emphasis` | `var(--font-weight-semibold)`         | Value weight on an `emphasis` row                                                          |

The value deliberately has no font-size token: it inherits, so `class="text-sm"` on the
`<dl>` scales the list. The rule tokens are the component's own (like `Separator`) rather
than the `--stuic-border-width` tier, so a theme that zeroes box borders keeps its
hairlines.

## Data Attributes

On the `<dl>`: `data-layout`, `data-columns-from` (only when `layout="auto"`),
`data-divide`, `data-wrap`, `data-value-align`. On each row `<div>`: `data-wrap` (when
`item.wrap` is set) and `data-emphasis` (empty attribute). `unstyled` removes all of them
along with the classes.

## Accessibility

The rendered `<dl>` carries list semantics natively — no `role` is added. One term per row:
a second `<dt>` in the same group is valid HTML but lands in the value column; use two rows
instead. `lang` per row (`labelLang` / `valueLang`) is for a localized label or a
fallback-language value inside a page that declares another language.
