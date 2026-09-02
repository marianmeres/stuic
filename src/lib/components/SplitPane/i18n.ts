import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `SplitPane`. Also the fallback of
 * every other bundled locale, so a locale missing a key still renders text.
 */
export const SPLIT_PANE_MESSAGES_EN = {
	/** Default accessible name of the separator (the drag handle) */
	resize: "Resize",
};

/** Every message key `SplitPane` may look up. */
export type SplitPaneMessageKey = keyof typeof SPLIT_PANE_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type SplitPaneMessages = Record<SplitPaneMessageKey, string>;

/**
 * Builds the `t` prop of `SplitPane` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a
 * catalog may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { SplitPane, createSplitPaneT, SPLIT_PANE_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createSplitPaneT(SPLIT_PANE_MESSAGES_SK);
 * </script>
 *
 * <SplitPane {t}>…</SplitPane>
 * ```
 */
export function createSplitPaneT(
	messages: Partial<SplitPaneMessages> | Record<string, string>,
	fallbackMessages:
		Partial<SplitPaneMessages> | Record<string, string> = SPLIT_PANE_MESSAGES_EN
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
export const t_default: TranslateFn = createSplitPaneT(SPLIT_PANE_MESSAGES_EN);
