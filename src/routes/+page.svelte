<script>
	import Layout from './_components/Layout.svelte';

	// prettier-ignore
	let links = [
		'alert-confirm-prompt', 'app-shell', 'avatar', 
		'backdrop', 'button', 
		'carousel', 'color-scheme', 
		'drawer',
		'hover-expandable-width',
		'input',
		'on-outside',
		'popover', 
		'spinner', 'switch', 
		'table', 'thc', 'tooltip', 'tree',
		'window-size',
		'x'
	].toSorted();
</script>

<Layout>
	<ul class="list-disc ml-4">
		{#each links as link}
			<li><a href={link}>{link}</a></li>
		{/each}
	</ul>
</Layout>
