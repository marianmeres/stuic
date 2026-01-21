import { twMerge } from "../../utils/tw-merge.js";
import { addAnchorName, removeAnchorName } from "../../utils/anchor-name.js";
//
import "./index.css";

const TIMEOUT = 200;
const TRANSITION = 200;

/**
 * Checks if the browser supports CSS Anchor Positioning for tooltips.
 *
 * Tests for support of `anchor-name`, `position-area`, `position-try`,
 * and `position-try-fallbacks` CSS properties.
 *
 * @returns `true` if CSS Anchor Positioning is fully supported
 *
 * @example
 * ```ts
 * if (isTooltipSupported()) {
 *   // Use native anchor positioning
 * } else {
 *   // Fall back to JS-based positioning
 * }
 * ```
 */
export function isTooltipSupported() {
	return (
		CSS.supports("anchor-name", "--anchor") &&
		CSS.supports("position-area", "top") &&
		CSS.supports("position-try", "top") &&
		CSS.supports("position-try-fallbacks", "top")
	);
}

const _classTooltip = `
    bg-(--stuic-tooltip-bg) text-(--stuic-tooltip-text)
    text-sm tracking-tight rounded my-1
    px-2.5 py-1.5
    max-w-64
    z-50
`;

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
 * Find the appropriate container for the tooltip element.
 * If the anchor is inside an open dialog (modal), append to the dialog
 * so the tooltip renders in the same top layer as the modal.
 */
function getTooltipContainer(anchorEl: HTMLElement): HTMLElement {
	const dialog = anchorEl.closest("dialog[open]");
	if (dialog) {
		return dialog as HTMLElement;
	}
	return document.body;
}

/**
 * Valid positions for tooltip placement relative to the anchor element.
 */
export type TooltipPosition =
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
 * Configuration function for the tooltip action.
 *
 * Returns an object with tooltip options. Using a function allows reactive
 * updates when Svelte state changes.
 *
 * @returns Tooltip configuration object
 * @property enabled - Whether the tooltip is active (default: `true`)
 * @property content - Tooltip text content, falls back to `aria-label` if not provided
 * @property position - Placement relative to anchor element (default: `"top"`)
 * @property debug - Enable console debug logging
 * @property class - Additional CSS classes to merge with default styles
 * @property onShow - Callback fired after tooltip becomes visible
 * @property onHide - Callback fired after tooltip is hidden
 */
export type TooltipConfig = () => {
	enabled?: boolean;
	content?: string | null;
	position?: TooltipPosition;
	debug?: boolean;
	class?: string;
	onShow?: CallableFunction;
	onHide?: CallableFunction;
};

// Global tooltip configuration - allows disabling all tooltips at runtime
const globalTooltipConfig = $state({ enabled: true });

// Touch device auto-detection (runs once on first tooltip init)
let touchDetectionDone = false;

function detectTouchDevice() {
	if (touchDetectionDone) return;
	touchDetectionDone = true;

	// Detect touch device and disable tooltips by default
	const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
	if (isTouchDevice) {
		globalTooltipConfig.enabled = false;
	}
}

/**
 * Globally enable or disable all tooltips.
 * Useful for disabling tooltips on touch devices where they interfere with interactions.
 *
 * @param value - `true` to enable tooltips, `false` to disable
 *
 * @example
 * ```ts
 * // Disable tooltips on touch devices
 * if ('ontouchstart' in window) {
 *   setTooltipsEnabled(false);
 * }
 * ```
 */
export function setTooltipsEnabled(value: boolean) {
	globalTooltipConfig.enabled = value;
}

/**
 * Get the current global tooltip enabled state.
 * @returns `true` if tooltips are globally enabled, `false` otherwise
 */
export function getTooltipsEnabled(): boolean {
	return globalTooltipConfig.enabled;
}

/**
 * A Svelte action that displays a tooltip anchored to an element using CSS Anchor Positioning.
 *
 * The tooltip appears on hover/focus after a short delay and supports multiple positions
 * with automatic fallback. Requires browser support for CSS Anchor Positioning
 * (check with `isTooltipSupported()`).
 *
 * @param anchorEl - The element to attach the tooltip to
 * @param fn - Function returning tooltip options (reactive)
 *
 * @example
 * ```svelte
 * <button
 *   aria-label="Save document"
 *   use:tooltip={() => ({
 *     content: "Save your changes",
 *     position: "top"
 *   })}
 * >
 *   Save
 * </button>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Uses aria-label as content when no content provided -->
 * <button aria-label="Delete" use:tooltip>
 *   🗑️
 * </button>
 * ```
 *
 * @remarks
 * - Falls back to `aria-label` attribute if no content is provided
 * - Tooltip persists when hovering over it (useful for interactive content)
 * - Automatically cleans up DOM elements on unmount
 */
