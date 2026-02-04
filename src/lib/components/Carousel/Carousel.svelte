<script lang="ts" module>
	import type { ItemCollection as ItemCollectionBase } from "@marianmeres/item-collection";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/index.js";

	export interface CarouselItem {
		id: string | number;
		content: THC;
		disabled?: boolean;
		data?: Record<string, any>;
	}

	interface ItemCollectionItem extends CarouselItem {}
	export interface ItemColl extends ItemCollectionBase<ItemCollectionItem> {}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Array of carousel items */
		items: CarouselItem[];

		/** Number of items visible per view (default: 1) */
		itemsPerView?: number;

		/** Percentage of next item to show as peek hint (0-50) */
		peekPercent?: number;

		/** Gap between items in pixels or CSS value */
		gap?: number | string;

		/** Enable/disable active item tracking */
		trackActive?: boolean;

		/** Sync active item based on scroll position (requires trackActive) */
		syncActiveOnScroll?: boolean;

		/** Currently active item index (bindable) */
		activeIndex?: number;

		/** Currently active item value/id (bindable) */
		value?: string | number;

		/** Enable scroll snap behavior (default: true) */
		snap?: boolean;

		/** Snap alignment: start, center, end (default: start) */
		snapAlign?: "start" | "center" | "end";

		/** Enable keyboard navigation (default: true) */
		keyboard?: boolean;

		/** Allow cycling from last to first and vice versa */
		loop?: boolean;

		/** Scroll behavior for programmatic navigation (default: smooth) */
		scrollBehavior?: ScrollBehavior;

		/** Show scrollbar on hover (default: true). Set to false when using navigation buttons */
		scrollbar?: boolean;

		/** Enable horizontal scrolling via mouse wheel (default: true) */
		wheelScroll?: boolean;

		/** Custom class for container */
		class?: string;

		/** Custom class for the scrollable track */
		classTrack?: string;

		/** Custom class for each item wrapper */
		classItem?: string;

		/** Custom class for active item */
		classItemActive?: string;

		/** Skip all default styling */
		unstyled?: boolean;

		/** Bindable element reference */
		el?: HTMLDivElement;

		/** Callback when active item changes */
		onActiveChange?: (item: CarouselItem, index: number) => void;

		/** Custom render snippet for items (alternative to THC) */
		renderItem?: Snippet<[{ item: CarouselItem; index: number; active: boolean }]>;
	}
</script>

