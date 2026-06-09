<script lang="ts">
	// Conventions escape hatch (docs/component-testing/02-test-conventions.md):
	// AssetsPreview is imperative-only — it opens a ModalDialog via a ref method
	// open(index?). A *.svelte.test.ts file can't hold a bind:this + a trigger, so
	// this fixture exposes an opener button that calls open(openIndex); all other
	// AssetsPreview props are forwarded through ...rest.
	import type { ComponentProps } from "svelte";
	import AssetsPreview from "./AssetsPreview.svelte";

	let ref = $state<AssetsPreview>();
	let {
		openIndex,
		...rest
	}: { openIndex?: number } & ComponentProps<typeof AssetsPreview> = $props();
</script>

<button data-testid="opener" onclick={() => ref?.open(openIndex)}>open</button>

<AssetsPreview bind:this={ref} {...rest} />
