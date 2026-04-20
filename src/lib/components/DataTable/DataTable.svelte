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
			select_all_rows: "Select all rows on this page",
			select_row: "Select row",
			select_all_on_page_x: "All {count} on this page selected.",
			select_all_results: "Select all {totalCount} results",
			all_results_selected: "All {totalCount} results selected.",
			clear_selection: "Clear selection",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values)
			? replaceMap(out, values as any, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
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
		/** Return true to disable selection for a specific row */
		selectDisabledBy?: (row: T, index: number) => boolean;

		/**
		 * Allow the user to opt into "select all results across all pages" mode.
		 * When enabled and `paging.total > data.length`, a banner offers to expand
		 * selection beyond the current page. Consumers must execute batch operations
		 * as server-side filter queries (not by iterating row IDs) since off-page rows
		 * are not available locally.
		 */
		allowSelectAllPages?: boolean;
		/**
		 * All-pages selection mode (bindable). When true, selection semantics invert:
		 * `excluded` holds deselected IDs, and every row not in `excluded` is selected.
		 * Newly inserted rows are implicitly selected in this mode.
		 */
		selectedAll?: boolean;
		/** Set of row IDs explicitly deselected while in all-pages mode (bindable) */
		excluded?: Set<string | number>;

		/** Callback when a row is clicked */
		onRowClick?: (row: T, index: number) => void;

		/** Show loading state (spinner overlay + reduced opacity) */
		loading?: boolean;

		/** Custom cell renderer snippet (rendered in both desktop table and mobile card layouts; use `variant` to tell them apart) */
		cell?: Snippet<
			[
				{
					column: DataTableColumn<T>;
					row: T;
					value: any;
					rowIndex: number;
					variant: "desktop" | "mobile";
				},
			]
		>;
		/** Custom desktop row renderer — replaces the entire `<tr>` */
		row?: Snippet<
			[
				{
					row: T;
					columns: DataTableColumn<T>[];
					rowIndex: number;
					isSelected: boolean;
				},
			]
		>;
		/**
		 * Batch actions bar snippet (shown when items are selected).
		 *
		 * Note: in all-pages mode (`selectedAll === true`) `selectedRows` only contains
		 * rows from the current page that aren't excluded. Off-page rows are not
		 * materialized — execute batch operations server-side using the active filter
		 * minus `excluded`.
		 */
		batchActions?: Snippet<
			[
				{
					selected: Set<string | number>;
					selectedRows: T[];
					selectedAll: boolean;
					excluded: Set<string | number>;
					/** `selected.size` in normal mode, or `totalItems - excluded.size` in all-pages mode */
					effectiveCount: number;
					totalCount: number | null;
					clearSelection: () => void;
				},
			]
		>;
		/**
		 * Custom "select all results across pages" banner. When omitted, a default
		 * banner is rendered.
		 */
		selectAllBanner?: Snippet<
			[
				{
					selectedAll: boolean;
					effectiveCount: number;
					totalCount: number;
					pageCount: number;
					selectAll: () => void;
					clearSelection: () => void;
				},
			]
		>;
		/** Custom empty state snippet */
		empty?: Snippet;
		/** Custom mobile row card snippet */
		mobileRow?: Snippet<[{ row: T; columns: DataTableColumn<T>[]; rowIndex: number }]>;

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
		selectDisabledBy,
		allowSelectAllPages = false,
		selectedAll = $bindable(false),
		excluded = $bindable(new Set()),
		onRowClick,
		loading = false,
		cell,
		row,
		batchActions,
		selectAllBanner,
		empty,
		mobileRow,
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
	let selectableRowIds = $derived.by(() => {
		if (!selectDisabledBy) return allRowIds;
		return data
			.map((row, i) => (selectDisabledBy(row, i) ? null : getRowId(row, i)))
			.filter((id): id is string | number => id !== null);
	});

	function isRowSelected(id: string | number): boolean {
		return selectedAll ? !excluded.has(id) : selected.has(id);
	}

	// Batch variant avoids creating one Set per row for shift-range / select-all.
	function setRowsSelected(ids: Array<string | number>, on: boolean) {
		if (selectedAll) {
			const next = new Set(excluded);
			for (const id of ids) {
				if (on) next.delete(id);
				else next.add(id);
			}
			excluded = next;
		} else {
			const next = new Set(selected);
			for (const id of ids) {
				if (on) next.add(id);
				else next.delete(id);
			}
			selected = next;
		}
	}

	let allOnPageSelected = $derived.by(() => {
		if (!selectable || selectableRowIds.length === 0) return false;
		return selectableRowIds.every((id) => isRowSelected(id));
	});

	let someOnPageSelected = $derived.by(() => {
		if (!selectable || selectableRowIds.length === 0) return false;
		return selectableRowIds.some((id) => isRowSelected(id)) && !allOnPageSelected;
	});

	let totalCount = $derived(paging?.total ?? null);
	let effectiveCount = $derived.by(() => {
		if (selectedAll) {
			const base = totalCount ?? data.length;
			return Math.max(0, base - excluded.size);
		}
		return selected.size;
	});

	let selectedRows = $derived.by(() => {
		if (!selectable) return [] as T[];
		if (selectedAll) {
			return data.filter((row, i) => !excluded.has(getRowId(row, i)));
		}
		if (selected.size === 0) return [] as T[];
		return data.filter((row, i) => selected.has(getRowId(row, i)));
	});

	function toggleSelectAll() {
		// In all-mode the header checkbox exits the mode entirely.
		if (selectedAll) {
			clearAllSelection();
			return;
		}
		setRowsSelected(selectableRowIds, !allOnPageSelected);
	}

	function toggleSelectRow(id: string | number) {
		setRowsSelected([id], !isRowSelected(id));
	}

	function enterSelectAll() {
		selected = new Set();
		excluded = new Set();
		selectedAll = true;
	}

	function clearAllSelection() {
		selectedAll = false;
		excluded = new Set();
		selected = new Set();
		lastClickedIndex = null;
	}

	// Anchor for shift+click range selection; reset when data reference changes.
	let lastClickedIndex: number | null = null;
	$effect(() => {
		data;
		lastClickedIndex = null;
	});

	function handleCheckboxClick(rowIndex: number, e: MouseEvent) {
		const newChecked = (e.currentTarget as HTMLInputElement).checked;
		if (e.shiftKey && lastClickedIndex !== null && lastClickedIndex !== rowIndex) {
			const start = Math.min(lastClickedIndex, rowIndex);
			const end = Math.max(lastClickedIndex, rowIndex);
			const ids: Array<string | number> = [];
			for (let i = start; i <= end; i++) {
				if (selectDisabledBy?.(data[i], i)) continue;
				ids.push(getRowId(data[i], i));
			}
			setRowsSelected(ids, newChecked);
		} else {
			setRowsSelected([getRowId(data[rowIndex], rowIndex)], newChecked);
		}
		lastClickedIndex = rowIndex;
	}

	let showSelectAllBanner = $derived.by(() => {
		if (!allowSelectAllPages || !selectable || !paging) return false;
		if (paging.total <= data.length) return false;
		if (selectedAll) return true;
		return allOnPageSelected;
	});

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
{#if selectable && effectiveCount > 0 && batchActions}
	<div class={!unstyled ? "stuic-data-table-batch" : undefined}>
		{@render batchActions({
			selected,
			selectedRows,
			selectedAll,
			excluded,
			effectiveCount,
			totalCount,
			clearSelection: clearAllSelection,
		})}
	</div>
{/if}

<!-- Select-all-across-pages banner -->
{#if showSelectAllBanner && paging}
	{#if selectAllBanner}
		{@render selectAllBanner({
			selectedAll,
			effectiveCount,
			totalCount: paging.total,
			pageCount: data.length,
			selectAll: enterSelectAll,
			clearSelection: clearAllSelection,
		})}
	{:else}
		<div class={!unstyled ? "stuic-data-table-select-all-banner" : undefined}>
			{#if selectedAll}
				<span>{t("all_results_selected", { totalCount: paging.total })}</span>
				<Button variant="ghost" size="sm" onclick={clearAllSelection}>
					{t("clear_selection")}
				</Button>
			{:else}
				<span>{t("select_all_on_page_x", { count: data.length })}</span>
				<Button variant="ghost" size="sm" onclick={enterSelectAll}>
					{t("select_all_results", { totalCount: paging.total })}
				</Button>
			{/if}
		</div>
	{/if}
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
							<th scope="col" data-checkbox class="stuic-checkbox">
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
								scope="col"
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
					{#each data as rowData, rowIndex (getRowId(rowData, rowIndex))}
						{@const rowId = getRowId(rowData, rowIndex)}
						{@const isSelected = selectable && isRowSelected(rowId)}
						{@const selectDisabled = !!selectDisabledBy?.(rowData, rowIndex)}
						{#if row}
							{@render row({ row: rowData, columns, rowIndex, isSelected })}
						{:else}
							<tr
								data-hoverable={!unstyled ? "true" : undefined}
								data-clickable={!unstyled && (onRowClick || selectOnRowClick)
									? "true"
									: undefined}
								data-selected={!unstyled && isSelected ? "true" : undefined}
								onclick={(e) => handleRowClick(rowData, rowIndex, e)}
							>
								{#if selectable}
									<td data-checkbox class="stuic-checkbox">
										<input
											type="checkbox"
											checked={isSelected}
											disabled={selectDisabled}
											onclick={(e) => handleCheckboxClick(rowIndex, e)}
											aria-label={t("select_row")}
										/>
									</td>
								{/if}
								{#each columns as col (col.key)}
									{@const value = getCellValue(rowData, col)}
									<td
										class={col.class}
										data-align={!unstyled && col.align ? col.align : undefined}
									>
										{#if cell}
											{@render cell({
												column: col,
												row: rowData,
												value,
												rowIndex,
												variant: "desktop",
											})}
										{:else}
											{getCellDisplay(rowData, col)}
										{/if}
									</td>
								{/each}
							</tr>
						{/if}
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
			{#each data as rowData, rowIndex (getRowId(rowData, rowIndex))}
				{@const rowId = getRowId(rowData, rowIndex)}
				{@const isSelected = selectable && isRowSelected(rowId)}
				{@const selectDisabled = !!selectDisabledBy?.(rowData, rowIndex)}
				{#if mobileRow}
					{@render mobileRow({
						row: rowData,
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
						onclick={(e) => handleRowClick(rowData, rowIndex, e)}
						onkeydown={(e) => {
							if (
								(onRowClick || selectOnRowClick) &&
								(e.key === "Enter" || e.key === " ")
							) {
								e.preventDefault();
								if (selectable && selectOnRowClick) {
									toggleSelectRow(rowId);
								}
								onRowClick?.(rowData, rowIndex);
							}
						}}
					>
						{#if selectable}
							<div class={!unstyled ? "stuic-checkbox stuic-data-table-card-checkbox" : undefined}>
								<input
									type="checkbox"
									checked={isSelected}
									disabled={selectDisabled}
									onclick={(e) => handleCheckboxClick(rowIndex, e)}
									aria-label={t("select_row")}
								/>
							</div>
						{/if}
						{#each mobileColumns as col (col.key)}
							{@const value = getCellValue(rowData, col)}
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
											row: rowData,
											value,
											rowIndex,
											variant: "mobile",
										})}
									{:else}
										{getCellDisplay(rowData, col)}
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
						{t("no_data")}
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
