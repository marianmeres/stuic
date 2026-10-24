import type { FieldStructMessages } from "./field-struct-i18n.js";
import { FIELD_TABLE_MESSAGES_SK } from "./field-table-i18n-sk.js";

/**
 * Slovak message catalog for `FieldStruct`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldStruct,
 *     createFieldStructT,
 *     FIELD_STRUCT_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createFieldStructT(FIELD_STRUCT_MESSAGES_SK);
 * </script>
 *
 * <FieldStruct name="address" bind:value {fields} displayLanguage="sk" locale="sk" {t} />
 * ```
 */
export const FIELD_STRUCT_MESSAGES_SK: FieldStructMessages = {
	field_req_att: FIELD_TABLE_MESSAGES_SK.field_req_att,
	err_struct_required: "Vyplňte aspoň jedno pole",
	err_field: "{{field}}: {{message}}",
	err_field_required: "Pole „{{field}}“ je povinné",
	err_required: "Toto pole je povinné",
	err_number: FIELD_TABLE_MESSAGES_SK.err_number,
	err_url: FIELD_TABLE_MESSAGES_SK.err_url,
	err_date: FIELD_TABLE_MESSAGES_SK.err_date,
	err_select_unknown: FIELD_TABLE_MESSAGES_SK.err_select_unknown,
	err_maxlength: FIELD_TABLE_MESSAGES_SK.err_maxlength,
	err_country: FIELD_TABLE_MESSAGES_SK.err_country,
	country_search_placeholder: FIELD_TABLE_MESSAGES_SK.country_search_placeholder,
	country_no_results: FIELD_TABLE_MESSAGES_SK.country_no_results,
	yes: "Áno",
	no: "Nie",
};
