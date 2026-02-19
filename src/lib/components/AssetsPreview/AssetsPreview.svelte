<script lang="ts" module>
	import { ModalDialog } from "../ModalDialog/index.js";
	import { createClog } from "@marianmeres/clog";
	import type { TranslateFn } from "../../types.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { preloadImgs } from "../../utils/preload-img.js";

	export type { AssetPreviewUrlObj, AssetPreview } from "./_internal/assets-preview-types.js";
	export { getAssetIcon } from "./_internal/assets-preview-utils.js";

	// re-import for local use
	import type { AssetPreview } from "./_internal/assets-preview-types.js";
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
		noName,
		clampPan = false,
		noDownload = false,
	}: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);
	let previewIdx = $state<number>(0);
	let modal: ModalDialog | undefined = $state();
	let content: AssetsPreviewContent | undefined = $state();

	$effect(() => {
		const visible = modal?.visibility().visible;
		if (visible) {
			// Reset preview index on modal open
			previewIdx = 0;

			// perhaps we should have some upper limit here...
			const toPreload = (assets ?? [])
				.map((asset) => (asset.isImage ? String(asset.url.full) : ""))
				.filter(Boolean);

			clog.debug("going to (maybe) preload", toPreload);
			preloadImgs(toPreload.map((src) => ({ src })));
		} else {
			// Reset zoom when modal closes
			content?.resetZoom();
		}
	});

	export function open(index?: number) {
		if (typeof index === "number") {
			previewIdx = index;
		}
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
		if (modal?.visibility().visible) {
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
			onClose={() => modal?.close()}
		/>
	</ModalDialog>
{/if}
