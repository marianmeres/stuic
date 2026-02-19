<script lang="ts">
	import {
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		AssetsPreviewInline,
	} from "../../../../lib/index.js";

	let preview = $state<AssetsPreviewInline>()!;

	const acp = new AlertConfirmPromptStack();

	let assets = $state([
		"/assets/00.jpg",
		"/assets/01.jpg",
		"/assets/02.jpg",
		"/assets/README.md",
		"/assets/03.jpg",
	]);
</script>

<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline
		bind:this={preview}
		{assets}
		onDelete={(a, index, ctrl) => {
			acp.confirm(() => {
				assets.splice(index, 1);
				acp.shift();
			});
		}}
	/>
</div>

<AlertConfirmPrompt {acp} />
