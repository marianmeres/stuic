<script>
	import { page } from '$app/stores';

	// intentionally not using +layout.svelte here
</script>

<header class="p-4 bg-gray-100">
	<a class="underline" href="/">UI home</a>
	{#if $page?.route?.id !== '/'}
		<span class="opacity-50">&rarr;&nbsp;{$page.route.id?.slice(1)}</span>
	{/if}
</header>
<div class="p-4">
	<slot />
</div>
