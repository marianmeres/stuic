<!--
	FieldDateRange — pick an inclusive date range (`start` … `end`).

	Both bound ends are ISO `YYYY-MM-DD` strings (or null). The user picks them in
	a range-mode `Calendar` — first pick anchors, second completes, order-agnostic —
	in a dialog opened from a trigger showing the formatted range (default), or
	inline inside the field (`embedded`). Two hidden inputs (`nameStart`, `nameEnd`)
	carry the ISO values into FormData.

	A half range (start without end) is displayed ("Sep 1, 2026 – …") but fails
	validation, whether or not the field is `required`.
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { Props as CalendarProps } from "../Calendar/Calendar.svelte";
	import type { IsoDate } from "../Calendar/iso-date.js";
	import type { FieldDateCalendarProps } from "./FieldDate.svelte";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** Payload of `onChange`. */
	export interface FieldDateRangeValue {
		start: IsoDate | null;
		end: IsoDate | null;
	}

	export interface Props extends InputWrapClassProps, FieldDateCalendarProps {
		/** Range start as `YYYY-MM-DD` (bindable). */
		start?: IsoDate | null;
		/** Range end as `YYYY-MM-DD` (bindable). */
		end?: IsoDate | null;
		/** Form field name of the hidden input carrying `start`. */
		nameStart?: string;
		/** Form field name of the hidden input carrying `end`. */
		nameEnd?: string;
		/** Render the calendar inline inside the field instead of a trigger + dialog. */
		embedded?: boolean;
		/** Close the dialog once the range is complete. Default `true`. */
		closeOnSelect?: boolean;
		/** Trigger text while empty. Defaults to `t("placeholder_range")`. */
		placeholder?: string;
		/** Offer clearing (trailing × on the trigger / "Clear" in the embedded footer). Default `true`. */
		clearable?: boolean;
		/** BCP 47 locale of the display text and the calendar names. Browser default when omitted. */
		locale?: string;
		/** `Intl.DateTimeFormat` options of the display text. Default `{ dateStyle: "medium" }`. */
		formatOptions?: Intl.DateTimeFormatOptions;
		/** Custom display formatter for a complete range (wins over `formatOptions`). */
		format?: (start: IsoDate, end: IsoDate) => string;
		/**
		 * Months the calendar shows side by side at the `md` breakpoint and up (below
		 * it always a single month). Default `2`.
		 */
		months?: number;
		/** Anything else for the inner `Calendar` (class hooks, `view`, …). Applied last. */
		calendarProps?: Partial<CalendarProps>;
		/** The first (start) hidden input (bindable). */
		input?: HTMLInputElement;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		/**
		 * Validation. `false` disables the built-in guard (required / complete range /
		 * valid ISO / min / max / disabled dates); an options object is merged with it
		 * (your `customValidator` runs after the built-in checks pass). Default: the guard.
		 */
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Classes for the trigger button */
		classInput?: string;
		/** Classes for the dialog box */
		classDialog?: string;
		style?: string;
		noScrollLock?: boolean;
		/** i18n — see `createCalendarT`. */
		t?: TranslateFn;
		/** Called after either end changed through the picker or the × (not on external writes). */
		onChange?: (range: FieldDateRangeValue) => void;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { Breakpoint } from "../../utils/breakpoint.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import Button from "../Button/Button.svelte";
	import Calendar, { type CalendarRangeChange } from "../Calendar/Calendar.svelte";
	import { t_default } from "../Calendar/calendar-i18n.js";
	import {
		compareIso,
		dayCellOf,
		DEFAULT_DATE_FORMAT,
		formatIsoDate,
		formatIsoDateRange,
		normalizeIsoDate,
	} from "../Calendar/iso-date.js";
	import FieldDateShell from "./_internal/FieldDateShell.svelte";

	let {
		start = $bindable(null),
		end = $bindable(null),
		nameStart,
		nameEnd,
		embedded = false,
		closeOnSelect = true,
		placeholder,
		clearable = true,
		locale,
		formatOptions,
		format,
		months = 2,
		calendarProps,
		input = $bindable(),
		label = "",
		description,
		labelAfter,
		below,
		class: classProp,
		id = getId(),
		tabindex = 0,
		renderSize = "md",
		required = false,
		disabled = false,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		classInput,
		classDialog,
		style,
		noScrollLock = false,
		t = t_default,
		onChange,
		// calendar
		min,
		max,
		isDateDisabled,
		weekStartsOn,
		weekendDays,
		zone,
		captionLayout,
		yearRange,
		showWeekNumbers,
		showOutsideDays,
		fixedWeeks,
		showToday,
		renderDay,
		// wrapper class props
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
	}: Props = $props();

	let shell: FieldDateShell | undefined = $state();

	const bp = Breakpoint.instance;
	// two months only fit from the md breakpoint up; phones always get one
	let effectiveMonths = $derived(bp.md ? months : 1);

	let _start = $derived(normalizeIsoDate(start));
	let _end = $derived(normalizeIsoDate(end));
	let _min = $derived(normalizeIsoDate(min));
	let _max = $derived(normalizeIsoDate(max));

	// Submitted values: the normalized dates, or the raw (unparseable) input so the
	// validator can flag it instead of silently submitting "".
	const raw = (v: IsoDate | null | undefined) => (v == null ? "" : `${v}`);
	let submitStart = $derived(_start ?? raw(start));
	let submitEnd = $derived(_end ?? raw(end));

	const opts = $derived(formatOptions ?? DEFAULT_DATE_FORMAT);
	const fmt = (iso: IsoDate): string => formatIsoDate(iso, locale, opts);

	let display = $derived.by(() => {
		if (_start && _end) {
			return format
				? format(_start, _end)
				: formatIsoDateRange(_start, _end, locale, opts);
		}
		if (_start) return `${fmt(_start)} – …`;
		if (_end) return `… – ${fmt(_end)}`;
		return "";
	});

	function commit(s: IsoDate | null, e: IsoDate | null) {
		start = s;
		end = e;
		onChange?.({ start: s, end: e });
		// let the hidden inputs flush before the validate action reads them
		tick().then(() => shell?.dispatchChange());
	}

	function onRangeChange(r: CalendarRangeChange) {
		commit(r.start, r.end);
		if (!embedded && closeOnSelect && r.complete) shell?.close();
	}

	// Built-in guard (hidden inputs never validate natively): required, a complete
	// range, valid ISO dates, min / max, disabled dates. Consumer opts are honored:
	// `false` disables; an object is merged (its customValidator runs after the guard).
	const validateOpts = $derived.by<
		boolean | Omit<ValidateOptions, "setValidationResult">
	>(() => {
		if (validateProp === false) return false;
		const custom = validateProp && typeof validateProp === "object" ? validateProp : {};
		return {
			...custom,
			// `val` is the start hidden input's value; the end is read from state.
			customValidator: (val, ctx, el) => {
				const s = `${val ?? ""}`.trim();
				const e = submitEnd.trim();
				if (!s && !e) {
					if (required) return t("field_req_att");
					return custom.customValidator?.(val, ctx, el) || "";
				}
				if (!s || !e) return t("range_incomplete");
				const sIso = normalizeIsoDate(s);
				const eIso = normalizeIsoDate(e);
				if (!sIso || !eIso) return t("date_invalid");
				if (compareIso(sIso, eIso) > 0) return t("range_incomplete");
				for (const iso of [sIso, eIso]) {
					if (_min && compareIso(iso, _min) < 0) {
						return t("date_before_min", { value: fmt(_min) });
					}
					if (_max && compareIso(iso, _max) > 0) {
						return t("date_after_max", { value: fmt(_max) });
					}
					if (isDateDisabled?.(iso, dayCellOf(iso, { zone, weekendDays }))) {
						return t("date_disabled");
					}
				}
				return custom.customValidator?.(val, ctx, el) || "";
			},
		};
	});

	// ---- Imperative API (satisfies ValidatableField), forwarded to the shell ----

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		return shell?.validate();
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		shell?.clearValidation();
	}

	/** Current validation state, or undefined if the validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return shell?.getValidation();
	}

	/** Focus the trigger (or the embedded calendar's tabbable day). */
	export function focus(): void {
		shell?.focus();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		shell?.scrollIntoView(opts);
	}

	/** Open the picker dialog (no-op when `embedded`). */
	export function open(): void {
		shell?.open();
	}

	/** Close the picker dialog. */
	export function close(): void {
		shell?.close();
	}
