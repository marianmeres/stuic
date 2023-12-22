<script>
	import { ColorScheme } from '../../lib';
	import Layout from '../_components/Layout.svelte';
</script>

<Layout>
	<div
		class="
			p-4
			border
			bg-neutral-50 text-black border-black/10
			dark:bg-neutral-900 dark:text-neutral-50 dark:border-white/20
		"
	>
		Check header above. You can also
		<button class="underline" on:click={ColorScheme.reset}>reset</button>. (May want to
		refresh page.)
	</div>
</Layout>
