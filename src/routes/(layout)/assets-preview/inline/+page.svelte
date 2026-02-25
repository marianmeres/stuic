<script lang="ts">
	import {
		AlertConfirmPrompt,
		AlertConfirmPromptStack,
		AssetsPreviewInline,
		type AssetPreview,
		type AssetArea,
	} from "../../../../lib/index.js";
	import type { AssetPreviewNormalized } from "../../../../lib/components/AssetsPreview/_internal/assets-preview-types.js";

	let preview = $state<AssetsPreviewInline>()!;

	const acp = new AlertConfirmPromptStack();

	let assets = $state([
		"/assets/00.jpg",
		"/assets/01.jpg",
		"/assets/02.jpg",
		"/assets/README.md",
		"/assets/03.jpg",
	]);

	// Clickable areas example
	const assetsWithAreas: AssetPreview[] = [
		{
			url: { thumb: "/assets/00.jpg", full: "/assets/00.jpg", original: "/assets/00.jpg" },
			name: "image-with-areas.jpg",
			width: 1000,
			height: 1500,
			areas: [
				{ id: "top-left", x: 50, y: 50, w: 400, h: 650, label: "Product A" },
				{ id: "top-right", x: 550, y: 50, w: 400, h: 650, label: "Product B" },
				{ id: "bottom-left", x: 50, y: 800, w: 400, h: 650, label: "Product C" },
				{ id: "bottom-right", x: 550, y: 800, w: 400, h: 650, label: "Product D" },
			],
		},
		{
			url: { thumb: "/assets/01.jpg", full: "/assets/01.jpg", original: "/assets/01.jpg" },
			name: "another-image.jpg",
			width: 1000,
			height: 1500,
			areas: [
				{ id: "center", x: 200, y: 400, w: 600, h: 700, label: "Main Product" },
			],
		},
		{
			url: { thumb: "/assets/02.jpg", full: "/assets/02.jpg", original: "/assets/02.jpg" },
			name: "no-areas.jpg",
		},
	];

	let lastClickedArea = $state<{ area: AssetArea; asset: AssetPreviewNormalized } | null>(null);
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

<h3 class="mt-8 mb-2 font-semibold">Prev/next at bottom</h3>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline {assets} prevNextBottom noName />
</div>

<h3 class="mt-8 mb-2 font-semibold">No prev/next, no zoom buttons</h3>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline {assets} noPrevNext noZoomButtons noName />
</div>

<h3 class="mt-8 mb-2 font-semibold">No zoom at all</h3>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline {assets} noZoom initialIndex={2} noDots />
</div>

<h3 class="mt-8 mb-2 font-semibold">Clickable Areas</h3>
<p class="text-sm text-neutral-500 mb-4">
	Images with SVG overlay areas (e.g. product hotspots). Hover to see highlight, click to
	trigger <code>onAreaClick</code>.
</p>
<div class="w-full h-125 border border-(--stuic-color-border) rounded-lg overflow-hidden">
	<AssetsPreviewInline
		assets={assetsWithAreas}
		onAreaClick={(data) => {
			lastClickedArea = data;
		}}
		noDownload
	/>
</div>
{#if lastClickedArea}
	<div class="mt-2 text-sm bg-neutral-100 dark:bg-neutral-800 rounded px-4 py-2">
		Clicked: <strong>{lastClickedArea.area.label}</strong>
		(id: {lastClickedArea.area.id}) on "{lastClickedArea.asset.name}"
	</div>
{/if}

<AlertConfirmPrompt {acp} />
