<script>
	import Layout from './_components/Layout.svelte';

	let links = ['app-shell', 'backdrop', 'button', 'drawer'];
</script>

<Layout>
	<ul class="list-disc ml-4">
		{#each links as link}
			<li><a href={link}>{link}</a></li>
		{/each}
	</ul>
</Layout>
