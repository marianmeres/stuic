import { describe, expect, test } from "vitest";
import {
	boundsOf,
	buildGanttAxis,
	dayToFraction,
	isoWeekNumber,
	placePoint,
	placeRange,
	GANTT_MAX_COLUMNS,
} from "./gantt-geometry.js";

// A fixed locale everywhere: these assert the shape of the axis, not ICU's
// spelling of "Sep" in whatever the CI box has configured.
const L = { locale: "en-US" };

describe("buildGanttAxis: day", () => {
	test("one column per day, inclusive at both ends", () => {
		const axis = buildGanttAxis("2026-09-01", "2026-09-05", L);
		expect(axis.columns.length).toBe(5);
		expect(axis.totalDays).toBe(5);
		expect(axis.start).toBe("2026-09-01");
		expect(axis.end).toBe("2026-09-05");
		expect(axis.columns.map((c) => c.label)).toEqual(["1", "2", "3", "4", "5"]);
		expect(axis.columns.every((c) => c.days === 1)).toBe(true);
		expect(axis.columns.map((c) => c.offset)).toEqual([0, 1, 2, 3, 4]);
	});

	test("weekends are flagged regardless of weekStartsOn", () => {
		// 2026-09-05 is a Saturday, 2026-09-06 a Sunday.
		for (const weekStartsOn of [1, 6, 7] as const) {
			const axis = buildGanttAxis("2026-09-01", "2026-09-07", { ...L, weekStartsOn });
			expect(axis.columns.filter((c) => c.isWeekend).map((c) => c.date)).toEqual([
				"2026-09-05",
				"2026-09-06",
			]);
		}
	});

	test("months become the group row, and a group spans its own days only", () => {
		const axis = buildGanttAxis("2026-08-30", "2026-09-02", L);
		expect(axis.groups.map((g) => [g.key, g.span, g.from])).toEqual([
			["2026-08", 2, 0],
			["2026-09", 2, 2],
		]);
		expect(axis.groups.map((g) => g.label)).toEqual(["Aug 2026", "Sep 2026"]);
		expect(axis.columns.map((c) => c.groupIndex)).toEqual([0, 0, 1, 1]);
	});

	test("today is flagged on exactly one column, and only inside the window", () => {
		const inside = buildGanttAxis("2026-09-01", "2026-09-05", {
			...L,
			today: "2026-09-03",
		});
		expect(inside.columns.filter((c) => c.isToday).map((c) => c.date)).toEqual([
			"2026-09-03",
		]);
		const outside = buildGanttAxis("2026-09-01", "2026-09-05", {
			...L,
			today: "2026-10-03",
		});
		expect(outside.columns.some((c) => c.isToday)).toBe(false);
	});
});

describe("buildGanttAxis: week + month snapping", () => {
	test("week columns snap outwards to whole weeks", () => {
		// 2026-09-02 is a Wednesday; the Monday-week around it starts 2026-08-31.
		const axis = buildGanttAxis("2026-09-02", "2026-09-10", { ...L, unit: "week" });
		expect(axis.start).toBe("2026-08-31");
		expect(axis.end).toBe("2026-09-13");
		expect(axis.columns.map((c) => c.date)).toEqual(["2026-08-31", "2026-09-07"]);
		expect(axis.columns.every((c) => c.days === 7)).toBe(true);
		// the asked-for window is still reported as asked
		expect([axis.from, axis.to]).toEqual(["2026-09-02", "2026-09-10"]);
	});

	test("weekStartsOn moves the snap", () => {
		const sun = buildGanttAxis("2026-09-02", "2026-09-10", {
			...L,
			unit: "week",
			weekStartsOn: 7,
		});
		expect(sun.start).toBe("2026-08-30");
	});

	test("month columns snap to whole months and carry their real length", () => {
		const axis = buildGanttAxis("2026-01-15", "2026-03-02", { ...L, unit: "month" });
		expect(axis.start).toBe("2026-01-01");
		expect(axis.end).toBe("2026-03-31");
		expect(axis.columns.map((c) => c.days)).toEqual([31, 28, 31]);
		expect(axis.columns.map((c) => c.label)).toEqual(["Jan", "Feb", "Mar"]);
		expect(axis.groups.map((g) => [g.label, g.span])).toEqual([["2026", 3]]);
	});

	test("month columns of a leap February are 29 days", () => {
		const axis = buildGanttAxis("2024-02-01", "2024-02-29", { ...L, unit: "month" });
		expect(axis.columns[0].days).toBe(29);
	});

	test("a month axis crossing a year gets one group per year", () => {
		const axis = buildGanttAxis("2025-11-01", "2026-02-01", { ...L, unit: "month" });
		expect(axis.groups.map((g) => [g.key, g.span])).toEqual([
			["2025", 2],
			["2026", 2],
		]);
	});
});

describe("buildGanttAxis: refusals", () => {
	test("an unparseable or backwards window throws rather than drawing something", () => {
		expect(() => buildGanttAxis("nope", "2026-09-05", L)).toThrow(/invalid "from"/);
		expect(() => buildGanttAxis("2026-09-01", "nope", L)).toThrow(/invalid "to"/);
		expect(() => buildGanttAxis("2026-09-05", "2026-09-01", L)).toThrow(/is after/);
	});

	test("a window too wide for the unit throws instead of building 100k nodes", () => {
		expect(() => buildGanttAxis("2000-01-01", "2030-01-01", L)).toThrow(
			new RegExp(`${GANTT_MAX_COLUMNS} limit`)
		);
		// ...but the same window is fine one unit coarser
		expect(
			buildGanttAxis("2000-01-01", "2030-01-01", { ...L, unit: "month" }).columns.length
		).toBe(361);
	});
});

