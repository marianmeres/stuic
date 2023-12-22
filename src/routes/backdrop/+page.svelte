<script>
	import { Backdrop, BackdropConfig } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	// simulate global config
	BackdropConfig.class = 'z-30 bg-black/50 dark:bg-black/70';

	let show = false;
	const close = () => (show = false);
</script>

<Layout>
	<button on:click={() => (show = true)}>click here to open backdrop</button>
</Layout>

{#if show}
	<Backdrop on:escape={close} on:click={close} class="justify-center items-center">
		<button on:click={close} class="bg-white text-black p-4 rounded"> close </button>
	</Backdrop>
{/if}
