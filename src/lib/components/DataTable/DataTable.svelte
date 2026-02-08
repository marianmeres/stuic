<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { PagingCalcResult } from "@marianmeres/paging-store";
	import type { THC } from "../Thc/index.js";
	import type { TranslateFn } from "../../types.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		_i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			previous_page: "Prev",
			next_page: "Next",
			page_x_of_y: "Page {page} of {pageCount}",
			no_data: "No data",
			select_all_rows: "Select all rows",
			select_row: "Select row",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	export interface DataTableColumn<T = Record<string, any>> {
		/** Property key to extract from row data (supports dot-notation: "data.name") */
		key: string;
		/** Column header label (string, HTML, component, or snippet) */
		label?: THC;
		/** CSS width value (e.g. "200px", "30%") */
		width?: string;
		/** Additional CSS class for body cells in this column */
		class?: string;
		/** Additional CSS class for the header cell */
		classHeader?: string;
		/** Text alignment */
		align?: "left" | "center" | "right";
		/** Hide this column in mobile card view */
		hideOnMobile?: boolean;
		/** Simple text formatter for cell values */
		renderValue?: (value: any, row: T) => string;
	}

	export interface Props<T = Record<string, any>> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children"
	> {
		/** Column definitions */
		columns: DataTableColumn<T>[];
		/** Array of row data objects */
		data: T[];
		/** Function to extract a unique ID from a row. Defaults to index. */
		getRowId?: (row: T, index: number) => string | number;

		/** Paging calculation result from @marianmeres/paging-store */
		paging?: PagingCalcResult;
		/** Callback when the user navigates to a different page (receives new offset) */
		onPageChange?: (offset: number) => void;

		/** Enable row selection checkboxes */
		selectable?: boolean;
		/** Set of selected row IDs (bindable) */
		selected?: Set<string | number>;
		/** Toggle row selection when clicking anywhere on the row */
		selectOnRowClick?: boolean;

		/** Callback when a row is clicked */
		onRowClick?: (row: T, index: number) => void;

		/** Show loading state (spinner overlay + reduced opacity) */
		loading?: boolean;

		/** Custom cell renderer snippet */
		cell?: Snippet<
			[{ column: DataTableColumn<T>; row: T; value: any; rowIndex: number }]
		>;
		/** Batch actions bar snippet (shown when items are selected) */
		batchActions?: Snippet<
			[
				{
					selected: Set<string | number>;
					selectedRows: T[];
					clearSelection: () => void;
				},
			]
		>;
		/** Custom empty state snippet */
		empty?: Snippet;
		/** Custom mobile row card snippet */
		mobileRow?: Snippet<[{ row: T; columns: DataTableColumn<T>[]; rowIndex: number }]>;
		/** Default children snippet (not used directly) */
		children?: Snippet;

		/** Optional translate function */
		t?: TranslateFn;

		/** Force mobile/card layout regardless of breakpoint */
		small?: boolean;

		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root container */
		class?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts" generics="T extends Record<string, any> = Record<string, any>">
	import { twMerge } from "../../utils/tw-merge.js";
	import { Breakpoint } from "../../utils/breakpoint.svelte.js";
	import Spinner from "../Spinner/Spinner.svelte";
	import Button from "../Button/Button.svelte";
	import Thc, { isTHCNotEmpty, getTHCStringContent } from "../Thc/Thc.svelte";

	let {
		columns,
		data,
		getRowId = (_row: T, index: number) => index,
		paging,
		onPageChange,
		selectable = false,
		selected = $bindable(new Set()),
		selectOnRowClick = false,
		onRowClick,
		loading = false,
		cell,
		batchActions,
		empty,
		mobileRow,
		children,
		t = t_default,
		small = false,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props<T> = $props();

	// --- Responsive ---
	const bp = Breakpoint.instance;
	let isDesktop = $derived(small ? false : bp.md);

	// --- Paging ---
	let showPaging = $derived(paging != null && paging.pageCount > 1);

	// --- Selection ---
	let allRowIds = $derived(data.map((row, i) => getRowId(row, i)));

	let allOnPageSelected = $derived.by(() => {
		if (!selectable || allRowIds.length === 0) return false;
		return allRowIds.every((id) => selected.has(id));
	});

	let someOnPageSelected = $derived.by(() => {
		if (!selectable || allRowIds.length === 0) return false;
		return allRowIds.some((id) => selected.has(id)) && !allOnPageSelected;
	});

	let selectedRows = $derived.by(() => {
		if (!selectable || selected.size === 0) return [] as T[];
		return data.filter((row, i) => selected.has(getRowId(row, i)));
	});

	function toggleSelectAll() {
		if (allOnPageSelected) {
			const next = new Set(selected);
			for (const id of allRowIds) next.delete(id);
			selected = next;
		} else {
			const next = new Set(selected);
			for (const id of allRowIds) next.add(id);
			selected = next;
		}
	}

	function toggleSelectRow(id: string | number) {
		const next = new Set(selected);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selected = next;
	}

	function clearSelection() {
		selected = new Set();
	}

	// --- Row click ---
	function handleRowClick(row: T, index: number, e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (
			target.closest('input[type="checkbox"]') ||
			target.closest("button") ||
			target.closest("a")
		) {
			return;
		}
		if (selectable && selectOnRowClick) {
			toggleSelectRow(getRowId(row, index));
		}
		onRowClick?.(row, index);
	}

	// --- Cell value helpers ---
	function getCellValue(row: T, column: DataTableColumn<T>): any {
		return column.key.split(".").reduce((obj: any, k) => obj?.[k], row);
	}

	function getCellDisplay(row: T, column: DataTableColumn<T>): string {
		const value = getCellValue(row, column);
		if (column.renderValue) return column.renderValue(value, row);
		return value == null ? "" : String(value);
	}

	// --- CSS ---
	let rootClass = $derived(unstyled ? classProp : twMerge("stuic-data-table", classProp));

	let mobileColumns = $derived(columns.filter((col) => !col.hideOnMobile));
</script>

<!-- Batch action bar -->
{#if selectable && selected.size > 0 && batchActions}
	<div class={!unstyled ? "stuic-data-table-batch" : undefined}>
		{@render batchActions({ selected, selectedRows, clearSelection })}
	</div>
{/if}

<!-- Root container -->
<div bind:this={el} class={rootClass} {...rest}>
	{#if isDesktop}
		<!-- DESKTOP: TABLE -->
		<div
			class={!unstyled ? "stuic-data-table-wrapper" : undefined}
			data-loading={!unstyled && loading ? "true" : undefined}
		>
			<table>
				<thead>
					<tr>
						{#if selectable}
							<th data-checkbox class="stuic-checkbox">
								<input
									type="checkbox"
									checked={allOnPageSelected}
									indeterminate={someOnPageSelected}
									onchange={toggleSelectAll}
									aria-label={t("select_all_rows")}
								/>
							</th>
						{/if}
						{#each columns as col (col.key)}
							<th
								class={col.classHeader}
								data-align={!unstyled && col.align ? col.align : undefined}
								style={col.width ? `width: ${col.width}` : undefined}
							>
								{#if isTHCNotEmpty(col.label)}
									<Thc thc={col.label!} />
								{:else}
									{col.key}
								{/if}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data as row, rowIndex (getRowId(row, rowIndex))}
						{@const rowId = getRowId(row, rowIndex)}
						{@const isSelected = selectable && selected.has(rowId)}
						<tr
							data-hoverable={!unstyled ? "true" : undefined}
							data-clickable={!unstyled && (onRowClick || selectOnRowClick)
								? "true"
								: undefined}
							data-selected={!unstyled && isSelected ? "true" : undefined}
							onclick={(e) => handleRowClick(row, rowIndex, e)}
						>
							{#if selectable}
								<td data-checkbox class="stuic-checkbox">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => toggleSelectRow(rowId)}
										aria-label={t("select_row")}
									/>
								</td>
							{/if}
							{#each columns as col (col.key)}
								{@const value = getCellValue(row, col)}
								<td
									class={col.class}
									data-align={!unstyled && col.align ? col.align : undefined}
								>
									{#if cell}
										{@render cell({
											column: col,
											row,
											value,
											rowIndex,
										})}
									{:else}
										{getCellDisplay(row, col)}
									{/if}
								</td>
							{/each}
						</tr>
					{:else}
						<tr>
							<td
								colspan={columns.length + (selectable ? 1 : 0)}
								class={!unstyled ? "stuic-data-table-empty" : undefined}
							>
								{#if empty}
									{@render empty()}
								{:else}
									{t("no_data")}
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<!-- MOBILE: CARDS -->
		<div
			class={!unstyled ? "stuic-data-table-cards" : undefined}
			data-loading={!unstyled && loading ? "true" : undefined}
		>
			{#each data as row, rowIndex (getRowId(row, rowIndex))}
				{@const rowId = getRowId(row, rowIndex)}
				{@const isSelected = selectable && selected.has(rowId)}
				{#if mobileRow}
					{@render mobileRow({
						row,
						columns: mobileColumns,
						rowIndex,
					})}
				{:else}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class={!unstyled ? "stuic-data-table-card" : undefined}
						data-clickable={!unstyled && (onRowClick || selectOnRowClick)
							? "true"
							: undefined}
						data-selected={!unstyled && isSelected ? "true" : undefined}
						role={onRowClick || selectOnRowClick ? "button" : undefined}
						tabindex={onRowClick || selectOnRowClick ? 0 : undefined}
						onclick={(e) => handleRowClick(row, rowIndex, e)}
						onkeydown={(e) => {
							if (
								(onRowClick || selectOnRowClick) &&
								(e.key === "Enter" || e.key === " ")
							) {
								e.preventDefault();
								if (selectable && selectOnRowClick) {
									toggleSelectRow(rowId);
								}
								onRowClick?.(row, rowIndex);
							}
						}}
					>
						{#if selectable}
							<div class="stuic-checkbox flex items-center gap-2 mb-1">
								<input
									type="checkbox"
									checked={isSelected}
									onchange={() => toggleSelectRow(rowId)}
									aria-label={t("select_row")}
								/>
							</div>
						{/if}
						{#each mobileColumns as col (col.key)}
							{@const value = getCellValue(row, col)}
							<div class={!unstyled ? "stuic-data-table-card-row" : undefined}>
								<span class={!unstyled ? "stuic-data-table-card-label" : undefined}>
									{#if isTHCNotEmpty(col.label)}
										{getTHCStringContent(col.label) || col.key}
									{:else}
										{col.key}
									{/if}
								</span>
								<span class={!unstyled ? "stuic-data-table-card-value" : undefined}>
									{#if cell}
										{@render cell({
											column: col,
											row,
											value,
											rowIndex,
										})}
									{:else}
										{getCellDisplay(row, col)}
									{/if}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class={!unstyled ? "stuic-data-table-empty" : undefined}>
					{#if empty}
						{@render empty()}
					{:else}
						No data
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Loading spinner overlay -->
	{#if loading}
		<div class={!unstyled ? "stuic-data-table-loading" : undefined}>
			<Spinner />
		</div>
	{/if}

	<!-- Paging -->
	{#if showPaging && paging}
		<div class={!unstyled ? "stuic-data-table-paging" : undefined}>
			<Button
				variant="ghost"
				size="sm"
				disabled={!paging.hasPrevious}
				onclick={() => onPageChange?.(paging!.previousOffset)}
				aria-label={t("previous_page")}
			>
				&lsaquo; {t("previous_page")}
			</Button>
			<span class={!unstyled ? "stuic-data-table-paging-info" : undefined}>
				{t("page_x_of_y", { page: paging.currentPage, pageCount: paging.pageCount })}
			</span>
			<Button
				variant="ghost"
				size="sm"
				disabled={!paging.hasNext}
				onclick={() => onPageChange?.(paging!.nextOffset)}
				aria-label={t("next_page")}
			>
				{t("next_page")} &rsaquo;
			</Button>
		</div>
	{/if}
</div>
