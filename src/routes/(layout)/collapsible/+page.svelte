<script lang="ts">
	import { Collapsible } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let expanded = $state(false);
</script>

<h1 class="text-2xl font-bold mb-8">Collapsible</h1>

<div class="space-y-8 max-w-xl">
	<section>
		<h2 class="text-lg font-semibold mb-2">Basic (1 line)</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible>
				{dummySentence(5)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Multiple lines (3)</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible lines={3}>
				{dummySentence(10)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Short content (no toggle needed)</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible>
				Short text.
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Custom indicators</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible collapsedIndicator="▼" expandedIndicator="▲">
				{dummySentence(5)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Text indicators</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible collapsedIndicator="more..." expandedIndicator="less...">
				{dummySentence(5)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Custom styling</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible
				classContent="text-sm italic"
				classToggle="text-blue-500 font-bold"
				style="--stuic-collapsible-toggle-opacity: 1;"
			>
				{dummySentence(5)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Controlled state</h2>
		<div class="mb-2">
			<button
				class="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
				onclick={() => (expanded = !expanded)}
			>
				Toggle externally (currently: {expanded ? "expanded" : "collapsed"})
			</button>
		</div>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible bind:expanded>
				{dummySentence(5)}
			</Collapsible>
		</div>
	</section>
</div>
