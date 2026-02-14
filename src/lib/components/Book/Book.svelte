<script lang="ts" module>
	import type { ItemCollection as ItemCollectionBase } from "@marianmeres/item-collection";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export interface BookPageArea {
		id: string | number;
		/** X position in natural image pixels */
		x: number;
		/** Y position in natural image pixels */
		y: number;
		/** Width in natural image pixels */
		w: number;
		/** Height in natural image pixels */
		h: number;
		[key: string]: any;
	}

	export interface BookPage {
		id: string | number;
		src: string;
		srcset?: string;
		sizes?: string;
		title?: string;
		/** Natural image width in px (required when areas are used) */
		width?: number;
		/** Natural image height in px (required when areas are used) */
		height?: number;
		/** Clickable areas on this page */
		areas?: BookPageArea[];
		[key: string]: any;
	}

	export interface BookSpread {
		id: number;
		spreadIndex: number;
		leftPage?: BookPage;
		rightPage?: BookPage;
	}

	interface ItemCollectionItem extends BookSpread {}
	export interface BookCollection extends ItemCollectionBase<ItemCollectionItem> {}

	export interface BookSheet {
		id: number;
		frontPage?: BookPage; // right page of spread[sheetIndex]
		backPage?: BookPage; // left page of spread[sheetIndex + 1]
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Ordered array of book pages */
		pages: BookPage[];
		/** Currently active spread index (bindable) */
		activeSpread?: number;
		/** Enable keyboard navigation (default: true) */
		keyboard?: boolean;
		/** Enable swipe gesture navigation (default: true) */
		swipe?: boolean;
		/** Flip animation duration in ms (default: 500) */
		duration?: number;
		/** Enable zoom capability (default: true) */
		zoom?: boolean;
		/** Discrete zoom levels (default: [1, 1.5, 2, 3]) */
		zoomLevels?: readonly number[];
		/** Clamp panning within bounds (default: false) */
		clampPan?: boolean;
		/** Force single-page layout (default: false) */
		singlePage?: boolean;
		/** Auto-switch to single-page when container is too narrow (default: true) */
		responsive?: boolean;
		/** Callback when active spread changes */
		onSpreadChange?: (spread: BookSpread, index: number) => void;
		/** Callback when a page is clicked, with relative x/y coordinates (0–1)
		 * (0, 0) = top-left corner, (1, 1) = bottom-right corner */
		onPageClick?: (data: { page: BookPage; x: number; y: number }) => void;
		/** Callback when a clickable area on a page is clicked */
		onAreaClick?: (data: { area: BookPageArea; page: BookPage }) => void;
		/** Custom render snippet for pages */
		renderPage?: Snippet<[{ page: BookPage; position: "left" | "right" | "cover" }]>;
		/** Custom class for container */
		class?: string;
		/** Custom class for the 3D perspective stage */
		classStage?: string;
		/** Custom class for individual pages */
		classPage?: string;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Bindable element reference */
		el?: HTMLDivElement;
	}

	/**
	 * Build spreads from pages.
	 * Spread 0: cover (page[0] alone on the right).
	 * Interior spreads: paired pages.
	 * Last spread: back cover (last page alone on the left) — always single.
	 */
	export function buildSpreads(pages: BookPage[]): BookSpread[] {
		if (!pages.length) return [];

		const spreads: BookSpread[] = [];

		// Spread 0: front cover
		spreads.push({
			id: 0,
			spreadIndex: 0,
			leftPage: undefined,
			rightPage: pages[0],
		});

		if (pages.length <= 1) return spreads;

		// Reserve last page as back cover
		const interior = pages.slice(1, pages.length > 2 ? pages.length - 1 : pages.length);

		// Pair interior pages
		let spreadIdx = 1;
		for (let i = 0; i < interior.length; i += 2) {
			spreads.push({
				id: spreadIdx,
				spreadIndex: spreadIdx,
				leftPage: interior[i],
				rightPage: i + 1 < interior.length ? interior[i + 1] : undefined,
			});
			spreadIdx++;
		}

		// Back cover spread (last page alone on left) — only if we have more than 2 pages
		if (pages.length > 2) {
			spreads.push({
				id: spreadIdx,
				spreadIndex: spreadIdx,
				leftPage: pages[pages.length - 1],
				rightPage: undefined,
			});
		}

		return spreads;
	}

	/**
	 * Build spreads for single-page mode.
	 * Each page becomes its own spread. leftPage is set so that
	 * buildSheets produces back faces showing the next page.
	 */
	export function buildSinglePageSpreads(pages: BookPage[]): BookSpread[] {
		return pages.map((page, i) => ({
			id: i,
			spreadIndex: i,
			leftPage: i > 0 ? page : undefined,
			rightPage: page,
		}));
	}

	/**
	 * Build sheets from spreads.
	 * Sheet k: front = spread[k].rightPage, back = spread[k+1].leftPage.
	 */
	export function buildSheets(spreads: BookSpread[]): BookSheet[] {
		const sheets: BookSheet[] = [];
		for (let i = 0; i < spreads.length - 1; i++) {
			sheets.push({
				id: i,
				frontPage: spreads[i].rightPage,
				backPage: spreads[i + 1]?.leftPage,
			});
		}
		return sheets;
	}
