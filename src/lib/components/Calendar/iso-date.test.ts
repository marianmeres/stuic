import { assert, test } from "vitest";
import { DateTime } from "@marianmeres/calendar-utils";
import {
	addDaysIso,
	addMonths,
	addMonthsIso,
	buildMonthGrid,
	clampIso,
	compareIso,
	compareYearMonth,
	dayCellOf,
	daysBetweenIso,
	daysInMonth,
	firstOfMonth,
	formatIsoDate,
	formatIsoDateLong,
	formatIsoDateRange,
	formatYearMonth,
	getMonthNames,
	isIsoDate,
	isWithinBounds,
	isWithinRange,
	normalizeIsoDate,
	orderedRange,
	parseIsoDate,
	rangeLengthIso,
	todayIso,
	toIsoDate,
	weekdayColumn,
	yearMonthKey,
	yearMonthOf,
} from "./iso-date.js";

// ---- parsing / validation --------------------------------------------------

test("parseIsoDate accepts strict YYYY-MM-DD and rejects impossible dates", () => {
	assert.deepEqual(parseIsoDate("2026-09-02"), { year: 2026, month: 9, day: 2 });
	assert.deepEqual(parseIsoDate("2024-02-29"), { year: 2024, month: 2, day: 29 });
	assert.isNull(parseIsoDate("2026-02-29")); // not a leap year
	assert.isNull(parseIsoDate("2026-13-01"));
	assert.isNull(parseIsoDate("2026-00-10"));
	assert.isNull(parseIsoDate("2026-04-31"));
	assert.isNull(parseIsoDate("2026-9-2")); // not zero padded
	assert.isNull(parseIsoDate("2026-09-02T00:00:00Z")); // strict: no time part
	assert.isNull(parseIsoDate(20260902));
	assert.isNull(parseIsoDate(null));
	assert.isNull(parseIsoDate(""));
});

test("isIsoDate / daysInMonth", () => {
	assert.isTrue(isIsoDate("2026-09-02"));
	assert.isFalse(isIsoDate("2026-09-31"));
	assert.equal(daysInMonth(2024, 2), 29);
	assert.equal(daysInMonth(2100, 2), 28); // century rule
	assert.equal(daysInMonth(2000, 2), 29); // 400 rule
	assert.equal(daysInMonth(2026, 12), 31);
});

test("toIsoDate zero-pads", () => {
	assert.equal(toIsoDate(2026, 9, 2), "2026-09-02");
	assert.equal(toIsoDate(33, 1, 1), "0033-01-01");
});

test("normalizeIsoDate coerces loose input to a calendar date, never through a zone", () => {
	assert.equal(normalizeIsoDate("2026-09-02"), "2026-09-02");
	assert.equal(normalizeIsoDate("  2026-09-02 "), "2026-09-02");
	// the date portion AS WRITTEN — even an instant that is "yesterday" in UTC-12
	assert.equal(normalizeIsoDate("2026-09-02T00:30:00Z"), "2026-09-02");
	assert.equal(normalizeIsoDate("2026-09-02 10:00"), "2026-09-02");
	// a Date is its LOCAL calendar date
	const d = new Date(2026, 8, 2, 23, 59);
	assert.equal(normalizeIsoDate(d), "2026-09-02");
	// a Luxon DateTime is its own-zone calendar date
	const dt = DateTime.fromISO("2026-09-02T23:00:00", { zone: "Pacific/Auckland" });
	assert.equal(normalizeIsoDate(dt), "2026-09-02");
	// garbage
	assert.isNull(normalizeIsoDate("2026-02-30"));
	assert.isNull(normalizeIsoDate("02/09/2026"));
	assert.isNull(normalizeIsoDate("tomorrow"));
	assert.isNull(normalizeIsoDate(new Date("nope")));
	assert.isNull(normalizeIsoDate(""));
	assert.isNull(normalizeIsoDate(null));
	assert.isNull(normalizeIsoDate(undefined));
	assert.isNull(normalizeIsoDate(20260902));
});

test("todayIso is today's calendar date", () => {
	assert.match(todayIso(), /^\d{4}-\d{2}-\d{2}$/);
	assert.equal(todayIso("UTC"), DateTime.utc().toISODate());
	// an invalid zone falls back to local instead of returning garbage
	assert.match(todayIso("Not/AZone"), /^\d{4}-\d{2}-\d{2}$/);
});

// ---- arithmetic -------------------------------------------------------------

