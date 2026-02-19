<script lang="ts">
	import {
		iconArrowLeft as iconPrevious,
		iconArrowRight as iconNext,
		iconDownload,
		iconTrash as iconDelete,
		iconZoomIn,
		iconZoomOut,
	} from "$lib/icons/index.js";
	import { createClog } from "@marianmeres/clog";
	import type { TranslateFn } from "../../../types.js";
	import { twMerge } from "../../../utils/tw-merge.js";
	import { forceDownload } from "../../../utils/force-download.js";
	import { fade } from "svelte/transition";
	import Button from "../../Button/Button.svelte";
	import type { AssetPreview, AssetPreviewNormalized } from "./assets-preview-types.js";
	import { getAssetIcon, t_default } from "./assets-preview-utils.js";

	interface Props {
		assets: AssetPreviewNormalized[];
		previewIdx: number;
		clampPan?: boolean;
		noName?: boolean;
		noDownload?: boolean;
		noClose?: boolean;
		/** Hide prev/next arrow buttons */
		noPrevNext?: boolean;
		/** Disable all zooming (buttons + gestures) */
		noZoom?: boolean;
		/** Hide zoom buttons only (gestures still work) */
		noZoomButtons?: boolean;
		classControls?: string;
		t?: TranslateFn;
		onDelete?: (
			asset: AssetPreview,
			index: number,
			controls: {
				close: () => void;
			}
		) => void;
		onClose?: () => void;
	}

	const clog = createClog("AssetsPreview", { color: "auto" });

	let {
		assets,
		previewIdx = $bindable(0),
		clampPan = false,
		noName,
		noDownload = false,
		noClose = false,
		noPrevNext = false,
		noZoom = false,
		noZoomButtons = false,
		classControls = "",
		t = t_default,
		onDelete,
		onClose,
	}: Props = $props();

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

	const BUTTON_CLS = "stuic-assets-preview-control pointer-events-auto p-0!";

	const BUTTON_PROPS = {
		aspect1: true,
		variant: "soft",
		roundedFull: true,
	};

	const ICON_SIZE = 24;

	// Wheel zoom handler
	function handleWheel(e: WheelEvent) {
		if (noZoom) return;
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

	export function resetZoom() {
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
			if (noZoom) return;
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

	export function next() {
		previewIdx = (previewIdx + 1) % assets.length;
		resetZoom();
	}

	export function previous() {
		previewIdx = (previewIdx - 1 + assets.length) % assets.length;
		resetZoom();
	}

	export function goTo(idx: number) {
		previewIdx = idx % assets.length;
		resetZoom();
	}

	let previewAsset = $derived(assets?.[previewIdx]);
</script>

{#if previewAsset}
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
		<div class="w-full h-full flex flex-col items-center justify-center">
			<div>
				{@html getAssetIcon(previewAsset.ext)({
					size: 32,
					class: "mx-auto",
				})}
			</div>
			<div class="text-(--stuic-color-muted-foreground) mt-4">
				{t("unable_to_preview")}
			</div>
		</div>
	{/if}

	{#if assets?.length > 1 && !noPrevNext}
		<div
			class="absolute inset-0 flex items-center justify-between pointer-events-none"
		>
			<Button
				class={twMerge(BUTTON_CLS, "ml-4", classControls)}
				onclick={previous}
				type="button"
				{...BUTTON_PROPS}
			>
				{@html iconPrevious({ size: ICON_SIZE })}
			</Button>

			<Button
				class={twMerge(BUTTON_CLS, "mr-4", classControls)}
				onclick={next}
				type="button"
				{...BUTTON_PROPS}
			>
				{@html iconNext({ size: ICON_SIZE })}
			</Button>
		</div>
	{/if}

	<div class="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
		{#if !noName && previewAsset?.name}
			<span class="stuic-assets-preview-label truncate px-1">
				{previewAsset?.name}
			</span>
		{:else}
			<span></span>
		{/if}
		<div class="flex items-center space-x-3 shrink-0">
			{#if previewAsset.isImage && !noZoom && !noZoomButtons}
				<Button
					class={twMerge(BUTTON_CLS, classControls)}
					type="button"
					onclick={zoomOut}
					disabled={zoomLevelIdx === 0}
					aria-label={t("zoom_out")}
					tooltip={t("zoom_out")}
					{...BUTTON_PROPS}
				>
					{@html iconZoomOut({ size: ICON_SIZE })}
				</Button>

				<Button
					class={twMerge(BUTTON_CLS, classControls)}
					type="button"
					onclick={zoomIn}
					disabled={zoomLevelIdx === ZOOM_LEVELS.length - 1}
					aria-label={t("zoom_in")}
					tooltip={t("zoom_in")}
					{...BUTTON_PROPS}
				>
					{@html iconZoomIn({ size: ICON_SIZE })}
				</Button>
			{/if}

			{#if typeof onDelete === "function"}
				<Button
					class={twMerge(BUTTON_CLS, classControls)}
					type="button"
					onclick={() => onDelete(previewAsset, previewIdx, { close: onClose ?? (() => {}) })}
					aria-label={t("delete")}
					tooltip={t("delete")}
					{...BUTTON_PROPS}
				>
					{@html iconDelete({ size: ICON_SIZE })}
				</Button>
			{/if}

			{#if !noDownload}
				<Button
					class={twMerge(BUTTON_CLS, classControls)}
					type="button"
					onclick={(e) => {
						e.preventDefault();
						forceDownload(
							String(previewAsset.url.original),
							previewAsset?.name || ""
						);
					}}
					aria-label={t("download")}
					tooltip={t("download")}
					{...BUTTON_PROPS}
				>
					{@html iconDownload({ size: ICON_SIZE })}
				</Button>
			{/if}

			{#if !noClose}
				<Button
					class={twMerge(BUTTON_CLS, classControls)}
					onclick={onClose}
					aria-label={t("close")}
					type="button"
					tooltip={t("close")}
					{...BUTTON_PROPS}
					x
				/>
			{/if}
		</div>
	</div>

	{#if assets.length > 1}
		{#if assets.length <= 10}
			{#if !noName && dotTooltip}
				<div
					class="absolute bottom-10 left-0 right-0 text-center"
					transition:fade={{ duration: 100 }}
				>
					<span class="stuic-assets-preview-label p-1">
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
							"stuic-assets-preview-dot",
							i === previewIdx ? "active" : ""
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
		{:else}
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
				<span class="stuic-assets-preview-label px-2 py-1 text-sm">
					{previewIdx + 1} / {assets.length}
				</span>
			</div>
		{/if}
	{/if}
{/if}
