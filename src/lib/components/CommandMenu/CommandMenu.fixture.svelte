<script lang="ts">
	// Conventions escape hatch (docs/component-testing/02-test-conventions.md):
	// CommandMenu is imperative-only (open()/close() via a ref; it builds on
	// ModalDialog which has no bindable `visible` prop), so a `.svelte.test.ts`
	// file can't drive it directly. This fixture holds the `bind:this` ref and
	// exposes an opener button that calls `.open()`. `getOptions` (a required
	// async prop) is forwarded; `value` is bound so a test can inspect the
	// selected option after a pick.
	import CommandMenu from "./CommandMenu.svelte";

	let cmd = $state<CommandMenu>();
	let { getOptions, value = $bindable() } = $props();
</script>

<button data-testid="opener" onclick={() => cmd?.open()}>open</button>

<!--
	Mirror the bound `value` into the DOM so a test can observe what the menu
	selected (render() from vitest-browser-svelte does not hand back bound props).
	The selected option is an item-collection Item; we surface its `id`.
-->
<span data-testid="selected">{value?.id ?? ""}</span>

<CommandMenu bind:this={cmd} bind:value {getOptions} />