<script lang="ts">
	import { ItemCollection } from "@marianmeres/item-collection";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";

	let {
		items,
		itemsPerView = 1,
		peekPercent = 0,
		gap,
		trackActive = false,
		syncActiveOnScroll = false,
		activeIndex = $bindable(0),
		value = $bindable(),
		snap = true,
		snapAlign = "start",
		keyboard = true,
		loop = false,
		scrollBehavior = "smooth",
		scrollbar = true,
		wheelScroll = true,
		class: classProp,
		classTrack,
		classItem,
		classItemActive,
		unstyled = false,
		el = $bindable(),
		onActiveChange,
		renderItem,
		...rest
	}: Props = $props();

	// Internal refs
	let trackEl: HTMLDivElement | undefined = $state();
	let itemEls: Record<string | number, HTMLDivElement> = $state({});

	// ItemCollection for managing items and active state
	const coll: ItemColl = $derived.by(() => {
		const out = new ItemCollection(
			items.map((item) => ({ ...item })),
			{
				idPropName: "id",
				allowNextPrevCycle: loop,
			}
		);

		// Set initial active based on value or activeIndex
		if (value !== undefined) {
			const idx = out.items.findIndex((item) => item.id === value);
			if (idx > -1) out.setActiveIndex(idx);
		} else if (activeIndex !== undefined && activeIndex >= 0) {
			out.setActiveIndex(activeIndex);
		}

		return out;
	});

	// Sync collection changes back to bindable props
	$effect(() => {
		return coll.subscribe((c) => {
			if (trackActive) {
				value = c.active?.id;
				activeIndex = c.activeIndex ?? 0;
				if (c.active && c.activeIndex !== undefined) {
					onActiveChange?.(c.active, c.activeIndex);
				}
			}
		});
	});

	// Flag to prevent scroll loops (when programmatic scroll triggers observer)
	let isScrollingProgrammatically = false;

	// Track active item based on scroll position using IntersectionObserver
	$effect(() => {
		if (!trackActive || !syncActiveOnScroll || !trackEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (isScrollingProgrammatically) return;

				// Find the entry with highest intersection ratio
				let mostVisible: { id: string | number; ratio: number } | null = null;

				for (const entry of entries) {
					if (entry.isIntersecting) {
						const id = entry.target.getAttribute("data-id");
						if (id && (!mostVisible || entry.intersectionRatio > mostVisible.ratio)) {
							// Parse id back to number if it was originally a number
							const parsedId = coll.items.find((i) => String(i.id) === id)?.id;
							if (parsedId !== undefined) {
								mostVisible = { id: parsedId, ratio: entry.intersectionRatio };
							}
						}
					}
				}

				if (mostVisible && mostVisible.id !== coll.active?.id) {
					const item = coll.items.find((i) => i.id === mostVisible!.id);
					if (item) {
						coll.setActive(item);
					}
				}
			},
			{
				root: trackEl,
				threshold: [0.5, 0.75, 1.0],
			}
		);

		// Observe all item elements
		for (const id in itemEls) {
			if (itemEls[id]) {
				observer.observe(itemEls[id]);
			}
		}

		return () => observer.disconnect();
	});

	// Scroll active item into view when active changes programmatically
	function scrollActiveIntoView() {
		// Set flag to prevent IntersectionObserver from re-triggering
		isScrollingProgrammatically = true;

		// Use setTimeout to allow the ItemCollection state to update first
		setTimeout(() => {
			const activeItem = coll.active;
			if (activeItem && itemEls[activeItem.id]) {
				itemEls[activeItem.id]?.scrollIntoView({
					behavior: scrollBehavior,
					block: "nearest",
					inline:
						snapAlign === "center" ? "center" : snapAlign === "end" ? "end" : "start",
				});
			}

			// Reset flag after scroll animation completes
			setTimeout(
				() => {
					isScrollingProgrammatically = false;
				},
				scrollBehavior === "instant" ? 0 : 300
			);
		}, 0);
	}

	// Keyboard navigation handler
	function handleKeydown(e: KeyboardEvent) {
		if (!keyboard) return;

		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			coll.setActiveNext();
			scrollActiveIntoView();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			coll.setActivePrevious();
			scrollActiveIntoView();
		} else if (e.key === "Home") {
			e.preventDefault();
			coll.setActiveFirst();
			scrollActiveIntoView();
		} else if (e.key === "End") {
			e.preventDefault();
			coll.setActiveLast();
			scrollActiveIntoView();
		}
	}

	// Mouse wheel horizontal scroll handler
	function handleWheel(e: WheelEvent) {
		if (!wheelScroll || e.deltaY === 0) return;
		e.preventDefault();

		// With snap enabled, navigate by item; otherwise scroll by pixels
		if (snap) {
			if (e.deltaY > 0) {
				coll.setActiveNext();
			} else {
				coll.setActivePrevious();
			}
			scrollActiveIntoView();
		} else {
			trackEl!.scrollLeft += e.deltaY;
		}
	}

	// Public API methods
	export function goTo(index: number) {
		coll.setActiveIndex(index);
		scrollActiveIntoView();
	}

	export function goToId(id: string | number) {
		const item = coll.items.find((i) => i.id === id);
		if (item) {
			coll.setActive(item);
			scrollActiveIntoView();
		}
	}

	export function next() {
		coll.setActiveNext();
		scrollActiveIntoView();
	}

	export function previous() {
		coll.setActivePrevious();
		scrollActiveIntoView();
	}

	export function getCollection() {
		return coll;
	}

	// Compute inline styles for gap and peek
	let trackStyle = $derived.by(() => {
		const styles: string[] = [];
		if (gap !== undefined) {
			styles.push(`--stuic-carousel-gap: ${typeof gap === "number" ? `${gap}px` : gap}`);
		}
		if (peekPercent > 0) {
			styles.push(`--stuic-carousel-peek-percent: ${peekPercent}%`);
		}
		return styles.join("; ");
	});

	// Helper to check if item is active
	function isItemActive(index: number): boolean {
		return trackActive && coll.activeIndex === index;
	}
</script>

{#if coll.size}
	<div
		bind:this={el}
		class={twMerge(!unstyled && "stuic-carousel", classProp)}
		data-items-per-view={!unstyled ? itemsPerView : undefined}
		{...rest}
	>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			bind:this={trackEl}
			class={twMerge(!unstyled && "stuic-carousel-track", classTrack)}
			style={trackStyle || undefined}
			tabindex={keyboard ? 0 : undefined}
			role="region"
			aria-label="Carousel"
			aria-roledescription="carousel"
			data-snap={!unstyled && snap ? "true" : undefined}
			data-snap-align={!unstyled && snap ? snapAlign : undefined}
			data-scrollbar={!unstyled && scrollbar ? "true" : undefined}
			onkeydown={handleKeydown}
			onwheel={handleWheel}
		>
			{#each coll.items as item, i (item.id)}
				{@const active = isItemActive(i)}
				<div
					bind:this={itemEls[item.id]}
					data-id={item.id}
					class={twMerge(
						!unstyled && "stuic-carousel-item",
						classItem,
						active && classItemActive
					)}
					role="group"
					aria-roledescription="slide"
					aria-label={`Slide ${i + 1} of ${coll.size}`}
					data-active={active ? "true" : undefined}
					data-disabled={item.disabled ? "true" : undefined}
				>
					{#if renderItem}
						{@render renderItem({ item, index: i, active })}
					{:else}
						<Thc thc={item.content} />
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
