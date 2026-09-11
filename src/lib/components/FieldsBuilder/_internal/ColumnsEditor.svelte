<!--
	INTERNAL to FieldsBuilder — not exported from the package.

	Editor for the column list (`FieldColumnDef[]`) of a field whose palette
	entry declares `supportsColumns`. A column is a field row in miniature: a
	localized label, a type picked from the column palette, a machine key, and
	— behind a per-column settings toggle — the column type's `OptionsEditor`
	and/or `ExtrasEditor`. Modelled on `OptionsEditor` (buttons-only reorder,
	immediate removal, keyed #each so a move carries the DOM and the focus,
	a local polite live region), NOT on a nested `FieldsBuilder`.

	Key policy is the field-key policy: derive-while-untouched from the label
	(slugified, unique among SIBLING columns, bounded by `keyMaxLength`), the
	first manual edit stops derivation, and with `keysImmutable` a column that
	was present when `value` was (re)loaded has a read-only key. `reservedKeys`
	does not apply — it guards the field-key namespace.

	The per-column meta (`ColumnMeta`) is owned by the parent's `Row` and bound
	in here (`bind:meta`), because this editor is unmounted while its row is
	collapsed — see `column-meta.ts`.

	Removal and type change of a STORED column (meta.initialKey set) go through
	the veto hooks; columns added this session skip them. Columns of an
	unknown type render as a degraded read-only line and round-trip untouched.
