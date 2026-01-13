import { mount, unmount } from "svelte";
import { twMerge } from "../../utils/tw-merge.js";
import { addAnchorName, removeAnchorName } from "../../utils/anchor-name.js";
import type { THC } from "../../components/Thc/Thc.svelte";
import PopoverContent from "./PopoverContent.svelte";
//
import "./index.css";

// Registry of open popover hide functions for closeOthers feature
const openPopovers = new Set<() => void>();

const SHOW_DELAY = 100;
const HIDE_DELAY = 200;
const TRANSITION = 200;

/**
 * Checks if the browser supports CSS Anchor Positioning for popovers.
 *
 * Tests for support of `anchor-name`, `position-area`, `position-try`,
 * and `position-try-fallbacks` CSS properties.
 *
 * @returns `true` if CSS Anchor Positioning is fully supported
 *
 * @example
 * ```ts
 * if (isPopoverSupported()) {
 *   // Use native anchor positioning
 * } else {
 *   // Fall back to centered modal
 * }
 * ```
 */
export function isPopoverSupported() {
	return (
		CSS.supports("anchor-name", "--anchor") &&
		CSS.supports("position-area", "top") &&
		CSS.supports("position-try", "top") &&
		CSS.supports("position-try-fallbacks", "top")
	);
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

const _classPopover = `
	bg-popover-bg dark:bg-popover-bg-dark text-popover-text dark:text-popover-text-dark
	shadow-lg rounded-md
	border border-popover-border dark:border-popover-border-dark
	z-50
`;

const _classBackdrop = `
	fixed inset-0 bg-black/25
	z-40
`;

/**
 * Valid positions for popover placement relative to the anchor element.
 */
export type PopoverPosition =
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

/**
 * Trigger mode for the popover.
 * - "click": Opens/closes on click (default)
 * - "hover": Opens on hover/focus, closes on leave/blur
 * - "hover-or-click": Hover primary, click as fallback (for touch devices)
 */
export type PopoverTrigger = "click" | "hover" | "hover-or-click";

/**
 * Options for the popover action.
 */
export interface PopoverOptions {
	/** Whether the popover is enabled */
	enabled?: boolean;
	/** Content to display (THC format: string, {text}, {html}, {component, props}, {snippet}, or Snippet) */
	content?: THC | null;
	/** Preferred position relative to anchor */
	position?: PopoverPosition;
	/** Trigger mode: "click" (default), "hover", or "hover-or-click" (both, click as touch fallback) */
	trigger?: PopoverTrigger;
	/** Delay before showing (ms), mainly for hover mode */
	showDelay?: number;
	/** Delay before hiding (ms), mainly for hover mode */
	hideDelay?: number;
	/** Custom class for the popover container */
	class?: string;
	/** Offset/margin from the anchor element (CSS value, e.g., "0.5rem", "8px") */
	offset?: string;
	/** Close all other open popovers when this one opens */
	closeOthers?: boolean;
	/** Close on click outside (for click trigger) */
	closeOnClickOutside?: boolean;
	/** Close on Escape key */
	closeOnEscape?: boolean;
	/** Show backdrop in fallback mode */
	showBackdrop?: boolean;
	/** Force fallback mode (centered modal) even if CSS Anchor Positioning is supported */
	forceFallback?: boolean;
	/** Callback when popover opens */
	onShow?: () => void;
	/** Callback when popover hides */
	onHide?: () => void;
	/** Debug mode */
	debug?: boolean;
}

/**
 * Checks if content is simple (string/html) vs complex (component/snippet).
 */
function isSimpleContent(content: THC | null | undefined): boolean {
	if (!content) return true;
	if (typeof content === "string") return true;
	if (typeof content === "object") {
		if ("text" in content || "html" in content) return true;
	}
	return false;
}

/**
 * Extracts string content for simple THC types.
 */
function getStringContent(content: THC | null | undefined): string {
	if (!content) return "";
	if (typeof content === "string") return content;
	if (typeof content === "object") {
		if ("html" in content) return (content as { html: string }).html;
		if ("text" in content) return (content as { text: string }).text;
	}
	return "";
}

/**
 * A Svelte action that displays a popover anchored to an element using CSS Anchor Positioning.
 *
 * The popover appears on click or hover (configurable) and supports multiple positions
 * with automatic fallback. When CSS Anchor Positioning is not supported, falls back
 * to a centered modal overlay.
 *
 * @param anchorEl - The element to attach the popover to
 * @param fn - Function returning popover options (reactive)
 *
 * @example
 * ```svelte
 * <!-- Click trigger (default) -->
 * <button use:popover={() => ({ content: "Hello World" })}>
 *   Open Popover
 * </button>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Hover trigger -->
 * <button use:popover={() => ({
 *   content: "Hover content",
 *   trigger: "hover",
 *   position: "top"
 * })}>
 *   Hover Me
 * </button>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Hover with click fallback (for touch devices) -->
 * <button use:popover={() => ({
 *   content: "Works on hover and touch!",
 *   trigger: "hover-or-click",
 *   position: "top"
 * })}>
 *   Hover or Tap
 * </button>
 * ```
 *
 * @example
 * ```svelte
 * <!-- With component content -->
 * <button use:popover={() => ({
 *   content: { component: MyComponent, props: { foo: "bar" } }
 * })}>
 *   With Component
 * </button>
 * ```
 *
 * @remarks
 * - Falls back to centered modal when CSS Anchor Positioning is not supported
 * - Closes on click outside (for click trigger) and Escape key by default
 * - For hover trigger, popover persists when hovering over it
 * - Automatically cleans up DOM elements on unmount
 */
export function popover(anchorEl: HTMLElement, fn?: () => PopoverOptions) {
	const isSupported = isPopoverSupported();

	// State
	let popoverEl: HTMLDivElement | null = null;
	let backdropEl: HTMLDivElement | null = null;
	let wrapperEl: HTMLDivElement | null = null;
	let mountedComponent: ReturnType<typeof mount> | null = null;
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let isVisible = false;
	let do_debug = false;

	// Unique identifiers
	const rnd = Math.random().toString(36).slice(2);
	const id = `popover-${rnd}`;
	const anchorName = `--anchor-popover-${rnd}`;

	// Current options (updated reactively)
	let currentOptions: PopoverOptions = {};

	// Initialize anchor element - anchor-name is always set
	// In forceFallback mode, the CSS is just ignored
	// Use addAnchorName to support multiple anchor names on same element (e.g., popover + tooltip)
	addAnchorName(anchorEl, anchorName);
	anchorEl.setAttribute("aria-haspopup", "dialog");
	anchorEl.setAttribute("aria-expanded", "false");
	anchorEl.setAttribute("aria-controls", id);

	// Debug helper
	const debug = (...args: unknown[]) => {
		if (do_debug) console.debug("[popover]", rnd, ...args);
	};

	// Timer helpers
	function clearTimers() {
		if (showTimer) clearTimeout(showTimer);
		if (hideTimer) clearTimeout(hideTimer);
		showTimer = null;
		hideTimer = null;
	}

	function cancelHide() {
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = null;
	}

	// Event handlers
	function onEscape(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			hide();
		}
	}

	function onClickOutside(e: MouseEvent) {
		if (
			popoverEl &&
			!popoverEl.contains(e.target as Node) &&
			!anchorEl.contains(e.target as Node)
		) {
			hide();
		}
	}

	function onClickTrigger(e: MouseEvent) {
		e.stopPropagation();
		if (isVisible) hide();
		else show();
	}

	// Render content into popover element
	function renderContent() {
		if (!popoverEl || !currentOptions.content) return;

		debug("renderContent()", currentOptions.content);

		// Cleanup previous mounted component
		if (mountedComponent) {
			unmount(mountedComponent);
			mountedComponent = null;
		}

		popoverEl.innerHTML = "";

		const content = currentOptions.content;

		if (isSimpleContent(content)) {
			// Simple string/html content
			popoverEl.innerHTML = getStringContent(content);
		} else {
			// Complex content (component/snippet) - use mount()
			mountedComponent = mount(PopoverContent, {
				target: popoverEl,
				props: { thc: content as THC },
			});
		}
	}

	// Show popover
	function show() {
		debug("show()", { enabled: currentOptions.enabled, content: currentOptions.content });
		clearTimers();

		if (!currentOptions.enabled || !currentOptions.content) return;
		if (isVisible) return;

		// Close other popovers if requested
		if (currentOptions.closeOthers) {
			openPopovers.forEach((hideFn) => {
				if (hideFn !== hide) hideFn();
			});
		}

		// Register this popover
		openPopovers.add(hide);

		isVisible = true;
		anchorEl.setAttribute("aria-expanded", "true");

		const offsetValue = currentOptions.offset || "0.25rem";
		const useAnchorPositioning = isSupported && !currentOptions.forceFallback;

		// Create elements
		if (useAnchorPositioning) {
			// CSS Anchor Positioning mode
			popoverEl = document.createElement("div");
			popoverEl.setAttribute("id", id);
			popoverEl.setAttribute("role", "dialog");
			popoverEl.style.cssText = `
				position: fixed;
				position-anchor: ${anchorName};
				position-area: ${POSITION_MAP[currentOptions.position || "bottom"] || "bottom"};
				transition-duration: ${TRANSITION}ms;
				margin: ${offsetValue};
			`;
			popoverEl.classList.add(
				...twMerge("stuic-popover", _classPopover, currentOptions.class).split(/\s/)
			);
			document.body.appendChild(popoverEl);
		} else {
			// Fallback centered modal mode
			if (currentOptions.showBackdrop !== false) {
				backdropEl = document.createElement("div");
				backdropEl.classList.add(
					...twMerge("stuic-popover-backdrop", _classBackdrop).split(/\s/)
				);
				backdropEl.style.cssText = `transition-duration: ${TRANSITION}ms;`;
				document.body.appendChild(backdropEl);

				// Backdrop click closes popover
				if (currentOptions.closeOnClickOutside !== false) {
					backdropEl.addEventListener("click", hide);
				}
			}

			// Create wrapper for centering
			wrapperEl = document.createElement("div");
			wrapperEl.classList.add("stuic-popover-wrapper");
			wrapperEl.style.cssText = `
				position: fixed;
				inset: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 50;
				pointer-events: none;
			`;

			// Create popover element
			popoverEl = document.createElement("div");
			popoverEl.setAttribute("id", id);
			popoverEl.setAttribute("role", "dialog");
			popoverEl.style.cssText = `
				position: relative;
				max-width: 90vw;
				max-height: 90vh;
				overflow: auto;
				transition-duration: ${TRANSITION}ms;
				pointer-events: auto;
			`;
			popoverEl.classList.add(
				...twMerge("stuic-popover-fallback", _classPopover, currentOptions.class).split(
					/\s/
				)
			);

			wrapperEl.appendChild(popoverEl);
			document.body.appendChild(wrapperEl);

			// Click on wrapper (outside popover) closes
			if (currentOptions.closeOnClickOutside !== false) {
				wrapperEl.addEventListener("click", (e) => {
					if (e.target === wrapperEl) hide();
				});
			}
		}

		// Render content
		renderContent();

		// Transition in
		popoverEl.classList.add("pop-block");
		requestAnimationFrame(() => {
			popoverEl?.classList.add("pop-visible");
			backdropEl?.classList.add("pop-visible");
			currentOptions.onShow?.();
		});

		// Add event listeners
		if (currentOptions.closeOnEscape !== false) {
			document.addEventListener("keydown", onEscape);
		}

		// For hover mode, allow hovering over the popover itself
		if (currentOptions.trigger === "hover" && popoverEl) {
			popoverEl.addEventListener("mouseenter", cancelHide);
			popoverEl.addEventListener("mouseleave", scheduleHide);
		}

		// For click or hover mode with closeOnClickOutside
		if (currentOptions.closeOnClickOutside !== false && useAnchorPositioning) {
			// Delay adding click listener to avoid immediate close
			setTimeout(() => {
				document.addEventListener("click", onClickOutside);
			}, 0);
		}
	}

	// Hide popover
	function hide() {
		debug("hide()");
		clearTimers();

		if (!isVisible) return;
		isVisible = false;

		// Unregister from open popovers
		openPopovers.delete(hide);

		anchorEl.setAttribute("aria-expanded", "false");

		// Remove event listeners
		document.removeEventListener("keydown", onEscape);
		document.removeEventListener("click", onClickOutside);

		// Transition out
		popoverEl?.classList.remove("pop-visible");
		backdropEl?.classList.remove("pop-visible");

		setTimeout(() => {
			// Cleanup mounted component
			if (mountedComponent) {
				unmount(mountedComponent);
				mountedComponent = null;
			}

			// Remove elements
			popoverEl?.remove();
			backdropEl?.remove();
			wrapperEl?.remove();

			popoverEl = null;
			backdropEl = null;
			wrapperEl = null;

			currentOptions.onHide?.();
		}, TRANSITION);
	}

	function scheduleShow() {
		debug("scheduleShow()");
		clearTimers();
		const delay = currentOptions.showDelay ?? SHOW_DELAY;
		showTimer = setTimeout(show, delay);
	}

	function scheduleHide() {
		debug("scheduleHide()");
		clearTimers();
		const delay = currentOptions.hideDelay ?? HIDE_DELAY;
		hideTimer = setTimeout(hide, delay);
	}

	// Reactive params effect
	$effect(() => {
		const opts = fn?.() || {};

		currentOptions = {
			enabled: opts.enabled ?? true,
			content: opts.content,
			position: opts.position || "bottom",
			trigger: opts.trigger || "click",
			showDelay: opts.showDelay ?? SHOW_DELAY,
			hideDelay: opts.hideDelay ?? HIDE_DELAY,
			class: opts.class,
			offset: opts.offset,
			closeOthers: opts.closeOthers ?? false,
			closeOnClickOutside: opts.closeOnClickOutside ?? true,
			closeOnEscape: opts.closeOnEscape ?? true,
			showBackdrop: opts.showBackdrop ?? true,
			forceFallback: opts.forceFallback ?? false,
			onShow: opts.onShow,
			onHide: opts.onHide,
			debug: opts.debug,
		};

		do_debug = !!opts.debug;

		// Update popover if visible
		if (isVisible && popoverEl) {
			// Update position (only in anchor positioning mode)
			if (isSupported && !currentOptions.forceFallback) {
				popoverEl.style.setProperty(
					"position-area",
					POSITION_MAP[currentOptions.position || "bottom"] || "bottom"
				);
			}
			// Re-render content
			renderContent();
		}

		// Note: trigger mode change while visible is not fully handled
		// User should close and reopen for trigger mode change to take effect
	});

	// Event listeners effect
	$effect(() => {
		const trigger = currentOptions.trigger || "click";

		if (trigger === "click") {
			anchorEl.addEventListener("click", onClickTrigger);
		} else if (trigger === "hover") {
			anchorEl.addEventListener("mouseenter", scheduleShow);
			anchorEl.addEventListener("mouseleave", scheduleHide);
			anchorEl.addEventListener("focus", scheduleShow);
			anchorEl.addEventListener("blur", scheduleHide);
		} else if (trigger === "hover-or-click") {
			// Both: hover primary, click fallback for touch
			anchorEl.addEventListener("mouseenter", scheduleShow);
			anchorEl.addEventListener("mouseleave", scheduleHide);
			anchorEl.addEventListener("focus", scheduleShow);
			anchorEl.addEventListener("blur", scheduleHide);
			anchorEl.addEventListener("click", onClickTrigger);
		}

		return () => {
			anchorEl.removeEventListener("click", onClickTrigger);
			anchorEl.removeEventListener("mouseenter", scheduleShow);
			anchorEl.removeEventListener("mouseleave", scheduleHide);
			anchorEl.removeEventListener("focus", scheduleShow);
			anchorEl.removeEventListener("blur", scheduleHide);

			// Remove anchor name (preserves other anchor names on element)
			removeAnchorName(anchorEl, anchorName);

			// Cleanup popover on unmount
			if (mountedComponent) {
				unmount(mountedComponent);
				mountedComponent = null;
			}
			popoverEl?.remove();
			backdropEl?.remove();
			wrapperEl?.remove();
			clearTimers();

			// Unregister from open popovers
			openPopovers.delete(hide);

			document.removeEventListener("keydown", onEscape);
			document.removeEventListener("click", onClickOutside);
		};
	});
}
