/**
 * The Gantt's geometry: a date window in, columns and 0..1 track fractions out.
 *
 * Kept out of the component (and out of the browser) on purpose — everything
 * that could be wrong by a day is decided here, in plain functions a node test
 * can pin. The component only multiplies fractions by a width.
 *
 * Whole-day semantics throughout (`YYYY-MM-DD`, both ends inclusive), so a bar
 * never shifts by a day because the visitor is in Auckland. The day arithmetic
 * reuses `Calendar/iso-date.js`, which is DST-safe via `@marianmeres/calendar-utils`.
 */

import type { Weekday } from "@marianmeres/calendar-utils";
import {
	addDaysIso,
	addMonths,
	compareIso,
	daysBetweenIso,
	daysInMonth,
	firstOfMonth,
	formatYearMonth,
	getMonthNames,
	normalizeIsoDate,
	toIsoDate,
	weekdayColumn,
	yearMonthKey,
	yearMonthOf,
	type IsoDate,
} from "../Calendar/iso-date.js";

/** Column granularity of the time axis. */
export type GanttUnit = "day" | "week" | "month";

/** What a consumer may hand in as a date — normalized via `normalizeIsoDate`. */
export type GanttDateInput = IsoDate | Date;

/** One cell of the axis' bottom (unit) header row, and one background gridline. */
export interface GanttColumn {
	/** The column's first calendar day, `YYYY-MM-DD`. */
	date: IsoDate;
	/** Calendar days the column covers (1 / 7 / 28–31). */
	days: number;
	/** Days from the axis' first day to this column's first day. */
	offset: number;
	/** Position in `axis.columns`. */
	index: number;
	/** Primary header label (day of month, or the month name for `unit: "month"`). */
	label: string;
	/** Secondary header label (weekday for days, ISO-ish week number for weeks). */
	subLabel?: string;
	/** Index into `axis.groups` — the top header row this column sits under. */
	groupIndex: number;
	/** Saturday or Sunday (`unit: "day"` only — a week/month column is never one). */
	isWeekend: boolean;
	/** The column contains `today`. */
	isToday: boolean;
}

/** One cell of the axis' top header row — the month over its days, the year over its months. */
export interface GanttGroup {
	/** Stable key (`"2026-09"` / `"2026"`). */
	key: string;
	label: string;
	/** Columns the cell spans. */
	span: number;
	/** Index of the first column it spans. */
	from: number;
}

export interface GanttAxis {
	unit: GanttUnit;
	/** The window as asked for. */
	from: IsoDate;
	to: IsoDate;
	/**
	 * The window as drawn. For `week`/`month` it is snapped outwards to whole
	 * units — a half-drawn week column would put its label on a lie.
	 */
	start: IsoDate;
	end: IsoDate;
	columns: GanttColumn[];
	groups: GanttGroup[];
	/** Calendar days from `start` to `end`, inclusive. */
	totalDays: number;
}

/** A range's position on the track, as 0..1 fractions of the axis' full width. */
export interface GanttPlacement {
	/** Left edge, 0..1. */
	start: number;
	/** Right edge, 0..1 (always `> start`). */
	end: number;
	/** The range begins before the axis — the component squares off that end. */
	clippedStart: boolean;
	clippedEnd: boolean;
	/** Inclusive day count of the *visible* part. */
	days: number;
}

export interface GanttAxisOptions {
	unit?: GanttUnit;
	/** First day of a week for `unit: "week"` (1 = Monday … 7 = Sunday). */
	weekStartsOn?: Weekday;
	/** BCP 47 tag for the month and weekday names; `undefined` = the runtime's. */
	locale?: string;
	/** The day to flag as today, or `null` for none. */
	today?: IsoDate | null;
}

/** Cap on generated columns — a mistyped year would otherwise build 700k of them. */
export const GANTT_MAX_COLUMNS = 2000;

/** The 7 localized weekday short names, Monday first. 2024-01-01 was a Monday. */
function getWeekdayNames(locale?: string, format: "short" | "narrow" = "short") {
	const f = new Intl.DateTimeFormat(locale, { weekday: format });
	return Array.from({ length: 7 }, (_, i) =>
		// noon, so no zone can pull the formatter back into the previous day
		f.format(new Date(2024, 0, 1 + i, 12))
	);
}

