<script lang="ts" module>
	import type { Props as BookProps } from "./Book.svelte";

	export interface Props extends Omit<BookProps, "responsive" | "singlePage"> {
		/** Minimum page width (px) before switching to single-page mode (default: 150) */
		minPageWidth?: number;
		/** Resize debounce delay in ms (default: 150) */
		debounce?: number;
	}
</script>

<script lang="ts">
	import Book, { computeBookPageSize, type BookPage } from "./Book.svelte";
	import { waitForTwoRepaints } from "$lib/utils/paint.js";

	let bookRef: ReturnType<typeof Book> | undefined = $state();

	let {
		pages,
		minPageWidth = 150,
		debounce: debounceMs = 150,
		activeSpread = $bindable(0),
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

	// ---- Proxy API (safe no-ops during remount) ----

	export function next() { bookRef?.next(); }
	export function previous() { bookRef?.previous(); }
	export function goTo(spreadIndex: number) { bookRef?.goTo(spreadIndex); }
	export function goToPage(pageId: BookPage["id"]) { bookRef?.goToPage(pageId); }
	export function zoomIn() { bookRef?.zoomIn(); }
	export function zoomOut() { bookRef?.zoomOut(); }
	export function resetZoom() { bookRef?.resetZoom(); }
	export function getCollection() { return bookRef?.getCollection(); }

	// Dynamically size the book to fill available container space.
	// We own the single/dual page decision (responsive={false}) to avoid feedback loops —
	// the Book's internal responsive detection uses bind:clientWidth which conflicts with
	// our external sizing and can oscillate during flip animations.
	// Uses window resize event instead of ResizeObserver for the same reason.
	$effect(() => {
		if (!containerEl) return;
		let timer: ReturnType<typeof setTimeout>;

		const apply = () => {
			const cw = containerEl!.clientWidth;
			const ch = containerEl!.clientHeight;
			if (!cw || !ch) return;

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

		// subsequent resizes — debounced to avoid flickering during drag
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(apply, debounceMs);
		};
		window.addEventListener("resize", onResize);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", onResize);
		};
	});
</script>

<div
	bind:this={containerEl}
	class="stuic-book-responsive"
	style="--stuic-book-page-width: {pageWidth}px; --stuic-book-page-height: {pageHeight}px;{resizing
		? ' --stuic-book-duration: 0ms;'
		: ''}"
>
	{#if measured}
		<Book
			bind:this={bookRef}
			{pages}
			responsive={false}
			singlePage={forceSingle}
			bind:activeSpread
			{...rest}
		/>
	{/if}
</div>

<style>
	.stuic-book-responsive {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
</style>
