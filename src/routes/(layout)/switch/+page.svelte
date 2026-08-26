<script lang="ts">
	import { Switch } from "$lib/index.js";
	import { iconHeroSolidCheck } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidCheck.js";
	import { iconHeroSolidXMark } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidXMark.js";

	let toggle1 = $state(false);
</script>

<h3 class="font-semibold mb-2">Sizes</h3>
<div class="flex flex-wrap items-center gap-4 mb-6">
	<span class="flex items-center gap-1"><Switch size="sm" label="Size sm" /> sm</span>
	<span class="flex items-center gap-1"><Switch size="md" label="Size md" /> md</span>
	<span class="flex items-center gap-1"><Switch size="lg" label="Size lg" /> lg</span>
</div>

<h3 class="font-semibold mb-2">Intents (when checked)</h3>
<div class="flex flex-wrap items-center gap-4 mb-6">
	<span class="flex items-center gap-1"
		><Switch intent="primary" checked label="Intent primary" /> primary</span
	>
	<span class="flex items-center gap-1"
		><Switch intent="accent" checked label="Intent accent" /> accent</span
	>
	<span class="flex items-center gap-1"
		><Switch intent="success" checked label="Intent success" /> success</span
	>
	<span class="flex items-center gap-1"
		><Switch intent="warning" checked label="Intent warning" /> warning</span
	>
	<span class="flex items-center gap-1"
		><Switch intent="destructive" checked label="Intent destructive" /> destructive</span
	>
</div>

<h3 class="font-semibold mb-2">With icons</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch size="lg" label="With icons" bind:checked={toggle1}>
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
	<Switch disabled label="Disabled, off" />
	<Switch checked disabled label="Disabled, on" />
</div>

<h3 class="font-semibold mb-2">Custom color override</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch
		checked
		label="Violet override"
		style="--stuic-switch-track-checked: var(--color-violet-600);"
	/>
	<Switch
		checked
		label="Orange override"
		style="--stuic-switch-track-checked: var(--color-orange-500);"
	/>
</div>

<h3 class="font-semibold mb-2">With async confirm</h3>
<div class="flex items-center gap-4 mb-6">
	<Switch
		label="Confirm before toggling"
		preHook={async () => confirm("Are you sure?")}
	/>
</div>
