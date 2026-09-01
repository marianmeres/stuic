import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `ContextMenu`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 */
export const CONTEXT_MENU_MESSAGES_EN = {
	context_menu: "Context menu",
};

/** Every message key `ContextMenu` may look up. */
export type ContextMenuMessageKey = keyof typeof CONTEXT_MENU_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type ContextMenuMessages = Record<ContextMenuMessageKey, string>;

/**
 * Builds the `t` prop of `ContextMenu` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { ContextMenu, createContextMenuT, CONTEXT_MENU_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createContextMenuT(CONTEXT_MENU_MESSAGES_SK);
 * </script>
 *
 * <ContextMenu {items} {t}>...</ContextMenu>
 * ```
 */
export function createContextMenuT(
	messages: Partial<ContextMenuMessages> | Record<string, string>,
	fallbackMessages:
		Partial<ContextMenuMessages> | Record<string, string> = CONTEXT_MENU_MESSAGES_EN
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
export const t_default: TranslateFn = createContextMenuT(CONTEXT_MENU_MESSAGES_EN);
