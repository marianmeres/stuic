import type { PaginationMessages } from "./i18n.js";

/**
 * Slovak message catalog for `Pagination`. Opt-in — English stays the built-in default,
 * and this module is only pulled into a bundle when it is actually imported (the
 * component itself never references it).
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
export const PAGINATION_MESSAGES_SK: PaginationMessages = {
	previous_page: "Späť",
	next_page: "Ďalej",
	first_page: "Prvá strana",
	last_page: "Posledná strana",
	page_x_of_y: "Strana {page} z {pageCount}",
	go_to_page_x: "Prejsť na stranu {page}",
	pagination: "Stránkovanie",
};
