<script lang="ts">
	import { Switch } from "$lib/index.js";
	import { iconHeroSolidCheck } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidCheck.js";
	import { iconHeroSolidXMark } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidXMark.js";

	let toggle1 = $state(false);
</script>

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="flex flex-wrap items-center gap-4 mb-6">
	<span class="flex items-center gap-1"><Switch size="sm" /> sm</span>
	<span class="flex items-center gap-1"><Switch size="md" /> md</span>
	<span class="flex items-center gap-1"><Switch size="lg" /> lg</span>
</div>

<h3 class="font-semibold mb-2">Intents (when checked)</h3>
<div class="flex flex-wrap items-center gap-4 mb-6">
	<span class="flex items-center gap-1"><Switch intent="primary" checked /> primary</span>
	<span class="flex items-center gap-1"><Switch intent="accent" checked /> accent</span>
	<span class="flex items-center gap-1"><Switch intent="success" checked /> success</span>
	<span class="flex items-center gap-1"><Switch intent="warning" checked /> warning</span>
	<span class="flex items-center gap-1"
		><Switch intent="destructive" checked /> destructive</span
	>
</div>

<h3 class="font-semibold mb-2">With icons</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch size="lg" bind:checked={toggle1}>
		{#snippet on()}
			{@html iconHeroSolidCheck({ size: 12 })}
		{/snippet}
		{#snippet off()}
			{@html iconHeroSolidXMark({ size: 12, class: "opacity-40" })}
		{/snippet}
	</Switch>
	<button class="underline opacity-50" onclick={() => (toggle1 = !toggle1)}>
		toggle from outside
	</button>
</div>

<h3 class="font-semibold mb-2">Disabled</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch disabled />
	<Switch checked disabled />
</div>

<h3 class="font-semibold mb-2">Custom color override</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch checked style="--stuic-switch-track-checked: var(--color-violet-600);" />
	<Switch checked style="--stuic-switch-track-checked: var(--color-orange-500);" />
</div>

<h3 class="font-semibold mb-2">With async confirm</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch preHook={async () => confirm("Are you sure?")} />
</div>
