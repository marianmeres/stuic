<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "../Input/types.js";
	import type { FieldDef, FieldTypeDef } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/** Bindable. The ordered field-definition list. */
		value: FieldDef[];
		name: string;
		/**
		 * The type palette. Required on purpose — the component has no built-in
		 * notion of field types (see `DEFAULT_FIELD_TYPES` for a starter set).
		 */
		types: FieldTypeDef[];
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		/** When `true`, at least one (keyed) field is required. */
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		classRow?: string;
		classRowHeader?: string;
		classRowBody?: string;
		classPreview?: string;
		style?: string;
		/**
		 * When set, label/description/option-label editing becomes multi-language
		 * and those values may become `Record<language, string>`. Absent → plain
		 * strings.
		 */
		languages?: string[];
		/** Defaults to `languages[0]`. Drives key derivation and display texts. */
		defaultLanguage?: string;
		languageLabels?: Record<string, string>;
		/** Key policy. Default: lowercase snake_case starting with a letter. */
		keyPattern?: RegExp;
		keyMaxLength?: number;
		reservedKeys?: string[] | ((key: string) => boolean);
		/**
		 * Keys present in `value` when it is (re)loaded render read-only — data
		 * may already be stored under them. Keys created during the editing
		 * session stay editable. `lock.key` overrides per-field in both
		 * directions. Default `true`.
		 */
		keysImmutable?: boolean;
		/**
		 * Auto-derive the key from the label while the key is untouched (new
		 * fields only). Pass a function to customize the slugifier. Default `true`.
		 */
		deriveKeyFromLabel?: boolean | ((label: string) => string);
		maxFields?: number;
		/**
		 * `"mark"` (default): deleting a pre-existing field marks it (struck
		 * through, undoable) and excludes it from `value`; the row stays visible
		 * until the value is re-loaded. Fields added in this session are removed
		 * outright in both modes (there is no stored data to protect).
		 */
		deleteMode?: "mark" | "immediate";
		/** Veto hook — return `false` (or throw) to cancel the delete. */
		onBeforeDelete?: (field: FieldDef) => void | false | Promise<void | false>;
		/**
		 * Veto hook for changing the type of a pre-existing field — return
		 * `false` (or throw) to cancel. Not called for fields added in this
		 * session.
		 */
		onBeforeTypeChange?: (
			field: FieldDef,
			newType: string
		) => void | false | Promise<void | false>;
		onChange?: (value: FieldDef[]) => void;
		/** Renders the preview pane. Receives the current (visible) fields. */
		preview?: Snippet<[{ fields: FieldDef[] }]>;
		/**
		 * Component width at which the preview pane renders side-by-side instead
		 * of below. `0` → always below. Default `768`.
		 */
		previewBreakpoint?: number;
		addLabel?: string;
		emptyMessage?: string;
		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { tooltip } from "../../actions/index.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import {
		iconAlertWarning,
		iconArrowDown,
		iconArrowUp,
		iconChevronDown,
		iconChevronRight,
		iconGripVertical,
		iconPlus,
		iconTrash,
		iconUndo,
	} from "../../icons/index.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "../Input/_internal/InputWrap.svelte";
	import LocalizedTextInput from "./_internal/LocalizedTextInput.svelte";
	import OptionsEditor from "./_internal/OptionsEditor.svelte";
	import {
		getLocalizedText,
		isKeyReserved,
		slugifyKey,
		uniqueKey,
		validateFieldDefs,
		DEFAULT_KEY_MAX_LENGTH,
	} from "./utils.js";
	// NOTE: bundled non-English catalogs (./i18n-sk.js) are deliberately NOT
	// imported here — they must stay tree-shakeable for English-only consumers.
	import { t_default } from "./i18n.js";

	let {
		value = $bindable(),
		name,
		types,
		id = getId(),
		label,
		description,
		class: classProp,
		tabindex = 0,
		renderSize = "sm",
		required = false,
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
		classRow,
		classRowHeader,
		classRowBody,
		classPreview,
		style,
		languages,
		defaultLanguage,
		languageLabels,
		keyPattern,
		keyMaxLength = DEFAULT_KEY_MAX_LENGTH,
		reservedKeys,
		keysImmutable = true,
		deriveKeyFromLabel = true,
		maxFields,
		deleteMode = "mark",
		onBeforeDelete,
		onBeforeTypeChange,
		onChange,
		preview,
		previewBreakpoint = 768,
		addLabel,
		emptyMessage,
		t = t_default,
	}: Props = $props();

	interface Row {
		/** Stable render/identity id (never emitted). */
		rid: string;
		/** Working copy of the field def. */
		def: FieldDef;
		/** Key at (re)load time; `undefined` = field added this session. */
		initialKey?: string;
		/** Type at (re)load time (drives the type-change warning + veto). */
		initialType?: string;
		/** Key derivation from the label stops once true. */
		keyTouched: boolean;
		/** Key input edited this session (gates the inline key error). */
		keyEdited: boolean;
		/** Marked for deletion (`deleteMode: "mark"`). */
		deleted: boolean;
		/**
		 * Whether this row is part of `value`. Rows loaded from `value` always
		 * are (even with a blank key — never silently drop, and the resync
		 * comparison must converge); session-added rows join once they get a key
		 * and then never silently leave (a transiently blank key mid-rename must
		 * not emit an effective field deletion).
		 */
		emitted: boolean;
		expanded: boolean;
		advancedOpen: boolean;
	}

	function cloneDef(d: FieldDef): FieldDef {
		return JSON.parse(JSON.stringify(d));
	}

	function fromValue(defs: FieldDef[]): Row[] {
		return (defs ?? []).map((d) => {
			const def = cloneDef(d);
			def.key ??= "";
			return {
				rid: getId(),
				def,
				initialKey: def.key || undefined,
				initialType: def.type || undefined,
				keyTouched: true,
				keyEdited: false,
				deleted: false,
				emitted: true,
				expanded: false,
				advancedOpen: false,
			};
		});
	}

	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let rootEl: HTMLElement | undefined = $state();
	let width = $state(0);
	let rowEls: Record<string, HTMLElement | undefined> = $state({});
	let labelEditors: Record<string, LocalizedTextInput | undefined> = $state({});
	let keyInputEls: Record<string, HTMLInputElement | undefined> = $state({});
	let liveAnnouncement = $state("");

	let rows: Row[] = $state(fromValue(value ?? []));

	const _defaultLanguage = $derived(defaultLanguage || languages?.[0]);
	const typeByName = $derived(new Map(types.map((td) => [td.type, td])));
	const visibleRows = $derived(rows.filter((r) => !r.deleted));
	const maxReached = $derived(!!maxFields && visibleRows.length >= maxFields);

	// ---------------------------------------------------------------------------
	// value sync (FieldKeyValues architecture: internal rows are the source of
	// truth; `value` carries the visible, keyed defs; an external reassignment
	// that does not round-trip rebuilds the rows — and re-snapshots key
	// immutability, since new external content means newly "saved" keys)
	// ---------------------------------------------------------------------------

	function emittedDefs(): FieldDef[] {
		return visibleRows
			.filter((r) => r.emitted || (r.def.key ?? "").trim())
			.map((r) => r.def);
	}

	function syncToValue() {
		for (const r of visibleRows) {
			if (!r.emitted && (r.def.key ?? "").trim()) r.emitted = true;
		}
		value = JSON.parse(JSON.stringify(emittedDefs()));
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
		onChange?.(value);
	}

	$effect(() => {
		const external = JSON.stringify(value ?? []);
		const internal = JSON.stringify(emittedDefs());
		if (external !== internal) {
			rows = fromValue(value ?? []);
		}
	});

	// ---------------------------------------------------------------------------
	// keys
	// ---------------------------------------------------------------------------

	function keyEditable(row: Row): boolean {
		if (disabled) return false;
		if (row.def.lock?.key !== undefined) return !row.def.lock.key;
		if (!keysImmutable) return true;
		return row.initialKey === undefined;
	}

	function deriveKey(row: Row) {
		const labelText = getLocalizedText(row.def.label, _defaultLanguage);
		const base =
			typeof deriveKeyFromLabel === "function"
				? deriveKeyFromLabel(labelText)
				: slugifyKey(labelText, keyMaxLength);
		row.def.key = base
			? uniqueKey(
					base,
					(k) =>
						isKeyReserved(k, reservedKeys) ||
						visibleRows.some((r) => r !== row && r.def.key === k),
					keyMaxLength
				)
			: "";
	}

	function onLabelInput(row: Row) {
		if (
			deriveKeyFromLabel &&
			!row.keyTouched &&
			row.initialKey === undefined &&
			keyEditable(row)
		) {
			deriveKey(row);
		}
		syncToValue();
	}

	function onKeyInput(row: Row, newKey: string) {
		if (!keyEditable(row)) return;
		row.keyTouched = true;
		row.keyEdited = true;
		row.def.key = newKey;
		syncToValue();
	}

	function onDescriptionInput(row: Row) {
		// an emptied description should vanish from the def, not linger as ""
		if (row.def.description === "") row.def.description = undefined;
		syncToValue();
	}

	// ---------------------------------------------------------------------------
	// add / delete / type change / extras
	// ---------------------------------------------------------------------------

	function seedExtraDefaults(row: Row) {
		const entry = typeByName.get(row.def.type);
		for (const ex of entry?.extras ?? []) {
			if (ex.default !== undefined && row.def.extras?.[ex.key] === undefined) {
				row.def.extras = { ...(row.def.extras ?? {}), [ex.key]: ex.default };
			}
		}
	}

	function addField() {
		if (disabled || maxReached) return;
		const row: Row = {
			rid: getId(),
			def: { key: "", type: types[0]?.type ?? "", label: "" },
			initialKey: undefined,
			initialType: undefined,
			keyTouched: false,
			keyEdited: false,
			deleted: false,
			emitted: false,
			expanded: true,
			advancedOpen: false,
		};
		seedExtraDefaults(row);
		rows = [...rows, row];
		// no syncToValue: a keyless row is not part of `value` yet
		tick().then(() => labelEditors[row.rid]?.focus?.());
	}

	async function deleteField(row: Row) {
		if (disabled || row.def.lock?.delete) return;
		if (onBeforeDelete) {
			let res: void | false;
			try {
				res = await onBeforeDelete(cloneDef(row.def));
			} catch {
				res = false;
			}
			if (res === false) return;
		}
		// mark-mode protects fields that may have stored data; a field created
		// in this session has none — remove it outright in both modes
		if (deleteMode === "immediate" || row.initialKey === undefined) {
			rows = rows.filter((r) => r.rid !== row.rid);
		} else {
			row.deleted = true;
			row.expanded = false;
		}
		announce("removed_field", row);
		syncToValue();
	}

	function undoDelete(row: Row) {
		if (disabled) return;
		row.deleted = false;
		announce("restored_field", row);
		syncToValue();
	}

	async function changeType(row: Row, newType: string, selectEl: HTMLSelectElement) {
		const prevType = row.def.type;
		if (newType === prevType) return;
		// veto only for fields that already existed when the value was loaded
		if (row.initialKey !== undefined && onBeforeTypeChange) {
			let res: void | false;
			try {
				res = await onBeforeTypeChange(cloneDef(row.def), newType);
			} catch {
				res = false;
			}
			if (res === false) {
				selectEl.value = prevType;
				return;
			}
		}
		row.def.type = newType;
		// `options`/`extras` of the previous type are deliberately kept — never
		// silently drop data; switching back restores them
		seedExtraDefaults(row);
		syncToValue();
	}

	// `undefined` REMOVES the key (and an emptied bag removes `extras` itself):
	// "no value" must have exactly one representation downstream — a consumer
	// reading `extras.unit` to decide whether to render a suffix should never
	// have to special-case `""`, nor a `{}` that means nothing.
	function setExtra(row: Row, key: string, value: unknown) {
		const next = { ...(row.def.extras ?? {}) };
		if (value === undefined) delete next[key];
		else next[key] = value;
		row.def.extras = Object.keys(next).length ? next : undefined;
		syncToValue();
	}

	/** Display value of a string/select extra (a non-string is shown, not eaten). */
	function extraText(row: Row, key: string): string {
		const v = row.def.extras?.[key];
		return v == null ? "" : String(v);
	}

	// while typing, the RAW value is stored (trimming here would fight the
	// caret: a written-back trimmed value makes a trailing space untypable) —
	// only the emptiness test is trimmed; `onchange` normalizes on commit
	function onExtraStringInput(row: Row, key: string, raw: string) {
		setExtra(row, key, raw.trim() ? raw : undefined);
	}

	function onExtraStringChange(row: Row, key: string, raw: string) {
		setExtra(row, key, raw.trim() || undefined);
	}

	function typeChanged(row: Row): boolean {
		return !!row.initialType && row.def.type !== row.initialType;
	}

	// ---------------------------------------------------------------------------
	// reorder (drag + keyboard buttons); `lock.reorder` rows are position-pinned:
	// no move may change their index
	// ---------------------------------------------------------------------------

	let dragIdx: number | null = $state(null);
	let dropRowIdx: number | null = $state(null);
	let dropRowPos: "before" | "after" | null = $state(null);

	function canMoveRow(from: number, to: number): boolean {
		if (disabled) return false;
		if (to < 0 || to >= rows.length || from === to) return false;
		if (rows[from].def.lock?.reorder) return false;
		const order = rows.map((_, i) => i);
		const [moved] = order.splice(from, 1);
		order.splice(to, 0, moved);
		return order.every((orig, next) => !rows[orig].def.lock?.reorder || orig === next);
	}

	function moveRow(from: number, to: number, followFocus?: "up" | "down") {
		if (!canMoveRow(from, to)) return;
		const next = [...rows];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		rows = next;
		syncToValue();
		announce(to < from ? "moved_up" : "moved_down", moved, {
			position: to + 1,
			total: rows.length,
		});
		if (followFocus) focusRowButton(moved.rid, followFocus);
	}

	function resetDragState() {
		dragIdx = null;
		dropRowIdx = null;
		dropRowPos = null;
	}

	function handleDragStart(e: DragEvent, idx: number) {
		const row = rows[idx];
		if (disabled || !row || row.deleted || row.def.lock?.reorder) {
			e.preventDefault();
			return;
		}
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData("text/plain", row.rid);
		const rowEl = rowEls[row.rid];
		if (rowEl) e.dataTransfer!.setDragImage(rowEl, 16, 16);
		dragIdx = idx;
	}

	function dropTargetIndex(
		e: DragEvent,
		idx: number
	): { to: number; pos: "before" | "after" } | null {
		if (dragIdx == null || idx === dragIdx) return null;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const pos: "before" | "after" =
			e.clientY - rect.top < rect.height / 2 ? "before" : "after";
		const insertion = pos === "before" ? idx : idx + 1;
		const to = insertion > dragIdx ? insertion - 1 : insertion;
		return to === dragIdx ? null : { to, pos };
	}

	function handleDragOver(e: DragEvent, idx: number) {
		const target = dropTargetIndex(e, idx);
		if (!target || !canMoveRow(dragIdx!, target.to)) {
			if (dropRowIdx === idx) {
				dropRowIdx = null;
				dropRowPos = null;
			}
			return;
		}
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
		dropRowIdx = idx;
		dropRowPos = target.pos;
	}

	function handleDragLeave(e: DragEvent) {
		const currentTarget = e.currentTarget as HTMLElement;
		const related = e.relatedTarget as Node | null;
		if (related && currentTarget.contains(related)) return;
		dropRowIdx = null;
		dropRowPos = null;
	}

	function handleDrop(e: DragEvent, idx: number) {
		e.preventDefault();
		const target = dropTargetIndex(e, idx);
		if (target && dragIdx != null) moveRow(dragIdx, target.to);
		resetDragState();
	}

	// re-focus the same logical button on the moved row so repeated presses keep
	// walking it; boundary fallback to any enabled arrange button
	function focusRowButton(rid: string, which: "up" | "down") {
		tick().then(() => {
			const rowEl = rowEls[rid];
			if (!rowEl) return;
			let btn = rowEl.querySelector<HTMLButtonElement>(`[data-arrange-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					rowEl.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="up"]:not([disabled])`
					) ||
					rowEl.querySelector<HTMLButtonElement>(
						`[data-arrange-btn="down"]:not([disabled])`
					);
			}
			btn?.focus();
		});
	}

	function rowLabel(row: Row): string {
		return getLocalizedText(row.def.label, _defaultLanguage) || String(t("untitled"));
	}

	// clear-then-set so REPEATED identical announcements (e.g. pressing "Move
	// down" twice) still mutate the live region's text and get read out
	function announce(key: string, row: Row, values?: Record<string, string | number>) {
		liveAnnouncement = "";
		const msg = String(t(key, { label: rowLabel(row), ...values }));
		tick().then(() => (liveAnnouncement = msg));
	}

	// ---------------------------------------------------------------------------
	// validation
	// ---------------------------------------------------------------------------

	const tUtils = (k: string, values?: Record<string, string | number>) =>
		String(t(k, values ?? null, k));

	const rowValidation = $derived(
		validateFieldDefs(
			visibleRows.map((r) => r.def),
			{
				types,
				keyPattern,
				keyMaxLength,
				reservedKeys,
				maxFields,
				defaultLanguage: _defaultLanguage,
				t: tUtils,
			}
		)
	);

	const rowErrorsByRid = $derived.by(() => {
		const m = new Map<string, NonNullable<(typeof rowValidation.rowErrors)[number]>>();
		visibleRows.forEach((r, i) => {
			const e = rowValidation.rowErrors[i];
			if (e) m.set(r.rid, e);
		});
		return m;
	});

	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);
	let _doValidate: (() => void) | undefined = $state();

	/** Inline row errors render only after validation has run at least once. */
	const attempted = $derived(validation !== undefined);

	/** Trigger validation now. Focuses + scrolls to the first offending row. */
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

	/** Focus the first row (or the add button when the list is empty). */
	export function focus(): void {
		rootEl
			?.querySelector<HTMLElement>(".fb-row-toggle:not([disabled]), .fb-add-btn")
			?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		rootEl?.scrollIntoView?.({ behavior: "smooth", block: "center", ...opts });
	}

	function focusFirstInvalid() {
		const idx = rowValidation.rowErrors.findIndex(Boolean);
		if (idx < 0) return;
		const row = visibleRows[idx];
		if (!row) return;
		const errs = rowValidation.rowErrors[idx]!;
		row.expanded = true;
		if (errs.key) row.advancedOpen = true;
		tick().then(() => {
			rowEls[row.rid]?.scrollIntoView?.({ behavior: "smooth", block: "center" });
			if (errs.label) labelEditors[row.rid]?.focus?.();
			else if (errs.key) keyInputEls[row.rid]?.focus?.();
			else if (errs.options) {
				rowEls[row.rid]
					?.querySelector<HTMLElement>(
						".fb-options .fb-option-value, .fb-options .fb-add-option-btn"
					)
					?.focus?.();
			} else if (errs.extras) {
				rowEls[row.rid]?.querySelector<HTMLElement>(".fb-extra-input")?.focus?.();
			}
		});
	}

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: validateProp !== false,
		customValidator(val: any, context: Record<string, any> | undefined, el: any) {
			if (required && !visibleRows.some((r) => (r.def.key ?? "").trim())) {
				return String(t("at_least_one_field"));
			}
			if (rowValidation.message) return rowValidation.message;
			return (validateProp as any)?.customValidator?.(val, context, el) || "";
		},
		setValidationResult,
		setDoValidate: (fn: () => void) => (_doValidate = fn),
	});

	// ---------------------------------------------------------------------------
	// preview
	// ---------------------------------------------------------------------------

	const previewActive = $derived(!!preview || types.some((td) => !!td.preview));
	const isWide = $derived(
		previewActive && previewBreakpoint > 0 && width >= previewBreakpoint
	);
	const previewFields: FieldDef[] = $derived(
		previewActive ? visibleRows.map((r) => cloneDef(r.def)) : []
	);

	// ---------------------------------------------------------------------------
	// styling consts
	// ---------------------------------------------------------------------------

	const INPUT_CLS = [
		"rounded bg-(--stuic-color-input)",
		"border border-(--stuic-color-border)",
		"focus:border-(--stuic-color-border-hover)",
		"focus:outline-none focus:ring-0",
		"focus-visible:outline-none focus-visible:ring-0",
	].join(" ");

	const MONO_INPUT_CLS = twMerge(INPUT_CLS, "font-mono text-sm");

	const BTN_CLS = [
		"p-1 rounded shrink-0",
		"opacity-50 hover:opacity-100",
		"hover:bg-(--stuic-color-muted)",
		"focus-visible:outline-(--stuic-color-border-hover)",
		"disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
	].join(" ");
