import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";
import { FIELD_TABLE_MESSAGES_EN } from "./field-table-i18n.js";

/**
 * The built-in (English) message catalog of `FieldStruct`. Also the fallback of every
 * other bundled locale, so a locale missing a key still renders text.
 *
 * The per-type cell rules (`err_number`, `err_url`, ...) are the same rules `FieldTable`
 * runs, so their wording is taken from its catalog rather than restated.
 *
 * Placeholders are mustache-style (`{{field}}`, `{{message}}`, `{{max}}`, ...).
 */
export const FIELD_STRUCT_MESSAGES_EN = {
	field_req_att: FIELD_TABLE_MESSAGES_EN.field_req_att,
	/** The component-level `required`: every field is blank. */
	err_struct_required: "At least one field is required",
	/** The field-level message (the summary under the whole control). */
	err_field: "{{field}}: {{message}}",
	/** The field-level message for a blank `required` field. */
	err_field_required: "{{field}} is required",
	/** The inline message under a blank `required` field. */
	err_required: "This field is required",
	err_number: FIELD_TABLE_MESSAGES_EN.err_number,
	err_url: FIELD_TABLE_MESSAGES_EN.err_url,
	err_date: FIELD_TABLE_MESSAGES_EN.err_date,
	err_select_unknown: FIELD_TABLE_MESSAGES_EN.err_select_unknown,
	err_maxlength: FIELD_TABLE_MESSAGES_EN.err_maxlength,
	err_country: FIELD_TABLE_MESSAGES_EN.err_country,
	country_search_placeholder: FIELD_TABLE_MESSAGES_EN.country_search_placeholder,
	country_no_results: FIELD_TABLE_MESSAGES_EN.country_no_results,
	/** Read-only rendering of a `checkbox` field. */
	yes: "Yes",
	no: "No",
};

/** Every message key `FieldStruct` may look up. */
export type FieldStructMessageKey = keyof typeof FIELD_STRUCT_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type FieldStructMessages = Record<FieldStructMessageKey, string>;

/**
 * Builds the `t` prop of `FieldStruct` from a message catalog. Unknown or untranslated
 * keys fall back to `fallbackMessages` (English by default), so a catalog may safely be
 * partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldStruct,
 *     createFieldStructT,
 *     FIELD_STRUCT_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *
 *   // full locale, plus a field specific tweak
 *   const t = createFieldStructT({
 *     ...FIELD_STRUCT_MESSAGES_SK,
 *     err_struct_required: "Zadajte adresu",
 *   });
 * </script>
 *
 * <FieldStruct name="address" bind:value {fields} {t} />
 * ```
 */
export function createFieldStructT(
	messages: Partial<FieldStructMessages> | Record<string, string>,
	fallbackMessages:
		Partial<FieldStructMessages> | Record<string, string> = FIELD_STRUCT_MESSAGES_EN
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
export const t_default: TranslateFn = createFieldStructT(FIELD_STRUCT_MESSAGES_EN);
