<script lang="ts">
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { twMerge } from "../../utils/tw-merge.js";
	import { createClog } from "@marianmeres/clog";
	import { Debounced, watch } from "runed";
	import Spinner from "../Spinner/Spinner.svelte";

	const clog = createClog("TypeaheadInput");

	interface Props {
		input?: HTMLInputElement;
		value: any;
		placeholder?: string;
		getOptions: (s: string, current: Item[]) => Promise<Item[]>;
		renderOptionLabel?: (item: Item) => string;
		itemIdPropName?: string;
		name?: string;
		// consumer might need to differentiate between "value" and a "true submitted value"
		// (eg. when hitting Enter)... so we have `onSubmit`. Note, that this is NOT a "form.onSubmit"
		onSubmit?: (s: string | Item) => void;
		//
		class?: string;
		classInput?: string;
		noSpinner?: boolean;
	}

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
		//
		class: classProp,
		classInput = "",
		noSpinner,
	}: Props = $props();

	let inputEl: HTMLInputElement = $state()!;
	const randName = "name-" + Math.random().toString(36).slice(2);
	let isFetching = $state(false); // not used currently
	let previousKey = $state();

	// ItemCollection of all possible candidates based on the current query (value)
	const options = new ItemCollection<Item>([], {
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
		return value + suggestion.slice(value.length);
	});

	// helper
	function _renderOptionLabel(item: Item): string {
		return renderOptionLabel?.(item) || `${item[itemIdPropName]}`;
	}

	// reset suggestion asap, even before the debounced search finishes (it feels better)
	// the debounce will take over short after
	watch([() => value], ([currQ], [oldQ]) => {
		// if we don't have a query or nothing is active, reset asap
		if (!currQ || !available.active) {
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
	watch([() => debounced.current], ([currQ], [oldQ]) => {
		// always start fresh
		options.clear();

		// no suggestion on empty input (todo: make this configurable to allow list all?)
		if (!currQ) return;

		isFetching = true;

		getOptions(`${currQ}`, [])
			.then((res) => {
				// no options?
				if (!res.length) return;

				// so, here we have some candidate items... but, this is not a typical
				// "word search", this is an exact, case-insensitive "string begins with",
				// so we need to filter further...
				const found = res.filter((item) => {
					const label = _renderOptionLabel(item).toLowerCase();
					return label.startsWith(currQ.toLowerCase());
				});

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
			"form-input z-10 relative",
			classInput,
			"text-black",
			"border-0 p-0 bg-transparent block w-full",
			"focus:outline-0 focus:border-0 focus:ring-0",
			"focus-visible:outline-0 focus-visible:border-0 focus-visible:ring-0"
		)
	);

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
				{placeholder}
				autocomplete="off"
				onkeydown={(e) => {
					// ignore on any modifier key
					if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
						return;
					}

					// also ignore ArrowRight if cursor is not at the end
					if (value?.length) {
						const pos = inputEl.selectionStart ?? 0;
						const maxPos = value.length;
						// clog({ cursorPosition: pos, maxPos, value });
						if (e.key === "ArrowRight" && pos < maxPos) return;
					}

					// special case Tab handling - if we hit Enter just before, we want Tab
					// to behave normaly (so we are able to set value which has a suggestion
					// but is NOT a suggestion - eg "New" vs "New York")
					if (previousKey === "Enter" && e.key === "Tab") {
						return;
					}

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
						if (e.key === "Tab") onSubmit?.(value);
					} else if (e.key === "Enter") {
						options.clear();
						onSubmit?.(value);
					}

					previousKey = e.key;
				}}
				onblur={() => onSubmit?.(value)}
			/>
			<input
				type="text"
				bind:value={suggestion}
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
