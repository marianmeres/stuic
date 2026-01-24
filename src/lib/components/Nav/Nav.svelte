<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type { MaybeLocalized } from "../../utils/tr.js";

	/**
	 * Navigation item within a group.
	 */
	export interface NavItem {
		/** Unique identifier for the item */
		id: string;
		/** Display label (supports localization) */
		label: MaybeLocalized;
		/** Navigation URL (use href OR onClick, not both) */
		href?: string;
		/** Click handler (alternative to href) */
		onClick?: () => void;
		/** Icon content (THC for flexibility: string, html, component) */
		icon?: THC;
		/** Nested children - parent items with children become expand/collapse toggles */
		children?: NavItem[];
		/** Whether this item is disabled */
		disabled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Arbitrary data to pass through */
		data?: Record<string, unknown>;
	}

	/**
	 * A navigation group containing a title and items.
	 * If items is empty, the group acts as a regular nav item (clickable without chevron).
	 */
	export interface NavGroup {
		/** Group title (supports localization) */
		title: MaybeLocalized;
		/** Navigation items in this group (empty = group acts as nav item) */
		items?: NavItem[];
		/** Group icon (optional) */
		icon?: THC;
		/** Whether the group starts expanded (default: false, groups are collapsed by default) */
		defaultExpanded?: boolean;
		/** Navigation URL for groups without items */
		href?: string;
		/** Click handler for groups without items */
		onClick?: () => void;
		/** Unique identifier (used for activeId matching when group has no items) */
		id?: string;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
		/** The navigation groups to render */
		groups: NavGroup[];

		/** Optional section title rendered above the groups (uppercase, non-interactive) */
		title?: MaybeLocalized;

		/** Current locale for MaybeLocalized resolution */
		locale?: string;

		/** Whether the sidebar is in collapsed mode (icon-only) */
		isCollapsed?: boolean;

		/** Whether the sidebar is expanding (transitioning from collapsed to expanded) */
		isExpanding?: boolean;

		/** Active item ID for highlighting */
		activeId?: string;

		/** Callback when checking if an item is active (alternative to activeId) */
		isActive?: (item: NavItem) => boolean;

		/** Callback when checking if a group (without items) is active */
		isGroupActive?: (group: NavGroup) => boolean;

		/** Callback when an item is selected */
		onSelect?: (item: NavItem) => void;

		/** Callback when a group (without items) is selected */
		onGroupSelect?: (group: NavGroup) => void;

		/** Callback when group expand/collapse state changes */
		onGroupToggle?: (groupIndex: number, isExpanded: boolean) => void;

		/** Touch-friendly sizing mode */
		touchFriendly?: boolean | "auto";

		/** Classes for the wrapper element */
		class?: string;
		/** Classes for the section title */
		classTitle?: string;
		/** Classes for the group title/header */
		classGroupTitle?: string;
		/** Classes for individual items */
		classItem?: string;
		/** Classes for active items */
		classItemActive?: string;
		/** Classes for collapsed mode items */
		classItemCollapsed?: string;
		/** Classes for disabled items */
		classItemDisabled?: string;
		/** Classes for icons */
		classIcon?: string;
		/** Classes for labels */
		classLabel?: string;
		/** Classes for children container */
		classChildren?: string;
		/** Classes for chevron icon */
		classChevron?: string;

		/** Skip all default styling */
		unstyled?: boolean;

		/** Element reference */
		el?: HTMLElement;

		/** Enable localStorage persistence for expand/collapse state (default: true) */
		persistState?: boolean;

		/** Storage key prefix for localStorage (default: 'stuic-nav') */
		storageKeyPrefix?: string;
	}

	export const NAV_BASE_CLASSES = "stuic-nav";
	export const NAV_SECTION_TITLE_CLASSES = "stuic-nav-section-title";
	export const NAV_GROUP_TITLE_CLASSES = "stuic-nav-group-title";
	export const NAV_ITEM_CLASSES = "stuic-nav-item";
	export const NAV_CHILDREN_CLASSES = "stuic-nav-children";
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { tr } from "../../utils/tr.js";
	import { localStorageValue } from "../../utils/storage-abstraction.js";
	import { getId } from "../../utils/get-id.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { DevicePointer } from "../../utils/device-pointer.svelte.js";
	import { iconChevronRight } from "$lib/icons/index.js";
	import { slide } from "svelte/transition";
	import { untrack } from "svelte";
	import Thc from "../Thc/Thc.svelte";
	import { tooltip } from "../../actions/index.js";

	let {
		groups,
		title,
		locale,
		isCollapsed = false,
		isExpanding = false,
		activeId,
		isActive,
		isGroupActive,
		onSelect,
		onGroupSelect,
		onGroupToggle,
		touchFriendly = false,
		class: classProp,
		classTitle,
		classGroupTitle,
		classItem,
		classItemActive,
		classItemCollapsed,
		classItemDisabled,
		classIcon,
		classLabel,
		classChildren,
		classChevron,
		unstyled = false,
		el = $bindable(),
		persistState = true,
		storageKeyPrefix = 'stuic-nav',
		...rest
	}: Props = $props();

	// Unique IDs for accessibility
	const navId = getId("nav-");

	// Device detection for touch-friendly sizing
	const devicePointer = new DevicePointer();
	const reducedMotion = prefersReducedMotion();

	// Compute whether touch-friendly should be active
	let isTouchFriendly = $derived.by(() => {
		if (touchFriendly === true) return true;
		if (touchFriendly === "auto" && devicePointer.isCoarse) return true;
		return false;
	});

	// Icon size based on touch mode
	const iconSize = $derived(isTouchFriendly ? 22 : 18);

	// Storage helper functions for persistence
	function getGroupStorageKey(groupId: string): string {
		return `${storageKeyPrefix}-group-${groupId}`;
	}

	function getItemStorageKey(itemId: string): string {
		return `${storageKeyPrefix}-item-${itemId}`;
	}

	function loadGroupState(groupId: string): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(getGroupStorageKey(groupId), undefined).get();
	}

	function saveGroupState(groupId: string, expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getGroupStorageKey(groupId), expanded).set(expanded);
	}

	function loadItemState(itemId: string): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(getItemStorageKey(itemId), undefined).get();
	}

	function saveItemState(itemId: string, expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getItemStorageKey(itemId), expanded).set(expanded);
	}

	// Check if an item matches active state (used during initialization)
	function checkItemActive(item: NavItem): boolean {
		if (isActive) return isActive(item);
		if (activeId) return item.id === activeId;
		return false;
	}

	// Check if any item in a list (or their descendants) is active
	function hasActiveDescendant(items: NavItem[]): boolean {
		for (const item of items) {
			if (checkItemActive(item)) return true;
			if (item.children && hasActiveDescendant(item.children)) return true;
		}
		return false;
	}

	// Check if a group has any active child at any depth
	function groupHasActiveChild(group: NavGroup): boolean {
		if (!group.items) return false;
		return hasActiveDescendant(group.items);
	}

	// Compute initial group expanded states synchronously
	function computeGroupStates(): boolean[] {
		return groups.map((g) => {
			// First priority: localStorage (if persistence enabled)
			if (persistState && g.id) {
				const stored = loadGroupState(g.id);
				if (stored != null) return stored;  // Check for both null and undefined
			}
			// Second priority: auto-expand if group has an active child
			if (groupHasActiveChild(g)) {
				return true;
			}
			// Third priority: use defaultExpanded prop
			if (g.defaultExpanded !== undefined) {
				return g.defaultExpanded;
			}
			// Default: collapsed
			return false;
		});
	}

	// Initialize state synchronously from props (not via effect)
	let groupExpandedStates = $state<boolean[]>(computeGroupStates());

	// Re-sync if groups array length changes
	$effect.pre(() => {
		if (groupExpandedStates.length !== groups.length) {
			groupExpandedStates = computeGroupStates();
		}
	});

	// Check if group is expanded
	function isGroupExpanded(index: number): boolean {
		return groupExpandedStates[index] ?? false;
	}

	// Toggle group expand/collapse
	function toggleGroup(index: number) {
		const newState = !groupExpandedStates[index];
		groupExpandedStates[index] = newState;

		// Persist state if group has an id
		const group = groups[index];
		if (group?.id) {
			saveGroupState(group.id, newState);
		}

		onGroupToggle?.(index, newState);
	}

	// Check if a group has items (and thus should be expandable)
	function groupHasItems(group: NavGroup): boolean {
		return (group.items?.length ?? 0) > 0;
	}

	// Check if an item has children
	function itemHasChildren(item: NavItem): boolean {
		return (item.children?.length ?? 0) > 0;
	}

	// Collect all items with children recursively
	function collectItemsWithChildren(items: NavItem[]): NavItem[] {
		const result: NavItem[] = [];
		for (const item of items) {
			if (item.children?.length) {
				result.push(item);
				result.push(...collectItemsWithChildren(item.children));
			}
		}
		return result;
	}

	// Compute initial item expanded states synchronously
	function computeItemStates(): Set<string> {
		const expandedItems = new Set<string>();
		for (const group of groups) {
			if (group.items) {
				const itemsWithChildren = collectItemsWithChildren(group.items);
				for (const item of itemsWithChildren) {
					// First priority: localStorage (if persistence enabled)
					if (persistState) {
						const stored = loadItemState(item.id);
						if (stored != null) {
							if (stored) expandedItems.add(item.id);
							continue; // localStorage takes precedence
						}
					}
					// Second priority: auto-expand if item has an active descendant
					if (item.children && hasActiveDescendant(item.children)) {
						expandedItems.add(item.id);
					}
				}
			}
		}
		return expandedItems;
	}

	// Track expanded state for individual items with children (initialized synchronously)
	let itemExpandedStates = $state<Set<string>>(computeItemStates());

	// Check if an item is expanded
	function isItemExpanded(itemId: string): boolean {
		return itemExpandedStates.has(itemId);
	}

	// Find item by ID in nested structure
	function findItemById(items: NavItem[], id: string): NavItem | undefined {
		for (const item of items) {
			if (item.id === id) return item;
			if (item.children) {
				const found = findItemById(item.children, id);
				if (found) return found;
			}
		}
		return undefined;
	}

	// Find item across all groups
	function findItemInGroups(itemId: string): NavItem | undefined {
		for (const group of groups) {
			if (group.items) {
				const found = findItemById(group.items, itemId);
				if (found) return found;
			}
		}
		return undefined;
	}

	// Get all descendant IDs for collapsing
	function getDescendantIds(item: NavItem): string[] {
		const ids: string[] = [];
		if (item.children) {
			for (const child of item.children) {
				ids.push(child.id);
				ids.push(...getDescendantIds(child));
			}
		}
		return ids;
	}

	// Toggle item expand/collapse
	function toggleItem(itemId: string) {
		if (itemExpandedStates.has(itemId)) {
			// Collapse: also collapse all descendants
			itemExpandedStates.delete(itemId);
			saveItemState(itemId, false);
			const item = findItemInGroups(itemId);
			if (item) {
				for (const id of getDescendantIds(item)) {
					itemExpandedStates.delete(id);
					saveItemState(id, false);
				}
			}
		} else {
			itemExpandedStates.add(itemId);
			saveItemState(itemId, true);
		}
		itemExpandedStates = new Set(itemExpandedStates);
	}

	// Transition duration
	let transitionDuration = $derived(reducedMotion.current ? 0 : 150);

	// Resolve localized label
	function resolveLabel(label: MaybeLocalized): string {
		return tr(label, locale);
	}

	// Get first letter of a label for collapsed mode fallback
	function getFirstLetter(label: string): string {
		return label.charAt(0).toUpperCase();
	}

	// Check if item is currently active
	function isItemActive(item: NavItem): boolean {
		if (isActive) return isActive(item);
		if (activeId) return item.id === activeId;
		return false;
	}

	// Check if group (without items) is currently active
	function isGroupItemActive(group: NavGroup): boolean {
		if (isGroupActive) return isGroupActive(group);
		if (activeId && group.id) return group.id === activeId;
		return false;
	}

	// Handle item selection
	function handleItemSelect(item: NavItem) {
		if (item.disabled) return;
		if (item.onClick) {
			item.onClick();
		}
		onSelect?.(item);
	}

	// Handle group (without items) selection
	function handleGroupSelect(group: NavGroup) {
		if (group.onClick) {
			group.onClick();
		}
		onGroupSelect?.(group);
	}

	// Generate group element ID
	function groupElId(index: number): string {
		return `${navId}-group-${index}`;
	}

	// Generate item element ID
	function itemElId(groupIndex: number, itemId: string): string {
		return `${navId}-group-${groupIndex}-item-${itemId}`;
	}
