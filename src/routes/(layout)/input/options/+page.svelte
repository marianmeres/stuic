<script lang="ts">
	import {
		createFieldOptionsT,
		FIELD_OPTIONS_MESSAGES_SK,
		maybeJsonParse,
		Notifications,
		NotificationsStack,
		onSubmitValidityCheck,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import FieldOptions from "../../../../lib/components/Input/FieldOptions.svelte";
	import { citiesByContinent } from "../../../_utils/options.js";

	const clog = createClog("options");

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});

	const itemIdPropName = "model_id";

	let values = $state({
		item: "[]",
		item2: "[]",
		items: "[]",
		items2: "[]",
		itemsOrdered: "[]",
		itemsChips: "[]",
		itemChips: "[]",
		itemsI18n: "[]",
	});

	// bundled Slovak, with the two chips texts reworded for this particular field
	const tSk = createFieldOptionsT({
		...FIELD_OPTIONS_MESSAGES_SK,
		chips_placeholder: "Ľubovoľné mesto",
		chips_open: "Upraviť mestá",
	});

	function renderItemOptionLabel(item: Item) {
		return `${item[itemIdPropName]}`;
	}

	function customValidator(val: any, ctx: any, el: any) {
		// clog("customValidator", el);
		// we know val is valid JSON ARRAY string here (no need to check)
		// also we know it satisfies the cardinality constraints
		const selected = JSON.parse(val);
		// custom validation: MUST include "foo"
		const fooExists = selected?.find((v: any) => v[itemIdPropName] === "foo");
		return fooExists ? "" : "invalid";
	}

	async function getOptions(s: string, current: Item[]) {
		// using here ItemCollection as a convenience helper for search as it provides
		// all needed features... it has nothing to do with the collection of options in the
		// FieldOptions component itself

		// Note that if currVal is empty (eg initial state), UI is expected
		// to load all options... but since we might have added some which are not
		// within the server loaded (or the server may have changed)
		// we have to manually add those, so we can always see what is selected (see `current`)

		const options = Object.entries(citiesByContinent).reduce((m, [cont, cities]) => {
			cities.forEach((city) => m.push({ [itemIdPropName]: city, optgroup: cont }));
			return m;
		}, [] as any[]);

		options.push({ [itemIdPropName]: "foo" });

		const coll = new ItemCollection([...options, ...(current ?? [])], {
			idPropName: itemIdPropName,
			// searchable: { getContent: (item) => renderItemOptionLabel(item) },
			searchable: {
				getContent: (item) =>
					renderItemOptionLabel(item) + ` ${(item.optgroup || "").replaceAll("_", " ")}`,
			},
		});

		s = s.trim().toLowerCase();
		const found = s ? coll.search(s) : coll.items;

		return { coll, found };
	}

	function raw(v: unknown) {
		return JSON.stringify(maybeJsonParse(v), null, 2);
	}
</script>

<Notifications {notifications} />

<div class="space-y-4">
	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.item}
			label="One (from list only)"
			name="item"
			required
			{notifications}
			cardinality={1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Should allow to select only one. Only "foo" is valid.`}
			validate={{ customValidator }}
			{itemIdPropName}
		/>
		<pre class="text-xs">{raw(values.item)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.item2}
			label="One (any)"
			name="item"
			required
			{notifications}
			cardinality={1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Should allow to select only one. Only "foo" is valid. Can add any.`}
			validate={{ customValidator }}
			{itemIdPropName}
			allowUnknown
		/>
		<pre class="text-xs">{raw(values.item2)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.items}
			label="Many (from list only)"
			name="item"
			required
			{notifications}
			cardinality={3}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Should allow to select many. "foo" must be selected.`}
			validate={{ customValidator }}
			{itemIdPropName}
		/>
		<pre class="text-xs">{raw(values.items)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.items2}
			label="Many (any)"
			name="item"
			required
			{notifications}
			cardinality={Infinity}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Should allow to select many. "foo" must be selected. Can add any.`}
			{itemIdPropName}
			allowUnknown
			validate={{ customValidator }}
		/>
		<pre class="text-xs">{raw(values.items2)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.itemsOrdered}
			label="Many (ordered)"
			name="item"
			{notifications}
			cardinality={-1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Pick several, then open the "Arrange" tab to set the order. The order you set is what gets serialized below (and sent to the server). Try "Sort A–Z" / "Reverse" too.`}
			{itemIdPropName}
			ordered
		/>
		<pre class="text-xs">{raw(values.itemsOrdered)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.itemsChips}
			label="Many (chips, ordered, any)"
			name="item"
			{notifications}
			cardinality={-1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`The selection is shown as inline chips ("chips" mode). Remove one with its ×, add more via the trailing button (or click the empty part of the row) — picking still happens in the modal. With "ordered", the chips follow the arranged order.`}
			{itemIdPropName}
			ordered
			chips
			allowUnknown
		/>
		<pre class="text-xs">{raw(values.itemsChips)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.itemChips}
			label="One (chips)"
			name="item"
			{notifications}
			cardinality={1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Single-select in "chips" mode with a primary chip intent.`}
			{itemIdPropName}
			chips
			chipIntent="primary"
		/>
		<pre class="text-xs">{raw(values.itemChips)}</pre>
	</form>

	<form use:onSubmitValidityCheck class="max-w-3xl border p-4">
		<FieldOptions
			class="w-full"
			bind:value={values.itemsI18n}
			label="Many (chips, i18n)"
			name="item"
			{notifications}
			cardinality={-1}
			renderOptionLabel={renderItemOptionLabel}
			{getOptions}
			description={`Everything goes through "t": createFieldOptionsT({ ...FIELD_OPTIONS_MESSAGES_SK, chips_placeholder, chips_open }). The bundled Slovak catalog with two texts reworded for this field — a partial catalog falls back to English per key.`}
			{itemIdPropName}
			t={tSk}
			chips
		/>
		<pre class="text-xs">{raw(values.itemsI18n)}</pre>
	</form>
</div>

<style>
	pre {
		text-wrap: wrap;
	}
</style>