test("addDaysIso crosses month and year boundaries, both directions", () => {
	assert.equal(addDaysIso("2026-09-02", 1), "2026-09-03");
	assert.equal(addDaysIso("2026-09-30", 1), "2026-10-01");
	assert.equal(addDaysIso("2026-12-31", 1), "2027-01-01");
	assert.equal(addDaysIso("2026-01-01", -1), "2025-12-31");
	assert.equal(addDaysIso("2024-02-28", 1), "2024-02-29");
	assert.equal(addDaysIso("2026-09-02", -7), "2026-08-26");
	assert.equal(addDaysIso("2026-09-02", 0), "2026-09-02");
});

test("addMonthsIso clamps the day of month", () => {
	assert.equal(addMonthsIso("2024-01-31", 1), "2024-02-29");
	assert.equal(addMonthsIso("2026-01-31", 1), "2026-02-28");
	assert.equal(addMonthsIso("2026-03-31", -1), "2026-02-28");
	assert.equal(addMonthsIso("2026-09-02", 12), "2027-09-02");
	assert.equal(addMonthsIso("2026-09-02", -12), "2025-09-02");
});

test("compareIso / orderedRange / daysBetweenIso / rangeLengthIso", () => {
	assert.equal(compareIso("2026-09-01", "2026-09-02"), -1);
	assert.equal(compareIso("2026-09-02", "2026-09-02"), 0);
	assert.equal(compareIso("2026-10-01", "2026-09-30"), 1);
	assert.deepEqual(orderedRange("2026-09-05", "2026-09-01"), [
		"2026-09-01",
		"2026-09-05",
	]);
	assert.deepEqual(orderedRange("2026-09-01", "2026-09-05"), [
		"2026-09-01",
		"2026-09-05",
	]);
	assert.equal(daysBetweenIso("2026-09-01", "2026-09-05"), 4);
	assert.equal(daysBetweenIso("2026-09-05", "2026-09-01"), -4);
	assert.equal(daysBetweenIso("2025-12-31", "2026-01-01"), 1);
	assert.equal(rangeLengthIso("2026-09-01", "2026-09-05"), 5);
	assert.equal(rangeLengthIso("2026-09-05", "2026-09-01"), 5);
	assert.equal(rangeLengthIso("2026-09-01", "2026-09-01"), 1);
});

test("isWithinRange / isWithinBounds / clampIso are inclusive and bound-optional", () => {
	assert.isTrue(isWithinRange("2026-09-01", "2026-09-01", "2026-09-05"));
	assert.isTrue(isWithinRange("2026-09-05", "2026-09-01", "2026-09-05"));
	assert.isFalse(isWithinRange("2026-09-06", "2026-09-01", "2026-09-05"));
	assert.isTrue(isWithinBounds("2026-09-02"));
	assert.isTrue(isWithinBounds("2026-09-02", null, null));
	assert.isTrue(isWithinBounds("2026-09-02", "2026-09-02", "2026-09-02"));
	assert.isFalse(isWithinBounds("2026-09-01", "2026-09-02"));
	assert.isFalse(isWithinBounds("2026-09-03", null, "2026-09-02"));
	assert.equal(clampIso("2026-09-01", "2026-09-02", "2026-09-10"), "2026-09-02");
	assert.equal(clampIso("2026-09-20", "2026-09-02", "2026-09-10"), "2026-09-10");
	assert.equal(clampIso("2026-09-05", "2026-09-02", "2026-09-10"), "2026-09-05");
	assert.equal(clampIso("2026-09-05"), "2026-09-05");
});

test("YearMonth helpers", () => {
	assert.deepEqual(yearMonthOf("2026-09-02"), { year: 2026, month: 9 });
	assert.throws(() => yearMonthOf("nope"));
	assert.equal(compareYearMonth({ year: 2026, month: 9 }, { year: 2026, month: 10 }), -1);
	assert.equal(compareYearMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 }), 1);
	assert.equal(compareYearMonth({ year: 2026, month: 9 }, { year: 2026, month: 9 }), 0);
	assert.deepEqual(addMonths({ year: 2026, month: 12 }, 1), { year: 2027, month: 1 });
	assert.deepEqual(addMonths({ year: 2026, month: 1 }, -1), { year: 2025, month: 12 });
	assert.deepEqual(addMonths({ year: 2026, month: 3 }, -15), { year: 2024, month: 12 });
	assert.deepEqual(addMonths({ year: 2026, month: 9 }, 0), { year: 2026, month: 9 });
	assert.equal(firstOfMonth({ year: 2026, month: 9 }), "2026-09-01");
	assert.equal(yearMonthKey({ year: 2026, month: 9 }), "2026-09");
});

