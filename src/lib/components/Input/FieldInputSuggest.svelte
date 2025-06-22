<script module lang="ts">
	import type { Snippet } from "svelte";
	import { FieldInput } from "./index.js";
	import type { THC } from "../Thc/Thc.svelte";
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from "../../actions/validate.svelte.js";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { createClog } from "@marianmeres/clog";
	import { Spinner } from "../Spinner/index.js";
	import { strHash, twMerge } from "../../utils/index.js";
	import { X } from "../X/index.js";
	import { writable } from "svelte/store";
	import { tooltip } from "../../actions/index.js";
	import {
		iconBsSearch,
		iconBsSearch as iconSearch,
	} from "@marianmeres/icons-fns/bootstrap/iconBsSearch.js";
	import { Debounced, watch } from "runed";
	import { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	// i18n ready
	function t_default(k: string) {
		const m: Record<string, string> = {
			// field_req_att: "This field requires attention. Please review and try again.",
			// cardinality_of: "of",
			// cardinality_selected: "selected",
			// submit: "Submit",
			// select_all: "Select all",
			// clear_all: "Clear all",
			// clear: "Clear",
			search_placeholder: "Search...",
			// search_submit_placeholder: "Type to search and/or submit...",
			// cardinality_full: "Max selection reached",
			// select_from_list: "Please select from the list",
			x_close: "Clear input or close [esc]",
			// unknown_allowed: "Select from the list or type and submit any value",
			// unknown_not_allowed: "Select values from the list only",
			no_results: "No results found.",
		};
		return m[k] ?? k;
	}
</script>

<script lang="ts">
	const clog = createClog("FieldInputSuggest");

	type SnippetWithId = Snippet<[{ id: string }]>;

	interface Props {
		input?: HTMLInputElement;
		value?: string | number; // badInput
		label?: SnippetWithId | THC;
		type?: string;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		tabindex?: number; // tooShort
		renderSize?: "sm" | "md" | "lg" | string;
		//
		required?: boolean;
		disabled?: boolean;
		//
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		// wrap snippets
		labelAfter?: SnippetWithId | THC;
		inputBefore?: SnippetWithId | THC;
		// inputAfter?: SnippetWithId | THC;
		// inputBelow?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		//
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		//
		classInput?: string;
		classLabel?: string;
		classLabelBox?: string;
		classInputBox?: string;
		classInputBoxWrap?: string;
		classDescBox?: string;
		classBelowBox?: string;
		//
		classOption?: string;
		classOptionActive?: string;
		//
		style?: string;
		//
		showX?: boolean;
		getOptions: (s: string, current: Item[]) => Promise<Item[]>;
		renderOptionLabel?: (item: Item) => string;
		renderOptionGroup?: (s: string) => string;
		t?: (s: string) => string;
		notifications?: NotificationsStack;
		itemIdPropName?: string;
		searchPlaceholder?: string;
	}

	let {
		input = $bindable(),
		value = $bindable(),
		classOption,
		classOptionActive,
		showX,
		getOptions,
		renderOptionLabel,
		renderOptionGroup = (s: string) => `${s}`.replaceAll("_", " "),
		t = t_default,
		notifications,
		itemIdPropName = "id",
		searchPlaceholder,
		...rest
	}: Props = $props();

	let isFetching = $state(false);
	let optionsBox: HTMLDivElement | undefined = $state();

	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	function sortFn(a: Item, b: Item) {
		const withOptGroup = (i: Item) => `${i.optgroup || ""}__${_renderOptionLabel(i)}`;
		return withOptGroup(a).localeCompare(withOptGroup(b), undefined, {
			sensitivity: "base",
		});
	}

	const _optionsColl = new ItemCollection([], {
		allowNextPrevCycle: false,
		sortFn,
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
	});

	let options = $derived($_optionsColl);

	const debounced = new Debounced(() => value, 150);
	watch([() => debounced.current], ([currVal], [oldVal]) => {
		if (!currVal) {
			_optionsColl.clear();
			return;
		}

		isFetching = true;
		getOptions(`${currVal}`, [])
			.then((res) => {
				_optionsColl.clear().addMany(res);
			})
			.catch((e) => {
				console.error(e);
				notifications?.error(`${e}`);
			})
			.finally(() => (isFetching = false));
	});

	function _normalize_and_group_options(opts: Item[]): Map<string, Item[]> {
		const groupped = new Map<string, Item[]>();
		opts.forEach((o) => {
			const optgLabel = renderOptionGroup(o.optgroup || "");
			if (!groupped.has(optgLabel)) groupped.set(optgLabel, []);
			const optgroup = groupped.get(optgLabel);
			optgroup!.push(o);
		});
		return groupped;
	}

	// internal DRY
	const rand = Math.random().toString(36).slice(2);
	function btn_id(id: string | number, prefix = "btn-") {
		return prefix + rand + strHash(`${id}`.repeat(3));
	}

	$inspect("value", value);
</script>

<FieldInput
	bind:value
	bind:input
	autocomplete="off"
	placeholder={searchPlaceholder ?? t("search_placeholder")}
	{...rest}
	class="w-full"
>
	{#snippet inputAfter()}
		<div class="flex pl-2 items-center justify-center opacity-50" class:pr-2={!showX}>
			{#if isFetching}
				<Spinner class="w-4" />
			{/if}
		</div>
		{#if showX}
			<div class="flex pl-2 pr-1 items-center justify-center">
				<button
					type="button"
					class={twMerge(
						"opacity-50 rounded",
						"hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
						"focus-visible:opacity-100 focus-visible:outline-0",
						" focus-visible:bg-neutral-200 dark:focus-visible:bg-neutral-800"
					)}
					use:tooltip
					aria-label={t("x_close")}
				>
					<!-- 
            tabindex={2}
				onclick={(e) => {
					e.preventDefault();
					if (innerValue.trim() == "") {
						return escape();
					}
					innerValue = "";
					input?.focus();
				}} -->
					<X class="m-2 size-4 " />
				</button>
			</div>
		{/if}
	{/snippet}

	{#snippet inputBelow()}
		{#if options.size}
			<!-- <ul class="p-2 border-t space-y-2"> -->
			<div
				class={twMerge(
					"options block space-y-1 p-1",
					"max-h-[220px] overflow-y-auto overflow-x-hidden mb-1",
					"border-t border-black/20"
				)}
				bind:this={optionsBox}
				tabindex="-1"
			>
				{#each _normalize_and_group_options(options.items) as [_optgroup, _opts]}
					<!-- {console.log(11111, _optgroup, _opts)} -->
					<div class="p-1">
						{#if _optgroup}
							<div
								class="text-xs capitalize opacity-50 border-b border-black/10 mb-1 p-1"
							>
								{_optgroup}
							</div>
						{/if}
						<ul>
							{#each _opts as item (item.id)}
								{@const active =
									item[itemIdPropName] === options.active?.[itemIdPropName]}
								{@const isSelected = false}
								<li class:active>
									<button
										class:active
										type="button"
										class={twMerge(
											"no-focus-visible",
											"text-left rounded-md py-2 px-2.5",
											"min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap",
											"border border-transparent",
											"focus:outline-0 focus:border-neutral-400 dark:focus:border-neutral-500",
											"focus-visible:outline-0 focus-visible:ring-0",
											"hover:border-neutral-400 dark:hover:border-neutral-500",
											isSelected && "bg-neutral-200 dark:bg-neutral-800",
											classOption,
											// active && "border-neutral-400",
											active && classOptionActive
										)}
										id={btn_id(item[itemIdPropName])}
										tabindex="-1"
									>
										{_renderOptionLabel(item)}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		{/if}
	{/snippet}

	{#snippet inputBefore()}
		<div class="flex flex-col items-center justify-center pl-3 opacity-50">
			{@html iconBsSearch({ size: 14 })}
		</div>
	{/snippet}
</FieldInput>

<style>
	button {
		/* width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis; */
		min-width: 0;
		/* padding: 5px;
		text-align: left; */
	}
</style>
