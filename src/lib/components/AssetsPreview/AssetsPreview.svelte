<script lang="ts" module>
	import { ModalDialog } from "../ModalDialog/index.js";
	import { createClog } from "@marianmeres/clog";
	import type { TranslateFn } from "../../types.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { preloadImgs, type PreloadImgOptions } from "../../utils/preload-img.js";

	export type {
		AssetPreviewUrlObj,
		AssetPreview,
		AssetArea,
	} from "./_internal/assets-preview-types.js";
	export { getAssetIcon } from "./_internal/assets-preview-utils.js";

	// re-import for local use
	import type { AssetArea, AssetPreview } from "./_internal/assets-preview-types.js";
	import type { AssetPreviewNormalized } from "./_internal/assets-preview-types.js";
	import { normalizeInput, t_default } from "./_internal/assets-preview-utils.js";

	export interface Props {
		assets: string[] | AssetPreview[];
		classControls?: string;
		//
		modalClassDialog?: string;
		modalClass?: string;
		//
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
		/** Callback when a clickable area on an image is clicked */
		onAreaClick?: (data: { area: AssetArea; asset: AssetPreviewNormalized }) => void;
	}
</script>

<script lang="ts">
	import AssetsPreviewContent from "./_internal/AssetsPreviewContent.svelte";
	const clog = createClog("AssetsPreview", { color: "auto" });

	let {
		modalClassDialog = "",
		modalClass = "",
		assets: _assets,
		t = t_default,
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
	}: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);
	let previewIdx = $state<number>(0);
	let _openIdx: number | undefined = $state();
	let modal: ModalDialog | undefined = $state();
	let content: AssetsPreviewContent | undefined = $state();

	$effect(() => {
		const visible = modal?.visibility().visible;
		if (visible) {
			// Use the index from open(index) if provided, otherwise reset to 0
			previewIdx = _openIdx ?? 0;
			_openIdx = undefined;

			// perhaps we should have some upper limit here...
			const toPreload: PreloadImgOptions[] = (assets ?? [])
				.filter((asset) => asset.isImage)
				.map((asset) => ({
					src: String(asset.url.full),
					srcset: asset.srcset,
					sizes: asset.sizes,
				}));

			clog.debug("going to (maybe) preload", toPreload);
			if (toPreload.length) preloadImgs(toPreload);
		} else {
			// Reset zoom when modal closes
			content?.resetZoom();
		}
	});

	export function open(index?: number) {
		_openIdx = typeof index === "number" ? index : undefined;
		modal?.open();
	}

	export function close() {
		modal?.close();
	}

	export function visibility() {
		return (
			modal?.visibility() ?? {
				get visible() {
					return false;
				},
			}
		);
	}

	export function setOpener(opener?: null | HTMLElement) {
		modal?.setOpener(opener);
	}
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		if (modal?.visibility().visible && !noPrevNext) {
			if (["ArrowRight"].includes(e.key)) {
				content?.next();
			} else if (["ArrowLeft"].includes(e.key)) {
				content?.previous();
			}
		}
	}}
/>

{#if assets.length}
	<ModalDialog
		bind:this={modal}
		classDialog={modalClassDialog}
		class={twMerge(
			"max-w-full max-h-full h-full rounded-lg",
			"flex items-center justify-center relative",
			"stuic-assets-preview stuic-assets-preview-open",
			modalClass
		)}
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
			{noDots}
			{noCurrentOfTotal}
			{onAreaClick}
			onClose={() => modal?.close()}
		/>
	</ModalDialog>
{/if}