/** ISO-8601 week number of `iso` (weeks start Monday; week 1 holds the first Thursday). */
export function isoWeekNumber(iso: IsoDate): number {
	// Thursday of this ISO week decides which year (and therefore which week 1) the
	// week belongs to — the standard trick, done on plain day arithmetic.
	const thursday = addDaysIso(iso, 3 - weekdayColumn(iso, 1));
	const year = Number(thursday.slice(0, 4));
	const jan4 = toIsoDate(year, 1, 4);
	const week1Monday = addDaysIso(jan4, -weekdayColumn(jan4, 1));
	return Math.floor(daysBetweenIso(week1Monday, thursday) / 7) + 1;
}

/** First day of the unit `iso` falls in. */
function unitStart(iso: IsoDate, unit: GanttUnit, weekStartsOn: Weekday): IsoDate {
	if (unit === "week") return addDaysIso(iso, -weekdayColumn(iso, weekStartsOn));
	if (unit === "month") return firstOfMonth(yearMonthOf(iso));
	return iso;
}

/** Last day of the unit `iso` falls in. */
function unitEnd(iso: IsoDate, unit: GanttUnit, weekStartsOn: Weekday): IsoDate {
	if (unit === "week") return addDaysIso(unitStart(iso, unit, weekStartsOn), 6);
	if (unit === "month") {
		const ym = yearMonthOf(iso);
		return toIsoDate(ym.year, ym.month, daysInMonth(ym.year, ym.month));
	}
	return iso;
}

/**
 * The columns and the two header rows for a `[from, to]` window (both inclusive).
 *
 * Throws on an unparseable window, and on one so wide it would exceed
 * {@link GANTT_MAX_COLUMNS} columns — at that zoom nothing is readable anyway,
 * and silently drawing 100k nodes is worse than saying so.
 */
export function buildGanttAxis(
	from: GanttDateInput,
	to: GanttDateInput,
	options: GanttAxisOptions = {}
): GanttAxis {
	const { unit = "day", weekStartsOn = 1, locale, today = null } = options;

	const isoFrom = normalizeIsoDate(from);
	const isoTo = normalizeIsoDate(to);
	if (!isoFrom) throw new Error(`Gantt: invalid "from" date: ${String(from)}`);
	if (!isoTo) throw new Error(`Gantt: invalid "to" date: ${String(to)}`);
	// A backwards window is a caller bug, not a reason to render nothing silently.
	if (compareIso(isoFrom, isoTo) > 0) {
		throw new Error(`Gantt: "from" (${isoFrom}) is after "to" (${isoTo})`);
	}

	const start = unitStart(isoFrom, unit, weekStartsOn);
	const end = unitEnd(isoTo, unit, weekStartsOn);
	const totalDays = daysBetweenIso(start, end) + 1;

	const months = getMonthNames(locale, "short");
	const weekdays = unit === "day" ? getWeekdayNames(locale) : [];

	const columns: GanttColumn[] = [];
	const groups: GanttGroup[] = [];
	const pushColumn = (
		date: IsoDate,
		days: number,
		groupKey: string,
		label: string,
		subLabel?: string
	) => {
		const last = groups[groups.length - 1];
		if (last?.key === groupKey) last.span += 1;
		else groups.push({ key: groupKey, label: "", span: 1, from: columns.length });
		columns.push({
			date,
			days,
			offset: daysBetweenIso(start, date),
			index: columns.length,
			label,
			subLabel,
			groupIndex: groups.length - 1,
			isWeekend: unit === "day" && weekdayColumn(date, 1) >= 5,
			isToday:
				!!today && compareIso(today, date) >= 0 && daysBetweenIso(date, today) < days,
		});
	};

	const estimated =
		unit === "day" ? totalDays : unit === "week" ? totalDays / 7 : totalDays / 28;
	if (estimated > GANTT_MAX_COLUMNS) {
		throw new Error(
			`Gantt: ${Math.round(estimated)} "${unit}" columns for ${isoFrom}…${isoTo} ` +
				`exceeds the ${GANTT_MAX_COLUMNS} limit — narrow the window or use a coarser unit.`
		);
	}

	if (unit === "month") {
		let ym = yearMonthOf(start);
		const endYm = yearMonthOf(end);
		while (ym.year * 12 + ym.month <= endYm.year * 12 + endYm.month) {
			pushColumn(
				firstOfMonth(ym),
				daysInMonth(ym.year, ym.month),
				`${ym.year}`,
				months[ym.month - 1]
			);
			ym = addMonths(ym, 1);
		}
		for (const g of groups) g.label = g.key;
	} else {
		const step = unit === "week" ? 7 : 1;
		for (let date = start; compareIso(date, end) <= 0; date = addDaysIso(date, step)) {
			const ym = yearMonthOf(date);
			pushColumn(
				date,
				step,
				yearMonthKey(ym),
				`${Number(date.slice(8, 10))}`,
				unit === "day" ? weekdays[weekdayColumn(date, 1)] : `W${isoWeekNumber(date)}`
			);
		}
		for (const g of groups) {
			const [y, m] = g.key.split("-").map(Number);
			g.label = formatYearMonth({ year: y, month: m }, locale, {
				month: "short",
				year: "numeric",
			});
		}
	}

	return { unit, from: isoFrom, to: isoTo, start, end, columns, groups, totalDays };
}

