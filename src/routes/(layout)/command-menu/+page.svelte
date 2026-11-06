<script lang="ts">
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import {
		Button,
		CommandMenu,
		type CommandMenuGetOptionsContext,
		FieldSelect,
		Notifications,
		NotificationsStack,
		sleep,
		Switch,
	} from "#lib/index.js";
	import { citiesByContinent } from "../../_utils/options.js";
	import { createClog } from "@marianmeres/clog";

	const clog = createClog("command-menu-page");
	const itemIdPropName = "id";

	const notifications = new NotificationsStack([], {
		// defaultTtl: 10_000,
		// disposeInterval: 1_000,
	});

	function renderOptionLabel(item: Item) {
		return `${item[itemIdPropName]}`;
	}

	// ---------------------------------------------------------------------------------
	// 1. One late batch, default order
	// ---------------------------------------------------------------------------------

	let command = $state<CommandMenu>()!;
	let value = $state<any>();

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

	// ---------------------------------------------------------------------------------
	// 2. Streaming sources, ranked order
	//
	// What a real palette does: rows that are in memory answer synchronously (the
	// query's first batch), and every remote source is asked in parallel and appended
	// when it answers. `sortOptions` ranks the groups, so a late one lands where its
	// rank says and not where its name sorts. Each remote batch names its `source`, so
	// a group's hits stay up across keystrokes until that source answers again.
	// ---------------------------------------------------------------------------------

	let streaming = $state<CommandMenu>()!;
	let streamingValue = $state<any>();

	/** Multiplies every source's latency, to watch a batch land in slow motion. */
	let slowdown = $state("1");

	/**
	 * Off: the remote batches are appended without a `source`, so the query's first
	 * batch (the local rows) takes every remote group off the screen and they come back
	 * one by one — the list blinks on each keystroke.
	 */
	let namedSources = $state(true);

	const PAGES = [
		"Dashboard",
		"Orders",
		"Customers",
		"Products",
		"Invoices",
		"Reports",
		"Team",
		"Billing",
		"Settings",
	];

	/**
	 * One simulated remote source per continent, listed in rank order. The latencies are
	 * deliberately not in that order: Europe is ranked first but answers third, so its
	 * group lands above two groups that are already on screen. Everything else lands
	 * below what is there.
	 */
	const SOURCES: { group: keyof typeof citiesByContinent; latency: number }[] = [
		{ group: "Europe", latency: 1000 },
		{ group: "Asia", latency: 300 },
		{ group: "Africa", latency: 600 },
		{ group: "North_America", latency: 1400 },
		{ group: "South_America", latency: 1900 },
		{ group: "Oceania", latency: 2500 },
	];

	/** Hits taken from one source, so no single source can fill the list. */
	const HITS_PER_SOURCE = 4;

	const matches = (label: string, q: string) =>
		label.toLowerCase().includes(q.trim().toLowerCase());

	async function getStreamingOptions(
		q: string,
		_current: Item[],
		{ append, signal }: CommandMenuGetOptionsContext
	): Promise<Item[]> {
		// the local rows: on screen at once, from the first character (and on an empty query)
		append(
			PAGES.filter((label) => matches(label, q)).map((label, order) => ({
				[itemIdPropName]: label,
				optgroup: "Pages",
				rank: 0,
				order,
			}))
		);

		// the remote sources: nothing to ask them for an empty query
		if (!q.trim()) return [];

		await Promise.all(
			SOURCES.map(async ({ group, latency }, i) => {
				await sleep(latency * Number(slowdown));
				// a superseded query's append is ignored anyway; this only skips the work
				if (signal.aborted) return;
				// appended even when empty: with a source, "nothing" is an answer too, and
				// takes what the source said to the previous query off the screen
				append(
					citiesByContinent[group]
						.filter((label) => matches(label, q))
						.slice(0, HITS_PER_SOURCE)
						.map((label, order) => ({
							[itemIdPropName]: label,
							optgroup: group,
							rank: 1 + i,
							order,
						})),
					namedSources ? { source: group } : undefined
				);
			})
		);

		// every batch was appended already; the resolved array only ends the spinner
		return [];
	}

	const byRank = (a: Item, b: Item) => a.rank - b.rank || a.order - b.order;

	$inspect(value).with(clog);
	$inspect(streamingValue).with(clog);
</script>

<h2 class="text-lg font-semibold mb-2">One late batch, default order</h2>
<p class="text-sm opacity-60 mb-4 max-w-prose">
	The first five hits show at once, the rest after 800 ms. Options are in the default
	order (group, then label), so the late rows land between the ones already on screen.
</p>

<div class="flex items-center gap-2">
	<Button onclick={() => command.open()}>Open</Button>
	<span class="text-sm opacity-60">{value?.id}</span>
</div>

<CommandMenu
	bind:value
	bind:this={command}
	{getOptions}
	{renderOptionLabel}
	{notifications}
	searchPlaceholder="Type to search large cities..."
/>

<hr class="my-6" />

<h2 class="text-lg font-semibold mb-2">Streaming sources, ranked order</h2>
<p class="text-sm opacity-60 mb-4 max-w-prose">
	"Pages" are in memory and answer at once, also for an empty query. Each continent is a
	simulated remote source that answers on its own (at most {HITS_PER_SOURCE} hits each), and
	its group is appended when it does. The groups are ranked with
	<code>sortOptions</code> in the order listed below. Try <code>a</code>, then
	<code>an</code>, then <code>ang</code>, and watch what the groups do between a keystroke
	and their source's answer, with the switch on and off.
</p>

<ul class="text-sm mb-4 space-y-1">
	<li>
		<span class="inline-block w-36">Pages</span>
		<span class="opacity-60">local, at once</span>
	</li>
	{#each SOURCES as { group, latency } (group)}
		<li>
			<span class="inline-block w-36">{group.replaceAll("_", " ")}</span>
			<span class="opacity-60">
				{Math.round(latency * Number(slowdown))} ms
				{#if group === "Europe"}
					(answers third: lands above Asia and Africa)
				{/if}
			</span>
		</li>
	{/each}
</ul>

<div class="flex items-center gap-2 mb-4">
	<Switch bind:checked={namedSources} size="sm" label="Name each remote batch's source" />
	<span class="text-sm">
		Name each remote batch's <code>source</code>
		<span class="opacity-60">(its hits stay up until it answers again)</span>
	</span>
</div>

<div class="flex items-center gap-2">
	<Button onclick={() => streaming.open()}>Open</Button>
	<FieldSelect
		bind:value={slowdown}
		class="inline-block! mb-0!"
		classInput="field-sizing-content"
		renderSize="sm"
		options={[
			{ value: "0.25", label: "Latency × 0.25" },
			{ value: "1", label: "Latency × 1" },
			{ value: "3", label: "Latency × 3 (slow motion)" },
		]}
	/>
	<span class="text-sm opacity-60">{streamingValue?.id}</span>
</div>

<!-- a fresh menu per mode: rows a named source left behind would outlive the switch -->
{#key namedSources}
	<CommandMenu
		bind:value={streamingValue}
		bind:this={streaming}
		getOptions={getStreamingOptions}
		sortOptions={byRank}
		showAllOnEmptyQ
		{renderOptionLabel}
		{notifications}
		searchPlaceholder="Type to search pages and large cities..."
	/>
{/key}

<Notifications {notifications} />
