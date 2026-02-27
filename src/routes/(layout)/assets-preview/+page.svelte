<script lang="ts">
	import Button from "../../../lib/components/Button/Button.svelte";
	import {
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		AssetsPreview,
	} from "../../../lib/index.js";

	let preview = $state<AssetsPreview>()!;

	const acp = new AlertConfirmPromptStack();

	let assets = $state([
		"/assets/00.jpg",
		"/assets/01.jpg",
		"/assets/02.jpg",
		"/assets/README.md",
		"/assets/03.jpg",
	]);
</script>

<Button onclick={() => preview.open()}>open</Button>

<hr class="my-4" />
<a href="/assets-preview/inline">inline</a>

<AssetsPreview
	bind:this={preview}
	{assets}
	onDelete={(a, index, ctrl) => {
		acp.confirm(() => {
			assets.splice(index, 1);
			acp.shift();
		});
	}}
/>

<AlertConfirmPrompt {acp} />
