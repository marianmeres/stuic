<script lang="ts">
	import { tooltip } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let showCustom = $state(true);
</script>

<div class="m-4 space-x-4">
	<span aria-label="I am a tooltip!" use:tooltip>tooltip default</span>

	{#if showCustom}
		<span
			use:tooltip={() => ({ content: dummySentence(4) })}
			data-class-tooltip="border border-red-500 bg-green-200 text-blue-900"
		>
			custom
		</span>
	{/if}

	<button
		class="text-xs opacity-50"
		onclick={() => {
			showCustom = !showCustom;
		}}>toggle custom</button
	>
</div>
