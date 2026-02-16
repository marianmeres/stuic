<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends Record<string, any> {
		input?: HTMLInputElement;
		/** Full phone number string, e.g. "+421905123456". Bindable. */
		value?: string;
		/** Selected country ISO code, e.g. "SK". Bindable. */
		country?: string;
		/** The dial code part with leading +, e.g. "+421". Bindable (read-derived). */
		dialCode?: string;
		/** The local number part, e.g. "905123456". Bindable. */
		localNumber?: string;
		/** ISO code for initial country selection when value is empty. */
		defaultCountry?: string;
		/** Show country flag emoji. Default: true. */
		flags?: boolean;
		/** Filtered list of countries to show (ISO codes). If undefined, show all. */
		countries?: string[];
		/** ISO codes of countries to pin at the top of the dropdown list. */
		preferredCountries?: string[];
		/** Placeholder for the tel input. */
		placeholder?: string;
		/** Name attribute for hidden input (form submission). */
		name?: string;
		//
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
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classInputBoxWrapInvalid?: string;
		classDescBox?: string;
		classBelowBox?: string;
		classPrefixTrigger?: string;
		classPrefixDropdown?: string;
		style?: string;
		//
		t?: TranslateFn;
		onChange?: (value: string) => void;
	}
</script>

<script lang="ts">
	import { tick } from "svelte";
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import InputWrap from "./_internal/InputWrap.svelte";
	import PhonePrefixPicker from "./_internal/PhonePrefixPicker.svelte";
	import {
		COUNTRIES,
		ISO_MAP,
		DIAL_CODES_DESC,
		DIAL_CODE_MAP,
		type Country,
	} from "./_internal/countries.js";
	import { validatePhoneNumber } from "./phone-validation.js";

	let {
		input = $bindable(),
		value = $bindable(""),
		country = $bindable(""),
		dialCode = $bindable(""),
		localNumber = $bindable(""),
		defaultCountry,
		flags = true,
		countries: allowedCountries,
		preferredCountries,
		placeholder,
		name,
		//
		label,
		description,
		class: classProp,
		id = getId(),
		tabindex = 0,
		renderSize = "md",
		required = false,
		disabled = false,
		validate,
		//
		labelAfter,
		inputAfter,
		inputBelow,
		below,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classInput,
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classBelowBox,
		classPrefixTrigger,
		classPrefixDropdown,
		style,
		//
		t: tProp,
		onChange,
		...rest
	}: Props = $props();

	let hiddenInputEl: HTMLInputElement | undefined = $state();

	// Validation state
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// Filtered country list
	let countryList = $derived.by(() => {
		if (!allowedCountries) return COUNTRIES;
		const set = new Set(allowedCountries.map((c) => c.toUpperCase()));
		return COUNTRIES.filter((c) => set.has(c.iso));
	});

	// Selected country object (initialize once from defaultCountry prop)
	const _initCountry = defaultCountry;
	let selectedCountry: Country | undefined = $state(
		_initCountry ? ISO_MAP.get(_initCountry.toUpperCase()) : undefined
	);

	// Internal local number (for controlled input)
	let _localNumber = $state("");

	// Flag to prevent circular sync
	let _syncing = false;

	// Parse value into parts when value changes externally
	$effect(() => {
		const v = value;
		const defCountry = defaultCountry;
		if (_syncing) return;

		if (!v) {
			if (!selectedCountry && defCountry) {
				selectedCountry = ISO_MAP.get(defCountry.toUpperCase());
			}
			_localNumber = "";
			syncDerived();
			return;
		}

		if (v.startsWith("+")) {
			const digits = v.slice(1);
			for (const code of DIAL_CODES_DESC) {
				if (digits.startsWith(code)) {
					const matched = DIAL_CODE_MAP.get(code);
					if (matched?.length) {
						// Preserve current selection if it shares the same dial code
						if (!selectedCountry || selectedCountry.dialCode !== code) {
							selectedCountry = matched[0];
						}
						_localNumber = digits.slice(code.length);
						syncDerived();
						return;
					}
				}
			}
		}

		// Fallback: treat entire value as local number
		_localNumber = v.replace(/^\+/, "");
		syncDerived();
	});

	// Sync convenience bindable props
	function syncDerived() {
		dialCode = selectedCountry ? `+${selectedCountry.dialCode}` : "";
		country = selectedCountry?.iso ?? "";
		localNumber = _localNumber;
	}

	// Compose full value from parts (strip only formatting chars, keep letters so they fail validation)
	function composeValue(): string {
		const cleaned = _localNumber.replace(/[\s\-().\/]/g, "");
		if (!cleaned) return "";
		if (selectedCountry) return `+${selectedCountry.dialCode}${cleaned}`;
		return cleaned;
	}

	// Sync internal -> external value
	function syncToValue() {
		_syncing = true;
		value = composeValue();
		syncDerived();
		tick().then(() => {
			hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
			_syncing = false;
		});
		onChange?.(value);
	}

	// Handle country selection from picker
	function onCountrySelect(c: Country) {
		selectedCountry = c;
		syncToValue();
		input?.focus();
	}

	// Handle paste: detect international prefix
	function handlePaste(e: ClipboardEvent) {
		const pasted = e.clipboardData?.getData("text") ?? "";
		if (pasted.startsWith("+") || pasted.startsWith("00")) {
			e.preventDefault();
			const normalized = pasted.startsWith("00") ? "+" + pasted.slice(2) : pasted;
			const digits = normalized.slice(1).replace(/\D/g, "");
			for (const code of DIAL_CODES_DESC) {
				if (digits.startsWith(code)) {
					const matched = DIAL_CODE_MAP.get(code);
					if (matched?.length) {
						// Preserve existing selection if matching dial code
						if (!selectedCountry || selectedCountry.dialCode !== code) {
							selectedCountry = matched[0];
						}
						_localNumber = digits.slice(code.length);
						syncToValue();
						return;
					}
				}
			}
			// No recognized prefix
			_localNumber = digits;
			syncToValue();
		}
	}

	// Handle local number input change
	function handleInput(e: Event) {
		_localNumber = (e.currentTarget as HTMLInputElement).value;
		syncToValue();
	}
</script>

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{inputAfter}
	{inputBelow}
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
	{classBelowBox}
	{validation}
	{style}
>
	{#snippet inputBefore()}
		<PhonePrefixPicker
			{selectedCountry}
			{countryList}
			{preferredCountries}
			{flags}
			{disabled}
			classTrigger={classPrefixTrigger}
			classDropdown={classPrefixDropdown}
			onSelect={onCountrySelect}
			t={tProp}
		/>
	{/snippet}

	<input
		bind:this={input}
		type="tel"
		inputmode="tel"
		value={_localNumber}
		oninput={handleInput}
		onpaste={handlePaste}
		{id}
		{tabindex}
		{required}
		{disabled}
		{placeholder}
		class={twMerge(classInput)}
		{...rest}
	/>
</InputWrap>

<!-- Hidden input for form submission and validation -->
{#if name}
	<input
		type="hidden"
		{name}
		value={value ?? ""}
		bind:this={hiddenInputEl}
		use:validateAction={() => {
			const customOpts = typeof validate === "object" && validate ? validate : {};
			return {
				enabled: validate !== false,
				...customOpts,
				customValidator: customOpts.customValidator ?? validatePhoneNumber,
				setValidationResult,
			};
		}}
	/>
{/if}