</script>

<script lang="ts">
	import { ItemCollection } from "@marianmeres/item-collection";
	import { twMerge } from "../../utils/tw-merge.js";
	import { preloadImgs, type PreloadImgOptions } from "../../utils/preload-img.js";

	let {
		pages,
		activeSpread = $bindable(0),
		keyboard = true,
		swipe = true,
		duration = 500,
		zoom: zoomEnabled = true,
		zoomLevels: ZOOM_LEVELS = [1, 1.5, 2, 3],
		clampPan = false,
		singlePage = false,
		responsive = true,
		onSpreadChange,
		onPageClick,
		onAreaClick,
		renderPage,
		class: classProp,
		classStage,
		classPage,
		unstyled = false,
		el = $bindable(),
		...rest
	}: Props = $props();

	// ---- Responsive single-page mode ----

	let containerWidth = $state(0);
	let autoSinglePage = $state(false);

	$effect(() => {
		if (!responsive || !el || containerWidth <= 0) return;
		const pw = parseFloat(
			getComputedStyle(el).getPropertyValue("--stuic-book-page-width")
		);
		if (!isNaN(pw) && pw > 0) {
			autoSinglePage = containerWidth < pw * 2;
		}
	});

	let isSinglePageMode = $derived(singlePage || (responsive && autoSinglePage));

	// ---- Position preservation on mode switch ----

	let prevMode: boolean | undefined;

	$effect(() => {
		const mode = isSinglePageMode;
		if (prevMode !== undefined && prevMode !== mode) {
			const oldSpreads = prevMode ? buildSinglePageSpreads(pages) : buildSpreads(pages);
			const s = oldSpreads[activeSpread];
			const visiblePage = s?.rightPage ?? s?.leftPage;
			if (visiblePage) {
				const newSpreads = mode ? buildSinglePageSpreads(pages) : buildSpreads(pages);
				const targetIdx = newSpreads.findIndex(
					(sp) =>
						sp.rightPage?.id === visiblePage.id || sp.leftPage?.id === visiblePage.id
				);
				if (targetIdx >= 0) activeSpread = targetIdx;
			}
		}
		prevMode = mode;
	});

	// ---- Data model ----

	let spreads = $derived(
		isSinglePageMode ? buildSinglePageSpreads(pages) : buildSpreads(pages)
	);
	let sheets = $derived(buildSheets(spreads));
	let totalSpreads = $derived(spreads.length);

	// Is the wrapper showing single-page width?
	let isCover = $derived(activeSpread === 0);
	let isSinglePage = $derived(isSinglePageMode);

	// ---- Item Collection ----

	const coll: BookCollection = $derived.by(() => {
		const out = new ItemCollection(
			spreads.map((s) => ({ ...s })),
			{ idPropName: "id" }
		);
		if (
			activeSpread !== undefined &&
			activeSpread >= 0 &&
			activeSpread < spreads.length
		) {
			out.setActiveIndex(activeSpread);
		}
		return out;
	});

	// Sync collection → bindable prop
	$effect(() => {
		return coll.subscribe((c) => {
			const idx = c.activeIndex ?? 0;
			activeSpread = idx;
			if (c.active) {
				onSpreadChange?.(c.active, idx);
			}
		});
	});

	// ---- Image preloading ----

	$effect(() => {
		const current = activeSpread;
		const toPreload: PreloadImgOptions[] = [];
		for (
			let i = Math.max(0, current - 1);
			i <= Math.min(spreads.length - 1, current + 1);
			i++
		) {
			for (const page of [spreads[i]?.leftPage, spreads[i]?.rightPage]) {
				if (page)
					toPreload.push({ src: page.src, srcset: page.srcset, sizes: page.sizes });
			}
		}
		if (toPreload.length) preloadImgs(toPreload);
	});

	// ---- Z-index: track currently transitioning sheet ----

	let transitioningSheet = $state<number | null>(null);
	let transitionTimer: ReturnType<typeof setTimeout> | undefined;

	function setTransitioningSheet(sheetIndex: number) {
		clearTimeout(transitionTimer);
		transitioningSheet = sheetIndex;
		transitionTimer = setTimeout(() => {
			transitioningSheet = null;
		}, duration + 50); // slightly longer than animation
	}

	// Auto-detect activeSpread changes (e.g. from bind:activeSpread or goTo)
	// and boost the transitioning sheet's z-index for smooth flip animation.
	let _prevSpread: number | undefined;
	$effect(() => {
		const curr = activeSpread;
		if (_prevSpread !== undefined && _prevSpread !== curr) {
			const sheetIdx = curr > _prevSpread ? curr - 1 : curr;
			setTransitioningSheet(sheetIdx);
		}
		_prevSpread = curr;
	});

	function getSheetZIndex(sheetIndex: number, flipped: boolean): number {
		// The currently transitioning sheet gets the highest z-index
		if (transitioningSheet === sheetIndex) {
			return sheets.length * 2;
		}
		// Flipped sheets: lower index = further back
		if (flipped) {
			return sheetIndex + 1;
		}
		// Unflipped sheets: higher index = further back
		return sheets.length - sheetIndex;
	}

	// ---- Zoom state ----

	const MIN_ZOOM = $derived(ZOOM_LEVELS[0]);
	const MAX_ZOOM = $derived(ZOOM_LEVELS[ZOOM_LEVELS.length - 1]);
	let zoomLevelIdx = $state(0);
	let isPinching = $state(false);
	let initialPinchDistance = 0;
	let initialPinchZoom = 1;
	let continuousZoom = $state(1);
	let zoomLevel = $derived(
		!zoomEnabled ? 1 : isPinching ? continuousZoom : ZOOM_LEVELS[zoomLevelIdx]
	);

	// ---- Pan state ----

	let isPanning = $state(false);
	let panX = $state(0);
	let panY = $state(0);
	let startPanX = 0;
	let startPanY = 0;
	let startMouseX = 0;
	let startMouseY = 0;

	let stageEl: HTMLDivElement | undefined = $state();

	// ---- Swipe state ----

	let swipeStartX = 0;
	let swipeStartY = 0;
	let swipeStartTime = 0;
	let isSwiping = false;

	// ---- Drag detection (for page click vs drag/swipe discrimination) ----

	let _wasDragged = false;
	let _dragStartClientX = 0;
	let _dragStartClientY = 0;

	// ---- Zoom helpers ----

	export function zoomIn() {
		if (!zoomEnabled) return;
		if (zoomLevelIdx < ZOOM_LEVELS.length - 1) {
			zoomLevelIdx++;
		}
	}

	export function zoomOut() {
		if (!zoomEnabled) return;
		if (zoomLevelIdx > 0) {
			zoomLevelIdx--;
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

	function getDistance(t1: Touch, t2: Touch): number {
		return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
	}

	function findNearestZoomLevelIdx(zoom: number): number {
		let nearest = 0;
		let minDiff = Math.abs(ZOOM_LEVELS[0] - zoom);
		for (let i = 1; i < ZOOM_LEVELS.length; i++) {
			const diff = Math.abs(ZOOM_LEVELS[i] - zoom);
			if (diff < minDiff) {
				minDiff = diff;
				nearest = i;
			}
		}
		return nearest;
	}

	function getClampedPan(newX: number, newY: number): { x: number; y: number } {
		if (!el) return { x: newX, y: newY };
		const wrapperRect = el.getBoundingClientRect();
		const stageWidth = stageEl?.getBoundingClientRect().width ?? wrapperRect.width;
		const stageHeight = stageEl?.getBoundingClientRect().height ?? wrapperRect.height;
		const maxPanX = Math.max(
			0,
			(stageWidth * zoomLevel - wrapperRect.width) / 2 / zoomLevel
		);
		const maxPanY = Math.max(
			0,
			(stageHeight * zoomLevel - wrapperRect.height) / 2 / zoomLevel
		);
		return {
			x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
			y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
		};
	}

	// ---- Navigation ----

	export function next() {
		if (activeSpread < totalSpreads - 1) {
			coll.setActiveNext();
			resetZoom();
		}
	}

	export function previous() {
		if (activeSpread > 0) {
			coll.setActivePrevious();
			resetZoom();
		}
	}

	export function goTo(spreadIndex: number) {
		if (spreadIndex >= 0 && spreadIndex < totalSpreads) {
			coll.setActiveIndex(spreadIndex);
			resetZoom();
		}
	}

	export function getCollection() {
		return coll;
	}

	// ---- Keyboard ----

	function handleKeydown(e: KeyboardEvent) {
		if (!keyboard) return;
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			next();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			previous();
		} else if (e.key === "Home") {
			e.preventDefault();
			goTo(0);
		} else if (e.key === "End") {
			e.preventDefault();
			goTo(totalSpreads - 1);
		}
	}

	// ---- Wheel zoom ----

	function handleWheel(e: WheelEvent) {
		if (!zoomEnabled) return;
		e.preventDefault();
		if (e.deltaY > 0) zoomOut();
		else zoomIn();
	}

	// ---- Combined pannable + swipeable action ----

	function pannable(node: HTMLElement) {
		function onStart(e: MouseEvent | TouchEvent) {
			// Two-finger pinch
			if ("touches" in e && e.touches.length === 2 && zoomEnabled) {
				e.preventDefault();
				isPinching = true;
				isPanning = false;
				isSwiping = false;
				initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
				initialPinchZoom = continuousZoom;
				return;
			}

			const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

			_wasDragged = false;
			_dragStartClientX = clientX;
			_dragStartClientY = clientY;

			if (zoomLevel > 1) {
				// Pan mode
				e.preventDefault();
				isPanning = true;
				startMouseX = clientX;
				startMouseY = clientY;
				startPanX = panX;
				startPanY = panY;
			} else if (swipe) {
				// Swipe mode
				isSwiping = true;
				swipeStartX = clientX;
				swipeStartY = clientY;
				swipeStartTime = Date.now();
			}
		}

		function onMove(e: MouseEvent | TouchEvent) {
			// Pinch zoom
			if ("touches" in e && e.touches.length === 2 && isPinching && zoomEnabled) {
				e.preventDefault();
				const dist = getDistance(e.touches[0], e.touches[1]);
				const scale = dist / initialPinchDistance;
				continuousZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialPinchZoom * scale));
				return;
			}

			// Track drag for page click detection
			if (!_wasDragged) {
				const cx = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
				const cy = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
				if (
					Math.abs(cx - _dragStartClientX) > 5 ||
					Math.abs(cy - _dragStartClientY) > 5
				) {
					_wasDragged = true;
				}
			}

			// Pan
			if (isPanning) {
				e.preventDefault();
				const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
				const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
				const newX = startPanX + (clientX - startMouseX);
				const newY = startPanY + (clientY - startMouseY);
				if (clampPan) {
					const clamped = getClampedPan(newX, newY);
					panX = clamped.x;
					panY = clamped.y;
				} else {
					panX = newX;
					panY = newY;
				}
			}
		}

		function onEnd(e: MouseEvent | TouchEvent) {
			// End pinch
			if (isPinching) {
				isPinching = false;
				zoomLevelIdx = findNearestZoomLevelIdx(continuousZoom);
				continuousZoom = ZOOM_LEVELS[zoomLevelIdx];
				if (zoomLevelIdx === 0) {
					panX = 0;
					panY = 0;
				}
				return;
			}

			// End pan
			if (isPanning) {
				isPanning = false;
				return;
			}

			// End swipe
			if (isSwiping) {
				isSwiping = false;
				const clientX =
					"changedTouches" in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
				const deltaX = clientX - swipeStartX;
				const elapsed = Date.now() - swipeStartTime;
				const SWIPE_THRESHOLD = 50;
				const SWIPE_MAX_TIME = 500;

				if (Math.abs(deltaX) > SWIPE_THRESHOLD && elapsed < SWIPE_MAX_TIME) {
					if (deltaX < 0) next();
					else previous();
				}
			}
		}

		node.addEventListener("mousedown", onStart);
		node.addEventListener("touchstart", onStart, { passive: false });
		node.addEventListener("wheel", handleWheel, { passive: false });
		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onEnd);
		document.addEventListener("touchmove", onMove, { passive: false });
		document.addEventListener("touchend", onEnd);
		document.addEventListener("touchcancel", onEnd);

		return {
			destroy() {
				node.removeEventListener("mousedown", onStart);
				node.removeEventListener("touchstart", onStart);
				node.removeEventListener("wheel", handleWheel);
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onEnd);
				document.removeEventListener("touchmove", onMove);
				document.removeEventListener("touchend", onEnd);
				document.removeEventListener("touchcancel", onEnd);
				clearTimeout(transitionTimer);
			},
		};
	}

	// ---- Page click ----

	function handlePageClick(e: MouseEvent, page: BookPage | undefined) {
		if (!onPageClick || !page || _wasDragged) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		onPageClick({ page, x, y });
	}
