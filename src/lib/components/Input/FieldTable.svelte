<!--
	FieldTable — a form control whose value is a LIST OF RECORDS with a fixed, typed
	set of columns (a bill of materials, a price list, opening hours...). Each row is
	a line of typed inputs; the bound `value` is a live array of plain row objects.

	The hidden-input `Field*` contract (FieldKeyValues / FieldsBuilder): only one
	`<input type="hidden" name>` posts (JSON), every inner control is nameless, and
	`required` + the cell rules are enforced by the component's own validator (a
	hidden input is barred from native constraint validation). No cell control
	carries `required` / `pattern` / `min` / `max` or a validating `type`, so a cell
	scrolled out of view can never make the browser refuse a submit without a
	message — the flip side is that a host submitting natively must call
	`validate()` first.

	Row identity lives in an index-aligned `meta` list (OptionsEditor pattern), so a
	row object never gains a key the component invented, and keys that are not in
	`columns` ride through untouched. One DOM for both layouts: a real <table>,
	restyled into stacked cards by a container query on the component's OWN width
	(see index.css), so crossing the breakpoint keeps focus and caret.
-->
<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { FieldCellDef, FieldCellType } from "./_internal/field-cell.js";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	/** The cell types `FieldTable` renders itself (the shared `FieldCell` set). */
	export type FieldTableCellType = FieldCellType;

	/**
	 * One column: the shared cell declaration (`key`, `type`, `label`, `options`, `unit`,
	 * `placeholder`, `maxLength`, the `country` options) plus the row-flavoured rule.
	 * The unit also shows in the header ("Qty (pcs)").
	 */
	export interface FieldTableColumn extends FieldCellDef {
		/** Extra per-cell rule, run after the built-in one. Return a message to fail. */
		validate?: (
			value: unknown,
			row: Record<string, unknown>
		) => string | undefined | void;
	}

	/** What the `cell` snippet receives for a column whose `type` is not built in. */
	export interface FieldTableCellContext {
		column: FieldTableColumn;
		row: Record<string, unknown>;
		rowIndex: number;
		value: unknown;
		setValue: (next: unknown) => void;
		/** The id the cell's `<label for>` points at. Put it on your control. */
		id: string;
		disabled: boolean;
		invalid: boolean;
		describedby: string | undefined;
	}

	export type FieldTableRow = Record<string, unknown>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/** Bindable. The rows — a live array, no string round trip. */
		value: FieldTableRow[];
		/** The hidden input carrying `JSON.stringify(value)`. */
		name: string;
		/** One entry per cell, in order. */
		columns: FieldTableColumn[];
		/** "Add row" is disabled at the cap; a seeded list above it is a validation error. */
		maxRows?: number;
		/** At least one row. */
		required?: boolean;
		/** The `tr()` fallback chain used to resolve column and option labels. */
		displayLanguage?: string | string[];
		/** Decimal separator of number cells (input and display). Default: the browser's. */
		locale?: string;
		/** `auto` switches on the component's OWN width (container query). */
		layout?: "auto" | "table" | "stacked";
		/** `sm` 32rem, `md` 40rem, `lg` 48rem, `xl` 56rem; ignored unless `layout="auto"`. */
		tableFrom?: "sm" | "md" | "lg" | "xl";
		/** Move up / move down buttons per row. Default `true`. */
		reorderable?: boolean;
		/** What "Add row" inserts. Default: one empty value per column. */
		newRow?: () => FieldTableRow;
		/** Renders any column whose `type` is not built in. */
		cell?: Snippet<[FieldTableCellContext]>;
		addLabel?: string;
		emptyMessage?: string;
		/** Fired after every change. */
		onChange?: (value: FieldTableRow[]) => void;
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
	import { tick } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { iconArrowDown, iconArrowUp, iconPlus, iconTrash } from "../../icons/index.js";
	import { getId } from "../../utils/get-id.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { tr } from "../../utils/tr.js";
	import FieldCell from "./_internal/FieldCell.svelte";
	import {
		cellRawText,
		cellRule,
		emptyCellValue,
		isBuiltInCellType,
	} from "./_internal/field-cell.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import { t_default } from "./field-table-i18n.js";

	let {
		value = $bindable(),
		name,
		columns,
		maxRows,
		required = false,
		displayLanguage,
		locale,
		layout = "auto",
		tableFrom = "md",
		reorderable = true,
		newRow,
		cell,
		addLabel,
		emptyMessage,
		onChange,
		label,
		description,
		class: classProp,
		id = getId(),
		tabindex = 0,
		renderSize = "sm",
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
	// columns
	// ---------------------------------------------------------------------------

	// A duplicate key would make the keyed #each throw `each_key_duplicate` and take
	// the host form down: the first occurrence wins, later ones are skipped.
	const uniqueColumns = $derived.by(() => {
		const seen = new Set<string>();
		const out: FieldTableColumn[] = [];
		for (const c of columns ?? []) {
			if (seen.has(c.key)) {
				console.warn(`FieldTable: duplicate column key "${c.key}" ignored`);
				continue;
			}
			seen.add(c.key);
			out.push(c);
		}
		return out;
	});

	/** Column label for display; an empty label falls back to the key. */
	function colLabel(c: FieldTableColumn): string {
		return tr(c.label, displayLanguage) || c.key;
	}

	// ---------------------------------------------------------------------------
	// rows + identity (OptionsEditor pattern: meta is index-aligned with rows and
	// every mutation below keeps them in lockstep; the #each is keyed by rid so a
	// move carries the DOM — and focus — along)
	// ---------------------------------------------------------------------------

	interface RowMeta {
		rid: string;
	}

	function fromValue(v: unknown): unknown[] {
		return Array.isArray(v) ? JSON.parse(JSON.stringify(v)) : [];
	}

	const initialRows = fromValue(value);
	let rows: unknown[] = $state(initialRows);
	let meta: RowMeta[] = $state(initialRows.map(() => ({ rid: getId("r") })));

	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let rootEl: HTMLElement | undefined = $state();
	let addBtnEl: HTMLButtonElement | undefined = $state();
	let liveAnnouncement = $state("");

	/** Cells that were blurred — their inline error may show before validate(). */
	let touched: Record<string, boolean> = $state({});

	const cellKey = (rid: string, key: string) => `${rid}:${key}`;
	const cellId = (rid: string, key: string) => `${id}-${rid}-${key}`;

	const maxReached = $derived(!!maxRows && rows.length >= maxRows);
	const showActions = $derived(!disabled);
	const canMove = $derived(reorderable && rows.length > 1);

	// ---------------------------------------------------------------------------
	// value sync (FieldKeyValues / FieldsBuilder architecture: internal rows are the
	// source of truth; an external reassignment that does not round-trip rebuilds
	// them). A non-array `value` renders as zero rows and is NOT rewritten on mount —
	// a mount must never dirty the host form; the first edit emits an array.
	// ---------------------------------------------------------------------------

	function syncToValue() {
		value = JSON.parse(JSON.stringify(rows));
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
		onChange?.(value);
	}

	$effect(() => {
		const external = JSON.stringify(Array.isArray(value) ? value : []);
		const internal = JSON.stringify(rows);
		if (external !== internal) {
			rows = fromValue(value);
			meta = rows.map(() => ({ rid: getId("r") }));
			touched = {};
		}
	});

	// ---------------------------------------------------------------------------
	// mutations
	// ---------------------------------------------------------------------------

	function setCell(r: number, key: string, next: unknown) {
		const row = rows[r];
		if (!isPlainObject(row)) return;
		(row as FieldTableRow)[key] = next;
		syncToValue();
	}

	function addRow() {
		if (disabled || maxReached || !uniqueColumns.length) return;
		const row =
			newRow?.() ??
			Object.fromEntries(uniqueColumns.map((c) => [c.key, emptyCellValue(c.type)]));
		const m: RowMeta = { rid: getId("r") };
		rows = [...rows, row];
		meta = [...meta, m];
		syncToValue();
		announce("added_row", { row: rows.length });
		tick().then(() => focusRowFirstCell(m.rid));
	}

	function removeRow(idx: number) {
		rows = rows.filter((_, i) => i !== idx);
		meta = meta.filter((_, i) => i !== idx);
		syncToValue();
		announce("removed_row", { row: idx + 1 });
		tick().then(() => {
			const next = meta[idx] ?? meta[idx - 1];
			if (next) focusRowFirstCell(next.rid);
			else addBtnEl?.focus();
		});
	}

	function moveRow(from: number, to: number) {
		if (to < 0 || to >= rows.length || from === to) return;
		const nextRows = [...rows];
		const [movedRow] = nextRows.splice(from, 1);
		nextRows.splice(to, 0, movedRow);
		rows = nextRows;
		const nextMeta = [...meta];
		const [movedMeta] = nextMeta.splice(from, 1);
		nextMeta.splice(to, 0, movedMeta);
		meta = nextMeta;
		syncToValue();
		announce("moved_row", { position: to + 1, total: rows.length });
		focusRowButton(movedMeta.rid, to < from ? "up" : "down");
	}

	// clear-then-set so repeated identical announcements still get read out
	function announce(key: string, values: Record<string, string | number>) {
		liveAnnouncement = "";
		const msg = String(t(key, values));
		tick().then(() => (liveAnnouncement = msg));
	}

	// ---------------------------------------------------------------------------
	// focus helpers
	// ---------------------------------------------------------------------------

	const FOCUSABLE =
		':is(input, select, textarea, button, [tabindex]):not([disabled]):not([tabindex="-1"])';

	function rowEl(rid: string): HTMLElement | null {
		return rootEl?.querySelector<HTMLElement>(`tr[data-rid="${rid}"]`) ?? null;
	}

	function cellControl(rid: string, key: string): HTMLElement | null {
		return rootEl?.querySelector<HTMLElement>(`#${CSS.escape(cellId(rid, key))}`) ?? null;
	}

	function focusRowFirstCell(rid: string) {
		const row = rowEl(rid);
		if (!row) return;
		const el =
			row.querySelector<HTMLElement>(`td:not(.stuic-field-table-actions) ${FOCUSABLE}`) ??
			row.querySelector<HTMLElement>(FOCUSABLE);
		el?.focus();
	}

	// same pattern as OptionsEditor.focusOptionButton: re-focus the pressed logical
	// button on the moved row; at a boundary fall back to its enabled sibling
	function focusRowButton(rid: string, which: "up" | "down") {
		tick().then(() => {
			const row = rowEl(rid);
			if (!row) return;
			let btn = row.querySelector<HTMLButtonElement>(`[data-ft-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					row.querySelector<HTMLButtonElement>(`[data-ft-btn="up"]:not([disabled])`) ||
					row.querySelector<HTMLButtonElement>(`[data-ft-btn="down"]:not([disabled])`);
			}
			btn?.focus();
		});
	}

	// ---------------------------------------------------------------------------
	// validation (display + input handling live in the shared FieldCell; the
	// per-type rule in field-cell.ts)
	// ---------------------------------------------------------------------------

	function markTouched(rid: string, key: string) {
		touched[cellKey(rid, key)] = true;
	}

	/** Index-aligned with `rows`: `{ [columnKey]: message }` or null. */
	const rowErrors: (Record<string, string> | null)[] = $derived(
		rows.map((row) => {
			if (!isPlainObject(row)) return null;
			let errs: Record<string, string> | null = null;
			for (const c of uniqueColumns) {
				const m = cellRule(c, (row as FieldTableRow)[c.key], row as FieldTableRow, t);
				if (m) (errs ??= {})[c.key] = m;
			}
			return errs;
		})
	);

	/** The first invalid cell, in row-major order. */
	const firstCellError = $derived.by(() => {
		for (let r = 0; r < rowErrors.length; r++) {
			const errs = rowErrors[r];
			if (!errs) continue;
			for (const c of uniqueColumns) {
				if (errs[c.key]) return { r, c, message: errs[c.key] };
			}
		}
		return undefined;
	});

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	/** Inline cell errors render once validation has run (or the cell was blurred). */
	const attempted = $derived(validation !== undefined);

	function cellError(r: number, c: FieldTableColumn): string | undefined {
		return rowErrors[r]?.[c.key];
	}

	function showCellError(r: number, c: FieldTableColumn): boolean {
		if (!cellError(r, c)) return false;
		return attempted || !!touched[cellKey(meta[r]?.rid ?? "", c.key)];
	}

	/** Trigger validation now. Scrolls to and focuses the first invalid cell. */
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

	/** Focus the first cell, or "Add row" when there are no rows. */
	export function focus(): void {
		const first = meta[0];
		if (first) focusRowFirstCell(first.rid);
		else addBtnEl?.focus();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		rootEl?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}

	function focusFirstInvalid() {
		const first = firstCellError;
		tick().then(() => {
			if (first) {
				const el = cellControl(meta[first.r]?.rid ?? "", first.c.key);
				el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
				el?.focus();
			} else {
				scrollIntoView();
				focus();
			}
		});
	}

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: validateProp !== false,
		customValidator(val: unknown, context: Record<string, unknown> | undefined, el: any) {
			if (required && rows.length === 0) return String(t("err_rows_required"));
			if (maxRows && rows.length > maxRows) {
				return String(t("err_max_rows", { max: maxRows }));
			}
			const first = firstCellError;
			if (first) {
				return String(
					t("err_cell", {
						row: first.r + 1,
						column: colLabel(first.c),
						message: first.message,
					})
				);
			}
			return (validateProp as any)?.customValidator?.(val, context, el) || "";
		},
		setValidationResult,
		setDoValidate: (fn: () => void) => (_doValidate = fn),
	});

	// ---------------------------------------------------------------------------
	// styling consts — utilities on purpose (FieldKeyValues pattern); the cell
	// controls' chrome lives in the shared FieldCell
	// ---------------------------------------------------------------------------

	const BTN_CLS = [
		"p-1 rounded shrink-0",
		"opacity-50 hover:opacity-100",
		"hover:bg-(--stuic-color-muted)",
		"focus-visible:outline-(--stuic-color-border-hover)",
		"disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
	].join(" ");
</script>

{#snippet control(c: FieldTableColumn, r: number, rid: string, row: FieldTableRow)}
	{@const key = c.key}
	{@const v = row[key]}
	{@const cid = cellId(rid, key)}
	{@const invalid = showCellError(r, c)}
	{@const describedby = invalid ? `${cid}-err` : undefined}
	{#if isBuiltInCellType(c.type)}
		<FieldCell
			def={c}
			value={v}
			id={cid}
			{disabled}
			{tabindex}
			{invalid}
			{describedby}
			{locale}
			{displayLanguage}
			{renderSize}
			{t}
			onValue={(next) => setCell(r, key, next)}
			onBlur={() => markTouched(rid, key)}
		/>
	{:else if cell}
		{@render cell({
			column: c,
			row,
			rowIndex: r,
			value: v,
			setValue: (next) => setCell(r, key, next),
			id: cid,
			disabled,
			invalid,
			describedby,
		})}
	{:else}
		<!-- unknown type without a `cell` snippet: shown read-only, round-trips -->
		<div id={cid} class="stuic-field-cell-readonly">{cellRawText(v)}</div>
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
	{classInputBoxWrap}
	{classInputBoxWrapInvalid}
	{classDescBox}
	{classDescBoxToggle}
	{classBelowBox}
	{classValidationBox}
	{validation}
	{style}
>
	<div
		class="stuic-field-table w-full min-w-0"
		data-layout={layout}
		data-table-from={layout === "auto" ? tableFrom : undefined}
		bind:this={rootEl}
	>
		{#if !rows.length}
			<div class="stuic-field-table-empty">{emptyMessage ?? t("empty_message")}</div>
		{:else}
			<div class="stuic-field-table-scroll">
				<table>
					<thead>
						<tr>
							{#each uniqueColumns as c (c.key)}
								<th scope="col" data-type={c.type}>
									{colLabel(c)}{#if c.unit}{" "}<span class="stuic-field-table-unit"
											>({c.unit})</span
										>{/if}
								</th>
							{/each}
							{#if showActions}
								<th scope="col" class="stuic-field-table-actions">
									<span class="sr-only">{t("actions_label")}</span>
								</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each rows as row, r (meta[r]?.rid ?? r)}
							{@const rid = meta[r]?.rid ?? String(r)}
							<tr data-rid={rid}>
								{#if isPlainObject(row)}
									{#each uniqueColumns as c (c.key)}
										{@const invalid = showCellError(r, c)}
										<td data-type={c.type} data-invalid={invalid || undefined}>
											<label
												for={cellId(rid, c.key)}
												class="stuic-field-table-cell-label"
											>
												{colLabel(c)}{#if c.unit}{" "}({c.unit}){/if}<span class="sr-only"
													>, {t("row_label", { row: r + 1 })}</span
												>
											</label>
											{@render control(c, r, rid, row as FieldTableRow)}
											{#if invalid}
												<div
													id="{cellId(rid, c.key)}-err"
													class="stuic-field-table-cell-error"
												>
													{cellError(r, c)}
												</div>
											{/if}
										</td>
									{/each}
								{:else}
									<!-- not a record: degraded, read-only, still movable / removable -->
									<td
										colspan={Math.max(1, uniqueColumns.length)}
										data-degraded
										class="stuic-field-table-degraded"
									>
										<div class="stuic-field-table-unknown-row">
											{t("unknown_row_warning")}
										</div>
										<div class="stuic-field-cell-readonly">{cellRawText(row)}</div>
									</td>
								{/if}
								{#if showActions}
									<td class="stuic-field-table-actions">
										<span class="stuic-field-table-row-title">
											{t("row_label", { row: r + 1 })}
										</span>
										<span class="stuic-field-table-actions-buttons">
											{#if canMove}
												<button
													type="button"
													class={BTN_CLS}
													data-ft-btn="up"
													onclick={() => moveRow(r, r - 1)}
													disabled={r === 0}
													aria-label={String(t("move_row_up", { row: r + 1 }))}
													{tabindex}
													use:tooltip={() => ({
														enabled: r > 0,
														content: t("move_row_up", { row: r + 1 }),
													})}
												>
													{@html iconArrowUp({ size: 14 })}
												</button>
												<button
													type="button"
													class={BTN_CLS}
													data-ft-btn="down"
													onclick={() => moveRow(r, r + 1)}
													disabled={r === rows.length - 1}
													aria-label={String(t("move_row_down", { row: r + 1 }))}
													{tabindex}
													use:tooltip={() => ({
														enabled: r < rows.length - 1,
														content: t("move_row_down", { row: r + 1 }),
													})}
												>
													{@html iconArrowDown({ size: 14 })}
												</button>
											{/if}
											<button
												type="button"
												class={BTN_CLS}
												data-ft-btn="remove"
												onclick={() => removeRow(r)}
												aria-label={String(t("remove_row", { row: r + 1 }))}
												{tabindex}
												use:tooltip={() => ({
													enabled: true,
													content: t("remove_row", { row: r + 1 }),
												})}
											>
												{@html iconTrash({ size: 14 })}
											</button>
										</span>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<div class="stuic-field-table-footer">
			<button
				type="button"
				class="stuic-field-table-add"
				onclick={addRow}
				disabled={disabled || maxReached || !uniqueColumns.length}
				{tabindex}
				bind:this={addBtnEl}
			>
				{@html iconPlus({ size: 14 })}
				<span>{addLabel ?? t("add_row")}</span>
			</button>
			{#if maxRows}
				<span class="stuic-field-table-count">{rows.length} / {maxRows}</span>
			{/if}
		</div>
	</div>
</InputWrap>

<!-- polite announcements for add / remove / move -->
<div class="sr-only" aria-live="polite">{liveAnnouncement}</div>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	value={JSON.stringify(Array.isArray(value) ? value : [])}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
