/** One rendered slot of the "numbers" variant: a page number or an ellipsis gap. */
export type PaginationRangeItem = number | "ellipsis";

export interface PaginationRangeOptions {
	/** How many pages to always show around the current page (default 1). */
	siblingCount?: number;
	/** How many pages to always show at the start and at the end (default 1). */
	boundaryCount?: number;
}

/**
 * Computes the windowed page list of the "numbers" variant: boundary pages at both
 * ends, siblings around the current page, and `"ellipsis"` tokens for the collapsed
 * gaps. The window is stable — for a given `pageCount` and options, every
 * `currentPage` yields the same number of slots (no layout jumping while paging).
 *
 * @example
 * ```ts
 * paginationRange(5, 10); // [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 * paginationRange(1, 5);  // [1, 2, 3, 4, 5]
 * ```
 */
export function paginationRange(
	currentPage: number,
	pageCount: number,
	options: PaginationRangeOptions = {}
): PaginationRangeItem[] {
	const siblingCount = Math.max(0, Math.floor(options.siblingCount ?? 1));
	const boundaryCount = Math.max(0, Math.floor(options.boundaryCount ?? 1));

	if (!Number.isFinite(pageCount) || pageCount <= 0) return [];
	const page = Math.min(Math.max(1, Math.floor(currentPage) || 1), pageCount);

	const range = (start: number, end: number) =>
		Array.from({ length: end - start + 1 }, (_, i) => start + i);

	const startPages = range(1, Math.min(boundaryCount, pageCount));
	const endPages = range(
		Math.max(pageCount - boundaryCount + 1, boundaryCount + 1),
		pageCount
	);

	const siblingsStart = Math.max(
		Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
		boundaryCount + 2
	);
	const siblingsEnd = Math.min(
		Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
		endPages.length > 0 ? endPages[0] - 2 : pageCount - 1
	);

	return [
		...startPages,

		// start gap: ellipsis, the single page it would hide, or nothing
		...(siblingsStart > boundaryCount + 2
			? (["ellipsis"] as PaginationRangeItem[])
			: boundaryCount + 1 < pageCount - boundaryCount
				? [boundaryCount + 1]
				: []),

		...range(siblingsStart, siblingsEnd),

		// end gap: ellipsis, the single page it would hide, or nothing
		...(siblingsEnd < pageCount - boundaryCount - 1
			? (["ellipsis"] as PaginationRangeItem[])
			: pageCount - boundaryCount > boundaryCount
				? [pageCount - boundaryCount]
				: []),

		...endPages,
	];
}
