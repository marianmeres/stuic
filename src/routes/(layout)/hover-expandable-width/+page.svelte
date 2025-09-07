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
				<div
					class:bg-red-500={inTransition}
					class:bg-red-600={isExpanded && !inTransition}
				>
					<div class="h-full w-full p-4">
						<div class="text-xs mb-4">
							<div>expanded={isExpanded}</div>
							<div>expanding={isExpanding}</div>
							<div>shrinking={isShrinking}</div>
							<div>transition={inTransition}</div>
						</div>
						{@html dummyText(3)}
						&nbsp;
					</div>
				</div>
			{/snippet}
		</HoverExpandableWidth>
	</div>

	<div class="flex-1 p-4 order 2">
		<div class="mt-4">{@html dummyText(3)}</div>
	</div>
</div>
