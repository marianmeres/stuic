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
		/** Nested children (rendered flat, no indentation after level 1) */
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
		/** Whether the group starts collapsed */
		defaultCollapsed?: boolean;
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

	// Track expanded state for each group
	let groupExpandedStates = $state<boolean[]>([]);

	// Initialize expanded states based on groups
	$effect(() => {
		const currentGroups = groups;
		untrack(() => {
			// Only initialize if length changed or states array is empty
			if (groupExpandedStates.length !== currentGroups.length) {
				groupExpandedStates = currentGroups.map((g) => !g.defaultCollapsed);
			}
		});
	});

	// Check if group is expanded
	function isGroupExpanded(index: number): boolean {
		return groupExpandedStates[index] ?? true;
	}

	// Toggle group expand/collapse
	function toggleGroup(index: number) {
		groupExpandedStates[index] = !groupExpandedStates[index];
		onGroupToggle?.(index, groupExpandedStates[index]);
	}

	// Check if a group has items (and thus should be expandable)
	function groupHasItems(group: NavGroup): boolean {
		return (group.items?.length ?? 0) > 0;
	}

	// Flatten all items including nested children for navigation
	function flattenItems(items: NavItem[]): NavItem[] {
		const flat: NavItem[] = [];
		for (const item of items) {
			if (!item.disabled) {
				flat.push(item);
			}
			if (item.children) {
				for (const child of item.children) {
					if (!child.disabled) {
						flat.push(child);
						// Continue flattening deeper levels
						if (child.children) {
							flat.push(...flattenItems(child.children).filter((c) => !c.disabled));
						}
					}
				}
			}
		}
		return flat;
	}

	// Transition duration
	let transitionDuration = $derived(reducedMotion.current ? 0 : 150);

	// Resolve localized label
	function resolveLabel(label: MaybeLocalized): string {
		return tr(label, locale);
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
						{@const active = isItemActive(item)}
						{@const label = resolveLabel(item.label)}
						<li>
							{#if item.href}
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
									{/if}
									{#if !isCollapsed}
										<span class={classLabel}>{label}</span>
									{/if}
								</a>
							{:else}
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
									{/if}
									{#if !isCollapsed}
										<span class={classLabel}>{label}</span>
									{/if}
								</button>
							{/if}

							<!-- Render children at same indent level (flat after level 1) -->
							{#if item.children?.length}
								{#each item.children as child}
									{@render renderItem(child, depth + 1)}
								{/each}
							{/if}
						</li>
					{/snippet}

					{#each group.items ?? [] as item}
						{@render renderItem(item, 0)}
					{/each}
				</ul>
			{:else if isCollapsed && expanded}
				<!-- Collapsed mode with expanded group: show item icons -->
				<ul class="flex flex-col gap-1">
					{#each flattenItems(group.items ?? []) as item}
						{@const active = isItemActive(item)}
						{@const label = resolveLabel(item.label)}
						<li>
							{#if item.href}
								<a
									href={item.href}
									class={twMerge(
										!unstyled && NAV_ITEM_CLASSES,
										classItemCollapsed,
										active && classItemActive,
										item.class
									)}
									onclick={() => handleItemSelect(item)}
									data-active={!unstyled && active ? "" : undefined}
									data-collapsed=""
									data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
									use:tooltip={() => ({
										enabled: true,
										content: label,
										position: "right",
									})}
								>
									{#if item.icon}
										<span class={twMerge("shrink-0", classIcon)}>
											<Thc thc={item.icon} />
										</span>
									{/if}
								</a>
							{:else}
								<button
									type="button"
									class={twMerge(
										!unstyled && NAV_ITEM_CLASSES,
										classItemCollapsed,
										active && classItemActive,
										item.class
									)}
									onclick={() => handleItemSelect(item)}
									disabled={item.disabled}
									data-active={!unstyled && active ? "" : undefined}
									data-collapsed=""
									data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
									use:tooltip={() => ({
										enabled: true,
										content: label,
										position: "right",
									})}
								>
									{#if item.icon}
										<span class={twMerge("shrink-0", classIcon)}>
											<Thc thc={item.icon} />
										</span>
									{/if}
								</button>
							{/if}
						</li>
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
					{/if}
					{#if !isCollapsed}
						<span class={classLabel}>{label}</span>
					{/if}
				</button>
			{/if}
		{/if}
	{/each}
</nav>
