<script lang="ts" module>
	import type { Props as BookProps } from "./Book.svelte";

	export interface Props extends Omit<BookProps, "responsive" | "singlePage"> {
		/** Minimum page width (px) before switching to single-page mode (default: 150) */
		minPageWidth?: number;
		/** Resize debounce delay in ms (default: 150) */
		debounce?: number;
		/** Container width (px) below which the component switches to a
		 *  mobile-friendly inline asset preview. Set 0 to disable. (default: 480) */
		inlineThreshold?: number;
		/** Force inline asset-preview mode regardless of container width (default: false) */
		forceInline?: boolean;
		/** Hide prev/next arrow buttons (default: false) */
		noPrevNext?: boolean;
		/** Custom class for prev/next control buttons */
		classControls?: string;
		/** Hide the mode switch toggle button (default: false) */
		noModeSwitch?: boolean;
		/** Initial display mode. When set, overrides the automatic threshold-based
		 *  detection on mount but still allows switching via the toggle button.
		 *  (default: undefined — auto-detect from container width) */
		initialMode?: "book" | "inline";
	}
</script>

<script lang="ts">
	import {
		iconBookOpen,
		iconArrowRight as iconNext,
		iconArrowLeft as iconPrevious,
	} from "$lib/icons/index.js";
	import { waitForTwoRepaints } from "$lib/utils/paint.js";
	import { resolveUrl } from "$lib/utils/resolve-url.js";
	import { twMerge } from "$lib/utils/tw-merge.js";
	import { iconLucideFileImage as iconFileImage } from "@marianmeres/icons-fns/lucide/iconLucideFileImage.js";
	import type { AssetPreviewNormalized } from "../AssetsPreview/_internal/assets-preview-types.js";
	import AssetsPreviewInline from "../AssetsPreview/AssetsPreviewInline.svelte";
	import Button from "../Button/Button.svelte";
	import IconSwap from "../IconSwap/IconSwap.svelte";
	import { bookPagesToAssets } from "./_internal/book-pages-to-assets.js";
	import Book, {
		buildSpreads,
		computeBookPageSize,
		type BookPage,
		type BookSpread,
	} from "./Book.svelte";

	const BUTTON_CLS = "stuic-book-control pointer-events-auto p-0!";
	const BUTTON_PROPS = { aspect1: true, variant: "soft" as const, roundedFull: true };
	const ICON_SIZE = 24;

	let bookRef: ReturnType<typeof Book> | undefined = $state();
	let inlineRef: ReturnType<typeof AssetsPreviewInline> | undefined = $state();

	let {
		pages,
		minPageWidth = 150,
		debounce: debounceMs = 150,
		activeSpread = $bindable(0),
		inlineThreshold = 480,
		forceInline = false,
		noPrevNext = false,
		noModeSwitch = false,
		initialMode,
		classControls = "",
		// Extract props needed for inline mode forwarding
		baseUrl,
		onAreaClick,
		onSpreadChange,
		clampPan,
		zoom = true,
		...rest
	}: Props = $props();

	// derive aspect ratio from actual page dimensions
	const ratio = $derived.by(() => {
		const size = computeBookPageSize(pages);
		return size.width / size.height;
	});

	let containerEl: HTMLDivElement | undefined = $state();
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	let forceSingle = $state(false);
	let resizing = $state(false);
	let measured = $state(false);
	let containerWidth = $state(0);

	// ---- Manual mode override ----

	let manualMode: "book" | "inline" | null = $state(initialMode ?? null);

	// ---- Inline mode ----

	let belowThreshold = $derived(
		inlineThreshold > 0 && containerWidth > 0 && containerWidth < inlineThreshold
	);

	let useInline = $derived(
		forceInline ||
			belowThreshold ||
			(manualMode !== null ? manualMode === "inline" : false)
	);

	const MODE_SWITCH_ICON_SIZE = 19;
	const modeSwitchStates = [
		iconBookOpen({ size: MODE_SWITCH_ICON_SIZE, strokeWidth: 2 }),
		iconFileImage({ size: MODE_SWITCH_ICON_SIZE, strokeWidth: 2 }),
	];
	let modeSwitchActive = $derived(useInline ? 1 : 0);

	function toggleMode() {
		manualMode = useInline ? "book" : "inline";
	}

	let inlineAssets = $derived(useInline ? bookPagesToAssets(pages, baseUrl) : []);

	// The current page index while in inline mode (bound to AssetsPreviewInline)
	let inlinePageIdx = $state(0);

	// Seed inlinePageIdx from activeSpread when entering inline mode
	let _wasInline = false;
	$effect.pre(() => {
		if (useInline && !_wasInline) {
			// Entering inline: map spread → page index
			inlinePageIdx = spreadToPageIndex(activeSpread);
		}
		if (!useInline && _wasInline) {
			// Leaving inline: ensure activeSpread is a valid spread index
			activeSpread = pageIndexToSpread(inlinePageIdx);
		}
		_wasInline = useInline;
	});

	// While in inline mode, keep activeSpread in sync
	$effect(() => {
		if (useInline) {
			activeSpread = pageIndexToSpread(inlinePageIdx);
		}
	});

	// Synthesize onSpreadChange in inline mode
	$effect(() => {
		if (useInline && onSpreadChange) {
			const idx = inlinePageIdx;
			const page = pages[idx];
			if (page) {
				const syntheticSpread: BookSpread = {
					id: idx,
					spreadIndex: idx,
					leftPage: undefined,
					rightPage: page,
				};
				onSpreadChange(syntheticSpread, idx);
			}
		}
	});

	// Wrap onAreaClick to convert AssetPreviewNormalized → BookPage
	let wrappedAreaClick = $derived.by(() => {
		if (!onAreaClick) return undefined;
		return (data: { area: any; asset: AssetPreviewNormalized }) => {
			const fullUrl = String(data.asset.url?.full ?? "");
			const page = pages.find((p) => resolveUrl(p.src, p.baseUrl || baseUrl) === fullUrl);
			if (page) onAreaClick({ area: data.area, page });
		};
	});

	// ---- Spread ↔ Page index mapping ----

	function spreadToPageIndex(spreadIdx: number): number {
		if (pages.length <= 1) return 0;
		if (forceSingle) return Math.min(spreadIdx, pages.length - 1);

		const spreads = buildSpreads(pages);
		const spread = spreads[Math.min(spreadIdx, spreads.length - 1)];
		const page = spread?.rightPage ?? spread?.leftPage;
		if (!page) return 0;

		const idx = pages.indexOf(page);
		return idx >= 0 ? idx : 0;
	}

	function pageIndexToSpread(pageIndex: number): number {
		if (pages.length <= 1) return 0;
		if (forceSingle) return Math.min(pageIndex, pages.length - 1);

		const spreads = buildSpreads(pages);
		const page = pages[Math.min(pageIndex, pages.length - 1)];
		const idx = spreads.findIndex((s) => s.rightPage === page || s.leftPage === page);
		return idx >= 0 ? idx : 0;
	}

	// ---- Proxy API (safe no-ops during remount / inline mode) ----

	export function next() {
		useInline ? inlineRef?.next() : bookRef?.next();
	}
	export function previous() {
		useInline ? inlineRef?.previous() : bookRef?.previous();
	}
	export function goTo(spreadIndex: number) {
		if (useInline) {
			inlineRef?.goTo(spreadToPageIndex(spreadIndex));
		} else {
			bookRef?.goTo(spreadIndex);
		}
	}
	export function goToPage(pageId: BookPage["id"]) {
		if (useInline) {
			const idx = pages.findIndex((p) => p.id === pageId);
			if (idx >= 0) inlineRef?.goTo(idx);
		} else {
			bookRef?.goToPage(pageId);
		}
	}
	export function zoomIn() {
		bookRef?.zoomIn();
	}
	export function zoomOut() {
		bookRef?.zoomOut();
	}
	export function resetZoom() {
		bookRef?.resetZoom();
	}
	export function getCollection() {
		return bookRef?.getCollection();
	}

	// Dynamically size the book to fill available container space.
	// We own the single/dual page decision (responsive={false}) to avoid feedback loops —
	// the Book's internal responsive detection uses bind:clientWidth which conflicts with
	// our external sizing and can oscillate during flip animations.
	$effect(() => {
		if (!containerEl) return;
		let timer: ReturnType<typeof setTimeout>;
		let lastCW = 0;
		let lastCH = 0;

		const apply = () => {
			// use getBoundingClientRect() for subpixel precision — clientWidth/clientHeight
			// return integers which can round UP, causing the page to exceed available
			// space by a fraction of a pixel (enough to trigger scrollbars in min-h-screen
			// layouts). The later Math.floor() on page dimensions rounds DOWN from the
			// precise float, guaranteeing the page never exceeds the container.
			const rect = containerEl!.getBoundingClientRect();
			const style = getComputedStyle(containerEl!);
			const cw =
				rect.width -
				parseFloat(style.paddingLeft) -
				parseFloat(style.paddingRight) -
				parseFloat(style.borderLeftWidth) -
				parseFloat(style.borderRightWidth);
			const ch =
				rect.height -
				parseFloat(style.paddingTop) -
				parseFloat(style.paddingBottom) -
				parseFloat(style.borderTopWidth) -
				parseFloat(style.borderBottomWidth);
			if (!cw || !ch) return;

			// skip if dimensions unchanged (prevents ResizeObserver oscillation)
			if (cw === lastCW && ch === lastCH) return;
			lastCW = cw;
			lastCH = ch;

			// Track container width for inline threshold decision
			containerWidth = cw;

			// If below inline threshold, skip Book sizing entirely
			if (inlineThreshold > 0 && cw < inlineThreshold) return;

			// suppress width/translate transitions during dimension changes,
			// then restore so flip animations (stage translate) work normally
			resizing = true;

			// try dual-page first: 2 pages side by side
			const dualHeight = Math.floor(Math.min(ch, cw / 2 / ratio));
			const dualWidth = Math.floor(dualHeight * ratio);

			if (dualWidth >= minPageWidth) {
				// dual-page mode — pages are large enough
				pageWidth = dualWidth;
				pageHeight = dualHeight;
				forceSingle = false;
			} else {
				// single-page mode — container too narrow for readable dual pages
				const singleHeight = Math.floor(Math.min(ch, cw / ratio));
				pageWidth = Math.floor(singleHeight * ratio);
				pageHeight = singleHeight;
				forceSingle = true;
			}

			// force-remount Book so 3D context reinitializes with new dimensions
			// (overflow:hidden flattens preserve-3d when dimensions change mid-life)
			measured = false;
			waitForTwoRepaints().then(() => {
				resizing = false;
				measured = true;
			});
		};

		// initial measurement
		apply();

		// observe container resizes (layout-driven changes like sidebar toggle)
		const ro = new ResizeObserver(() => {
			clearTimeout(timer);
			timer = setTimeout(apply, debounceMs);
		});
		ro.observe(containerEl!);

		// also listen to window resize — ResizeObserver may not fire in
		// min-h-screen layouts where viewport changes don't immediately
		// propagate to the container's border box
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(apply, debounceMs);
		};
		window.addEventListener("resize", onResize);

		return () => {
			clearTimeout(timer);
			ro.disconnect();
			window.removeEventListener("resize", onResize);
		};
	});
