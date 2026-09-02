<!--
	Calendar — an accessible month grid for picking a single date or a date range.

	Values are calendar dates in ISO `YYYY-MM-DD` form (zone-independent; see
	`iso-date.ts`). The grid, "today", week numbers and DST-safe day stepping come
	from `@marianmeres/calendar-utils`; day/month names come from `Intl` via `locale`.

	Keyboard (APG "date picker" grid pattern): the day buttons form a roving-tabindex
	grid — one is in the tab order, arrows move by day/week, Home/End jump to the
	week's ends, PageUp/PageDown step a month (Shift: a year), Enter/Space select.
	Moving past the visible months navigates the view.

	Range selection: first pick is the anchor, second completes (order-agnostic —
	an earlier second pick becomes the start), a third pick starts over. While an
	anchor waits, hovered (mouse) / focused (keyboard) days preview the range.

	The component is presentation-agnostic: `FieldDate` / `FieldDateRange` embed it
	in a field or a dialog; it can equally sit inline on a page.
-->
<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { DayCell, Weekday } from "@marianmeres/calendar-utils";
	import type { TranslateFn } from "../../types.js";
	import type { IsoDate, YearMonth } from "./iso-date.js";

	/** What the calendar selects. */
	export type CalendarMode = "single" | "range";

	/** How the month/year caption renders. */
	export type CalendarCaptionLayout = "label" | "dropdown";

	/**
	 * Everything the `renderDay` snippet knows about one day. The same facts drive
	 * the `data-*` styling hooks on the day button / cell.
	 */
	export interface CalendarDayState {
		/** `YYYY-MM-DD` */
		iso: IsoDate;
		/** Day of month (1–31) */
		day: number;
		/** The calendar-utils cell (Luxon `date`, `weekNumber`, …) */
		cell: DayCell;
		/** The selected date (single) or one of the range ends (range) */
		selected: boolean;
		rangeStart: boolean;
		rangeEnd: boolean;
		/** Strictly between the two committed range ends */
		inRange: boolean;
		/** Inside the not-yet-committed range (anchor → hovered / focused day) */
		preview: boolean;
		today: boolean;
		/** Belongs to the previous / next month (grid filler) */
		outside: boolean;
		weekend: boolean;
		disabled: boolean;
	}

	/** Payload of `onRangeChange`. */
	export interface CalendarRangeChange {
		start: IsoDate | null;
		end: IsoDate | null;
		/** `true` once both ends are set */
		complete: boolean;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** `"single"` (default) binds `value`; `"range"` binds `start` + `end`. */
		mode?: CalendarMode;
		/** The selected date, `YYYY-MM-DD` (bindable; single mode). */
		value?: IsoDate | null;
		/** Range start, `YYYY-MM-DD` (bindable; range mode). */
		start?: IsoDate | null;
		/** Range end, `YYYY-MM-DD` (bindable; range mode). */
		end?: IsoDate | null;
		/**
		 * The first displayed month (bindable). Defaults to the month of the
		 * selection, else the current month.
		 */
		view?: YearMonth;
		/** How many consecutive months to render side by side. Default `1`. */
		months?: number;
		/** Earliest selectable date (inclusive); earlier days are disabled. */
		min?: IsoDate | null;
		/** Latest selectable date (inclusive); later days are disabled. */
		max?: IsoDate | null;
		/** Disable individual days (blackout dates, weekends, …). */
		isDateDisabled?: (iso: IsoDate, cell: DayCell) => boolean;
		/** First day of the week, ISO numbering: 1 = Monday (default) … 7 = Sunday. */
		weekStartsOn?: Weekday;
		/** Days flagged as weekend (`data-weekend`). Default `[6, 7]`. */
		weekendDays?: Weekday[];
		/** BCP 47 locale of the day / month names. Browser default when omitted. */
		locale?: string;
		/** IANA zone that decides which day is "today". Default local. */
		zone?: string;
		/** `"label"` (default) or `"dropdown"` (month + year selects, e.g. for birth dates). */
		captionLayout?: CalendarCaptionLayout;
		/** Years offered by the dropdown caption. Defaults to `min`/`max` years, else today ±100/+20. */
		yearRange?: [number, number];
		/** Show the ISO week number column. */
		showWeekNumbers?: boolean;
		/** Render the previous / next month's filler days. Default `true`. */
		showOutsideDays?: boolean;
		/** Always render 6 weeks so the height never jumps while navigating. */
		fixedWeeks?: boolean;
		/** Footer "Today" button (navigates to and focuses today; does not select). */
		showToday?: boolean;
		/** Footer "Clear" button. */
		showClear?: boolean;
		/** Whole calendar non-interactive. */
		disabled?: boolean;
		/** Move focus into the grid once mounted (dialog use). */
		focusOnMount?: boolean;
		/** i18n — see `createCalendarT`. */
		t?: TranslateFn;
		/** Single mode: a date was picked (or cleared). */
		onSelect?: (value: IsoDate | null) => void;
		/** Range mode: an end was picked / the range cleared. */
		onRangeChange?: (range: CalendarRangeChange) => void;
		/** The displayed month changed (navigation, keyboard, dropdowns). */
		onViewChange?: (view: YearMonth) => void;
		/** Custom day cell content (receives `CalendarDayState`). */
		renderDay?: Snippet<[CalendarDayState]>;
		/** Extra footer content (rendered on the end side of the footer row). */
		footer?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root */
		class?: string;
		/** Class for each month block */
		classMonth?: string;
		/** Class for each month's header row (prev / caption / next) */
		classHeader?: string;
		/** Class for the caption (month + year) */
		classCaption?: string;
		/** Class for the `<table>` */
		classGrid?: string;
		/** Class for the weekday header cells */
		classWeekday?: string;
		/** Class for the day cells (`<td>`) */
		classCell?: string;
		/** Class for the day buttons */
		classDay?: string;
		/** Class for the footer row */
		classFooter?: string;
		/** Bindable element reference */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { tick, untrack } from "svelte";
	import { getWeekdayHeaders } from "@marianmeres/calendar-utils";
	import { iconChevronLeft, iconChevronRight } from "../../icons/index.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import { t_default } from "./calendar-i18n.js";
	import {
		addDaysIso,
		addMonths,
		addMonthsIso,
		buildMonthGrid,
		clampIso,
		compareYearMonth,
		firstOfMonth,
		formatIsoDateLong,
		formatYearMonth,
		getMonthNames,
		isWithinBounds,
		isWithinRange,
		normalizeIsoDate,
		orderedRange,
		todayIso,
		weekdayColumn,
		yearMonthOf,
	} from "./iso-date.js";

	let {
		mode = "single",
		value = $bindable(null),
		start = $bindable(null),
		end = $bindable(null),
		view = $bindable(),
		months = 1,
		min = null,
		max = null,
		isDateDisabled,
		weekStartsOn = 1,
		weekendDays,
		locale,
		zone = "local",
		captionLayout = "label",
		yearRange,
		showWeekNumbers = false,
		showOutsideDays = true,
		fixedWeeks = false,
		showToday = false,
		showClear = false,
		disabled = false,
		focusOnMount = false,
		t = t_default,
		onSelect,
		onRangeChange,
		onViewChange,
		renderDay,
		footer,
		unstyled = false,
		class: classProp,
		classMonth: classMonthProp,
		classHeader: classHeaderProp,
		classCaption: classCaptionProp,
		classGrid: classGridProp,
		classWeekday: classWeekdayProp,
		classCell: classCellProp,
		classDay: classDayProp,
		classFooter: classFooterProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	const uid = getId("stuic-calendar-");

	// ---- selection (tolerates loose input, see normalizeIsoDate) --------------

	let _value = $derived(mode === "single" ? normalizeIsoDate(value) : null);
	let _start = $derived(mode === "range" ? normalizeIsoDate(start) : null);
	let _end = $derived(mode === "range" ? normalizeIsoDate(end) : null);
	let _min = $derived(normalizeIsoDate(min));
	let _max = $derived(normalizeIsoDate(max));
	// the first pick of a range, waiting for the second
	let anchor = $derived(mode === "range" && _start && !_end ? _start : null);
	let hasSelection = $derived(mode === "single" ? !!_value : !!(_start || _end));

	let _months = $derived(Math.max(1, Math.floor(months) || 1));

	// ---- view -------------------------------------------------------------------

	// One-time fallback for an unbound / unset `view`: the selection's month, else today.
	const initialView: YearMonth = untrack(() =>
		yearMonthOf((mode === "single" ? _value : _start) ?? todayIso(zone))
	);
	let currentView = $derived(view ?? initialView);
	let lastView = $derived(addMonths(currentView, _months - 1));

	function setView(ym: YearMonth) {
		if (compareYearMonth(ym, currentView) === 0) return;
		view = ym;
		onViewChange?.(ym);
	}

	function isVisibleYm(ym: YearMonth): boolean {
		return compareYearMonth(ym, currentView) >= 0 && compareYearMonth(ym, lastView) <= 0;
	}

	// Navigate so that `iso`'s month is on screen (as the first month when it lies
	// before the view, as the last one when it lies after it).
	function ensureVisible(iso: IsoDate) {
		const ym = yearMonthOf(iso);
		if (compareYearMonth(ym, currentView) < 0) setView(ym);
		else if (compareYearMonth(ym, lastView) > 0) setView(addMonths(ym, -(_months - 1)));
	}

	// An externally changed selection (model load / switch) is brought on screen.
	// Keyed on the selection so browsing away from it never snaps back.
	let lastSelectionKey: string | null = null;
	$effect(() => {
		const sel = mode === "single" ? _value : (_start ?? _end);
		const key = `${_value}|${_start}|${_end}`;
		untrack(() => {
			if (key === lastSelectionKey) return;
			lastSelectionKey = key;
			if (sel && !isVisibleYm(yearMonthOf(sel))) ensureVisible(sel);
		});
	});

	// ---- grids ------------------------------------------------------------------

	let today = $derived(todayIso(zone));
	let gridConfig = $derived({ zone, weekStartsOn, weekendDays });

	let monthViews = $derived.by(() =>
		Array.from({ length: _months }, (_, i) => {
			const ym = addMonths(currentView, i);
			return {
				ym,
				label: formatYearMonth(ym, locale),
				captionId: `${uid}-caption-${i}`,
				grid: buildMonthGrid(ym, gridConfig, fixedWeeks),
			};
		})
	);

	let weekdayShort = $derived(getWeekdayHeaders(weekStartsOn, "short", locale));
	let weekdayLong = $derived(getWeekdayHeaders(weekStartsOn, "long", locale));
	let monthNames = $derived(getMonthNames(locale, "long"));

	let yearOptions = $derived.by(() => {
		const thisYear = yearMonthOf(today).year;
		let from = yearRange?.[0] ?? (_min ? yearMonthOf(_min).year : thisYear - 100);
		let to = yearRange?.[1] ?? (_max ? yearMonthOf(_max).year : thisYear + 20);
		from = Math.min(from, currentView.year);
		to = Math.max(to, currentView.year);
		const out: number[] = [];
		for (let y = from; y <= to; y++) out.push(y);
		return out;
	});

	let prevDisabled = $derived(
		disabled || (!!_min && compareYearMonth(currentView, yearMonthOf(_min)) <= 0)
	);
	let nextDisabled = $derived(
		disabled || (!!_max && compareYearMonth(lastView, yearMonthOf(_max)) >= 0)
	);

	// ---- focus ------------------------------------------------------------------

	// The day the user last focused; drives the roving tabindex and keyboard stepping.
	let focusedIso = $state<IsoDate | null>(null);
	// Mouse hover, for the range preview.
	let hoverIso = $state<IsoDate | null>(null);

	// Exactly one visible, current-month day is in the tab order: the last focused
	// day if still on screen, else the selection, today, or the first of the month.
	let tabbableIso = $derived.by(() => {
		const visible = (iso: IsoDate | null): iso is IsoDate =>
			!!iso && isVisibleYm(yearMonthOf(iso));
		if (visible(focusedIso)) return focusedIso;
		for (const c of [_value, _start, _end, today]) if (visible(c)) return c;
		return firstOfMonth(currentView);
	});

	function dayButton(iso: IsoDate): HTMLButtonElement | null {
		if (!el) return null;
		return (
			el.querySelector<HTMLButtonElement>(
				`button[data-iso="${iso}"]:not([data-outside])`
			) ?? el.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]`)
		);
	}

	async function focusDay(iso: IsoDate) {
		iso = clampIso(iso, _min, _max);
		focusedIso = iso;
		ensureVisible(iso);
		await tick();
		dayButton(iso)?.focus();
	}

	function onDayKeydown(e: KeyboardEvent) {
		if (disabled || e.altKey || e.ctrlKey || e.metaKey) return;
		const current = (e.currentTarget as HTMLButtonElement).dataset.iso ?? tabbableIso;
		let next: IsoDate;
		switch (e.key) {
			case "ArrowLeft":
				next = addDaysIso(current, -1);
				break;
			case "ArrowRight":
				next = addDaysIso(current, 1);
				break;
			case "ArrowUp":
				next = addDaysIso(current, -7);
				break;
			case "ArrowDown":
				next = addDaysIso(current, 7);
				break;
			case "Home":
				next = addDaysIso(current, -weekdayColumn(current, weekStartsOn));
				break;
			case "End":
				next = addDaysIso(current, 6 - weekdayColumn(current, weekStartsOn));
				break;
			case "PageUp":
				next = addMonthsIso(current, e.shiftKey ? -12 : -1);
				break;
			case "PageDown":
				next = addMonthsIso(current, e.shiftKey ? 12 : 1);
				break;
			default:
				return;
		}
		e.preventDefault();
		focusDay(next);
	}

	// Dialog use: the grid has to become visible (showModal) before it can take focus.
	$effect(() => {
		if (!focusOnMount) return;
		let cancelled = false;
		let frames = 0;
		const attempt = () => {
			if (cancelled) return;
			const btn = el?.querySelector<HTMLElement>('button[data-iso][tabindex="0"]');
			const visible =
				!!btn &&
				(typeof btn.checkVisibility === "function" ? btn.checkVisibility() : true);
			if (btn && visible) {
				btn.focus();
				return;
			}
			if (++frames < 30) requestAnimationFrame(attempt);
		};
		requestAnimationFrame(attempt);
		return () => {
			cancelled = true;
		};
	});

	// ---- selection --------------------------------------------------------------

	function isDayDisabled(cell: DayCell): boolean {
		return (
			disabled ||
			!isWithinBounds(cell.iso, _min, _max) ||
			!!isDateDisabled?.(cell.iso, cell)
		);
	}

	function selectDay(cell: DayCell) {
		if (isDayDisabled(cell)) return;
		const iso = cell.iso;
		focusedIso = iso;
		hoverIso = null;
		if (mode === "single") {
			value = iso;
			onSelect?.(iso);
		} else if (anchor) {
			const [s, e] = orderedRange(anchor, iso);
			start = s;
			end = e;
			onRangeChange?.({ start: s, end: e, complete: true });
		} else {
			start = iso;
			end = null;
			onRangeChange?.({ start: iso, end: null, complete: false });
		}
		// a filler day of an adjacent month: bring that month on screen and keep focus
		if (!cell.isCurrentMonth) focusDay(iso);
	}

	function clearSelection() {
		if (disabled) return;
		if (mode === "single") {
			value = null;
			onSelect?.(null);
		} else {
			start = null;
			end = null;
			onRangeChange?.({ start: null, end: null, complete: false });
		}
	}

	// Range preview: anchor → hovered (mouse) or focused (keyboard) day.
	let previewRange = $derived.by((): [IsoDate, IsoDate] | null => {
		if (!anchor) return null;
		const other = hoverIso ?? focusedIso;
		if (!other || other === anchor) return null;
		return orderedRange(anchor, other);
	});

	function dayState(cell: DayCell): CalendarDayState {
		const iso = cell.iso;
		const rangeStart = mode === "range" && _start === iso;
		const rangeEnd = mode === "range" && _end === iso;
		const selected = mode === "single" ? _value === iso : rangeStart || rangeEnd;
		const inRange =
			mode === "range" &&
			!!_start &&
			!!_end &&
			!selected &&
			isWithinRange(iso, _start, _end);
		const preview =
			!!previewRange && isWithinRange(iso, previewRange[0], previewRange[1]);
		return {
			iso,
			day: cell.date.day,
			cell,
			selected,
			rangeStart,
			rangeEnd,
			inRange,
			preview,
			today: cell.isToday,
			outside: !cell.isCurrentMonth,
			weekend: cell.isWeekend,
			disabled: isDayDisabled(cell),
		};
	}

	// The continuous band painted on the cells: the committed range, or the preview.
	// `bandStart` / `bandEnd` round its outer corners.
	function bandState(iso: IsoDate) {
		const committed = !!_start && !!_end && isWithinRange(iso, _start, _end);
		const preview =
			!!previewRange && isWithinRange(iso, previewRange[0], previewRange[1]);
		const range = committed ? [_start!, _end!] : previewRange;
		return {
			committed,
			preview,
			bandStart: !!range && range[0] === iso,
			bandEnd: !!range && range[1] === iso,
		};
	}

	function dayLabel(s: CalendarDayState): string {
		const base = formatIsoDateLong(s.iso, locale);
		return s.today ? `${base}, ${t("day_today")}` : base;
	}

	let liveMessage = $derived.by(() => {
		if (mode === "range") {
			if (anchor) return t("select_end");
			if (_start && _end) {
				return t("selected_range", {
					start: formatIsoDateLong(_start, locale),
					end: formatIsoDateLong(_end, locale),
				});
			}
			return "";
		}
		return _value ? t("selected_date", { value: formatIsoDateLong(_value, locale) }) : "";
	});

	// ---- imperative API ---------------------------------------------------------

	/** Focus the day that is currently in the tab order. */
	export function focus(): void {
		(
			dayButton(tabbableIso) ??
			el?.querySelector<HTMLElement>('button[data-iso][tabindex="0"]')
		)?.focus();
	}

	/** Show the previous month. */
	export function prevMonth(): void {
		if (!prevDisabled) setView(addMonths(currentView, -1));
	}

	/** Show the next month. */
	export function nextMonth(): void {
		if (!nextDisabled) setView(addMonths(currentView, 1));
	}

	/** Show a specific month (1–12). */
	export function goToMonth(year: number, month: number): void {
		setView({ year, month });
	}

	/** Bring the month containing `iso` on screen. */
	export function goToDate(iso: IsoDate): void {
		const n = normalizeIsoDate(iso);
		if (n) ensureVisible(n);
	}

	/** Navigate to and focus today (does not select it). */
	export function goToToday(): void {
		if (disabled) return;
		const iso = todayIso(zone);
		setView(yearMonthOf(iso));
		focusDay(iso);
	}

	/** The first displayed month. */
	export function getView(): YearMonth {
		return currentView;
	}

	// ---- classes ----------------------------------------------------------------

	let _class = $derived(unstyled ? classProp : twMerge("stuic-calendar", classProp));
	let _classMonth = $derived(
		unstyled ? classMonthProp : twMerge("stuic-calendar-month", classMonthProp)
	);
	let _classHeader = $derived(
		unstyled ? classHeaderProp : twMerge("stuic-calendar-header", classHeaderProp)
	);
	let _classCaption = $derived(
		unstyled ? classCaptionProp : twMerge("stuic-calendar-caption", classCaptionProp)
	);
	let _classGrid = $derived(
		unstyled ? classGridProp : twMerge("stuic-calendar-grid", classGridProp)
	);
	let _classWeekday = $derived(
		unstyled ? classWeekdayProp : twMerge("stuic-calendar-weekday", classWeekdayProp)
	);
	let _classCell = $derived(
		unstyled ? classCellProp : twMerge("stuic-calendar-cell", classCellProp)
	);
	let _classDay = $derived(
		unstyled ? classDayProp : twMerge("stuic-calendar-day", classDayProp)
	);
	let _classFooter = $derived(
		unstyled ? classFooterProp : twMerge("stuic-calendar-footer", classFooterProp)
	);
	const sub = (name: string) => (unstyled ? undefined : `stuic-calendar-${name}`);
</script>

<div
	bind:this={el}
	class={_class}
	role="group"
	data-mode={mode}
	data-months={_months}
	data-disabled={disabled ? "" : undefined}
	aria-disabled={disabled ? "true" : undefined}
	{...rest}
>
	<div class={sub("months")}>
		{#each monthViews as mv, i (i)}
			<div class={_classMonth}>
				<div class={_classHeader}>
					{#if i === 0}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class={sub("nav")}
							nav={{ direction: "prev", icon: iconChevronLeft({ size: 20 }) }}
							aria-label={t("prev_month")}
							tooltip={t("prev_month")}
							disabled={prevDisabled}
							onclick={prevMonth}
						/>
					{:else}
						<span class={sub("nav-placeholder")} aria-hidden="true"></span>
					{/if}

					<div class={_classCaption} id={mv.captionId}>
						{#if captionLayout === "dropdown" && i === 0}
							<label class="sr-only" for="{uid}-month">{t("month")}</label>
							<select
								id="{uid}-month"
								class={sub("select")}
								{disabled}
								onchange={(e) =>
									setView({
										year: currentView.year,
										month: Number(e.currentTarget.value),
									})}
							>
								{#each monthNames as name, m (m)}
									<option value={m + 1} selected={m + 1 === currentView.month}>
										{name}
									</option>
								{/each}
							</select>
							<label class="sr-only" for="{uid}-year">{t("year")}</label>
							<select
								id="{uid}-year"
								class={sub("select")}
								{disabled}
								onchange={(e) =>
									setView({
										year: Number(e.currentTarget.value),
										month: currentView.month,
									})}
							>
								{#each yearOptions as y (y)}
									<option value={y} selected={y === currentView.year}>{y}</option>
								{/each}
							</select>
						{:else}
							{mv.label}
						{/if}
					</div>

					{#if i === _months - 1}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class={sub("nav")}
							nav={{ direction: "next", icon: iconChevronRight({ size: 20 }) }}
							aria-label={t("next_month")}
							tooltip={t("next_month")}
							disabled={nextDisabled}
							onclick={nextMonth}
						/>
					{:else}
						<span class={sub("nav-placeholder")} aria-hidden="true"></span>
					{/if}
				</div>

				<table class={_classGrid} role="grid" aria-labelledby={mv.captionId}>
					<thead>
						<tr>
							{#if showWeekNumbers}
								<th scope="col" class={_classWeekday}>{t("week")}</th>
							{/if}
							{#each weekdayShort as name, d (d)}
								<th scope="col" class={_classWeekday} aria-label={weekdayLong[d]}>
									{name}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each mv.grid as week (week[0].iso)}
							<tr>
								{#if showWeekNumbers}
									<th
										scope="row"
										class={sub("week-number")}
										aria-label={t("week_number", { value: week[0].weekNumber })}
									>
										{week[0].weekNumber}
									</th>
								{/if}
								{#each week as cell (cell.iso)}
									{@const s = dayState(cell)}
									{@const band = bandState(cell.iso)}
									{@const hidden = s.outside && !showOutsideDays}
									<td
										role="gridcell"
										class={_classCell}
										aria-selected={!hidden && s.selected ? "true" : undefined}
										data-in-range={!hidden && band.committed ? "" : undefined}
										data-preview={!hidden && band.preview ? "" : undefined}
										data-band-start={!hidden && band.bandStart ? "" : undefined}
										data-band-end={!hidden && band.bandEnd ? "" : undefined}
										data-outside={s.outside ? "" : undefined}
									>
										{#if !hidden}
											<button
												type="button"
												class={_classDay}
												tabindex={cell.isCurrentMonth && cell.iso === tabbableIso
													? 0
													: -1}
												aria-label={dayLabel(s)}
												aria-disabled={s.disabled ? "true" : undefined}
												aria-current={s.today ? "date" : undefined}
												data-iso={s.iso}
												data-selected={s.selected ? "" : undefined}
												data-range-start={s.rangeStart ? "" : undefined}
												data-range-end={s.rangeEnd ? "" : undefined}
												data-in-range={s.inRange ? "" : undefined}
												data-preview={s.preview ? "" : undefined}
												data-today={s.today ? "" : undefined}
												data-outside={s.outside ? "" : undefined}
												data-weekend={s.weekend ? "" : undefined}
												onclick={() => selectDay(cell)}
												onkeydown={onDayKeydown}
												onfocus={() => (focusedIso = cell.iso)}
												onpointerenter={(e) => {
													if (e.pointerType === "mouse") hoverIso = cell.iso;
												}}
												onpointerleave={() => {
													if (hoverIso === cell.iso) hoverIso = null;
												}}
											>
												{#if renderDay}
													{@render renderDay(s)}
												{:else}
													{s.day}
												{/if}
											</button>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</div>

	{#if showToday || showClear || footer}
		<div class={_classFooter}>
			<div class={sub("footer-actions")}>
				{#if showToday}
					<Button type="button" variant="ghost" size="sm" {disabled} onclick={goToToday}>
						{t("today")}
					</Button>
				{/if}
				{#if showClear}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={disabled || !hasSelection}
						onclick={clearSelection}
					>
						{t("clear")}
					</Button>
				{/if}
			</div>
			{#if footer}
				<div class={sub("footer-actions")}>
					{@render footer()}
				</div>
			{/if}
		</div>
	{/if}

	<div class="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</div>
</div>
