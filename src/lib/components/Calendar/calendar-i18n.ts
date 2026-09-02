import type { TranslateFn } from "../../types.js";
import { isPlainObject } from "../../utils/is-plain-object.js";
import { replaceMap } from "../../utils/replace-map.js";

/**
 * The built-in (English) message catalog of `Calendar`, `FieldDate` and
 * `FieldDateRange`. Also the fallback of every other bundled locale, so a locale
 * missing a key still renders text.
 *
 * Day and month names are NOT in here — they come from `Intl` via the `locale` prop.
 * Placeholders are mustache-style (`{{value}}`).
 */
export const CALENDAR_MESSAGES_EN = {
	// navigation
	prev_month: "Previous month",
	next_month: "Next month",
	month: "Month",
	year: "Year",
	// grid
	week: "Wk",
	week_number: "Week {{value}}",
	day_today: "today",
	// footer
	today: "Today",
	clear: "Clear",
	done: "Done",
	close: "Close",
	// live announcements
	select_start: "Select a start date",
	select_end: "Select an end date",
	selected_date: "Selected {{value}}",
	selected_range: "Selected {{start}} to {{end}}",
	// fields (trigger + dialog)
	placeholder_date: "Select a date",
	placeholder_range: "Select a date range",
	dialog_title_date: "Select date",
	dialog_title_range: "Select date range",
	clear_value: "Clear selection",
	// validation
	field_req_att: "This field requires attention. Please review and try again.",
	date_invalid: "Please enter a valid date.",
	date_disabled: "This date is not available.",
	date_before_min: "Date must be on or after {{value}}.",
	date_after_max: "Date must be on or before {{value}}.",
	range_incomplete: "Please select both a start and an end date.",
};

/** Every message key the calendar components may look up. */
export type CalendarMessageKey = keyof typeof CALENDAR_MESSAGES_EN;

/** A (possibly partial) catalog for one locale. */
export type CalendarMessages = Record<CalendarMessageKey, string>;

/**
 * Builds the `t` prop of `Calendar` / `FieldDate` / `FieldDateRange` from a message
 * catalog. Unknown or untranslated keys fall back to `fallbackMessages` (English by
 * default), so a catalog may safely be partial and never renders a raw key.
 *
 * @example
 * ```svelte
 * <script>
 *   import { FieldDate, createCalendarT, CALENDAR_MESSAGES_SK } from "@marianmeres/stuic";
 *
 *   // full locale, plus a field specific tweak
 *   const t = createCalendarT({ ...CALENDAR_MESSAGES_SK, placeholder_date: "Dátum narodenia" });
 * </script>
 *
 * <FieldDate name="born" bind:value locale="sk" {t} />
 * ```
 */
export function createCalendarT(
	messages: Partial<CalendarMessages> | Record<string, string>,
	fallbackMessages:
		Partial<CalendarMessages> | Record<string, string> = CALENDAR_MESSAGES_EN
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

/** The components' built-in English `t`. */
export const t_default: TranslateFn = createCalendarT(CALENDAR_MESSAGES_EN);
