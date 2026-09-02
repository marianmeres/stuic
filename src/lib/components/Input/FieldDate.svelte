<!--
	FieldDate — pick a single calendar date.

	The bound `value` is an ISO `YYYY-MM-DD` string (or null). The user picks it in
	a `Calendar`, either in a dialog opened from a trigger button that shows the
	formatted date (default), or inline inside the field (`embedded`). The `name`
	goes on a hidden input carrying the ISO value, so a <form> submits
	`2026-09-02` regardless of how the date is displayed.

	Loose input (`"2026-09-02T10:00:00Z"`, a `Date`) is normalized to its calendar
	date for display and submission; garbage is submitted as-is so the validator
	can flag it. `required` / `min` / `max` / `isDateDisabled` are enforced in the
	validator because a hidden input never validates natively.
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { Props as CalendarProps } from "../Calendar/Calendar.svelte";
	import type { IsoDate } from "../Calendar/iso-date.js";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** The `Calendar` props a date field lifts to its own top level. */
	export type FieldDateCalendarProps = Pick<
		CalendarProps,
		| "min"
		| "max"
		| "isDateDisabled"
		| "weekStartsOn"
		| "weekendDays"
		| "zone"
		| "captionLayout"
		| "yearRange"
		| "showWeekNumbers"
		| "showOutsideDays"
		| "fixedWeeks"
		| "showToday"
		| "renderDay"
	>;

	export interface Props extends InputWrapClassProps, FieldDateCalendarProps {
		/** The selected date as `YYYY-MM-DD` (bindable). `null` / `""` = empty. */
		value?: IsoDate | null;
		/** Form field name — applied to the hidden input carrying the ISO date. */
		name?: string;
		/** Render the calendar inline inside the field instead of a trigger + dialog. */
		embedded?: boolean;
		/** Close the dialog right after a date is picked. Default `true`. */
		closeOnSelect?: boolean;
		/** Trigger text while empty. Defaults to `t("placeholder_date")`. */
		placeholder?: string;
		/** Offer clearing (trailing × on the trigger / "Clear" in the embedded footer). Default `true`. */
		clearable?: boolean;
		/** BCP 47 locale of the display text and the calendar names. Browser default when omitted. */
		locale?: string;
		/** `Intl.DateTimeFormat` options of the display text. Default `{ dateStyle: "medium" }`. */
		formatOptions?: Intl.DateTimeFormatOptions;
		/** Custom display formatter (wins over `formatOptions`). */
		format?: (iso: IsoDate) => string;
		/** Months the calendar shows side by side. Default `1`. */
		months?: number;
		/** Anything else for the inner `Calendar` (class hooks, `view`, …). Applied last. */
		calendarProps?: Partial<CalendarProps>;
		/** The hidden input (bindable). */
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
		 * Validation. `false` disables the built-in guard (required / valid ISO / min /
		 * max / disabled dates); an options object is merged with it (your
		 * `customValidator` runs after the built-in checks pass). Default: the guard.
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
		/** Called after the value changed through the picker or the × (not on external writes). */
		onChange?: (value: IsoDate | null) => void;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import Button from "../Button/Button.svelte";
	import Calendar from "../Calendar/Calendar.svelte";
	import { t_default } from "../Calendar/calendar-i18n.js";
	import {
		compareIso,
		dayCellOf,
		DEFAULT_DATE_FORMAT,
		formatIsoDate,
		normalizeIsoDate,
	} from "../Calendar/iso-date.js";
	import FieldDateShell from "./_internal/FieldDateShell.svelte";

	let {
		value = $bindable(null),
		name,
		embedded = false,
		closeOnSelect = true,
		placeholder,
		clearable = true,
		locale,
		formatOptions,
		format,
		months = 1,
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

	let normalized = $derived(normalizeIsoDate(value));
	let _min = $derived(normalizeIsoDate(min));
	let _max = $derived(normalizeIsoDate(max));

	// What the form submits: the normalized date — or the raw (unparseable) value,
	// so the validator can flag it instead of silently submitting "".
	let submitValue = $derived(normalized ?? (value == null ? "" : `${value}`));

	const fmt = (iso: IsoDate): string =>
		format
			? format(iso)
			: formatIsoDate(iso, locale, formatOptions ?? DEFAULT_DATE_FORMAT);

	let display = $derived(normalized ? fmt(normalized) : "");

	function commit(next: IsoDate | null) {
		value = next;
		onChange?.(next);
		// let the hidden input's value flush before the validate action reads it
		tick().then(() => shell?.dispatchChange());
	}

	function onSelect(next: IsoDate | null) {
		commit(next);
		if (!embedded && closeOnSelect && next) shell?.close();
	}

	// Built-in guard (a hidden input never validates natively): required, a valid
	// ISO date, min / max, disabled dates. Consumer opts are honored: `false`
	// disables; an object is merged (its customValidator runs after the guard).
	const validateOpts = $derived.by<
		boolean | Omit<ValidateOptions, "setValidationResult">
	>(() => {
		if (validateProp === false) return false;
		const custom = validateProp && typeof validateProp === "object" ? validateProp : {};
		return {
			...custom,
			customValidator: (val, ctx, el) => {
				const str = `${val ?? ""}`.trim();
				if (!str) {
					if (required) return t("field_req_att");
					return custom.customValidator?.(val, ctx, el) || "";
				}
				const iso = normalizeIsoDate(str);
				if (!iso) return t("date_invalid");
				if (_min && compareIso(iso, _min) < 0) {
					return t("date_before_min", { value: fmt(_min) });
				}
				if (_max && compareIso(iso, _max) > 0) {
					return t("date_after_max", { value: fmt(_max) });
				}
				if (isDateDisabled?.(iso, dayCellOf(iso, { zone, weekendDays }))) {
					return t("date_disabled");
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
	placeholder={placeholder ?? t("placeholder_date")}
	{clearable}
	clearLabel={t("clear_value")}
	{embedded}
	inputs={[{ name, value: submitValue }]}
	validate={validateOpts}
	dialogTitle={t("dialog_title_date")}
	closeLabel={t("close")}
	{noScrollLock}
	{classInput}
	{classDialog}
	onClear={() => commit(null)}
>
	<Calendar
		mode="single"
		value={normalized}
		{months}
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
		{onSelect}
		{...calendarProps}
	/>
</FieldDateShell>
