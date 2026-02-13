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

```svelte
<DataTable
	{columns}
	{data}
	page={1}
	pageSize={20}
	totalItems={100}
	onPageChange={(p) => fetchPage(p)}
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

```svelte
<DataTable {columns} {data}>
	{#snippet cell({ column, row, value })}
		{#if column.key === "status"}
			<span class="badge">{value}</span>
		{:else}
			{value}
		{/if}
	{/snippet}
</DataTable>
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

| Prop           | Type                               | Default       | Description                 |
| -------------- | ---------------------------------- | ------------- | --------------------------- |
| `columns`      | `DataTableColumn<T>[]`             | required      | Column definitions          |
| `data`         | `T[]`                              | required      | Array of row data           |
| `getRowId`     | `(row, index) => string \| number` | `(_, i) => i` | Row ID extractor            |
| `page`         | `number`                           | -             | Current page (1-based)      |
| `pageSize`     | `number`                           | -             | Rows per page               |
| `totalItems`   | `number`                           | -             | Total items count           |
| `onPageChange` | `(page: number) => void`           | -             | Page change callback        |
| `selectable`   | `boolean`                          | `false`       | Enable selection checkboxes |
| `selected`     | `Set<string \| number>`            | `new Set()`   | Selected row IDs (bindable) |
| `onRowClick`   | `(row, index) => void`             | -             | Row click callback          |
| `loading`      | `boolean`                          | `false`       | Show loading overlay        |
| `cell`         | `Snippet`                          | -             | Custom cell renderer        |
| `batchActions` | `Snippet`                          | -             | Batch action bar content    |
| `empty`        | `Snippet`                          | -             | Custom empty state          |
| `mobileRow`    | `Snippet`                          | -             | Custom mobile row card      |
| `unstyled`     | `boolean`                          | `false`       | Skip default styling        |
| `class`        | `string`                           | -             | Additional CSS classes      |
| `el`           | `HTMLDivElement`                   | -             | Bindable element ref        |

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
