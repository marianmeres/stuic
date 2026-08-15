<!--
	INTERNAL to FieldsBuilder — not exported from the package.

	A compact `LocalizedText` editor (plain string | Record<language, string>).
	UX mirrors FieldInputLocalized (default-language input + a toggle revealing
	per-language rows) and reuses its `.stuic-input-localized` CSS, but differs
	on purpose: it operates on the live LocalizedText value (no JSON string
	round-trip), renders no InputWrap/label chrome (it lives inside a builder
	row), and its inputs are nameless so a wrapping <form> never receives stray
	entries for every row.

	Value shape rule (same as FieldInputLocalized's serialization): content in
	the default language only → plain string; content in more languages →
	record with empty entries dropped. Languages absent/single → plain string,
	except a record arriving with foreign-language content is preserved as a
	record (never silently drop data).
-->
<script lang="ts">
	import { autogrow } from "../../../actions/autogrow.svelte.js";
	import { tooltip } from "../../../actions/index.js";
	import { iconChevronUp, iconLanguages } from "../../../icons/index.js";
	import { isPlainObject } from "../../../utils/is-plain-object.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import type { TranslateFn } from "../../../types.js";
	import type { LocalizedText } from "../types.js";
	import { getLocalizedText } from "../utils.js";

	interface Props {
		value?: LocalizedText;
		languages?: string[];
		defaultLanguage?: string;
		languageLabels?: Record<string, string>;
		multiline?: boolean;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		tabindex?: number;
		/** Extra classes for the input elements. */
		class?: string;
		/** Id for the default-language input (label association). */
		id?: string;
		ariaLabel?: string;
		/** Applied to the default-language input. */
		ariaInvalid?: boolean;
		/** Applied to the default-language input. */
		ariaDescribedby?: string;
		/** Fired after `value` has been updated by user input. */
		onInput?: (value: LocalizedText) => void;
		t?: TranslateFn;
	}

	let {
		// no fallback on purpose — the parent binds possibly-undefined values
		// (e.g. `FieldDef.description`), which Svelte forbids combining with one
		value = $bindable(),
		languages,
		defaultLanguage,
		languageLabels,
		multiline = false,
		placeholder,
		disabled = false,
		readonly = false,
		tabindex = 0,
		class: classProp,
		id,
		ariaLabel,
		ariaInvalid,
		ariaDescribedby,
		onInput,
		t = (k: string) => k,
	}: Props = $props();

	let expanded = $state(false);
	let rootEl: HTMLElement | undefined = $state();

	const _defaultLanguage = $derived(defaultLanguage || languages?.[0] || "");
	const _hasMultiple = $derived((languages?.length ?? 0) > 1);
	// default first (ALWAYS, even when not listed in `languages` — same as
	// FieldInputLocalized), rest in original order
	const sortedLanguages = $derived([
		...(_defaultLanguage ? [_defaultLanguage] : []),
		...(languages ?? []).filter((l) => l !== _defaultLanguage),
	]);

	// A record value may arrive while NO languages are configured (defs authored
	// earlier WITH languages). The single input then edits the record's first
	// filled entry instead of an "" language key.
	function recordTarget(rec: Record<string, string>, lang: string): string {
		return lang || Object.keys(rec).find((k) => rec[k]?.trim()) || "";
	}

	function readLang(lang: string): string {
		if (value == null) return "";
		if (typeof value === "string") return lang === _defaultLanguage ? value : "";
		if (!lang) return getLocalizedText(value);
		return value[lang] ?? "";
	}

	function writeLang(lang: string, text: string) {
		if (isPlainObject(value)) {
			const next: Record<string, string> = { ...(value as Record<string, string>) };
			const target = recordTarget(next, lang);
			if (!target) {
				// record with no filled entries and no configured languages
				value = text;
			} else {
				if (text) next[target] = text;
				else delete next[target];
				const filled = Object.keys(next).filter((k) => next[k]?.trim());
				if (!filled.length) value = "";
				else if (filled.length === 1 && filled[0] === (_defaultLanguage || target))
					value = next[filled[0]];
				else value = next;
			}
		} else if (lang === _defaultLanguage || !_hasMultiple) {
			value = text;
		} else if (text) {
			const next: Record<string, string> = {};
			const current = (value as string) ?? "";
			if (current) next[_defaultLanguage] = current;
			next[lang] = text;
			value = next;
		}
		onInput?.(value ?? "");
	}

	/** Focus the default-language input (rendered first in both layouts). */
	export function focus(): void {
		rootEl
			?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
			?.focus?.();
	}

	const INPUT_CLS = "w-full";

	const TOGGLE_CLS = [
		"toggle-btn",
		"px-1.5 rounded block self-stretch",
		"min-w-8",
		"flex items-center justify-center",
	].join(" ");
</script>

{#snippet langInput(lang: string, isDefault: boolean)}
	{#if multiline}
		<textarea
			value={readLang(lang)}
			oninput={(e) => writeLang(lang, e.currentTarget.value)}
			class={twMerge(INPUT_CLS, "min-h-16", classProp)}
			{disabled}
			{readonly}
			{tabindex}
			placeholder={isDefault ? placeholder : undefined}
			id={isDefault ? id : undefined}
			aria-label={isDefault ? ariaLabel : languageLabels?.[lang] || lang}
			aria-invalid={(isDefault && ariaInvalid) || undefined}
			aria-describedby={isDefault ? ariaDescribedby : undefined}
			use:autogrow={() => ({ enabled: true, value: readLang(lang) })}
		></textarea>
	{:else}
		<input
			type="text"
			value={readLang(lang)}
			oninput={(e) => writeLang(lang, e.currentTarget.value)}
			class={twMerge(INPUT_CLS, classProp)}
			{disabled}
			{readonly}
			{tabindex}
			placeholder={isDefault ? placeholder : undefined}
			id={isDefault ? id : undefined}
			aria-label={isDefault ? ariaLabel : languageLabels?.[lang] || lang}
			aria-invalid={(isDefault && ariaInvalid) || undefined}
			aria-describedby={isDefault ? ariaDescribedby : undefined}
		/>
	{/if}
{/snippet}

<div class="stuic-input-localized w-full flex items-stretch" bind:this={rootEl}>
	<div class="flex-1 min-w-0">
		{#if !expanded || !_hasMultiple}
			{@render langInput(_defaultLanguage, true)}
		{:else}
			<div class="expanded-wrap">
				{#each sortedLanguages as lang, idx (lang)}
					<div
						class={twMerge(
							"flex-1 flex gap-2 items-center pl-2",
							idx > 0 && "entry-divider"
						)}
					>
						<div
							class={twMerge(
								"lang-label",
								"shrink-0 min-w-8 flex text-sm font-medium uppercase",
								lang === _defaultLanguage &&
									"lang-label-default after:content-['*'] after:pl-0.5"
							)}
						>
							{languageLabels?.[lang] || lang}
						</div>
						<div class="flex-1 min-w-0">
							{@render langInput(lang, lang === _defaultLanguage)}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	{#if _hasMultiple}
		<!-- deliberately never disabled: revealing translations is read access,
		     which disabled/readonly modes must not take away -->
		<button
			type="button"
			class={TOGGLE_CLS}
			onclick={() => (expanded = !expanded)}
			aria-label={String(t(expanded ? "hide_translations" : "show_translations"))}
			use:tooltip={() => ({
				enabled: true,
				content: t(expanded ? "hide_translations" : "show_translations"),
			})}
		>
			{#if expanded}
				{@html iconChevronUp({ size: 16 })}
			{:else}
				{@html iconLanguages({ size: 16 })}
			{/if}
		</button>
	{/if}
</div>
