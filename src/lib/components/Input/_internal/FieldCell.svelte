<!--
	FieldCell — one typed control of a data-declared record, shared by FieldTable
	(a cell of a row) and FieldStruct (a field of the record). It renders the
	control only: the host owns the label, the inline error, the `cell` snippet
	for unknown types and every validation decision. The host learns about a
	change through `onValue` and about a commit / blur through `onBlur`.

	No control carries `required` / `pattern` / `min` / `max` or a validating
	`type` — the hidden-input `Field*` contract: a control the user cannot see
	must never make the browser refuse a submit without a message.

	The chrome is Tailwind utilities on purpose: the `.stuic-input input` base
	rule (border 0, transparent bg) outranks any component-layer selector, and
	utilities are the one layer above it. Size and padding come from the
	`.stuic-input[data-size]` rules for free.
-->
<script lang="ts">
	import type { TranslateFn } from "../../../types.js";
	import { tr } from "../../../utils/tr.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import FieldCountry from "../FieldCountry.svelte";
	import { formatCellNumber, parseCellNumber } from "../field-table-number.js";
	import {
		cellRawText,
		cellText,
		countryLocaleOf,
		isBlankCellValue,
		selectHasValue,
		type FieldCellDef,
	} from "./field-cell.js";

	interface Props {
		def: FieldCellDef;
		value: unknown;
		/** The id the host's `<label for>` points at. */
		id: string;
		disabled?: boolean;
		tabindex?: number;
		invalid?: boolean;
		describedby?: string;
		/** Decimal separator of number cells; country names' language. */
		locale?: string;
		/** `tr()` chain for placeholders and option labels. */
		displayLanguage?: string | string[];
		/** `country` only (the other controls size through `.stuic-input[data-size]`). */
		renderSize?: "sm" | "md" | "lg" | string;
		/** The host's catalog; `country` reads `country_search_placeholder` / `country_no_results`. */
		t: TranslateFn;
		/** Fired with the typed value on every change. */
		onValue: (next: unknown) => void;
		/** Fired when the control is blurred (the host's "touched" signal). */
		onBlur?: () => void;
	}

	let {
		def,
		value,
		id,
		disabled = false,
		tabindex = 0,
		invalid = false,
		describedby,
		locale,
		displayLanguage,
		renderSize = "sm",
		t,
		onValue,
		onBlur,
	}: Props = $props();

	const placeholder = $derived(tr(def.placeholder, displayLanguage) || undefined);

	// ---------------------------------------------------------------------------
	// text / url: written as typed, trimmed on commit (`change`), not while typing
	// ---------------------------------------------------------------------------

	function onTextInput(e: Event) {
		onValue((e.currentTarget as HTMLInputElement).value);
	}

	function onTextChange(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value;
		const trimmed = raw.trim();
		if (trimmed !== raw) onValue(trimmed);
	}

	// ---------------------------------------------------------------------------
	// number: the parsed number (or `null` for blank) is written on every
	// keystroke; what does not parse is kept AS TYPED and left for the host's rule
	// to flag. The draft keeps the input showing exactly the typed text ("4." must
	// not snap to "4" mid-typing); blur drops it, so the value is then shown
	// formatted for `locale`.
	// ---------------------------------------------------------------------------

	let draft: string | undefined = $state();

	const numberText = $derived.by(() => {
		if (draft !== undefined) return draft;
		if (typeof value === "number") return formatCellNumber(value, locale);
		return cellText(value);
	});

	function onNumberInput(e: Event) {
		const raw = (e.currentTarget as HTMLInputElement).value;
		draft = raw;
		const parsed = parseCellNumber(raw, locale);
		onValue(parsed.ok ? parsed.value : raw);
	}

	function onNumberBlur() {
		draft = undefined;
		onBlur?.();
	}

	// ---------------------------------------------------------------------------
	// country: the full FieldCountry, label-less and nameless (no hidden input of
	// its own, no validation of its own). Its chrome is an InputWrap box, which is
	// what the other controls imitate with the utilities below.
	// ---------------------------------------------------------------------------

	const countryT: TranslateFn = (k, _values, fallback) => {
		if (k === "checkout.address.country_search_placeholder") {
			return String(t("country_search_placeholder"));
		}
		if (k === "checkout.address.country_no_results") {
			return String(t("country_no_results"));
		}
		return typeof fallback === "string" ? fallback : "";
	};

	const INPUT_CLS = [
		"stuic-field-cell",
		"rounded bg-(--stuic-input-bg) text-(--stuic-input-text)",
		"border border-(--stuic-input-border)",
		"focus:border-(--stuic-input-border-focus)",
		"focus:outline-none focus:ring-0",
		"focus-visible:outline-none focus-visible:ring-0",
		"aria-invalid:border-(--stuic-field-cell-invalid-color)",
		"disabled:opacity-50",
	].join(" ");