</script>

<nav
	bind:this={el}
	class={twMerge(!unstyled && NAV_BASE_CLASSES, classProp)}
	data-collapsed={!unstyled && isCollapsed ? "" : undefined}
	data-expanding={!unstyled && isExpanding ? "" : undefined}
	data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
	{...rest}
>
	<!-- Section title (optional, non-interactive) -->
	{#if title}
		<span
			class={twMerge(
				!unstyled && NAV_SECTION_TITLE_CLASSES,
				"uppercase",
				classTitle
			)}
			data-collapsed={!unstyled && isCollapsed ? "" : undefined}
		>
			{resolveLabel(title)}
		</span>
	{/if}

	<!-- Render each group -->
	{#each groups as group, groupIndex}
		{@const hasItems = groupHasItems(group)}
		{@const expanded = isGroupExpanded(groupIndex)}
		{@const groupActive = !hasItems && isGroupItemActive(group)}

		{#if hasItems}
			<!-- Group with items: show expandable header -->
			{#if !isCollapsed}
				<button
					type="button"
					id={groupElId(groupIndex)}
					class={twMerge(!unstyled && NAV_GROUP_TITLE_CLASSES, classGroupTitle)}
					onclick={() => toggleGroup(groupIndex)}
					aria-expanded={expanded}
					data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
				>
					<span
						class={twMerge(
							"inline-block shrink-0 transition-transform duration-150",
							expanded && "rotate-90",
							classChevron
						)}
					>
						{@html iconChevronRight({ size: isTouchFriendly ? 18 : 16 })}
					</span>
					{#if group.icon}
						<span class={twMerge("shrink-0", classIcon)}>
							<Thc thc={group.icon} />
						</span>
					{/if}
					<span class={twMerge(classLabel)}>{resolveLabel(group.title)}</span>
				</button>
			{:else}
				<!-- Collapsed mode: show only chevron -->
				<button
					type="button"
					class={twMerge(!unstyled && NAV_ITEM_CLASSES, classItemCollapsed)}
					onclick={() => toggleGroup(groupIndex)}
					data-collapsed=""
					data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
					use:tooltip={() => ({
						enabled: isCollapsed,
						content: resolveLabel(group.title),
						position: "right",
					})}
				>
					<span
						class={twMerge(
							"inline-block shrink-0 transition-transform duration-150",
							expanded && "rotate-90",
							classChevron
						)}
					>
						{@html iconChevronRight({ size: 16 })}
					</span>
				</button>
			{/if}

			<!-- Items -->
			{#if expanded}
				<ul
					class={twMerge(!unstyled && NAV_CHILDREN_CLASSES, classChildren)}
					aria-labelledby={groupElId(groupIndex)}
					transition:slide={{ duration: transitionDuration }}
				>
					{#snippet renderItem(item: NavItem, depth: number)}
						{@const hasChildren = itemHasChildren(item)}
						{@const itemExpanded = hasChildren && isItemExpanded(item.id)}
						{@const active = isItemActive(item)}
						{@const label = resolveLabel(item.label)}
						<li>
							{#if hasChildren}
								<!-- Parent with children: render as toggle button -->
								<button
									type="button"
									id={itemElId(groupIndex, item.id)}
									class={twMerge(
										!unstyled && NAV_ITEM_CLASSES,
										isCollapsed && classItemCollapsed,
										active && classItemActive,
										item.disabled && classItemDisabled,
										item.class,
										classItem
									)}
									onclick={() => toggleItem(item.id)}
									disabled={item.disabled}
									data-active={!unstyled && active ? "" : undefined}
									data-collapsed={!unstyled && isCollapsed ? "" : undefined}
									data-has-children=""
									data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
									aria-expanded={itemExpanded}
									use:tooltip={() => ({
										enabled: isCollapsed,
										content: label,
										position: "right",
									})}
								>
									<!-- Chevron indicator -->
									<span
										class={twMerge(
											"inline-block shrink-0 transition-transform duration-150",
											itemExpanded && "rotate-90",
											classChevron
										)}
									>
										{@html iconChevronRight({ size: isTouchFriendly ? 18 : 16 })}
									</span>
									{#if item.icon && !isCollapsed}
										<span class={twMerge("shrink-0", classIcon)}>
											<Thc thc={item.icon} />
										</span>
									{/if}
									{#if !isCollapsed}
										<span class={classLabel}>{label}</span>
									{/if}
								</button>

								<!-- Children (only shown when expanded) -->
								{#if itemExpanded}
									<ul
										class={twMerge(!unstyled && NAV_CHILDREN_CLASSES, classChildren)}
										transition:slide={{ duration: transitionDuration }}
									>
										{#each item.children ?? [] as child}
											{@render renderItem(child, depth + 1)}
										{/each}
									</ul>
								{/if}
							{:else if item.href}
								<!-- Leaf item with href -->
								<a
									id={itemElId(groupIndex, item.id)}
									href={item.href}
									class={twMerge(
										!unstyled && NAV_ITEM_CLASSES,
										isCollapsed && classItemCollapsed,
										active && classItemActive,
										item.disabled && classItemDisabled,
										item.class,
										classItem
									)}
									onclick={() => handleItemSelect(item)}
									data-active={!unstyled && active ? "" : undefined}
									data-collapsed={!unstyled && isCollapsed ? "" : undefined}
									data-expanding={!unstyled && isExpanding ? "" : undefined}
									data-disabled={!unstyled && item.disabled ? "" : undefined}
									data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
									aria-disabled={item.disabled}
									tabindex={item.disabled ? -1 : 0}
									use:tooltip={() => ({
										enabled: isCollapsed,
										content: label,
										position: "right",
									})}
								>
									{#if item.icon}
										<span class={twMerge("shrink-0", classIcon)}>
											<Thc thc={item.icon} />
										</span>
									{:else if isCollapsed}
										<span class={twMerge("shrink-0 font-medium", classIcon)}>{getFirstLetter(label)}</span>
									{/if}
									{#if !isCollapsed}
										<span class={classLabel}>{label}</span>
									{/if}
								</a>
							{:else}
								<!-- Leaf item with onClick only -->
								<button
									type="button"
									id={itemElId(groupIndex, item.id)}
									class={twMerge(
										!unstyled && NAV_ITEM_CLASSES,
										isCollapsed && classItemCollapsed,
										active && classItemActive,
										item.disabled && classItemDisabled,
										item.class,
										classItem
									)}
									onclick={() => handleItemSelect(item)}
									disabled={item.disabled}
									data-active={!unstyled && active ? "" : undefined}
									data-collapsed={!unstyled && isCollapsed ? "" : undefined}
									data-expanding={!unstyled && isExpanding ? "" : undefined}
									data-disabled={!unstyled && item.disabled ? "" : undefined}
									data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
									use:tooltip={() => ({
										enabled: isCollapsed,
										content: label,
										position: "right",
									})}
								>
									{#if item.icon}
										<span class={twMerge("shrink-0", classIcon)}>
											<Thc thc={item.icon} />
										</span>
									{:else if isCollapsed}
										<span class={twMerge("shrink-0 font-medium", classIcon)}>{getFirstLetter(label)}</span>
									{/if}
									{#if !isCollapsed}
										<span class={classLabel}>{label}</span>
									{/if}
								</button>
							{/if}
						</li>
					{/snippet}

					{#each group.items ?? [] as item}
						{@render renderItem(item, 0)}
					{/each}
				</ul>
			{/if}
		{:else}
			<!-- Group without items: render as a simple nav item (no chevron) -->
			{@const label = resolveLabel(group.title)}
			{#if group.href}
				<a
					href={group.href}
					class={twMerge(
						!unstyled && NAV_ITEM_CLASSES,
						isCollapsed && classItemCollapsed,
						groupActive && classItemActive,
						classItem
					)}
					onclick={() => handleGroupSelect(group)}
					data-active={!unstyled && groupActive ? "" : undefined}
					data-collapsed={!unstyled && isCollapsed ? "" : undefined}
					data-expanding={!unstyled && isExpanding ? "" : undefined}
					data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
					use:tooltip={() => ({
						enabled: isCollapsed,
						content: label,
						position: "right",
					})}
				>
					{#if group.icon}
						<span class={twMerge("shrink-0", classIcon)}>
							<Thc thc={group.icon} />
						</span>
					{:else if isCollapsed}
						<span class={twMerge("shrink-0 font-medium", classIcon)}>{getFirstLetter(label)}</span>
					{/if}
					{#if !isCollapsed}
						<span class={classLabel}>{label}</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					class={twMerge(
						!unstyled && NAV_ITEM_CLASSES,
						isCollapsed && classItemCollapsed,
						groupActive && classItemActive,
						classItem
					)}
					onclick={() => handleGroupSelect(group)}
					data-active={!unstyled && groupActive ? "" : undefined}
					data-collapsed={!unstyled && isCollapsed ? "" : undefined}
					data-expanding={!unstyled && isExpanding ? "" : undefined}
					data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
					use:tooltip={() => ({
						enabled: isCollapsed,
						content: label,
						position: "right",
					})}
				>
					{#if group.icon}
						<span class={twMerge("shrink-0", classIcon)}>
							<Thc thc={group.icon} />
						</span>
					{:else if isCollapsed}
						<span class={twMerge("shrink-0 font-medium", classIcon)}>{getFirstLetter(label)}</span>
					{/if}
					{#if !isCollapsed}
						<span class={classLabel}>{label}</span>
					{/if}
				</button>
			{/if}
		{/if}
	{/each}
</nav>
