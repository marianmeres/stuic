import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `Rating`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are single-brace (`{value}`, `{max}`).
 */
export const RATING_MESSAGES_EN = {
	rating: "Rating",
	value_of_max: "{value} of {max} stars",
	required: "Please select a rating",
};

/** Every message key `Rating` may look up. */
export type RatingMessageKey = keyof typeof RATING_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type RatingMessages = Record<RatingMessageKey, string>;

/**
 * Builds the `t` prop of `Rating` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { Rating, createRatingT, RATING_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createRatingT(RATING_MESSAGES_SK);
 * </script>
 *
 * <Rating bind:value {t} />
 * ```
 */
export function createRatingT(
	messages: Partial<RatingMessages> | Record<string, string>,
	fallbackMessages: Partial<RatingMessages> | Record<string, string> = RATING_MESSAGES_EN
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
export const t_default: TranslateFn = createRatingT(RATING_MESSAGES_EN);
