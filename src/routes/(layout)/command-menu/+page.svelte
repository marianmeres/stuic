<script lang="ts">
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import {
		Button,
		CommandMenu,
		type CommandMenuGetOptionsContext,
		Notifications,
		NotificationsStack,
		sleep,
	} from "#lib/index.js";
	import { citiesByContinent } from "../../_utils/options.js";
	import { createClog } from "@marianmeres/clog";

	const clog = createClog("command-menu-page");
	let command = $state<CommandMenu>()!;
	let value = $state<any>();
	const itemIdPropName = "id";

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});

	function renderOptionLabel(item: Item) {
		return `${item[itemIdPropName]}`;
	}

	async function getOptions(
		q: string,
		current: Item[],
		{ append, signal }: CommandMenuGetOptionsContext
	): Promise<Item[]> {
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

		const hits = q ? all.search(q) : all.items;

		// progressive: the first few hits are "local" and show at once, the rest arrive
		// after a simulated network round-trip (the spinner stays on until then)
		append(hits.slice(0, 5));
		await sleep(800);
		if (signal.aborted) return [];
		return hits.slice(5);
	}

	$inspect(value).with(clog);
</script>

<Button onclick={() => command.open()}>Click</Button>

<CommandMenu
	bind:value
	bind:this={command}
	{getOptions}
	{renderOptionLabel}
	{notifications}
	searchPlaceholder="Type to search large cities..."
/>
<hr class="my-4" />
{value?.id}

<Notifications {notifications} />