</script>

{#if def.type === "text" || def.type === "url"}
	<input
		type="text"
		inputmode={def.type === "url" ? "url" : undefined}
		{id}
		class={INPUT_CLS}
		value={cellText(value)}
		{placeholder}
		maxlength={def.maxLength}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		{disabled}
		{tabindex}
		oninput={onTextInput}
		onchange={onTextChange}
		onblur={onBlur}
	/>
{:else if def.type === "number"}
	<div class="stuic-field-cell-number">
		<input
			type="text"
			inputmode="decimal"
			{id}
			class={twMerge(INPUT_CLS, "min-w-0")}
			value={numberText}
			{placeholder}
			aria-invalid={invalid || undefined}
			aria-describedby={describedby}
			{disabled}
			{tabindex}
			oninput={onNumberInput}
			onblur={onNumberBlur}
		/>
		{#if def.unit}
			<span class="stuic-field-cell-unit" aria-hidden="true">{def.unit}</span>
		{/if}
	</div>
{:else if def.type === "select"}
	<select
		{id}
		class={INPUT_CLS}
		value={cellText(value)}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		{disabled}
		{tabindex}
		onchange={(e) => onValue(e.currentTarget.value)}
		onblur={onBlur}
	>
		<option value="">{tr(def.placeholder, displayLanguage)}</option>
		{#each def.options ?? [] as o (o.value)}
			<option value={o.value}>{tr(o.label, displayLanguage) || o.value}</option>
		{/each}
		{#if !isBlankCellValue(value) && !selectHasValue(def, value)}
			<!-- a stored value outside the choices: shown as its own entry so it
			     round-trips instead of being silently coerced away -->
			<option value={cellText(value)}>{cellRawText(value)}</option>
		{/if}
	</select>
{:else if def.type === "checkbox"}
	<span class="stuic-checkbox stuic-field-cell-checkbox">
		<input
			type="checkbox"
			{id}
			checked={value === true}
			aria-invalid={invalid || undefined}
			aria-describedby={describedby}
			{disabled}
			{tabindex}
			onchange={(e) => onValue(e.currentTarget.checked)}
			onblur={onBlur}
		/>
	</span>
{:else if def.type === "date"}
	<input
		type="date"
		{id}
		class={INPUT_CLS}
		value={typeof value === "string" ? value : ""}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		{disabled}
		{tabindex}
		oninput={(e) => onValue(e.currentTarget.value)}
		onblur={onBlur}
	/>
{:else if def.type === "country"}
	<!-- `id` lands on the trigger button (so the host label reaches it); the
	     aria attributes ride through FieldCountry's rest props onto the same
	     button. Opening the list moves focus into its search box, which would
	     read as a blur, so `onBlur` is deliberately not wired here. -->
	<FieldCountry
		{id}
		class="stuic-field-cell-country mb-0 w-full"
		classInputBoxWrap="focus-within:shadow-none"
		value={typeof value === "string" ? value : ""}
		countryList={def.countryList}
		preferredCountries={def.preferredCountries}
		countryNames={def.countryNames}
		flags={def.flags ?? true}
		locale={countryLocaleOf(locale) ?? undefined}
		{placeholder}
		{renderSize}
		{disabled}
		{tabindex}
		validate={false}
		labelLeftBreakpoint={0}
		t={countryT}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		onChange={(iso) => onValue(iso)}
	/>
{/if}
