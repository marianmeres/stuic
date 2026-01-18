<script lang="ts" module>
	import {
		iconFile,
		iconFileBinary,
		iconFileCode,
		iconFileImage,
		iconFileMusic,
		iconFilePdf,
		iconFileRichtext,
		iconFileSlides,
		iconFileSpreadsheet,
		iconFileText,
		iconFileWord,
		iconFileZip,
		iconArrowLeft as iconPrevious,
		iconArrowRight as iconNext,
		iconDownload,
		iconPlus as iconAdd,
		iconTrash as iconDelete,
		iconZoomIn,
		iconZoomOut,
	} from "$lib/icons/index.js";
	import { getFileTypeLabel } from "../../utils/get-file-type-label.js";
	import { Modal } from "../Modal/index.js";
	import { createClog } from "@marianmeres/clog";
	import { isImage } from "../../utils/is-image.js";
	import { isPlainObject } from "../../utils/is-plain-object.js";
	import { replaceMap } from "../../utils/replace-map.js";
	import type { TranslateFn } from "../../types.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { forceDownload } from "../../utils/force-download.js";
	import { tooltip } from "../../actions/index.js";
	import { X } from "../X/index.js";
	import { preloadImgs } from "../../utils/preload-img.js";
	import { fade } from "svelte/transition";

	export type AssetPreviewUrlObj = {
		// o
		thumb: string | URL;
		// used in modal preview
		full: string | URL;
		// (potentially extra high res) used for download
		original: string | URL;
	};

	export interface AssetPreview {
		url: AssetPreviewUrlObj;
		name?: string;
		type?: string;
	}

	interface AssetPreviewNormalized extends AssetPreview {
		name: string;
		type: string;
		ext: string;
		isImage: boolean;
	}

	export interface Props {
		assets: string[] | AssetPreview[];
		classControls?: string;
		//
		modalClassInner?: string;
		modalClass?: string;
		modalClassMain?: string;
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
	}

	export function getAssetIcon(ext?: string) {
		const map: Record<string, CallableFunction> = {
			archive: iconFileZip,
			audio: iconFileMusic,
			binary: iconFileBinary,
			code: iconFileCode,
			doc: iconFileWord,
			image: iconFileImage,
			pdf: iconFilePdf,
			presentation: iconFileSlides,
			richtext: iconFileRichtext,
			spreadsheet: iconFileSpreadsheet,
			text: iconFileText,
			unknown: iconFile,
		};
		return map[getFileTypeLabel(ext ?? "unknown")] ?? iconFile;
	}

	// i18n ready
	function t_default(
		k: string,
		values: false | null | undefined | Record<string, string | number> = null,
		fallback: string | boolean = "",
		i18nSpanWrap: boolean = true
	) {
		const m: Record<string, string> = {
			unable_to_preview: "Unable to preview",
			download: "Download",
			close: "Close",
			zoom_in: "Zoom in",
			zoom_out: "Zoom out",
			delete: "Delete",
		};
		let out = m[k] ?? fallback ?? k;

		return isPlainObject(values) ? replaceMap(out, values as any) : out;
	}

	// naive best-effort
	function ext(name: string): string {
		const _ext = name.split(".").at(-1) ?? "";
		return _ext ? `.${_ext}` : "";
	}

	function normalizeInput(input: string | AssetPreview): AssetPreviewNormalized | null {
		const asset: AssetPreviewNormalized = {
			name: "",
			type: "",
			url: { full: "", thumb: "", original: "" },
			isImage: false,
			ext: "",
		};
		if (typeof input === "string") {
			asset.url.full = input;
		} else {
			// Handle AssetPreview object
			asset.url = { ...input.url };
			asset.name = input.name ?? "";
			asset.type = input.type ?? "";
		}

		if (!asset.url.full) {
			return null;
		}

		asset.url.full = new URL(
			asset.url.full,
			globalThis.location?.href ?? "http://placeholder"
		);

		// Use "full" also as "thumb" and "original", if not provided
		asset.url.thumb ||= asset.url.full;
		asset.url.original ||= asset.url.full;

		// best-effort..
		if (!asset.name) {
			asset.name = asset.url.full.pathname.split("/").at(-1) ?? "";
		}

		// best-effort..
		if (!asset.type) {
			asset.type = getFileTypeLabel(ext(asset.name) ?? "unknown");
		}

		asset.ext = ext(asset.name);
		asset.isImage = isImage(asset.ext);

		return asset;
	}