describe("dayToFraction", () => {
	test("day columns map linearly", () => {
		const axis = buildGanttAxis("2026-09-01", "2026-09-04", L);
		expect(dayToFraction(0, axis)).toBe(0);
		expect(dayToFraction(1, axis)).toBeCloseTo(0.25);
		expect(dayToFraction(2.5, axis)).toBeCloseTo(0.625);
		expect(dayToFraction(4, axis)).toBe(1);
	});

	test("clamps outside the axis", () => {
		const axis = buildGanttAxis("2026-09-01", "2026-09-04", L);
		expect(dayToFraction(-10, axis)).toBe(0);
		expect(dayToFraction(99, axis)).toBe(1);
	});

	test("month columns are equal in width but not in days", () => {
		// Jan (31) + Feb (28): the boundary sits at exactly half the track even
		// though it is 31/59 of the days — this is the whole reason the mapping
		// goes through the columns instead of dividing by totalDays.
		const axis = buildGanttAxis("2026-01-01", "2026-02-28", { ...L, unit: "month" });
		expect(axis.totalDays).toBe(59);
		expect(dayToFraction(31, axis)).toBeCloseTo(0.5);
		expect(dayToFraction(15.5, axis)).toBeCloseTo(0.25);
	});
});

describe("placeRange", () => {
	const axis = buildGanttAxis("2026-09-01", "2026-09-10", L); // 10 day columns

	test("an inclusive range covers whole columns", () => {
		const p = placeRange("2026-09-03", "2026-09-04", axis)!;
		expect(p.start).toBeCloseTo(0.2);
		expect(p.end).toBeCloseTo(0.4);
		expect(p.days).toBe(2);
		expect(p.clippedStart).toBe(false);
		expect(p.clippedEnd).toBe(false);
	});

	test("a single day is one column wide, not zero", () => {
		const p = placeRange("2026-09-01", "2026-09-01", axis)!;
		expect(p.start).toBe(0);
		expect(p.end).toBeCloseTo(0.1);
		expect(p.days).toBe(1);
	});

	test("overhanging ends are clipped and flagged", () => {
		const p = placeRange("2026-08-20", "2026-09-30", axis)!;
		expect([p.start, p.end]).toEqual([0, 1]);
		expect(p.clippedStart).toBe(true);
		expect(p.clippedEnd).toBe(true);
		expect(p.days).toBe(10);
	});

	test("a range that misses the window is null, never a zero-width edge bar", () => {
		expect(placeRange("2026-08-01", "2026-08-31", axis)).toBe(null);
		expect(placeRange("2026-10-01", "2026-10-31", axis)).toBe(null);
		// touching the first/last day is not a miss
		expect(placeRange("2026-08-01", "2026-09-01", axis)).not.toBe(null);
	});

	test("reversed ends are ordered, not rejected", () => {
		expect(placeRange("2026-09-04", "2026-09-03", axis)).toEqual(
			placeRange("2026-09-03", "2026-09-04", axis)
		);
	});

	test("undatable input is null", () => {
		expect(placeRange("", "2026-09-03", axis)).toBe(null);
		expect(placeRange("2026-02-30", "2026-09-03", axis)).toBe(null);
	});

	test("a Date is read as its local calendar date", () => {
		const p = placeRange(new Date(2026, 8, 3), new Date(2026, 8, 3), axis)!;
		expect(p).toEqual(placeRange("2026-09-03", "2026-09-03", axis));
	});
});

describe("placePoint", () => {
	const axis = buildGanttAxis("2026-09-01", "2026-09-10", L);

	test("lands in the middle of its day", () => {
		expect(placePoint("2026-09-01", axis)).toBeCloseTo(0.05);
		expect(placePoint("2026-09-10", axis)).toBeCloseTo(0.95);
	});

	test("outside the axis is null", () => {
		expect(placePoint("2026-08-31", axis)).toBe(null);
		expect(placePoint("2026-09-11", axis)).toBe(null);
	});
});

describe("boundsOf", () => {
	test("the min and max of every end", () => {
		expect(
			boundsOf([
				{ from: "2026-09-03", to: "2026-09-04" },
				{ from: "2026-08-20", to: "2026-08-25" },
				{ from: "2026-09-30" }, // a milestone: `to` falls back to `from`
			])
		).toEqual({ from: "2026-08-20", to: "2026-09-30" });
	});

	test("nothing datable is null", () => {
		expect(boundsOf([])).toBe(null);
		expect(boundsOf([{ from: "x" }])).toBe(null);
	});
});

describe("isoWeekNumber", () => {
	test("ISO-8601 edge cases", () => {
		expect(isoWeekNumber("2026-01-01")).toBe(1); // Thursday → week 1
		expect(isoWeekNumber("2021-01-01")).toBe(53); // Friday → last week of 2020
		expect(isoWeekNumber("2026-09-02")).toBe(36);
		expect(isoWeekNumber("2024-12-30")).toBe(1); // Monday → week 1 of 2025
	});
});
