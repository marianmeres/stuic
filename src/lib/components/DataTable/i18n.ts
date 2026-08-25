import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `DataTable`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are single-brace (`{page}`, `{totalCount}`, ...).
 */
export const DATA_TABLE_MESSAGES_EN = {
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
	no_rows_selected: "No rows selected",
	x_rows_selected: "{count} selected",
};

/** Every message key `DataTable` may look up. */
export type DataTableMessageKey = keyof typeof DATA_TABLE_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type DataTableMessages = Record<DataTableMessageKey, string>;

/**
 * Builds the `t` prop of `DataTable` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { DataTable, createDataTableT, DATA_TABLE_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createDataTableT(DATA_TABLE_MESSAGES_SK);
 * </script>
 *
 * <DataTable {columns} {data} {t} />
 * ```
 */
export function createDataTableT(
	messages: Partial<DataTableMessages> | Record<string, string>,
	fallbackMessages:
		Partial<DataTableMessages> | Record<string, string> = DATA_TABLE_MESSAGES_EN
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
export const t_default: TranslateFn = createDataTableT(DATA_TABLE_MESSAGES_EN);
