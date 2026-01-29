<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		ValidateOptions,
		ValidationResult,
	} from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		value?: string;
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
		classLanguageLabel?: string;
		classLanguageInput?: string;
		classToggleButton?: string;
		style?: string;
		// localization specific
		languages: string[];
		defaultLanguage?: string;
		expanded?: boolean;
		multiline?: boolean;
		languageLabels?: Record<string, string>;
		placeholder?: string;
		onChange?: (value: string) => void;
		t?: TranslateFn;
		// if true, will always serialize as Record<locale, value> even if only one language
		forceLocalizedOutput?: boolean;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { autogrow } from "../../actions/autogrow.svelte.js";
	import { tooltip } from "../../actions/index.js";
	import { validate as validateAction } from "../../actions/validate.svelte.js";
	import { iconChevronDown, iconChevronUp, iconLanguages } from "../../icons/index.js";
	import { getId } from "../../utils/get-id.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { maybeJsonParse } from "../../utils/maybe-json-parse.js";
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
			default_language_required: "The default language translation is required",
			show_translations: "Show translations",
			hide_translations: "Hide translations",
		};
		let out = m[k] ?? fallback ?? k;
		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	interface TranslationEntry {
		language: string;
		value: string;
	}

	let {
		value = $bindable(""),
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
		classLanguageLabel,
		classLanguageInput,
		classToggleButton,
		style,
		//
		languages,
		defaultLanguage,
		expanded = $bindable(false),
		multiline = false,
		languageLabels,
		placeholder,
		onChange,
		t = t_default,
		forceLocalizedOutput,
	}: Props = $props();

	let hiddenInputEl: HTMLInputElement | undefined = $state();

	let _defaultLanguage = $derived(defaultLanguage || languages[0]);

	// Sorted languages: default first, rest in original order
	let sortedLanguages = $derived.by(() => {
		const rest = languages.filter((l) => l !== _defaultLanguage);
		return [_defaultLanguage, ...rest];
	});

	// Parse serialized value into entries
	function parseValue(serialized: string | undefined): TranslationEntry[] {
		if (!serialized) {
			return sortedLanguages.map((l) => ({ language: l, value: "" }));
		}

		const parsed = maybeJsonParse(serialized);

		if (typeof parsed === "string") {
			// Plain string: assign to default language
			return sortedLanguages.map((l) => ({
				language: l,
				value: l === _defaultLanguage ? parsed : "",
			}));
		}

		if (isPlainObject(parsed)) {
			const obj = parsed as Record<string, string>;
			return sortedLanguages.map((l) => ({
				language: l,
				value: obj[l] || "",
			}));
		}

		return sortedLanguages.map((l) => ({ language: l, value: "" }));
	}

	// Serialize entries back to string
	function serializeEntries(entries: TranslationEntry[]): string {
		const nonEmpty = entries.filter((e) => e.value.trim() !== "");

		if (nonEmpty.length === 0) return "";

		// If only default language has content, return plain string
		if (
			nonEmpty.length === 1 &&
			nonEmpty[0].language === _defaultLanguage &&
			!forceLocalizedOutput
		) {
			return nonEmpty[0].value;
		}

		// Multiple languages: JSON
		const obj: Record<string, string> = {};
		for (const e of entries) {
			if (e.value.trim() !== "") {
				obj[e.language] = e.value;
			}
		}
		return JSON.stringify(obj);
	}

	// Internal state
	let entries: TranslationEntry[] = $state(parseValue(value));

	// Count of non-default languages with content
	let filledCount = $derived(
		entries.filter((e) => e.language !== _defaultLanguage && e.value.trim() !== "").length
	);
	let otherCount = $derived(sortedLanguages.length - 1);

	// Sync internal → external
	function syncToValue() {
		value = serializeEntries(entries);
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
		});
		onChange?.(value);
	}

	// Sync external → internal (avoid circular updates)
	$effect(() => {
		const newEntries = parseValue(value);
		const currentSerialized = serializeEntries(entries);
		const newSerialized = serializeEntries(newEntries);
		if (currentSerialized !== newSerialized) {
			entries = newEntries;
		}
	});

	function updateEntry(language: string, newValue: string) {
		const entry = entries.find((e) => e.language === language);
		if (entry) {
			entry.value = newValue;
			syncToValue();
		}
	}

	// Validation
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let wrappedValidate: Omit<ValidateOptions, "setValidationResult"> = $derived({
		enabled: true,
		customValidator(val: any, context: Record<string, any> | undefined, el: any) {
			if (required) {
				const defaultEntry = entries.find((e) => e.language === _defaultLanguage);
				if (!defaultEntry || !defaultEntry.value.trim()) {
					return t("default_language_required");
				}
			}
			// Delegate to provided validator
			return (validate as any)?.customValidator?.(val, context, el) || "";
		},
		setValidationResult,
	});

	const INPUT_CLS = [
		"w-full",
		// "rounded bg-neutral-50 dark:bg-neutral-800",
		// "focus:outline-none focus:ring-0",
		// "border border-neutral-300 dark:border-neutral-600",
		// "focus:border-neutral-400 focus:dark:border-neutral-500",
		// "focus-visible:outline-none focus-visible:ring-0",
	].join(" ");

	const INPUT_EXPANDED_CLS = [
		// "w-full",
		// "rounded bg-neutral-50 dark:bg-neutral-800",
		// "focus:outline-none focus:ring-0",
		"border border-neutral-300 dark:border-neutral-600",
		// "focus:border-neutral-400 focus:dark:border-neutral-500",
		// "focus-visible:outline-none focus-visible:ring-0",
	].join(" ");

	const BTN_CLS = [
		"px-2 rounded-r block",
		"opacity-60 hover:opacity-100",
		"min-w-[44px] min-h-[44px]",
		"flex items-center justify-center",
		"hover:bg-neutral-200 dark:hover:bg-neutral-600",
		// "focus-visible:outline-neutral-400",
		// "disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent",
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
	<div class="w-full flex">
		<div class="flex-1">
			{#if !expanded}
				{#if multiline}
					<textarea
						value={entries.find((e) => e.language === _defaultLanguage)?.value ?? ""}
						oninput={(e) => updateEntry(_defaultLanguage, e.currentTarget.value)}
						class={twMerge(
							INPUT_CLS,
							expanded && INPUT_EXPANDED_CLS,
							"min-h-16",
							classLanguageInput
						)}
						{disabled}
						{tabindex}
						{placeholder}
						use:autogrow={() => ({
							enabled: true,
							value: entries.find((e) => e.language === _defaultLanguage)?.value,
						})}
					></textarea>
				{:else}
					<input
						type="text"
						value={entries.find((e) => e.language === _defaultLanguage)?.value ?? ""}
						oninput={(e) => updateEntry(_defaultLanguage, e.currentTarget.value)}
						class={twMerge(INPUT_CLS, expanded && INPUT_EXPANDED_CLS, classLanguageInput)}
						{disabled}
						{tabindex}
						{placeholder}
					/>
				{/if}
			{:else}
				<div class="">
					<!-- Expanded: all language rows -->
					{#each sortedLanguages as lang, idx (lang)}
						<div
							class={twMerge(
								"flex-1 flex gap-2 items-center pl-2",
								idx > 0 && "border-t border-neutral-200 dark:border-neutral-600",
								classEntry
							)}
						>
							<div
								class={twMerge(
									"shrink-0 min-w-8",
									"flex",
									"text-sm font-medium opacity-60 uppercase",
									lang === _defaultLanguage &&
										"after:content-['*'] after:opacity-40 after:pl-0.5",
									classLanguageLabel
								)}
							>
								{languageLabels?.[lang] || lang}
							</div>
							<div class="flex-1">
								{#if multiline}
									<textarea
										value={entries.find((e) => e.language === lang)?.value ?? ""}
										oninput={(e) => updateEntry(lang, e.currentTarget.value)}
										class={twMerge(INPUT_CLS, "p-0 py-2 min-h-16", classLanguageInput)}
										{disabled}
										{tabindex}
										use:autogrow={() => ({
											enabled: true,
											value: entries.find((e) => e.language === lang)?.value,
										})}
									></textarea>
								{:else}
									<input
										type="text"
										value={entries.find((e) => e.language === lang)?.value ?? ""}
										oninput={(e) => updateEntry(lang, e.currentTarget.value)}
										class={twMerge(INPUT_CLS, "p-0", classLanguageInput)}
										{disabled}
										{tabindex}
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		{#if otherCount > 0}
			<button
				type="button"
				class={twMerge(BTN_CLS, classToggleButton)}
				onclick={() => (expanded = !expanded)}
				{disabled}
				use:tooltip={() => ({
					enabled: true,
					content: t(expanded ? "hide_translations" : "show_translations"),
				})}
			>
				{#if expanded}
					{@html iconChevronUp({ size: 19 })}
				{:else}
					{@html iconLanguages({ size: 19 })}
				{/if}
			</button>
		{/if}
	</div>
</InputWrap>

<!-- Hidden input for form submission and validation -->
<input
	type="hidden"
	{name}
	value={value ?? ""}
	bind:this={hiddenInputEl}
	use:validateAction={() => wrappedValidate}
/>
