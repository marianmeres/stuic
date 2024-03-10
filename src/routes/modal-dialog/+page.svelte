<script lang="ts">
	import { ModalDialog, focusTrap } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	// modal controller (will be bound to instance)
	let modal = { open: () => false, close: () => false, isOpen: false };
</script>

<Layout>
	<button on:click={modal.open}>open</button>
</Layout>

<ModalDialog
	bind:doClose={modal.close}
	bind:doOpen={modal.open}
	bind:isOpen={modal.isOpen}
	class="drop-shadow-lg bg-white rounded focus:outline-none"
>
	{#if modal.isOpen}
		<div class="min-w-40 min-h-20 flex items-center justify-center">
			<button on:click={modal.close}>close</button>
		</div>
	{/if}
</ModalDialog>
