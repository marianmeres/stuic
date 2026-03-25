<script lang="ts">
	import Showcase from "../_Showcase.svelte";
</script>

<div class="py-8">
	<div class="mb-8">
		<h2 class="text-2xl font-bold mb-1">Soft / Rounded</h2>
		<p class="text-sm text-neutral-500">
			Pill-shaped elements, generous container rounding, elevated shadows, smooth feel.
		</p>
		<pre class="mt-3 text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-x-auto"><code>:root {'{'}{"\n"}  --stuic-radius: 9999px;{"\n"}  --stuic-radius-container: 1.5rem;{"\n"}  --stuic-shadow: 0 2px 8px rgb(0 0 0 / 0.08);{"\n"}  --stuic-shadow-hover: 0 4px 16px rgb(0 0 0 / 0.12);{"\n"}  --stuic-shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.15);{"\n"}  --stuic-shadow-dialog: 0 16px 48px rgb(0 0 0 / 0.2);{"\n"}  --stuic-border-width: 0;{"\n"}  --stuic-transition: 250ms;{"\n"}{'}'}</code></pre>
	</div>

	<div
		style="
			--stuic-radius: 9999px;
			--stuic-radius-container: 1.5rem;
			--stuic-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
			--stuic-shadow-hover: 0 4px 16px rgb(0 0 0 / 0.12);
			--stuic-shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.15);
			--stuic-shadow-dialog: 0 16px 48px rgb(0 0 0 / 0.2);
			--stuic-border-width: 0;
			--stuic-transition: 250ms;
		"
	>
		<Showcase />
	</div>
</div>
