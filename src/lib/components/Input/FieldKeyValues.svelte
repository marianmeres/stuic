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
		key: string;
		value: string; // Raw input from user
		parsedValue: unknown; // Parsed JSON value
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
		strictJsonValidation?: boolean;
		t?: TranslateFn;
	}
</script>

<script lang="ts">
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
			entry_required: "At least one entry is required",
			key_placeholder: "Key",
			value_placeholder: "Value",
			add_label: "Add",
			empty_message: "No entries",
			remove_entry: "Remove entry",
			duplicate_keys: "Duplicate keys are not allowed",
			invalid_json_syntax: "Invalid JSON syntax. Check for missing quotes or brackets.",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	const SERIALIZED_DEFAULT = "{}";

	let {
		value = $bindable(),
		name,
		id = getId(),
		label,
		description,
		class: classProp,
		tabindex = 0,
		renderSize = "sm",
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
		strictJsonValidation = true,
		t = t_default,
	}: Props = $props();

	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let keyInputRefs: HTMLInputElement[] = $state([]);
	let entryJsonErrors: boolean[] = $state([]);

	// Internal state - handle undefined value from async form initialization
	let entries: KeyValueEntry[] = $state(parseValue(value ?? SERIALIZED_DEFAULT));

	// Parse JSON value with auto-detect: try JSON first, fallback to plain string
	// Returns intendedJson=true if input looks like JSON (starts with { or [)
	// Returns parseError=true if JSON parse failed
	function parseJsonValue(input: string): {
		value: unknown;
		intendedJson: boolean;
		parseError: boolean;
	} {
		const trimmed = input.trim();
		if (trimmed === "") return { value: "", intendedJson: false, parseError: false };

		// Heuristics: input looks like it's trying to be JSON
		const intendedJson = trimmed.startsWith("{") || trimmed.startsWith("[");

		try {
			const parsed = JSON.parse(trimmed);
			return { value: parsed, intendedJson, parseError: false };
		} catch {
			// If parse fails, treat as plain string but flag the error
			return { value: trimmed, intendedJson, parseError: intendedJson };
		}
	}

	// Parse external JSON string to internal entries
	function parseValue(jsonString: string): KeyValueEntry[] {
		try {
			const parsed = JSON.parse(jsonString || SERIALIZED_DEFAULT);
			if (!isPlainObject(parsed)) return [];
			return Object.entries(parsed).map(([key, val]) => ({
				key,
				value: typeof val === "string" ? val : JSON.stringify(val),
				parsedValue: val,
			}));
		} catch (e) {
			return [];
		}
	}

	// Serialize internal entries to external JSON string
	function serializeValue(entries: KeyValueEntry[]): string {
		const obj: Record<string, unknown> = {};
		for (const e of entries) {
			if (e.key) {
				obj[e.key] = e.parsedValue;
			}
		}
		return JSON.stringify(obj);
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
		const newEntries = parseValue(value ?? SERIALIZED_DEFAULT);
		const currentSerialized = serializeValue(entries);
		const newSerialized = serializeValue(newEntries);
		if (currentSerialized !== newSerialized) {
			entries = newEntries;
			// Reset JSON errors when external value changes (assume valid JSON from external source)
			entryJsonErrors = new Array(newEntries.length).fill(false);
		}
	});

	// Add new entry
	function addEntry() {
		const newEntry: KeyValueEntry = { key: "", value: "", parsedValue: "" };
		entries = [...entries, newEntry];
		entryJsonErrors = [...entryJsonErrors, false];
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
		entryJsonErrors = entryJsonErrors.filter((_, i) => i !== idx);
		syncToValue();
	}

	// Update entry field
	function updateEntry(idx: number, field: "key" | "value", newValue: string) {
		if (field === "value") {
			const { value: parsed, parseError } = parseJsonValue(newValue);
			entries[idx].value = newValue;
			entries[idx].parsedValue = parsed;
			entryJsonErrors[idx] = parseError;
		} else {
			entries[idx].key = newValue;
		}
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
				const parsed = JSON.parse(val || SERIALIZED_DEFAULT);
				if (!isPlainObject(parsed)) return t("field_req_att");
			} catch (e) {
				return t("field_req_att");
			}

			// Get non-empty keys first (used for both required and duplicate checks)
			const keys = entries.map((e) => e.key).filter((k) => k.trim() !== "");

			// Required check FIRST - must have at least one entry with non-empty key
			if (required && keys.length === 0) return t("entry_required");

			// Then check for duplicate keys
			const uniqueKeys = new Set(keys);
			if (keys.length !== uniqueKeys.size) {
				return t("duplicate_keys");
			}

			// Check for JSON syntax errors when strictJsonValidation is enabled
			if (strictJsonValidation && entryJsonErrors.some(Boolean)) {
				return t("invalid_json_syntax");
			}

			// Continue with provided validator
			return (validate as any)?.customValidator?.(val, context, el) || "";
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
		"focus:outline-none focus:ring-0",
		"border border-neutral-300 dark:border-neutral-600",
		"focus:border-neutral-400 focus:dark:border-neutral-500",
		"focus-visible:outline-none focus-visible:ring-0",
		// "py-1.5 px-2.5",
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
	class={classProp}
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
				{#each entries as entry, idx (idx)}
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
									"min-h-10 overflow-auto",
									renderSize === "sm" && "text-sm",
									classValueInput
								)}
								style="resize: vertical;"
								{disabled}
								{tabindex}
							></textarea>
							<!-- use:autogrow={() => ({ enabled: true, value: entry.value })} -->
						</div>

						<!-- Delete button -->
						<div class="pt-0.5">
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
					"bg-neutral-200 dark:bg-neutral-600",
					"p-1 pr-2 rounded hover:bg-neutral-300 dark:hover:bg-neutral-500"
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
	value={value ?? SERIALIZED_DEFAULT}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
