import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `RangeSlider`. Also the fallback of
 * every other bundled locale, so a locale missing a key still renders text.
 */
export const RANGE_SLIDER_MESSAGES_EN = {
	/** Default accessible name of the start (lower) thumb */
	minimum: "Minimum",
	/** Default accessible name of the end (upper) thumb */
	maximum: "Maximum",
};

/** Every message key `RangeSlider` may look up. */
export type RangeSliderMessageKey = keyof typeof RANGE_SLIDER_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type RangeSliderMessages = Record<RangeSliderMessageKey, string>;

/**
 * Builds the `t` prop of `RangeSlider` from a message catalog. Unknown or
 * untranslated keys fall back to `fallbackMessages` (English by default), so a
 * catalog may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { RangeSlider, createRangeSliderT, RANGE_SLIDER_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createRangeSliderT(RANGE_SLIDER_MESSAGES_SK);
 * </script>
 *
 * <RangeSlider bind:start bind:end {t} />
 * ```
 */
export function createRangeSliderT(
	messages: Partial<RangeSliderMessages> | Record<string, string>,
	fallbackMessages:
		Partial<RangeSliderMessages> | Record<string, string> = RANGE_SLIDER_MESSAGES_EN
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
export const t_default: TranslateFn = createRangeSliderT(RANGE_SLIDER_MESSAGES_EN);
