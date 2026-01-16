<script lang="ts">
	import { TabbedMenu } from "$lib/index.js";

	let value1 = $state<string | number>("tab1");
	let value2 = $state<string | number>("home");
	let value3 = $state<string | number>("a");

	const basicItems = [
		{ id: "tab1", label: "First Tab And Some Longer Content" },
		{ id: "tab2", label: "Second Tab Also Some Quite Long Content" },
		{ id: "tab3", label: "Third Tab Ang Here Some Fairly Long Content Too" },
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
		<TabbedMenu
			items={basicItems}
			bind:value={value1}
			class=""
			classItem=""
			classButton=""
			classButtonActive="text-white bg-red-600"
		/>
		<div class="p-4 bg-white border-0 border-t-3 border-red-600 dark:border-neutral-600">
			Content for: <strong>{value1}</strong>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Pill like</h2>
		<TabbedMenu
			items={basicItems}
			bind:value={value1}
			class="border rounded-full p-1 bg-blue-100"
			classItem=""
			classButton="border-0 rounded-full bg-white/25"
			classButtonActive="text-white bg-red-600"
		/>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">With Disabled Tab</h2>
		<TabbedMenu items={itemsWithDisabled} bind:value={value2} />
		<div class="mt-4 text-sm opacity-70">Selected: {value2}</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">With Item onSelect Callback (confirm)</h2>
		<TabbedMenu
			items={itemsWithCallback}
			bind:value={value3}
			onSelect={(item) => console.log("Selected:", item)}
		/>
		<div class="mt-4 text-sm opacity-70">Selected: {value3}</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Custom Styling via CSS Variables</h2>
		<TabbedMenu
			items={basicItems}
			value="tab2"
			--color-tabbed-menu-tab-active-bg="var(--color-blue-600)"
			--color-tabbed-menu-tab-active-text="var(--color-white)"
			--color-tabbed-menu-tab-active-bg-dark="var(--color-blue-500)"
			--tabbed-menu-border-radius="1rem"
			--tabbed-menu-padding-x="1.5rem"
		/>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-4">Custom Class Styling</h2>
		<TabbedMenu
			items={basicItems}
			value="tab1"
			classButton="bg-neutral-200 dark:bg-neutral-700"
			classButtonActive="bg-green-600 text-white dark:bg-green-500"
		/>
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
