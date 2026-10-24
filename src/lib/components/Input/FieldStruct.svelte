<!--
	FieldStruct — a form control whose value is ONE RECORD with a fixed, typed set
	of fields (an address, a venue, a set of dimensions, a contact block). Each
	field is a labelled typed input; the bound `value` is a live plain object, no
	string round trip. The one-record, vertical sibling of FieldTable: the same
	"fields declared by data" idea, the same shared cells (`_internal/FieldCell`),
	the same `cell` escape hatch, the same hidden-input `Field*` contract.

	Only one `<input type="hidden" name>` posts (JSON); every inner control is
	nameless, and `required` + the cell rules are enforced by the component's own
	validator (a hidden input is barred from native constraint validation). No
	control carries `required` / `pattern` / `min` / `max` or a validating `type`,
	so a control scrolled out of view can never make the browser refuse a submit
	without a message — the flip side is that a host submitting natively must
	call `validate()` first.

	Value semantics: the record never gains a key the component invented, keys
	not in `fields` ride through untouched, and a field cleared to blank REMOVES
	its key (an untouched or emptied struct is `{}`), except `checkbox`, which
	writes `false` when toggled off.
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { MaybeLocalized } from "../../utils/tr.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { FieldCellDef, FieldCellType } from "./_internal/field-cell.js";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** The field types `FieldStruct` renders itself (the shared `FieldCell` set). */
	export type FieldStructCellType = FieldCellType;

	/**
	 * One field: the shared cell declaration (`key`, `type`, `label`, `options`, `unit`,
	 * `placeholder`, `maxLength`, the `country` options) plus what a single record needs.
	 */
	export interface FieldStructField extends FieldCellDef {
		/** A hint line under the control, wired through `aria-describedby`. */
		description?: MaybeLocalized;
		/** This field must be non-blank. */
		required?: boolean;
		/** Extra per-field rule, run after the built-in one. Return a message to fail. */
		validate?: (
			value: unknown,
			record: Record<string, unknown>
		) => string | undefined | void;
	}

	/** What the `cell` snippet receives for a field whose `type` is not built in. */
	export interface FieldStructCellContext {
		field: FieldStructField;
		record: Record<string, unknown>;
		value: unknown;
		setValue: (next: unknown) => void;
		/** The id the field's `<label for>` points at. Put it on your control. */
		id: string;
		disabled: boolean;
		invalid: boolean;
		describedby: string | undefined;
	}

	export type FieldStructValue = Record<string, unknown>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/** Bindable. The record — a live object, no string round trip. */
		value: FieldStructValue;
		/** The hidden input carrying `JSON.stringify(value)`. */
		name: string;
		/** One entry per field, in order. */
		fields: FieldStructField[];
		/** At least one field is non-blank. (Per-field `required` is on the field.) */
		required?: boolean;
		/** Render the record as a description list: no inputs, the hidden input still posts. */
		readonly?: boolean;
		/** The `tr()` fallback chain used to resolve field, option and hint texts. */
		displayLanguage?: string | string[];
		/** Decimal separator of number fields; language of country names. Default: the browser's. */
		locale?: string;
		/** Renders any field whose `type` is not built in. */
		cell?: Snippet<[FieldStructCellContext]>;
		/** Fired after every change. */
		onChange?: (value: FieldStructValue) => void;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		style?: string;
		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import { DEFAULT_LOCALE, getName, hasLocale, loadLocale } from "@marianmeres/countries";
	import { tick } from "svelte";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { tr } from "../../utils/tr.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import DescriptionList, {
		type DescriptionListItem,
	} from "../DescriptionList/DescriptionList.svelte";
	import FieldCell from "./_internal/FieldCell.svelte";
	import {
		cellRawText,
		cellRule,
		countryLocaleOf,
		isBlankCellValue,
		isBuiltInCellType,
		isCountryCode,
		isHttpUrl,
	} from "./_internal/field-cell.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import { t_default } from "./field-struct-i18n.js";
	import { formatCellNumber } from "./field-table-number.js";

	let {
		value = $bindable(),
		name,
		fields,
		required = false,
		readonly = false,
		displayLanguage,
		locale,
		cell,
		onChange,
		label,
		description,
		class: classProp,
		id = getId(),
		tabindex = 0,
		renderSize = "md",
		disabled = false,
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		labelAfter,
		below,
		labelLeft,
		labelLeftWidth,
		labelLeftBreakpoint,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		style,
		t = t_default,
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// fields
	// ---------------------------------------------------------------------------

	// A duplicate key would make the keyed #each throw `each_key_duplicate` and take
	// the host form down: the first occurrence wins, later ones are skipped.
	const uniqueFields = $derived.by(() => {
		const seen = new Set<string>();
		const out: FieldStructField[] = [];
		for (const f of fields ?? []) {
			if (seen.has(f.key)) {
				console.warn(`FieldStruct: duplicate field key "${f.key}" ignored`);
				continue;
			}
			seen.add(f.key);
			out.push(f);
		}
		return out;
	});

	/** Field label for display; an empty label falls back to the key. */
	function fieldLabel(f: FieldStructField): string {
		return tr(f.label, displayLanguage) || f.key;
	}

	const fieldId = (key: string) => `${id}-${key}`;

	// ---------------------------------------------------------------------------
	// record + value sync (FieldTable architecture: the internal record is the
	// source of truth; an external reassignment that does not round-trip rebuilds
	// it). A non-object `value` renders every field empty and is NOT rewritten on
	// mount — a mount must never dirty the host form; the first edit emits an object.
	// ---------------------------------------------------------------------------

	function fromValue(v: unknown): FieldStructValue {
		return isPlainObject(v) ? JSON.parse(JSON.stringify(v)) : {};
	}

	let record: FieldStructValue = $state(fromValue(value));

	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let rootEl: HTMLElement | undefined = $state();

	/** Fields that were blurred — their inline error may show before validate(). */
	let touched: Record<string, boolean> = $state({});

	function syncToValue() {
		value = JSON.parse(JSON.stringify(record));
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
		onChange?.(value);
	}

	$effect(() => {
		const external = JSON.stringify(isPlainObject(value) ? value : {});
		const internal = JSON.stringify(record);
		if (external !== internal) {
			record = fromValue(value);
			touched = {};
		}
	});

	// a blank removes the key — an untouched or emptied struct is `{}`, never four
	// empty strings; `checkbox` has no blank, it writes what it is
	function setField(f: FieldStructField, next: unknown) {
		if (f.type !== "checkbox" && isBlankCellValue(next)) delete record[f.key];
		else record[f.key] = next;
		syncToValue();
	}

	function markTouched(key: string) {
		touched[key] = true;
	}

	// ---------------------------------------------------------------------------
	// validation: per field in declaration order (`required`, then the shared cell
	// rule, `maxLength`, `field.validate`), then the component-level `required`,
	// then the host's customValidator — the top-most problem is the one reported
	// and focused
	// ---------------------------------------------------------------------------

	interface FieldError {
		message: string;
		/** The `required` rule failed (the summary wording differs). */
		blank: boolean;
	}

	const fieldErrors: Record<string, FieldError> = $derived.by(() => {
		const errs: Record<string, FieldError> = {};
		for (const f of uniqueFields) {
			const v = record[f.key];
			if (f.required && isBlankCellValue(v)) {
				errs[f.key] = { message: String(t("err_required")), blank: true };
				continue;
			}
			const m = cellRule(f, v, record, t);
			if (m) errs[f.key] = { message: m, blank: false };
		}
		return errs;
	});

	const firstFieldError = $derived.by(() => {
		for (const f of uniqueFields) {
			const e = fieldErrors[f.key];
			if (e) return { f, ...e };
		}
		return undefined;
	});

	const allBlank = $derived(uniqueFields.every((f) => isBlankCellValue(record[f.key])));

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	/** Inline field errors render once validation has run (or the field was blurred). */
	const attempted = $derived(validation !== undefined);

	function shownError(key: string): string | undefined {
		const e = fieldErrors[key];
		if (!e) return undefined;
		return attempted || touched[key] ? e.message : undefined;
	}

	/** Trigger validation now. Scrolls to and focuses the first invalid field. */
	export function validate(): ValidationResult | undefined {
		_doValidate?.();
		if (validation && !validation.valid) focusFirstInvalid();
		return validation;
	}

	/** Clear the inline validation message and reset `setCustomValidity`. */
	export function clearValidation(): void {
		validation = undefined;
		hiddenInputEl?.setCustomValidity?.("");
	}

	/** Current validation state, or undefined if validator has never run. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	const FOCUSABLE =
		':is(input, select, textarea, button, [tabindex]):not([disabled]):not([tabindex="-1"])';

	function fieldControl(key: string): HTMLElement | null {
		return rootEl?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(key))}`) ?? null;
	}

	/** Focus the first control. */
	export function focus(): void {
		rootEl?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		rootEl?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}

	function focusFirstInvalid() {
		const first = firstFieldError;
		tick().then(() => {
			const el = first ? fieldControl(first.f.key) : null;
			if (el) {
				el.scrollIntoView?.({ behavior: "smooth", block: "center" });
				el.focus();
			} else {
				scrollIntoView();
				focus();
			}
		});
	}

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: validateProp !== false,
		customValidator(val: unknown, context: Record<string, unknown> | undefined, el: any) {
			const first = firstFieldError;
			if (first) {
				const field = fieldLabel(first.f);
				return first.blank
					? String(t("err_field_required", { field }))
					: String(t("err_field", { field, message: first.message }));
			}
			if (required && allBlank) return String(t("err_struct_required"));
			return (validateProp as any)?.customValidator?.(val, context, el) || "";
		},
		setValidationResult,
		setDoValidate: (fn: () => void) => (_doValidate = fn),
	});

	// ---------------------------------------------------------------------------
	// read-only: the record as a description list, every value formatted the way
	// its control would show it — never a raw key where a label exists
	// ---------------------------------------------------------------------------

	const hasCountryField = $derived(uniqueFields.some((f) => f.type === "country"));

	// Reactive marker: bumps once the requested locale is registered, so the
	// derived names below recompute (the registry is plain module state).
	let localeLoaded = $state(DEFAULT_LOCALE);
	$effect(() => {
		if (!readonly || !hasCountryField) return;
		const code = countryLocaleOf(locale) ?? DEFAULT_LOCALE;
		if (hasLocale(code)) {
			localeLoaded = code;
			return;
		}
		let cancelled = false;
		loadLocale(code)
			.then(() => {
				if (!cancelled) localeLoaded = code;
			})
			.catch(() => {
				if (!cancelled) localeLoaded = DEFAULT_LOCALE;
			});
		return () => {
			cancelled = true;
		};
	});

	function countryText(f: FieldStructField, iso: string): string {
		void localeLoaded; // establish reactive dependency on locale load
		const code = iso.toUpperCase();
		const name = f.countryNames?.[code] ?? getName(code, countryLocaleOf(locale)) ?? code;
		if (f.flags === false) return name;
		const flag = getFlag(code);
		return flag ? `${flag} ${name}` : name;
	}

	// regional indicator pair — what @marianmeres/countries' `Country.flag` is
	function getFlag(code: string): string {
		if (!/^[A-Z]{2}$/.test(code)) return "";
		return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
	}

	function readonlyText(f: FieldStructField, v: unknown): string | undefined {
		if (isBlankCellValue(v)) return undefined;
		switch (f.type) {
			case "number":
				if (typeof v !== "number") return cellRawText(v);
				return f.unit
					? `${formatCellNumber(v, locale)} ${f.unit}`
					: formatCellNumber(v, locale);
			case "select": {
				const o = (f.options ?? []).find((o) => o.value === v);
				return o ? tr(o.label, displayLanguage) || o.value : cellRawText(v);
			}
			case "checkbox":
				if (v === true) return String(t("yes"));
				if (v === false) return String(t("no"));
				return cellRawText(v);
			case "country":
				return isCountryCode(v) ? countryText(f, v) : cellRawText(v);
			default:
				return typeof v === "string" ? v : cellRawText(v);
		}
	}

	const readonlyItems: DescriptionListItem[] = $derived(
		uniqueFields.map((f) => {
			const v = record[f.key];
			const item: DescriptionListItem = {
				key: f.key,
				label: fieldLabel(f),
				value: readonlyText(f, v),
			};
			if (f.type === "url" && typeof v === "string" && isHttpUrl(v)) item.href = v;
			return item;
		})
	);

	const LABEL_CLS = "stuic-field-struct-label";
	const REQUIRED_CLS = "after:content-['*'] after:opacity-40 after:pl-1";
