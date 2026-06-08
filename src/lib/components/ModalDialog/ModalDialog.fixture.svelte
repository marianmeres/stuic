<script lang="ts">
	// Conventions escape hatch (docs/component-testing/02-test-conventions.md):
	// ModalDialog is imperative-only (open()/close() via a ref; no bindable
	// `visible` prop), so a `.svelte.test.ts` file can't drive it directly. This
	// fixture holds the `bind:this` ref and exposes an opener button that calls
	// `.open()`; ModalDialog props are forwarded through `...rest`. The default
	// content (an "inside" button) is the required `children` snippet — it also
	// gives the focus trap a real focusable element to auto-focus.
	import ModalDialog from "./ModalDialog.svelte";

	let dialog = $state<ModalDialog>();
	let { ...rest } = $props();
</script>

<button data-testid="opener" onclick={() => dialog?.open()}>open</button>

<ModalDialog bind:this={dialog} {...rest}>
	<button data-testid="inside">Inside</button>
</ModalDialog>
