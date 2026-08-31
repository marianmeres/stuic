<script lang="ts">
	import {
		DataTable,
		Button,
		createDataTableT,
		DATA_TABLE_MESSAGES_SK,
		type DataTableColumn,
	} from "$lib/index.js";
	import { createPagingStore, type PagingCalcResult } from "@marianmeres/paging-store";

	// --- Sample data ---
	interface User {
		id: number;
		name: string;
		email: string;
		role: string;
		status: "active" | "inactive" | "pending";
		joined: string;
	}

	const ALL_USERS: User[] = [
		{
			id: 1,
			name: "Alice Johnson",
			email: "alice@example.com",
			role: "Admin",
			status: "active",
			joined: "2024-01-15",
		},
		{
			id: 2,
			name: "Bob Smith",
			email: "bob@example.com",
			role: "Editor",
			status: "active",
			joined: "2024-02-20",
		},
		{
			id: 3,
			name: "Charlie Brown",
			email: "charlie@example.com",
			role: "Viewer",
			status: "inactive",
			joined: "2024-03-10",
		},
		{
			id: 4,
			name: "Diana Prince",
			email: "diana@example.com",
			role: "Admin",
			status: "active",
			joined: "2024-04-05",
		},
		{
			id: 5,
			name: "Edward Norton",
			email: "edward@example.com",
			role: "Editor",
			status: "pending",
			joined: "2024-05-12",
		},
		{
			id: 6,
			name: "Fiona Apple",
			email: "fiona@example.com",
			role: "Viewer",
			status: "active",
			joined: "2024-06-18",
		},
		{
			id: 7,
			name: "George Clooney",
			email: "george@example.com",
			role: "Editor",
			status: "inactive",
			joined: "2024-07-22",
		},
		{
			id: 8,
			name: "Hannah Montana",
			email: "hannah@example.com",
			role: "Viewer",
			status: "active",
			joined: "2024-08-01",
		},
		{
			id: 9,
			name: "Ivan Drago",
			email: "ivan@example.com",
			role: "Admin",
			status: "pending",
			joined: "2024-09-14",
		},
		{
			id: 10,
			name: "Julia Roberts",
			email: "julia@example.com",
			role: "Editor",
			status: "active",
			joined: "2024-10-03",
		},
		{
			id: 11,
			name: "Kevin Hart",
			email: "kevin@example.com",
			role: "Viewer",
			status: "active",
			joined: "2024-10-15",
		},
		{
			id: 12,
			name: "Laura Palmer",
			email: "laura@example.com",
			role: "Admin",
			status: "inactive",
			joined: "2024-11-01",
		},
	];

	const columns: DataTableColumn<User>[] = [
		{ key: "id", label: "ID", width: "60px", align: "center" },
		{ key: "name", label: "Name" },
		{ key: "email", label: "Email", hideOnMobile: true },
		{ key: "role", label: "Role", width: "100px" },
		{
			key: "status",
			label: "Status",
			width: "100px",
			align: "center",
		},
		{ key: "joined", label: "Joined", width: "120px", hideOnMobile: true },
	];

	// --- Basic example ---
	const basicColumns: DataTableColumn[] = [
		{ key: "id", label: "ID", width: "60px" },
		{ key: "name", label: "Name" },
		{ key: "email", label: "Email" },
	];

	const basicData = ALL_USERS.slice(0, 3);

	// --- Paging example ---
	const PAGE_SIZE = 5;
	const pagingStore = createPagingStore({ total: ALL_USERS.length, limit: PAGE_SIZE });
	let paging = $state<PagingCalcResult>(pagingStore.get());
	pagingStore.subscribe((v) => (paging = v));
	let pagingLoading = $state(false);

	let pagedData = $derived(ALL_USERS.slice(paging.offset, paging.offset + paging.limit));

	async function handlePageChange(offset: number) {
		pagingLoading = true;
		// Simulate async fetch
		await new Promise((r) => setTimeout(r, 500));
		pagingStore.update({ offset });
		pagingLoading = false;
	}

	// --- Selection example ---
	let selected = $state(new Set<string | number>());
	let lastAction = $state("");
	let reserveBatchBar = $state(true);

	// --- Select-all-across-pages example ---
	const SELECT_ALL_PAGE_SIZE = 4;
	const selectAllPagingStore = createPagingStore({
		total: ALL_USERS.length,
		limit: SELECT_ALL_PAGE_SIZE,
	});
	let selectAllPaging = $state<PagingCalcResult>(selectAllPagingStore.get());
	selectAllPagingStore.subscribe((v) => (selectAllPaging = v));
	let selectAllPagedData = $derived(
		ALL_USERS.slice(
			selectAllPaging.offset,
			selectAllPaging.offset + selectAllPaging.limit
		)
	);
	let selectedAllExample = $state(new Set<string | number>());
	let selectAllMode = $state(false);
	let excludedExample = $state(new Set<string | number>());
	let selectAllLastAction = $state("");
	// The motivating case for `showPager`: this page already has its own pager (below),
	// so the built-in one would just say the same thing twice.
	let selectAllShowPager = $state(true);

	// --- Row click example ---
	let clickedRow = $state<User | null>(null);

	// --- i18n example ---
	const tSk = createDataTableT(DATA_TABLE_MESSAGES_SK);
	const skPagingStore = createPagingStore({ total: ALL_USERS.length, limit: PAGE_SIZE });
	let skPaging = $state<PagingCalcResult>(skPagingStore.get());
	skPagingStore.subscribe((v) => (skPaging = v));
	let skPagedData = $derived(
		ALL_USERS.slice(skPaging.offset, skPaging.offset + skPaging.limit)
	);
	let skSelected = $state(new Set<string | number>());

	// --- Keyboard-reachable rows example ---
	let activatedRow = $state<User | null>(null);

	// --- Loading example ---
	let isLoading = $state(false);

	async function simulateLoading() {
		isLoading = true;
		await new Promise((r) => setTimeout(r, 2000));
		isLoading = false;
	}

	// --- Value formatter example ---
	const formattedColumns: DataTableColumn[] = [
		{ key: "id", label: "ID", width: "60px" },
		{ key: "name", label: "Name", renderValue: (v: any) => v.toUpperCase() },
		{ key: "email", label: "Email", renderValue: (v: any) => v.split("@")[0] + "@..." },
	];

	// --- Horizontal scroll example ---
	const wideColumns: DataTableColumn<User>[] = [
		{ key: "id", label: "ID", width: "80px" },
		{ key: "name", label: "Full Name", width: "200px" },
		{ key: "email", label: "Email Address", width: "250px" },
		{ key: "role", label: "Role", width: "150px" },
		{ key: "status", label: "Status", width: "150px" },
		{ key: "joined", label: "Join Date", width: "150px" },
	];
