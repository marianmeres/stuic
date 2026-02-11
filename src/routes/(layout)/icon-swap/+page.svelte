<script lang="ts">
	import { IconSwap } from "$lib/index.js";
	import {
		iconMenu,
		iconX,
		iconSquare,
		iconCircle,
		iconArrowRight,
	} from "$lib/icons/index.js";

	// Demo 1: Basic 2-state hamburger/X toggle
	let isOpen = $state(false);

	// Demo 2: 3-state cycle
	let triState = $state(0);
	const triLabels = ["Arrow", "Square", "Circle"];
	function cycleTriState() {
		triState = (triState + 1) % 3;
	}

	// Demo 3: Duration comparison
	let durationToggle = $state(false);

	// Demo 4: Custom styling + snippets
	let styleToggle = $state(false);
</script>

<h2 class="text-lg font-semibold mb-4">IconSwap</h2>

<!-- Demo 1: Basic 2-state -->
<h3 class="font-semibold mb-2">2-state: Hamburger / Close</h3>
<div class="flex items-center gap-4 mb-8">
	<button
		class="p-2 rounded-full border border-neutral-300 dark:border-neutral-700"
		onclick={() => (isOpen = !isOpen)}
	>
		<IconSwap
			active={isOpen ? 1 : 0}
			states={[iconMenu({ size: 24 }), iconX({ size: 24 })]}
		/>
	</button>
	<span class="text-sm opacity-60">State: {isOpen ? "open" : "closed"}</span>
</div>

<!-- Demo 2: 3-state cycle -->
<h3 class="font-semibold mb-2">3-state cycle</h3>
<div class="flex items-center gap-4 mb-8">
	<button
		class="p-2 rounded-full border border-neutral-300 dark:border-neutral-700"
		onclick={cycleTriState}
	>
		<IconSwap
			bind:active={triState}
			states={[
				iconArrowRight({ size: 24 }),
				iconSquare({ size: 24 }),
				iconCircle({ size: 24 }),
			]}
		/>
	</button>
	<span class="text-sm opacity-60">State: {triLabels[triState]} ({triState})</span>
	<div class="flex gap-1">
		{#each [0, 1, 2] as i (i)}
			<button
				class="px-2 py-1 text-xs rounded border"
				class:bg-neutral-200={triState === i}
				class:dark:bg-neutral-700={triState === i}
				onclick={() => (triState = i)}
			>
				{triLabels[i]}
			</button>
		{/each}
	</div>
</div>

<!-- Demo 3: Duration comparison -->
<h3 class="font-semibold mb-2">Custom durations</h3>
<div class="flex items-center gap-6 mb-8">
	{#each [100, 300, 600, 1000] as ms (ms)}
		<div class="flex flex-col items-center gap-1">
			<button
				class="p-2 rounded-full border border-neutral-300 dark:border-neutral-700"
				onclick={() => (durationToggle = !durationToggle)}
			>
				<IconSwap
					active={durationToggle ? 1 : 0}
					duration={ms}
					states={[iconMenu({ size: 24 }), iconX({ size: 24 })]}
				/>
			</button>
			<span class="text-xs opacity-50">{ms}ms</span>
		</div>
	{/each}
</div>

<!-- Demo 4: Custom styling -->
<h3 class="font-semibold mb-2">Custom styling</h3>
<div class="flex items-center gap-4 mb-8">
	<button
		class="p-2 rounded-full border border-neutral-300 dark:border-neutral-700"
		onclick={() => (styleToggle = !styleToggle)}
	>
		<IconSwap
			active={styleToggle ? 1 : 0}
			states={[iconMenu({ size: 24 }), iconX({ size: 24 })]}
			class="text-red-500"
		/>
	</button>
	<button
		class="p-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
		onclick={() => (styleToggle = !styleToggle)}
	>
		<IconSwap
			active={styleToggle ? 1 : 0}
			states={[iconMenu({ size: 24 }), iconX({ size: 24 })]}
		/>
	</button>
	<span class="text-sm opacity-60">Custom colors + button styles</span>
</div>

<!-- Demo 5: CSS variable override -->
<h3 class="font-semibold mb-2">CSS variable override</h3>
<div class="flex items-center gap-4 mb-8">
	<button
		class="p-2 rounded-full border border-neutral-300 dark:border-neutral-700"
		onclick={() => (styleToggle = !styleToggle)}
	>
		<IconSwap
			active={styleToggle ? 1 : 0}
			states={[iconMenu({ size: 24 }), iconX({ size: 24 })]}
			style="--stuic-icon-swap-duration: 800ms; --stuic-icon-swap-easing: cubic-bezier(0.4, 0, 0.2, 1);"
		/>
	</button>
	<span class="text-sm opacity-50">800ms with custom easing via CSS vars</span>
</div>

<!-- Demo 6: Snippet content -->
<h3 class="font-semibold mb-2">Snippet content (not just icons)</h3>
<div class="flex items-center gap-4 mb-8">
	{#snippet labelOn()}
		<span class="text-green-600 font-bold text-sm">ON</span>
	{/snippet}
	{#snippet labelOff()}
		<span class="text-red-600 font-bold text-sm">OFF</span>
	{/snippet}
	<button
		class="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 min-w-12"
		onclick={() => (styleToggle = !styleToggle)}
	>
		<IconSwap active={styleToggle ? 1 : 0} states={[labelOff, labelOn]} />
	</button>
	<span class="text-sm opacity-60">Snippets instead of HTML strings</span>
</div>
