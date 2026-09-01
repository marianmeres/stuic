import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `Pagination`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * The `previous_page`, `next_page` and `page_x_of_y` keys are intentionally identical
 * to `DataTable`'s, so one merged catalog (and one `t`) can serve both components.
 *
 * Placeholders are single-brace (`{page}`, `{pageCount}`, ...).
 */
export const PAGINATION_MESSAGES_EN = {
	previous_page: "Prev",
	next_page: "Next",
	first_page: "First page",
	last_page: "Last page",
	page_x_of_y: "Page {page} of {pageCount}",
	go_to_page_x: "Go to page {page}",
	pagination: "Pagination",
};

/** Every message key `Pagination` may look up. */
export type PaginationMessageKey = keyof typeof PAGINATION_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type PaginationMessages = Record<PaginationMessageKey, string>;

/**
 * Builds the `t` prop of `Pagination` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { Pagination, createPaginationT, PAGINATION_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createPaginationT(PAGINATION_MESSAGES_SK);
 * </script>
 *
 * <Pagination {paging} {onPageChange} {t} />
 * ```
 */
export function createPaginationT(
	messages: Partial<PaginationMessages> | Record<string, string>,
	fallbackMessages:
		Partial<PaginationMessages> | Record<string, string> = PAGINATION_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>, {
					preSearchKeyTransform: (k) => `{${k}}`,
				})
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createPaginationT(PAGINATION_MESSAGES_EN);
