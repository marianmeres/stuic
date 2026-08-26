import type { FieldTypeDef } from "./types.js";
import type { FieldsBuilderMessages } from "./i18n.js";

/**
 * Slovak message catalog for `FieldsBuilder`. Opt-in — English stays the
 * built-in default, and this module is only pulled into a bundle when it is
 * actually imported (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import { createFieldsBuilderT, FIELDS_BUILDER_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createFieldsBuilderT(FIELDS_BUILDER_MESSAGES_SK);
 * </script>
 * ```
 */
export const FIELDS_BUILDER_MESSAGES_SK: FieldsBuilderMessages = {
	field_req_att: "Toto pole vyžaduje pozornosť. Skontrolujte ho a skúste to znova.",
	at_least_one_field: "Vyžaduje sa aspoň jedno pole",
	add_label: "Pridať pole",
	empty_message: "Zatiaľ žiadne polia",
	empty_options_message: "Nie sú definované žiadne možnosti",
	untitled: "Nepomenované pole",
	deleted: "Zmazané",
	delete_field: "Zmazať pole",
	undo_delete: "Späť",
	removed_field: "Zmazané pole: {{label}}",
	restored_field: "Obnovené pole: {{label}}",
	move_up: "Posunúť vyššie",
	move_down: "Posunúť nižšie",
	moved_up: "Posunuté vyššie: {{label}} ({{position}} z {{total}})",
	moved_down: "Posunuté nižšie: {{label}} ({{position}} z {{total}})",
	row_has_errors: "Obsahuje chyby",
	drag_to_reorder: "Potiahnutím zmeníte poradie",
	label_label: "Názov",
	label_placeholder: "Názov poľa",
	description_label: "Popis",
	type_label: "Typ",
	required_label: "Povinné",
	options_label: "Možnosti",
	add_option: "Pridať možnosť",
	option_label_placeholder: "Názov možnosti",
	option_value_placeholder: "hodnota",
	option_value_hint: "Uložená strojová hodnota tejto možnosti",
	remove_option: "Odstrániť možnosť",
	removed_option: "Odstránená možnosť: {{label}}",
	advanced_label: "Rozšírené",
	key_label: "Kľúč",
	key_hint: "Jedinečný strojový identifikátor tohto poľa. Vypĺňa sa automaticky z názvu.",
	key_locked_hint: "Kľúč identifikuje uložené údaje a už sa nedá zmeniť.",
	show_translations: "Zobraziť preklady",
	hide_translations: "Skryť preklady",
	type_change_warning:
		"Zmena typu existujúceho poľa nemusí sedieť s údajmi, ktoré sú pod ním už uložené.",
	unknown_type_warning:
		"Toto pole má typ, ktorý tento editor nepozná. Zostáva nezmenené a nedá sa tu upravovať.",
	preview_label: "Náhľad",
	err_label_required: "Názov je povinný",
	err_key_required: "Kľúč je povinný",
	err_key_pattern:
		"Kľúč musí začínať malým písmenom a môže obsahovať iba malé písmená, číslice a podčiarkovníky",
	err_key_maxlength: "Kľúč je príliš dlhý (max. {{max}} znakov)",
	err_key_duplicate: "Tento kľúč už používa iné pole",
	err_key_reserved: "Tento kľúč je rezervovaný a nedá sa použiť",
	err_options_required: "Pridajte aspoň jednu možnosť",
	err_option_value_required: "Každá možnosť musí mať hodnotu",
	err_option_value_duplicate: "Hodnoty možností musia byť jedinečné",
	err_extra_maxlength: "{{label}} — hodnota je príliš dlhá (max. {{max}} znakov)",
	err_max_fields: "Maximálny počet polí je {{max}}",
};

/**
 * Slovak counterpart of `FIELDS_BUILDER_DEFAULT_TYPES` — the `types` palette is
 * consumer-owned data (and a required prop), so translating the messages alone
 * would still leave the type select in English.
 */
export const FIELDS_BUILDER_DEFAULT_TYPES_SK: FieldTypeDef[] = [
	{ type: "text", label: "Text", description: "Jeden riadok textu" },
	{ type: "longtext", label: "Dlhý text", description: "Viac riadkov textu" },
	{ type: "number", label: "Číslo", description: "Číselná hodnota" },
	{ type: "checkbox", label: "Áno / nie", description: "Jedno zaškrtávacie políčko" },
	{
		type: "select",
		label: "Výber",
		description: "Výber jednej z ponúkaných možností",
		supportsOptions: true,
	},
	{ type: "date", label: "Dátum", description: "Kalendárny dátum" },
];
