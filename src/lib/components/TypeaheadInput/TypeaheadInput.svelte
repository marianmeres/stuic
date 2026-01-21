<script lang="ts" module>
	import type { Item } from "@marianmeres/item-collection";

	export interface Props<T extends Item = Item> {
		input?: HTMLInputElement;
		value: any;
		placeholder?: string;
		getOptions: (s: string, current: T[]) => Promise<T[]>;
		renderOptionLabel?: (item: T) => string;
		itemIdPropName?: string;
		name?: string;
		onSubmit?: (s: string) => void;
		onDeleteRequest?: () => void;
		class?: string;
		classInput?: string;
		noSpinner?: boolean;
		noListAllOnEmptyQ?: boolean;
		appendHint?: string;
	}
</script>

<script lang="ts" generics="T extends Item">
	import { createClog } from "@marianmeres/clog";
	import { ItemCollection } from "@marianmeres/item-collection";
	import { Debounced, watch } from "runed";
	import { twMerge } from "../../utils/tw-merge.js";
	import { unaccent } from "../../utils/unaccent.js";
	import Spinner from "../Spinner/Spinner.svelte";

	const clog = createClog("TypeaheadInput");

	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		getOptions,
		renderOptionLabel,
		itemIdPropName = "id",
		name = "text_input",
		//
		onSubmit,
		onDeleteRequest,
		//
		class: classProp,
		classInput = "",
		noSpinner,
		noListAllOnEmptyQ,
		appendHint = " [tab]",
	}: Props<T> = $props();

	let inputEl: HTMLInputElement = $state()!;
	const randName = "name-" + Math.random().toString(36).slice(2);
	let isFetching = $state(false); // not used currently
	let previousKey = $state();

	// special case flag to allow listing all available options when navigating with arrows
	// even on empty query
	let allowListAll = $state(false);

	// ItemCollection of all possible candidates based on the current query (value)
	// svelte-ignore state_referenced_locally
	const options = new ItemCollection<T>([], {
		idPropName: itemIdPropName,
		searchable: { getContent: (item) => _renderOptionLabel(item) },
		allowNextPrevCycle: true,
		sortFn: (a, b) => {
			const _a = _renderOptionLabel(a).toLowerCase();
			const _b = _renderOptionLabel(b).toLowerCase();
			return _a.localeCompare(_b);
		},
	});

	// deriving the actual suggestion from available candidates...
	let available = $derived($options);
	let suggestion: string = $derived.by(() => {
		if (!available.active) return "";
		// a little dance, since we need to be case insensitive
		// otherwise we would just: `value = _renderOptionLabel(available.active)`
		const suggestion = _renderOptionLabel(available.active);
		return (value || "") + suggestion.slice(value?.length || 0);
	});

	let visibleSuggestion: string = $derived.by(() => {
		if (
			!suggestion ||
			unaccent(suggestion.toLowerCase()) === unaccent(value?.toLowerCase())
		) {
			return "";
		}

		return suggestion ? suggestion + appendHint : suggestion;
	});

	// helper
	function _renderOptionLabel(item: T): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	// reset suggestion asap, even before the debounced search finishes (it feels better)
	// the debounce will take over short after
	watch([() => value], ([currQ], [oldQ]) => {
		if (value === undefined) return;

		// if we don't have a query or nothing is active, reset asap
		if ((!allowListAll && !currQ) || !available.active) {
			options.clear();
			return;
		}

		// we need to be case insensitive
		const suggestion = _renderOptionLabel(available.active);
		if (!suggestion.toLowerCase().startsWith(currQ.toLowerCase())) {
			options.clear();
			return;
		}
	});

	// do the query search
	const debounced = new Debounced(() => value, 150);
	watch([() => debounced.current, () => allowListAll], ([currQ, ala], [oldQ, _]) => {
		// always start fresh
		options.clear();

		// no suggestion on empty input
		if (!ala && !currQ) return;

		isFetching = true;

		getOptions(currQ, [])
			.then((res) => {
				// no options?
				if (!res.length) return;

				let found = res;
				if (currQ) {
					// so, here we have some candidate items... but, this is not a typical
					// "word search", this is an exact, case-insensitive "string begins with",
					// so we need to filter further...
					found = res.filter((item) => {
						const label = unaccent(_renderOptionLabel(item).toLowerCase());
						return label.startsWith(unaccent(currQ.toLowerCase()));
					});
				}

				// no exact "starts with" found?
				if (!found.length) return;

				// finally, this is where we pick the actual suggestion (by setting it as active)
				options.addMany(found);
				options.setActiveFirst();
			})
			.catch(clog.error)
			.finally(() => (isFetching = false));
	});

	//
	let _fixedInputClasses = $derived(
		twMerge(
			"z-10 relative",
			classInput,
			"text-black",
			"border-0 p-0 bg-transparent block w-full",
			"focus:outline-0 focus:border-0 focus:ring-0",
			"focus-visible:outline-0 focus-visible:border-0 focus-visible:ring-0"
		)
	);

	function _on_submit(v: string) {
		v = `${v || ""}`.trim();
		if (v) onSubmit?.(v);
		// reset this flag, next up/down arrow will switch it on again
		allowListAll = false;
	}

	// $inspect({ isFetching, value, suggestion }).with(clog);
	// $inspect({ previousKey }).with(clog);
