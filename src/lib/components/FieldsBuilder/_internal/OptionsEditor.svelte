<!--
	INTERNAL to FieldsBuilder — not exported from the package.

	Editor for a choice-type field's option list (`FieldOptionDef[]`): add,
	remove, reorder (buttons), localized labels, and auto-derived machine
	values. Note this deliberately does NOT reuse `FieldOptions` — that
	component is a select-from-a-list picker, not an option-list author.

	Value derivation mirrors the field-key policy: while an option's value is
	untouched, it is derived from the label (slugified, unique among sibling
	values); the first manual edit stops derivation for that option. Options
	present at mount never re-derive (their value may already identify stored
	data).

	Each option carries internal meta ({ oid, touched }) kept in lockstep with
	the bound `options` array. The #each is keyed by `oid` so reordering MOVES
	the DOM rows — focus travels with the row — and a focus-follow pass (same
	pattern as the parent's focusRowButton) covers the disabled-at-boundary
	case. Moves/removals are announced via a local polite live region.
-->
<script lang="ts">
	import { tick } from "svelte";
	import { tooltip } from "../../../actions/index.js";
	import {
		iconArrowDown,
		iconArrowUp,
		iconPlus,
		iconTrash,
	} from "../../../icons/index.js";
	import { getId } from "../../../utils/get-id.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import type { TranslateFn } from "../../../types.js";
	import type { FieldOptionDef } from "../types.js";
	import { getLocalizedText, slugifyKey, uniqueKey } from "../utils.js";
	import LocalizedTextInput from "./LocalizedTextInput.svelte";

	interface Props {
		options?: FieldOptionDef[];
		languages?: string[];
		defaultLanguage?: string;
		languageLabels?: Record<string, string>;
		disabled?: boolean;
		/** `lock.options` — render the list read-only. */
		locked?: boolean;
		tabindex?: number;
		t?: TranslateFn;
		/** Fired after any change to `options`. */
		onChange?: () => void;
	}

	let {
		options = $bindable(),
		languages,
		defaultLanguage,
		languageLabels,
		disabled = false,
		locked = false,
		tabindex = 0,
		t = (k: string) => k,
		onChange,
	}: Props = $props();

	const _defaultLanguage = $derived(defaultLanguage || languages?.[0]);

	interface OptionMeta {
		/** Stable render id (options themselves have no identity). */
		oid: string;
		/** Value manually edited — derivation stops. Mount-time options: true. */
		touched: boolean;
	}

	// index-aligned with `options`; every mutation below keeps them in lockstep
	let meta: OptionMeta[] = $state(
		(options ?? []).map(() => ({ oid: getId(), touched: true }))
	);

	let rootEl: HTMLElement | undefined = $state();
	let labelEditors: Record<string, LocalizedTextInput | undefined> = $state({});
	let liveAnnouncement = $state("");

	const _readonly = $derived(disabled || locked);

	function sync() {
		onChange?.();
	}

	// clear-then-set so repeated identical announcements still get read out
	function announce(
		key: string,
		option: FieldOptionDef,
		values?: Record<string, number>
	) {
		liveAnnouncement = "";
		const msg = String(
			t(key, { label: getLocalizedText(option.label, _defaultLanguage), ...values })
		);
		tick().then(() => (liveAnnouncement = msg));
	}

	function addOption() {
		const m: OptionMeta = { oid: getId(), touched: false };
		options = [...(options ?? []), { value: "", label: "" }];
		meta = [...meta, m];
		sync();
		tick().then(() => labelEditors[m.oid]?.focus?.());
	}

	function removeOption(idx: number) {
		const option = (options ?? [])[idx];
		options = (options ?? []).filter((_, i) => i !== idx);
		meta = meta.filter((_, i) => i !== idx);
		sync();
		if (option) announce("removed_option", option);
	}

	function moveOption(from: number, to: number) {
		const list = options ?? [];
		if (to < 0 || to >= list.length || from === to) return;
		const nextOptions = [...list];
		const [movedOption] = nextOptions.splice(from, 1);
		nextOptions.splice(to, 0, movedOption);
		options = nextOptions;
		const nextMeta = [...meta];
		const [movedMeta] = nextMeta.splice(from, 1);
		nextMeta.splice(to, 0, movedMeta);
		meta = nextMeta;
		sync();
		announce(to < from ? "moved_up" : "moved_down", movedOption, {
			position: to + 1,
			total: nextOptions.length,
		});
		focusOptionButton(movedMeta.oid, to < from ? "up" : "down");
	}

	// same pattern as the parent's focusRowButton: re-focus the pressed logical
	// button on the moved row; at a boundary fall back to any enabled one
	function focusOptionButton(oid: string, which: "up" | "down") {
		tick().then(() => {
			const rowEl = rootEl?.querySelector<HTMLElement>(`[data-opt-row="${oid}"]`);
			if (!rowEl) return;
			let btn = rowEl.querySelector<HTMLButtonElement>(`[data-opt-btn="${which}"]`);
			if (!btn || btn.disabled) {
				btn =
					rowEl.querySelector<HTMLButtonElement>(`[data-opt-btn="up"]:not([disabled])`) ||
					rowEl.querySelector<HTMLButtonElement>(`[data-opt-btn="down"]:not([disabled])`);
			}
			btn?.focus();
		});
	}

	function onLabelInput(idx: number) {
		const list = options ?? [];
		const option = list[idx];
		if (!option || meta[idx]?.touched) return sync();
		const base = slugifyKey(getLocalizedText(option.label, _defaultLanguage));
		option.value = base
			? uniqueKey(base, (v) => list.some((o, i) => i !== idx && o.value === v))
			: "";
		sync();
	}

	function onValueInput(idx: number, newValue: string) {
		const option = (options ?? [])[idx];
		if (!option) return;
		if (meta[idx]) meta[idx].touched = true;
		option.value = newValue;
		sync();
	}

	const INPUT_CLS = [
		"rounded bg-(--stuic-color-input)",
		"border border-(--stuic-color-border)",
		"focus:border-(--stuic-color-border-hover)",
		"focus:outline-none focus:ring-0",
		"focus-visible:outline-none focus-visible:ring-0",
	].join(" ");

	const VALUE_INPUT_CLS = twMerge(INPUT_CLS, "font-mono text-sm");

	const BTN_CLS = [
		"p-1 rounded",
		"opacity-50 hover:opacity-100",
		"hover:bg-(--stuic-color-muted)",
		"focus-visible:outline-(--stuic-color-border-hover)",
		"disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
	].join(" ");
</script>

<div class="fb-options w-full" bind:this={rootEl}>
	{#if locked && !(options ?? []).length}
		<div class="fb-hint text-sm py-1">{t("empty_options_message")}</div>
	{/if}

	{#each options ?? [] as option, idx (meta[idx]?.oid ?? idx)}
		<div
			class={twMerge(
				"fb-option-row flex items-center gap-1.5 py-1",
				idx > 0 && "fb-option-divider"
			)}
			data-opt-row={meta[idx]?.oid}
		>
			{#if !locked}
				<div class="flex flex-col shrink-0">
					<button
						type="button"
						class={twMerge(BTN_CLS, "p-0.5")}
						data-opt-btn="up"
						onclick={() => moveOption(idx, idx - 1)}
						disabled={_readonly || idx === 0}
						aria-label={String(t("move_up"))}
					>
						{@html iconArrowUp({ size: 12 })}
					</button>
					<button
						type="button"
						class={twMerge(BTN_CLS, "p-0.5")}
						data-opt-btn="down"
						onclick={() => moveOption(idx, idx + 1)}
						disabled={_readonly || idx === (options?.length ?? 0) - 1}
						aria-label={String(t("move_down"))}
					>
						{@html iconArrowDown({ size: 12 })}
					</button>
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				<!-- locked -> readonly (NOT disabled): the labels and their
				     translations must stay reachable and readable -->
				<LocalizedTextInput
					bind:value={option.label}
					bind:this={labelEditors[meta[idx]?.oid ?? String(idx)]}
					{languages}
					{defaultLanguage}
					{languageLabels}
					{disabled}
					readonly={locked}
					{tabindex}
					{t}
					class={INPUT_CLS}
					placeholder={String(t("option_label_placeholder"))}
					ariaLabel={String(t("option_label_placeholder"))}
					onInput={() => onLabelInput(idx)}
				/>
			</div>

			<input
				type="text"
				value={option.value}
				oninput={(e) => onValueInput(idx, e.currentTarget.value)}
				class={twMerge(VALUE_INPUT_CLS, "fb-option-value w-28 sm:w-36 shrink-0")}
				readonly={locked}
				{disabled}
				{tabindex}
				placeholder={String(t("option_value_placeholder"))}
				aria-label={String(t("option_value_placeholder"))}
				use:tooltip={() => ({ enabled: !_readonly, content: t("option_value_hint") })}
			/>

			{#if !locked}
				<button
					type="button"
					class={twMerge(BTN_CLS, "shrink-0")}
					onclick={() => removeOption(idx)}
					disabled={_readonly}
					aria-label={String(t("remove_option"))}
					use:tooltip={() => ({ enabled: !_readonly, content: t("remove_option") })}
				>
					{@html iconTrash({ size: 14 })}
				</button>
			{/if}
		</div>
	{/each}

	{#if !locked}
		<button
			type="button"
			onclick={addOption}
			class={twMerge(
				"fb-add-option-btn",
				"flex items-center gap-1 text-sm opacity-75 hover:opacity-100",
				"bg-(--stuic-color-muted)",
				"p-1 pr-2 rounded hover:bg-(--stuic-color-muted-hover)",
				"disabled:opacity-25 disabled:cursor-not-allowed",
				(options ?? []).length > 0 && "mt-1"
			)}
			{disabled}
			{tabindex}
		>
			{@html iconPlus({ size: 14 })}
			<span>{t("add_option")}</span>
		</button>
	{/if}

	<div class="sr-only" aria-live="polite">{liveAnnouncement}</div>
</div>
