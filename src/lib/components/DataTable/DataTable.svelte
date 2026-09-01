<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { PagingCalcResult } from "@marianmeres/paging-store";
	import type { THC } from "../Thc/index.js";
	import type { TranslateFn } from "../../types.js";
	// i18n ready -- see ./i18n.ts (english, built-in) and ./i18n-sk.ts (opt-in slovak)
	import { DATA_TABLE_MESSAGES_EN, t_default } from "./i18n.js";

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
		/**
		 * Render the built-in pager. Set `false` to keep feeding `paging` -- which the
		 * select-all-across-pages banner, `effectiveCount` and `totalCount` need -- while
		 * paging the data from your own control elsewhere on the page.
		 *
		 * With the pager hidden `onPageChange` never fires (nothing else calls it), so the
		 * caller's own control is the single thing driving the offset -- don't wire both.
		 *
		 * Orthogonal to the existing "one page of results needs no pager" rule: a single-page
		 * `paging` renders no pager either way.
		 */
		showPager?: boolean;

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

		/**
		 * Keep the selection bar -- the strip above the table holding the idle status,
		 * `batchActions`, and the select-all-across-pages offer -- in the layout at all
		 * times, so checking the first row does not shove the table down. While nothing
		 * is selected it reads `t("no_rows_selected")`.
		 *
		 * Only meaningful when `selectable` is on AND there is something to reserve room
		 * for (a `batchActions` snippet or `allowSelectAllPages`); with neither, no bar
		 * is rendered at all.
		 *
		 * Set `false` for the pop-in behaviour: the bar appears only once it has content.
		 */
		reserveBatchBar?: boolean;

		/** Callback when a row is clicked */
		onRowClick?: (row: T, index: number) => void;

		/**
		 * Where this row's primary action navigates. When it returns a href for a row, the
		 * content of that row's "lead" cell is wrapped in an anchor -- which is what makes a
		 * clickable row keyboard-, middle- and modifier-click-reachable.
		 *
		 * Return `undefined` for a row with no destination (a placeholder, a row still
		 * minting its id) -- that row's lead cell renders exactly as it does today.
		 *
		 * Independent of `onRowClick`: supply both and the anchor handles the keyboard and
		 * modified clicks while `onRowClick` keeps handling a plain click anywhere else on
		 * the row -- the row click handler ignores events originating inside an anchor, so
		 * the two never double-fire. (Consequence: a plain click on the lead cell navigates
		 * via the href and does NOT call `onRowClick` -- point both at the same destination.)
		 */
		rowHref?: (row: T, index: number) => string | undefined;
		/**
		 * Which column is the "lead" cell for `rowHref`. Defaults to the first column in
		 * `columns`. On mobile, if that column is `hideOnMobile`, the first visible card
		 * field is used instead (so the card keeps a keyboard-reachable link).
		 */
		rowHrefColumn?: string;
		/** Additional CSS classes for the anchor generated by `rowHref`. */
		classRowLink?: string;

		/**
		 * Make the desktop `<tr>` itself focusable and Enter-activatable.
		 *
		 * For a row whose action is NOT a navigation -- prefer `rowHref` when it is, since a
		 * real link is better in every respect (tab order, `Enter`, middle/cmd-click, "copy
		 * link address", and an announcement of where it goes).
		 *
		 * Deliberately does NOT set `role="button"`: a `<tr>` carries an implicit `row` role
		 * that the table's own structure depends on, and overriding it detaches the row from
		 * the table for assistive technology. The row stays a row; it merely becomes focusable.
		 *
		 * Also deliberately `Enter`-only, unlike the mobile card (which IS a `role="button"`,
		 * where `Space` is expected). Taking `Space` -- page scroll -- away from a table is a
		 * worse trade than the one the card makes.
		 *
		 * No-op unless `onRowClick` or `selectOnRowClick` is set.
		 */
		rowActivatable?: boolean;
		/**
		 * Accessible name for an activatable row, e.g. `(row) => "Open " + row.name`.
		 * Only applied when the row is actually activatable.
		 */
		rowLabel?: (row: T, index: number) => string | undefined;

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
		 * Content of the selection bar while something is selected. Replaces the default
		 * "{count} selected" status, so render your own count alongside the buttons.
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
		 * Custom "select all results across pages" offer, rendered on the trailing edge
		 * of the selection bar. When omitted, a default one is rendered.
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
	import EmptyState from "../EmptyState/EmptyState.svelte";
	import Pagination from "../Pagination/Pagination.svelte";
	import Thc, { isTHCNotEmpty, getTHCStringContent } from "../Thc/Thc.svelte";

	let {
		columns,
		data,
		getRowId = (_row: T, index: number) => index,
		paging,
		onPageChange,
		showPager = true,
		selectable = false,
		selected = $bindable(new Set()),
		selectOnRowClick = false,
		selectDisabledBy,
		allowSelectAllPages = false,
		selectedAll = $bindable(false),
		excluded = $bindable(new Set()),
		reserveBatchBar = true,
		onRowClick,
		rowHref,
		rowHrefColumn,
		classRowLink,
		rowActivatable = false,
		rowLabel,
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
	// The prop only ADDs to the existing rule -- a single-page result still renders no
	// pager, regardless of `showPager`.
	let renderPager = $derived(showPager && paging != null && paging.pageCount > 1);

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

	// The default selection status, shown when there is no `batchActions` snippet to take
	// its place. Both keys post-date the component, so a consumer `t` written against an
	// older version does not know them -- and one that answers an unknown key with ""
	// would leave the reserved bar visibly blank. Hence the explicit english fallbacks
	// (pre-interpolated, since a `t` may hand a fallback straight back untouched), which
	// every other, older key can do without.
	let statusText = $derived(
		effectiveCount > 0
			? t(
					"x_rows_selected",
					{ count: effectiveCount },
					DATA_TABLE_MESSAGES_EN.x_rows_selected.replace("{count}", `${effectiveCount}`)
				)
			: t("no_rows_selected", null, DATA_TABLE_MESSAGES_EN.no_rows_selected)
	);

	// The bar only exists if something can appear in it; `reserveBatchBar` then decides
	// whether it holds its place while that something is absent.
	let hasBatchBar = $derived(selectable && (!!batchActions || allowSelectAllPages));
	let showBatchBar = $derived(
		hasBatchBar &&
			(reserveBatchBar || showSelectAllBanner || (effectiveCount > 0 && !!batchActions))
	);

	// --- Row click / activation ---

	// A row is a big target that legitimately contains its own controls. Anything that
	// originates inside one of those is that control's business, not the row's - this
	// guards the click handler AND both keydown handlers (Enter on a focused lead link
	// must navigate, not fire onRowClick; Space on a focused checkbox must toggle it).
	function isInteractiveTarget(e: Event): boolean {
		const target = e.target as HTMLElement | null;
		if (!target?.closest) return false;
		return !!(
			target.closest('input[type="checkbox"]') ||
			target.closest("button") ||
			target.closest("a")
		);
	}

	function activateRow(row: T, index: number) {
		if (selectable && selectOnRowClick) {
			toggleSelectRow(getRowId(row, index));
		}
		onRowClick?.(row, index);
	}

	function handleRowClick(row: T, index: number, e: MouseEvent) {
		if (isInteractiveTarget(e)) return;
		activateRow(row, index);
	}

	/**
	 * Shared by the desktop `<tr>` (Enter only) and the mobile card (Enter + Space, since
	 * the card actually is a `role="button"`).
	 */
	function handleRowKeydown(row: T, index: number, e: KeyboardEvent, withSpace: boolean) {
		if (!rowClickable) return;
		if (e.key !== "Enter" && !(withSpace && e.key === " ")) return;
		if (isInteractiveTarget(e)) return;
		e.preventDefault();
		activateRow(row, index);
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

	// --- Row link / activation derivations ---
	let rowClickable = $derived(!!(onRowClick || selectOnRowClick));
	let rowIsActivatable = $derived(rowActivatable && rowClickable);

	// The lead cell is the one whose content gets wrapped in the `rowHref` anchor.
	let leadColumnKey = $derived(rowHrefColumn ?? columns[0]?.key);
	// A `hideOnMobile` lead column would leave the card with no link at all, so there we
	// fall back to the first visible field rather than silently dropping the anchor.
	let mobileLeadColumnKey = $derived(
		mobileColumns.some((col) => col.key === leadColumnKey)
			? leadColumnKey
			: mobileColumns[0]?.key
	);

	let rowLinkClass = $derived(
		unstyled ? classRowLink : twMerge("stuic-data-table-row-link", classRowLink)
	);
</script>

<!--
	The rendered content of a single cell, shared by both layouts so that a `rowHref`
	anchor wraps exactly what the cell would have rendered anyway (a consumer `cell`
	snippet included).
-->
{#snippet cellBody(
	col: DataTableColumn<T>,
	rowData: T,
	value: any,
	rowIndex: number,
	variant: "desktop" | "mobile"
)}
	{#if cell}
		{@render cell({ column: col, row: rowData, value, rowIndex, variant })}
	{:else}
		{getCellDisplay(rowData, col)}
	{/if}
{/snippet}

<!--
	The empty state, shared by both layouts. The built-in one is an `EmptyState`; its
	typography is pulled back to table chrome (muted, cell-sized, no headline weight) by
	the `--stuic-empty-state-*` overrides in index.css, so it reads exactly as the bare
	`t("no_data")` string it replaces. An `empty` snippet still replaces it whole.
-->
{#snippet emptyBody()}
	{#if empty}
		{@render empty()}
	{:else}
		<EmptyState
			title={t("no_data")}
			size="sm"
			{unstyled}
			class={!unstyled ? "stuic-data-table-empty-state" : undefined}
		/>
	{/if}
{/snippet}

<!--
	Selection bar -- one strip carrying the selection status, the consumer's
	`batchActions`, and the select-all-across-pages offer. Deliberately a single element
	rather than a stack of independent conditionals: each of those appearing on its own
	reflows everything below it, which is exactly the jump `reserveBatchBar` exists to
	prevent. Sits outside the root container so the loading overlay doesn't cover it.
-->
{#if showBatchBar}
	<div
		class={!unstyled ? "stuic-data-table-batch" : undefined}
		data-idle={!unstyled && effectiveCount === 0 ? "true" : undefined}
		data-select-all={!unstyled && showSelectAllBanner ? "true" : undefined}
	>
		<div class={!unstyled ? "stuic-data-table-batch-main" : undefined}>
			{#if effectiveCount > 0 && batchActions}
				{@render batchActions({
					selected,
					selectedRows,
					selectedAll,
					excluded,
					effectiveCount,
					totalCount,
					clearSelection: clearAllSelection,
				})}
			{:else}
				<span class={!unstyled ? "stuic-data-table-batch-status" : undefined}>
					{statusText}
				</span>
			{/if}
		</div>

		{#if showSelectAllBanner && paging}
			<div class={!unstyled ? "stuic-data-table-batch-select-all" : undefined}>
				{#if selectAllBanner}
					{@render selectAllBanner({
						selectedAll,
						effectiveCount,
						totalCount: paging.total,
						pageCount: data.length,
						selectAll: enterSelectAll,
						clearSelection: clearAllSelection,
					})}
				{:else if selectedAll}
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
						{@const rowLink = rowHref?.(rowData, rowIndex)}
						{#if row}
							{@render row({ row: rowData, columns, rowIndex, isSelected })}
						{:else}
							<tr
								data-hoverable={!unstyled ? "true" : undefined}
								data-clickable={!unstyled && rowClickable ? "true" : undefined}
								data-selected={!unstyled && isSelected ? "true" : undefined}
								tabindex={rowIsActivatable ? 0 : undefined}
								aria-label={rowIsActivatable ? rowLabel?.(rowData, rowIndex) : undefined}
								onclick={(e) => handleRowClick(rowData, rowIndex, e)}
								onkeydown={(e) => {
									if (rowActivatable) handleRowKeydown(rowData, rowIndex, e, false);
								}}
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
									{@const href = col.key === leadColumnKey ? rowLink : undefined}
									<td
										class={col.class}
										data-align={!unstyled && col.align ? col.align : undefined}
									>
										{#if href}
											<a class={rowLinkClass} {href}>
												{@render cellBody(col, rowData, value, rowIndex, "desktop")}
											</a>
										{:else}
											{@render cellBody(col, rowData, value, rowIndex, "desktop")}
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
								{@render emptyBody()}
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
				{@const rowLink = rowHref?.(rowData, rowIndex)}
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
						data-clickable={!unstyled && rowClickable ? "true" : undefined}
						data-selected={!unstyled && isSelected ? "true" : undefined}
						role={rowClickable ? "button" : undefined}
						tabindex={rowClickable ? 0 : undefined}
						onclick={(e) => handleRowClick(rowData, rowIndex, e)}
						onkeydown={(e) => handleRowKeydown(rowData, rowIndex, e, true)}
					>
						{#if selectable}
							<div
								class={!unstyled
									? "stuic-checkbox stuic-data-table-card-checkbox"
									: undefined}
							>
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
							{@const href = col.key === mobileLeadColumnKey ? rowLink : undefined}
							<div class={!unstyled ? "stuic-data-table-card-row" : undefined}>
								<span class={!unstyled ? "stuic-data-table-card-label" : undefined}>
									{#if isTHCNotEmpty(col.label)}
										{getTHCStringContent(col.label) || col.key}
									{:else}
										{col.key}
									{/if}
								</span>
								<span class={!unstyled ? "stuic-data-table-card-value" : undefined}>
									{#if href}
										<a class={rowLinkClass} {href}>
											{@render cellBody(col, rowData, value, rowIndex, "mobile")}
										</a>
									{:else}
										{@render cellBody(col, rowData, value, rowIndex, "mobile")}
									{/if}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class={!unstyled ? "stuic-data-table-empty" : undefined}>
					{@render emptyBody()}
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

	<!--
		Paging -- the built-in pager IS a `Pagination` in its default "compact" variant,
		which is exactly the prev / "Page X of Y" / next control this used to inline.
		`.stuic-data-table-paging` moves onto its `<nav>` rather than wrapping it, so the
		region keeps its class (and its `--stuic-data-table-paging-*` tokens, re-pointed
		at Pagination's in index.css) without an extra node.

		Note `Pagination`'s own single-page rule is left at its default: `renderPager`
		already encodes it, plus `showPager`.
	-->
	{#if renderPager && paging}
		<Pagination
			{paging}
			{onPageChange}
			{t}
			{unstyled}
			class={!unstyled ? "stuic-data-table-paging" : undefined}
			classInfo={!unstyled ? "stuic-data-table-paging-info" : undefined}
		/>
	{/if}
</div>