</script>

<div class={twMerge("", classProp)}>
	<div class="flex items-center">
		<div class="relative inline-block flex-1">
			<input
				type="text"
				bind:value
				bind:this={inputEl}
				{name}
				class={twMerge(_fixedInputClasses)}
				placeholder={suggestion ? "" : placeholder}
				autocomplete="off"
				onkeydown={(e) => {
					// ignore on any modifier key
					if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
						return;
					}

					const cursorPos = inputEl.selectionStart ?? 0;

					// also ignore ArrowRight if cursor is not at the end
					if (value?.length) {
						const maxPos = value.length;
						// clog({ cursorPosition: pos, maxPos, value });
						if (e.key === "ArrowRight" && cursorPos < maxPos) return;
					}

					// special case Tab handling - if we hit Enter just before, we want Tab
					// to behave normally (so we are able to set value which HAS a suggestion
					// but is NOT a suggestion - eg "New" vs "New York")
					if (previousKey === "Enter" && e.key === "Tab") {
						return;
					}

					// this acts as trigger for getOptions if empty value (`allowListAll` is watched)
					allowListAll =
						!value?.length &&
						!noListAllOnEmptyQ &&
						["ArrowDown", "ArrowUp"].includes(e.key);

					//
					const suggestion = options.active ? _renderOptionLabel(options.active) : null;
					if (e.key === "ArrowDown") {
						options.setActiveNext();
						e.preventDefault();
					} else if (e.key === "ArrowUp") {
						options.setActivePrevious();
						e.preventDefault();
					} else if (["ArrowRight", "Tab"].includes(e.key) && suggestion) {
						if (e.key === "Tab" && value !== suggestion) {
							e.preventDefault();
						}
						value = suggestion;
						if (e.key === "Tab") _on_submit(value);
					} else if (e.key === "Enter") {
						options.clear();
						_on_submit(value);
					} else if (e.key === "Backspace" && cursorPos === 0) {
						onDeleteRequest?.();
					}

					previousKey = e.key;
				}}
				onblur={() => _on_submit(value)}
			/>
			<input
				type="text"
				bind:value={visibleSuggestion}
				class={twMerge(
					_fixedInputClasses,
					"absolute inset-0 pointer-events-none opacity-40 z-0"
				)}
				name={randName}
				tabindex="-1"
				readonly
			/>
		</div>
		{#if !noSpinner && isFetching}
			<Spinner class="size-5 opacity-50" />
		{/if}
	</div>
</div>
