import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `FieldOptions`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are mustache-style (`{{value}}`).
 */
export const FIELD_OPTIONS_MESSAGES_EN = {
	field_req_att: "This field requires attention. Please review and try again.",
	cardinality_of: "of max",
	cardinality_selected: "selected",
	submit: "Submit",
	select_all: "Select all",
	clear_all: "Clear selected",
	clear: "Clear",
	search_placeholder: "Type to search...",
	search_submit_placeholder: "Type to search and submit...",
	cardinality_full: "Max selection reached",
	select_from_list: "Please select from the list only",
	x_close: "Clear input or close [esc]",
	close: "Close [esc]",
	unknown_allowed: "Select or type and submit",
	unknown_not_allowed: "Select from the list",
	no_results: "No results found.",
	add_new: 'Add "{{value}}"...',
	click_add_new: "You must add the value to continue",
	// chips display mode
	chips_placeholder: "Nothing selected",
	chips_open: "Choose...",
	chips_remove: "Remove {{value}}",
	//
	pick_tab: "Pick",
	arrange_tab: "Arrange ({{value}})",
	arrange_help: "Reorder the selected items. Use the buttons to move them.",
	sort_az: "Sort A–Z",
	reverse: "Reverse",
	shuffle: "Shuffle",
	move_up: "Move up",
	move_down: "Move down",
	move_to_top: "Move to top",
	move_to_bottom: "Move to bottom",
	remove_item: "Remove",
	moved_up: "Moved {{value}} up",
	moved_down: "Moved {{value}} down",
	removed_item: "Removed {{value}}",
	sorted_az: "Sorted A to Z",
	reversed: "Order reversed",
	shuffled: "Order shuffled",
};

/** Every message key `FieldOptions` may look up. */
export type FieldOptionsMessageKey = keyof typeof FIELD_OPTIONS_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type FieldOptionsMessages = Record<FieldOptionsMessageKey, string>;

/**
 * Builds the `t` prop of `FieldOptions` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * Handy with the `chips` display mode, where a few of the texts (`chips_placeholder`,
 * `chips_open`, `chips_remove`) end up in the closed field, on the page, next to your own
 * copy — reworded per field, without restating the whole catalog.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldOptions,
 *     createFieldOptionsT,
 *     FIELD_OPTIONS_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *
 *   // full locale, plus a field specific tweak
 *   const t = createFieldOptionsT({
 *     ...FIELD_OPTIONS_MESSAGES_SK,
 *     chips_placeholder: "Bez štítkov",
 *   });
 * </script>
 *
 * <FieldOptions chips name="tags" bind:value {getOptions} {t} />
 * ```
 */
export function createFieldOptionsT(
	messages: Partial<FieldOptionsMessages> | Record<string, string>,
	fallbackMessages:
		Partial<FieldOptionsMessages> | Record<string, string> = FIELD_OPTIONS_MESSAGES_EN
): TranslateFn {
	return (k, values = null, fallback = "") => {
		const out =
			(messages as Record<string, string>)[k] ??
			(fallbackMessages as Record<string, string>)[k] ??
			(typeof fallback === "string" ? fallback : k);
		return isPlainObject(values)
			? replaceMap(out, values as Record<string, string>)
			: out;
	};
}

/** The component's built-in English `t`. */
export const t_default: TranslateFn = createFieldOptionsT(FIELD_OPTIONS_MESSAGES_EN);
