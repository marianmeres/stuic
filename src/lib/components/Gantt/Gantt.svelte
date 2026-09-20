<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { Weekday } from "@marianmeres/calendar-utils";
	import type { THC } from "../Thc/Thc.svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type {
		GanttAxis,
		GanttColumn,
		GanttDateInput,
		GanttGroup,
		GanttPlacement,
		GanttUnit,
	} from "./gantt-geometry.js";

	/** Where a bar's own label is drawn. */
	export type GanttBarLabels = "inside" | "after" | "none";

	/** One bar (or milestone) on a row's track. */
	export interface GanttBar {
		/** Stable key — falls back to the index, which is fine for a static list. */
		id?: string;
		/** First day, inclusive. `YYYY-MM-DD`, or a `Date` (its **local** calendar date). */
		from: GanttDateInput;
		/** Last day, **inclusive**. Omitted = a single day. */
		to?: GanttDateInput;
		/** Text on the bar (see `barLabels`) */
		label?: THC;
		/** Semantic color */
		intent?: IntentColorKey;
		/** `0`–`1` — a darker fill from the bar's start ("% complete") */
		progress?: number;
		/** Draw a diamond at `from` instead of a bar (`to` is ignored) */
		milestone?: boolean;
		/** Draw thinner and on top — an emphasis range inside a wider bar of the same row */
		inset?: boolean;
		/** Renders the bar as a link */
		href?: string;
		/** Native tooltip (`title`) — the cheap way to show the detail a bar has no room for */
		title?: string;
		/** Not clickable, dimmed */
		disabled?: boolean;
		/** Additional classes for this bar */
		class?: string;
		/** Anything of yours — handed back by `onSelect` */
		data?: unknown;
	}

	/** One lane of the chart: a label on the left, any number of bars on its track. */
	export interface GanttRow {
		/** Stable key — falls back to the index */
		id?: string;
		/** The left column's primary line */
		label?: THC;
		/** Secondary line under the label */
		description?: THC;
		/** The row's bars — one for a classic task, several for a resource lane */
		bars: GanttBar[];
		/** Renders the row label as a link */
		href?: string;
		/** Anything of yours — handed back by `onSelect` */
		data?: unknown;
	}

	/** What `onSelect` (and the `renderBar` snippet) receives. */
	export interface GanttSelectDetail {
		bar: GanttBar;
		row: GanttRow;
		rowIndex: number;
		barIndex: number;
		/** The bar's track geometry, or `null` for a milestone (see `point`) */
		placement: GanttPlacement | null;
		/** A milestone's 0..1 position on the track, or `null` for a bar */
		point: number | null;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** The lanes, in display order (sort them yourself) */
		rows: GanttRow[];
		/** Window start, inclusive. Default: the earliest date in `rows` */
		from?: GanttDateInput;
		/** Window end, inclusive. Default: the latest date in `rows` */
		to?: GanttDateInput;
		/** Column granularity. `week`/`month` snap the window outwards to whole units */
		unit?: GanttUnit;
		/** First day of a week for `unit="week"` (1 = Monday … 7 = Sunday) */
		weekStartsOn?: Weekday;
		/** BCP 47 tag for month/weekday names and the default `aria-label`s */
		locale?: string;
		/** The day the marker line sits on. `null` removes it. Default: today */
		today?: GanttDateInput | null;
		/**
		 * MINIMUM column width in px (the horizontal zoom). The chart always fills its
		 * parent; when the axis needs less than that, the columns share out the rest.
		 * When it needs more, the frame scrolls horizontally.
		 *
		 * `"fit"` drops the minimum: the columns always divide the available width, so
		 * the chart never scrolls horizontally however many of them there are.
		 *
		 * Default: the `--stuic-gantt-unit-width` token.
		 */
		unitWidth?: number | "fit";
		/** Show the left label column. Default: whenever any row has a label */
		labels?: boolean;
		/** Where a bar's own `label` is drawn */
		barLabels?: GanttBarLabels;
		/** Fires on a bar click (and Enter/Space) — also what makes bars focusable */
		onSelect?: (detail: GanttSelectDetail) => void;
		/** Override a unit cell's header text */
		formatColumn?: (column: GanttColumn, axis: GanttAxis) => string;
		/** Override a group cell's header text (the month over its days, the year over its months) */
		formatGroup?: (group: GanttGroup, axis: GanttAxis) => string;
		/** Override a bar's accessible name */
		formatBarAria?: (detail: GanttSelectDetail) => string;
		/** Override the whole bar body (progress, label) */
		renderBar?: Snippet<[GanttSelectDetail]>;
		/** Override the left column's cell */
		renderRowLabel?: Snippet<[{ row: GanttRow; index: number }]>;
		/** The header's top-left cell (above the labels) */
		renderCorner?: Snippet<[{ axis: GanttAxis }]>;
		/** Shown in place of the rows when `rows` is empty (the axis still renders) */
		empty?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for the sticky header */
		classHeader?: string;
		/** Class for every row */
		classRow?: string;
		/** Class for every left-column cell */
		classRowLabel?: string;
		/** Class for every row's track */
		classTrack?: string;
		/** Class for every bar */
		classBar?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";
	import {
		formatIsoDate,
		formatIsoDateRange,
		normalizeIsoDate,
		todayIso,
		addDaysIso,
	} from "../Calendar/iso-date.js";
	import { boundsOf, buildGanttAxis, placePoint, placeRange } from "./gantt-geometry.js";

	let {
		rows,
		from,
		to,
		unit = "day",
		weekStartsOn = 1,
		locale,
		today,
		unitWidth,
		labels,
		barLabels = "inside",
		onSelect,
		formatColumn,
		formatGroup,
		formatBarAria,
		renderBar,
		renderRowLabel,
		renderCorner,
		empty,
		unstyled = false,
		class: classProp,
		classHeader: classHeaderProp,
		classRow: classRowProp,
		classRowLabel: classRowLabelProp,
		classTrack: classTrackProp,
		classBar: classBarProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	const cx = (base: string, extra?: string) => (unstyled ? extra : twMerge(base, extra));

	let _class = $derived(cx("stuic-gantt", classProp));
	let _classHeader = $derived(cx("stuic-gantt-head", classHeaderProp));
	let _classRow = $derived(cx("stuic-gantt-row", classRowProp));
	let _classRowLabel = $derived(cx("stuic-gantt-row-label", classRowLabelProp));
	let _classTrack = $derived(cx("stuic-gantt-track", classTrackProp));

	let _today = $derived(
		today === null ? null : (normalizeIsoDate(today ?? todayIso()) ?? null)
	);

	// The window: explicit ends win, the rows' own extent fills the rest, and with
	// neither (no rows at all) a month from today — an axis is still a useful answer.
	let _window = $derived.by(() => {
		const explicitFrom = from === undefined ? null : normalizeIsoDate(from);
		const explicitTo = to === undefined ? null : normalizeIsoDate(to);
		if (explicitFrom && explicitTo) return { from: explicitFrom, to: explicitTo };
		const bounds = boundsOf(rows.flatMap((r) => r.bars ?? []));
		const fallback = _today ?? todayIso();
		return {
			from: explicitFrom ?? bounds?.from ?? fallback,
			to: explicitTo ?? bounds?.to ?? addDaysIso(fallback, 29),
		};
	});

	let axis = $derived(
		buildGanttAxis(_window.from, _window.to, {
			unit,
			weekStartsOn,
			locale,
			today: _today,
		})
	);

	let todayAt = $derived(_today ? placePoint(_today, axis) : null);

	let showLabels = $derived(labels ?? rows.some((r) => r.label !== undefined));

	interface PlacedBar extends GanttSelectDetail {
		key: string | number;
	}

	let placed = $derived.by(() =>
		rows.map((row, rowIndex) => ({
			row,
			rowIndex,
			key: row.id ?? rowIndex,
			bars: (row.bars ?? []).reduce<PlacedBar[]>((acc, bar, barIndex) => {
				const point = bar.milestone ? placePoint(bar.from, axis) : null;
				const placement = bar.milestone
					? null
					: placeRange(bar.from, bar.to ?? bar.from, axis);
				// Off-window (or undatable) bars are dropped rather than pinned to an
				// edge, where a hairline reads as "starts today".
				if (point === null && placement === null) return acc;
				acc.push({
					bar,
					row,
					rowIndex,
					barIndex,
					placement,
					point,
					key: bar.id ?? barIndex,
				});
				return acc;
			}, []),
		}))
	);

	// 4 decimals is sub-pixel at any realistic track width; the unary + drops the
	// trailing zeros so the style attribute stays readable ("20%", not "20.0000%").
	const pct = (n: number) => `${+(n * 100).toFixed(4)}%`;

	function columnLabel(c: GanttColumn) {
		return formatColumn ? formatColumn(c, axis) : c.label;
	}

	function groupLabel(g: GanttGroup) {
		return formatGroup ? formatGroup(g, axis) : g.label;
	}

	function barAria(d: PlacedBar): string {
		if (formatBarAria) return formatBarAria(d);
		// Only plain-string labels can become an accessible name; an html/component
		// THC is markup, and `title` is the documented way out of that.
		const name = [d.row.label, d.bar.label]
			.filter((v): v is string => typeof v === "string" && v !== "")
			.join(" – ");
		const a = normalizeIsoDate(d.bar.from);
		const b = normalizeIsoDate(d.bar.to ?? d.bar.from);
		const when = !a
			? ""
			: !b || a === b || d.bar.milestone
				? formatIsoDate(a, locale)
				: formatIsoDateRange(a, b, locale);
		return [name, when].filter(Boolean).join(": ");
	}

	function barTag(bar: GanttBar) {
		if (bar.disabled) return "span";
		if (bar.href) return "a";
		return onSelect ? "button" : "span";
	}
</script>

{#snippet barBody(d: PlacedBar)}
	{#if renderBar}
		{@render renderBar(d)}
	{:else}
		{#if !d.bar.milestone && d.bar.progress !== undefined}
			<span
				class={unstyled ? undefined : "stuic-gantt-bar-progress"}
				style:width={pct(Math.min(1, Math.max(0, d.bar.progress)))}
			></span>
		{/if}
		{#if d.bar.label !== undefined && barLabels !== "none"}
			<span class={unstyled ? undefined : "stuic-gantt-bar-label"}>
				<Thc thc={d.bar.label} />
			</span>
		{/if}
	{/if}
{/snippet}

<div
	bind:this={el}
	class={_class}
	data-unit={unit}
	data-fit={unitWidth === "fit" ? "" : undefined}
	data-labels={showLabels ? "" : undefined}
	data-bar-labels={barLabels}
	style:--stuic-gantt-unit-width={typeof unitWidth === "number"
		? `${unitWidth}px`
		: undefined}
	style:--_gantt-columns={axis.columns.length}
	{...rest}
>
	<div class={unstyled ? undefined : "stuic-gantt-viewport"}>
		<div class={unstyled ? undefined : "stuic-gantt-inner"}>
			<div class={_classHeader}>
				{#if showLabels}
					<div class={unstyled ? undefined : "stuic-gantt-corner"}>
						{@render renderCorner?.({ axis })}
					</div>
				{/if}
				<div class={unstyled ? undefined : "stuic-gantt-axis"}>
					<div class={unstyled ? undefined : "stuic-gantt-groups"}>
						{#each axis.groups as group (group.key)}
							<div
								class={unstyled ? undefined : "stuic-gantt-group"}
								style:--_gantt-span={group.span}
								data-group={group.key}
							>
								<span>{groupLabel(group)}</span>
							</div>
						{/each}
					</div>
					<div class={unstyled ? undefined : "stuic-gantt-units"}>
						{#each axis.columns as column (column.date)}
							<div
								class={unstyled ? undefined : "stuic-gantt-unit"}
								data-date={column.date}
								data-weekend={column.isWeekend ? "" : undefined}
								data-today={column.isToday ? "" : undefined}
							>
								<span class={unstyled ? undefined : "stuic-gantt-unit-label"}>
									{columnLabel(column)}
								</span>
								{#if column.subLabel && !formatColumn}
									<span class={unstyled ? undefined : "stuic-gantt-unit-sub"}>
										{column.subLabel}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class={unstyled ? undefined : "stuic-gantt-body"}>
				<!-- One grid layer for the whole body: the alternative is a cell per
				     row per column, which is rows×columns nodes for the same pixels. -->
				<div class={unstyled ? undefined : "stuic-gantt-grid"} aria-hidden="true">
					{#each axis.columns as column (column.date)}
						<div
							class={unstyled ? undefined : "stuic-gantt-gridline"}
							data-weekend={column.isWeekend ? "" : undefined}
							data-today={column.isToday ? "" : undefined}
						></div>
					{/each}
					{#if todayAt !== null}
						<div
							class={unstyled ? undefined : "stuic-gantt-today"}
							style:left={pct(todayAt)}
							data-today-marker
						></div>
					{/if}
				</div>

				{#each placed as line (line.key)}
					<div class={_classRow} data-row-id={line.row.id}>
						{#if showLabels}
							<div class={_classRowLabel}>
								{#if renderRowLabel}
									{@render renderRowLabel({ row: line.row, index: line.rowIndex })}
								{:else}
									{#if line.row.label !== undefined}
										<span class={unstyled ? undefined : "stuic-gantt-row-title"}>
											{#if line.row.href}
												<a
													href={line.row.href}
													class={unstyled ? undefined : "stuic-gantt-row-link"}
												>
													<Thc thc={line.row.label} />
												</a>
											{:else}
												<Thc thc={line.row.label} />
											{/if}
										</span>
									{/if}
									{#if line.row.description !== undefined}
										<span class={unstyled ? undefined : "stuic-gantt-row-description"}>
											<Thc thc={line.row.description} />
										</span>
									{/if}
								{/if}
							</div>
						{/if}
						<div class={_classTrack}>
							{#each line.bars as d (d.key)}
								{@const tag = barTag(d.bar)}
								<svelte:element
									this={tag}
									class={cx("stuic-gantt-bar", twMerge(classBarProp, d.bar.class))}
									href={tag === "a" ? d.bar.href : undefined}
									type={tag === "button" ? "button" : undefined}
									role={tag === "span" ? "img" : undefined}
									aria-label={barAria(d)}
									aria-disabled={d.bar.disabled ? "true" : undefined}
									title={d.bar.title}
									data-kind={d.bar.milestone ? "milestone" : "bar"}
									data-intent={d.bar.intent}
									data-inset={d.bar.inset ? "" : undefined}
									data-disabled={d.bar.disabled ? "" : undefined}
									data-clipped-start={d.placement?.clippedStart ? "" : undefined}
									data-clipped-end={d.placement?.clippedEnd ? "" : undefined}
									style:left={pct(d.point ?? d.placement!.start)}
									style:width={d.placement
										? pct(d.placement.end - d.placement.start)
										: undefined}
									onclick={d.bar.disabled || !onSelect ? undefined : () => onSelect(d)}
								>
									{@render barBody(d)}
								</svelte:element>
							{/each}
						</div>
					</div>
				{:else}
					{#if empty}
						<div class={unstyled ? undefined : "stuic-gantt-empty"}>
							{@render empty()}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
