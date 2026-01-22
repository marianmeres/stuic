<script lang="ts">
	import { TabbedMenu } from "$lib/index.js";

	let value1 = $state<string | number>("tab1");
	let value2 = $state<string | number>("home");
	let valueShort = $state<string | number>("short1");
	let value3 = $state<string | number>("a");

	const basicItems = [
		{ id: "tab1", label: "First Tab" },
		{ id: "tab2", label: "Second Tab" },
		{ id: "tab3", label: "Third Tab" },
	];

	const shortItems = [
		{ id: "short1", label: "First", href: "#" },
		{ id: "short2", label: "Second", href: "#" },
		{ id: "short3", label: "Third", href: "#" },
	];

	const itemsWithDisabled = [
		{ id: "home", label: "Home" },
		{ id: "profile", label: "Profile" },
		{ id: "settings", label: "Settings", disabled: true },
		{ id: "help", label: "Help" },
	];

	const itemsWithCallback = [
		{ id: "a", label: "Tab A" },
		{
			id: "b",
			label: "Tab B (confirm)",
			onSelect: () => {
				return confirm("Are you sure you want to select Tab B?");
			},
		},
		{ id: "c", label: "Tab C" },
	];
</script>

<div class="p-4 space-y-12">
	<section>
		<h2 class="text-lg font-semibold mb-4">Basic Usage</h2>
		<TabbedMenu items={basicItems} bind:value={value1} />
		<div
			class="p-4 border border-(--stuic-color-primary) border-t-0 bg-(--stuic-color-surface)"
		>
			Content for: <strong>{value1}</strong>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">With Disabled Tab</h2>
		<TabbedMenu items={itemsWithDisabled} bind:value={value2} />
		<p class="mt-2 text-sm opacity-70">Selected: {value2}</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Pill Style</h2>
		<TabbedMenu
			items={shortItems}
			bind:value={valueShort}
			class="inline-flex rounded-full p-1 bg-(--stuic-color-muted) w-full"
			classItem="max-w-none"
			classButton="border-0 rounded-full bg-transparent"
			classButtonActive="bg-(--stuic-color-primary) text-(--stuic-color-primary-foreground)"
		/>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Custom Colors via CSS Variables</h2>
		<TabbedMenu
			items={basicItems}
			value="tab2"
			style="
				--stuic-tabbed-menu-tab-bg-active: var(--color-blue-600);
				--stuic-tabbed-menu-tab-text-active: var(--color-white);
				--stuic-tabbed-menu-radius: var(--radius-lg);
			"
		/>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Custom Active Style via Class</h2>
		<TabbedMenu
			items={basicItems}
			value="tab1"
			classButtonActive="bg-green-600 text-white"
		/>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">With Item onSelect Callback</h2>
		<TabbedMenu
			items={itemsWithCallback}
			bind:value={value3}
			onSelect={(item) => console.log("Selected:", item)}
		/>
		<p class="mt-2 text-sm opacity-70">Selected: {value3}</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">All Disabled</h2>
		<TabbedMenu items={basicItems} value="tab1" disabled />
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Unstyled (for full custom styling)</h2>
		<TabbedMenu
			items={basicItems}
			value="tab2"
			unstyled
			class="flex gap-2"
			classButton="px-4 py-2 border rounded"
			classButtonActive="bg-black text-white dark:bg-white dark:text-black"
		/>
	</section>
</div>