</script>

<script lang="ts">
	const clog = createClog("AssetsPreview", { color: "auto" });

	let {
		modalClassInner = "",
		modalClass = "",
		modalClassMain = "",
		assets: _assets,
		t = t_default,
		classControls = "",
		onDelete,
		noName,
		clampPan = false,
	}: Props = $props();

	let assets: AssetPreviewNormalized[] = $derived(
		(_assets ?? []).map(normalizeInput).filter(Boolean) as AssetPreviewNormalized[]
	);
	let previewIdx = $state<number>(0);
	let modal: Modal | undefined = $state();
	let dotTooltip: string | undefined = $state();

	// Zoom state
	const ZOOM_LEVELS = [1, 1.5, 2, 3, 4] as const;
	const MIN_ZOOM = ZOOM_LEVELS[0];
	const MAX_ZOOM = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
	let zoomLevelIdx = $state(0);

	// Pinch zoom state
	let isPinching = $state(false);
	let initialPinchDistance = 0;
	let initialPinchZoom = 1;
	let continuousZoom = $state(1);

	// Use continuous zoom during pinch, discrete levels otherwise
	let zoomLevel = $derived(isPinching ? continuousZoom : ZOOM_LEVELS[zoomLevelIdx]);

	// Pan state
	let isPanning = $state(false);
	let panX = $state(0);
	let panY = $state(0);
	let startPanX = 0;
	let startPanY = 0;
	let startMouseX = 0;
	let startMouseY = 0;

	// Image and container dimensions for pan clamping
	let imgEl: HTMLImageElement | null = null;
	let containerEl: HTMLDivElement | null = $state(null);

	const TOP_BUTTON_CLS = "rounded bg-white hover:bg-neutral-200 p-1";

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
			preloadImgs(toPreload);
		} else {
			// Reset zoom when modal closes
			resetZoom();
		}
	});

	// Wheel zoom handler
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.deltaY > 0) {
			zoomOut();
		} else {
			zoomIn();
		}
	}

	// Svelte action for pan event listeners - guaranteed to run when element is created
	function pannable(node: HTMLImageElement) {
		imgEl = node;
		node.addEventListener("mousedown", panStart);
		node.addEventListener("touchstart", panStart, { passive: false });
		node.addEventListener("wheel", handleWheel, { passive: false });

		document.addEventListener("mousemove", panMove);
		document.addEventListener("mouseup", panEnd);
		document.addEventListener("touchmove", panMove, { passive: false });
		document.addEventListener("touchend", panEnd);
		document.addEventListener("touchcancel", panEnd);

		return {
			destroy() {
				imgEl = null;
				node.removeEventListener("mousedown", panStart);
				node.removeEventListener("touchstart", panStart);
				node.removeEventListener("wheel", handleWheel);
				document.removeEventListener("mousemove", panMove);
				document.removeEventListener("mouseup", panEnd);
				document.removeEventListener("touchmove", panMove);
				document.removeEventListener("touchend", panEnd);
				document.removeEventListener("touchcancel", panEnd);
			},
		};
	}

	// Clamp pan values to keep image within bounds
	function getClampedPan(newPanX: number, newPanY: number): { x: number; y: number } {
		if (!imgEl || !containerEl) return { x: newPanX, y: newPanY };

		const imgRect = imgEl.getBoundingClientRect();
		const containerRect = containerEl.getBoundingClientRect();

		// Calculate the scaled image dimensions
		const scaledWidth = imgRect.width; // already includes transform scale
		const scaledHeight = imgRect.height;

		// Calculate max pan distance (how much the scaled image exceeds the container)
		// Divide by zoomLevel because translate values are applied before scale in our transform
		const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2 / zoomLevel);
		const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2 / zoomLevel);

		return {
			x: Math.max(-maxPanX, Math.min(maxPanX, newPanX)),
			y: Math.max(-maxPanY, Math.min(maxPanY, newPanY)),
		};
	}

	// Zoom functions
	function zoomIn() {
		if (zoomLevelIdx < ZOOM_LEVELS.length - 1) {
			zoomLevelIdx++;
		}
	}

	function zoomOut() {
		if (zoomLevelIdx > 0) {
			zoomLevelIdx--;
			// Reset pan when zooming out to 1x
			if (zoomLevelIdx === 0) {
				panX = 0;
				panY = 0;
			}
		}
	}

	function resetZoom() {
		zoomLevelIdx = 0;
		continuousZoom = 1;
		panX = 0;
		panY = 0;
		isPinching = false;
	}

	// Pinch zoom helpers
	function getDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.hypot(dx, dy);
	}

	function findNearestZoomLevelIdx(zoom: number): number {
		let nearestIdx = 0;
		let minDiff = Math.abs(ZOOM_LEVELS[0] - zoom);
		for (let i = 1; i < ZOOM_LEVELS.length; i++) {
			const diff = Math.abs(ZOOM_LEVELS[i] - zoom);
			if (diff < minDiff) {
				minDiff = diff;
				nearestIdx = i;
			}
		}
		return nearestIdx;
	}

	// Pan/drag handlers
	function panStart(e: MouseEvent | TouchEvent) {
		// Detect two-finger pinch gesture
		if ("touches" in e && e.touches.length === 2) {
			e.preventDefault();
			isPinching = true;
			isPanning = false;
			initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
			initialPinchZoom = continuousZoom;
			return;
		}

		// Single-finger pan (only when zoomed in)
		if (zoomLevel <= 1) return;
		e.preventDefault();
		isPanning = true;

		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

		startMouseX = clientX;
		startMouseY = clientY;
		startPanX = panX;
		startPanY = panY;
	}

	function panMove(e: MouseEvent | TouchEvent) {
		// Handle pinch zoom
		if ("touches" in e && e.touches.length === 2 && isPinching) {
			e.preventDefault();
			const currentDistance = getDistance(e.touches[0], e.touches[1]);
			const scale = currentDistance / initialPinchDistance;
			continuousZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialPinchZoom * scale));
			return;
		}

		// Handle single-finger pan
		if (!isPanning) return;
		e.preventDefault();

		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

		const newPanX = startPanX + (clientX - startMouseX);
		const newPanY = startPanY + (clientY - startMouseY);

		if (clampPan) {
			const clamped = getClampedPan(newPanX, newPanY);
			panX = clamped.x;
			panY = clamped.y;
		} else {
			panX = newPanX;
			panY = newPanY;
		}
	}

	function panEnd() {
		// Handle pinch end - snap to nearest discrete level
		if (isPinching) {
			isPinching = false;
			zoomLevelIdx = findNearestZoomLevelIdx(continuousZoom);
			continuousZoom = ZOOM_LEVELS[zoomLevelIdx];
			// Reset pan when zoomed out to 1x
			if (zoomLevelIdx === 0) {
				panX = 0;
				panY = 0;
			}
			return;
		}
		isPanning = false;
	}

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

	function preview_previous() {
		previewIdx = (previewIdx - 1 + assets.length) % assets.length;
		resetZoom();
	}

	function preview_next() {
		previewIdx = (previewIdx + 1) % assets.length;
		resetZoom();
	}

	function preview(idx: number) {
		previewIdx = idx % assets.length;
	}

	// $inspect(assets).with(clog);
