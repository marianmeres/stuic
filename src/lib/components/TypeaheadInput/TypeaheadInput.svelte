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
		/** Function to reset the ghost text (provided by the component) */
		resetGhost?: () => void;
	}
</script>

<script lang="ts" generics="T extends Item">
	import { typeahead } from "../../actions/typeahead.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Spinner from "../Spinner/Spinner.svelte";

	let {
		input = $bindable(),
		value = $bindable(),
		resetGhost = $bindable(),
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

	let isFetching = $state(false);

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
</script>

<div class={twMerge("", classProp)}>
	<div class="flex items-center">
		<div class="relative inline-block flex-1">
			<input
				type="text"
				bind:value
				bind:this={input}
				{name}
				class={twMerge(_fixedInputClasses)}
				{placeholder}
				autocomplete="off"
				use:typeahead={() => ({
					getOptions,
					renderOptionLabel,
					itemIdPropName,
					onSubmit,
					onDeleteRequest,
					noListAllOnEmptyQ,
					appendHint,
					onFetchingChange: (fetching) => (isFetching = fetching),
					onResetGhost: (fn) => (resetGhost = fn),
				})}
			/>
		</div>
		{#if !noSpinner && isFetching}
			<Spinner class="size-5" />
		{/if}
	</div>
</div>
