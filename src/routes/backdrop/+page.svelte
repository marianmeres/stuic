<script>
	import { createClog } from '@marianmeres/clog';
	import Layout from '../_components/Layout.svelte';
	import { Backdrop, BackdropConfig } from '../../lib';

	const clog = createClog('backdrop/+page');

	let show = false;

	// simulate global config
	BackdropConfig.class = 'z-30 bg-black/50';

	const close = () => (show = false);
</script>

<Layout>
	<button on:click={() => (show = true)}>click here to open backdrop</button>
</Layout>

{#if show}
	<Backdrop on:escape={close} on:click={close} class="justify-center items-center">
		<button on:click={close} class="bg-white p-4 rounded"> close </button>
	</Backdrop>
{/if}