</script>

<!-- this must be on window as we're catching any typing anywhere -->
<svelte:window
	onkeydown={(e) => {
		if (modal?.visibility().visible) {
			if (["ArrowRight"].includes(e.key)) {
				preview_next();
			} else if (["ArrowLeft"].includes(e.key)) {
				preview_previous();
			}
		}
	}}
/>

{#if assets.length}
	<Modal
		bind:this={modal}
		onEscape={modal?.close}
		classInner="max-w-full h-full {modalClassInner}"
		class="max-h-full md:max-h-full rounded-lg {modalClass}"
		classMain="flex items-center justify-center relative stuic-assets-preview stuic-assets-preview-open {modalClassMain}"
	>
		{@const previewAsset = assets?.[previewIdx]}
		{#if previewAsset}
			<!-- <pre>{JSON.stringify(previewAsset)}</pre> -->
			{#if previewAsset.isImage}
				<div
					bind:this={containerEl}
					class="w-full h-full overflow-hidden flex items-center justify-center"
				>
					<img
						use:pannable
						src={String(previewAsset.url.full)}
						class="max-w-full max-h-full object-scale-down select-none"
						class:cursor-grab={zoomLevel > 1 && !isPanning}
						class:cursor-grabbing={isPanning}
						alt={previewAsset?.name}
						style:transform="scale({zoomLevel}) translate({panX / zoomLevel}px, {panY /
							zoomLevel}px)"
						style:transform-origin="center center"
						draggable="false"
					/>
				</div>
			{:else}
				<div>
					<div>
						{@html getAssetIcon(previewAsset.ext)({
							size: 32,
							class: "mx-auto",
						})}
					</div>
					<div class="opacity-50 mt-4">{t("unable_to_preview")}</div>
				</div>
			{/if}

			{#if assets?.length > 1}
				<div
					class="absolute inset-0 flex items-center justify-between pointer-events-none"
				>
					<button
						class={twMerge("p-4 pointer-events-auto", classControls)}
						onclick={preview_previous}
						type="button"
					>
						<span class="bg-white rounded-full p-3 block">
							{@html iconPrevious()}
						</span>
					</button>

					<button
						class={twMerge("p-4 pointer-events-auto", classControls)}
						onclick={preview_next}
						type="button"
					>
						<span class="bg-white rounded-full p-3 block">
							{@html iconNext()}
						</span>
					</button>
				</div>
			{/if}

			<div class="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
				{#if !noName && previewAsset?.name}
					<span class="truncate bg-white px-1 rounded">
						{previewAsset?.name}
					</span>
				{:else}
					<span></span>
				{/if}
				<div class="flex items-center space-x-3 shrink-0">
				{#if previewAsset.isImage}
					<button
						class={twMerge(TOP_BUTTON_CLS, classControls)}
						type="button"
						onclick={zoomOut}
						disabled={zoomLevelIdx === 0}
						aria-label={t("zoom_out")}
						use:tooltip
					>
						{@html iconZoomOut({ class: "size-6" })}
					</button>

					<button
						class={twMerge(TOP_BUTTON_CLS, classControls)}
						type="button"
						onclick={zoomIn}
						disabled={zoomLevelIdx === ZOOM_LEVELS.length - 1}
						aria-label={t("zoom_in")}
						use:tooltip
					>
						{@html iconZoomIn({ class: "size-6" })}
					</button>
				{/if}

				{#if typeof onDelete === "function"}
					<button
						class={twMerge(TOP_BUTTON_CLS, classControls)}
						type="button"
						onclick={() => onDelete(previewAsset, previewIdx, { close })}
						aria-label={t("delete")}
						use:tooltip
					>
						{@html iconDelete({ class: "size-6" })}
					</button>
				{/if}

				<button
					class={twMerge(TOP_BUTTON_CLS, classControls)}
					type="button"
					onclick={(e) => {
						e.preventDefault();
						forceDownload(String(previewAsset.url.original), previewAsset?.name || "");
					}}
					aria-label={t("download")}
					use:tooltip
				>
					{@html iconDownload({ class: "size-6" })}
				</button>

				<button
					class={twMerge(TOP_BUTTON_CLS, classControls)}
					onclick={modal?.close}
					aria-label={t("close")}
					type="button"
					use:tooltip
				>
					<X />
				</button>
				</div>
			</div>

			{#if assets.length > 1}
				{#if !noName && dotTooltip}
					<div
						class="absolute bottom-10 left-0 right-0 text-center"
						transition:fade={{ duration: 100 }}
					>
						<span class="bg-white p-1 rounded opacity/75">
							{dotTooltip}
						</span>
					</div>
				{/if}
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
					{#each assets as _, i}
						<!-- svelte-ignore a11y_mouse_events_have_key_events -->
						<button
							type="button"
							class={twMerge(
								"size-3 rounded-full transition-colors border border-black/50",
								i === previewIdx ? "bg-white" : "bg-white/50 hover:bg-neutral-200"
							)}
							onclick={() => {
								previewIdx = i;
								resetZoom();
							}}
							aria-label={assets[i]?.name}
							onmouseover={() => {
								dotTooltip = assets[i]?.name;
							}}
							onmouseout={() => {
								dotTooltip = undefined;
							}}
						></button>
					{/each}
				</div>
			{/if}
		{/if}
	</Modal>
{/if}
