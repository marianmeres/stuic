<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { ModalDialog, type ModalDialogAPI } from '../../lib';
	import Layout from '../_components/Layout.svelte';

	const clog = createClog('modal-dialog page');

	// modal controller (will be bound to instance)
	let modal: ModalDialogAPI;
</script>

<Layout>
	<button on:click={modal?.open}>open</button>
</Layout>

<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<div on:click={() => clog('MUST NOT BE LOGGED')}>
	<ModalDialog
		bind:this={modal}
		on:open={() => clog('open')}
		on:close={() => clog('close')}
		class="drop-shadow-lg bg-white rounded focus:outline-none"
	>
		<div class="min-w-40 min-h-20 flex items-center justify-center">
			<button on:click={modal.close}>close</button>
		</div>
	</ModalDialog>
</div>
