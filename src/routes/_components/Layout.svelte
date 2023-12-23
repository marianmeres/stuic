<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { ColorScheme } from '../../lib';
	import { writable } from 'svelte/store';
	// intentionally not using +layout.svelte here

	const theme = writable<string | null>(null);
	onMount(() => {
		$theme = ColorScheme.getLocalValue(ColorScheme.LIGHT);
	});

	const toggleTheme = () => {
		ColorScheme.toggle();
		$theme = ColorScheme.getLocalValue();
	};
</script>

<header
	class="
		p-4 flex items-center
		bg-neutral-100
		dark:bg-neutral-950
	"
>
	<div class="flex-1">
		<a class="underline" href="/">UI home</a>
		{#if $page?.route?.id !== '/'}
			<span class="opacity-50">&rarr;&nbsp;{$page.route.id?.slice(1)}</span>
		{/if}
	</div>
	<div>
		<button on:click={toggleTheme}>
			{$theme === ColorScheme.LIGHT ? ColorScheme.DARK : ColorScheme.LIGHT}
		</button>
	</div>
</header>
<div class="p-4">
	<slot />
</div>
