<script>
	import { Backdrop, BackdropConfig } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	// simulate global config
	BackdropConfig.class = 'z-30 bg-neutral-950/50 dark:bg-neutral-950/70';

	let show = false;
	const close = () => (show = false);
</script>

<Layout>
	<button on:click={() => (show = true)}>click here to open backdrop</button>
</Layout>

{#if show}
	<Backdrop on:escape={close} on:mousedown={close} class="justify-center items-center">
		<button on:click={close} class="bg-red-300 text-neutral-950 p-4 rounded">
			button: close
		</button>
		<button
			on:mousedown|stopPropagation={() => console.log('noop click')}
			class="bg-slate-400 p-4"
		>
			noop button
		</button>
		<!-- svelte-ignore 
			a11y-click-events-have-key-events 
			a11y-no-static-element-interactions 
		-->
		<div on:mousedown|stopPropagation class="bg-blue-300 p-4 rounded">div</div>
	</Backdrop>
{/if}
