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
		/** Shortcut hint displayed on the right (e.g., "Cmd+K") */
		shortcut?: string;
		/** Icon displayed before label - supports THC */
		icon?: THC;
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
		icon?: THC;
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

	export const DROPDOWN_MENU_BASE_CLASSES = `stuic-dropdown-menu relative inline-block`;

	export const DROPDOWN_MENU_TRIGGER_CLASSES = `
		inline-flex items-center justify-center gap-2
		px-3 py-2
		rounded-md border
		bg-white dark:bg-neutral-800
		text-neutral-900 dark:text-neutral-100
		border-neutral-200 dark:border-neutral-700
		hover:brightness-95 dark:hover:brightness-110
		focus-visible:outline-2 focus-visible:outline-offset-2
		cursor-pointer
	`;

	export const DROPDOWN_MENU_DROPDOWN_CLASSES = `
		stuic-dropdown-menu-dropdown
		bg-white dark:bg-neutral-800
		text-neutral-900 dark:text-neutral-100
		border border-neutral-200 dark:border-neutral-700
		rounded-md shadow-sm
		p-1
		overflow-y-auto
		z-50
		min-w-48
	`;

	export const DROPDOWN_MENU_ITEM_CLASSES = `
		w-full
		flex items-center gap-2
		px-3 py-1.5
		min-h-[44px]
		text-left text-sm
		rounded-md
		cursor-pointer
		touch-action-manipulation
		hover:bg-neutral-100 dark:hover:bg-neutral-700
		focus:outline-none
		focus-visible:bg-neutral-200 dark:focus-visible:bg-neutral-600
	`;

	export const DROPDOWN_MENU_DIVIDER_CLASSES = `
		h-px my-1
		bg-neutral-200 dark:bg-neutral-700
	`;

	export const DROPDOWN_MENU_HEADER_CLASSES = `
		px-2 py-1.5
		text-xs font-semibold uppercase tracking-wide
		text-neutral-500 dark:text-neutral-400
		select-none
	`;

	export const DROPDOWN_MENU_BACKDROP_CLASSES = `
		stuic-dropdown-menu-backdrop
		fixed inset-0 bg-black/25
		z-40
	`;
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { getId } from "../../utils/get-id.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { ItemCollection } from "@marianmeres/item-collection";
	import { iconLucideChevronDown } from "@marianmeres/icons-fns/lucide/iconLucideChevronDown.js";
	import { iconLucideChevronRight } from "@marianmeres/icons-fns/lucide/iconLucideChevronRight.js";
	import { onClickOutside } from "runed";
	import { slide, fade } from "svelte/transition";
	import { untrack } from "svelte";
	import Thc from "../Thc/Thc.svelte";
	import "./index.css";
	import { BodyScroll } from "../../utils/body-scroll-locker.js";

	let {
		items,
		isOpen = $bindable(false),
		position = "bottom-span-left",
		offset = "0.25rem",
		maxHeight = "300px",
		closeOnSelect = true,
		closeOnClickOutside = true,
		closeOnEscape = true,
		forceFallback = false,
		class: classProp,
		classTrigger,
		classDropdown,
		classItem,
		classItemActive,
		classItemDisabled,
		classDivider,
		classHeader,
		classExpandable,
		classExpandableContent,
		classBackdrop,
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
	const isSupported = untrack(() => !forceFallback && isAnchorPositioningSupported());

	// Track expanded sections (independent toggle - multiple can be open)
	let expandedSections = $state<Set<string | number>>(new Set());

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

	// Flatten navigable items (respects expanded state)
	let navigableItems = $derived.by(() => {
		const flat: NavigableItem[] = [];
		for (const item of items) {
			if (item.type === "action" && !item.disabled) {
				flat.push(item);
			} else if (item.type === "expandable" && !item.disabled) {
				// Add expandable header as navigable
				flat.push({ type: "expandable-header", id: item.id, expandableItem: item });
				// If expanded, add child actions
				if (expandedSections.has(item.id)) {
					for (const child of item.items) {
						if (child.type === "action" && !child.disabled) {
							flat.push(child);
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

	// Computed transition duration
	let transitionDuration = $derived(reducedMotion.current ? 0 : 100);

	// Position styles for CSS Anchor Positioning
	let dropdownStyle = $derived.by(() => {
		if (isSupported) {
			return `
				position: fixed;
				position-anchor: ${anchorName};
				position-area: ${POSITION_MAP[position] || "bottom"};
				margin: ${offset};
				max-height: ${maxHeight};
			`;
		} else {
			// Fallback: centered modal overlay
			return `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				max-width: 90vw;
				max-height: ${maxHeight};
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
				e.metaKey ? navItems.setActiveFirst() : navItems.setActivePrevious();
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
					{@html iconLucideChevronDown({ size: 16 })}
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
				<div class="sticky top-0 right-0 z-10 flex just pointer-events-none">
					<button
						type="button"
						aria-label="Close"
						class={[
							"bg-black text-white rounded-md cursor-pointer opacity-60",
							"absolute right-0 top-0 p-2",
							"leading-none hover:opacity-100 pointer-events-auto",
						]}
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
			{#each items as item}
				{#if item.type === "action"}
					{@const isActive = _navItems.active?.id === item.id}
					<button
						id={itemId(item.id)}
						role="menuitem"
						class={twMerge(
							DROPDOWN_MENU_ITEM_CLASSES,
							isActive && "bg-neutral-200 dark:bg-neutral-600",
							isActive && classItemActive,
							item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
							item.disabled && classItemDisabled,
							classItem,
							item.class
						)}
						onclick={() => selectItem(item)}
						onmouseenter={() => navItems.setActive(item)}
						aria-disabled={item.disabled || undefined}
						tabindex={-1}
						type="button"
					>
						{#if item.icon}
							<span class="shrink-0">
								<Thc thc={item.icon} />
							</span>
						{/if}
						<span class="flex-1">
							<Thc thc={item.label} />
						</span>
						{#if item.shortcut}
							<span
								class="text-xs text-dropdown-header dark:text-dropdown-header-dark ml-auto"
							>
								{item.shortcut}
							</span>
						{/if}
					</button>
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
						<button
							id={expandableHeaderId(item.id)}
							role="menuitem"
							class={twMerge(
								DROPDOWN_MENU_ITEM_CLASSES,
								"font-medium",
								isExpandableActive && "bg-neutral-200 dark:bg-neutral-600",
								isExpandableActive && classItemActive,
								item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
								item.disabled && classItemDisabled,
								classExpandable,
								item.class
							)}
							onclick={() => toggleExpanded(item.id)}
							onmouseenter={() =>
								navItems.setActive({
									type: "expandable-header",
									id: item.id,
									expandableItem: item,
								})}
							aria-expanded={isExpanded}
							aria-disabled={item.disabled || undefined}
							tabindex={-1}
							type="button"
						>
							{#if item.icon}
								<span class="shrink-0">
									<Thc thc={item.icon} />
								</span>
							{/if}
							<span class="flex-1">
								<Thc thc={item.label} />
							</span>
							<span
								class={twMerge(
									"transition-transform inline-block",
									isExpanded && "rotate-90"
								)}
							>
								{@html iconLucideChevronRight({ size: 16 })}
							</span>
						</button>

						<!-- Expandable content -->
						{#if isExpanded}
							<div
								class={twMerge(
									"stuic-dropdown-menu-expandable-content pl-4",
									classExpandableContent
								)}
								transition:slide={{ duration: transitionDuration }}
							>
								{#each item.items as childItem}
									{#if childItem.type === "action"}
										{@const isChildActive = _navItems.active?.id === childItem.id}
										<button
											id={itemId(childItem.id)}
											role="menuitem"
											class={twMerge(
												DROPDOWN_MENU_ITEM_CLASSES,
												isChildActive && "bg-neutral-200 dark:bg-neutral-600",
												isChildActive && classItemActive,
												childItem.disabled &&
													"opacity-50 cursor-not-allowed pointer-events-none",
												childItem.disabled && classItemDisabled,
												classItem,
												childItem.class
											)}
											onclick={() => selectItem(childItem)}
											onmouseenter={() => navItems.setActive(childItem)}
											aria-disabled={childItem.disabled || undefined}
											tabindex={-1}
											type="button"
										>
											{#if childItem.icon}
												<span class="shrink-0">
													<Thc thc={childItem.icon} />
												</span>
											{/if}
											<span class="flex-1">
												<Thc thc={childItem.label} />
											</span>
											{#if childItem.shortcut}
												<span
													class="text-xs text-dropdown-header dark:text-dropdown-header-dark ml-auto"
												>
													{childItem.shortcut}
												</span>
											{/if}
										</button>
									{:else if childItem.type === "divider"}
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
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