</script>

{#snippet doneFooter()}
	<Button type="button" size="sm" intent="primary" onclick={() => shell?.close()}>
		{t("done")}
	</Button>
{/snippet}

<FieldDateShell
	bind:this={shell}
	bind:input
	{id}
	{label}
	{description}
	{labelAfter}
	{below}
	class={classProp}
	{style}
	{renderSize}
	{required}
	{disabled}
	{tabindex}
	{labelLeft}
	{labelLeftWidth}
	{labelLeftBreakpoint}
	{classLabel}
	{classLabelBox}
	{classInputBox}
	{classInputBoxWrap}
	{classInputBoxWrapInvalid}
	{classDescBox}
	{classDescBoxToggle}
	{classBelowBox}
	{classValidationBox}
	{display}
	placeholder={placeholder ?? t("placeholder_range")}
	{clearable}
	clearLabel={t("clear_value")}
	{embedded}
	inputs={[
		{ name: nameStart, value: submitStart },
		{ name: nameEnd, value: submitEnd },
	]}
	validate={validateOpts}
	dialogTitle={t("dialog_title_range")}
	closeLabel={t("close")}
	{noScrollLock}
	{classInput}
	{classDialog}
	onClear={() => commit(null, null)}
>
	<Calendar
		mode="range"
		start={_start}
		end={_end}
		months={effectiveMonths}
		{min}
		{max}
		{isDateDisabled}
		{weekStartsOn}
		{weekendDays}
		{zone}
		{locale}
		{captionLayout}
		{yearRange}
		{showWeekNumbers}
		{showOutsideDays}
		{fixedWeeks}
		{showToday}
		showClear={embedded && clearable}
		{renderDay}
		{disabled}
		{t}
		focusOnMount={!embedded}
		aria-labelledby={embedded && label ? `${id}-label` : undefined}
		footer={!embedded && !closeOnSelect ? doneFooter : undefined}
		{onRangeChange}
		{...calendarProps}
	/>
</FieldDateShell>
