<script lang="ts">
	import AppShellSimple from "../../../lib/components/AppShell/AppShellSimple.svelte";
	import { BodyScroll, Drawer, resizableWidth, twMerge } from "../../../lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

	let navItems = [...Array(100).keys()];
	let mainItems = [...Array(40).keys()];

	let headerHeight = $state(0);

	let leftWidth = $state(0);

	let flag = $state<Record<string, boolean>>({
		rail: true,
		header: true,
		aside: true,
	});

	const onoff = (f: any) => (f ? "block" : "hidden");
</script>

<svelte:head>
	<meta name="theme-color" content="red" />
</svelte:head>

<AppShellSimple
	class=""
	headerClass="p-4 bg-red-400 {onoff(flag.header)}"
	railClass="w-13 p-4 bg-gray-300 text-center {onoff(flag.rail)}"
	asideClass="w-40 p-4 bg-gray-200 {onoff(flag.aside)}"
	mainClass="bg-gray-100"
>
	{#snippet header()}
		<div class="flex gap-2">
			<span>This is header</span>
			{@render onOffButton({ k: "header" })}
			{@render onOffButton({ k: "rail" })}
			{@render onOffButton({ k: "aside" })}
		</div>
	{/snippet}

	{#snippet rail()}
		R
	{/snippet}

	{#snippet aside()}
		<ul>
			{#each navItems as item}
				<li>Nav item {item + 1}</li>
			{/each}
		</ul>
	{/snippet}

	<div class="bg-white max-w-prose p-4">
		{#each mainItems as item}
			<p class="mb-4">Block {item}</p>
		{/each}
	</div>
</AppShellSimple>

{#snippet onOffButton({ k }: { k: string })}
	<button
		class={twMerge(
			"text-xs px-3 rounded",
			!flag[k] && "bg-gray-200 text-neutral-950",
			flag[k] && "bg-gray-600 text-neutral-50"
		)}
		onclick={() => (flag[k] = !flag[k])}
	>
		{k}
	</button>
{/snippet}
