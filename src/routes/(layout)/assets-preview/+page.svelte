<script lang="ts">
	import Button from "../../../lib/components/Button/Button.svelte";
	import { AssetsPreview } from "../../../lib/index.js";

	let preview = $state<AssetsPreview>()!;
</script>

<Button onclick={() => preview.open()}>open</Button>

<AssetsPreview
	bind:this={preview}
	assets={[
		"/assets/00.jpg",
		"/assets/01.jpg",
		"/assets/02.jpg",
		"/assets/README.md",
		"/assets/03.jpg",
	]}
/>