</script>

<h1 class="text-2xl font-bold mb-8">DataTable</h1>

<!-- ============== BASIC ============== -->
<h2 class="text-lg font-bold mb-4">Basic</h2>
<div class="max-w-3xl">
	<DataTable columns={basicColumns} data={basicData} />
</div>

<hr class="my-8" />

<!-- ============== CUSTOM CELL RENDERING ============== -->
<h2 class="text-lg font-bold mb-4">Custom Cell Rendering</h2>
<div class="max-w-4xl">
	<DataTable {columns} data={ALL_USERS.slice(0, 5)} getRowId={(row) => row.id}>
		{#snippet cell({ column, value })}
			{#if column.key === "status"}
				<span
					class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
					class:bg-green-100={value === "active"}
					class:text-green-700={value === "active"}
					class:bg-red-100={value === "inactive"}
					class:text-red-700={value === "inactive"}
					class:bg-yellow-100={value === "pending"}
					class:text-yellow-700={value === "pending"}
				>
					{value}
				</span>
			{:else}
				{value}
			{/if}
		{/snippet}
	</DataTable>
</div>

<hr class="my-8" />

<!-- ============== WITH PAGING ============== -->
<h2 class="text-lg font-bold mb-4">With Paging (async fetch simulation, full width)</h2>
<div>
	<DataTable
		{columns}
		data={pagedData}
		getRowId={(row) => row.id}
		{paging}
		onPageChange={handlePageChange}
		loading={pagingLoading}
	>
		{#snippet cell({ column, value })}
			{#if column.key === "status"}
				<span
					class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
					class:bg-green-100={value === "active"}
					class:text-green-700={value === "active"}
					class:bg-red-100={value === "inactive"}
					class:text-red-700={value === "inactive"}
					class:bg-yellow-100={value === "pending"}
					class:text-yellow-700={value === "pending"}
				>
					{value}
				</span>
			{:else}
				{value}
			{/if}
		{/snippet}
	</DataTable>
</div>

<hr class="my-8" />

<!-- ============== WITH SELECTION ============== -->
<h2 class="text-lg font-bold mb-4">With Selection & Batch Actions</h2>
<p class="text-sm opacity-70 mb-4">
	The selection bar keeps its place while nothing is selected (<code>reserveBatchBar</code
	>, on by default), so ticking the first checkbox doesn't shove the table down. Turn it
	off to see the old pop-in.
</p>
<label class="flex items-center gap-2 text-sm mb-4">
	<input type="checkbox" bind:checked={reserveBatchBar} />
	<code>reserveBatchBar</code>
</label>
<div class="max-w-4xl">
	<DataTable
		{columns}
		data={ALL_USERS.slice(0, 6)}
		getRowId={(row) => row.id}
		selectable
		selectOnRowClick
		{reserveBatchBar}
		bind:selected
	>
		{#snippet cell({ column, value })}
			{#if column.key === "status"}
				<span
					class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
					class:bg-green-100={value === "active"}
					class:text-green-700={value === "active"}
					class:bg-red-100={value === "inactive"}
					class:text-red-700={value === "inactive"}
					class:bg-yellow-100={value === "pending"}
					class:text-yellow-700={value === "pending"}
				>
					{value}
				</span>
			{:else}
				{value}
			{/if}
		{/snippet}
		{#snippet batchActions({ selected: sel, selectedRows, clearSelection })}
			<span class="text-sm font-medium">{sel.size} selected</span>
			<Button
				size="sm"
				intent="destructive"
				variant="soft"
				onclick={() => {
					lastAction = `Deleted: ${selectedRows.map((r) => r.name).join(", ")}`;
					clearSelection();
				}}
			>
				Delete
			</Button>
			<Button size="sm" variant="ghost" onclick={clearSelection}>Clear</Button>
		{/snippet}
	</DataTable>
	{#if lastAction}
		<p class="mt-2 text-sm text-green-600">{lastAction}</p>
	{/if}
</div>

<hr class="my-8" />

<!-- ============== SELECT ALL ACROSS PAGES ============== -->
<h2 class="text-lg font-bold mb-4">Select All Across Pages</h2>
<p class="text-sm opacity-70 mb-4">
	Check all rows on a page to reveal the banner offering to select every result. In
	all-pages mode, unchecking a row adds it to <code>excluded</code> instead of removing it
	from <code>selected</code>. Off-page rows are implicitly selected — execute batch
	operations as server-side filter queries, not by iterating IDs.
</p>
<p class="text-sm opacity-70 mb-4">
	The banner needs <code>paging</code> — it is what tells the table there are results off
	screen. Untick <code>showPager</code> to keep feeding it while suppressing the built-in pager,
	for a page that already pages the data from its own control (the plain one below stands in
	for it).
</p>
<label class="flex items-center gap-2 text-sm mb-4">
	<input type="checkbox" bind:checked={selectAllShowPager} />
	<code>showPager</code>
</label>
<div>
	<DataTable
		{columns}
		data={selectAllPagedData}
		getRowId={(row) => row.id}
		paging={selectAllPaging}
		onPageChange={(offset) => selectAllPagingStore.update({ offset })}
		showPager={selectAllShowPager}
		selectable
		allowSelectAllPages
		bind:selected={selectedAllExample}
		bind:selectedAll={selectAllMode}
		bind:excluded={excludedExample}
	>
		{#snippet cell({ column, value })}
			{#if column.key === "status"}
				<span
					class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
					class:bg-green-100={value === "active"}
					class:text-green-700={value === "active"}
					class:bg-red-100={value === "inactive"}
					class:text-red-700={value === "inactive"}
					class:bg-yellow-100={value === "pending"}
					class:text-yellow-700={value === "pending"}
				>
					{value}
				</span>
			{:else}
				{value}
			{/if}
		{/snippet}
		{#snippet batchActions({
			selectedAll,
			excluded,
			effectiveCount,
			totalCount,
			clearSelection,
		})}
			<span class="text-sm font-medium">
				{effectiveCount} selected{selectedAll && totalCount != null
					? ` of ${totalCount}`
					: ""}
			</span>
			<Button
				size="sm"
				intent="destructive"
				variant="soft"
				onclick={() => {
					if (selectedAll) {
						selectAllLastAction = `Would delete ALL ${totalCount} results excluding IDs [${[...excluded].join(", ") || "none"}] via server-side query`;
					} else {
						selectAllLastAction = `Would delete IDs [${[...selectedAllExample].join(", ")}]`;
					}
					clearSelection();
				}}
			>
				Delete
			</Button>
			<Button size="sm" variant="ghost" onclick={clearSelection}>Clear</Button>
		{/snippet}
	</DataTable>
	{#if !selectAllShowPager}
		<div class="mt-2 flex items-center gap-3 text-sm">
			<Button
				size="sm"
				variant="ghost"
				disabled={!selectAllPaging.hasPrevious}
				onclick={() =>
					selectAllPagingStore.update({ offset: selectAllPaging.previousOffset })}
			>
				&lsaquo; Prev
			</Button>
			<span class="opacity-70">
				Page {selectAllPaging.currentPage} of {selectAllPaging.pageCount} (my own pager)
			</span>
			<Button
				size="sm"
				variant="ghost"
				disabled={!selectAllPaging.hasNext}
				onclick={() =>
					selectAllPagingStore.update({ offset: selectAllPaging.nextOffset })}
			>
				Next &rsaquo;
			</Button>
		</div>
	{/if}
	{#if selectAllLastAction}
		<p class="mt-2 text-sm text-green-600">{selectAllLastAction}</p>
	{/if}
</div>

<hr class="my-8" />

<!-- ============== I18N ============== -->
<h2 class="text-lg font-bold mb-4">Localization (bundled Slovak catalog)</h2>
<p class="text-sm opacity-70 mb-4">
	Every built-in string goes through <code>t()</code>. The Slovak catalog ships with the
	package — <code>createDataTableT(DATA_TABLE_MESSAGES_SK)</code> — and a partial catalog of
	your own falls back to English key by key.
</p>
<div>
	<DataTable
		{columns}
		data={skPagedData}
		getRowId={(row) => row.id}
		paging={skPaging}
		onPageChange={(offset) => skPagingStore.update({ offset })}
		selectable
		bind:selected={skSelected}
		t={tSk}
	>
		{#snippet batchActions({ effectiveCount, clearSelection })}
			<span class="text-sm font-medium"
				>{tSk("x_rows_selected", { count: effectiveCount })}</span
			>
			<Button size="sm" variant="ghost" onclick={clearSelection}>
				{tSk("clear_selection")}
			</Button>
		{/snippet}
	</DataTable>
</div>

<hr class="my-8" />

<!-- ============== ROW CLICK ============== -->
<h2 class="text-lg font-bold mb-4">Row Click</h2>
<div class="max-w-4xl">
	<DataTable
		columns={basicColumns}
		data={ALL_USERS.slice(0, 5)}
		getRowId={(row) => row.id}
		onRowClick={(row) => (clickedRow = row)}
	/>
	{#if clickedRow}
		<p class="mt-2 text-sm">
			Clicked: <strong>{clickedRow.name}</strong> ({clickedRow.email})
		</p>
	{/if}
</div>

<hr class="my-8" />

<!-- ============== KEYBOARD REACHABLE ROWS ============== -->
<h2 class="text-lg font-bold mb-4">Keyboard-Reachable Rows</h2>
<p class="text-sm opacity-70 mb-4">
	A row that is clickable by mouse only is unreachable by keyboard. Tab through both
	tables below.
</p>

<h3 class="text-sm font-semibold mb-2">
	<code>rowHref</code> — when the row action is a navigation
</h3>
<p class="text-sm opacity-70 mb-4">
	The lead cell becomes a real anchor: focusable, <kbd>Enter</kbd>-activatable,
	⌘/middle-clickable, and announced with its destination. Nothing else about the row
	changes.
</p>
<div class="max-w-4xl">
	<DataTable
		columns={basicColumns}
		data={ALL_USERS.slice(0, 5)}
		getRowId={(row) => row.id}
		rowHref={(row) => `#user-${row.id}`}
		rowHrefColumn="name"
	/>
</div>

<h3 class="text-sm font-semibold mt-8 mb-2">
	<code>rowActivatable</code> — when it is not
</h3>
<p class="text-sm opacity-70 mb-4">
	The <code>&lt;tr&gt;</code> itself becomes focusable (no <code>role="button"</code> —
	that would detach the row from the table for assistive tech) and
	<kbd>Enter</kbd> fires <code>onRowClick</code>. <kbd>Space</kbd> deliberately still scrolls
	the page.
</p>
<div class="max-w-4xl">
	<DataTable
		columns={basicColumns}
		data={ALL_USERS.slice(0, 5)}
		getRowId={(row) => row.id}
		onRowClick={(row) => (activatedRow = row)}
		rowActivatable
		rowLabel={(row) => `Open ${row.name}`}
	/>
	{#if activatedRow}
		<p class="mt-2 text-sm">
			Activated: <strong>{activatedRow.name}</strong>
		</p>
	{/if}
</div>

<hr class="my-8" />

<!-- ============== LOADING STATE ============== -->
<h2 class="text-lg font-bold mb-4">Loading State</h2>
<div class="max-w-3xl">
	<Button size="sm" variant="outline" class="mb-4" onclick={simulateLoading}>
		{isLoading ? "Loading..." : "Simulate 2s Loading"}
	</Button>
	<DataTable columns={basicColumns} data={basicData} loading={isLoading} />
</div>

<hr class="my-8" />

<!-- ============== EMPTY STATE ============== -->
<h2 class="text-lg font-bold mb-4">Empty State</h2>
<div class="max-w-3xl">
	<DataTable columns={basicColumns} data={[]}>
		{#snippet empty()}
			<div class="text-center py-4">
				<p class="text-lg font-semibold">No records found</p>
				<p class="text-sm opacity-60 mt-1">
					Try adjusting your filters or adding new data.
				</p>
			</div>
		{/snippet}
	</DataTable>
</div>

<hr class="my-8" />

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<h2 class="text-lg font-bold mb-4">CSS Variable Override</h2>
<div
	class="max-w-3xl"
	style="
		--stuic-data-table-header-bg: var(--stuic-color-primary);
		--stuic-data-table-header-color: var(--stuic-color-primary-foreground);
		--stuic-data-table-row-bg-hover: color-mix(in srgb, var(--stuic-color-primary) 8%, var(--stuic-color-background));
		--stuic-data-table-radius: var(--radius-lg);
	"
>
	<DataTable columns={basicColumns} data={basicData} />
</div>

<hr class="my-8" />

<!-- ============== VALUE FORMATTER ============== -->
<h2 class="text-lg font-bold mb-4">Value Formatter (renderValue)</h2>
<div class="max-w-3xl">
	<DataTable columns={formattedColumns} data={basicData} />
</div>

<hr class="my-8" />

<!-- ============== HORIZONTAL SCROLL ============== -->
<h2 class="text-lg font-bold mb-4">Horizontal Scroll (many columns, narrow container)</h2>
<div class="max-w-xl">
	<DataTable
		columns={wideColumns}
		data={ALL_USERS.slice(0, 5)}
		getRowId={(row) => row.id}
	/>
</div>

<hr class="my-8" />

<!-- ============== FORCED SMALL (CARD) LAYOUT ============== -->
<h2 class="text-lg font-bold mb-4">Forced Card Layout (small prop)</h2>
<div class="max-w-sm">
	<DataTable columns={basicColumns} data={basicData} small />
</div>
