<script lang="ts">
	import SlidingPanels from "./SlidingPanels.svelte";

	// Conventions escape hatch (docs/component-testing/02-test-conventions.md):
	// SlidingPanels exposes the panel content via snippets that receive an
	// imperative `show(panel)` fn. A `.svelte.test.ts` file can't host markup that
	// wires snippet args to a button, so we compose the real component here and
	// drive the async transition by clicking the rendered buttons. `duration` is
	// kept small (60ms default) so the transition resolves well within testTimeout.
	let { duration = 60 } = $props();
</script>

<SlidingPanels {duration}>
	{#snippet panelA({ show })}
		<div>Panel A <button onclick={() => show("B")}>go B</button></div>
	{/snippet}
	{#snippet panelB({ show })}
		<div>Panel B <button onclick={() => show("A")}>go A</button></div>
	{/snippet}
</SlidingPanels>