export function tooltip(anchorEl: HTMLElement, fn?: TooltipConfig) {
	// the node has been mounted in the DOM
	if (!isTooltipSupported()) return;

	// Auto-detect touch device on first tooltip init
	detectTouchDevice();

	//
	let tooltipEl: HTMLDivElement;
	let hide_timer: ReturnType<typeof setTimeout> | null = null;
	let show_timer: ReturnType<typeof setTimeout> | null = null;
	let do_debug = false;
	let on_show: CallableFunction | null | undefined = null;
	let on_hide: CallableFunction | null | undefined = null;
	let content: string | null | undefined = null;
	let classTooltip: string | null | undefined = null;
	let enabled: boolean = true;
	let position: TooltipPosition = "top";

	//
	const rnd = Math.random().toString(36).slice(2);
	const id = `tooltip-${rnd}`;
	const anchorName = `--anchor-${rnd}`;

	// node once init
	// Use addAnchorName to support multiple anchor names on same element (e.g., popover + tooltip)
	addAnchorName(anchorEl, anchorName);
	anchorEl.setAttribute("aria-describedby", id);
	anchorEl.setAttribute("aria-expanded", "false");

	const debug = (...args: unknown[]) => {
		if (do_debug) console.debug("[tooltip]", rnd, ...args);
	};

	function ensure_tooltip() {
		debug("ensure_tooltip()", content, classTooltip);

		if (!content) return false;

		// lazy factory init
		if (!tooltipEl) {
			debug("creating element...");
			tooltipEl = document.createElement("div");
			tooltipEl.setAttribute("id", id);
			tooltipEl.setAttribute("role", "tooltip");
			tooltipEl.style.cssText += `position-anchor: ${anchorName}; transition-duration: ${TRANSITION}ms; position-area: ${POSITION_MAP[position] || "top"};`;
			tooltipEl.classList.add(...twMerge("stuic-tooltip", _classTooltip).split(/\s/));
			// Append to dialog if inside one, otherwise body (for proper top-layer rendering in modals)
			const container = getTooltipContainer(anchorEl);
			container.appendChild(tooltipEl);
			//
			tooltipEl.addEventListener("mouseenter", schedule_show);
			tooltipEl.addEventListener("mouseleave", schedule_hide);
		}

		// re/set based on params
		set_content();

		return true;
	}

	function set_content() {
		if (tooltipEl) {
			debug("set_content()", classTooltip, content, position);
			// update position-area in case it changed
			tooltipEl.style.setProperty("position-area", POSITION_MAP[position] || "top");
			if (classTooltip) {
				const old = tooltipEl.className;
				tooltipEl.className = ""; // reset
				tooltipEl.classList.add(...twMerge(old, classTooltip).split(/\s/));
			}
			tooltipEl.innerHTML = `${content}`;
		}
	}

	function clear_show() {
		if (show_timer) clearTimeout(show_timer);
		show_timer = null;
	}

	function clear_hide() {
		if (hide_timer) clearTimeout(hide_timer);
		hide_timer = null;
	}

	function clear_both() {
		clear_show();
		clear_hide();
	}

	function schedule_show() {
		debug("schedule_show()", enabled);
		clear_both();
		if (!enabled || !ensure_tooltip()) return;
		show_timer = setTimeout(() => {
			if (!hide_timer) {
				debug("show...");
				clear_show();
				anchorEl.setAttribute("aria-expanded", "true");
				//
				tooltipEl.classList.add("tt-block");
				requestAnimationFrame(() => {
					tooltipEl.classList.add("tt-visible");
					on_show?.();
				});
			}
		}, TIMEOUT);
	}

	function schedule_hide() {
		debug("scheduleHide()", enabled);
		clear_both();

		// legit - maybe there was no content available...
		if (!tooltipEl) return false;

		hide_timer = setTimeout(() => {
			debug("hide...");
			clear_hide();
			anchorEl.setAttribute("aria-expanded", "false");
			tooltipEl.classList.remove("tt-visible");
			setTimeout(() => {
				tooltipEl.classList.remove("tt-block");
				on_hide?.();
			}, TRANSITION);
		}, TIMEOUT);
	}

	// "reactive" params re/set
	$effect(() => {
		const {
			enabled: _enabled,
			content: _content,
			position: _position,
			debug: debugParam,
			class: _classTooltip,
			onShow,
			onHide,
		} = fn?.() || {};

		// re/assign new params
		do_debug = !!debugParam;
		on_show = onShow;
		on_hide = onHide;
		content = _content || anchorEl.getAttribute("aria-label");
		classTooltip = _classTooltip;
		enabled = globalTooltipConfig.enabled && (_enabled ?? true);
		position = _position || "top";

		// this will be effective here only if currently in open state, otherwise noop
		set_content();

		// do not return cleanups here - we want the tooltipEl to persist params change
	});

	// add/remove listeners effect ("non-reactive")
	$effect(() => {
		anchorEl.addEventListener("mouseenter", schedule_show);
		anchorEl.addEventListener("mouseleave", schedule_hide);
		anchorEl.addEventListener("focus", schedule_show);
		anchorEl.addEventListener("blur", schedule_hide);

		return () => {
			anchorEl.removeEventListener("mouseenter", schedule_show);
			anchorEl.removeEventListener("mouseleave", schedule_hide);
			anchorEl.removeEventListener("focus", schedule_show);
			anchorEl.removeEventListener("blur", schedule_hide);

			// Remove anchor name (preserves other anchor names on element)
			removeAnchorName(anchorEl, anchorName);

			// might not have been initialized
			tooltipEl?.removeEventListener("mouseenter", schedule_show);
			tooltipEl?.removeEventListener("mouseleave", schedule_hide);
			tooltipEl?.remove();

			clear_both();
		};
	});
}
