<script lang="ts">
	export let value: number;

	const key = `stuic-pageFlexGrow`;
	$: value = parseInt(sessionStorage.getItem(key) as any) || 0;
	$: sessionStorage.setItem(key, Number(value).toString());
</script>

<div class="inline-block text-xs">
	flex
	<select bind:value class="py-0 ml-4 text-sm">
		{#each [0, 1, 2, 3, 4, 5] as v}
			<option>{v}</option>
		{/each}
	</select>
</div>
