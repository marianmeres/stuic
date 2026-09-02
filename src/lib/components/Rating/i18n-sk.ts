import type { RatingMessages } from "./i18n.js";

/**
 * Slovak message catalog for `Rating`. Opt-in — English stays the built-in default,
 * and this module is only pulled into a bundle when it is actually imported (the
 * component itself never references it).
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
export const RATING_MESSAGES_SK: RatingMessages = {
	rating: "Hodnotenie",
	// "z {max}" governs the genitive plural, so the noun is right for any count
	value_of_max: "{value} z {max} hviezdičiek",
	required: "Prosím, vyberte hodnotenie",
};
