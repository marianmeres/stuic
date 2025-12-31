<script lang="ts" module>
	import type { Snippet } from "svelte";
	import {
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface KeyValueEntry {
		id: string;
		key: string;
		value: string;
	}

	export interface Props extends Record<string, any> {
		value: string;
		name: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		classEntry?: string;
		classKeyInput?: string;
		classValueInput?: string;
		style?: string;
		keyPlaceholder?: string;
		valuePlaceholder?: string;
		addLabel?: string;
		emptyMessage?: string;
		onChange?: (value: string) => void;
		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import { iconFeatherChevronDown } from "@marianmeres/icons-fns/feather/iconFeatherChevronDown.js";
	import { iconFeatherChevronUp } from "@marianmeres/icons-fns/feather/iconFeatherChevronUp.js";
	import { iconFeatherPlus } from "@marianmeres/icons-fns/feather/iconFeatherPlus.js";
	import { iconFeatherTrash2 } from "@marianmeres/icons-fns/feather/iconFeatherTrash2.js";
	import { tick } from "svelte";
	import { autogrow } from "../../actions/autogrow.svelte.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			field_req_att: "This field requires attention. Please review and try again.",
			key_placeholder: "Key",
			value_placeholder: "Value",
			add_label: "Add",
			empty_message: "No entries",
			remove_entry: "Remove entry",
			move_up: "Move up",
			move_down: "Move down",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	let {
		value = $bindable("[]"),
		name,
		id = getId(),
		label,
		description,
		class: classProp,
		tabindex = 0,
		renderSize = "md",
		required = false,
		disabled = false,
		validate,
		labelAfter,
		below,
		labelLeft,
		labelLeftWidth,
		labelLeftBreakpoint,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classDescBox,
		classBelowBox,
		classEntry,
		classKeyInput,
		classValueInput,
		style,
		keyPlaceholder,
		valuePlaceholder,
		addLabel,
		emptyMessage,
		onChange,
		t = t_default,
	}: Props = $props();

	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let keyInputRefs: HTMLInputElement[] = $state([]);

	// Internal state
	let entries: KeyValueEntry[] = $state(parseValue(value));

	// Parse external JSON string to internal entries
	function parseValue(jsonString: string): KeyValueEntry[] {
		try {
			const parsed = JSON.parse(jsonString || "[]");
			if (!Array.isArray(parsed)) return [];
			return parsed.map(([key, val]: [string, string]) => ({
				id: getId("entry-"),
				key: key ?? "",
				value: val ?? "",
			}));
		} catch (e) {
			return [];
		}
	}

	// Serialize internal entries to external JSON string
	function serializeValue(entries: KeyValueEntry[]): string {
		return JSON.stringify(entries.map((e) => [e.key, e.value]));
	}

	// Sync internal state to external value
	function syncToValue() {
		value = serializeValue(entries);
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
		onChange?.(value);
	}

	// Sync external value to internal state when it changes externally
	$effect(() => {
		const newEntries = parseValue(value);
		const currentSerialized = serializeValue(entries);
		const newSerialized = serializeValue(newEntries);
		if (currentSerialized !== newSerialized) {
			entries = newEntries;
		}
	});

	// Add new entry
	function addEntry() {
		const newEntry = { id: getId("entry-"), key: "", value: "" };
		entries = [...entries, newEntry];
		syncToValue();
		// Focus the new key input after render
		tick().then(() => {
			const lastInput = keyInputRefs[keyInputRefs.length - 1];
			lastInput?.focus();
		});
	}

	// Remove entry by index
	function removeEntry(idx: number) {
		entries = entries.filter((_, i) => i !== idx);
		syncToValue();
	}

	// Move entry up or down
	function moveEntry(idx: number, direction: "up" | "down") {
		const newIdx = direction === "up" ? idx - 1 : idx + 1;
		if (newIdx < 0 || newIdx >= entries.length) return;

		const newEntries = [...entries];
		[newEntries[idx], newEntries[newIdx]] = [newEntries[newIdx], newEntries[idx]];
		entries = newEntries;
		syncToValue();
	}

	// Update entry field
	function updateEntry(idx: number, field: "key" | "value", newValue: string) {
		entries[idx][field] = newValue;
		syncToValue();
	}

	// Validation
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(val: any, context: Record<string, any> | undefined, el: any) {
			// Validate JSON structure
			try {
				const parsed = JSON.parse(val || "[]");
				if (!Array.isArray(parsed)) return "typeMismatch";
				for (const entry of parsed) {
					if (!Array.isArray(entry) || entry.length !== 2) return "typeMismatch";
				}
			} catch (e) {
				return "typeMismatch";
			}

			// Required check
			if (required && !entries.length) return "valueMissing";

			// Continue with provided validator
			return (validate as any)?.customValidator?.(val, context, el) || "";
		},
		t(reason: keyof ValidityStateFlags, val: any, fallback: string) {
			return t("field_req_att");
		},
		setValidationResult,
	});

	const BTN_CLS = [
		"p-1 rounded",
		"opacity-50 hover:opacity-100",
		"hover:bg-neutral-200 dark:hover:bg-neutral-600",
		"focus-visible:outline-neutral-400",
		"disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
	].join(" ");

	const INPUT_CLS = [
		"rounded bg-neutral-50 dark:bg-neutral-800",
		"border border-neutral-300 dark:border-neutral-600",
		"focus:outline-none focus:ring-0 focus:border-neutral-400 focus:dark:border-neutral-500",
		"focus-visible:outline-none focus-visible:ring-0",
		// "form-input min-w-0 px-2 py-1 rounded",
		// "bg-transparent focus:ring-0",
		// "focus:border-neutral-400 dark:focus:border-neutral-400",
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
	class={twMerge("m-0", classProp)}
	{labelLeft}
	{labelLeftWidth}
	{labelLeftBreakpoint}
	{classLabel}
	{classLabelBox}
	{classInputBox}
	{classInputBoxWrap}
	{classDescBox}
	{classBelowBox}
	{validation}
	{style}
>
	<div class="w-full">
		{#if entries.length === 0}
			<div class="p-3 text-sm opacity-50 text-center">
				{emptyMessage ?? t("empty_message")}
			</div>
		{:else}
			<div class="p-2">
				{#each entries as entry, idx (entry.id)}
					<div
						class={twMerge(
							"flex gap-2 items-start py-2",
							idx > 0 && "border-t border-neutral-200 dark:border-neutral-600",
							classEntry
						)}
					>
						<!-- Key/Value inputs -->
						<div class="flex-1 flex flex-col gap-1">
							<!-- Key input (single-line) -->
							<input
								type="text"
								value={entry.key}
								oninput={(e) => updateEntry(idx, "key", e.currentTarget.value)}
								placeholder={keyPlaceholder ?? t("key_placeholder")}
								class={twMerge(
									INPUT_CLS,
									"flex-1",
									renderSize === "sm" && "text-sm",
									classKeyInput
								)}
								{disabled}
								{tabindex}
								bind:this={keyInputRefs[idx]}
							/>

							<!-- Value textarea -->
							<textarea
								value={entry.value}
								oninput={(e) => updateEntry(idx, "value", e.currentTarget.value)}
								placeholder={valuePlaceholder ?? t("value_placeholder")}
								class={twMerge(
									INPUT_CLS,
									"min-h-8",
									renderSize === "sm" && "text-sm",
									classValueInput
								)}
								style="resize: vertical;"
								rows={1}
								{disabled}
								{tabindex}
								use:autogrow={() => ({ enabled: true, value: entry.value })}
							></textarea>
						</div>

						<!-- Controls: Up/Down + Delete -->
						<div class="flex flex-col gap-0.5 pt-0.5">
							<button
								type="button"
								onclick={() => moveEntry(idx, "up")}
								disabled={disabled || idx === 0}
								class={BTN_CLS}
								aria-label={t("move_up")}
							>
								{@html iconFeatherChevronUp({ size: 14 })}
							</button>
							<button
								type="button"
								onclick={() => moveEntry(idx, "down")}
								disabled={disabled || idx === entries.length - 1}
								class={BTN_CLS}
								aria-label={t("move_down")}
							>
								{@html iconFeatherChevronDown({ size: 14 })}
							</button>
							<button
								type="button"
								onclick={() => removeEntry(idx)}
								class={BTN_CLS}
								{disabled}
								aria-label={t("remove_entry")}
							>
								{@html iconFeatherTrash2({ size: 14 })}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Add button -->
		<div
			class={twMerge(
				"p-2",
				entries.length > 0 && "border-t border-neutral-200 dark:border-neutral-600"
			)}
		>
			<button
				type="button"
				onclick={addEntry}
				class={twMerge(
					"flex items-center gap-1 text-sm opacity-75 hover:opacity-100",
					"p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
				)}
				{disabled}
			>
				{@html iconFeatherPlus({ size: 16 })}
				<span>{addLabel ?? t("add_label")}</span>
			</button>
		</div>
	</div>
</InputWrap>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	{value}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
