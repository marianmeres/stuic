<script lang="ts">
	import SlidingPanels from "$lib/components/SlidingPanels/SlidingPanels.svelte";

	// Reference to the component instance so we can switch from outside
	let c = $state<SlidingPanels>();
</script>

<div>
	<button
		onclick={() => c?.show("A")}
		class="px-2"
		class:bg-gray-200={c?.current().active === "A"}
	>
		A
	</button>
	<button
		onclick={() => c?.show("B")}
		class="px-2"
		class:bg-gray-200={c?.current().active === "B"}
	>
		B
	</button>
</div>
<div class="bg-red-100 flex-1 flex flex-col">
	<SlidingPanels bind:this={c} class="flex-1">
		{#snippet panelA({ show, inTransition })}
			<div class="p-4 bg-green-100 h-full">
				Panel A
				<hr class="my-4" />
				<button onclick={() => show("B")} disabled={inTransition} class="border px-2">
					go to B
				</button>
			</div>
		{/snippet}
		{#snippet panelB({ show, inTransition })}
			<div class="p-4 bg-blue-100 h-full">
				Panel B
				<hr class="my-4" />
				<button onclick={() => show("A")} disabled={inTransition} class="border px-2">
					go to A
				</button>
			</div>
		{/snippet}
	</SlidingPanels>
</div>
