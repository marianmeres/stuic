<script lang="ts">
	import TypeaheadInput from "$lib/components/TypeaheadInput/TypeaheadInput.svelte";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { citiesByContinent } from "../../../_utils/options.js";
	import { createClog } from "@marianmeres/clog";
	import { sleep } from "../../../../lib/utils/sleep.js";

	const clog = createClog("typeahead-page");
	let value = $state<any>();
	let submitted = $state<any>();
	const itemIdPropName = "id";

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
</script>

<div class="border rounded-md p-2 bg-white">
	<TypeaheadInput
		placeholder="Type here..."
		bind:value
		{getOptions}
		{renderOptionLabel}
		onSubmit={(v) => {
			submitted = v;
		}}
	/>
</div>

<br />
submitted: {submitted}
<br />
current value: {value}
