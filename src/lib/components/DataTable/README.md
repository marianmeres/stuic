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

| Prop                | Type                                       | Default       | Description                                                       |
| ------------------- | ------------------------------------------ | ------------- | ----------------------------------------------------------------- |
| `columns`           | `DataTableColumn<T>[]`                     | required      | Column definitions                                                |
| `data`              | `T[]`                                      | required      | Array of row data                                                 |
| `getRowId`          | `(row, index) => string \| number`         | `(_, i) => i` | Row ID extractor                                                  |
| `paging`            | `PagingCalcResult`                         | -             | Paging state (from `@marianmeres/paging-store`)                   |
| `onPageChange`      | `(offset: number) => void`                 | -             | Called with the new offset when the user navigates pages          |
| `selectable`        | `boolean`                                  | `false`       | Enable selection checkboxes                                       |
| `selected`          | `Set<string \| number>`                    | `new Set()`   | Selected row IDs (bindable)                                       |
| `selectOnRowClick`  | `boolean`                                  | `false`       | Clicking anywhere on a row toggles its selection                  |
| `selectDisabledBy`  | `(row, index) => boolean`                  | -             | Return `true` to disable selection for a specific row             |
| `onRowClick`        | `(row, index) => void`                     | -             | Row click callback                                                |
| `loading`           | `boolean`                                  | `false`       | Show loading overlay                                              |
| `small`             | `boolean`                                  | `false`       | Force mobile/card layout regardless of viewport                   |
| `t`                 | `TranslateFn`                              | built-in      | Optional translation function                                     |
| `cell`              | `Snippet`                                  | -             | Custom cell renderer (desktop + mobile)                           |
| `row`               | `Snippet`                                  | -             | Custom desktop `<tr>` renderer (overrides default row)            |
| `mobileRow`         | `Snippet`                                  | -             | Custom mobile card renderer                                       |
| `batchActions`      | `Snippet`                                  | -             | Batch action bar content                                          |
| `empty`             | `Snippet`                                  | -             | Custom empty state                                                |
| `unstyled`          | `boolean`                                  | `false`       | Skip default styling                                              |
| `class`             | `string`                                   | -             | Additional CSS classes                                            |
| `el`                | `HTMLDivElement`                           | -             | Bindable element ref                                              |

### Snippet signatures

| Snippet        | Props                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `cell`         | `{ column, row, value, rowIndex, variant: "desktop" \| "mobile" }`                               |
| `row`          | `{ row, columns, rowIndex, isSelected }` — desktop only                                          |
| `mobileRow`    | `{ row, columns, rowIndex }` — mobile only                                                       |
| `batchActions` | `{ selected, selectedRows, clearSelection }`                                                     |
| `empty`        | —                                                                                                |

> **Note:** "Select all rows" affects only the rows currently in `data` (i.e. the current page when using external paging). Rows for which `selectDisabledBy` returns `true` are excluded from "select all".

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

## CSS Variables

| Variable                                | Default                               | Description               |
| --------------------------------------- | ------------------------------------- | ------------------------- |
| `--stuic-data-table-radius`             | `var(--radius-md)`                    | Border radius             |
| `--stuic-data-table-border-color`       | `var(--stuic-color-border)`           | Border color              |
| `--stuic-data-table-header-bg`          | `var(--stuic-color-muted)`            | Header background         |
| `--stuic-data-table-header-color`       | `var(--stuic-color-muted-foreground)` | Header text               |
| `--stuic-data-table-header-font-size`   | `0.875rem`                            | Header font size          |
| `--stuic-data-table-header-font-weight` | `var(--font-weight-semibold)`         | Header font weight        |
| `--stuic-data-table-header-padding-x`   | `0.75rem`                             | Header horizontal padding |
| `--stuic-data-table-header-padding-y`   | `0.5rem`                              | Header vertical padding   |
| `--stuic-data-table-row-bg`             | `transparent`                         | Row background            |
| `--stuic-data-table-row-bg-hover`       | `var(--stuic-color-muted)`            | Row hover background      |
| `--stuic-data-table-row-bg-selected`    | `color-mix(primary 10%)`              | Selected row background   |
| `--stuic-data-table-row-border-color`   | `var(--stuic-color-border)`           | Row border color          |
| `--stuic-data-table-cell-padding-x`     | `0.75rem`                             | Cell horizontal padding   |
| `--stuic-data-table-cell-padding-y`     | `0.75rem`                             | Cell vertical padding     |
| `--stuic-data-table-cell-font-size`     | `0.875rem`                            | Cell font size            |
| `--stuic-data-table-loading-opacity`    | `0.5`                                 | Loading state opacity     |
| `--stuic-data-table-card-bg`            | `var(--stuic-color-background)`       | Mobile card background    |
| `--stuic-data-table-card-border-color`  | `var(--stuic-color-border)`           | Mobile card border        |
| `--stuic-data-table-card-radius`        | `var(--radius-md)`                    | Mobile card radius        |
| `--stuic-data-table-card-padding`       | `0.75rem`                             | Mobile card padding       |
| `--stuic-data-table-card-gap`           | `0.5rem`                              | Gap between mobile cards  |
