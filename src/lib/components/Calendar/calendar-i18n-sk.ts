import type { CalendarMessages } from "./calendar-i18n.js";

/**
 * Slovak message catalog for `Calendar`, `FieldDate` and `FieldDateRange`. Opt-in —
 * English stays the built-in default, and this module is only pulled into a bundle
 * when it is actually imported (the components themselves never reference it).
 *
 * Pair it with `locale="sk"` so the day and month names (which come from `Intl`)
 * match.
 *
 * @example
 * ```svelte
 * <script>
 *   import { FieldDate, createCalendarT, CALENDAR_MESSAGES_SK } from "@marianmeres/stuic";
 *   const t = createCalendarT(CALENDAR_MESSAGES_SK);
 * </script>
 *
 * <FieldDate name="from" bind:value locale="sk" {t} />
 * ```
 */
export const CALENDAR_MESSAGES_SK: CalendarMessages = {
	prev_month: "Predchádzajúci mesiac",
	next_month: "Nasledujúci mesiac",
	month: "Mesiac",
	year: "Rok",
	week: "Týž.",
	week_number: "Týždeň {{value}}",
	day_today: "dnes",
	today: "Dnes",
	clear: "Zrušiť výber",
	done: "Hotovo",
	close: "Zavrieť",
	select_start: "Vyberte začiatok obdobia",
	select_end: "Vyberte koniec obdobia",
	selected_date: "Vybraný dátum {{value}}",
	selected_range: "Vybrané obdobie od {{start}} do {{end}}",
	placeholder_date: "Vyberte dátum",
	placeholder_range: "Vyberte obdobie",
	dialog_title_date: "Výber dátumu",
	dialog_title_range: "Výber obdobia",
	clear_value: "Zrušiť výber",
	field_req_att: "Toto pole vyžaduje pozornosť. Skontrolujte ho a skúste to znova.",
	date_invalid: "Zadajte, prosím, platný dátum.",
	date_disabled: "Tento dátum nie je k dispozícii.",
	date_before_min: "Dátum musí byť najskôr {{value}}.",
	date_after_max: "Dátum musí byť najneskôr {{value}}.",
	range_incomplete: "Vyberte, prosím, začiatok aj koniec obdobia.",
};
