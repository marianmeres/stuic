<script lang="ts">
	import { twMerge } from "../../../utils/tw-merge.js";
	import { iconChevronDown } from "../../../icons/index.js";
	import DropdownMenu, {
		type DropdownMenuActionItem,
		type DropdownMenuItem,
		type DropdownMenuSearchConfig,
	} from "../../DropdownMenu/DropdownMenu.svelte";
	import { type Country, ISO_MAP } from "./countries.js";

	interface Props {
		selectedCountry?: Country;
		countryList: Country[];
		preferredCountries?: string[];
		flags?: boolean;
		disabled?: boolean;
		classTrigger?: string;
		classDropdown?: string;
		onSelect: (country: Country) => void;
		t?: (k: string, v?: any, f?: any) => string;
	}

	let {
		selectedCountry,
		countryList,
		preferredCountries,
		flags = true,
		disabled = false,
		classTrigger,
		classDropdown,
		onSelect,
		t,
	}: Props = $props();

	let isOpen = $state(false);

	function countryToItem(c: Country): DropdownMenuActionItem {
		const prefix = flags ? `${c.flag} ` : "";
		return {
			type: "action",
			id: c.iso,
			label: `${prefix}${c.name} (+${c.dialCode})`,
			onSelect: () => {
				onSelect(c);
				isOpen = false;
			},
		};
	}

	let items: DropdownMenuItem[] = $derived.by(() => {
		const result: DropdownMenuItem[] = [];
		const preferredSet = new Set(preferredCountries?.map((c) => c.toUpperCase()) ?? []);

		if (preferredSet.size > 0) {
			const preferred = countryList.filter((c) => preferredSet.has(c.iso));
			preferred.forEach((c) => result.push(countryToItem(c)));
			if (preferred.length > 0) {
				result.push({ type: "divider" });
			}
		}

		const rest =
			preferredSet.size > 0
				? countryList.filter((c) => !preferredSet.has(c.iso))
				: countryList;
		rest.forEach((c) => result.push(countryToItem(c)));

		return result;
	});

	let searchConfig: DropdownMenuSearchConfig = $derived({
		placeholder: t?.("phone_search_country") || "Search country...",
		strategy: "prefix",
		getContent: (item) => {
			const c = ISO_MAP.get(String(item.id));
			if (!c) return String(item.id);
			return `${c.name} ${c.iso} +${c.dialCode} ${c.dialCode}`;
		},
		autoFocus: true,
		noResultsMessage: t?.("phone_no_country_found") || "No country found",
	});

	let triggerText = $derived.by(() => {
		if (!selectedCountry) return "+?";
		const prefix = flags ? `${selectedCountry.flag} ` : "";
		return `${prefix}+${selectedCountry.dialCode}`;
	});
</script>

<DropdownMenu
	{items}
	bind:isOpen
	position="bottom-span-right"
	search={searchConfig}
	maxHeight="300px"
	closeOnSelect
	class="stuic-phone-prefix-picker"
	classDropdown={twMerge("min-w-64", classDropdown)}
>
	{#snippet trigger({ toggle, triggerProps })}
		<button
			type="button"
			class={twMerge(
				"stuic-phone-prefix-trigger",
				"flex items-center gap-1 shrink-0 px-2 whitespace-nowrap cursor-pointer",
				classTrigger
			)}
			onclick={toggle}
			{disabled}
			{...triggerProps}
		>
			<span>{triggerText}</span>
			<span class={twMerge("transition-transform duration-150", isOpen && "rotate-180")}>
				{@html iconChevronDown({ size: 14 })}
			</span>
		</button>
	{/snippet}
</DropdownMenu>
