import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `FieldTable`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * Placeholders are mustache-style (`{{row}}`, `{{max}}`, ...).
 */
export const FIELD_TABLE_MESSAGES_EN = {
	field_req_att: "This field requires attention. Please review and try again.",
	add_row: "Add row",
	empty_message: "No rows yet",
	row_label: "Row {{row}}",
	actions_label: "Actions",
	move_row_up: "Move row {{row}} up",
	move_row_down: "Move row {{row}} down",
	remove_row: "Remove row {{row}}",
	added_row: "Row {{row}} added",
	removed_row: "Row {{row}} removed",
	moved_row: "Row moved to position {{position}} of {{total}}",
	unknown_row_warning:
		"This row is not a record this editor can show. It is kept unchanged.",
	err_rows_required: "At least one row is required",
	err_max_rows: "Maximum number of rows is {{max}}",
	err_cell: "Row {{row}}, {{column}}: {{message}}",
	err_number: "not a number",
	err_url: "must be a web address starting with http:// or https://",
	err_date: "not a valid date",
	err_select_unknown: "“{{value}}” is not one of the choices",
	err_maxlength: "too long (max {{max}} characters)",
};

/** Every message key `FieldTable` may look up. */
export type FieldTableMessageKey = keyof typeof FIELD_TABLE_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type FieldTableMessages = Record<FieldTableMessageKey, string>;

/**
 * Builds the `t` prop of `FieldTable` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldTable,
 *     createFieldTableT,
 *     FIELD_TABLE_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *
 *   // full locale, plus a field specific tweak
 *   const t = createFieldTableT({
 *     ...FIELD_TABLE_MESSAGES_SK,
 *     add_row: "Pridať položku",
 *   });
 * </script>
 *
 * <FieldTable name="items" bind:value {columns} {t} />
 * ```
 */
export function createFieldTableT(
	messages: Partial<FieldTableMessages> | Record<string, string>,
	fallbackMessages:
		Partial<FieldTableMessages> | Record<string, string> = FIELD_TABLE_MESSAGES_EN
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
export const t_default: TranslateFn = createFieldTableT(FIELD_TABLE_MESSAGES_EN);