/**
 * Where a day offset sits on the track, 0..1.
 *
 * Columns all render at the same width but do not all cover the same number of
 * days (February against March), so this maps through the column the offset
 * falls in rather than dividing by `totalDays`. Fractional offsets are allowed
 * — `offset + 0.5` is the middle of that day.
 */
export function dayToFraction(offset: number, axis: GanttAxis): number {
	const n = axis.columns.length;
	if (!n) return 0;
	if (offset <= 0) return 0;
	if (offset >= axis.totalDays) return 1;

	// binary search for the column containing `offset`
	let lo = 0;
	let hi = n - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (axis.columns[mid].offset <= offset) lo = mid;
		else hi = mid - 1;
	}
	const col = axis.columns[lo];
	return (lo + (offset - col.offset) / col.days) / n;
}

/**
 * A `[from, to]` inclusive range as a track placement, or `null` when it misses
 * the axis entirely.
 *
 * A miss is `null` rather than a zero-width bar on purpose: a hairline pinned to
 * the window's edge reads as "starts today", which is exactly the wrong thing to
 * tell a planner.
 */
export function placeRange(
	from: GanttDateInput,
	to: GanttDateInput,
	axis: GanttAxis
): GanttPlacement | null {
	const a = normalizeIsoDate(from);
	const b = normalizeIsoDate(to);
	if (!a || !b) return null;
	const [lo, hi] = compareIso(a, b) <= 0 ? [a, b] : [b, a];
	if (compareIso(hi, axis.start) < 0 || compareIso(lo, axis.end) > 0) return null;

	const clippedStart = compareIso(lo, axis.start) < 0;
	const clippedEnd = compareIso(hi, axis.end) > 0;
	const visFrom = clippedStart ? axis.start : lo;
	const visTo = clippedEnd ? axis.end : hi;
	const startDay = daysBetweenIso(axis.start, visFrom);
	const endDay = daysBetweenIso(axis.start, visTo) + 1; // exclusive

	return {
		start: dayToFraction(startDay, axis),
		end: dayToFraction(endDay, axis),
		clippedStart,
		clippedEnd,
		days: endDay - startDay,
	};
}

/**
 * The middle of a single day as a 0..1 fraction (milestones, the today line), or
 * `null` when the day is outside the axis.
 */
export function placePoint(date: GanttDateInput, axis: GanttAxis): number | null {
	const iso = normalizeIsoDate(date);
	if (!iso) return null;
	if (compareIso(iso, axis.start) < 0 || compareIso(iso, axis.end) > 0) return null;
	return dayToFraction(daysBetweenIso(axis.start, iso) + 0.5, axis);
}

/**
 * The `[min, max]` of every date in `ranges` — what the axis defaults to when
 * the consumer gives no explicit window. `null` when nothing is datable.
 */
export function boundsOf(
	ranges: Iterable<{ from?: GanttDateInput; to?: GanttDateInput }>
): { from: IsoDate; to: IsoDate } | null {
	let min: IsoDate | null = null;
	let max: IsoDate | null = null;
	for (const r of ranges) {
		for (const v of [normalizeIsoDate(r.from), normalizeIsoDate(r.to ?? r.from)]) {
			if (!v) continue;
			if (!min || compareIso(v, min) < 0) min = v;
			if (!max || compareIso(v, max) > 0) max = v;
		}
	}
	return min && max ? { from: min, to: max } : null;
}
