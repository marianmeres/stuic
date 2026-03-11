<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { TreeNodeDTO } from "@marianmeres/tree";
	import type { Snippet } from "svelte";

	export type TreeDropPosition = "before" | "after" | "inside";

	export interface TreeMoveEvent<T = unknown> {
		/** The node being dragged */
		source: TreeNodeDTO<T>;
		/** The node being dropped onto/near */
		target: TreeNodeDTO<T>;
		/** Where relative to target: 'before' (sibling above), 'after' (sibling below), 'inside' (child) */
		position: TreeDropPosition;
	}

	export interface Props<T = unknown> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children"
	> {
		/** The tree data (use tree.toJSON().children or raw TreeNodeDTO[]) */
		items: TreeNodeDTO<T>[];

		/** Render snippet for each item's content - receives (item, depth, isExpanded) */
		renderItem?: Snippet<[TreeNodeDTO<T>, number, boolean]>;

		/** Render snippet for item icon - receives (item, depth, isExpanded) */
		renderIcon?: Snippet<[TreeNodeDTO<T>, number, boolean]>;

		/** Active/selected item ID */
		activeId?: string;

		/** Callback to check if item is active (alternative to activeId) */
		isActive?: (item: TreeNodeDTO<T>) => boolean;

		/** Callback when an item is selected */
		onSelect?: (item: TreeNodeDTO<T>) => void;

		/** Callback when a branch is toggled */
		onToggle?: (item: TreeNodeDTO<T>, expanded: boolean) => void;

		/** Sort comparator (applied at each level) */
		sort?: (a: TreeNodeDTO<T>, b: TreeNodeDTO<T>) => number;

		/** Default expanded state for branches (default: false) */
		defaultExpanded?: boolean;

		/** Set of initially expanded branch IDs */
		expandedIds?: Set<string>;

		/** Enable localStorage persistence for expand/collapse state */
		persistState?: boolean;

		/** Storage key prefix for localStorage (default: 'stuic-tree') */
		storageKeyPrefix?: string;

		/** Enable drag-and-drop node reordering (default: false) */
		draggable?: boolean;

		/** Per-item drag control: return false to prevent dragging a specific item */
		isDraggable?: (item: TreeNodeDTO<T>) => boolean;

		/** Per-item drop target control: return false to prevent dropping onto a specific item */
		isDropTarget?: (item: TreeNodeDTO<T>) => boolean;

		/** Called on drop. Return false or throw to reject the move. */
		onMove?: (event: TreeMoveEvent<T>) => void | false | Promise<void | false>;

		/** Called when onMove throws an error */
		onError?: (error: unknown) => void;

		/** Delay in ms before auto-expanding a collapsed branch on drag-over (default: 800) */
		dragExpandDelay?: number;

		/** Skip all default styling */
		unstyled?: boolean;

		/** Classes for the wrapper element */
		class?: string;

		/** Element reference */
		el?: HTMLElement;

		/** Classes for individual items */
		classItem?: string;
		/** Classes for active items */
		classItemActive?: string;
		/** Classes for icons */
		classIcon?: string;
		/** Classes for labels */
		classLabel?: string;
		/** Classes for children container */
		classChildren?: string;
		/** Classes for chevron icon */
		classChevron?: string;
	}

	export const TREE_BASE_CLASSES = "stuic-tree";
	export const TREE_ITEM_CLASSES = "stuic-tree-item";
	export const TREE_CHILDREN_CLASSES = "stuic-tree-children";
</script>

