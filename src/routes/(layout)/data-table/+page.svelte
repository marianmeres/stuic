<script lang="ts">
	import { DataTable, Button, type DataTableColumn } from "$lib/index.js";
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

	// --- Row click example ---
	let clickedRow = $state<User | null>(null);

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
<div class="max-w-4xl">
	<DataTable
		{columns}
		data={ALL_USERS.slice(0, 6)}
		getRowId={(row) => row.id}
		selectable
		selectOnRowClick
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
