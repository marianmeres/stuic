# DataTable

A responsive data table component with configurable columns, paging, batch selection,
loading state, and mobile card layout.

## Usage

### Basic

```svelte
<script lang="ts">
	import { DataTable, type DataTableColumn } from "@marianmeres/stuic";

	const columns: DataTableColumn[] = [
		{ key: "id", label: "ID", width: "80px" },
		{ key: "name", label: "Name" },
		{ key: "email", label: "Email" },
	];

	const data = [
		{ id: 1, name: "Alice", email: "alice@example.com" },
		{ id: 2, name: "Bob", email: "bob@example.com" },
	];
</script>

<DataTable {columns} {data} />
```

### With Paging

DataTable integrates with [`@marianmeres/paging-store`](https://github.com/marianmeres/paging-store). Pass its computed result and receive offsets back via `onPageChange`:

```svelte
<script lang="ts">
	import { createPagingStore } from "@marianmeres/paging-store";

	const paging = createPagingStore({ pageSize: 20, totalItems: 100 });
	$: pagingResult = $paging; // or via $derived in Svelte 5 rune mode
</script>

<DataTable
	{columns}
	{data}
	paging={pagingResult}
	onPageChange={(offset) => paging.setOffset(offset)}
/>
```

A single-page result renders no pager -- there is nothing to page through.

#### Bringing your own pager

`paging` does two unrelated jobs: it renders the built-in pager, and it feeds the
select-all-across-pages banner, `effectiveCount` and `totalCount`. `showPager={false}`
asks for the second without the first, for a page that already pages the data from its own
control (one with a rows-per-page selector, say):

```svelte
<DataTable
	{columns}
	{data}
	paging={pagingResult}
	showPager={false}
	selectable
	allowSelectAllPages
/>

<MyOwnPager … />
```

The pager node is then absent from the DOM, not hidden -- it takes no space and holds no
focusable buttons. `onPageChange` never fires while it is hidden (nothing else calls it),
so your own control is the single thing driving the offset; don't wire both.

(The node's class stays `.stuic-data-table-paging` and its `--stuic-data-table-paging-*`
tokens are unchanged -- `showPager` names the control, the CSS names the region.)

### What the built-in pager and empty state are made of

Neither is bespoke markup any more:

- the pager is a [`Pagination`](../Pagination/README.md) in its default `"compact"`
  variant, rendered with `.stuic-data-table-paging` on its own `<nav>`;
- the default empty state (no `empty` snippet) is an
  [`EmptyState`](../EmptyState/README.md) at `size="sm"`, carrying the marker class
  `.stuic-data-table-empty-state` inside the usual `.stuic-data-table-empty` cell.

The table's `--stuic-data-table-*` tokens are re-pointed at the inner components' own
tokens, so an existing override still drives them, and the `t` you pass `DataTable` is
the one the pager uses -- the shared `previous_page`, `next_page` and `page_x_of_y`
keys are identical in both catalogs, so nothing to wire.

Two things did change:

- the pager is a `<nav>` landmark named by the new `pagination` key, where it used to
  be a plain `<div>`. Same buttons, same labels, same `onPageChange` offsets;
- the built-in empty state now gets the `2rem` of padding `.stuic-data-table-empty` has
  always declared. On desktop it never actually got it (the more specific
  `.stuic-data-table td` padding rule won), so that cell is taller than it was, and now
  matches the mobile card layout, which already had it. Typography is unchanged.

An `empty` snippet is untouched by any of this -- it replaces the built-in `EmptyState`
outright and keeps the container padding it has always had. Rendering your own
`EmptyState` in it is a perfectly good way to get an icon, a description and a CTA:

```svelte
<DataTable {columns} {data}>
	{#snippet empty()}
		<EmptyState
			icon={{ html: iconSearch({ size: 48 }) }}
			title="No matches"
			description="Try widening the filter."
		>
			{#snippet actions()}
				<Button onclick={resetFilters}>Reset filters</Button>
			{/snippet}
		</EmptyState>
	{/snippet}
</DataTable>
```

### With Selection

```svelte
<script lang="ts">
	let selected = $state(new Set<string | number>());
</script>

<DataTable {columns} {data} selectable bind:selected getRowId={(row) => row.id}>
	{#snippet batchActions({ selected, clearSelection })}
		<span>{selected.size} selected</span>
		<Button onclick={() => deleteSelected(selected)}>Delete</Button>
		<Button variant="ghost" onclick={clearSelection}>Clear</Button>
	{/snippet}
</DataTable>
```

Shift+click a checkbox to toggle a range of rows from the last clicked checkbox to the current one. Disabled rows in the range are skipped. The anchor resets when `data` changes (e.g. on page navigation).

#### The selection bar holds its place

Everything selection-related lives in one strip above the table: the status while nothing
is selected, your `batchActions` while something is, and the select-all-across-pages offer
on its trailing edge. That strip is rendered from the start and keeps a constant height
(`reserveBatchBar`, on by default), so checking the first row swaps its contents instead
of pushing the table down.

- The height comes from `--stuic-data-table-batch-min-height`, sized to a `size="sm"`
  Button. Batch actions built from bigger controls need that token raised, or the bar
  grows when they appear — which is the jump all over again.
- Idle, the bar is transparent (`--stuic-data-table-batch-bg-idle`) so a permanently
  reserved strip doesn't shout; it takes on `--stuic-data-table-batch-bg` once something
  is selected and `--stuic-data-table-select-all-bg` while the select-all offer is up.
- The bar only exists when there is something to reserve room for — `selectable` plus
  either a `batchActions` snippet or `allowSelectAllPages`. `selectable` on its own
  renders no bar.
- `reserveBatchBar={false}` restores the old behaviour: the bar appears only once it has
  content.

Without a `batchActions` snippet the bar still reports the count itself
(`t("x_rows_selected")` / `t("no_rows_selected")`). With one, the snippet replaces that
status entirely — render your own count next to the buttons.

### Select All Across Pages

When your data is paged, DataTable can offer a "select all results" affordance that expands selection beyond the current page. Enable it with `allowSelectAllPages`. When the user opts in, selection flips to **all-pages mode**: every row is implicitly selected, and `excluded` holds IDs the user has explicitly deselected.

```svelte
<script lang="ts">
	let selected = $state(new Set<string | number>());
	let selectedAll = $state(false);
	let excluded = $state(new Set<string | number>());
</script>

<DataTable
	{columns}
	{data}
	{paging}
	{onPageChange}
	selectable
	allowSelectAllPages
	bind:selected
	bind:selectedAll
	bind:excluded
	getRowId={(row) => row.id}
>
	{#snippet batchActions({
		selectedAll,
		excluded,
		effectiveCount,
		totalCount,
		clearSelection,
	})}
		<span>{effectiveCount} selected{selectedAll ? ` of ${totalCount}` : ""}</span>
		<Button onclick={() => deleteSelection({ selectedAll, excluded })}>Delete</Button>
		<Button variant="ghost" onclick={clearSelection}>Clear</Button>
	{/snippet}
</DataTable>
```

**Important — executing batch operations:** in all-pages mode the off-page rows are not loaded locally, so consumers cannot iterate IDs. Execute operations server-side using the active filter minus `excluded`:

```ts
function deleteSelection({ selectedAll, excluded }) {
	if (selectedAll) {
		// Server-side: DELETE FROM rows WHERE <currentFilter> AND id NOT IN excluded
		return api.delete({ filter: currentFilter, exclude: [...excluded] });
	}
	return api.delete({ ids: [...selected] });
}
```

New records inserted while all-pages mode is active are implicitly selected (they aren't in `excluded`). This matches the conventional intent — "delete everything matching X" should include matches that arrive before the operation runs. If you need snapshot-at-click semantics, capture a timestamp or ID list in your consumer.

**Customising the offer:** the default offer renders on the trailing edge of the selection bar and uses the built-in `t()` keys `select_all_on_page_x`, `select_all_results`, `all_results_selected`, and `clear_selection`. Override its markup entirely with the `selectAllBanner` snippet (which renders in the same slot — it is no longer a standalone block below the batch bar):

```svelte
<DataTable
	{columns}
	{data}
	{paging}
	selectable
	allowSelectAllPages
	bind:selected
	bind:selectedAll
	bind:excluded
>
	{#snippet selectAllBanner({ selectedAll, totalCount, selectAll, clearSelection })}
		<div class="my-banner">
			{#if selectedAll}
				<span>All {totalCount} selected.</span>
				<button onclick={clearSelection}>Undo</button>
			{:else}
				<button onclick={selectAll}>Select all {totalCount}</button>
			{/if}
		</div>
	{/snippet}
</DataTable>
```

**Filter changes:** when filters change in the consumer, reset the bound selection stores (`selected`, `selectedAll`, `excluded`) explicitly — DataTable doesn't track which filter produced the current state.

### Clickable Rows That Work Without a Mouse

`onRowClick` alone makes a row **mouse-only** on the desktop table layout: a `<tr>` is not
focusable, so nothing about the row is reachable by keyboard. (The mobile card layout has
always been fine — it is a `<div role="button">`.) Two opt-in props close that gap, and
they are not alternatives:

| Your row action is…             | Use              |
| ------------------------------- | ---------------- |
| a navigation (it has a URL)     | `rowHref`        |
| anything else (drawer, expand…) | `rowActivatable` |

#### `rowHref` — the lead cell becomes a real link

```svelte
<DataTable
	{columns}
	{data}
	getRowId={(row) => row.id}
	rowHref={(row) => `/users/${row.id}`}
/>
```

The content of the row's **lead cell** (the first column by default, or `rowHrefColumn`)
is wrapped in an `<a href>` — including whatever your `cell` snippet renders for it, and
respecting the column's `renderValue`. A link gets, for free and correctly: keyboard focus
in the right tab order, `Enter`, ⌘/middle-click and "open in new tab", "copy link address",
and a screen-reader announcement of _where it goes_ rather than an anonymous "button".

Return `undefined` for a row with no destination (a placeholder, a row still minting its
id) — that row's lead cell renders exactly as it would without `rowHref`.

`rowHref` composes with `onRowClick`: the row click handler ignores clicks originating
inside an anchor, so the two never double-fire. The consequence is worth stating — a plain
click **on the lead cell** navigates via the href and does _not_ call `onRowClick`, so point
both at the same destination.

On mobile the same field is linked. If the lead column is `hideOnMobile`, the card links its
first visible field instead, rather than silently dropping the anchor.

By default the link looks like the text it replaced (`color: inherit`, no underline until
hover) — a table where every lead cell is blue-and-underlined is a worse table. Three CSS
variables and `classRowLink` are there if you disagree.

#### `rowActivatable` — the `<tr>` itself

For a row whose action has no address:

```svelte
<DataTable
	{columns}
	{data}
	onRowClick={(row) => openDrawer(row)}
	rowActivatable
	rowLabel={(row) => `Open ${row.name}`}
/>
```

The `<tr>` gets `tabindex="0"`, an optional `aria-label` from `rowLabel`, and a
`:focus-visible` ring. It is a no-op unless `onRowClick` or `selectOnRowClick` is set.

Two deliberate choices, so nobody "fixes" them later:

- **No `role="button"` on the `<tr>`.** A `<tr>` carries an implicit `row` role that the
  table's own structure depends on. Overriding it detaches the row from the table for
  assistive technology — row/column counts stop making sense and cell-by-cell navigation
  breaks. The row stays a row; it merely becomes focusable. (The mobile card is a `<div>`,
  so `role="button"` is correct _there_.)
- **`Enter` only, no `Space`.** `Space` on a focused row scrolls the page, and a row is not
  a button — taking `Space` away from a table is a worse trade than the one the card makes.

With `selectable` + `selectOnRowClick`, `Enter` toggles selection _and_ fires `onRowClick`,
matching the mobile card.

#### Both are opt-in

With neither prop set, the rendered markup is exactly what it was before they existed. A
consumer who replaces the whole `<tr>` with the `row` snippet opts out of both and owns the
keyboard story themselves.

Interactive descendants always win: a click, `Enter` or `Space` that originates inside a
`<button>`, an `<a>` or a checkbox in the row is that control's business, not the row's.

### Custom Cell Rendering

The `cell` snippet is used for both desktop and mobile layouts. Use the `variant` param if rendering differs per layout.

```svelte
<DataTable {columns} {data}>
	{#snippet cell({ column, row, value, rowIndex, variant })}
		{#if column.key === "status"}
			<span class="badge">{value}</span>
		{:else if variant === "mobile"}
			<em>{value}</em>
		{:else}
			{value}
		{/if}
	{/snippet}
</DataTable>
```

### Custom Desktop Row

Replace the entire `<tr>` on desktop. When this snippet is provided, DataTable does not render the default row markup (checkbox, cells) — you own it all. Use for custom expandable rows, row grouping, etc.

```svelte
<DataTable {columns} {data}>
	{#snippet row({ row, columns, rowIndex, isSelected })}
		<tr data-custom-row>
			{#each columns as col}
				<td>{row[col.key]}</td>
			{/each}
		</tr>
	{/snippet}
</DataTable>
```

### Disabling Selection Per Row

```svelte
<DataTable
	{columns}
	{data}
	selectable
	bind:selected
	selectDisabledBy={(row) => row.locked === true}
/>
```

### Custom Mobile Layout

```svelte
<DataTable {columns} {data}>
	{#snippet mobileRow({ row })}
		<div class="p-3 border rounded">
			<strong>{row.name}</strong>
			<p>{row.email}</p>
		</div>
	{/snippet}
</DataTable>
```

## Props

| Prop                  | Type                                  | Default       | Description                                                                          |
| --------------------- | ------------------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `columns`             | `DataTableColumn<T>[]`                | required      | Column definitions                                                                   |
| `data`                | `T[]`                                 | required      | Array of row data                                                                    |
| `getRowId`            | `(row, index) => string \| number`    | `(_, i) => i` | Row ID extractor                                                                     |
| `paging`              | `PagingCalcResult`                    | -             | Paging state (from `@marianmeres/paging-store`)                                      |
| `onPageChange`        | `(offset: number) => void`            | -             | Called with the new offset when the user navigates pages                             |
| `showPager`           | `boolean`                             | `true`        | Render the built-in pager. `false` keeps `paging` feeding the select-all banner only |
| `selectable`          | `boolean`                             | `false`       | Enable selection checkboxes                                                          |
| `selected`            | `Set<string \| number>`               | `new Set()`   | Selected row IDs (bindable)                                                          |
| `selectOnRowClick`    | `boolean`                             | `false`       | Clicking anywhere on a row toggles its selection                                     |
| `selectDisabledBy`    | `(row, index) => boolean`             | -             | Return `true` to disable selection for a specific row                                |
| `allowSelectAllPages` | `boolean`                             | `false`       | Show a banner offering "select all results" across paged data                        |
| `selectedAll`         | `boolean`                             | `false`       | All-pages mode flag (bindable). In this mode `excluded` drives selection             |
| `excluded`            | `Set<string \| number>`               | `new Set()`   | Deselected row IDs while in all-pages mode (bindable)                                |
| `reserveBatchBar`     | `boolean`                             | `true`        | Keep the selection bar in the layout while nothing is selected                       |
| `onRowClick`          | `(row, index) => void`                | -             | Row click callback                                                                   |
| `rowHref`             | `(row, index) => string \| undefined` | -             | Wrap the lead cell's content in an `<a href>` (keyboard/⌘-click reachable)           |
| `rowHrefColumn`       | `string`                              | first column  | Which column is the lead cell for `rowHref`                                          |
| `classRowLink`        | `string`                              | -             | Extra classes for the `rowHref` anchor                                               |
| `rowActivatable`      | `boolean`                             | `false`       | Make the desktop `<tr>` focusable + `Enter`-activatable (no `role`)                  |
| `rowLabel`            | `(row, index) => string \| undefined` | -             | Accessible name for an activatable row                                               |
| `loading`             | `boolean`                             | `false`       | Show loading overlay                                                                 |
| `small`               | `boolean`                             | `false`       | Force mobile/card layout regardless of viewport                                      |
| `t`                   | `TranslateFn`                         | built-in      | Optional translation function                                                        |
| `cell`                | `Snippet`                             | -             | Custom cell renderer (desktop + mobile)                                              |
| `row`                 | `Snippet`                             | -             | Custom desktop `<tr>` renderer (overrides default row)                               |
| `mobileRow`           | `Snippet`                             | -             | Custom mobile card renderer                                                          |
| `batchActions`        | `Snippet`                             | -             | Selection bar content while something is selected                                    |
| `selectAllBanner`     | `Snippet`                             | -             | Override default "select all across pages" offer                                     |
| `empty`               | `Snippet`                             | -             | Custom empty state                                                                   |
| `unstyled`            | `boolean`                             | `false`       | Skip default styling                                                                 |
| `class`               | `string`                              | -             | Additional CSS classes                                                               |
| `el`                  | `HTMLDivElement`                      | -             | Bindable element ref                                                                 |

### Snippet signatures

| Snippet           | Props                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `cell`            | `{ column, row, value, rowIndex, variant: "desktop" \| "mobile" }`                              |
| `row`             | `{ row, columns, rowIndex, isSelected }` — desktop only                                         |
| `mobileRow`       | `{ row, columns, rowIndex }` — mobile only                                                      |
| `batchActions`    | `{ selected, selectedRows, selectedAll, excluded, effectiveCount, totalCount, clearSelection }` |
| `selectAllBanner` | `{ selectedAll, effectiveCount, totalCount, pageCount, selectAll, clearSelection }`             |
| `empty`           | —                                                                                               |

> **Note:** "Select all rows" affects only the rows currently in `data` (i.e. the current page when using external paging). Rows for which `selectDisabledBy` returns `true` are excluded from "select all". To select across pages, enable `allowSelectAllPages` and use the banner that appears.
>
> **Note:** `clearSelection` (exposed by the `batchActions` snippet) resets all selection state — `selected`, `selectedAll`, and `excluded` — including exiting all-pages mode.

## DataTableColumn

| Property       | Type                            | Default  | Description                               |
| -------------- | ------------------------------- | -------- | ----------------------------------------- |
| `key`          | `string`                        | required | Data property key (supports dot-notation) |
| `label`        | `THC`                           | `key`    | Column header content                     |
| `width`        | `string`                        | -        | CSS width value                           |
| `class`        | `string`                        | -        | Cell CSS class                            |
| `classHeader`  | `string`                        | -        | Header cell CSS class                     |
| `align`        | `"left" \| "center" \| "right"` | `"left"` | Text alignment                            |
| `hideOnMobile` | `boolean`                       | `false`  | Hide in mobile view                       |
| `renderValue`  | `(value, row) => string`        | -        | Value formatter                           |

## i18n

All built-in texts go through the `t` prop. English is the built-in default; Slovak ships
bundled and opt-in (importing it is what pulls it into your bundle — English-only
consumers pay nothing).

```svelte
<script>
	import {
		DataTable,
		createDataTableT,
		DATA_TABLE_MESSAGES_SK,
	} from "@marianmeres/stuic";

	const t = createDataTableT(DATA_TABLE_MESSAGES_SK);
</script>

<DataTable {columns} {data} {t} />
```

`createDataTableT(messages, fallbackMessages?)` falls back to `DATA_TABLE_MESSAGES_EN` for
any key the catalog does not define, so a partial catalog is fine and a raw key is never
rendered — pass your own object to translate into a language that is not bundled, or to
override individual bundled texts:

```ts
const t = createDataTableT({ ...DATA_TABLE_MESSAGES_SK, no_data: "Nič tu nie je" });
```

| Key                    | English                            | Used by                              |
| ---------------------- | ---------------------------------- | ------------------------------------ |
| `previous_page`        | Prev                               | Paging                               |
| `next_page`            | Next                               | Paging                               |
| `page_x_of_y`          | Page {page} of {pageCount}         | Paging                               |
| `pagination`           | Pagination                         | Pager `<nav>` `aria-label`           |
| `no_data`              | No data                            | Empty state (no `empty` snippet)     |
| `select_all_rows`      | Select all rows on this page       | Header checkbox `aria-label`         |
| `select_row`           | Select row                         | Row checkbox `aria-label`            |
| `no_rows_selected`     | No rows selected                   | Idle selection bar                   |
| `x_rows_selected`      | {count} selected                   | Selection bar without `batchActions` |
| `select_all_on_page_x` | All {count} on this page selected. | Select-all offer                     |
| `select_all_results`   | Select all {totalCount} results    | Select-all offer                     |
| `all_results_selected` | All {totalCount} results selected. | Select-all offer, all-pages mode     |
| `clear_selection`      | Clear selection                    | Select-all offer, all-pages mode     |

## CSS Variables

| Variable                                       | Default                               | Description                       |
| ---------------------------------------------- | ------------------------------------- | --------------------------------- |
| `--stuic-data-table-radius`                    | `var(--radius-md)`                    | Border radius                     |
| `--stuic-data-table-border-color`              | `var(--stuic-color-border)`           | Border color                      |
| `--stuic-data-table-header-bg`                 | `var(--stuic-color-muted)`            | Header background                 |
| `--stuic-data-table-header-color`              | `var(--stuic-color-muted-foreground)` | Header text                       |
| `--stuic-data-table-header-font-size`          | `0.875rem`                            | Header font size                  |
| `--stuic-data-table-header-font-weight`        | `var(--font-weight-semibold)`         | Header font weight                |
| `--stuic-data-table-header-padding-x`          | `0.75rem`                             | Header horizontal padding         |
| `--stuic-data-table-header-padding-y`          | `0.5rem`                              | Header vertical padding           |
| `--stuic-data-table-row-bg`                    | `transparent`                         | Row background                    |
| `--stuic-data-table-row-bg-hover`              | `var(--stuic-color-muted)`            | Row hover background              |
| `--stuic-data-table-row-bg-selected`           | `color-mix(primary 10%)`              | Selected row background           |
| `--stuic-data-table-row-border-color`          | `var(--stuic-color-border)`           | Row border color                  |
| `--stuic-data-table-row-link-color`            | `inherit`                             | `rowHref` anchor color            |
| `--stuic-data-table-row-link-decoration`       | `none`                                | `rowHref` anchor decoration       |
| `--stuic-data-table-row-link-decoration-hover` | `underline`                           | …on hover                         |
| `--stuic-data-table-row-ring-width`            | `3px`                                 | Activatable row focus ring        |
| `--stuic-data-table-row-ring-color`            | `var(--stuic-color-ring)`             | Activatable row ring color        |
| `--stuic-data-table-cell-padding-x`            | `0.75rem`                             | Cell horizontal padding           |
| `--stuic-data-table-cell-padding-y`            | `0.75rem`                             | Cell vertical padding             |
| `--stuic-data-table-cell-font-size`            | `0.875rem`                            | Cell font size                    |
| `--stuic-data-table-loading-opacity`           | `0.5`                                 | Loading state opacity             |
| `--stuic-data-table-card-bg`                   | `var(--stuic-color-background)`       | Mobile card background            |
| `--stuic-data-table-card-border-color`         | `var(--stuic-color-border)`           | Mobile card border                |
| `--stuic-data-table-card-radius`               | `var(--radius-md)`                    | Mobile card radius                |
| `--stuic-data-table-card-padding`              | `0.75rem`                             | Mobile card padding               |
| `--stuic-data-table-card-gap`                  | `0.5rem`                              | Gap between mobile cards          |
| `--stuic-data-table-batch-bg`                  | `var(--stuic-color-muted)`            | Selection bar background          |
| `--stuic-data-table-batch-bg-idle`             | `transparent`                         | …while nothing is selected        |
| `--stuic-data-table-batch-padding-x`           | `0.75rem`                             | Selection bar h. padding          |
| `--stuic-data-table-batch-padding-y`           | `0.5rem`                              | Selection bar v. padding          |
| `--stuic-data-table-batch-min-height`          | `sm Button + padding`                 | Reserved selection bar height     |
| `--stuic-data-table-select-all-bg`             | `color-mix(primary 10%)`              | …while the select-all offer is up |
