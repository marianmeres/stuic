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

<h3 class="mt-8 mb-2 font-semibold">No prev/next, no zoom buttons</h3>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline {assets} noPrevNext noZoomButtons noName />
</div>

<h3 class="mt-8 mb-2 font-semibold">No zoom at all</h3>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline {assets} noZoom initialIndex={2} noDots />
</div>

<AlertConfirmPrompt {acp} />
