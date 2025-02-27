<script lang="ts">
	import { Switch } from "$lib/index.js";
	import { iconHeroSolidCheck } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidCheck.js";
	import { iconHeroSolidXMark } from "@marianmeres/icons-fns/heroicons/solid/iconHeroSolidXMark.js";

	let toggle1 = $state(false);
</script>

<div class="flex items-center text-xs">
	<Switch
		checked
		size="xs"
		onchange={(e) => {
			const { target, detail } = e as any;
			console.log(target.value, detail);
		}}
	/> xs
</div>

<div class="flex items-center text-sm">
	<Switch size="sm" --color-switch-accent="var(--color-violet-800)" /> sm
</div>

<div class="flex items-center">
	<Switch
		size="md"
		bind:checked={toggle1}
		onchange={(e: any) => console.log("onchange", e.detail)}
	>
		{#snippet on()}
			{@html iconHeroSolidCheck({ size: 10 })}
		{/snippet}
		{#snippet off()}
			{@html iconHeroSolidXMark({ size: 10, class: "opacity-40" })}
		{/snippet}
	</Switch> md (default)
	<button class="underline opacity-50 mx-2" onclick={() => (toggle1 = !toggle1)}>
		change from outside
	</button>
</div>

<div class="flex items-center text-xl">
	<Switch
		size="lg"
		preHook={async (old) => Promise.resolve(!!confirm("Are you sure?"))}
	/> lg (with confirm)
</div>

<div class="flex items-center text-sm">
	<Switch
		size="xl"
		--color-switch-accent="var(--color-orange-600)"
		--color-switch-accent-dark="var(--color-orange-400)"
	/> xl
</div>

<hr class="my-8" />
<Switch disabled />
