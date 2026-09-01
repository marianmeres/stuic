# Pagination

Standalone pagination control for lists, search results, and custom views. Two
variants: `compact` — prev / "Page X of Y" / next, exactly the pager `DataTable`
renders internally — and `numbers` — windowed page-number buttons with ellipsis gaps
(the classic `1 … 4 5 6 … 20`).

Consumes the same `PagingCalcResult` from
[`@marianmeres/paging-store`](https://github.com/marianmeres/paging-store) that
`DataTable` does, so one paging store (or one `calculatePaging` call) can feed both.
For quick standalone use, `total`/`limit`/`offset` props compute the paging
internally.

## Props

| Prop                 | Type                     | Default     | Description                                                                           |
| -------------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------- |
| `paging`             | `PagingCalcResult`       | -           | Paging metadata (same shape `DataTable` consumes); wins over `total`/`limit`/`offset` |
| `total`              | `number`                 | -           | Convenience alternative to `paging`: total item count                                 |
| `limit`              | `number`                 | `10`        | Convenience alternative to `paging`: page size                                        |
| `offset`             | `number`                 | `0`         | Convenience alternative to `paging`: current offset                                   |
| `onPageChange`       | `(offset, page) => void` | -           | Navigation callback: new offset (`DataTable`-compatible first arg) + 1-based page     |
| `variant`            | `"compact" \| "numbers"` | `"compact"` | Prev/info/next, or windowed page-number buttons                                       |
| `siblingCount`       | `number`                 | `1`         | Numbers variant: pages always shown around the current page                           |
| `boundaryCount`      | `number`                 | `1`         | Numbers variant: pages always shown at the start and end                              |
| `showFirstLast`      | `boolean`                | `false`     | Render first/last jump buttons (« »)                                                  |
| `showInfo`           | `boolean`                | per variant | "Page X of Y" info; defaults `true` for compact, `false` for numbers                  |
| `hideSinglePage`     | `boolean`                | `true`      | Render nothing when there is at most one page (the `DataTable` rule)                  |
| `disabled`           | `boolean`                | `false`     | Disable all controls (e.g. while loading)                                             |
| `size`               | `ButtonSize`             | `"sm"`      | Size preset of the inner Buttons                                                      |
| `t`                  | `TranslateFn`            | English     | i18n translate function (see below)                                                   |
| `unstyled`           | `boolean`                | `false`     | Skip pagination styling (inner Buttons keep their own Button styling)                 |
| `class`              | `string`                 | -           | Additional CSS classes (merged via twMerge)                                           |
| `classButton`        | `string`                 | -           | Class for every inner button                                                          |
| `classButtonCurrent` | `string`                 | -           | Extra class for the current-page button (numbers variant)                             |
| `classInfo`          | `string`                 | -           | Class for the "Page X of Y" info                                                      |
| `el`                 | `HTMLElement`            | -           | Element reference (bindable)                                                          |

## Snippet Props

| Snippet      | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `renderInfo` | Override the "Page X of Y" info content; receives the `PagingCalcResult` |

## Usage

### Basic (compact)

```svelte
<script lang="ts">
	import { Pagination } from "@marianmeres/stuic";

	let offset = $state(0);
</script>

<Pagination total={137} limit={10} {offset} onPageChange={(o) => (offset = o)} />
```

### With a paging store (shared with DataTable)

The `paging` prop takes the exact object `DataTable` consumes — hide the table's
built-in pager and drive both from one store:

```svelte
<script lang="ts">
	import { DataTable, Pagination } from "@marianmeres/stuic";
	import { createPagingStore } from "@marianmeres/paging-store";

	const paging = createPagingStore({ total: 137, limit: 10, offset: 0 });
	const onPageChange = (offset: number) => paging.update({ offset });
</script>

<DataTable {columns} {data} paging={$paging} showPager={false} />
<Pagination paging={$paging} {onPageChange} variant="numbers" />
```

### Numbers variant

```svelte
<Pagination variant="numbers" total={200} {offset} onPageChange={(o) => (offset = o)} />

<!-- wider window, first/last jumps -->
<Pagination
	variant="numbers"
	siblingCount={2}
	boundaryCount={2}
	showFirstLast
	total={200}
	{offset}
	onPageChange={(o) => (offset = o)}
/>
```

### i18n

Built-in English; bundled Slovak (`PAGINATION_MESSAGES_SK`) is opt-in. The
`previous_page`, `next_page` and `page_x_of_y` keys are identical to `DataTable`'s,
so one merged catalog (and one `t`) can serve both components.

```svelte
<script lang="ts">
	import {
		Pagination,
		createPaginationT,
		PAGINATION_MESSAGES_SK,
	} from "@marianmeres/stuic";
	const t = createPaginationT(PAGINATION_MESSAGES_SK);
</script>

<Pagination {paging} {onPageChange} {t} />
```

### Custom info

```svelte
<Pagination {paging} {onPageChange}>
	{#snippet renderInfo(p)}
		{p.offset + 1}–{Math.min(p.offset + p.limit, p.total)} of {p.total}
	{/snippet}
</Pagination>
```

### Single page

By default nothing renders when there is at most one page (same rule as
`DataTable`'s internal pager). Keep it visible with `hideSinglePage={false}`.

## Accessibility

- Renders a `<nav aria-label="Pagination">` landmark (label localized via `t`).
- Every button carries a localized `aria-label`; the current page button (numbers
  variant) is marked `aria-current="page"`.

## Exports

Besides the component: `paginationRange(currentPage, pageCount, { siblingCount, boundaryCount })`
— the pure windowing helper behind the numbers variant, usable for fully custom pagers.

## CSS Variables

| Variable                              | Default                          | Description                                        |
| ------------------------------------- | -------------------------------- | -------------------------------------------------- |
| `--stuic-pagination-gap`              | `0.5rem`                         | Gap between controls                               |
| `--stuic-pagination-button-min-width` | `--stuic-button-min-height-sm`   | Min button width (keeps number buttons square-ish) |
| `--stuic-pagination-info-font-size`   | `--text-sm`                      | Info font size                                     |
| `--stuic-pagination-info-text`        | `--stuic-color-muted-foreground` | Info color                                         |
| `--stuic-pagination-ellipsis-text`    | `--stuic-color-muted-foreground` | Ellipsis color                                     |

## Data Attributes

- `data-variant` - `"compact" | "numbers"` (on the root `<nav>`)
- `data-current` - `"true"` on the current-page button (numbers variant)
