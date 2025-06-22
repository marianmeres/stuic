<script lang="ts" module>
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
</script>

<script lang="ts">
	import FieldInputSuggest from "../../../../lib/components/Input/FieldInputSuggest.svelte";
	import { createClog } from "@marianmeres/clog";
	import { citiesByContinent } from "../../../_utils/options.js";

	const clog = createClog("suggest");
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
				getContent: (item) =>
					renderOptionLabel(item) + ` ${(item.optgroup || "").replaceAll("_", " ")}`,
				// querySomeWordMinLength: 1,
			},
		});
		return q ? all.search(q) : all.items;
	}
</script>

<FieldInputSuggest {getOptions} {renderOptionLabel} />