</script>

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{below}
	{required}
	{disabled}
	size={renderSize}
	class={twMerge("stuic-fields-builder", classProp)}
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
	<div class="w-full" bind:this={rootEl} bind:clientWidth={width}>
		<div class={isWide ? "flex items-stretch" : undefined}>
			<div class="flex-1 min-w-0">
				{#if rows.length === 0}
					<div class="p-3 text-sm opacity-50 text-center">
						{emptyMessage ?? t("empty_message")}
					</div>
				{:else}
					<div class="p-2" role="list">
						{#each rows as row, idx (row.rid)}
							{@const entry = typeByName.get(row.def.type)}
							{@const errs = rowErrorsByRid.get(row.rid)}
							{@const showLabelError = !!(attempted && errs?.label)}
							{@const showKeyError = !!(errs?.key && (attempted || row.keyEdited))}
							{@const showOptionsError = !!(attempted && errs?.options)}
							{@const showExtrasError = !!(attempted && errs?.extras)}
							{@const canDrag =
								!disabled && !row.deleted && !row.def.lock?.reorder && rows.length > 1}
							<div
								role="listitem"
								class={twMerge(
									"fb-row",
									idx > 0 && "fb-row-divider",
									row.deleted && "fb-row-deleted",
									classRow
								)}
								data-dragging={dragIdx === idx || undefined}
								data-drop-position={dropRowIdx === idx ? dropRowPos : undefined}
								ondragover={(e) => handleDragOver(e, idx)}
								ondragleave={handleDragLeave}
								ondrop={(e) => handleDrop(e, idx)}
								bind:this={rowEls[row.rid]}
							>
								<div
									class={twMerge("fb-row-header flex items-center gap-1", classRowHeader)}
								>
									{#if canDrag}
										<span
											class="fb-handle shrink-0"
											draggable="true"
											aria-hidden="true"
											ondragstart={(e) => handleDragStart(e, idx)}
											ondragend={resetDragState}
											use:tooltip={() => ({
												enabled: true,
												content: t("drag_to_reorder"),
											})}
										>
											{@html iconGripVertical({ size: 16 })}
										</span>
									{:else}
										<span class="fb-handle-spacer shrink-0" aria-hidden="true"></span>
									{/if}

									<button
										type="button"
										class="fb-row-toggle flex-1 min-w-0 flex items-center gap-2 text-left rounded"
										onclick={() => (row.expanded = !row.expanded)}
										disabled={row.deleted}
										aria-expanded={row.expanded && !row.deleted}
										{tabindex}
									>
										<span class="fb-row-label truncate">{rowLabel(row)}</span>
										{#if row.def.required}
											<span class="fb-row-required shrink-0" aria-hidden="true">*</span>
										{/if}
										{#if row.def.key}
											<span class="fb-key hidden sm:inline truncate">{row.def.key}</span>
										{/if}
										<span class="flex-1"></span>
										{#if row.deleted}
											<span class="fb-chip fb-chip-deleted shrink-0">{t("deleted")}</span>
										{:else if !entry}
											<span
												class="fb-chip fb-chip-warning shrink-0 inline-flex items-center gap-1"
											>
												{@html iconAlertWarning({ size: 12 })}
												{row.def.type}
											</span>
										{:else}
											<span class="fb-chip shrink-0 inline-flex items-center gap-1">
												{#if typeof entry.icon === "string"}
													{@html entry.icon}
												{:else if entry.icon}
													{@render entry.icon()}
												{/if}
												{getLocalizedText(entry.label, _defaultLanguage)}
											</span>
										{/if}
										{#if (showLabelError || showKeyError || showOptionsError || showExtrasError) && !row.deleted}
											<span class="fb-error-text shrink-0">
												<span aria-hidden="true"
													>{@html iconAlertWarning({ size: 14 })}</span
												>
												<span class="sr-only">{t("row_has_errors")}</span>
											</span>
										{/if}
										<span
											class={twMerge(
												"fb-chevron shrink-0 transition-transform",
												row.expanded && !row.deleted && "rotate-180"
											)}
											aria-hidden="true"
										>
											{@html iconChevronDown({ size: 16 })}
										</span>
									</button>

									{#if row.deleted}
										<button
											type="button"
											class={twMerge(BTN_CLS, "flex items-center gap-1 text-sm pr-2")}
											onclick={() => undoDelete(row)}
											{disabled}
											{tabindex}
										>
											{@html iconUndo({ size: 14 })}
											<span>{t("undo_delete")}</span>
										</button>
									{:else}
										{#if rows.length > 1 && !row.def.lock?.reorder}
											<button
												type="button"
												class={BTN_CLS}
												data-arrange-btn="up"
												onclick={() => moveRow(idx, idx - 1, "up")}
												disabled={disabled || !canMoveRow(idx, idx - 1)}
												aria-label={String(t("move_up"))}
												{tabindex}
												use:tooltip={() => ({
													enabled: !disabled,
													content: t("move_up"),
												})}
											>
												{@html iconArrowUp({ size: 14 })}
											</button>
											<button
												type="button"
												class={BTN_CLS}
												data-arrange-btn="down"
												onclick={() => moveRow(idx, idx + 1, "down")}
												disabled={disabled || !canMoveRow(idx, idx + 1)}
												aria-label={String(t("move_down"))}
												{tabindex}
												use:tooltip={() => ({
													enabled: !disabled,
													content: t("move_down"),
												})}
											>
												{@html iconArrowDown({ size: 14 })}
											</button>
										{/if}
										{#if !row.def.lock?.delete}
											<button
												type="button"
												class={BTN_CLS}
												onclick={() => deleteField(row)}
												{disabled}
												aria-label={String(t("delete_field"))}
												{tabindex}
												use:tooltip={() => ({
													enabled: !disabled,
													content: t("delete_field"),
												})}
											>
												{@html iconTrash({ size: 14 })}
											</button>
										{/if}
									{/if}
								</div>

								{#if row.expanded && !row.deleted}
									<div class={twMerge("fb-row-body", classRowBody)}>
										{#if !entry}
											<div class="fb-warning-text text-sm flex items-start gap-2">
												{@html iconAlertWarning({ size: 16 })}
												<span>{t("unknown_type_warning")}</span>
											</div>
										{:else}
											<div class="fb-field">
												<label class="fb-sub-label" for="{id}-label-{row.rid}">
													{t("label_label")}
												</label>
												<LocalizedTextInput
													bind:value={row.def.label}
													bind:this={labelEditors[row.rid]}
													id="{id}-label-{row.rid}"
													{languages}
													defaultLanguage={_defaultLanguage}
													{languageLabels}
													{disabled}
													{tabindex}
													{t}
													class={INPUT_CLS}
													placeholder={String(t("label_placeholder"))}
													ariaInvalid={showLabelError}
													ariaDescribedby={showLabelError
														? `${id}-label-err-${row.rid}`
														: undefined}
													onInput={() => onLabelInput(row)}
												/>
												{#if showLabelError}
													<div
														id="{id}-label-err-{row.rid}"
														class="fb-error-text text-sm mt-0.5"
													>
														{errs?.label}
													</div>
												{/if}
											</div>

											<div class="fb-field">
												<label class="fb-sub-label" for="{id}-desc-{row.rid}">
													{t("description_label")}
												</label>
												<LocalizedTextInput
													bind:value={row.def.description}
													id="{id}-desc-{row.rid}"
													multiline
													{languages}
													defaultLanguage={_defaultLanguage}
													{languageLabels}
													{disabled}
													{tabindex}
													{t}
													class={INPUT_CLS}
													onInput={() => onDescriptionInput(row)}
												/>
											</div>

											<div class="fb-field">
												<label class="fb-sub-label" for="{id}-type-{row.rid}">
													{t("type_label")}
												</label>
												<!-- select + Required share one row so the checkbox is
												     centered against the control, not against the whole
												     column (the hint/warning below would drag it down) -->
												<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
													<select
														id="{id}-type-{row.rid}"
														value={row.def.type}
														onchange={(e) =>
															changeType(row, e.currentTarget.value, e.currentTarget)}
														disabled={disabled || !!row.def.lock?.type}
														{tabindex}
														class={twMerge(INPUT_CLS, "flex-1 min-w-40")}
													>
														{#each types as td (td.type)}
															<option value={td.type}>
																{getLocalizedText(td.label, _defaultLanguage)}
															</option>
														{/each}
													</select>
													<label
														class="stuic-checkbox flex items-center gap-2 cursor-pointer shrink-0"
													>
														<input
															type="checkbox"
															checked={!!row.def.required}
															onchange={(e) => {
																row.def.required = e.currentTarget.checked;
																syncToValue();
															}}
															disabled={disabled || !!row.def.lock?.required}
															{tabindex}
														/>
														<span class="text-sm">{t("required_label")}</span>
													</label>
												</div>
												{#if entry.description}
													<div class="fb-hint text-xs mt-0.5">
														{getLocalizedText(entry.description, _defaultLanguage)}
													</div>
												{/if}
												{#if typeChanged(row)}
													<div
														class="fb-warning-text text-xs mt-1 flex items-start gap-1"
													>
														{@html iconAlertWarning({ size: 12 })}
														<span>{t("type_change_warning")}</span>
													</div>
												{/if}
											</div>

											{#if entry.supportsOptions}
												<div
													class="fb-field"
													role="group"
													aria-label={String(t("options_label"))}
													aria-describedby={showOptionsError
														? `${id}-options-err-${row.rid}`
														: undefined}
												>
													<div class="fb-sub-label">{t("options_label")}</div>
													<OptionsEditor
														bind:options={row.def.options}
														{languages}
														defaultLanguage={_defaultLanguage}
														{languageLabels}
														{disabled}
														locked={!!row.def.lock?.options}
														{tabindex}
														{t}
														onChange={syncToValue}
													/>
													{#if showOptionsError}
														<div
															id="{id}-options-err-{row.rid}"
															class="fb-error-text text-sm mt-0.5"
														>
															{errs?.options}
														</div>
													{/if}
												</div>
											{/if}

											{#if entry.extras?.length}
												<!--
													Every arm displays the ACTUAL def value only (no
													`?? ex.default` fallback): defaults are materialized into
													`extras` on add/type-change, but a def loaded without the
													key must not render as if it held the default while
													emitting nothing — the control must always match what
													`value` says.
												-->
												<div class="fb-extras fb-field flex flex-col gap-2.5">
													{#each entry.extras as ex, exIdx (ex.key)}
														{#if ex.type === "string" || ex.type === "select"}
															{@const exId = `${id}-extra-${row.rid}-${exIdx}`}
															{@const exValue = extraText(row, ex.key)}
															<div class="fb-extra">
																<label class="fb-sub-label" for={exId}>
																	{getLocalizedText(ex.label, _defaultLanguage)}
																</label>
																{#if ex.type === "string"}
																	<input
																		id={exId}
																		type="text"
																		class={twMerge(INPUT_CLS, "fb-extra-input w-full")}
																		value={exValue}
																		maxlength={ex.maxlength}
																		placeholder={getLocalizedText(
																			ex.placeholder,
																			_defaultLanguage
																		) || undefined}
																		oninput={(e) =>
																			onExtraStringInput(
																				row,
																				ex.key,
																				e.currentTarget.value
																			)}
																		onchange={(e) =>
																			onExtraStringChange(
																				row,
																				ex.key,
																				e.currentTarget.value
																			)}
																		{disabled}
																		{tabindex}
																		aria-invalid={showExtrasError || undefined}
																		aria-describedby={showExtrasError
																			? `${id}-extras-err-${row.rid}`
																			: undefined}
																	/>
																{:else}
																	<select
																		id={exId}
																		class={twMerge(INPUT_CLS, "fb-extra-input w-full")}
																		value={exValue}
																		onchange={(e) =>
																			setExtra(
																				row,
																				ex.key,
																				e.currentTarget.value || undefined
																			)}
																		{disabled}
																		{tabindex}
																	>
																		<option value="">
																			{getLocalizedText(ex.placeholder, _defaultLanguage)}
																		</option>
																		{#each ex.options as opt (opt.value)}
																			<option value={opt.value}>
																				{getLocalizedText(opt.label, _defaultLanguage)}
																			</option>
																		{/each}
																		<!-- a stored value outside the declared list stays
																		     visible and round-trips (same stance as an
																		     unknown field type) -->
																		{#if exValue && !ex.options.some((o) => o.value === exValue)}
																			<option value={exValue}>{exValue}</option>
																		{/if}
																	</select>
																{/if}
																{#if ex.description}
																	<div class="fb-hint text-xs mt-0.5">
																		{getLocalizedText(ex.description, _defaultLanguage)}
																	</div>
																{/if}
															</div>
														{:else}
															<label
																class="stuic-checkbox fb-extra flex items-start gap-2 cursor-pointer"
															>
																<input
																	type="checkbox"
																	checked={!!row.def.extras?.[ex.key]}
																	onchange={(e) =>
																		setExtra(row, ex.key, e.currentTarget.checked)}
																	{disabled}
																	{tabindex}
																/>
																<span class="text-sm">
																	{getLocalizedText(ex.label, _defaultLanguage)}
																	{#if ex.description}
																		<span class="fb-hint block text-xs">
																			{getLocalizedText(ex.description, _defaultLanguage)}
																		</span>
																	{/if}
																</span>
															</label>
														{/if}
													{/each}
													{#if showExtrasError}
														<div
															id="{id}-extras-err-{row.rid}"
															class="fb-error-text text-sm"
														>
															{errs?.extras}
														</div>
													{/if}
												</div>
											{/if}

											<div class="fb-advanced">
												<button
													type="button"
													class="fb-advanced-toggle flex items-center gap-1 text-xs"
													onclick={() => (row.advancedOpen = !row.advancedOpen)}
													aria-expanded={row.advancedOpen || showKeyError}
													{tabindex}
												>
													<span
														class={twMerge(
															"transition-transform",
															(row.advancedOpen || showKeyError) && "rotate-90"
														)}
														aria-hidden="true"
													>
														{@html iconChevronRight({ size: 12 })}
													</span>
													{t("advanced_label")}
												</button>
												{#if row.advancedOpen || showKeyError}
													<div class="fb-advanced-body mt-1.5">
														<label class="fb-sub-label" for="{id}-key-{row.rid}">
															{t("key_label")}
														</label>
														<input
															id="{id}-key-{row.rid}"
															type="text"
															value={row.def.key}
															oninput={(e) => onKeyInput(row, e.currentTarget.value)}
															class={twMerge(MONO_INPUT_CLS, "w-full")}
															readonly={!keyEditable(row)}
															{disabled}
															{tabindex}
															aria-invalid={showKeyError || undefined}
															aria-describedby={showKeyError
																? `${id}-key-err-${row.rid}`
																: undefined}
															bind:this={keyInputEls[row.rid]}
														/>
														<div class="fb-hint text-xs mt-0.5">
															{keyEditable(row) ? t("key_hint") : t("key_locked_hint")}
														</div>
														{#if showKeyError}
															<div
																id="{id}-key-err-{row.rid}"
																class="fb-error-text text-sm mt-0.5"
															>
																{errs?.key}
															</div>
														{/if}
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add button -->
				<div
					class={twMerge(
						"p-2 flex items-center gap-2",
						rows.length > 0 && "border-t border-(--stuic-color-border)"
					)}
				>
					<button
						type="button"
						onclick={addField}
						class={twMerge(
							"fb-add-btn",
							"flex items-center gap-1 text-sm opacity-75 hover:opacity-100",
							"bg-(--stuic-color-muted)",
							"p-1.5 pr-2 rounded hover:bg-(--stuic-color-muted-hover)",
							"disabled:opacity-25 disabled:cursor-not-allowed"
						)}
						disabled={disabled || maxReached}
						{tabindex}
					>
						{@html iconPlus({ size: 16 })}
						<span>{addLabel ?? t("add_label")}</span>
					</button>
					{#if maxReached}
						<span class="fb-hint text-xs">{t("err_max_fields", { max: maxFields! })}</span
						>
					{/if}
				</div>
			</div>

			{#if previewActive}
				<div
					class={twMerge(
						"fb-preview p-3",
						isWide ? "fb-preview-side flex-1 min-w-0" : "fb-preview-below",
						classPreview
					)}
				>
					<div class="fb-preview-title text-xs mb-2">{t("preview_label")}</div>
					{#if preview}
						{@render preview({ fields: previewFields })}
					{:else}
						<div class="flex flex-col gap-2">
							{#each visibleRows as row, i (row.rid)}
								{@const f = previewFields[i]}
								{@const pentry = typeByName.get(f.type)}
								{#if pentry?.preview}
									{@render pentry.preview(f)}
								{:else}
									<div class="fb-preview-fallback flex items-center gap-1.5 text-sm">
										<span>
											{getLocalizedText(f.label, _defaultLanguage) || t("untitled")}
										</span>
										{#if f.required}
											<span class="fb-row-required" aria-hidden="true">*</span>
										{/if}
										{#if pentry}
											<span class="fb-chip">
												{getLocalizedText(pentry.label, _defaultLanguage)}
											</span>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</InputWrap>

<!-- polite announcements for keyboard/drag reordering and delete/undo -->
<div class="sr-only" aria-live="polite">{liveAnnouncement}</div>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	value={JSON.stringify(value ?? [])}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
