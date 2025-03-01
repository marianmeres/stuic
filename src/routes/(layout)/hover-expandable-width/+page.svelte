<script lang="ts">
	import { HoverExpandableWidth } from "$lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

	let enabled = $state(true);
</script>

<button onclick={() => (enabled = !enabled)} class="mb-4">
	{enabled ? "disable" : "enable"}
</button>

<div class="w-full outline flex overflow-hidden mb-8 h-[300px]">
	<div class="w-32">
		<HoverExpandableWidth class="bg-red-400 z-10" {enabled} duration={100}>
			{#snippet children({ isExpanded, isExpanding, isShrinking, inTransition })}
				<div class="h-full w-full p-4" class:bg-red-600={inTransition}>
					<div class="text-xs mb-4">
						<div>expanded={isExpanded}</div>
						<div>expanding={isExpanding}</div>
						<div>shrinking={isShrinking}</div>
						<div>transition={inTransition}</div>
					</div>
					{@html dummyText(3)}
					<!-- {#if isExpanded}<div class="font-bold">EXPANDED</div>{/if} -->
					<!-- {#if inTransition}<div class="font-bold">Transition</div>{/if} -->
					<!-- {#if isExpanded}<button on:click={left.toggle}>toggle force</button>{/if} -->

					<!-- <div class="mt-4">{@html dummyText(3)}</div> -->
				</div>
			{/snippet}
		</HoverExpandableWidth>
	</div>

	<div class="flex-1 p-4 order 2">
		<div class="opacity-25 mt-4">{@html dummyText(3)}</div>
	</div>
</div>
