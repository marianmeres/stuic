<script lang="ts">
	import { onMount } from "svelte";

	let { value = $bindable() } = $props();

	const key = `stuic-pageFlexGrow`;

	onMount(() => {
		value = parseInt(sessionStorage.getItem(key) as any) || 0;
	});

	$effect(() => {
		sessionStorage.setItem(key, Number(value).toString());
	});
	// let value = $state(parseInt(sessionStorage.getItem(key) as any) || 0)
	// $: value = parseInt(sessionStorage.getItem(key) as any) || 0;
	// $: sessionStorage.setItem(key, Number(value).toString());
</script>

<div class="inline-block text-xs">
	flex
	<select bind:value class="py-0 ml-4 text-sm">
		{#each [0, 1, 2, 3, 4, 5] as v}
			<option>{v}</option>
		{/each}
	</select>
</div>
