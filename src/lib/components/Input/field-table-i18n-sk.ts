import type { FieldTableMessages } from "./field-table-i18n.js";

/**
 * Slovak message catalog for `FieldTable`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldTable,
 *     createFieldTableT,
 *     FIELD_TABLE_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createFieldTableT(FIELD_TABLE_MESSAGES_SK);
 * </script>
 *
 * <FieldTable name="items" bind:value {columns} locale="sk" {t} />
 * ```
 */
export const FIELD_TABLE_MESSAGES_SK: FieldTableMessages = {
	field_req_att: "Toto pole vyžaduje pozornosť. Skontrolujte ho a skúste to znova.",
	add_row: "Pridať riadok",
	empty_message: "Zatiaľ žiadne riadky",
	row_label: "Riadok {{row}}",
	actions_label: "Akcie",
	move_row_up: "Posunúť riadok {{row}} vyššie",
	move_row_down: "Posunúť riadok {{row}} nižšie",
	remove_row: "Odstrániť riadok {{row}}",
	added_row: "Pridaný riadok {{row}}",
	removed_row: "Odstránený riadok {{row}}",
	moved_row: "Riadok presunutý na pozíciu {{position}} z {{total}}",
	unknown_row_warning:
		"Tento riadok nie je záznam, ktorý vie tento editor zobraziť. Zostáva nezmenený.",
	err_rows_required: "Vyžaduje sa aspoň jeden riadok",
	err_max_rows: "Maximálny počet riadkov je {{max}}",
	err_cell: "Riadok {{row}}, {{column}}: {{message}}",
	err_number: "nie je číslo",
	err_url: "musí byť webová adresa začínajúca na http:// alebo https://",
	err_date: "nie je platný dátum",
	err_select_unknown: "„{{value}}“ nie je medzi možnosťami",
	err_maxlength: "príliš dlhé (max. {{max}} znakov)",
};
