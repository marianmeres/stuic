export {
	default as Calendar,
	type Props as CalendarProps,
	type CalendarMode,
	type CalendarCaptionLayout,
	type CalendarDayState,
	type CalendarRangeChange,
} from "./Calendar.svelte";

export {
	createCalendarT,
	CALENDAR_MESSAGES_EN,
	type CalendarMessageKey,
	type CalendarMessages,
} from "./calendar-i18n.js";

// Opt-in locale: only bundled when imported (the components never reference it).
export { CALENDAR_MESSAGES_SK } from "./calendar-i18n-sk.js";

export {
	type IsoDate,
	type IsoDateParts,
	type YearMonth,
	isIsoDate,
	parseIsoDate,
	normalizeIsoDate,
	toIsoDate,
	todayIso,
	addDaysIso,
	addMonthsIso,
	compareIso,
	daysBetweenIso,
	rangeLengthIso,
	formatIsoDate,
	formatIsoDateRange,
	DEFAULT_DATE_FORMAT,
} from "./iso-date.js";

// The calendar-utils cell / weekday types, for `isDateDisabled` and `weekStartsOn`.
export type {
	DayCell as CalendarDayCell,
	Weekday as CalendarWeekday,
} from "@marianmeres/calendar-utils";
