import type { BreadcrumbsMessages } from "./i18n.js";

/**
 * Slovak message catalog for `Breadcrumbs`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually
 * imported (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import { Breadcrumbs, createBreadcrumbsT, BREADCRUMBS_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createBreadcrumbsT(BREADCRUMBS_MESSAGES_SK);
 * </script>
 *
 * <Breadcrumbs {items} {t} />
 * ```
 */
export const BREADCRUMBS_MESSAGES_SK: BreadcrumbsMessages = {
	breadcrumbs: "Omrvinková navigácia",
	show_all: "Zobraziť celú cestu",
};
