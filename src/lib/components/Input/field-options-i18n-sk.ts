import type { FieldOptionsMessages } from "./field-options-i18n.js";

/**
 * Slovak message catalog for `FieldOptions`. Opt-in — English stays the built-in
 * default, and this module is only pulled into a bundle when it is actually imported
 * (the component itself never references it).
 *
 * @example
 * ```svelte
 * <script>
 *   import {
 *     FieldOptions,
 *     createFieldOptionsT,
 *     FIELD_OPTIONS_MESSAGES_SK,
 *   } from "@marianmeres/stuic";
 *   const t = createFieldOptionsT(FIELD_OPTIONS_MESSAGES_SK);
 * </script>
 *
 * <FieldOptions name="tags" bind:value {getOptions} {t} />
 * ```
 */
export const FIELD_OPTIONS_MESSAGES_SK: FieldOptionsMessages = {
	field_req_att: "Toto pole vyžaduje pozornosť. Skontrolujte ho a skúste to znova.",
	cardinality_of: "z max.",
	cardinality_selected: "vybraných",
	submit: "Potvrdiť",
	select_all: "Vybrať všetko",
	clear_all: "Zrušiť výber",
	clear: "Zrušiť výber",
	search_placeholder: "Píšte pre vyhľadávanie...",
	search_submit_placeholder: "Píšte pre vyhľadanie a potvrdenie...",
	cardinality_full: "Dosiahnutý maximálny počet výberov",
	select_from_list: "Vyberte, prosím, iba zo zoznamu",
	x_close: "Vymazať vstup alebo zavrieť [esc]",
	close: "Zavrieť [esc]",
	unknown_allowed: "Vyberte alebo napíšte a potvrďte",
	unknown_not_allowed: "Vyberte zo zoznamu",
	no_results: "Nenašli sa žiadne výsledky.",
	add_new: 'Pridať "{{value}}"...',
	click_add_new: "Ak chcete pokračovať, musíte hodnotu pridať",
	// chips display mode
	chips_placeholder: "Nič nie je vybrané",
	chips_open: "Vybrať...",
	chips_remove: "Odstrániť {{value}}",
	//
	pick_tab: "Výber",
	arrange_tab: "Poradie ({{value}})",
	arrange_help: "Zmeňte poradie vybraných položiek. Na presun použite tlačidlá.",
	sort_az: "Zoradiť A–Z",
	reverse: "Obrátiť",
	shuffle: "Zamiešať",
	move_up: "Posunúť vyššie",
	move_down: "Posunúť nižšie",
	move_to_top: "Presunúť na začiatok",
	move_to_bottom: "Presunúť na koniec",
	remove_item: "Odstrániť",
	moved_up: "Posunuté vyššie: {{value}}",
	moved_down: "Posunuté nižšie: {{value}}",
	removed_item: "Odstránené: {{value}}",
	sorted_az: "Zoradené od A po Z",
	reversed: "Poradie obrátené",
	shuffled: "Poradie zamiešané",
};