-->
<script lang="ts">
	import { tick } from "svelte";
	import { tooltip } from "../../../actions/index.js";
	import {
		iconAlertWarning,
		iconArrowDown,
		iconArrowUp,
		iconChevronDown,
		iconPlus,
		iconTrash,
	} from "../../../icons/index.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import type { TranslateFn } from "../../../types.js";
	import type { FieldColumnDef, FieldTypeDef, LocalizedText } from "../types.js";
	import {
		getLocalizedText,
		seedExtraDefaults,
		slugifyKey,
		uniqueKey,
		DEFAULT_KEY_MAX_LENGTH,
		type FieldColumnErrors,
	} from "../utils.js";
	import { newColumnMeta, type ColumnMeta } from "./column-meta.js";
	import ExtrasEditor from "./ExtrasEditor.svelte";
	import LocalizedTextInput from "./LocalizedTextInput.svelte";
	import OptionsEditor from "./OptionsEditor.svelte";

	interface Props {
		columns?: FieldColumnDef[];
		/** Index-aligned with `columns`; owned by the parent row (see above). */
		meta: ColumnMeta[];
		/** The column palette (already resolved by the parent). */
		columnTypes: FieldTypeDef[];
		maxColumns?: number;
		languages?: string[];
		/** Canonical language: key derivation and the editors' collapsed input. */
		defaultLanguage?: string;
		/** Language the read-only texts (palette labels, announcements) read in. */
		displayLanguage?: string;
		languageLabels?: Record<string, string>;
		keyMaxLength?: number;
		deriveKeyFromLabel?: boolean | ((label: string) => string);
		keysImmutable?: boolean;
		disabled?: boolean;
		/** `lock.columns` — render the list read-only. */
		locked?: boolean;
		/** Index-aligned column errors; the parent passes them once validation ran. */
		errors?: (FieldColumnErrors | null)[];
		/** Unique prefix for control ids. */
		idPrefix: string;
		/** Veto hook for removing a STORED column (the parent adds the field). */
		onBeforeDelete?: (column: FieldColumnDef) => void | false | Promise<void | false>;
		/** Veto hook for changing the type of a STORED column. */
		onBeforeTypeChange?: (
			column: FieldColumnDef,
			newType: string
		) => void | false | Promise<void | false>;
		tabindex?: number;
		t?: TranslateFn;
		/** Fired after any change to `columns`. */
		onChange?: () => void;
	}

	let {
		// no fallback on purpose — the parent binds a possibly-undefined list
		columns = $bindable(),
		meta = $bindable(),
		columnTypes,
		maxColumns,
		languages,
		defaultLanguage,
		displayLanguage,
		languageLabels,
		keyMaxLength = DEFAULT_KEY_MAX_LENGTH,
		deriveKeyFromLabel = true,
		keysImmutable = true,
		disabled = false,
		locked = false,
		errors,
		idPrefix,
		onBeforeDelete,
		onBeforeTypeChange,
		tabindex = 0,
		t = (k: string) => k,
		onChange,
	}: Props = $props();

	const _defaultLanguage = $derived(defaultLanguage || languages?.[0]);
	const _displayLanguages = $derived(
		[displayLanguage || _defaultLanguage, _defaultLanguage].filter(
			(l): l is string => !!l
		)
	);
	const _readonly = $derived(disabled || locked);
	const typeByName = $derived(new Map(columnTypes.map((td) => [td.type, td])));
	const list = $derived(columns ?? []);
	const maxReached = $derived(!!maxColumns && list.length >= maxColumns);

	let rootEl: HTMLElement | undefined = $state();
	let labelEditors: Record<string, LocalizedTextInput | undefined> = $state({});
	let liveAnnouncement = $state("");

	/** Read-only rendering of consumer-supplied localized data. */
	function displayText(text: LocalizedText | null | undefined): string {
		return getLocalizedText(text, _displayLanguages);
	}

	function columnLabel(column: FieldColumnDef): string {
		return displayText(column.label) || String(t("untitled_column"));
	}

	/** A column type with something to edit behind the settings toggle. */
	function hasSettings(ct: FieldTypeDef | undefined): boolean {
		return !!(ct?.supportsOptions || ct?.extras?.length);
	}

	function sync() {
		onChange?.();
	}

	// clear-then-set so repeated identical announcements still get read out
	function announce(
		key: string,
		column: FieldColumnDef,
		values?: Record<string, number>
	) {
		liveAnnouncement = "";
		const msg = String(t(key, { label: columnLabel(column), ...values }));
		tick().then(() => (liveAnnouncement = msg));
	}

	// ---------------------------------------------------------------------------
	// keys (the field-key policy, scoped to the sibling columns)
	// ---------------------------------------------------------------------------

	function keyEditable(idx: number): boolean {
		if (_readonly) return false;
		if (!keysImmutable) return true;
		return meta[idx]?.initialKey === undefined;
	}

	function deriveKey(idx: number) {
		const column = list[idx];
		if (!column) return;
		const labelText = getLocalizedText(column.label, _defaultLanguage);
		const base =
			typeof deriveKeyFromLabel === "function"
				? deriveKeyFromLabel(labelText)
				: slugifyKey(labelText, keyMaxLength);
		column.key = base
			? uniqueKey(
					base,
					(k) => list.some((c, i) => i !== idx && c.key === k),
					keyMaxLength
				)
			: "";
	}

	function onLabelInput(idx: number) {
		const m = meta[idx];
		if (
			deriveKeyFromLabel &&
			m &&
			!m.keyTouched &&
			m.initialKey === undefined &&
			keyEditable(idx)
		) {
			deriveKey(idx);
		}
		sync();
	}

	function onKeyInput(idx: number, newKey: string) {
		const column = list[idx];
		if (!column || !keyEditable(idx)) return;
		if (meta[idx]) meta[idx].keyTouched = true;
		column.key = newKey;
		sync();
	}

	// ---------------------------------------------------------------------------
	// add / remove / move / type change
	// ---------------------------------------------------------------------------

	function addColumn() {
		if (_readonly || maxReached) return;
		const ct = columnTypes[0];
		const column: FieldColumnDef = { key: "", type: ct?.type ?? "", label: "" };
		const seeded = seedExtraDefaults(undefined, ct);
		if (seeded) column.extras = seeded;
		// a type with settings opens them right away (there is nothing else to
		// see on a fresh column); a plain type stays a single line
		const m = newColumnMeta(hasSettings(ct));
		columns = [...list, column];
		meta = [...meta, m];
		sync();
		tick().then(() => labelEditors[m.cid]?.focus?.());
	}

	async function removeColumn(idx: number) {
		if (_readonly) return;
		const column = list[idx];
		if (!column) return;
		// veto only for columns that already existed when the value was loaded
		if (meta[idx]?.initialKey !== undefined && onBeforeDelete) {
			let res: void | false;
			try {
				res = await onBeforeDelete($state.snapshot(column));
			} catch {
				res = false;
			}
			if (res === false) return;
		}
		columns = list.filter((_, i) => i !== idx);
		meta = meta.filter((_, i) => i !== idx);
		sync();
		announce("removed_column", column);
	}

	function moveColumn(from: number, to: number) {
		if (_readonly || to < 0 || to >= list.length || from === to) return;
		const nextColumns = [...list];
		const [movedColumn] = nextColumns.splice(from, 1);
		nextColumns.splice(to, 0, movedColumn);
		columns = nextColumns;
		const nextMeta = [...meta];
		const [movedMeta] = nextMeta.splice(from, 1);
		nextMeta.splice(to, 0, movedMeta);
		meta = nextMeta;
		sync();
		announce(to < from ? "moved_up" : "moved_down", movedColumn, {
			position: to + 1,
			total: nextColumns.length,
		});
		focusColumnButton(movedMeta.cid, to < from ? "up" : "down");
	}

	// same pattern as the parent's focusRowButton: re-focus the pressed logical
	// button on the moved line; at a boundary fall back to any enabled one
	function focusColumnButton(cid: string, which: "up" | "down") {
		tick().then(() => {
			const lineEl = rootEl?.querySelector<HTMLElement>(`[data-col-row="${cid}"]`);
			if (!lineEl) return;
			let btn = lineEl.querySelector<HTMLButtonElement>(`[data-col-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					lineEl.querySelector<HTMLButtonElement>(
						`[data-col-btn="up"]:not([disabled])`
					) ||
					lineEl.querySelector<HTMLButtonElement>(
						`[data-col-btn="down"]:not([disabled])`
					);
			}
			btn?.focus();
		});
	}

	async function changeType(idx: number, newType: string, selectEl: HTMLSelectElement) {
		const column = list[idx];
		if (!column) return;
		const prevType = column.type;
		if (newType === prevType) return;
		if (meta[idx]?.initialKey !== undefined && onBeforeTypeChange) {
			let res: void | false;
			try {
				res = await onBeforeTypeChange($state.snapshot(column), newType);
			} catch {
				res = false;
			}
			if (res === false) {
				selectEl.value = prevType;
				return;
			}
		}
		column.type = newType;
		// `options` / `extras` of the previous type are deliberately kept —
		// never silently drop data; switching back restores them
		const ct = typeByName.get(newType);
		const seeded = seedExtraDefaults(column.extras, ct);
		if (seeded !== column.extras) column.extras = seeded;
		if (meta[idx] && hasSettings(ct)) meta[idx].expanded = true;
		sync();
	}

	function typeChanged(idx: number): boolean {
		const m = meta[idx];
		return !!m?.initialType && list[idx]?.type !== m.initialType;
	}

	// ---------------------------------------------------------------------------
	// validation focus (called by the parent's focus-first-offender pass)
	// ---------------------------------------------------------------------------

	/**
	 * Focus the first offending control: the column's label, key, first option
	 * value (or the add-option button) or first extra input, opening the
	 * settings sub-block when needed. With no column-level errors (the list
	 * itself is the problem) the add-column button is focused.
	 */
	export async function focusFirstInvalid(
		columnErrors?: (FieldColumnErrors | null)[] | null
	): Promise<void> {
		const idx = columnErrors?.findIndex(Boolean) ?? -1;
		const errs = idx >= 0 ? columnErrors![idx] : null;
		const cid = meta[idx]?.cid;
		if (!errs || !cid) {
			rootEl?.querySelector<HTMLElement>(".fb-add-column-btn")?.focus?.();
			return;
		}
		if ((errs.options || errs.extras) && meta[idx]) meta[idx].expanded = true;
		await tick();
		const lineEl = rootEl?.querySelector<HTMLElement>(`[data-col-row="${cid}"]`);
		if (errs.label) labelEditors[cid]?.focus?.();
		else if (errs.key) lineEl?.querySelector<HTMLElement>(".fb-column-key")?.focus?.();
		else if (errs.options) {
			lineEl
				?.querySelector<HTMLElement>(
					".fb-options .fb-option-value, .fb-options .fb-add-option-btn"
				)
				?.focus?.();
		} else if (errs.extras) {
			lineEl?.querySelector<HTMLElement>(".fb-extra-input")?.focus?.();
		}
	}

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
		"p-1 rounded",
		"opacity-50 hover:opacity-100",
		"hover:bg-(--stuic-color-muted)",
		"focus-visible:outline-(--stuic-color-border-hover)",
		"disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
	].join(" ");
</script>

<div class="fb-columns w-full" bind:this={rootEl}>
	{#if locked && !list.length}
		<div class="fb-hint text-sm py-1">{t("empty_columns_message")}</div>
	{/if}

	{#each list as column, idx (meta[idx]?.cid ?? idx)}
		{@const m = meta[idx]}
		{@const cid = m?.cid ?? String(idx)}
		{@const ct = typeByName.get(column.type)}
		{@const errs = errors?.[idx]}
		{@const settings = hasSettings(ct)}
		{@const settingsOpen = !!(settings && m?.expanded)}
		<div
			class={twMerge("fb-column py-1", idx > 0 && "fb-column-divider")}
			data-col-row={cid}
		>
			<div class="fb-column-line flex flex-wrap items-center gap-1.5">
				{#if !locked}
					<div class="flex flex-col shrink-0">
						<button
							type="button"
							class={twMerge(BTN_CLS, "p-0.5")}
							data-col-btn="up"
							onclick={() => moveColumn(idx, idx - 1)}
							disabled={_readonly || idx === 0}
							aria-label={String(t("move_up"))}
							{tabindex}
						>
							{@html iconArrowUp({ size: 12 })}
						</button>
						<button
							type="button"
							class={twMerge(BTN_CLS, "p-0.5")}
							data-col-btn="down"
							onclick={() => moveColumn(idx, idx + 1)}
							disabled={_readonly || idx === list.length - 1}
							aria-label={String(t("move_down"))}
							{tabindex}
						>
							{@html iconArrowDown({ size: 12 })}
						</button>
					</div>
				{/if}

				{#if !ct}
					<!-- unknown column type: a degraded read-only line (same stance
					     as an unknown field type) — it can still be moved or removed -->
					<span class="fb-column-unknown-label flex-1 min-w-0 truncate text-sm">
						{columnLabel(column)}
					</span>
					<span class="fb-chip fb-chip-warning shrink-0 inline-flex items-center gap-1">
						{@html iconAlertWarning({ size: 12 })}
						{column.type}
					</span>
					{#if column.key}
						<span class="fb-key shrink-0 truncate">{column.key}</span>
					{/if}
				{:else}
					<div class="fb-column-label flex-1 min-w-40">
						<!-- locked -> readonly (NOT disabled): the labels and their
						     translations must stay reachable and readable -->
						<LocalizedTextInput
							bind:value={column.label}
							bind:this={labelEditors[cid]}
							{languages}
							{defaultLanguage}
							{languageLabels}
							{disabled}
							readonly={locked}
							{tabindex}
							{t}
							class={INPUT_CLS}
							placeholder={String(t("column_label_placeholder"))}
							ariaLabel={String(t("column_label_placeholder"))}
							ariaInvalid={!!errs?.label}
							ariaDescribedby={errs?.label ? `${idPrefix}-${cid}-label-err` : undefined}
							onInput={() => onLabelInput(idx)}
						/>
					</div>

					<select
						class={twMerge(INPUT_CLS, "fb-column-type w-28 sm:w-32 shrink-0")}
						value={column.type}
						onchange={(e) => changeType(idx, e.currentTarget.value, e.currentTarget)}
						disabled={_readonly}
						{tabindex}
						aria-label={String(t("column_type_label"))}
					>
						{#each columnTypes as td (td.type)}
							<option value={td.type}>{displayText(td.label)}</option>
						{/each}
					</select>

					<input
						type="text"
						value={column.key}
						oninput={(e) => onKeyInput(idx, e.currentTarget.value)}
						class={twMerge(MONO_INPUT_CLS, "fb-column-key w-28 sm:w-32 shrink-0")}
						readonly={!keyEditable(idx)}
						{disabled}
						{tabindex}
						placeholder={String(t("column_key_placeholder"))}
						aria-label={String(t("column_key_placeholder"))}
						aria-invalid={!!errs?.key || undefined}
						aria-describedby={errs?.key ? `${idPrefix}-${cid}-key-err` : undefined}
						use:tooltip={() => ({
							enabled: !disabled,
							content: t(keyEditable(idx) ? "column_key_hint" : "key_locked_hint"),
						})}
					/>

					{#if settings}
						<button
							type="button"
							class={twMerge(BTN_CLS, "fb-column-settings-toggle shrink-0")}
							onclick={() => m && (m.expanded = !m.expanded)}
							disabled={!m}
							aria-expanded={settingsOpen}
							aria-label={String(t("column_settings"))}
							{tabindex}
							use:tooltip={() => ({ enabled: true, content: t("column_settings") })}
						>
							<span
								class={twMerge(
									"block transition-transform",
									settingsOpen && "rotate-180"
								)}
								aria-hidden="true"
							>
								{@html iconChevronDown({ size: 14 })}
							</span>
						</button>
					{/if}
				{/if}

				{#if !locked}
					<button
						type="button"
						class={twMerge(BTN_CLS, "shrink-0")}
						onclick={() => removeColumn(idx)}
						disabled={_readonly}
						aria-label={String(t("remove_column"))}
						{tabindex}
						use:tooltip={() => ({ enabled: !_readonly, content: t("remove_column") })}
					>
						{@html iconTrash({ size: 14 })}
					</button>
				{/if}
			</div>

			{#if !ct}
				<div class="fb-warning-text text-xs mt-1 flex items-start gap-1">
					{@html iconAlertWarning({ size: 12 })}
					<span>{t("unknown_column_type_warning")}</span>
				</div>
			{:else}
				{#if errs?.label}
					<div id="{idPrefix}-{cid}-label-err" class="fb-error-text text-sm mt-0.5">
						{errs.label}
					</div>
				{/if}
				{#if errs?.key}
					<div id="{idPrefix}-{cid}-key-err" class="fb-error-text text-sm mt-0.5">
						{errs.key}
					</div>
				{/if}
				{#if typeChanged(idx)}
					<div class="fb-warning-text text-xs mt-1 flex items-start gap-1">
						{@html iconAlertWarning({ size: 12 })}
						<span>{t("column_type_change_warning")}</span>
					</div>
				{/if}

				{#if settingsOpen}
					<div class="fb-column-settings flex flex-col gap-2.5 mt-1.5">
						{#if ct.supportsOptions}
							<div
								class="fb-field"
								role="group"
								aria-label={String(t("options_label"))}
								aria-describedby={errs?.options
									? `${idPrefix}-${cid}-options-err`
									: undefined}
							>
								<div class="fb-sub-label">{t("options_label")}</div>
								<OptionsEditor
									bind:options={column.options}
									{languages}
									{defaultLanguage}
									{displayLanguage}
									{languageLabels}
									{disabled}
									{locked}
									{tabindex}
									{t}
									onChange={sync}
								/>
								{#if errs?.options}
									<div
										id="{idPrefix}-{cid}-options-err"
										class="fb-error-text text-sm mt-0.5"
									>
										{errs.options}
									</div>
								{/if}
							</div>
						{/if}
						{#if ct.extras?.length}
							<ExtrasEditor
								bind:extras={column.extras}
								defs={ct.extras}
								displayLanguages={_displayLanguages}
								idPrefix="{idPrefix}-{cid}"
								disabled={_readonly}
								{tabindex}
								error={errs?.extras}
								onChange={sync}
							/>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	{/each}

	{#if !locked}
		<div class={twMerge("flex items-center gap-2", list.length > 0 && "mt-1")}>
			<button
				type="button"
				onclick={addColumn}
				class={twMerge(
					"fb-add-column-btn",
					"flex items-center gap-1 text-sm opacity-75 hover:opacity-100",
					"bg-(--stuic-color-muted)",
					"p-1 pr-2 rounded hover:bg-(--stuic-color-muted-hover)",
					"disabled:opacity-25 disabled:cursor-not-allowed"
				)}
				disabled={_readonly || maxReached}
				{tabindex}
			>
				{@html iconPlus({ size: 14 })}
				<span>{t("add_column")}</span>
			</button>
			{#if maxReached}
				<span class="fb-hint text-xs">{t("err_max_columns", { max: maxColumns! })}</span>
			{/if}
		</div>
	{/if}

	<div class="sr-only" aria-live="polite">{liveAnnouncement}</div>
</div>