</script>

<div
	bind:this={containerEl}
	class="stuic-book-responsive"
	class:stuic-book-responsive--inline={useInline}
	style={useInline
		? ""
		: `--stuic-book-page-width: ${pageWidth}px; --stuic-book-page-height: ${pageHeight}px;${resizing ? " --stuic-book-duration: 0ms;" : ""}`}
>
	{#if useInline}
		<AssetsPreviewInline
			bind:this={inlineRef}
			bind:currentIndex={inlinePageIdx}
			assets={inlineAssets}
			{baseUrl}
			{clampPan}
			onAreaClick={wrappedAreaClick}
			noZoom={!zoom}
			noName
			noDownload
			noDots
			noZoomButtons
			{noPrevNext}
			{classControls}
			class="absolute inset-0"
		/>
	{:else if measured}
		<Book
			bind:this={bookRef}
			{pages}
			responsive={false}
			singlePage={forceSingle}
			bind:activeSpread
			{baseUrl}
			{onAreaClick}
			{onSpreadChange}
			{clampPan}
			{zoom}
			{...rest}
		/>
		{#if pages.length > 1 && !noPrevNext}
			<div
				class="absolute inset-0 flex items-center justify-between pointer-events-none"
				style:z-index={100}
			>
				<Button
					class={twMerge(BUTTON_CLS, "ml-4", classControls)}
					onclick={() => previous()}
					type="button"
					{...BUTTON_PROPS}
				>
					{@html iconPrevious({ size: ICON_SIZE })}
				</Button>
				<Button
					class={twMerge(BUTTON_CLS, "mr-4", classControls)}
					onclick={() => next()}
					type="button"
					{...BUTTON_PROPS}
				>
					{@html iconNext({ size: ICON_SIZE })}
				</Button>
			</div>
		{/if}
	{/if}
	{#if !noModeSwitch && !forceInline && !belowThreshold && pages.length > 0}
		<Button
			type="button"
			aspect1
			roundedFull
			class="absolute bottom-4 right-4 border-0"
			onclick={toggleMode}
			tooltip={() => ({
				content: useInline ? "Switch to book view" : "Switch to inline view",
			})}
		>
			<IconSwap states={modeSwitchStates} active={modeSwitchActive} duration={200} />
		</Button>
	{/if}
</div>

<style>
	.stuic-book-responsive {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.stuic-book-responsive--inline {
		position: relative;
		overflow: visible;
	}
</style>