<script lang="ts" generics="T = unknown">
	import type { TreeNodeDTO as TreeNode } from "@marianmeres/tree";
	import { twMerge } from "../../utils/tw-merge.js";
	import { localStorageValue } from "../../utils/storage-abstraction.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { iconChevronRight } from "$lib/icons/index.js";
	import { slide } from "svelte/transition";
	import { SvelteSet } from "svelte/reactivity";

	let {
		items,
		renderItem: renderItemSnippet,
		renderIcon: renderIconSnippet,
		activeId,
		isActive,
		onSelect,
		onToggle,
		sort,
		defaultExpanded = false,
		expandedIds,
		persistState = false,
		storageKeyPrefix = "stuic-tree",
		draggable = false,
		isDraggable,
		isDropTarget,
		onMove,
		onError,
		dragExpandDelay = 800,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		classItem,
		classItemActive,
		classIcon,
		classLabel,
		classChildren,
		classChevron,
		...rest
	}: Props<T> = $props();

	const reducedMotion = prefersReducedMotion();

	// ---------------------------------------------------------------------------
	// Helpers: localStorage persistence
	// ---------------------------------------------------------------------------

	function getStorageKey(itemId: string): string {
		return `${storageKeyPrefix}-${itemId}`;
	}

	function loadState(itemId: string): boolean | undefined {
		if (!persistState) return undefined;
		return localStorageValue<boolean | undefined>(getStorageKey(itemId), undefined).get();
	}

	function saveState(itemId: string, expanded: boolean): void {
		if (!persistState) return;
		localStorageValue(getStorageKey(itemId), expanded).set(expanded);
	}

	// ---------------------------------------------------------------------------
	// Helpers: active state checks
	// ---------------------------------------------------------------------------

	function checkItemActive(item: TreeNode<T>): boolean {
		if (isActive) return isActive(item);
		if (activeId) return item.id === activeId;
		return false;
	}

	function hasActiveDescendant(items: TreeNode<T>[]): boolean {
		for (const item of items) {
			if (checkItemActive(item)) return true;
			if (item.children.length && hasActiveDescendant(item.children)) return true;
		}
		return false;
	}

	// ---------------------------------------------------------------------------
	// Expand/collapse state
	// ---------------------------------------------------------------------------

	function isBranch(item: TreeNode<T>): boolean {
		return item.children.length > 0;
	}

	function collectBranches(items: TreeNode<T>[]): TreeNode<T>[] {
		const result: TreeNode<T>[] = [];
		for (const item of items) {
			if (isBranch(item)) {
				result.push(item);
				result.push(...collectBranches(item.children));
			}
		}
		return result;
	}

	function computeExpandedSet(): SvelteSet<string> {
		const expanded = new SvelteSet<string>();

		// Start from expandedIds prop if provided
		if (expandedIds) {
			for (const id of expandedIds) expanded.add(id);
		}

		const branches = collectBranches(items);
		for (const branch of branches) {
			// First priority: localStorage
			if (persistState) {
				const stored = loadState(branch.id);
				if (stored != null) {
					if (stored) expanded.add(branch.id);
					else expanded.delete(branch.id);
					continue;
				}
			}

			// Second priority: already in expandedIds (handled above)
			if (expandedIds?.has(branch.id)) continue;

			// Third priority: auto-expand if has active descendant
			if (hasActiveDescendant(branch.children)) {
				expanded.add(branch.id);
				continue;
			}

			// Fourth: defaultExpanded
			if (defaultExpanded) {
				expanded.add(branch.id);
			}
		}

		return expanded;
	}

	let expandedStates = $state(computeExpandedSet());

	function isExpanded(itemId: string): boolean {
		return expandedStates.has(itemId);
	}

	function getDescendantIds(item: TreeNode<T>): string[] {
		const ids: string[] = [];
		for (const child of item.children) {
			ids.push(child.id);
			ids.push(...getDescendantIds(child));
		}
		return ids;
	}

	function toggleExpanded(item: TreeNode<T>) {
		const wasExpanded = expandedStates.has(item.id);
		if (wasExpanded) {
			// Collapse: also collapse all descendants
			expandedStates.delete(item.id);
			saveState(item.id, false);
			for (const id of getDescendantIds(item)) {
				expandedStates.delete(id);
				saveState(id, false);
			}
		} else {
			expandedStates.add(item.id);
			saveState(item.id, true);
		}
		onToggle?.(item, !wasExpanded);
	}

	// ---------------------------------------------------------------------------
	// Sorting
	// ---------------------------------------------------------------------------

	function sortedItems(nodeItems: TreeNode<T>[]): TreeNode<T>[] {
		if (!sort) return nodeItems;
		return [...nodeItems].sort(sort);
	}

	// ---------------------------------------------------------------------------
	// Keyboard navigation (roving tabindex)
	// ---------------------------------------------------------------------------

	let focusedId = $state<string | null>(null);

	function flattenVisible(nodeItems: TreeNode<T>[]): TreeNode<T>[] {
		const result: TreeNode<T>[] = [];
		for (const item of sortedItems(nodeItems)) {
			result.push(item);
			if (isBranch(item) && isExpanded(item.id)) {
				result.push(...flattenVisible(item.children));
			}
		}
		return result;
	}

	function findParent(
		nodeItems: TreeNode<T>[],
		targetId: string,
		parent: TreeNode<T> | null = null
	): TreeNode<T> | null {
		for (const item of nodeItems) {
			if (item.id === targetId) return parent;
			if (item.children.length) {
				const found = findParent(item.children, targetId, item);
				if (found) return found;
			}
		}
		return null;
	}

	function focusItem(id: string) {
		focusedId = id;
		// Focus the DOM element
		const itemEl = el?.querySelector(`[data-tree-id="${id}"]`) as HTMLElement | null;
		itemEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		const visible = flattenVisible(items);
		if (!visible.length) return;

		const currentIndex = focusedId ? visible.findIndex((n) => n.id === focusedId) : -1;
		const current = currentIndex >= 0 ? visible[currentIndex] : null;

		switch (e.key) {
			case "ArrowDown": {
				e.preventDefault();
				const nextIndex = Math.min(currentIndex + 1, visible.length - 1);
				focusItem(visible[nextIndex].id);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
				focusItem(visible[prevIndex].id);
				break;
			}
			case "ArrowRight": {
				e.preventDefault();
				if (current && isBranch(current)) {
					if (!isExpanded(current.id)) {
						toggleExpanded(current);
					} else if (current.children.length) {
						// Move to first child
						const sorted = sortedItems(current.children);
						focusItem(sorted[0].id);
					}
				}
				break;
			}
			case "ArrowLeft": {
				e.preventDefault();
				if (current && isBranch(current) && isExpanded(current.id)) {
					toggleExpanded(current);
				} else if (current) {
					// Move to parent
					const parent = findParent(items, current.id);
					if (parent) focusItem(parent.id);
				}
				break;
			}
			case "Enter":
			case " ": {
				e.preventDefault();
				if (current) {
					if (isBranch(current)) {
						toggleExpanded(current);
					}
					onSelect?.(current);
				}
				break;
			}
			case "Home": {
				e.preventDefault();
				if (visible.length) focusItem(visible[0].id);
				break;
			}
			case "End": {
				e.preventDefault();
				if (visible.length) focusItem(visible[visible.length - 1].id);
				break;
			}
		}
	}

	// ---------------------------------------------------------------------------
	// Item click handling
	// ---------------------------------------------------------------------------

	function handleItemClick(item: TreeNode<T>) {
		focusedId = item.id;
		if (isBranch(item)) {
			toggleExpanded(item);
		}
		onSelect?.(item);
	}

	// ---------------------------------------------------------------------------
	// Transition
	// ---------------------------------------------------------------------------

	let transitionDuration = $derived(reducedMotion.current ? 0 : 150);

	// ---------------------------------------------------------------------------
	// Drag and drop
	// ---------------------------------------------------------------------------

	let dragSourceId = $state<string | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropPos = $state<TreeDropPosition | null>(null);
	let dragExpandTimer: ReturnType<typeof setTimeout> | null = null;

	function findNodeById(nodeItems: TreeNode<T>[], id: string): TreeNode<T> | null {
		for (const item of nodeItems) {
			if (item.id === id) return item;
			if (item.children.length) {
				const found = findNodeById(item.children, id);
				if (found) return found;
			}
		}
		return null;
	}

	function isDescendantOf(ancestorId: string, nodeId: string): boolean {
		const ancestor = findNodeById(items, ancestorId);
		if (!ancestor) return false;
		return getDescendantIds(ancestor).includes(nodeId);
	}

	function calcDropPosition(
		e: DragEvent,
		targetEl: HTMLElement,
		targetIsBranch: boolean
	): TreeDropPosition {
		const rect = targetEl.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const third = rect.height / 3;

		if (y < third) return "before";
		if (y > third * 2) return "after";
		return targetIsBranch ? "inside" : y < rect.height / 2 ? "before" : "after";
	}

	function clearDragExpandTimer() {
		if (dragExpandTimer) {
			clearTimeout(dragExpandTimer);
			dragExpandTimer = null;
		}
	}

	function resetDragState() {
		dragSourceId = null;
		dropTargetId = null;
		dropPos = null;
		clearDragExpandTimer();
	}

	function handleDragStart(e: DragEvent, item: TreeNode<T>) {
		if (!draggable || isDraggable?.(item) === false) {
			e.preventDefault();
			return;
		}
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData("text/plain", item.id);
		dragSourceId = item.id;
	}

	function handleDragOver(e: DragEvent, item: TreeNode<T>) {
		if (!draggable || !dragSourceId) return;

		// Can't drop on self
		if (item.id === dragSourceId) return;

		// Can't drop ancestor into its own subtree
		if (isDescendantOf(dragSourceId, item.id)) return;

		// Consumer-level drop target check
		if (isDropTarget?.(item) === false) return;

		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer!.dropEffect = "move";

		const targetEl = (e.currentTarget as HTMLElement).querySelector(
			":scope > button"
		) as HTMLElement;
		if (!targetEl) return;

		const pos = calcDropPosition(e, targetEl, isBranch(item));
		dropTargetId = item.id;
		dropPos = pos;

		// Auto-expand collapsed branches
		if (pos === "inside" && isBranch(item) && !isExpanded(item.id)) {
			if (!dragExpandTimer) {
				dragExpandTimer = setTimeout(() => {
					toggleExpanded(item);
					dragExpandTimer = null;
				}, dragExpandDelay);
			}
		} else {
			clearDragExpandTimer();
		}
	}

	function handleDragLeave(e: DragEvent) {
		if (!draggable) return;
		e.stopPropagation();
		const currentTarget = e.currentTarget as HTMLElement;
		const relatedTarget = e.relatedTarget as Node | null;
		// Only clear if actually leaving the treeitem (not entering a child)
		if (relatedTarget && currentTarget.contains(relatedTarget)) return;
		if (dropTargetId) {
			dropTargetId = null;
			dropPos = null;
		}
		clearDragExpandTimer();
	}

	async function handleDrop(e: DragEvent, _item: TreeNode<T>) {
		e.preventDefault();
		e.stopPropagation();
		if (!draggable || !dragSourceId || !dropPos || !dropTargetId) {
			resetDragState();
			return;
		}

		// Use tracked drop target from state, not the event target (may differ due to bubbling)
		const source = findNodeById(items, dragSourceId);
		const target = findNodeById(items, dropTargetId);
		if (!source || !target || source.id === target.id) {
			resetDragState();
			return;
		}

		const event: TreeMoveEvent<T> = {
			source,
			target,
			position: dropPos,
		};

		resetDragState();

		if (onMove) {
			try {
				const result = await onMove(event);
				if (result === false) return;
			} catch (err) {
				onError?.(err);
			}
		}
	}

	function handleDragEnd() {
		resetDragState();
	}
