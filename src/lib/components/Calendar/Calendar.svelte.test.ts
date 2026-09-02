import { render } from "vitest-browser-svelte";
import { page, userEvent } from "vitest/browser";
import { expect, test, vi } from "vitest";
import { createRawSnippet } from "svelte";
import Calendar, { type CalendarDayState } from "./Calendar.svelte";
import CalendarHarness from "./CalendarHarness.test.svelte";
import { formatYearMonth, todayIso, yearMonthOf } from "./iso-date.js";

// Calendar renders <div class="stuic-calendar" role="group"> with one block per
// month: a header (prev Button | caption | next Button) and a <table role="grid">
// whose <td role="gridcell"> cells hold <button data-iso="YYYY-MM-DD"> day buttons.
// Filler days of adjacent months carry data-outside. Exactly one current-month day
// is in the tab order (tabindex="0", roving). Tests pin the view to FEBRUARY 2026 —
// Feb 1, 2026 is a Sunday, so a Monday-first grid runs Jan 26 → Mar 1 (5 weeks,
// 35 cells), which is never the current month while these tests matter.
const FEB = { year: 2026, month: 2 };

const days = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>("button[data-iso]"),
];
const day = (c: HTMLElement, iso: string) =>
	c.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]:not([data-outside])`);
const caption = (c: HTMLElement, i = 0) =>
	c.querySelectorAll(".stuic-calendar-caption")[i]?.textContent?.trim();
const headers = (c: HTMLElement) =>
	[...c.querySelectorAll("thead th")].map((th) => th.textContent?.trim());
const tabbable = (c: HTMLElement) => [
	...c.querySelectorAll<HTMLButtonElement>('button[data-iso][tabindex="0"]'),
];
const focusedIso = () => (document.activeElement as HTMLElement | null)?.dataset?.iso;
const live = (c: HTMLElement) => c.querySelector("[aria-live]")?.textContent?.trim();

// ---- rendering --------------------------------------------------------------

test("renders the month grid: caption, Monday-first headers, 35 cells incl. outside fillers, one tabbable day", async () => {
	const { container } = await render(Calendar, { view: FEB, locale: "en-US" });
	expect(caption(container)).toBe("February 2026");
	expect(headers(container)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
	expect(container.querySelector('table[role="grid"]')).not.toBeNull();
	const all = days(container);
	expect(all.length).toBe(35);
	expect(all[0].dataset.iso).toBe("2026-01-26");
	expect(all[0].hasAttribute("data-outside")).toBe(true);
	expect(all[34].dataset.iso).toBe("2026-03-01");
	// nothing selected, today elsewhere → the first of the month is the tab stop
	expect(tabbable(container).map((b) => b.dataset.iso)).toEqual(["2026-02-01"]);
	// day buttons carry a full spoken label
	expect(day(container, "2026-02-10")?.getAttribute("aria-label")).toBe(
		"Tuesday, February 10, 2026"
	);
});

test("weekStartsOn=7 rotates the headers and the grid start", async () => {
	const { container } = await render(Calendar, {
		view: FEB,
		locale: "en-US",
		weekStartsOn: 7,
	});
	expect(headers(container)[0]).toBe("Sun");
	expect(headers(container)[6]).toBe("Sat");
	expect(days(container)[0].dataset.iso).toBe("2026-02-01");
	expect(days(container)[0].hasAttribute("data-outside")).toBe(false);
});

test("locale drives the day and month names", async () => {
	const { container } = await render(Calendar, { view: FEB, locale: "de-DE" });
	expect(caption(container)).toBe("Februar 2026");
	expect(headers(container)[0]).toMatch(/^Mo/);
});

test("today's button carries aria-current=date and data-today", async () => {
	const { container } = await render(Calendar, { locale: "en-US" });
	const today = day(container, todayIso())!;
	expect(today).not.toBeNull();
	expect(today.getAttribute("aria-current")).toBe("date");
	expect(today.hasAttribute("data-today")).toBe(true);
	// with nothing selected, today is the tab stop of the current month
	expect(tabbable(container).map((b) => b.dataset.iso)).toEqual([todayIso()]);
});

test("showOutsideDays=false renders no filler buttons; fixedWeeks pads to 6 rows", async () => {
	const a = await render(Calendar, { view: FEB, showOutsideDays: false });
	expect(days(a.container).length).toBe(28);
	expect(a.container.querySelectorAll("tbody tr").length).toBe(5);
	const b = await render(Calendar, { view: FEB, fixedWeeks: true });
	expect(b.container.querySelectorAll("tbody tr").length).toBe(6);
	expect(days(b.container).length).toBe(42);
	expect(days(b.container)[41].dataset.iso).toBe("2026-03-08");
});

test("showWeekNumbers adds an ISO week column", async () => {
	const { container } = await render(Calendar, { view: FEB, showWeekNumbers: true });
	const rows = [...container.querySelectorAll('th[scope="row"]')].map((th) =>
		th.textContent?.trim()
	);
	expect(rows).toEqual(["5", "6", "7", "8", "9"]);
	expect(headers(container)[0]).toBe("Wk");
});

test("renderDay snippet replaces the day content and receives the day state", async () => {
	const renderDay = createRawSnippet((s: () => CalendarDayState) => ({
		render: () => `<i data-custom="${s().iso}">[${s().day}]</i>`,
	}));
	const { container } = await render(Calendar, { view: FEB, renderDay });
	const custom = day(container, "2026-02-10")?.querySelector("i[data-custom]");
	expect(custom?.getAttribute("data-custom")).toBe("2026-02-10");
	expect(custom?.textContent).toBe("[10]");
});

test("unstyled drops the stuic classes; class is merged onto the root", async () => {
	const styled = await render(Calendar, { view: FEB, class: "extra" });
	expect(styled.container.querySelector(".stuic-calendar.extra")).not.toBeNull();
	const bare = await render(Calendar, { view: FEB, unstyled: true, class: "extra" });
	expect(bare.container.querySelector(".stuic-calendar")).toBeNull();
	expect(bare.container.querySelector('[role="group"].extra')).not.toBeNull();
	expect(bare.container.querySelector(".stuic-calendar-day")).toBeNull();
	// behavior is untouched: day buttons + roving tabindex still there
	expect(tabbable(bare.container).length).toBe(1);
});

test("t translates the UI texts", async () => {
	const t = (k: string) => (k === "prev_month" ? "Vorheriger Monat" : k);
	const screen = await render(Calendar, { view: FEB, t, showToday: true });
	await expect
		.element(screen.getByRole("button", { name: "Vorheriger Monat" }))
		.toBeInTheDocument();
	await expect.element(screen.getByRole("button", { name: "today" })).toBeInTheDocument();
});

// ---- single selection -------------------------------------------------------

test("clicking a day selects it: onSelect, data-selected, aria-selected, tab stop moves, announced", async () => {
	const onSelect = vi.fn();
	const { container } = await render(Calendar, { view: FEB, locale: "en-US", onSelect });
	await page.elementLocator(day(container, "2026-02-10")!).click();
	expect(onSelect).toHaveBeenCalledWith("2026-02-10");
	const btn = day(container, "2026-02-10")!;
	await expect.poll(() => btn.hasAttribute("data-selected")).toBe(true);
	expect(btn.closest("td")?.getAttribute("aria-selected")).toBe("true");
	expect(tabbable(container).map((b) => b.dataset.iso)).toEqual(["2026-02-10"]);
	expect(live(container)).toBe("Selected Tuesday, February 10, 2026");
	// picking another day moves the selection (single)
	await page.elementLocator(day(container, "2026-02-11")!).click();
	await expect.poll(() => btn.hasAttribute("data-selected")).toBe(false);
	expect(day(container, "2026-02-11")!.hasAttribute("data-selected")).toBe(true);
	expect(container.querySelectorAll("button[data-selected]").length).toBe(1);
});

test("a preset value is selected and is the tab stop", async () => {
	const { container } = await render(Calendar, { view: FEB, value: "2026-02-14" });
	expect(day(container, "2026-02-14")?.hasAttribute("data-selected")).toBe(true);
	expect(tabbable(container).map((b) => b.dataset.iso)).toEqual(["2026-02-14"]);
});

test("clicking a filler day selects it AND navigates to its month", async () => {
	const onSelect = vi.fn();
	const onViewChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		locale: "en-US",
		onSelect,
		onViewChange,
	});
	const filler = container.querySelector<HTMLButtonElement>(
		'button[data-iso="2026-03-01"][data-outside]'
	)!;
	await page.elementLocator(filler).click();
	expect(onSelect).toHaveBeenCalledWith("2026-03-01");
	await expect.poll(() => caption(container)).toBe("March 2026");
	expect(onViewChange).toHaveBeenCalledWith({ year: 2026, month: 3 });
	await expect.poll(focusedIso).toBe("2026-03-01");
});

test("min/max disable days and the navigation beyond them; disabled days cannot be picked", async () => {
	const onSelect = vi.fn();
	const screen = await render(Calendar, {
		view: FEB,
		min: "2026-02-05",
		max: "2026-02-20",
		onSelect,
	});
	const { container } = screen;
	expect(day(container, "2026-02-04")?.getAttribute("aria-disabled")).toBe("true");
	expect(day(container, "2026-02-05")?.hasAttribute("aria-disabled")).toBe(false);
	expect(day(container, "2026-02-20")?.hasAttribute("aria-disabled")).toBe(false);
	expect(day(container, "2026-02-21")?.getAttribute("aria-disabled")).toBe("true");
	day(container, "2026-02-04")!.click();
	expect(onSelect).not.toHaveBeenCalled();
	await expect
		.element(screen.getByRole("button", { name: "Previous month" }))
		.toBeDisabled();
	await expect.element(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
});

test("isDateDisabled blocks individual days (still focusable, never selectable)", async () => {
	const onSelect = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		isDateDisabled: (_iso, cell) => cell.isWeekend,
		onSelect,
	});
	const sat = day(container, "2026-02-07")!;
	expect(sat.getAttribute("aria-disabled")).toBe("true");
	expect(day(container, "2026-02-09")?.hasAttribute("aria-disabled")).toBe(false);
	sat.click();
	expect(onSelect).not.toHaveBeenCalled();
	sat.focus();
	expect(focusedIso()).toBe("2026-02-07");
});

test("disabled: every day is aria-disabled, nav is disabled, nothing selects", async () => {
	const onSelect = vi.fn();
	const screen = await render(Calendar, { view: FEB, disabled: true, onSelect });
	const { container } = screen;
	expect(container.querySelector(".stuic-calendar")?.hasAttribute("data-disabled")).toBe(
		true
	);
	expect(days(container).every((b) => b.getAttribute("aria-disabled") === "true")).toBe(
		true
	);
	await expect.element(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
	day(container, "2026-02-10")!.click();
	expect(onSelect).not.toHaveBeenCalled();
});

// ---- navigation -------------------------------------------------------------

test("prev/next buttons step the view and report it", async () => {
	const onViewChange = vi.fn();
	const screen = await render(Calendar, { view: FEB, locale: "en-US", onViewChange });
	await screen.getByRole("button", { name: "Next month" }).click();
	await expect.poll(() => caption(screen.container)).toBe("March 2026");
	expect(onViewChange).toHaveBeenLastCalledWith({ year: 2026, month: 3 });
	await screen.getByRole("button", { name: "Previous month" }).click();
	await screen.getByRole("button", { name: "Previous month" }).click();
	await expect.poll(() => caption(screen.container)).toBe("January 2026");
	expect(days(screen.container)[0].dataset.iso).toBe("2025-12-29");
});

test("captionLayout=dropdown: month + year selects navigate the view", async () => {
	const onViewChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		locale: "en-US",
		captionLayout: "dropdown",
		yearRange: [2020, 2035],
		onViewChange,
	});
	const selects = container.querySelectorAll<HTMLSelectElement>("select");
	expect(selects.length).toBe(2);
	expect(selects[0].value).toBe("2");
	expect(selects[1].value).toBe("2026");
	expect(selects[1].options.length).toBe(16);
	await page.elementLocator(selects[1]).selectOptions("2030");
	expect(onViewChange).toHaveBeenLastCalledWith({ year: 2030, month: 2 });
	// Feb 1, 2030 is a Friday → Monday-first grid starts Jan 28
	await expect.poll(() => days(container)[0].dataset.iso).toBe("2030-01-28");
	const monthSelect = container.querySelector<HTMLSelectElement>("select")!;
	await page.elementLocator(monthSelect).selectOptions("6");
	expect(onViewChange).toHaveBeenLastCalledWith({ year: 2030, month: 6 });
	await expect.poll(() => monthSelect.value).toBe("6");
});

test("months=2 renders consecutive months with the nav buttons on the outer ends", async () => {
	const screen = await render(Calendar, { view: FEB, locale: "en-US", months: 2 });
	const { container } = screen;
	expect(container.querySelectorAll(".stuic-calendar-month").length).toBe(2);
	expect(caption(container, 0)).toBe("February 2026");
	expect(caption(container, 1)).toBe("March 2026");
	expect(container.querySelectorAll('[data-nav="prev"]').length).toBe(1);
	expect(container.querySelectorAll('[data-nav="next"]').length).toBe(1);
	// still exactly one tab stop across both grids
	expect(tabbable(container).length).toBe(1);
	await screen.getByRole("button", { name: "Next month" }).click();
	await expect.poll(() => caption(container, 0)).toBe("March 2026");
	expect(caption(container, 1)).toBe("April 2026");
});

test("Today button navigates to and focuses today; Clear clears", async () => {
	const onSelect = vi.fn();
	const screen = await render(Calendar, {
		view: FEB,
		value: "2026-02-10",
		locale: "en-US",
		showToday: true,
		showClear: true,
		onSelect,
	});
	const { container } = screen;
	await screen.getByRole("button", { name: "Today" }).click();
	await expect
		.poll(() => caption(container))
		.toBe(formatYearMonth(yearMonthOf(todayIso()), "en-US"));
	await expect.poll(focusedIso).toBe(todayIso());
	// Today does NOT select
	expect(onSelect).not.toHaveBeenCalled();
	await screen.getByRole("button", { name: "Clear" }).click();
	expect(onSelect).toHaveBeenCalledWith(null);
	await expect
		.poll(() => container.querySelectorAll("button[data-selected]").length)
		.toBe(0);
	await expect.element(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
});

test("an externally written value is brought on screen (bind:value harness)", async () => {
	const screen = await render(CalendarHarness, { initial: "2026-02-10" });
	const { container } = screen;
	expect(caption(container)).toBe("February 2026");
	await screen.getByTestId("set").click();
	await expect.poll(() => caption(container)).toBe("June 2030");
	await expect
		.poll(() => day(container, "2030-06-15")?.hasAttribute("data-selected"))
		.toBe(true);
	await expect
		.poll(() => screen.getByTestId("view").element().textContent)
		.toBe("2030-6");
	// browsing away is not undone by the selection
	await screen.getByRole("button", { name: "Next month" }).click();
	await expect.poll(() => caption(container)).toBe("July 2030");
	// and a pick writes back through the binding
	await page.elementLocator(day(container, "2030-07-04")!).click();
	await expect
		.poll(() => screen.getByTestId("bound").element().textContent)
		.toBe("2030-07-04");
});

// ---- keyboard ---------------------------------------------------------------

test("arrow keys step days/weeks, Home/End jump to the week ends, Enter selects", async () => {
	const onSelect = vi.fn();
	const { container } = await render(Calendar, { view: FEB, locale: "en-US", onSelect });
	day(container, "2026-02-11")!.focus(); // Wednesday
	await userEvent.keyboard("{ArrowRight}");
	await expect.poll(focusedIso).toBe("2026-02-12");
	await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
	await expect.poll(focusedIso).toBe("2026-02-10");
	await userEvent.keyboard("{ArrowDown}");
	await expect.poll(focusedIso).toBe("2026-02-17");
	await userEvent.keyboard("{ArrowUp}{ArrowUp}");
	await expect.poll(focusedIso).toBe("2026-02-03");
	await userEvent.keyboard("{Home}");
	await expect.poll(focusedIso).toBe("2026-02-02"); // Monday
	await userEvent.keyboard("{End}");
	await expect.poll(focusedIso).toBe("2026-02-08"); // Sunday
	// the focused day is now the (only) tab stop
	expect(tabbable(container).map((b) => b.dataset.iso)).toEqual(["2026-02-08"]);
	await userEvent.keyboard("{Enter}");
	expect(onSelect).toHaveBeenCalledWith("2026-02-08");
});

test("stepping past the visible month navigates; PageUp/PageDown step months, Shift steps years", async () => {
	const onViewChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		locale: "en-US",
		onViewChange,
	});
	day(container, "2026-02-01")!.focus();
	await userEvent.keyboard("{ArrowLeft}");
	await expect.poll(focusedIso).toBe("2026-01-31");
	await expect.poll(() => caption(container)).toBe("January 2026");
	expect(onViewChange).toHaveBeenLastCalledWith({ year: 2026, month: 1 });
	// the focused day is a real (current-month) cell, not the filler
	expect((document.activeElement as HTMLElement).hasAttribute("data-outside")).toBe(
		false
	);
	await userEvent.keyboard("{PageDown}");
	await expect.poll(focusedIso).toBe("2026-02-28"); // Jan 31 + 1 month, clamped
	await expect.poll(() => caption(container)).toBe("February 2026");
	await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
	await expect.poll(focusedIso).toBe("2025-02-28");
	await expect.poll(() => caption(container)).toBe("February 2025");
});

test("keyboard stepping is clamped to min/max", async () => {
	const { container } = await render(Calendar, { view: FEB, min: "2026-02-05" });
	day(container, "2026-02-06")!.focus();
	await userEvent.keyboard("{ArrowUp}");
	await expect.poll(focusedIso).toBe("2026-02-05");
	await userEvent.keyboard("{PageUp}");
	await expect.poll(focusedIso).toBe("2026-02-05");
});

test("months=2: arrows cross into the second month without navigating", async () => {
	const onViewChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		locale: "en-US",
		months: 2,
		onViewChange,
	});
	day(container, "2026-02-28")!.focus();
	await userEvent.keyboard("{ArrowRight}");
	await expect.poll(focusedIso).toBe("2026-03-01");
	expect((document.activeElement as HTMLElement).hasAttribute("data-outside")).toBe(
		false
	);
	expect(onViewChange).not.toHaveBeenCalled();
	expect(caption(container, 0)).toBe("February 2026");
});

test("focusOnMount moves focus into the grid", async () => {
	const { container } = await render(Calendar, { view: FEB, focusOnMount: true });
	await expect.poll(focusedIso).toBe("2026-02-01");
	expect(container.contains(document.activeElement)).toBe(true);
});

// ---- range ------------------------------------------------------------------

test("range: first pick anchors, second completes; cells between get the band; third pick restarts", async () => {
	const onRangeChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		mode: "range",
		locale: "en-US",
		onRangeChange,
	});
	await page.elementLocator(day(container, "2026-02-05")!).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-05",
		end: null,
		complete: false,
	});
	await expect.poll(() => live(container)).toBe("Select an end date");
	expect(day(container, "2026-02-05")?.hasAttribute("data-selected")).toBe(true);
	expect(container.querySelectorAll("td[data-in-range]").length).toBe(0);

	await page.elementLocator(day(container, "2026-02-10")!).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-05",
		end: "2026-02-10",
		complete: true,
	});
	// the band covers both ends on the cells (6), the strictly-inside days on the buttons (4)
	await expect.poll(() => container.querySelectorAll("td[data-in-range]").length).toBe(6);
	expect(container.querySelectorAll("button[data-in-range]").length).toBe(4);
	expect(day(container, "2026-02-05")?.hasAttribute("data-range-start")).toBe(true);
	expect(day(container, "2026-02-10")?.hasAttribute("data-range-end")).toBe(true);
	expect(
		day(container, "2026-02-05")?.closest("td")?.hasAttribute("data-band-start")
	).toBe(true);
	expect(day(container, "2026-02-10")?.closest("td")?.hasAttribute("data-band-end")).toBe(
		true
	);
	expect(container.querySelectorAll("button[data-selected]").length).toBe(2);
	expect(live(container)).toBe(
		"Selected Thursday, February 5, 2026 to Tuesday, February 10, 2026"
	);

	// a third pick starts a new range
	await page.elementLocator(day(container, "2026-02-20")!).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-20",
		end: null,
		complete: false,
	});
	await expect.poll(() => container.querySelectorAll("td[data-in-range]").length).toBe(0);
	expect(container.querySelectorAll("button[data-selected]").length).toBe(1);
});

test("range: an earlier second pick becomes the start", async () => {
	const onRangeChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		mode: "range",
		onRangeChange,
	});
	await page.elementLocator(day(container, "2026-02-10")!).click();
	await page.elementLocator(day(container, "2026-02-05")!).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-05",
		end: "2026-02-10",
		complete: true,
	});
});

test("range: a preset start without end is the anchor — one more pick completes it", async () => {
	const onRangeChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		mode: "range",
		start: "2026-02-03",
		onRangeChange,
	});
	await page.elementLocator(day(container, "2026-02-06")!).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-03",
		end: "2026-02-06",
		complete: true,
	});
});

test("range: hovering after the first pick previews the range; leaving clears it", async () => {
	const { container } = await render(Calendar, { view: FEB, mode: "range" });
	await page.elementLocator(day(container, "2026-02-05")!).click();
	await page.elementLocator(day(container, "2026-02-08")!).hover();
	await expect.poll(() => container.querySelectorAll("td[data-preview]").length).toBe(4);
	expect(day(container, "2026-02-08")?.closest("td")?.hasAttribute("data-band-end")).toBe(
		true
	);
	expect(container.querySelectorAll("td[data-in-range]").length).toBe(0);
	// hovering before the anchor previews backwards
	await page.elementLocator(day(container, "2026-02-02")!).hover();
	await expect.poll(() => container.querySelectorAll("td[data-preview]").length).toBe(4);
	expect(
		day(container, "2026-02-02")?.closest("td")?.hasAttribute("data-band-start")
	).toBe(true);
	// moving off the grid (onto the caption) ends the preview
	await page.elementLocator(container.querySelector(".stuic-calendar-caption")!).hover();
	await expect.poll(() => container.querySelectorAll("td[data-preview]").length).toBe(0);
});

test("range: keyboard — Enter twice picks both ends, with the preview following focus", async () => {
	const onRangeChange = vi.fn();
	const { container } = await render(Calendar, {
		view: FEB,
		mode: "range",
		onRangeChange,
	});
	day(container, "2026-02-10")!.focus();
	await userEvent.keyboard("{Enter}");
	await userEvent.keyboard("{ArrowRight}{ArrowRight}");
	await expect.poll(() => container.querySelectorAll("td[data-preview]").length).toBe(3);
	await userEvent.keyboard("{Enter}");
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: "2026-02-10",
		end: "2026-02-12",
		complete: true,
	});
});

test("range: Clear resets both ends", async () => {
	const onRangeChange = vi.fn();
	const screen = await render(Calendar, {
		view: FEB,
		mode: "range",
		start: "2026-02-03",
		end: "2026-02-06",
		showClear: true,
		onRangeChange,
	});
	expect(screen.container.querySelectorAll("td[data-in-range]").length).toBe(4);
	await screen.getByRole("button", { name: "Clear" }).click();
	expect(onRangeChange).toHaveBeenLastCalledWith({
		start: null,
		end: null,
		complete: false,
	});
	await expect
		.poll(() => screen.container.querySelectorAll("td[data-in-range]").length)
		.toBe(0);
});
