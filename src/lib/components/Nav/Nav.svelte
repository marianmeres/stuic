<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type { MaybeLocalized } from "../../utils/tr.js";

	/**
	 * Navigation item within a group.
	 */
	export interface NavItem {
		/** Optional discriminant. Never required: an entry without `type` is an item. */
		type?: "item";
		/** Unique identifier for the item */
		id: string;
		/** Display label (supports localization) */
		label: MaybeLocalized;
		/** Navigation URL. If both `href` and `onClick` are provided, `onClick` runs first (useful for analytics) and the browser then follows the href. */
		href?: string;
		/** Click handler. Alternative to `href`, or runs before navigation if both are set. */
		onClick?: () => void;
		/** Icon content (THC for flexibility: string, html, component) */
		icon?: THC;
		/** Nested children - parent items with children become expand/collapse toggles. May mix in dividers and headers. */
		children?: NavItemEntry[];
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
		/** Optional discriminant. Never required: an entry without `type` is a group. */
		type?: "group";
		/** Group title (supports localization) */
		title: MaybeLocalized;
		/** Navigation items in this group, optionally mixed with dividers and headers (no items = group acts as nav item) */
		items?: NavItemEntry[];
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

	/**
	 * A break between entries, allowed at every level: among `groups`, among a group's
	 * `items`, and among an item's `children`. Draws a subtle horizontal line, or with
	 * `line: false` a blank break of the same height. Non-interactive.
	 */
	export interface NavDivider {
		type: "divider";
		/** Draw the line (default: true). `false` leaves a blank break of the same height. */
		line?: boolean;
		/** Optional key. Defaults to the entry's position. */
		id?: string;
		/** Additional CSS classes */
		class?: string;
	}

	/**
	 * A non-interactive heading, allowed at every level. It labels the entries after it,
	 * up to the next divider or header, without nesting them (no indent, no
	 * expand/collapse). In collapsed (icon-only) mode it renders as a divider line, its
	 * label kept for screen readers.
	 */
	export interface NavHeader {
		type: "header";
		/** Heading text (supports localization) */
		label: MaybeLocalized;
		/** Optional key. Defaults to the entry's position. */
		id?: string;
		/** Additional CSS classes */
		class?: string;
	}

	/** One entry of a group's `items` or an item's `children` */
	export type NavItemEntry = NavItem | NavDivider | NavHeader;

	/** One entry of the `groups` prop */
	export type NavGroupEntry = NavGroup | NavDivider | NavHeader;

	/** True for a divider or header: an entry that separates, as opposed to an item or group. */
	function isSeparating(
		entry: NavItemEntry | NavGroupEntry
	): entry is NavDivider | NavHeader {
		return entry.type === "divider" || entry.type === "header";
	}

	/**
	 * Which entries of one list get rendered. Dividers and headers only exist to separate
	 * content, so those left with nothing to separate are dropped: a header with no
	 * item/group before the next divider or header (or the end) — its section is empty —,
	 * a divider with no item/group before it or after it, and every divider of a run but
	 * the first. A list the caller filtered (e.g. by permission) thus never shows a
	 * dangling header, a header labelling the wrong section, or a double line.
	 */
	function visibleMask(entries: (NavItemEntry | NavGroupEntry)[]): boolean[] {
		const keep = entries.map(() => true);

		// Headers: walk backwards, tracking whether content follows before the section ends
		// (at the next divider or header).
		let contentAhead = false;
		for (let i = entries.length - 1; i >= 0; i--) {
			const type = entries[i].type;
			if (type === "header") {
				keep[i] = contentAhead;
				contentAhead = false;
			} else if (type === "divider") {
				contentAhead = false;
			} else {
				contentAhead = true;
			}
		}

		// Dividers: content must precede and follow, and the previous one must not be pending.
		let lastContent = -1;
		for (let i = entries.length - 1; i >= 0; i--) {
			if (!isSeparating(entries[i])) {
				lastContent = i;
				break;
			}
		}
		let seenContent = false;
		let dividerPending = false;
		for (let i = 0; i < entries.length; i++) {
			const type = entries[i].type;
			if (type === "divider") {
				keep[i] = seenContent && !dividerPending && i < lastContent;
				if (keep[i]) dividerPending = true;
			} else if (type !== "header") {
				seenContent = true;
				dividerPending = false;
			}
		}

		return keep;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
		/** The navigation groups to render, optionally mixed with dividers and headers */
		groups: NavGroupEntry[];

		/** Optional section title rendered above the groups (uppercase, non-interactive) */
		title?: MaybeLocalized;

		/**
		 * Locale for `MaybeLocalized` label resolution — one locale, or a chain
		 * in order of preference (e.g. `[user.locale, "en"]`). A missing
		 * translation falls back along the chain, then to the label's first
		 * non-empty entry.
		 */
		locale?: string | string[];

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

		/** Callback when group expand/collapse state changes. `groupIndex` is the position in `groups`, dividers and headers included. */
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
		/** Classes for dividers (every level) */
		classDivider?: string;
		/** Classes for headers (every level) */
		classHeader?: string;

		/** Skip all default styling */
		unstyled?: boolean;

		/** Element reference */
		el?: HTMLElement;

		/** Enable localStorage persistence for expand/collapse state (default: true) */
		persistState?: boolean;

		/** Storage key prefix for localStorage (default: 'stuic-nav') */
		storageKeyPrefix?: string;

		/**
		 * This section's identity among `Nav`s that share a `storageKeyPrefix`. It keys the
		 * collapsible title's persisted state, `{prefix}-section-{sectionId}`, so that several
		 * collapsible sections can share a prefix (and with it their groups' memory).
		 * Omitted: `{prefix}-section`.
		 */
		sectionId?: string;

		/** When true, the section title becomes a button that collapses/expands all groups beneath it. Default: false (non-interactive, today's behavior). */
		collapsibleTitle?: boolean;

		/** Initial expanded state when `collapsibleTitle` is true. Default: true. Overridden by localStorage when `persistState` is on. */
		defaultTitleExpanded?: boolean;

		/** Callback when section title is toggled. */
		onTitleToggle?: (isExpanded: boolean) => void;
	}

	export const NAV_BASE_CLASSES = "stuic-nav";
	export const NAV_SECTION_TITLE_CLASSES = "stuic-nav-section-title";
	export const NAV_GROUP_TITLE_CLASSES = "stuic-nav-group-title";
	export const NAV_ITEM_CLASSES = "stuic-nav-item";
	export const NAV_CHILDREN_CLASSES = "stuic-nav-children";
	export const NAV_DIVIDER_CLASSES = "stuic-nav-divider";
	export const NAV_HEADER_CLASSES = "stuic-nav-header";
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { tr } from "../../utils/tr.js";
	import { localStorageValue } from "../../utils/storage-abstraction.js";
	import { getId } from "../../utils/get-id.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { DevicePointer } from "../../utils/device-pointer.svelte.js";
	import { iconChevronRight } from "#lib/icons/index.js";
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
		classDivider,
		classHeader,
		unstyled = false,
		el = $bindable(),
		persistState = true,
		storageKeyPrefix = "stuic-nav",
		sectionId,
		collapsibleTitle = false,
		defaultTitleExpanded = true,
		onTitleToggle,
		...rest
	}: Props = $props();

	// Unique IDs for accessibility
	const navId = getId("nav-");
	const sectionTitleId = `${navId}-section-title`;
	const sectionContentId = `${navId}-section-content`;

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

	function getSectionStorageKey(): string {
		return sectionId
			? `${storageKeyPrefix}-section-${sectionId}`
			: `${storageKeyPrefix}-section`;
	}

	function loadGroupState(groupId: string): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(
			getGroupStorageKey(groupId),
			undefined
		).get();
	}

	function saveGroupState(groupId: string, expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getGroupStorageKey(groupId), expanded).set(expanded);
	}

	function loadItemState(itemId: string): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(
			getItemStorageKey(itemId),
			undefined
		).get();
	}

	function saveItemState(itemId: string, expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getItemStorageKey(itemId), expanded).set(expanded);
	}

	function loadSectionState(): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(
			getSectionStorageKey(),
			undefined
		).get();
	}

	function saveSectionState(expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getSectionStorageKey(), expanded).set(expanded);
	}

	// Check if an item matches active state (used during initialization)
	function checkItemActive(item: NavItem): boolean {
		if (isActive) return isActive(item);
		if (activeId) return item.id === activeId;
		return false;
	}

	// Check if any item in a list (or their descendants) is active
	function hasActiveDescendant(entries: NavItemEntry[]): boolean {
		for (const item of entries) {
			if (isSeparating(item)) continue;
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
			// Dividers and headers hold a slot (indices follow `groups`) but never expand
			if (isSeparating(g)) return false;
			// First priority: localStorage (if persistence enabled)
			if (persistState && g.id) {
				const stored = loadGroupState(g.id);
				if (stored != null) return stored; // Check for both null and undefined
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

	// Compute initial section expanded state synchronously
	function computeSectionState(): boolean {
		// First priority: localStorage (if persistence enabled)
		if (persistState) {
			const stored = loadSectionState();
			if (stored != null) return stored;
		}
		// Default: use defaultTitleExpanded prop (defaults to true)
		return defaultTitleExpanded;
	}

	let sectionExpanded = $state<boolean>(computeSectionState());

	function toggleSectionTitle() {
		const newState = !sectionExpanded;
		sectionExpanded = newState;
		saveSectionState(newState);
		onTitleToggle?.(newState);
	}

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
		if (group && !isSeparating(group) && group.id) {
			saveGroupState(group.id, newState);
		}

		onGroupToggle?.(index, newState);
	}

	// True when a list holds at least one real item (dividers/headers alone don't count)
	function hasRealItems(entries: NavItemEntry[] | undefined): boolean {
		return entries?.some((e) => !isSeparating(e)) ?? false;
	}

	// Check if a group has items (and thus should be expandable)
	function groupHasItems(group: NavGroup): boolean {
		return hasRealItems(group.items);
	}

	// Check if an item has children
	function itemHasChildren(item: NavItem): boolean {
		return hasRealItems(item.children);
	}

	// The entries of one list that get rendered (see `visibleMask`)
	function visibleEntries<T extends NavItemEntry>(entries: T[]): T[] {
		const keep = visibleMask(entries);
		return entries.filter((_, i) => keep[i]);
	}

	// Keyed-each key: items by id; dividers/headers by id, else by position
	function entryKey(entry: NavItemEntry, index: number): string {
		if (isSeparating(entry)) return entry.id ?? `stuic-nav-${entry.type}-${index}`;
		return entry.id;
	}

	// Which entries of `groups` get rendered (indices follow `groups`)
	let groupsVisible = $derived(visibleMask(groups));

	// Collect all items with children recursively
	function collectItemsWithChildren(entries: NavItemEntry[]): NavItem[] {
		const result: NavItem[] = [];
		for (const item of entries) {
			if (isSeparating(item)) continue;
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
			if (isSeparating(group)) continue;
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
	function findItemById(entries: NavItemEntry[], id: string): NavItem | undefined {
		for (const item of entries) {
			if (isSeparating(item)) continue;
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
			if (isSeparating(group)) continue;
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
				if (isSeparating(child)) continue;
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

<!-- Divider and header markup, shared by every level: `div` among groups, `li` in lists -->
{#snippet dividerEl(entry: NavDivider, tag: "div" | "li")}
	<svelte:element
		this={tag}
		role="separator"
		class={twMerge(!unstyled && NAV_DIVIDER_CLASSES, classDivider, entry.class)}
		data-blank={entry.line === false ? "" : undefined}
		data-collapsed={!unstyled && isCollapsed ? "" : undefined}
	></svelte:element>
{/snippet}

{#snippet headerEl(entry: NavHeader, tag: "div" | "li")}
	<svelte:element
		this={tag}
		role="presentation"
		class={twMerge(!unstyled && NAV_HEADER_CLASSES, classHeader, entry.class)}
		data-collapsed={!unstyled && isCollapsed ? "" : undefined}
	>
		<!-- No room for the label in icon-only mode: the header reads as a line, label kept for screen readers -->
		<span class={isCollapsed ? "sr-only" : undefined}>{resolveLabel(entry.label)}</span>
	</svelte:element>
{/snippet}

<nav
	bind:this={el}
	class={twMerge(!unstyled && NAV_BASE_CLASSES, classProp)}
	data-collapsed={!unstyled && isCollapsed ? "" : undefined}
	data-expanding={!unstyled && isExpanding ? "" : undefined}
	data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
	{...rest}
>
	<!-- Section title (optional). Non-interactive by default; opt-in collapsible via `collapsibleTitle`. -->
	{#if title}
		{#if collapsibleTitle}
			<button
				type="button"
				id={sectionTitleId}
				class={twMerge(!unstyled && NAV_SECTION_TITLE_CLASSES, "uppercase", classTitle)}
				data-collapsed={!unstyled && isCollapsed ? "" : undefined}
				data-interactive=""
				data-expanded={!unstyled && sectionExpanded ? "" : undefined}
				onclick={toggleSectionTitle}
				aria-expanded={sectionExpanded}
				aria-controls={sectionContentId}
			>
				<span
					class={twMerge(
						"inline-block shrink-0 transition-transform duration-150",
						sectionExpanded && "rotate-90",
						classChevron
					)}
				>
					{@html iconChevronRight({ size: 12 })}
				</span>
				<span>{resolveLabel(title)}</span>
			</button>
		{:else}
			<span
				class={twMerge(!unstyled && NAV_SECTION_TITLE_CLASSES, "uppercase", classTitle)}
				data-collapsed={!unstyled && isCollapsed ? "" : undefined}
			>
				{resolveLabel(title)}
			</span>
		{/if}
	{/if}

	{#if !collapsibleTitle || sectionExpanded}
		<div
			id={sectionContentId}
			class="flex flex-col gap-(--stuic-nav-children-gap)"
			transition:slide={{ duration: transitionDuration }}
		>
			<!-- Render each group -->
			{#each groups as entry, groupIndex}
				{#if !groupsVisible[groupIndex]}
					<!-- Dropped: nothing left for this divider/header to separate -->
				{:else if entry.type === "divider"}
					{@render dividerEl(entry, "div")}
				{:else if entry.type === "header"}
					{@render headerEl(entry, "div")}
				{:else}
					{@const group = entry}
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
								{#snippet renderItem(entry: NavItemEntry, depth: number)}
									{#if entry.type === "divider"}
										{@render dividerEl(entry, "li")}
									{:else if entry.type === "header"}
										{@render headerEl(entry, "li")}
									{:else}
										{@const item = entry}
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
													data-touch-friendly={!unstyled && isTouchFriendly
														? ""
														: undefined}
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
														class={twMerge(
															!unstyled && NAV_CHILDREN_CLASSES,
															classChildren
														)}
														transition:slide={{ duration: transitionDuration }}
													>
														{#each visibleEntries(item.children ?? []) as child, i (entryKey(child, i))}
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
													data-touch-friendly={!unstyled && isTouchFriendly
														? ""
														: undefined}
													aria-current={active ? "page" : undefined}
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
														<span class={twMerge("shrink-0 font-medium", classIcon)}>
															{getFirstLetter(label)}
														</span>
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
													data-touch-friendly={!unstyled && isTouchFriendly
														? ""
														: undefined}
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
														<span class={twMerge("shrink-0 font-medium", classIcon)}>
															{getFirstLetter(label)}
														</span>
													{/if}
													{#if !isCollapsed}
														<span class={classLabel}>{label}</span>
													{/if}
												</button>
											{/if}
										</li>
									{/if}
								{/snippet}

								{#each visibleEntries(group.items ?? []) as item, i (entryKey(item, i))}
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
									<span class={twMerge("shrink-0 font-medium", classIcon)}>
										{getFirstLetter(label)}
									</span>
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
									<span class={twMerge("shrink-0 font-medium", classIcon)}>
										{getFirstLetter(label)}
									</span>
								{/if}
								{#if !isCollapsed}
									<span class={classLabel}>{label}</span>
								{/if}
							</button>
						{/if}
					{/if}
				{/if}
			{/each}
		</div>
	{/if}
</nav>
