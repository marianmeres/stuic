import type { DataTableMessages } from "./i18n.js";

/**
 * Slovak message catalog for `DataTable`. Opt-in — English stays the built-in default,
 * and this module is only pulled into a bundle when it is actually imported (the
 * component itself never references it).
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
export const DATA_TABLE_MESSAGES_SK: DataTableMessages = {
	previous_page: "Späť",
	next_page: "Ďalej",
	page_x_of_y: "Strana {page} z {pageCount}",
	pagination: "Stránkovanie",
	no_data: "Žiadne údaje",
	select_all_rows: "Vybrať všetky riadky na tejto strane",
	select_row: "Vybrať riadok",
	select_all_on_page_x: "Vybrané všetky na tejto strane ({count}).",
	select_all_results: "Vybrať všetky výsledky ({totalCount})",
	all_results_selected: "Vybrané všetky výsledky ({totalCount}).",
	clear_selection: "Zrušiť výber",
	no_rows_selected: "Nič nie je vybrané",
	x_rows_selected: "Vybrané: {count}",
};
