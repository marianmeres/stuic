<script lang="ts">
	import { Collapsible } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let expanded = $state(false);
</script>

<h1 class="text-2xl font-bold mb-8">Collapsible</h1>

<div class="space-y-8 max-w-xl">
	<section>
		<h2 class="text-lg font-semibold mb-2">Basic (1 line, default rotating chevron)</h2>
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
		<h2 class="text-lg font-semibold mb-2">Animated height (opt-in)</h2>
		<p class="text-sm opacity-70 mb-2">
			<code>animate</code> — smoothly transitions between the clamped and full height.
			Respects
			<code>prefers-reduced-motion</code>.
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible lines={2} animate>
				{dummySentence(12)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">
			Toggle alignment: <code>top-when-expanded</code>
		</h2>
		<p class="text-sm opacity-70 mb-2">
			Bottom-aligned while collapsed, jumps to the top once expanded, so it does not run
			away down a long block.
		</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible lines={2} toggleAlign="top-when-expanded">
				{dummySentence(12)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Toggle alignment: <code>top</code></h2>
		<p class="text-sm opacity-70 mb-2">Top-aligned in both states.</p>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible lines={2} toggleAlign="top">
				{dummySentence(12)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Animated + toggle on top</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible lines={3} animate toggleAlign="top-when-expanded">
				{dummySentence(16)}
			</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">Short content (no toggle needed)</h2>
		<div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded">
			<Collapsible>Short text.</Collapsible>
		</div>
	</section>

	<section>
		<h2 class="text-lg font-semibold mb-2">
			Custom indicators (opts out of the chevron)
		</h2>
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
