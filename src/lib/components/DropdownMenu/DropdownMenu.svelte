<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";

	/**
	 * Valid positions for dropdown placement relative to the trigger element.
	 */
	export type DropdownMenuPosition =
		| "top"
		| "top-left"
		| "top-right"
		| "top-span-left"
		| "top-span-right"
		| "bottom"
		| "bottom-left"
		| "bottom-right"
		| "bottom-span-left"
		| "bottom-span-right"
		| "left"
		| "right";

	/** Base properties shared by most item types */
	interface DropdownMenuItemBase {
		/** Unique identifier - required for keyboard navigation tracking */
		id: string | number;
		/** Whether this item is disabled */
		disabled?: boolean;
		/** Additional CSS classes for this specific item */
		class?: string;
		/** Arbitrary data to pass through */
		data?: Record<string, any>;
	}

	/** Clickable action item */
	export interface DropdownMenuActionItem extends DropdownMenuItemBase {
		type: "action";
		/** Label displayed - supports THC for icons, HTML, etc. */
		label: THC;
		/** Content displayed before label (e.g., icon) - supports THC */
		contentBefore?: THC;
		/** Content displayed after label (e.g., shortcut hint, badge) - supports THC */
		contentAfter?: THC;
		/** Callback when item is selected */
		onSelect?: () => void | boolean;
	}

	/** Visual divider/separator */
	export interface DropdownMenuDividerItem {
		type: "divider";
		id?: string | number;
		class?: string;
	}

	/** Non-interactive section header */
	export interface DropdownMenuHeaderItem {
		type: "header";
		id?: string | number;
		label: THC;
		class?: string;
	}

	/** Custom static content (non-interactive) */
	export interface DropdownMenuCustomItem {
		type: "custom";
		id?: string | number;
		/** Content rendered via THC */
		content: THC;
		class?: string;
	}

	/** Expandable section containing nested items */
	export interface DropdownMenuExpandableItem extends DropdownMenuItemBase {
		type: "expandable";
		/** Label for the expandable header */
		label: THC;
		/** Content displayed before label (e.g., icon) - supports THC */
		contentBefore?: THC;
		/** Nested items (single level only - no nested expandables) */
		items: DropdownMenuFlatItem[];
		/** Whether section starts expanded */
		defaultExpanded?: boolean;
	}

	/** Flat items (non-expandable) */
	export type DropdownMenuFlatItem =
		| DropdownMenuActionItem
		| DropdownMenuDividerItem
		| DropdownMenuHeaderItem
		| DropdownMenuCustomItem;

	/** All possible item types */
	export type DropdownMenuItem = DropdownMenuFlatItem | DropdownMenuExpandableItem;

	/** Internal type for navigable items (includes expandable headers) */
	export interface NavigableExpandable {
		type: "expandable-header";
		id: string | number;
		expandableItem: DropdownMenuExpandableItem;
	}
	export type NavigableItem = DropdownMenuActionItem | NavigableExpandable;

	/** Search configuration options */
	export interface DropdownMenuSearchConfig {
		/** Placeholder text for search input */
		placeholder?: string;
		/** Search strategy */
		strategy?: "prefix" | "exact" | "fuzzy";
		/** Custom function to extract searchable text from an item */
		getContent?: (item: DropdownMenuActionItem | DropdownMenuExpandableItem) => string;
		/** Auto-focus search input when menu opens */
		autoFocus?: boolean;
		/** Message shown when no results found */
		noResultsMessage?: string;
	}

	export interface Props extends Omit<HTMLButtonAttributes, "children"> {
		/** Menu items to display */
		items: DropdownMenuItem[];
		/** Controlled open state */
		isOpen?: boolean;
		/** Popover position relative to trigger */
		position?: DropdownMenuPosition;
		/** Offset from trigger element (CSS value) */
		offset?: string;
		/** Max height of dropdown (CSS value) */
		maxHeight?: string;
		/** Whether to close menu when an action item is selected */
		closeOnSelect?: boolean;
		/** Close on click outside */
		closeOnClickOutside?: boolean;
		/** Close on Escape key */
		closeOnEscape?: boolean;
		/** Force fallback positioning mode (for testing) */
		forceFallback?: boolean;
		/** Enable search/filter functionality (true for defaults, or config object) */
		search?: boolean | DropdownMenuSearchConfig;
		/** Classes for the wrapper element */
		class?: string;
		/** Classes for the trigger button */
		classTrigger?: string;
		/** Classes for the dropdown container */
		classDropdown?: string;
		/** Classes for action items */
		classItem?: string;
		/** Classes for active/focused action item */
		classItemActive?: string;
		/** Classes for disabled items */
		classItemDisabled?: string;
		/** Classes for content before label (contentBefore slot) */
		classItemBefore?: string;
		/** Classes for content after label (contentAfter slot) */
		classItemAfter?: string;
		/** Classes for dividers */
		classDivider?: string;
		/** Classes for header items */
		classHeader?: string;
		/** Classes for expandable section header */
		classExpandable?: string;
		/** Classes for expandable section content */
		classExpandableContent?: string;
		/** Classes for backdrop (fallback mode only) */
		classBackdrop?: string;
		/** Classes for search input container */
		classSearchContainer?: string;
		/** Classes for search input */
		classSearchInput?: string;
		/** Show backdrop in fallback mode (default: true) */
		showBackdrop?: boolean;
		/** Custom trigger snippet - receives isOpen state, toggle function, and ARIA props for full control */
		trigger?: Snippet<
			[
				{
					isOpen: boolean;
					toggle: () => void;
					triggerProps: {
						id: string;
						"aria-haspopup": "menu";
						"aria-expanded": boolean;
						"aria-controls": string;
					};
				},
			]
		>;
		/** Simple content rendered inside the default trigger button */
		children?: Snippet;
		/** Called when menu opens */
		onOpen?: () => void;
		/** Called when menu closes */
		onClose?: () => void;
		/** Called when any action item is selected (fallback if item has no onSelect) */
		onSelect?: (item: DropdownMenuActionItem) => void | boolean;
		/** Reference to trigger element */
		triggerEl?: HTMLButtonElement;
		/** Reference to dropdown element */
		dropdownEl?: HTMLDivElement;
		/** Optional, used only when css positioning not supported (iPhone)*/
		noScrollLock?: boolean;
	}

	const POSITION_MAP: Record<string, string> = {
		top: "top",
		"top-left": "top left",
		"top-right": "top right",
		"top-span-left": "top span-left",
		"top-span-right": "top span-right",
		bottom: "bottom",
		"bottom-left": "bottom left",
		"bottom-right": "bottom right",
		"bottom-span-left": "bottom span-left",
		"bottom-span-right": "bottom span-right",
		left: "left",
		right: "right",
	};

	/**
	 * Checks if the browser supports CSS Anchor Positioning.
	 */
	function isAnchorPositioningSupported(): boolean {
		if (typeof CSS === "undefined") return false;
		return (
			CSS.supports("anchor-name", "--anchor") &&
			CSS.supports("position-area", "top") &&
			CSS.supports("position-try-fallbacks", "top")
		);
	}

	export const DROPDOWN_MENU_BASE_CLASSES = `stuic-dropdown-menu`;

	export const DROPDOWN_MENU_TRIGGER_CLASSES = `stuic-dropdown-menu-trigger`;

	export const DROPDOWN_MENU_DROPDOWN_CLASSES = `stuic-dropdown-menu-dropdown`;

	export const DROPDOWN_MENU_DIVIDER_CLASSES = `stuic-dropdown-menu-divider`;

	export const DROPDOWN_MENU_HEADER_CLASSES = `stuic-dropdown-menu-header`;

	export const DROPDOWN_MENU_BACKDROP_CLASSES = `stuic-dropdown-menu-backdrop`;
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { getId } from "../../utils/get-id.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { ItemCollection } from "@marianmeres/item-collection";
	import { iconChevronDown, iconChevronRight, iconSearch, iconX } from "$lib/icons/index.js";
	import { onClickOutside } from "runed";
	import { slide, fade } from "svelte/transition";
	import { untrack } from "svelte";
	import Thc from "../Thc/Thc.svelte";
	import ListItemButton from "../ListItemButton/ListItemButton.svelte";
	import { BodyScroll } from "../../utils/body-scroll-locker.js";
	import { waitForTwoRepaints } from "../../utils/paint.js";

	let {
		items,
		isOpen = $bindable(false),
		position = "bottom-span-right",
		offset = "0.25rem",
		maxHeight = "300px",
		closeOnSelect = true,
		closeOnClickOutside = true,
		closeOnEscape = true,
		forceFallback = false,
		search,
		class: classProp,
		classTrigger,
		classDropdown,
		classItem,
		classItemActive,
		classItemDisabled,
		classItemBefore,
		classItemAfter,
		classDivider,
		classHeader,
		classExpandable,
		classExpandableContent,
		classBackdrop,
		classSearchContainer,
		classSearchInput,
		showBackdrop = true,
		trigger,
		children,
		onOpen,
		onClose,
		onSelect,
		triggerEl = $bindable(),
		dropdownEl = $bindable(),
		noScrollLock,
		...rest
	}: Props = $props();

	// Unique IDs for ARIA
	const triggerId = getId("dropdown-trigger-");
	const dropdownId = getId("dropdown-menu-");
	const anchorName = `--dropdown-anchor-${triggerId}`;

	// State
	let wrapperEl: HTMLDivElement = $state()!;
	let activeItemEl: HTMLButtonElement | undefined = $state();
	const reducedMotion = prefersReducedMotion();

	// Runtime overflow detection state
	let runtimeFallback = $state(false);
	let switchingToFallback = false; // Non-reactive flag to prevent recursion

	const isSupported = $derived(
		!forceFallback && !runtimeFallback && isAnchorPositioningSupported()
	);

	// Track expanded sections (independent toggle - multiple can be open)
	let expandedSections = $state<Set<string | number>>(new Set());

	// Search state
	let searchQuery = $state("");
	let searchInputEl: HTMLInputElement | undefined = $state();

	// Default content extractor for search
	function defaultGetContent(
		item: DropdownMenuActionItem | DropdownMenuExpandableItem
	): string {
		if (typeof item.label === "string") return item.label;
		if (item.label && typeof item.label === "object" && "text" in item.label) {
			return (item.label as { text?: string }).text || "";
		}
		return String(item.id);
	}

	// Normalize search config
	let searchConfig = $derived.by(() => {
		if (!search) return null;
		const defaults = {
			placeholder: "Search...",
			strategy: "prefix" as const,
			getContent: defaultGetContent,
			autoFocus: true,
			noResultsMessage: "No results found",
		};
		return search === true ? defaults : { ...defaults, ...search };
	});

	// Extract all searchable items (action + expandable + nested actions)
	let allSearchableItems = $derived.by(() => {
		const result: (DropdownMenuActionItem | DropdownMenuExpandableItem)[] = [];
		for (const item of items) {
			if (item.type === "action") result.push(item);
			if (item.type === "expandable") {
				result.push(item);
				for (const child of item.items) {
					if (child.type === "action") result.push(child);
				}
			}
		}
		return result;
	});

	// Searchable collection (recreate when items or config changes)
	let searchableCollection = $derived.by(() => {
		if (!searchConfig) return null;
		return new ItemCollection(allSearchableItems, {
			idPropName: "id",
			searchable: { getContent: searchConfig.getContent },
		});
	});

	// Filtered items based on search
	let filteredItems = $derived.by(() => {
		if (!searchConfig || !searchQuery.trim() || !searchableCollection) {
			return items;
		}
		const results = searchableCollection.search(searchQuery, searchConfig.strategy);
		const matchedIds = new Set(results.map((r) => r.id));

		return items.filter((item) => {
			if (item.type === "divider" || item.type === "header" || item.type === "custom") {
				return false; // Hide during search
			}
			if (item.type === "action") return matchedIds.has(item.id);
			if (item.type === "expandable") {
				return (
					matchedIds.has(item.id) ||
					item.items.some((c) => c.type === "action" && matchedIds.has(c.id))
				);
			}
			return false;
		});
	});

	// Matched IDs for use in template filtering during search
	let searchMatchedIds = $derived.by(() => {
		if (!searchConfig || !searchQuery.trim() || !searchableCollection) {
			return null;
		}
		return new Set(
			searchableCollection.search(searchQuery, searchConfig.strategy).map((r) => r.id)
		);
	});

	// Initialize expanded sections from defaultExpanded
	$effect(() => {
		const initial = new Set<string | number>();
		for (const item of items) {
			if (item.type === "expandable" && item.defaultExpanded) {
				initial.add(item.id);
			}
		}
		expandedSections = initial;
	});

	// ItemCollection for keyboard navigation (includes action items and expandable headers)
	// svelte-ignore state_referenced_locally
	const navItems = new ItemCollection<NavigableItem>([], {
		idPropName: "id",
	});
	let _navItems = $derived($navItems);

	// Flatten navigable items (respects expanded state and search filter)
	let navigableItems = $derived.by(() => {
		const sourceItems = searchConfig && searchQuery.trim() ? filteredItems : items;
		const flat: NavigableItem[] = [];

		// When searching, get matched IDs to filter expandable children
		const matchedIds =
			searchConfig && searchQuery.trim() && searchableCollection
				? new Set(
						searchableCollection.search(searchQuery, searchConfig.strategy).map((r) => r.id)
					)
				: null;

		for (const item of sourceItems) {
			if (item.type === "action" && !item.disabled) {
				flat.push(item);
			} else if (item.type === "expandable" && !item.disabled) {
				// Add expandable header as navigable
				flat.push({ type: "expandable-header", id: item.id, expandableItem: item });
				// If expanded, add child actions
				if (expandedSections.has(item.id)) {
					for (const child of item.items) {
						if (child.type === "action" && !child.disabled) {
							// During search, only include matched children
							if (matchedIds) {
								if (matchedIds.has(child.id)) {
									flat.push(child);
								}
							} else {
								flat.push(child);
							}
						}
					}
				}
			}
		}
		return flat;
	});

	// Update collection when navigable items change, preserving active state
	$effect(() => {
		// Use untrack to read active ID without creating a dependency on $navItems
		const activeId = untrack(() => $navItems.active?.id);
		navItems.clear().addMany(navigableItems);
		// Restore active item if it still exists
		if (activeId !== undefined) {
			const item = navigableItems.find((i) => i.id === activeId);
			if (item) {
				navItems.setActive(item);
			}
		}
	});

	// Reset active when menu closes
	$effect(() => {
		if (!isOpen) {
			navItems.unsetActive();
		}
	});

	// Auto-focus search input when menu opens
	$effect(() => {
		if (isOpen && searchConfig?.autoFocus && searchInputEl) {
			requestAnimationFrame(() => searchInputEl?.focus());
		}
	});

	// Reset search when menu closes
	$effect(() => {
		if (!isOpen) {
			searchQuery = "";
		}
	});

	// Auto-expand sections with matching children during search
	$effect(() => {
		if (!searchConfig || !searchQuery.trim() || !searchableCollection) return;
		const matchedIds = new Set(
			searchableCollection.search(searchQuery, searchConfig.strategy).map((r) => r.id)
		);
		// Use untrack to avoid infinite loop (read without creating dependency)
		const currentExpanded = untrack(() => expandedSections);
		const newExpanded = new Set(currentExpanded);
		let hasChanges = false;
		for (const item of items) {
			if (item.type === "expandable") {
				if (item.items.some((c) => c.type === "action" && matchedIds.has(c.id))) {
					if (!newExpanded.has(item.id)) {
						newExpanded.add(item.id);
						hasChanges = true;
					}
				}
			}
		}
		if (hasChanges) {
			expandedSections = newExpanded;
		}
	});

	// Reset runtime fallback when menu closes
	$effect(() => {
		if (!isOpen) {
			// Unlock body scroll if we were in runtime fallback mode
			// (must do this before resetting runtimeFallback, otherwise isSupported
			// becomes true and the main body scroll effect skips the unlock)
			if (runtimeFallback && !noScrollLock) {
				BodyScroll.unlock();
			}
			runtimeFallback = false;
		}
	});

	// Runtime viewport overflow detection
	$effect(() => {
		if (!isOpen || !dropdownEl || forceFallback || runtimeFallback) return;
		if (!isAnchorPositioningSupported()) return;
		if (switchingToFallback) return;

		const checkOverflow = async () => {
			await waitForTwoRepaints();
			if (!dropdownEl || !isOpen) return;

			const rect = dropdownEl.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			if (
				rect.left < 0 ||
				rect.right > viewportWidth ||
				rect.top < 0 ||
				rect.bottom > viewportHeight
			) {
				switchingToFallback = true;
				runtimeFallback = true;
				requestAnimationFrame(() => {
					switchingToFallback = false;
				});
			}
		};

		checkOverflow();
	});

	// Scroll active item into view
	$effect(() => {
		if (isOpen && _navItems.active?.id) {
			const active = _navItems.active;
			const elId =
				active.type === "expandable-header"
					? expandableHeaderId(active.id)
					: itemId(active.id);
			const el = document.getElementById(elId);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "nearest" });
				el.focus();
			}
		}
	});

	// Handle open/close callbacks
	$effect(() => {
		if (isOpen) {
			onOpen?.();
		}
	});

	let wasOpen = $state(false);
	$effect(() => {
		if (wasOpen && !isOpen) {
			onClose?.();
		}
		wasOpen = isOpen;
	});

	$effect(() => {
		if (noScrollLock || isSupported) return;
		isOpen ? BodyScroll.lock() : BodyScroll.unlock();
	});

	// Click outside handler
	onClickOutside(
		() => wrapperEl,
		() => {
			if (closeOnClickOutside && isOpen) {
				isOpen = false;
				triggerEl?.focus();
			}
		}
	);

	// Helper to generate item IDs
	function itemId(id: string | number): string {
		return `${dropdownId}-item-${id}`;
	}

	// Helper to generate header IDs for expandable sections
	function expandableHeaderId(id: string | number): string {
		return `${dropdownId}-expandable-${id}`;
	}

	// Toggle expandable section
	function toggleExpanded(id: string | number) {
		const newSet = new Set(expandedSections);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		expandedSections = newSet;
	}

	// Select an action item
	function selectItem(item: DropdownMenuActionItem) {
		if (item.disabled) return;

		// Call item's onSelect if defined, otherwise fall back to component's onSelect
		const result = item.onSelect ? item.onSelect() : onSelect?.(item);

		if (result !== false && closeOnSelect) {
			isOpen = false;
			triggerEl?.focus();
		}
	}

	// Handle keyboard events in search input
	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && searchQuery) {
			e.preventDefault();
			e.stopPropagation();
			searchQuery = "";
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			e.stopPropagation();
			navItems.setActiveFirst();
		}
		if (e.key === "Enter" && filteredItems.length > 0) {
			e.preventDefault();
			const first = filteredItems.find(
				(i): i is DropdownMenuActionItem => i.type === "action" && !i.disabled
			);
			if (first) selectItem(first);
		}
	}

	// Computed transition duration
	let transitionDuration = $derived(reducedMotion.current ? 0 : 100);

	// Position styles for CSS Anchor Positioning
	let dropdownStyle = $derived.by(() => {
		if (isSupported) {
			// Use fixed height when search is enabled AND position is a "top" variant
			// to prevent jarring resize during filtering (dropdown grows upward)
			const isTopPosition = position.startsWith("top");
			const heightStyle =
				searchConfig && isTopPosition ? `height: ${maxHeight};` : `max-height: ${maxHeight};`;
			return `
				position: fixed;
				position-anchor: ${anchorName};
				position-area: ${POSITION_MAP[position] || "bottom"};
				margin: ${offset};
				${heightStyle}
			`;
		} else {
			// Fallback: centered modal overlay
			// Use fixed height when search is enabled to prevent jarring resize during filtering
			const heightStyle = searchConfig ? `height: ${maxHeight};` : `max-height: ${maxHeight};`;
			return `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				max-width: 90vw;
				${heightStyle}
				z-index: 50;
			`;
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (!isOpen) return;

		if (["ArrowDown", "ArrowUp"].includes(e.key)) {
			e.preventDefault();
			if (e.key === "ArrowUp") {
				// Check if at first item and search is active - return to search input
				if (searchConfig && _navItems.active?.id === navigableItems[0]?.id) {
					navItems.unsetActive();
					searchInputEl?.focus();
				} else {
					e.metaKey ? navItems.setActiveFirst() : navItems.setActivePrevious();
				}
			} else {
				e.metaKey ? navItems.setActiveLast() : navItems.setActiveNext();
			}
		} else if (e.key === "Home") {
			e.preventDefault();
			navItems.setActiveFirst();
		} else if (e.key === "End") {
			e.preventDefault();
			navItems.setActiveLast();
		} else if (["Enter", " "].includes(e.key)) {
			// Don't intercept space when typing in search input
			if (e.key === " " && e.target === searchInputEl) return;
			e.preventDefault();
			const active = _navItems.active;
			if (active) {
				if (active.type === "expandable-header") {
					toggleExpanded(active.id);
				} else {
					selectItem(active as DropdownMenuActionItem);
				}
			}
		} else if (e.key === "ArrowRight") {
			const active = _navItems.active;
			if (active?.type === "expandable-header" && !expandedSections.has(active.id)) {
				e.preventDefault();
				toggleExpanded(active.id);
			}
		} else if (e.key === "ArrowLeft") {
			const active = _navItems.active;
			if (active?.type === "expandable-header" && expandedSections.has(active.id)) {
				e.preventDefault();
				toggleExpanded(active.id);
			}
		} else if (e.key === "Escape" && closeOnEscape) {
			e.preventDefault();
			isOpen = false;
			triggerEl?.focus();
		} else if (e.key === "Tab") {
			isOpen = false;
		}
	}}
/>

<div
	bind:this={wrapperEl}
	class={twMerge(DROPDOWN_MENU_BASE_CLASSES, classProp)}
	style:anchor-name={isSupported ? anchorName : undefined}
>
	<!-- Trigger -->
	{#if trigger}
		<!-- Custom trigger with full control -->
		{@render trigger({
			isOpen,
			toggle: () => (isOpen = !isOpen),
			triggerProps: {
				id: triggerId,
				"aria-haspopup": "menu",
				"aria-expanded": isOpen,
				"aria-controls": dropdownId,
			},
		})}
	{:else}
		<!-- Default button (optionally with children content) -->
		<button
			bind:this={triggerEl}
			id={triggerId}
			class={twMerge(DROPDOWN_MENU_TRIGGER_CLASSES, classTrigger)}
			onclick={() => (isOpen = !isOpen)}
			aria-haspopup="menu"
			aria-expanded={isOpen}
			aria-controls={dropdownId}
			type="button"
			{...rest}
		>
			{#if children}
				{@render children()}
			{:else}
				Menu
				<span class={isOpen ? "rotate-180 inline-block" : "inline-block"}>
					{@html iconChevronDown({ size: 16 })}
				</span>
			{/if}
		</button>
	{/if}

	<!-- Backdrop (fallback mode only) -->
	{#if isOpen && !isSupported && showBackdrop}
		<div
			class={twMerge(DROPDOWN_MENU_BACKDROP_CLASSES, classBackdrop)}
			onclick={() => {
				if (closeOnClickOutside) {
					isOpen = false;
					triggerEl?.focus();
				}
			}}
			onkeydown={() => {}}
			role="presentation"
			transition:fade={{ duration: transitionDuration }}
		></div>
	{/if}

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			bind:this={dropdownEl}
			id={dropdownId}
			role="menu"
			aria-labelledby={triggerId}
			class={twMerge(
				DROPDOWN_MENU_DROPDOWN_CLASSES,
				!isSupported && "w-4/5 max-w-32",
				classDropdown
			)}
			style={dropdownStyle}
			transition:slide={{ duration: transitionDuration }}
		>
			<!-- Close button (fallback mode only) -->
			{#if !isSupported}
				<div class="sticky top-0 right-0 z-10 flex pointer-events-none">
					<button
						type="button"
						aria-label="Close"
						class="stuic-dropdown-menu-close absolute right-0 top-0 pointer-events-auto"
						onclick={() => {
							isOpen = false;
							triggerEl?.focus();
						}}
					>
						<svg
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2.5"
							stroke="currentColor"
							class="w-5 h-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/if}
			<!-- Search input -->
			{#if searchConfig}
				<div class={twMerge("stuic-dropdown-menu-search", classSearchContainer)}>
					<span class="stuic-dropdown-menu-search-icon">
						{@html iconSearch({ size: 16 })}
					</span>
					<input
						bind:this={searchInputEl}
						bind:value={searchQuery}
						type="text"
						placeholder={searchConfig.placeholder}
						class={twMerge("stuic-dropdown-menu-search-input", classSearchInput)}
						autocomplete="off"
						onfocus={() => navItems.unsetActive()}
						onkeydown={handleSearchKeydown}
						aria-label="Search menu items"
					/>
					{#if searchQuery}
						<button
							type="button"
							class="stuic-dropdown-menu-search-clear"
							onclick={() => {
								searchQuery = "";
								searchInputEl?.focus();
							}}
							aria-label="Clear search"
						>
							{@html iconX({ size: 14 })}
						</button>
					{/if}
				</div>
			{/if}
			<!-- Menu items -->
			{#if searchConfig && searchQuery && filteredItems.length === 0}
				<div class="stuic-dropdown-menu-no-results">{searchConfig.noResultsMessage}</div>
			{:else}
				{#each filteredItems as item}
					{#if item.type === "action"}
						{@const isActive = _navItems.active?.id === item.id}
						<ListItemButton
							id={itemId(item.id)}
							role="menuitem"
							focused={isActive}
							contentBefore={item.contentBefore}
							contentAfter={item.contentAfter}
							class={twMerge(classItem, item.class)}
							classFocused={classItemActive}
							classContentBefore={classItemBefore}
							classContentAfter={classItemAfter}
							onclick={() => selectItem(item)}
							onmouseenter={() => navItems.setActive(item)}
							disabled={item.disabled}
							tabindex={-1}
						>
							<Thc thc={item.label} />
						</ListItemButton>
					{:else if item.type === "divider"}
						<div
							role="separator"
						class={twMerge(DROPDOWN_MENU_DIVIDER_CLASSES, classDivider, item.class)}
					></div>
				{:else if item.type === "header"}
					<div
						role="presentation"
						class={twMerge(DROPDOWN_MENU_HEADER_CLASSES, classHeader, item.class)}
					>
						<Thc thc={item.label} />
					</div>
				{:else if item.type === "custom"}
					<div role="presentation" class={item.class}>
						<Thc thc={item.content} />
					</div>
				{:else if item.type === "expandable"}
					{@const isExpanded = expandedSections.has(item.id)}
					{@const isExpandableActive =
						_navItems.active?.type === "expandable-header" &&
						_navItems.active?.id === item.id}
					<div role="group" aria-labelledby={expandableHeaderId(item.id)}>
						<!-- Expandable header -->
						<ListItemButton
							id={expandableHeaderId(item.id)}
							role="menuitem"
							focused={isExpandableActive}
							contentBefore={item.contentBefore}
							contentAfter={{ html: iconChevronRight({ size: 16 }) }}
							class={twMerge("font-medium", classExpandable, item.class)}
							classFocused={classItemActive}
							classContentBefore={classItemBefore}
							classContentAfter={twMerge("transition-transform", isExpanded && "rotate-90")}
							onclick={() => toggleExpanded(item.id)}
							onmouseenter={() =>
								navItems.setActive({
									type: "expandable-header",
									id: item.id,
									expandableItem: item,
								})}
							aria-expanded={isExpanded}
							disabled={item.disabled}
							tabindex={-1}
						>
							<Thc thc={item.label} />
						</ListItemButton>

						<!-- Expandable content -->
						{#if isExpanded}
							<div
								class={twMerge(
									"stuic-dropdown-menu-expandable-content",
									classExpandableContent
								)}
								transition:slide={{ duration: transitionDuration }}
							>
								{#each item.items as childItem}
									{#if childItem.type === "action"}
										<!-- During search, only show matched action items -->
										{#if !searchMatchedIds || searchMatchedIds.has(childItem.id)}
											{@const isChildActive = _navItems.active?.id === childItem.id}
											<ListItemButton
												id={itemId(childItem.id)}
												role="menuitem"
												focused={isChildActive}
												contentBefore={childItem.contentBefore}
												contentAfter={childItem.contentAfter}
												class={twMerge(classItem, childItem.class)}
												classFocused={classItemActive}
												classContentBefore={classItemBefore}
												classContentAfter={classItemAfter}
												onclick={() => selectItem(childItem)}
												onmouseenter={() => navItems.setActive(childItem)}
												disabled={childItem.disabled}
												tabindex={-1}
											>
												<Thc thc={childItem.label} />
											</ListItemButton>
										{/if}
									{:else if !searchMatchedIds}
										<!-- Only show non-action items (divider, header, custom) when NOT searching -->
										{#if childItem.type === "divider"}
											<div
												role="separator"
												class={twMerge(
													DROPDOWN_MENU_DIVIDER_CLASSES,
													classDivider,
													childItem.class
												)}
											></div>
										{:else if childItem.type === "header"}
											<div
												role="presentation"
												class={twMerge(
													DROPDOWN_MENU_HEADER_CLASSES,
													classHeader,
													childItem.class
												)}
											>
												<Thc thc={childItem.label} />
											</div>
										{:else if childItem.type === "custom"}
											<div role="presentation" class={childItem.class}>
												<Thc thc={childItem.content} />
											</div>
										{/if}
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{/each}
			{/if}
		</div>
	{/if}
</div>
