<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		DropdownMenuActionItem,
		DropdownMenuItem,
		DropdownMenuPosition,
		DropdownMenuSearchConfig,
	} from "../DropdownMenu/DropdownMenu.svelte";

	/** ContextMenu shares the DropdownMenu item model — aliases for consumer DX. */
	export type ContextMenuItem = DropdownMenuItem;
	export type ContextMenuActionItem = DropdownMenuActionItem;
	export type ContextMenuPosition = DropdownMenuPosition;
	export type ContextMenuSearchConfig = DropdownMenuSearchConfig;

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Menu items to display (the DropdownMenu item model) */
		items: ContextMenuItem[];
		/** The right-clickable / long-pressable target area content */
		children?: Snippet;
		/** Controlled open state (bindable). Setting `true` programmatically with no
		 *  recorded coordinates positions the menu at the target area's top-left. */
		isOpen?: boolean;
		/** When true, triggers are inert and the browser's native menu works again */
		disabled?: boolean;
		/** Long-press duration in ms for touch/pen pointers (default 500);
		 *  `false` disables the long-press trigger entirely. */
		longPress?: number | false;
		/** Menu placement relative to the pointer (default "bottom-span-right" —
		 *  below-right of the cursor, the native context menu convention) */
		position?: ContextMenuPosition;
		/** Offset of the menu from the pointer (CSS value, default "0px") */
		offset?: string;
		/** Max height of the menu (CSS value) */
		maxHeight?: string;
		/** Whether to close the menu when an action item is selected */
		closeOnSelect?: boolean;
		/** Close on click outside */
		closeOnClickOutside?: boolean;
		/** Close on Escape key */
		closeOnEscape?: boolean;
		/** Force fallback positioning mode (for testing) */
		forceFallback?: boolean;
		/** Enable search/filter functionality (true for defaults, or config object) */
		search?: boolean | ContextMenuSearchConfig;
		/** Show backdrop in fallback mode (default: true) */
		showBackdrop?: boolean;
		/** Reserve scrollbar space to prevent layout shift on open (see DropdownMenu) */
		scrollbarGutter?: boolean;
		/** Skip the body scroll lock in fallback mode */
		noScrollLock?: boolean;
		/** Called when the menu opens */
		onOpen?: () => void;
		/** Called when the menu closes */
		onClose?: () => void;
		/** Called when any action item is selected (fallback if item has no onSelect) */
		onSelect?: (item: ContextMenuActionItem) => void | boolean | Promise<void | boolean>;
		/** i18n translate function (see `createContextMenuT`) — localizes the
		 *  screen-reader-only menu label */
		t?: TranslateFn;
		/** Opt out of stuic base classes for full styling control */
		unstyled?: boolean;
		/** Classes for the target area wrapper */
		class?: string;
		/** Classes for the menu container */
		classDropdown?: string;
		/** Classes for action items */
		classItem?: string;
		/** Classes for active/focused action item */
		classItemActive?: string;
		/** Classes for disabled items */
		classItemDisabled?: string;
		/** Classes for content before label */
		classItemBefore?: string;
		/** Classes for content after label */
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
		/** Reference to the target area wrapper element */
		el?: HTMLDivElement;
		/** Reference to the open menu element */
		dropdownEl?: HTMLDivElement;
	}

	export const CONTEXT_MENU_BASE_CLASSES = `stuic-context-menu`;

	export const CONTEXT_MENU_ANCHOR_CLASSES = `stuic-context-menu-anchor`;
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { fixedContainingBlockRect } from "../../utils/containing-block.js";
	import { longPress as longPressAttachment } from "../../attachments/long-press.js";
	import DropdownMenu from "../DropdownMenu/DropdownMenu.svelte";
	import { t_default } from "./i18n.js";

	let {
		items,
		children,
		isOpen = $bindable(false),
		disabled = false,
		longPress = 500,
		position = "bottom-span-right",
		offset = "0px",
		maxHeight,
		closeOnSelect,
		closeOnClickOutside,
		closeOnEscape,
		forceFallback,
		search,
		showBackdrop,
		scrollbarGutter,
		noScrollLock,
		onOpen,
		onClose,
		onSelect,
		t = t_default,
		unstyled = false,
		class: classProp,
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
		el = $bindable(),
		dropdownEl = $bindable(),
		...rest
	}: Props = $props();

	// Anchor coordinates within the anchor's fixed containing block (viewport,
	// unless a transformed/contained ancestor establishes one).
	let x = $state(0);
	let y = $state(0);
	let hasPosition = $state(false);

	// For keyboard users: what had focus when the menu opened, restored on close.
	let prevFocused: HTMLElement | null = null;

	/** Open the menu with its anchor at the given viewport coordinates. */
	function openAt(clientX: number, clientY: number) {
		if (disabled) return;
		// clientX/Y are viewport coords, but the fixed anchor resolves against its
		// containing block — translate when a transformed ancestor establishes one
		const cb = el ? fixedContainingBlockRect(el) : undefined;
		x = clientX - (cb?.left ?? 0);
		y = clientY - (cb?.top ?? 0);
		hasPosition = true;
		if (!isOpen) {
			const active = document.activeElement;
			prevFocused =
				active instanceof HTMLElement && active !== document.body ? active : null;
			isOpen = true;
		}
	}

	/** Open at an element's bottom-left corner (keyboard invocation convention). */
	function openAtElement(target?: Element | null) {
		const rect = (target ?? el)?.getBoundingClientRect();
		if (!rect) return;
		openAt(rect.left, rect.bottom);
	}

	function focusedElementWithin(): Element | null {
		const active = document.activeElement;
		return active && el?.contains(active) ? active : (el ?? null);
	}

	function _onContextMenu(e: MouseEvent) {
		if (disabled) return;
		e.preventDefault();
		// nested context areas: the innermost one wins
		e.stopPropagation();
		if (e.clientX === 0 && e.clientY === 0) {
			// keyboard-invoked (menu key synthesizes contextmenu with no coords)
			openAtElement(focusedElementWithin());
		} else {
			openAt(e.clientX, e.clientY);
		}
	}

	function _onKeydown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
			e.preventDefault();
			e.stopPropagation();
			openAtElement(focusedElementWithin());
		}
	}

	function _onClose() {
		onClose?.();
		if (prevFocused?.isConnected) prevFocused.focus();
		prevFocused = null;
	}

	// Programmatic open (isOpen set true from outside) with no coords yet —
	// anchor to the target area instead of the (0,0) default.
	$effect(() => {
		if (isOpen && !hasPosition && el) {
			openAtElement(el);
		}
	});

	const _longPressAttach = $derived(
		longPress !== false &&
			!disabled &&
			longPressAttachment({
				duration: longPress,
				onLongPress: (e) => openAt(e.clientX, e.clientY),
			})
	);