</script>

{#if spreads.length}
	<!-- Measurement wrapper: always 100% width for responsive detection -->
	<div bind:clientWidth={containerWidth} style:width="100%" style:text-align="center">
		<!-- Visual book wrapper: owns background/shadow/radius -->
		<div
			bind:this={el}
			class={twMerge(!unstyled && "stuic-book", classProp)}
			style:width={isSinglePage
				? "var(--stuic-book-page-width)"
				: "calc(var(--stuic-book-page-width) * 2)"}
			style:overflow={zoomLevel > 1 || isSinglePage ? "hidden" : undefined}
			{...rest}
		>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				bind:this={stageEl}
				class={twMerge(!unstyled && "stuic-book-stage", classStage)}
				use:pannable
				tabindex={keyboard ? 0 : undefined}
				role="region"
				aria-label="Book"
				aria-roledescription="book"
				style:translate={isSinglePageMode
					? "calc(var(--stuic-book-page-width) * -1)"
					: "0"}
				style:touch-action="none"
				style:user-select="none"
				style:transform={zoomLevel !== 1
					? `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`
					: undefined}
				style:transform-origin="center center"
				class:cursor-grab={zoomLevel > 1 && !isPanning}
				class:cursor-grabbing={isPanning}
				onkeydown={handleKeydown}
			>
				<!-- Sheets (3D flippable elements) — no static pages needed -->
				{#each sheets as sheet (sheet.id)}
					{@const flipped = sheet.id < activeSpread}
					<div
						class={twMerge(!unstyled && "stuic-book-sheet")}
						data-flipped={flipped ? "true" : undefined}
						style:z-index={getSheetZIndex(sheet.id, flipped)}
						style:transition-duration="{duration}ms"
					>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- Front face: right page of spread[sheetIndex] -->
						<div
							class={twMerge(!unstyled && "stuic-book-sheet-front", classPage)}
							data-placeholder={!sheet.frontPage && sheet.backPage ? "" : undefined}
							onclick={(e) => handlePageClick(e, sheet.frontPage)}
						>
							{#if sheet.frontPage}
								{#if renderPage}
									{@render renderPage({
										page: sheet.frontPage,
										position: isSinglePageMode
											? "right"
											: sheet.id === 0
												? "cover"
												: "right",
									})}
								{:else}
									<img
										src={sheet.frontPage.src}
										srcset={sheet.frontPage.srcset}
										sizes={sheet.frontPage.sizes}
										alt={sheet.frontPage.title ?? ""}
										draggable="false"
									/>
								{/if}
								{#if onAreaClick && Math.abs(sheet.id - activeSpread) <= 1 && sheet.frontPage.areas?.length && sheet.frontPage.width && sheet.frontPage.height}
									<svg
										viewBox="0 0 {sheet.frontPage.width} {sheet.frontPage.height}"
										preserveAspectRatio="xMidYMid meet"
										class={!unstyled ? "stuic-book-areas" : undefined}
									>
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										{#each sheet.frontPage.areas as area (area.id)}
											<rect
												x={area.x}
												y={area.y}
												width={area.w}
												height={area.h}
												class={!unstyled ? "stuic-book-area" : undefined}
												onclick={(e: MouseEvent) => {
													if (_wasDragged) return;
													e.stopPropagation();
													onAreaClick({ area, page: sheet.frontPage! });
												}}
											/>
										{/each}
									</svg>
								{/if}
							{/if}
						</div>

						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- Back face: left page of spread[sheetIndex + 1] -->
						<div
							class={twMerge(!unstyled && "stuic-book-sheet-back", classPage)}
							data-placeholder={!sheet.backPage && sheet.frontPage ? "" : undefined}
							onclick={(e) => handlePageClick(e, sheet.backPage)}
						>
							{#if sheet.backPage}
								{#if renderPage}
									{@render renderPage({
										page: sheet.backPage,
										position: isSinglePageMode ? "right" : "left",
									})}
								{:else}
									<img
										src={sheet.backPage.src}
										srcset={sheet.backPage.srcset}
										sizes={sheet.backPage.sizes}
										alt={sheet.backPage.title ?? ""}
										draggable="false"
									/>
								{/if}
								{#if onAreaClick && Math.abs(sheet.id - activeSpread) <= 1 && sheet.backPage.areas?.length && sheet.backPage.width && sheet.backPage.height}
									<svg
										viewBox="0 0 {sheet.backPage.width} {sheet.backPage.height}"
										preserveAspectRatio="xMidYMid meet"
										class={!unstyled ? "stuic-book-areas" : undefined}
									>
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										{#each sheet.backPage.areas as area (area.id)}
											<rect
												x={area.x}
												y={area.y}
												width={area.w}
												height={area.h}
												class={!unstyled ? "stuic-book-area" : undefined}
												onclick={(e: MouseEvent) => {
													if (_wasDragged) return;
													e.stopPropagation();
													onAreaClick({ area, page: sheet.backPage! });
												}}
											/>
										{/each}
									</svg>
								{/if}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
