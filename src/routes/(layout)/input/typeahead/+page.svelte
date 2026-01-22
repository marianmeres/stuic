<script lang="ts">
	import FieldInput from "$lib/components/Input/FieldInput.svelte";
	import TypeaheadInput from "$lib/components/TypeaheadInput/TypeaheadInput.svelte";
	import { createClog } from "@marianmeres/clog";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import X from "../../../../lib/components/X/X.svelte";
	import { citiesByContinent } from "../../../_utils/options.js";

	const clog = createClog("typeahead-page");
	let value = $state<any>();
	let submitted = $state<any>();
	const itemIdPropName = "id";

	// For FieldInput example
	let fieldInputValue = $state("");
	let fieldInputSubmitted = $state<string>();

	function renderOptionLabel(item: Item) {
		return `${item[itemIdPropName]}`;
	}

	async function getOptions(q: string, current: Item[]): Promise<Item[]> {
		const options = Object.entries(citiesByContinent).reduce((m, [cont, cities]) => {
			cities.forEach((city) => m.push({ [itemIdPropName]: city, optgroup: cont }));
			return m;
		}, [] as any[]);

		const all = new ItemCollection(options, {
			idPropName: itemIdPropName,
			searchable: {
				getContent: (item) => renderOptionLabel(item),
			},
		});

		// await sleep(500);

		return q ? all.search(q) : all.items;
	}

	const selection = new ItemCollection<Item>([]);
	let selected = $derived($selection);

	// Reset function provided by TypeaheadInput
	let resetGhost = $state<(() => void) | undefined>();

	$inspect($selection);
</script>

<div class="border rounded-md bg-white flex items-center flex-wrap p-1">
	{#if selected.size}
		<!-- <div class="space-x-2 p-2 flex"> -->
		{#each selected.items as item, idx (item.id)}
			<button
				class="border rounded-lg text-xs px-1 py-0.5 leading-none inline-flex mx-1 my-1 text-left"
				onclick={() => {
					selection.removeAt(idx);
				}}>{renderOptionLabel(item)} <X class="size-3" /></button
			>
		{/each}
		<!-- </div> -->
	{/if}
	<div class="flex-1 min-w-[250px] px-2 py-1">
		<TypeaheadInput
			placeholder="Type here..."
			bind:value
			bind:resetGhost
			{getOptions}
			{renderOptionLabel}
			onSubmit={(v) => {
				submitted = v;
				value = "";
				resetGhost?.();
				if (submitted) selection.add({ [itemIdPropName]: v });
			}}
			onDeleteRequest={() => {
				selection.removeAt(selection.items.length - 1);
			}}
		/>
	</div>
</div>

<br />
last submitted: {submitted}
<br />
current value: {value}

<hr class="my-8" />

<h3 class="font-semibold mb-4">FieldInput with useTypeahead</h3>

<FieldInput
	label="City"
	bind:value={fieldInputValue}
	placeholder="Start typing a city name..."
	useTypeahead={{
		getOptions,
		renderOptionLabel,
		onSubmit: (v: string) => {
			fieldInputSubmitted = v;
		},
	}}
/>

<br />
last submitted: {fieldInputSubmitted}
<br />
current value: {fieldInputValue}
