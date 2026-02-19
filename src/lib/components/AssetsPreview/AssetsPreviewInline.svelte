<script lang="ts" module>
	import type { TranslateFn } from "../../types.js";
	import type { AssetPreview } from "./_internal/assets-preview-types.js";

	export interface Props {
		assets: string[] | AssetPreview[];
		classControls?: string;
		class?: string;
		/** Optional translate function */
		t?: TranslateFn;
		/** Optional delete handler - receives the current asset and its index */
		onDelete?: (
			asset: AssetPreview,
			index: number,
			controls: {
				close: () => void;
			}
		) => void;
		/** optional "do not display file name" switch flag */
		noName?: boolean;
		/** When true (default), panning is clamped to keep image within bounds */
		clampPan?: boolean;
		/** Do not offer download if truthy (default false) */
		noDownload?: boolean;
		/** Hide prev/next arrow buttons */
		noPrevNext?: boolean;
		/** Disable all zooming (buttons + gestures) */
		noZoom?: boolean;
		/** Hide zoom buttons only (gestures still work) */
		noZoomButtons?: boolean;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { preloadImgs } from "../../utils/preload-img.js";
	import type { AssetPreviewNormalized } from "./_internal/assets-preview-types.js";
	import { normalizeInput, t_default } from "./_internal/assets-preview-utils.js";
	import AssetsPreviewContent from "./_internal/AssetsPreviewContent.svelte";

	let {
		assets: _assets,
		t = t_default,
		class: classProp = "",
		classControls = "",
		onDelete,
		noName,
		clampPan = false,
		noDownload = false,
		noPrevNext = false,
		noZoom = false,
		noZoomButtons = false,
	}: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);

	let previewIdx = $state<number>(0);
	let content: AssetsPreviewContent | undefined = $state();

	// Preload images when assets change
	$effect(() => {
		const toPreload = (assets ?? [])
			.map((asset) => (asset.isImage ? String(asset.url.full) : ""))
			.filter(Boolean);
		if (toPreload.length) {
			preloadImgs(toPreload.map((src) => ({ src })));
		}
	});

	export function goTo(index: number) {
		previewIdx = index % assets.length;
		content?.resetZoom();
	}

	export function next() {
		content?.next();
	}

	export function previous() {
		content?.previous();
	}
</script>

{#if assets.length}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
	<div
		tabindex="0"
		role="region"
		class={twMerge(
			"w-full h-full relative outline-none",
			"stuic-assets-preview",
			classProp
		)}
		onkeydown={(e) => {
			if (!noPrevNext) {
				if (e.key === "ArrowRight") {
					e.preventDefault();
					content?.next();
				} else if (e.key === "ArrowLeft") {
					e.preventDefault();
					content?.previous();
				}
			}
		}}
	>
		<AssetsPreviewContent
			bind:this={content}
			bind:previewIdx
			{assets}
			{classControls}
			{t}
			{onDelete}
			{noName}
			{clampPan}
			{noDownload}
			{noPrevNext}
			{noZoom}
			{noZoomButtons}
			noClose
		/>
	</div>
{/if}
