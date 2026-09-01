<script lang="ts">
	import { calculatePaging } from "@marianmeres/paging-store";
	import {
		Pagination,
		createPaginationT,
		PAGINATION_MESSAGES_SK,
	} from "$lib/components/Pagination/index.js";
	import DataTable, {
		type DataTableColumn,
	} from "$lib/components/DataTable/DataTable.svelte";

	const TOTAL = 137;
	const LIMIT = 10;

	// each section keeps its own offset so the demos stay independent
	let offsetCompact = $state(0);
	let offsetNumbers = $state(40);
	let offsetWide = $state(90);
	let offsetSk = $state(20);
	let offsetInfo = $state(0);
	let offsetTable = $state(0);

	const tSk = createPaginationT(PAGINATION_MESSAGES_SK);

	// --- DataTable integration (one paging object drives both) ---
	const columns: DataTableColumn<Record<string, string>>[] = [
		{ key: "id", label: "#" },
		{ key: "name", label: "Name" },
	];
	const tablePaging = $derived(
		calculatePaging({ total: TOTAL, limit: LIMIT, offset: offsetTable })
	);
	const tableData = $derived(
		Array.from({ length: Math.min(LIMIT, TOTAL - tablePaging.currentOffset) }, (_, i) => {
			const n = tablePaging.currentOffset + i + 1;
			return { id: `${n}`, name: `Row ${n}` };
		})
	);
</script>

<h2 class="text-xl font-bold mb-4">Pagination</h2>

<h3 class="font-semibold mb-2">Compact (default) — the DataTable pager, standalone</h3>
<div class="mb-8">
	<Pagination
		total={TOTAL}
		limit={LIMIT}
		offset={offsetCompact}
		onPageChange={(o) => (offsetCompact = o)}
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Numbers</h3>
<div class="mb-8">
	<Pagination
		variant="numbers"
		total={TOTAL}
		limit={LIMIT}
		offset={offsetNumbers}
		onPageChange={(o) => (offsetNumbers = o)}
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">
	Numbers + first/last, wider window (siblingCount=2, boundaryCount=2), info
</h3>
<div class="mb-8">
	<Pagination
		variant="numbers"
		siblingCount={2}
		boundaryCount={2}
		showFirstLast
		showInfo
		total={250}
		limit={LIMIT}
		offset={offsetWide}
		onPageChange={(o) => (offsetWide = o)}
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">i18n (Slovak catalog)</h3>
<div class="mb-8">
	<Pagination
		total={TOTAL}
		limit={LIMIT}
		offset={offsetSk}
		onPageChange={(o) => (offsetSk = o)}
		t={tSk}
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Custom info (renderInfo snippet)</h3>
<div class="mb-8">
	<Pagination
		total={TOTAL}
		limit={LIMIT}
		offset={offsetInfo}
		onPageChange={(o) => (offsetInfo = o)}
	>
		{#snippet renderInfo(p)}
			{p.offset + 1}&ndash;{Math.min(p.offset + p.limit, p.total)} of {p.total}
		{/snippet}
	</Pagination>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Disabled (e.g. while loading)</h3>
<div class="mb-8">
	<Pagination variant="numbers" total={TOTAL} limit={LIMIT} offset={40} disabled />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Single page</h3>
<div class="mb-8 space-y-2">
	<p class="text-sm text-neutral-500">
		Default: nothing renders (hideSinglePage). Below: hideSinglePage=false.
	</p>
	<Pagination total={5} limit={10} offset={0} />
	<Pagination total={5} limit={10} offset={0} hideSinglePage={false} />
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Token overrides</h3>
<div class="mb-8">
	<Pagination
		variant="numbers"
		total={TOTAL}
		limit={LIMIT}
		offset={40}
		style="--stuic-pagination-gap: 0.125rem; --stuic-pagination-button-min-width: 2.25rem;"
	/>
</div>

<hr class="my-6" />

<h3 class="font-semibold mb-2">Shared with DataTable (showPager off, one paging)</h3>
<div class="mb-8">
	<DataTable
		{columns}
		data={tableData}
		paging={tablePaging}
		showPager={false}
		getRowId={(r) => r.id}
	/>
	<Pagination
		variant="numbers"
		showInfo
		paging={tablePaging}
		onPageChange={(o) => (offsetTable = o)}
		class="mt-4"
	/>
</div>