test("weekdayColumn follows weekStartsOn", () => {
	// 2026-09-02 is a Wednesday
	assert.equal(weekdayColumn("2026-09-02", 1), 2); // Mon-first: Mon=0 … Wed=2
	assert.equal(weekdayColumn("2026-09-02", 7), 3); // Sun-first: Sun=0, Mon=1 … Wed=3
	assert.equal(weekdayColumn("2026-09-06", 1), 6); // Sunday is the last column
	assert.equal(weekdayColumn("2026-09-06", 7), 0);
	assert.equal(weekdayColumn("2026-09-05", 6), 0); // Saturday-first week
});

// ---- grid -------------------------------------------------------------------

test("buildMonthGrid: calendar-utils grid, optionally padded to a fixed 6 weeks", () => {
	const cfg = { zone: "UTC" as const, weekStartsOn: 1 as const };
	// Feb 2026 starts on a Sunday and fits 5 Monday-first weeks
	const feb = buildMonthGrid({ year: 2026, month: 2 }, cfg);
	assert.equal(feb.length, 5);
	assert.equal(feb[0][0].iso, "2026-01-26");
	assert.equal(feb[4][6].iso, "2026-03-01");
	assert.isFalse(feb[0][0].isCurrentMonth);
	assert.isTrue(feb[0][6].isCurrentMonth); // Feb 1
	// fixed: a 6th, next-month row appended, with the same cell shape
	const fixed = buildMonthGrid({ year: 2026, month: 2 }, cfg, true);
	assert.equal(fixed.length, 6);
	assert.equal(fixed[5][0].iso, "2026-03-02");
	assert.equal(fixed[5][6].iso, "2026-03-08");
	assert.isFalse(fixed[5][0].isCurrentMonth);
	assert.isTrue(fixed[5][5].isWeekend); // Saturday
	assert.equal(fixed[5][0].weekNumber, 10);
	// a 6-week month is untouched by fixedWeeks
	const may = buildMonthGrid({ year: 2026, month: 5 }, cfg, true);
	assert.equal(may.length, 6);
	assert.equal(may[0][0].iso, "2026-04-27");
});

test("dayCellOf builds a single cell (current-month, weekend + today flags)", () => {
	const sat = dayCellOf("2026-09-05", { zone: "UTC" });
	assert.equal(sat.iso, "2026-09-05");
	assert.isTrue(sat.isCurrentMonth);
	assert.isTrue(sat.isWeekend);
	const fri = dayCellOf("2026-09-04", { zone: "UTC", weekendDays: [5, 6] });
	assert.isTrue(fri.isWeekend);
	assert.isTrue(dayCellOf(todayIso("UTC"), { zone: "UTC" }).isToday);
});

// ---- formatting -------------------------------------------------------------

test("formatIsoDate / formatIsoDateLong / formatYearMonth / getMonthNames (en-US)", () => {
	assert.equal(formatIsoDate("2026-09-02", "en-US"), "Sep 2, 2026");
	assert.equal(
		formatIsoDate("2026-09-02", "en-US", { dateStyle: "long" }),
		"September 2, 2026"
	);
	assert.equal(formatIsoDate("nope", "en-US"), "");
	assert.equal(formatIsoDate(null, "en-US"), "");
	assert.equal(formatIsoDateLong("2026-09-02", "en-US"), "Wednesday, September 2, 2026");
	assert.equal(formatYearMonth({ year: 2026, month: 9 }, "en-US"), "September 2026");
	const names = getMonthNames("en-US");
	assert.equal(names.length, 12);
	assert.equal(names[0], "January");
	assert.equal(names[11], "December");
	assert.equal(getMonthNames("en-US", "short")[8], "Sep");
});

test("formatIsoDate respects the locale", () => {
	assert.equal(formatIsoDate("2026-09-02", "de-DE"), "02.09.2026");
	assert.equal(formatYearMonth({ year: 2026, month: 9 }, "sk"), "september 2026");
});

test("formatIsoDateRange collapses shared parts and never returns an empty string for valid dates", () => {
	const s = formatIsoDateRange("2026-09-01", "2026-09-05", "en-US");
	assert.match(s, /Sep 1\s*–\s*5, 2026/);
	const across = formatIsoDateRange("2026-09-28", "2026-10-03", "en-US");
	assert.match(across, /Sep 28\s*–\s*Oct 3, 2026/);
	assert.equal(formatIsoDateRange("nope", "2026-10-03", "en-US"), "");
});
