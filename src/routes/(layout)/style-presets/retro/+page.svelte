<script lang="ts">
	import Showcase from "../_Showcase.svelte";
</script>

<div class="py-8">
	<div class="mb-8">
		<h2 class="text-2xl font-bold mb-1">Retro</h2>
		<p class="text-sm text-neutral-500">
			Hard pixel edges, thick borders, offset block shadows. Old-school, deliberate, tactile.
		</p>
		<pre class="mt-3 text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-x-auto"><code>:root {'{'}{"\n"}  --stuic-radius: 2px;{"\n"}  --stuic-radius-container: 4px;{"\n"}  --stuic-shadow: 3px 3px 0 0 currentColor;{"\n"}  --stuic-shadow-hover: 4px 4px 0 0 currentColor;{"\n"}  --stuic-shadow-overlay: 5px 5px 0 0 currentColor;{"\n"}  --stuic-shadow-dialog: 6px 6px 0 0 currentColor;{"\n"}  --stuic-border-width: 2px;{"\n"}  --stuic-transition: 50ms;{"\n"}  --stuic-button-raised-offset: 3px;{"\n"}  --stuic-button-raised-color: currentColor;{"\n"}{'}'}</code></pre>
	</div>

	<div
		style="
			--stuic-radius: 2px;
			--stuic-radius-container: 4px;
			--stuic-shadow: 3px 3px 0 0 currentColor;
			--stuic-shadow-hover: 4px 4px 0 0 currentColor;
			--stuic-shadow-overlay: 5px 5px 0 0 currentColor;
			--stuic-shadow-dialog: 6px 6px 0 0 currentColor;
			--stuic-border-width: 2px;
			--stuic-transition: 50ms;
			--stuic-button-raised-offset: 3px;
			--stuic-button-raised-color: currentColor;
		"
	>
		<Showcase raised />
	</div>
</div>
