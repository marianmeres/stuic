<script lang="ts" module>
	import type { TranslateFn } from "../../types.js";
	import type {
		AssetArea,
		AssetPreview,
		AssetPreviewNormalized,
	} from "./_internal/assets-preview-types.js";

	export interface Props {
		assets: string[] | AssetPreview[];
		/** Fallback base URL for resolving relative asset URLs */
		baseUrl?: string;
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
		/** Never show dots (even if less than 10) */
		noDots?: boolean;
		/** Never show "x / y" meta */
		noCurrentOfTotal?: boolean;
		/** Render prev/next arrows at the bottom instead of vertically centered */
		prevNextBottom?: boolean;
		/** Callback when a clickable area on an image is clicked */
		onAreaClick?: (data: { area: AssetArea; asset: AssetPreviewNormalized }) => void;
		/** Initial asset index to display (default 0) */
		initialIndex?: number;
		/** Current asset index (bindable). Defaults to initialIndex. */
		currentIndex?: number;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { preloadImgs, type PreloadImgOptions } from "../../utils/preload-img.js";
	import { resolveUrl, resolveSrcset } from "../../utils/resolve-url.js";
	import { normalizeInput, t_default } from "./_internal/assets-preview-utils.js";
	import AssetsPreviewContent from "./_internal/AssetsPreviewContent.svelte";

	let {
		assets: _assets,
		baseUrl,
		t = t_default,
		class: classProp = "",
		classControls = "",
		onDelete,
		onAreaClick,
		noName,
		clampPan = false,
		noDownload = false,
		noPrevNext = false,
		noZoom = false,
		noZoomButtons = false,
		noDots = false,
		noCurrentOfTotal = false,
		prevNextBottom = false,
		initialIndex = 0,
		currentIndex = $bindable(initialIndex),
	}: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);

	let content: AssetsPreviewContent | undefined = $state();

	// Preload images when assets change
	$effect(() => {
		const toPreload: PreloadImgOptions[] = (assets ?? [])
			.filter((asset) => asset.isImage)
			.map((asset) => ({
				src: resolveUrl(String(asset.url.full), baseUrl),
				srcset: resolveSrcset(asset.srcset ?? "", baseUrl) || undefined,
				sizes: asset.sizes,
			}));
		if (toPreload.length) {
			preloadImgs(toPreload);
		}
	});

	export function goTo(index: number) {
		content?.goTo(index);
	}

	export function next() {
		content?.next();
	}

	export function previous() {
		content?.previous();
	}
</script>

{#if assets.length}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
			bind:previewIdx={currentIndex}
			{assets}
			{baseUrl}
			{classControls}
			{t}
			{onDelete}
			{noName}
			{clampPan}
			{noDownload}
			{noPrevNext}
			{noZoom}
			{noZoomButtons}
			{noDots}
			{noCurrentOfTotal}
			{prevNextBottom}
			{onAreaClick}
			noClose
		/>
	</div>
{/if}
