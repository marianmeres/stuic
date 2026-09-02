/**
 * Pure `YYYY-MM-DD` helpers shared by `Calendar`, `FieldDate` and `FieldDateRange`.
 *
 * Every date value these components bind, emit and submit is a calendar date in
 * ISO `YYYY-MM-DD` form — zone-independent, lexicographically sortable, and what
 * `<input type="date">` and most APIs already speak. The day arithmetic goes
 * through `@marianmeres/calendar-utils` (DST-safe, any year); the formatting
 * through `Intl`.
 */
import {
	DateTime,
	addDays as addDaysDt,
	calendarDaysBetween,
	createDayCell,
	createMonthGrid,
	getAdjustedWeekday,
	type DayCell,
	type GridConfig,
	type Weekday,
} from "@marianmeres/calendar-utils";

/** A calendar date as `YYYY-MM-DD` — the value type of every date component in stuic. */
export type IsoDate = string;

/** A `{ year, month }` pair, month 1–12 (the `view` of a `Calendar`). */
export interface YearMonth {
	year: number;
	month: number;
}

/** The three calendar fields of an `IsoDate`. */
export interface IsoDateParts {
	year: number;
	month: number;
	day: number;
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// `YYYY-MM-DD` optionally followed by a time part (`T…` / ` …`) — the date portion
// AS WRITTEN is used (iCalendar `VALUE=DATE` semantics, same as calendar-utils
// all-day events), never converted through a zone.
const ISO_DATE_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/;

/** Number of days in `month` (1–12) of `year`, proleptic Gregorian. */
export function daysInMonth(year: number, month: number): number {
	const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** Zero-padded `YYYY-MM-DD` from its parts. Does not validate. */
export function toIsoDate(year: number, month: number, day: number): IsoDate {
	const y = `${Math.abs(year)}`.padStart(4, "0");
	return `${year < 0 ? "-" : ""}${y}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
}

/**
 * Parses a strict `YYYY-MM-DD` string into its parts. Returns `null` for anything
 * else, including well-formed but impossible dates (`2026-02-30`).
 */
export function parseIsoDate(iso: unknown): IsoDateParts | null {
	if (typeof iso !== "string") return null;
	const m = ISO_DATE_RE.exec(iso);
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	if (month < 1 || month > 12) return null;
	if (day < 1 || day > daysInMonth(year, month)) return null;
	return { year, month, day };
}

/** `true` for a strict, valid `YYYY-MM-DD`. */
export function isIsoDate(v: unknown): v is IsoDate {
	return parseIsoDate(v) !== null;
}

/**
 * Coerces the loose inputs a consumer may hand to a date field into a strict
 * `IsoDate`, or `null` when that is not possible:
 *
 * - `"2026-09-02"` → as is
 * - `"2026-09-02T10:00:00Z"` / `"2026-09-02 10:00"` → the date portion **as written**
 *   (never shifted through a zone — a date field has no time-of-day to shift)
 * - `Date` → its **local** calendar date
 * - Luxon `DateTime` → its calendar date in its own zone
 * - `null` / `undefined` / `""` / anything unparseable → `null`
 */
export function normalizeIsoDate(v: unknown): IsoDate | null {
	if (v === null || v === undefined || v === "") return null;
	if (v instanceof Date) {
		return Number.isNaN(v.getTime())
			? null
			: toIsoDate(v.getFullYear(), v.getMonth() + 1, v.getDate());
	}
	if (DateTime.isDateTime(v)) return v.isValid ? v.toISODate() : null;
	if (typeof v !== "string") return null;
	const m = ISO_DATE_PREFIX_RE.exec(v.trim());
	if (!m) return null;
	const iso = `${m[1]}-${m[2]}-${m[3]}`;
	return isIsoDate(iso) ? iso : null;
}

/** Today's calendar date in `zone` (IANA, default local). */
export function todayIso(zone: string = "local"): IsoDate {
	const now = DateTime.now().setZone(zone);
	return (now.isValid ? now : DateTime.now()).toISODate()!;
}

// Internal: a DateTime for calendar arithmetic. UTC on purpose — the date has no
// zone, and UTC has no DST gaps to trip over.
const dt = (iso: IsoDate): DateTime => DateTime.fromISO(iso, { zone: "utc" });

/** `iso + days` calendar days (negative allowed). DST-immune. */
export function addDaysIso(iso: IsoDate, days: number): IsoDate {
	return addDaysDt(dt(iso), days).toISODate()!;
}

/** `iso + months`; the day of month is clamped (Jan 31 + 1 → Feb 28/29). */
export function addMonthsIso(iso: IsoDate, months: number): IsoDate {
	return dt(iso).plus({ months }).toISODate()!;
}

/** Sort comparator for `IsoDate`s (`-1`, `0`, `1`). */
export function compareIso(a: IsoDate, b: IsoDate): number {
	return a < b ? -1 : a > b ? 1 : 0;
}

/** Whole calendar days from `a` to `b` (positive when `b` is later). */
export function daysBetweenIso(a: IsoDate, b: IsoDate): number {
	return calendarDaysBetween(dt(a), dt(b));
}

/** The two dates in chronological order. */
export function orderedRange(a: IsoDate, b: IsoDate): [IsoDate, IsoDate] {
	return compareIso(a, b) <= 0 ? [a, b] : [b, a];
}

/** Inclusive day count of a range (`1` for a single-day range). */
export function rangeLengthIso(start: IsoDate, end: IsoDate): number {
	return Math.abs(daysBetweenIso(start, end)) + 1;
}

/** Inclusive `start <= iso <= end`. */
export function isWithinRange(iso: IsoDate, start: IsoDate, end: IsoDate): boolean {
	return compareIso(iso, start) >= 0 && compareIso(iso, end) <= 0;
}

/** `min <= iso <= max`, each bound optional. */
export function isWithinBounds(
	iso: IsoDate,
	min?: IsoDate | null,
	max?: IsoDate | null
): boolean {
	if (min && compareIso(iso, min) < 0) return false;
	if (max && compareIso(iso, max) > 0) return false;
	return true;
}

/** `iso` clamped into `[min, max]` (each bound optional). */
export function clampIso(
	iso: IsoDate,
	min?: IsoDate | null,
	max?: IsoDate | null
): IsoDate {
	if (min && compareIso(iso, min) < 0) return min;
	if (max && compareIso(iso, max) > 0) return max;
	return iso;
}

/** The `{ year, month }` an `IsoDate` falls in. */
export function yearMonthOf(iso: IsoDate): YearMonth {
	const p = parseIsoDate(iso);
	if (!p) throw new Error(`yearMonthOf: invalid ISO date: ${iso}`);
	return { year: p.year, month: p.month };
}

/** Sort comparator for `YearMonth`s. */
export function compareYearMonth(a: YearMonth, b: YearMonth): number {
	return a.year - b.year || a.month - b.month;
}

/** `ym + months` (negative allowed, crosses years). */
export function addMonths(ym: YearMonth, months: number): YearMonth {
	const idx = ym.year * 12 + (ym.month - 1) + months;
	return { year: Math.floor(idx / 12), month: (((idx % 12) + 12) % 12) + 1 };
}

/** `YYYY-MM-01` of a `YearMonth`. */
export function firstOfMonth(ym: YearMonth): IsoDate {
	return toIsoDate(ym.year, ym.month, 1);
}

/** Stable string key of a `YearMonth` (`"2026-09"`). */
export function yearMonthKey(ym: YearMonth): string {
	return `${ym.year}-${`${ym.month}`.padStart(2, "0")}`;
}

/** Column index (0–6) of `iso` in a week that starts on `weekStartsOn`. */
export function weekdayColumn(iso: IsoDate, weekStartsOn: Weekday = 1): number {
	return getAdjustedWeekday(dt(iso).weekday, weekStartsOn);
}

/**
 * The month grid for a `YearMonth` — `createMonthGrid` from calendar-utils (5 or 6
 * weeks), optionally padded to a fixed 6 weeks so the UI height never jumps while
 * navigating.
 */
export function buildMonthGrid(
	ym: YearMonth,
	config: GridConfig = {},
	fixedWeeks: boolean = false
): DayCell[][] {
	const grid = createMonthGrid(ym.year, ym.month, config);
	if (!fixedWeeks) return grid;
	const today = DateTime.now().setZone(config.zone ?? "local");
	let last = grid[grid.length - 1][6].date;
	while (grid.length < 6) {
		const week: DayCell[] = [];
		for (let i = 0; i < 7; i++) {
			last = addDaysDt(last, 1);
			week.push(createDayCell(last, ym.month, today, config.weekendDays));
		}
		grid.push(week);
	}
	return grid;
}

// ------------------------------------------------------------------ formatting

// A local `Date` at noon on the given calendar date. Noon keeps a formatter from
// ever landing on the previous day around a DST switch, and `setFullYear` avoids
// the `new Date(y, …)` two-digit-year quirk.
function toLocalNoon(p: IsoDateParts): Date {
	const d = new Date(2000, 0, 1, 12, 0, 0, 0);
	d.setFullYear(p.year, p.month - 1, p.day);
	return d;
}

/** Default `Intl` options of the date fields' display text. */
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: "medium" };

/**
 * Formats an `IsoDate` for display with `Intl.DateTimeFormat` (medium date style by
 * default). Invalid input renders as `""`.
 */
export function formatIsoDate(
	iso: IsoDate | null | undefined,
	locale?: string,
	options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT
): string {
	const p = iso ? parseIsoDate(iso) : null;
	if (!p) return "";
	return new Intl.DateTimeFormat(locale, options).format(toLocalNoon(p));
}

/**
 * Formats an inclusive date range — via `Intl.DateTimeFormat#formatRange` where the
 * runtime has it ("Sep 1 – 5, 2026"), else the two dates joined by `separator`.
 */
export function formatIsoDateRange(
	start: IsoDate,
	end: IsoDate,
	locale?: string,
	options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT,
	separator: string = " – "
): string {
	const a = parseIsoDate(start);
	const b = parseIsoDate(end);
	if (!a || !b) return "";
	const f = new Intl.DateTimeFormat(locale, options);
	const [da, db] = [toLocalNoon(a), toLocalNoon(b)];
	if (typeof f.formatRange === "function") {
		try {
			return f.formatRange(da, db);
		} catch {
			// fall through to the plain join
		}
	}
	return `${f.format(da)}${separator}${f.format(db)}`;
}

/** "September 2026" (localized) for a `YearMonth`. */
export function formatYearMonth(
	ym: YearMonth,
	locale?: string,
	options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
): string {
	return new Intl.DateTimeFormat(locale, options).format(
		toLocalNoon({ year: ym.year, month: ym.month, day: 1 })
	);
}

/** The 12 localized month names, January first. */
export function getMonthNames(
	locale?: string,
	format: "long" | "short" | "narrow" = "long"
): string[] {
	const f = new Intl.DateTimeFormat(locale, { month: format });
	return Array.from({ length: 12 }, (_, i) =>
		f.format(toLocalNoon({ year: 2024, month: i + 1, day: 1 }))
	);
}

/** Full spoken form of a date ("Wednesday, September 2, 2026") — for `aria-label`s. */
export function formatIsoDateLong(iso: IsoDate, locale?: string): string {
	return formatIsoDate(iso, locale, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * A calendar-utils `DayCell` for a single date — what `isDateDisabled` receives
 * when the date fields validate a value outside of any rendered grid.
 */
export function dayCellOf(iso: IsoDate, config: GridConfig = {}): DayCell {
	const zone = config.zone ?? "local";
	const day = DateTime.fromISO(iso, { zone });
	return createDayCell(day, null, DateTime.now().setZone(zone), config.weekendDays);
}
