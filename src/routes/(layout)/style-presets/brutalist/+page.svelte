<script lang="ts">
	import Showcase from "../_Showcase.svelte";
</script>

<div class="py-8">
	<div class="mb-8">
		<h2 class="text-2xl font-bold mb-1">Brutalist</h2>
		<p class="text-sm text-neutral-500">
			Zero radius, no shadows, no borders. Raw, flat, high-contrast surfaces.
		</p>
		<pre class="mt-3 text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-x-auto"><code>:root {'{'}{"\n"}  --stuic-radius: 0;{"\n"}  --stuic-radius-container: 0;{"\n"}  --stuic-shadow: none;{"\n"}  --stuic-shadow-hover: none;{"\n"}  --stuic-shadow-overlay: none;{"\n"}  --stuic-shadow-dialog: none;{"\n"}  --stuic-border-width: 0;{"\n"}{'}'}</code></pre>
	</div>

	<div
		style="
			--stuic-radius: 0;
			--stuic-radius-container: 0;
			--stuic-shadow: none;
			--stuic-shadow-hover: none;
			--stuic-shadow-overlay: none;
			--stuic-shadow-dialog: none;
			--stuic-border-width: 0;
		"
	>
		<Showcase />
	</div>
</div>