</script>

{#snippet control(
	f: FieldStructField,
	fid: string,
	v: unknown,
	invalid: boolean,
	describedby: string | undefined
)}
	{#if isBuiltInCellType(f.type)}
		<FieldCell
			def={f}
			value={v}
			id={fid}
			{disabled}
			{tabindex}
			{invalid}
			{describedby}
			{locale}
			{displayLanguage}
			{renderSize}
			{t}
			onValue={(next) => setField(f, next)}
			onBlur={() => markTouched(f.key)}
		/>
	{:else if cell}
		{@render cell({
			field: f,
			record,
			value: v,
			setValue: (next) => setField(f, next),
			id: fid,
			disabled,
			invalid,
			describedby,
		})}
	{:else}
		<!-- unknown type without a `cell` snippet: shown read-only, round-trips -->
		<div id={fid} class="stuic-field-cell-readonly">{cellRawText(v)}</div>
	{/if}
{/snippet}

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{below}
	{required}
	{disabled}
	size={renderSize}
	class={classProp}
	{labelLeft}
	{labelLeftWidth}
	{labelLeftBreakpoint}
	{classLabel}
	{classLabelBox}
	{classInputBox}
	classInputBoxWrap={twMerge(
		classInputBoxWrap,
		readonly && "stuic-field-struct-wrap-readonly"
	)}
	{classInputBoxWrapInvalid}
	{classDescBox}
	{classDescBoxToggle}
	{classBelowBox}
	{classValidationBox}
	{validation}
	{style}
>
	<div
		class="stuic-field-struct w-full min-w-0"
		data-readonly={readonly || undefined}
		bind:this={rootEl}
	>
		{#if readonly}
			<DescriptionList
				items={readonlyItems}
				layout="auto"
				columnsFrom="sm"
				class="stuic-field-struct-list"
			/>
		{:else}
			{#each uniqueFields as f (f.key)}
				{@const fid = fieldId(f.key)}
				{@const v = record[f.key]}
				{@const err = shownError(f.key)}
				{@const invalid = !!err}
				{@const hint = tr(f.description, displayLanguage)}
				{@const describedby =
					[hint && `${fid}-desc`, invalid && `${fid}-err`].filter(Boolean).join(" ") ||
					undefined}
				<div
					class="stuic-field-struct-field"
					data-type={f.type}
					data-key={f.key}
					data-invalid={invalid || undefined}
				>
					{#if f.type === "checkbox"}
						<!-- a lone checkbox reads best with its label beside it -->
						<div class="stuic-field-struct-check">
							{@render control(f, fid, v, invalid, describedby)}
							<label for={fid} class={twMerge(LABEL_CLS, f.required && REQUIRED_CLS)}>
								{fieldLabel(f)}
							</label>
						</div>
					{:else}
						<label for={fid} class={twMerge(LABEL_CLS, f.required && REQUIRED_CLS)}>
							{fieldLabel(f)}{#if f.unit}{" "}<span class="sr-only">({f.unit})</span>{/if}
						</label>
						{@render control(f, fid, v, invalid, describedby)}
					{/if}
					{#if hint}
						<div id="{fid}-desc" class="stuic-field-struct-hint">{hint}</div>
					{/if}
					{#if invalid}
						<div id="{fid}-err" class="stuic-field-struct-error">{err}</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</InputWrap>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	value={JSON.stringify(isPlainObject(value) ? value : {})}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
