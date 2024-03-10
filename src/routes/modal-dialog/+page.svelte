<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { ModalDialog, type ModalDialogAPI } from '../../lib';
	import Layout from '../_components/Layout.svelte';
	import { createClog } from '@marianmeres/clog';

	const clog = createClog('modal-dialog page');

	// modal controller (will be bound to instance)
	let modal: ModalDialogAPI;
	$: isOpen = modal?.isOpen ?? writable(false);
</script>

<Layout>
	<button on:click={modal?.open}>open</button>
</Layout>

<ModalDialog
	bind:this={modal}
	on:open={() => clog('open')}
	on:close={() => clog('close')}
	class="drop-shadow-lg bg-white rounded focus:outline-none"
>
	{#if $isOpen}
		<div class="min-w-40 min-h-20 flex items-center justify-center">
			<button on:click={modal.close}>close</button>
		</div>
	{/if}
</ModalDialog>
