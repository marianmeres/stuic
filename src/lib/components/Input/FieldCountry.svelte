<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { Country } from "./_internal/countries.js";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/** Selected country ISO alpha-2 code (e.g. "SK"). Bindable. Empty = unselected. */
		value?: string;

		/** Called whenever the selection changes. */
		onChange?: (iso: string) => void;

		/**
		 * Restrict the list to specific countries. Accepts either ISO codes or
		 * already-resolved Country objects. Default: all COUNTRIES.
		 */
		countryList?: Country[] | string[];

		/** ISO codes to pin at the top of the dropdown, above a divider. */
		preferredCountries?: string[];

		/**
		 * Override displayed country names. Keys are ISO alpha-2 codes,
		 * values are the localized name. Missing keys fall back to the English
		 * name from countries.ts.
		 */
		countryNames?: Record<string, string>;

		/** Show country flag emoji in dropdown items. Default: true. */
		flags?: boolean;

		/** Hidden input name (enables form submission + validation). */
		name?: string;
		id?: string;
		tabindex?: number;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;

		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		renderSize?: "sm" | "md" | "lg" | string;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;

		labelAfter?: SnippetWithId | THC;
		inputBefore?: SnippetWithId | THC;
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;

		/** Classes for the underlying trigger <button> element. */
		classInput?: string;
		/** Classes for the dropdown popover. */
		classDropdown?: string;
		style?: string;

		t?: TranslateFn;
	}
</script>

<script lang="ts">
	import {
		validate as validateAction,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconChevronDown } from "../../icons/index.js";
	import DropdownMenu, {
		type DropdownMenuActionItem,
		type DropdownMenuItem,
		type DropdownMenuSearchConfig,
	} from "../DropdownMenu/DropdownMenu.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";
	import { COUNTRIES, ISO_MAP } from "./_internal/countries.js";

	let {
		value = $bindable(""),
		onChange,
		countryList: countryListProp,
		preferredCountries,
		countryNames,
		flags = true,
		//
		name,
		id = getId(),
		tabindex = 0,
		placeholder,
		required = false,
		disabled = false,
		//
		label,
		description,
		class: classProp,
		renderSize = "md",
		validate,
		//
		labelAfter,
		inputBefore,
		inputAfter,
		inputBelow,
		below,
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classInput,
		classDropdown,
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
		//
		t,
		...rest
	}: Props = $props();

	let isOpen = $state(false);
	let hiddenInputEl: HTMLInputElement | undefined = $state();
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	function localizedName(c: Country): string {
		return countryNames?.[c.iso] ?? c.name;
	}

	// Resolve the working country list (accept ISO codes or Country objects).
	let resolvedCountries: Country[] = $derived.by(() => {
		if (!countryListProp) return COUNTRIES;
		if (countryListProp.length === 0) return [];
		if (typeof countryListProp[0] === "string") {
			const set = new Set(
				(countryListProp as string[]).map((c) => c.toUpperCase())
			);
			return COUNTRIES.filter((c) => set.has(c.iso));
		}
		return countryListProp as Country[];
	});

	// Sort resolved list alphabetically by displayed name (locale-aware).
	let sortedCountries: Country[] = $derived(
		[...resolvedCountries].sort((a, b) =>
			localizedName(a).localeCompare(localizedName(b))
		)
	);

	let selectedCountry: Country | undefined = $derived(
		value ? ISO_MAP.get(value.toUpperCase()) : undefined
	);

	function countryToItem(c: Country): DropdownMenuActionItem {
		const name = localizedName(c);
		const prefix = flags ? `${c.flag} ` : "";
		return {
			type: "action",
			id: c.iso,
			label: `${prefix}${name}`,
			onSelect: () => {
				value = c.iso;
				onChange?.(c.iso);
				// Trigger change on hidden input so validation runs.
				hiddenInputEl?.dispatchEvent(new Event("change", { bubbles: true }));
			},
		};
	}

	let items: DropdownMenuItem[] = $derived.by(() => {
		const result: DropdownMenuItem[] = [];
		const preferredSet = new Set(
			preferredCountries?.map((c) => c.toUpperCase()) ?? []
		);

		if (preferredSet.size > 0) {
			// Preserve the order given in `preferredCountries`.
			const order = preferredCountries!.map((c) => c.toUpperCase());
			const preferred = order
				.map((iso) => resolvedCountries.find((c) => c.iso === iso))
				.filter((c): c is Country => !!c);
			preferred.forEach((c) => result.push(countryToItem(c)));
			if (preferred.length > 0) {
				result.push({ type: "divider", id: "__preferred-divider" });
			}
		}

		const rest =
			preferredSet.size > 0
				? sortedCountries.filter((c) => !preferredSet.has(c.iso))
				: sortedCountries;
		rest.forEach((c) => result.push(countryToItem(c)));

		return result;
	});

	let searchConfig: DropdownMenuSearchConfig = $derived({
		placeholder:
			t?.("checkout.address.country_search_placeholder") || "Search country...",
		strategy: "prefix",
		getContent: (item) => {
			const c = ISO_MAP.get(String(item.id));
			if (!c) return String(item.id);
			const localized = localizedName(c);
			// Search against localized + English + ISO so typing works in either lang.
			return `${localized} ${c.name} ${c.iso}`;
		},
		autoFocus: true,
		noResultsMessage:
			t?.("checkout.address.country_no_results") || "No country found",
	});

	let triggerText = $derived.by(() => {
		if (selectedCountry) return localizedName(selectedCountry);
		return placeholder ?? "";
	});
</script>

<InputWrap
	{id}
	{label}
	{description}
	{labelAfter}
	{inputBefore}
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
	{classDescBoxToggle}
	{classBelowBox}
	{classValidationBox}
	{validation}
	{style}
>
	<DropdownMenu
		{items}
		bind:isOpen
		position="bottom-span-right"
		search={searchConfig}
		maxHeight="300px"
		closeOnSelect
		class="stuic-field-country"
		classDropdown={twMerge("w-72 max-w-[calc(100vw-1rem)]", classDropdown)}
	>
		{#snippet trigger({ toggle, triggerProps })}
			<!--
				Spread triggerProps (ARIA wiring from DropdownMenu) first, then override
				its `id` with our InputWrap id so the <label for={id}> activates the button
				when clicked. DropdownMenu's internal `aria-labelledby` reference is
				incidentally broken by this swap, but `aria-controls` + `aria-expanded`
				on the trigger and `role="menu"` on the popover keep the menu accessible.
			-->
			<button
				type="button"
				class={twMerge(
					"stuic-field-country-trigger",
					"flex items-center justify-between w-full text-left cursor-pointer",
					"px-3 py-2.5",
					!selectedCountry && "stuic-field-country-placeholder",
					classInput
				)}
				onclick={toggle}
				{disabled}
				{tabindex}
				{...triggerProps}
				{id}
				{...rest}
			>
				<span class="flex-1 min-w-0 truncate">{triggerText || " "}</span>
				<span
					class={twMerge(
						"transition-transform duration-150 shrink-0 ml-2 opacity-60",
						isOpen && "rotate-180"
					)}
					aria-hidden="true"
				>
					{@html iconChevronDown({ size: 16 })}
				</span>
			</button>
		{/snippet}
	</DropdownMenu>
</InputWrap>

<!-- Hidden input for form submission + validation -->
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
				setValidationResult,
			};
		}}
		{required}
		{disabled}
	/>
{/if}
