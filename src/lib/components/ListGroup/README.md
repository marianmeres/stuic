# ListGroup

A rounded, bordered box of rows split by hairlines, with an optional header (a title on the
start side, a figure on the end side) and an optional footer line — the block a back office
keeps drawing by hand. Each row is **one wrapping flex line** of parts: a code, a name that
takes the leftover space, a run of facts. Nothing lines up across rows, on purpose: a row
that carries an extra part does not push its siblings, and in a narrow drawer the trailing
facts drop under the name one by one.

Renders `<div>` › optional header `<div>` › `<ul role="list">` › `<li>` per row › optional
footer `<div>`. The list is labelled by the title (`aria-labelledby`), so a screen reader
announces "Loose items, list, 8 items".

Not a `DataTable` (the rows share no columns — no alignment, sorting, paging or selection),
not a `DescriptionList` (each row is a different thing, not a property of one thing), not a
`Card` (no shadow, no padded body). `ListItemButton` is not its row.

## Props

| Prop            | Type                                                      | Default   | Description                                                                                                               |
| --------------- | --------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `T[]`                                                     | -         | The rows, in order. Data-driven form                                                                                      |
| `renderItem`    | `Snippet<[ListGroupSnippetArg<T>]>`                       | -         | A row's content, inside the `<li>` (or inside the `<a>` with `itemHref`). Without it an item renders as `THC`             |
| `children`      | `Snippet`                                                 | -         | Compositional form: `<li>`s rendered inside the `<ul>` _instead of_ `items`                                               |
| `getItemId`     | `(item: T, index: number) => string \| number`            | the index | Keyed `{#each}` identity (same name and default as `DataTable`'s `getRowId`)                                              |
| `itemProps`     | `(item: T, index: number) => ListGroupItemProps`          | -         | Attributes spread onto each `<li>` — the `data-*` hooks tests select on. A returned `class` merges after `classItem`      |
| `itemHref`      | `(item: T, index: number) => string \| null \| undefined` | -         | When it returns a href, the row content is wrapped in `<a class="stuic-list-group-item-link">`, which becomes the row box |
| `title`         | `THC`                                                     | -         | The header's start side; labels the list                                                                                  |
| `titleLevel`    | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                              | -         | Render the title as `<hN>` instead of a `<div>`. Semantics only — the look never changes                                  |
| `aside`         | `THC`                                                     | -         | The header's end side: a sum, a shortfall, an action. Pushed to the inline end, `tabular-nums`                            |
| `footer`        | `THC`                                                     | -         | A line inside the box, under the rows, above a rule                                                                       |
| `empty`         | `THC`                                                     | -         | Rendered **in place of** the `<ul>` when there are no rows. Without it, a group with no rows renders nothing at all       |
| `listProps`     | `ListGroupListProps`                                      | -         | Attributes for the `<ul>` — `aria-label`, or `aria-labelledby` pointing at a caption outside the box                      |
| `unstyled`      | `boolean`                                                 | `false`   | Skip all default styling (no `stuic-*` classes)                                                                           |
| `class`         | `string`                                                  | -         | Additional CSS classes on the root (merged via twMerge)                                                                   |
| `classHeader`   | `string`                                                  | -         | The header row                                                                                                            |
| `classTitle`    | `string`                                                  | -         | The title                                                                                                                 |
| `classAside`    | `string`                                                  | -         | The aside                                                                                                                 |
| `classList`     | `string`                                                  | -         | The `<ul>`                                                                                                                |
| `classItem`     | `string`                                                  | -         | Every generated `<li>`                                                                                                    |
| `classItemLink` | `string`                                                  | -         | Every generated `<a>` (`itemHref`)                                                                                        |
| `classEmpty`    | `string`                                                  | -         | The empty state                                                                                                           |
| `classFooter`   | `string`                                                  | -         | The footer                                                                                                                |
| `el`            | `HTMLDivElement`                                          | -         | Root element reference (bindable)                                                                                         |

Any other attribute (`data-*`, `style`, `id`, …) goes to the root `<div>`. `title` is
omitted from the root's HTML attributes because the prop is a `THC`, not the tooltip — as in
`Card`. An `aria-label` on the root would name nothing (a `<div>` has no role); label a
title-less list through `listProps`.

The component is generic (`T = unknown`), so `renderItem`, `getItemId`, `itemProps` and
`itemHref` are typed by your `items`.

### Types

```ts
interface ListGroupSnippetArg<T> {
	item: T;
	index: number;
}
type ListGroupTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** `class` is a string, merged after `classItem` */
type ListGroupItemProps = Omit<HTMLLiAttributes, "children" | "class"> & {
	class?: string;
};
type ListGroupListProps = Omit<
	HTMLAttributes<HTMLUListElement>,
	"children" | "class" | "role"
>;
```

## Usage

### A kit group (the reference shape)

```svelte
<script lang="ts">
	import { ListGroup } from "@marianmeres/stuic";
</script>

<ListGroup
	class="text-sm"
	items={group.lines}
	getItemId={(line) => line.booking_id}
	itemProps={(line) => ({
		"data-line": "",
		"data-booking-id": line.booking_id,
		"data-short": line.short || null,
	})}
	titleLevel={3}
	data-kit-group
	data-kit={group.key}
>
	{#snippet title()}
		{group.label}
		{#if group.optional}
			<span class="text-muted-foreground font-normal">optional</span>
		{/if}
	{/snippet}
	{#snippet aside()}
		<span>{group.requested} pc</span>
		{#if group.short > 0}
			<span class="text-destructive">−{group.short}</span>
		{/if}
	{/snippet}
	{#snippet renderItem({ item: line })}
		<span class="font-mono">{line.equipment_code}</span>
		<span data-grow>{line.equipment_name}</span>
		<span>×{line.requested}</span>
		<span class="text-muted-foreground">picked {line.picked}/{line.requested}</span>
		<span class="text-muted-foreground">{line.location}</span>
	{/snippet}
</ListGroup>
```

What is left on the consumer side is content styling only — mono, muted, a state colour.
No `flex`, `gap`, `px-3 py-2`, `divide-y` or `rounded-md border`.

### Linked rows and a footer

```svelte
<ListGroup
	items={hits}
	getItemId={(hit) => hit.id}
	itemHref={(hit) => `#/find/${hit.kind}/${hit.id}`}
	title="Equipment"
	aside="3 of 15"
	footer="+12 more — narrow the search."
>
	{#snippet renderItem({ item: hit })}
		<span class="font-mono">{hit.id}</span>
		<span data-grow>{hit.label}</span>
		<span class="text-muted-foreground">{hit.meta}</span>
	{/snippet}
</ListGroup>
```

### An empty state

```svelte
<ListGroup items={crew} title="Crew" empty="Nobody and nothing booked for this job yet.">
	{#snippet renderItem({ item })}…{/snippet}
</ListGroup>

<!-- or any THC, e.g. an EmptyState in a snippet -->
<ListGroup items={scanned} title="Scanned">
	{#snippet empty()}
		<EmptyState size="sm" title="Nothing scanned yet" />
	{/snippet}
	{#snippet renderItem({ item })}…{/snippet}
</ListGroup>
```

### Plain strings

```svelte
<ListGroup items={["Alpha", "Beta", "Gamma"]} title="Strings" />
```

### The `children` form

For rows that don't come from one array, or a static list. The CSS selects structurally, so
hand-written rows render exactly like generated ones — including a row whose only child is
a link or a button:

```svelte
<ListGroup title="Shortcuts" class="text-sm">
	<li><span data-grow>Open the scan hub</span><kbd>S</kbd></li>
	<li><a href="#/find/search"><span data-grow>Search</span><kbd>/</kbd></a></li>
	<li><button type="button" onclick={toggle}><span data-grow>Toggle</span></button></li>
</ListGroup>
```

`empty` is an `items` feature: the component cannot count what a snippet renders, so
`children` always renders the `<ul>` it is given. (A `children` list whose rows all render
away collapses — no stray rule under the header.)

## The row

The row box is the `<li>` — or, on a linked row, the `<a>` (or a `<button>`) that is its only
child. It is a wrapping flex line: `column-gap` / `row-gap`, `align-items` from a token
(`center` by default; `baseline` for rows that align on text rather than on pills and
buttons), and `overflow-wrap: anywhere`, so a long dotted path such as
`hall-a.rack-a2.shelf-a2-2.bin` breaks instead of pushing a narrow drawer sideways.

### `data-grow` — the part that absorbs the slack

Put `data-grow` on the one part that should take the leftover space and push everything
after it to the inline end (the name). It gets `flex: 1 1 var(--stuic-list-group-grow-basis)`
(10rem), `min-width: 0` and a one-line truncation. The **basis**, not a `min-width`, carries
"claim 10rem before anything wraps": flex line-breaking uses the basis, so the trailing parts
wrap to the next line once the name would get less than that — and in a container narrower
than 10rem the name still shrinks and truncates instead of overflowing. A row whose primary
part should _wrap_ rather than truncate uses `class="flex-1"` and skips `data-grow`.

### Second lines

A child with `basis-full` (or `w-full`) forces a new line inside the same row; the row gap
spaces it. No attribute is needed:

```svelte
{#snippet renderItem({ item: c })}
	<span data-grow class="font-medium">{c.name}</span>
	<span class="text-muted-foreground">{c.role}</span>
	{#if c.clash}
		<span class="text-destructive basis-full">{c.clash}</span>
	{/if}
{/snippet}
```

### Linked rows

`itemHref` (or a hand-written `<li><a href>…</a></li>`) makes the **whole row** the anchor:
the hit area, the hover background, and an inset focus ring that stays visible inside the
clipped box, first and last row included. The anchor's accessible name is the whole row's
text. **A linked row must not contain other interactive content** — a row that needs both a
link and a button puts the `<a>` on its name in `renderItem`. There is deliberately no
`onItemClick`: a real link beats a click handler (tab order, `Enter`, middle/cmd-click,
"copy link address"). A `<button>` alone in a hand-written row gets the same row styling.

A child that carries a stuic component class — a lone `Button`, `Pill` or `ListItemButton`
— is **not** flattened into the row: it keeps its own box, and the row keeps its padding.

## Empty

- No rows and no `empty` → **nothing renders**, header included (the same rule as
  `DescriptionList` and `Timeline`), so no `{#if items.length}` wrapper is needed.
- No rows with `empty` → header, the empty part, footer. The empty part **replaces** the
  `<ul>` rather than sitting in an `<li>`: a list whose only item says there are no items
  announces "list, 1 item".

## CSS Variables

| Variable                               | Default                               | Description                                                        |
| -------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `--stuic-list-group-bg`                | `transparent`                         | Box background (the surface behind shows through by default)       |
| `--stuic-list-group-border-color`      | `var(--stuic-color-border)`           | Box border color                                                   |
| `--stuic-list-group-border-width`      | `var(--stuic-border-width)`           | Box border width (not declared — tier fallback at the usage site)  |
| `--stuic-list-group-radius`            | `var(--stuic-radius-container)`       | Box radius (not declared — tier fallback at the usage site)        |
| `--stuic-list-group-rule-color`        | `var(--stuic-color-border)`           | Hairlines between header, rows and footer                          |
| `--stuic-list-group-rule-width`        | `1px`                                 | Hairline width                                                     |
| `--stuic-list-group-item-padding-x`    | `0.75rem`                             | Row inline padding — also the header, empty and footer padding     |
| `--stuic-list-group-item-padding-y`    | `0.5rem`                              | Row block padding — also the default header, empty, footer padding |
| `--stuic-list-group-item-gap-x`        | `0.75rem`                             | Gap between row parts (and header parts)                           |
| `--stuic-list-group-item-gap-y`        | `0.25rem`                             | Gap between wrapped lines of a row                                 |
| `--stuic-list-group-item-align`        | `center`                              | Row `align-items` (`baseline` for text-aligned rows)               |
| `--stuic-list-group-grow-basis`        | `10rem`                               | What a `data-grow` part claims before its neighbours wrap          |
| `--stuic-list-group-item-bg-hover`     | `var(--stuic-color-muted)`            | Linked row hover background                                        |
| `--stuic-list-group-item-ring-width`   | `2px`                                 | Linked row focus ring width (drawn inset)                          |
| `--stuic-list-group-item-ring-color`   | `var(--stuic-color-ring)`             | Linked row focus ring color                                        |
| `--stuic-list-group-transition`        | `var(--stuic-transition)`             | Hover transition (not declared — tier fallback at the usage site)  |
| `--stuic-list-group-header-padding-y`  | `--stuic-list-group-item-padding-y`   | Header block padding (not declared — fallback at the usage site)   |
| `--stuic-list-group-header-bg`         | `transparent`                         | Header background                                                  |
| `--stuic-list-group-title-font-weight` | `var(--font-weight-medium)`           | Title weight                                                       |
| `--stuic-list-group-title-text`        | `var(--stuic-color-foreground)`       | Title color                                                        |
| `--stuic-list-group-aside-text`        | `var(--stuic-color-muted-foreground)` | Aside color                                                        |
| `--stuic-list-group-empty-text`        | `var(--stuic-color-muted-foreground)` | Empty state color                                                  |
| `--stuic-list-group-footer-text`       | `var(--stuic-color-muted-foreground)` | Footer color                                                       |

**No part declares a font size.** Rows, title, aside, empty and footer all inherit, so
`class="text-sm"` on the root scales the whole box, and no part can default below the size
you set. The title differs only in weight, the aside only in colour.

**The header shares the rows' inline padding by construction** — there is no header
`padding-x` token — so the header text and the row text always start at the same x.
`--stuic-list-group-header-padding-y` is read as a fallback argument, so a scoped
`--stuic-list-group-item-padding-y` on one group reaches its header too.

The rules have their own width token (like `DescriptionList` and `Separator`), so a theme
that zeroes box borders keeps its hairlines.

A denser, muted-header variant is a few overrides:

```svelte
<ListGroup
	style="--stuic-list-group-item-padding-x: 1rem;
		--stuic-list-group-item-padding-y: 0.75rem;
		--stuic-list-group-bg: var(--stuic-color-background);
		--stuic-list-group-header-bg: var(--stuic-color-muted);
		--stuic-list-group-title-font-weight: var(--font-weight-semibold);"
	{items}
	title="Before the job"
/>
```

## Accessibility

- The root is a `<div>`, not a `<section>`: a labelled `<section>` is a `region` landmark, and
  a drawer holding six groups would add six. The header and footer are `<div>`s for the same
  reason — outside `<main>` or sectioning content (a drawer, a dialog), a `<header>` is a
  `banner` landmark and a `<footer>` a `contentinfo` one.
- `role="list"` is set explicitly on the `<ul>`: WebKit/VoiceOver drops list semantics from a
  `list-style: none` list.
- The title labels the list via `aria-labelledby`. With `titleLevel`, it is also a heading.
- `unstyled` removes the classes but keeps `role`, `aria-labelledby` and the `itemHref`
  anchor — they are semantics, not styling.
- The box is `overflow: clip` (so header and hover backgrounds follow the rounded corners).
  `clip` creates no scroll container, so sticky content still sticks; stuic's tooltip and
  popover are `position: fixed` and are not clipped.