</script>

<div
	bind:this={el}
	class={unstyled ? classProp : twMerge(CONTEXT_MENU_BASE_CLASSES, classProp)}
	data-longpress={!unstyled && longPress !== false && !disabled ? "" : undefined}
	data-open={!unstyled && isOpen ? "" : undefined}
	aria-haspopup="menu"
	{...rest}
	oncontextmenu={_onContextMenu}
	onkeydown={_onKeydown}
	{@attach _longPressAttach}
>
	{@render children?.()}
</div>

<!-- Invisible 0x0 anchor moved to the pointer — the DropdownMenu positions against it -->
<div
	role="presentation"
	class={unstyled ? undefined : CONTEXT_MENU_ANCHOR_CLASSES}
	style:position="fixed"
	style:left="{x}px"
	style:top="{y}px"
	style:width="0"
	style:height="0"
	oncontextmenu={(e) => e.preventDefault()}
>
	<DropdownMenu
		bind:isOpen
		bind:dropdownEl
		{items}
		{position}
		{offset}
		{maxHeight}
		{closeOnSelect}
		{closeOnClickOutside}
		{closeOnEscape}
		{forceFallback}
		{search}
		{showBackdrop}
		{scrollbarGutter}
		{noScrollLock}
		{onOpen}
		onClose={_onClose}
		{onSelect}
		{unstyled}
		{classDropdown}
		{classItem}
		{classItemActive}
		{classItemDisabled}
		{classItemBefore}
		{classItemAfter}
		{classDivider}
		{classHeader}
		{classExpandable}
		{classExpandableContent}
		{classBackdrop}
		{classSearchContainer}
		{classSearchInput}
	>
		{#snippet trigger({ triggerProps })}
			<!-- No visible trigger — an sr-only label keeps the menu's
			     aria-labelledby reference valid and names it for AT -->
			<span class="sr-only" id={triggerProps.id}>
				{t("context_menu", null, "Context menu")}
			</span>
		{/snippet}
	</DropdownMenu>
</div>