</script>

<div
	bind:this={el}
	class={twMerge(!unstyled && TREE_BASE_CLASSES, classProp)}
	role="tree"
	onkeydown={handleKeydown}
	{...rest}
>
	{#snippet renderNode(item: TreeNode<T>, depth: number)}
		{@const branch = isBranch(item)}
		{@const expanded = branch && isExpanded(item.id)}
		{@const active = checkItemActive(item)}
		{@const focused = focusedId === item.id}

		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			role="treeitem"
			aria-expanded={branch ? expanded : undefined}
			aria-selected={active}
			aria-level={depth + 1}
			ondragover={draggable ? (e) => handleDragOver(e, item) : undefined}
			ondragleave={draggable ? handleDragLeave : undefined}
			ondrop={draggable ? (e) => handleDrop(e, item) : undefined}
			data-drop-position={dropTargetId === item.id && dropPos ? dropPos : undefined}
		>
			<!-- The clickable row -->
			<button
				type="button"
				class={twMerge(
					!unstyled && TREE_ITEM_CLASSES,
					active && classItemActive,
					classItem
				)}
				data-tree-id={item.id}
				data-active={!unstyled && active ? "" : undefined}
				data-focused={!unstyled && focused ? "" : undefined}
				data-branch={!unstyled && branch ? "" : undefined}
				data-depth={depth}
				data-dragging={dragSourceId === item.id ? "" : undefined}
				draggable={draggable && isDraggable?.(item) !== false ? true : undefined}
				style={!unstyled
					? `padding-left: calc(${depth} * var(--stuic-tree-indent) + var(--stuic-tree-item-padding-x))`
					: undefined}
				tabindex={focused ? 0 : -1}
				onclick={() => handleItemClick(item)}
				onfocus={() => (focusedId = item.id)}
				ondragstart={draggable ? (e) => handleDragStart(e, item) : undefined}
				ondragend={draggable ? handleDragEnd : undefined}
			>
				<!-- Chevron for branches -->
				{#if branch}
					<span
						class={twMerge(
							"inline-block shrink-0 transition-transform duration-150",
							expanded && "rotate-90",
							classChevron
						)}
					>
						{@html iconChevronRight({ size: 14 })}
					</span>
				{:else}
					<!-- Spacer to align leaf items with branches -->
					<span
						class={twMerge("inline-block shrink-0", classChevron)}
						style="width: 14px;"
					></span>
				{/if}

				<!-- Custom or default icon -->
				{#if renderIconSnippet}
					<span class={twMerge("shrink-0", classIcon)}>
						{@render renderIconSnippet(item, depth, expanded)}
					</span>
				{/if}

				<!-- Custom or default label -->
				<span class={twMerge("truncate", classLabel)}>
					{#if renderItemSnippet}
						{@render renderItemSnippet(item, depth, expanded)}
					{:else}
						{String(item.value)}
					{/if}
				</span>
			</button>

			<!-- Children -->
			{#if branch && expanded}
				<div
					class={twMerge(!unstyled && TREE_CHILDREN_CLASSES, classChildren)}
					role="group"
					transition:slide={{ duration: transitionDuration }}
				>
					{#each sortedItems(item.children) as child (child.id)}
						{@render renderNode(child, depth + 1)}
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}

	{#each sortedItems(items) as item (item.id)}
		{@render renderNode(item, 0)}
	{/each}
</div>
