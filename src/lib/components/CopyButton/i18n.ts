import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `CopyButton`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 */
export const COPY_BUTTON_MESSAGES_EN = {
	/** Idle: accessible name of the icon-only button, and the default `label` */
	copy: "Copy",
	/** After a successful copy: label, accessible name, and the live announcement */
	copied: "Copied",
	/** After a failed copy: label, accessible name, and the live announcement */
	copy_failed: "Copy failed",
};

/** Every message key `CopyButton` may look up. */
export type CopyButtonMessageKey = keyof typeof COPY_BUTTON_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type CopyButtonMessages = Record<CopyButtonMessageKey, string>;

/**
 * Builds the `t` prop of `CopyButton` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { CopyButton, createCopyButtonT, COPY_BUTTON_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createCopyButtonT(COPY_BUTTON_MESSAGES_SK);
 * </script>
 *
 * <CopyButton text={url} {t} />
 * ```
 */
export function createCopyButtonT(
	messages: Partial<CopyButtonMessages> | Record<string, string>,
	fallbackMessages:
		Partial<CopyButtonMessages> | Record<string, string> = COPY_BUTTON_MESSAGES_EN
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
export const t_default: TranslateFn = createCopyButtonT(COPY_BUTTON_MESSAGES_EN);
