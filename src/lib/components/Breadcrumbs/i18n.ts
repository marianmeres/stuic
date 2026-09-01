import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `Breadcrumbs`. Also the fallback of
 * every other bundled locale, so a locale missing a key still renders text.
 */
export const BREADCRUMBS_MESSAGES_EN = {
	// singular "Breadcrumb" is the WAI-ARIA APG recommended landmark label
	breadcrumbs: "Breadcrumb",
	show_all: "Show all breadcrumbs",
};

/** Every message key `Breadcrumbs` may look up. */
export type BreadcrumbsMessageKey = keyof typeof BREADCRUMBS_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type BreadcrumbsMessages = Record<BreadcrumbsMessageKey, string>;

/**
 * Builds the `t` prop of `Breadcrumbs` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a
 * catalog may safely be partial and never renders a raw key.
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
export function createBreadcrumbsT(
	messages: Partial<BreadcrumbsMessages> | Record<string, string>,
	fallbackMessages:
		Partial<BreadcrumbsMessages> | Record<string, string> = BREADCRUMBS_MESSAGES_EN
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
export const t_default: TranslateFn = createBreadcrumbsT(BREADCRUMBS_MESSAGES_EN);
