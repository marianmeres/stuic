import type { RangeSliderMessages } from "./i18n.js";

/**
 * Slovak message catalog for `RangeSlider`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually
 * imported (the component itself never references it).
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
export const RANGE_SLIDER_MESSAGES_SK: RangeSliderMessages = {
	minimum: "Minimálna hodnota",
	maximum: "Maximálna hodnota",
};
