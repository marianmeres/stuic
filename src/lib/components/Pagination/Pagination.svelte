<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { PagingCalcResult } from "@marianmeres/paging-store";
	import type { TranslateFn } from "../../types.js";
	import type { ButtonSize } from "../Button/Button.svelte";

	export type PaginationVariant = "compact" | "numbers";

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/**
		 * Paging calculation result from `@marianmeres/paging-store` — the exact shape
		 * `DataTable` consumes, so both can be fed from the same store or `calculatePaging`
		 * call. Takes precedence over the `total`/`limit`/`offset` convenience props.
		 */
		paging?: PagingCalcResult;
		/** Convenience alternative to `paging`: total number of items in the dataset. */
		total?: number;
		/** Convenience alternative to `paging`: items per page (default 10). */
		limit?: number;
		/** Convenience alternative to `paging`: current offset (default 0). */
		offset?: number;
		/**
		 * Callback when the user navigates to a different page. First argument is the new
		 * offset (`DataTable`'s `onPageChange` signature), second is the 1-based target page.
		 */
		onPageChange?: (offset: number, page: number) => void;
		/**
		 * `"compact"` (default): prev / "Page X of Y" / next — the `DataTable` pager.
		 * `"numbers"`: windowed page-number buttons with ellipsis gaps.
		 */
		variant?: PaginationVariant;
		/** Numbers variant: pages always shown around the current page (default 1). */
		siblingCount?: number;
		/** Numbers variant: pages always shown at the start and at the end (default 1). */
		boundaryCount?: number;
		/** Render first/last jump buttons (default false). */
		showFirstLast?: boolean;
		/**
		 * Render the "Page X of Y" info. Defaults per variant: `true` for compact (between
		 * prev/next), `false` for numbers (after the buttons when enabled).
		 */
		showInfo?: boolean;
		/**
		 * Render nothing when there is at most one page (default true — the `DataTable`
		 * rule: one page of results needs no pager). Set `false` to keep it visible.
		 */
		hideSinglePage?: boolean;
		/** Disable all controls (e.g. while a page of data is loading). */
		disabled?: boolean;
		/** Size preset passed to the inner Buttons (default "sm", as in `DataTable`). */
		size?: ButtonSize;
		/** i18n translate function (see `createPaginationT`). */
		t?: TranslateFn;
		/** Override the "Page X of Y" info content. */
		renderInfo?: Snippet<[PagingCalcResult]>;
		/** Skip all default styling (inner Buttons keep their own Button styling) */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for every inner button */
		classButton?: string;
		/** Extra class for the current-page button (numbers variant) */
		classButtonCurrent?: string;
		/** Class for the "Page X of Y" info */
		classInfo?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { calculatePaging } from "@marianmeres/paging-store";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import { t_default } from "./i18n.js";
	import { paginationRange } from "./pagination-range.js";

	let {
		paging,
		total,
		limit,
		offset,
		onPageChange,
		variant = "compact",
		siblingCount = 1,
		boundaryCount = 1,
		showFirstLast = false,
		showInfo,
		hideSinglePage = true,
		disabled = false,
		size = "sm",
		t = t_default,
		renderInfo,
		unstyled = false,
		class: classProp,
		classButton: classButtonProp,
		classButtonCurrent: classButtonCurrentProp,
		classInfo: classInfoProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _paging: PagingCalcResult | undefined = $derived(
		paging ??
			(total != null || limit != null || offset != null
				? calculatePaging({ total, limit, offset })
				: undefined)
	);

	let _render = $derived(!!_paging && (_paging.pageCount > 1 || !hideSinglePage));
	let _showInfo = $derived(showInfo ?? variant === "compact");

	let _pages = $derived(
		variant === "numbers" && _paging
			? paginationRange(_paging.currentPage, _paging.pageCount, {
					siblingCount,
					boundaryCount,
				})
			: []
	);

	let _class = $derived(unstyled ? classProp : twMerge("stuic-pagination", classProp));
	let _classButton = $derived(
		unstyled ? classButtonProp : twMerge("stuic-pagination-button", classButtonProp)
	);
	let _classInfo = $derived(
		unstyled ? classInfoProp : twMerge("stuic-pagination-info", classInfoProp)
	);

	function goToPage(page: number) {
		if (!_paging || disabled) return;
		if (page < 1 || page > _paging.pageCount || page === _paging.currentPage) return;
		onPageChange?.((page - 1) * _paging.limit, page);
	}
</script>

{#if _paging && _render}
	<nav
		bind:this={el}
		class={_class}
		data-variant={!unstyled ? variant : undefined}
		aria-label={t("pagination", null, "Pagination")}
		{...rest}
	>
		{#if showFirstLast}
			<Button
				variant="ghost"
				{size}
				class={_classButton}
				disabled={disabled || !_paging.hasPrevious}
				onclick={() => goToPage(1)}
				aria-label={t("first_page")}
			>
				&laquo;
			</Button>
		{/if}

		<Button
			variant="ghost"
			{size}
			class={_classButton}
			disabled={disabled || !_paging.hasPrevious}
			onclick={() => goToPage(_paging!.currentPage - 1)}
			aria-label={t("previous_page")}
		>
			{#if variant === "compact"}
				&lsaquo; {t("previous_page")}
			{:else}
				&lsaquo;
			{/if}
		</Button>

		{#if variant === "numbers"}
			{#each _pages as item, i (item === "ellipsis" ? `ellipsis-${i}` : item)}
				{#if item === "ellipsis"}
					<span
						class={!unstyled ? "stuic-pagination-ellipsis" : undefined}
						aria-hidden="true"
					>
						&hellip;
					</span>
				{:else}
					{@const isCurrent = item === _paging.currentPage}
					<Button
						variant={isCurrent ? "solid" : "ghost"}
						intent={isCurrent ? "primary" : undefined}
						{size}
						class={isCurrent
							? twMerge(_classButton, classButtonCurrentProp)
							: _classButton}
						{disabled}
						aria-label={t("go_to_page_x", { page: item })}
						aria-current={isCurrent ? "page" : undefined}
						data-current={isCurrent ? "true" : undefined}
						onclick={() => goToPage(item)}
					>
						{item}
					</Button>
				{/if}
			{/each}
		{:else if _showInfo}
			<span class={_classInfo}>
				{#if renderInfo}
					{@render renderInfo(_paging)}
				{:else}
					{t("page_x_of_y", { page: _paging.currentPage, pageCount: _paging.pageCount })}
				{/if}
			</span>
		{/if}

		<Button
			variant="ghost"
			{size}
			class={_classButton}
			disabled={disabled || !_paging.hasNext}
			onclick={() => goToPage(_paging!.currentPage + 1)}
			aria-label={t("next_page")}
		>
			{#if variant === "compact"}
				{t("next_page")} &rsaquo;
			{:else}
				&rsaquo;
			{/if}
		</Button>

		{#if showFirstLast}
			<Button
				variant="ghost"
				{size}
				class={_classButton}
				disabled={disabled || !_paging.hasNext}
				onclick={() => goToPage(_paging!.pageCount)}
				aria-label={t("last_page")}
			>
				&raquo;
			</Button>
		{/if}

		{#if variant === "numbers" && _showInfo}
			<span class={_classInfo}>
				{#if renderInfo}
					{@render renderInfo(_paging)}
				{:else}
					{t("page_x_of_y", { page: _paging.currentPage, pageCount: _paging.pageCount })}
				{/if}
			</span>
		{/if}
	</nav>
{/if}
