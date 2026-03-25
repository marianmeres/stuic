<script lang="ts">
	const presets = [
		{ href: "style-presets/default", label: "Default", desc: "No overrides. Components as they look out of the box." },
		{ href: "style-presets/brutalist", label: "Brutalist", desc: "Zero radius, no shadows, no borders. Raw and flat." },
		{ href: "style-presets/soft", label: "Soft / Rounded", desc: "Pill-shaped elements, generous shadows, smooth transitions." },
		{ href: "style-presets/retro", label: "Retro", desc: "Hard pixel edges, thick borders, offset block shadows." },
	];
</script>

<div class="space-y-8 py-8">
	<div>
		<h2 class="text-2xl font-bold mb-2">Style Presets</h2>
		<p class="text-neutral-600 dark:text-neutral-400 max-w-2xl">
			Each page below renders the exact same set of components but with different
			<code class="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">--stuic-*</code>
			structural token overrides. This demonstrates how a handful of CSS custom properties
			can transform the entire library's visual character.
		</p>
	</div>

	<div class="space-y-3">
		{#each presets as { href, label, desc }}
			<a
				{href}
				class="block p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
			>
				<div class="font-semibold">{label}</div>
				<div class="text-sm text-neutral-500">{desc}</div>
			</a>
		{/each}
	</div>

	<div class="text-sm text-neutral-500 max-w-2xl space-y-2">
		<p><strong>Shared structural tokens used:</strong></p>
		<ul class="list-disc list-inside space-y-1 font-mono text-xs">
			<li>--stuic-radius (element-level: buttons, inputs, badges)</li>
			<li>--stuic-radius-container (container-level: cards, modals, dropdowns)</li>
			<li>--stuic-shadow, --stuic-shadow-hover, --stuic-shadow-overlay, --stuic-shadow-dialog</li>
			<li>--stuic-border-width</li>
			<li>--stuic-transition</li>
		</ul>
	</div>
</div>
