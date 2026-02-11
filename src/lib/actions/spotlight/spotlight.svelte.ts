import { mount, unmount } from "svelte";
import { twMerge } from "../../utils/tw-merge.js";
import { addAnchorName, removeAnchorName } from "../../utils/anchor-name.js";
import { BodyScroll } from "../../utils/body-scroll-locker.js";
import type { THC } from "../../components/Thc/Thc.svelte";
import SpotlightContent from "./SpotlightContent.svelte";

//

const TRANSITION = 200;

// Reactive state tracking which spotlights are open by ID
const spotlightOpenStates: Record<string, boolean> = $state({});

// Registry of spotlights by ID for programmatic control
const spotlightRegistry = new Map<
	string,
	{
		show: () => void;
		hide: () => void;
	}
>();

/**
 * Show a spotlight by its registered ID.
 *
 * @param id - The spotlight ID to show
 *
 * @example
 * ```ts
 * showSpotlight('onboarding-step-1');
 * ```
 */
export function showSpotlight(id: string) {
	spotlightRegistry.get(id)?.show();
}

/**
 * Hide a spotlight by its registered ID.
 *
 * @param id - The spotlight ID to hide
 */
export function hideSpotlight(id: string) {
	spotlightRegistry.get(id)?.hide();
}

/**
 * Check if a spotlight is currently open by its registered ID.
 *
 * @param id - The spotlight ID to check
 * @returns true if the spotlight is open, false otherwise
 */
export function isSpotlightOpen(id: string): boolean {
	return spotlightOpenStates[id] ?? false;
}

/**
 * Checks if the browser supports CSS Anchor Positioning for annotation placement.
 */
function isAnchorPositioningSupported() {
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

const _classAnnotation = `
	bg-(--stuic-spotlight-annotation-bg) text-(--stuic-spotlight-annotation-text)
	shadow-lg rounded-md
	border border-(--stuic-spotlight-annotation-border)
	z-50
`;

/**
 * Valid positions for annotation placement relative to the spotlight target.
 */
export type SpotlightPosition =
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
 * Options for the spotlight action.
 */
export interface SpotlightOptions {
	/** Whether the spotlight is enabled */
	enabled?: boolean;
	/** Annotation content (THC format: string, {text}, {html}, {component, props}, {snippet}, or Snippet) */
	content?: THC | null;
	/** Preferred position of the annotation relative to the target */
	position?: SpotlightPosition;
	/** Padding around the target in the cutout (px) */
	padding?: number;
	/** Border radius of the cutout hole (px) */
	borderRadius?: number;
	/** Custom class for the annotation container */
	class?: string;
	/** Custom class for the backdrop overlay */
	classBackdrop?: string;
	/** Offset/margin of the annotation from the target (CSS value, e.g., "0.5rem") */
	offset?: string;
	/** Close on Escape key */
	closeOnEscape?: boolean;
	/** Close on click on the backdrop (outside the target hole) */
	closeOnBackdropClick?: boolean;
	/** Scroll target into view before showing */
	scrollIntoView?: boolean;
	/** Callback when spotlight opens */
	onShow?: () => void;
	/** Callback when spotlight hides */
	onHide?: () => void;
	/** Programmatically control open state (reactive) */
	open?: boolean;
	/** Unique ID for registry-based programmatic control */
	id?: string;
	/** Debug mode */
	debug?: boolean;
}

/**
 * Builds the clip-path value for the backdrop overlay with a rounded-rectangle hole.
 */
function buildClipPath(rect: DOMRect, padding: number, borderRadius: number): string {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const x = rect.left - padding;
	const y = rect.top - padding;
	const w = rect.width + padding * 2;
	const h = rect.height + padding * 2;
	const r = Math.min(borderRadius, w / 2, h / 2);

	if (r <= 0) {
		// Simple rectangular hole (no rounding)
		return `polygon(evenodd, 0 0, ${vw}px 0, ${vw}px ${vh}px, 0 ${vh}px, 0 0, ${x}px ${y}px, ${x}px ${y + h}px, ${x + w}px ${y + h}px, ${x + w}px ${y}px, ${x}px ${y}px)`;
	}

	// Rounded rectangular hole using SVG path syntax
	return `path(evenodd, "M 0 0 L ${vw} 0 L ${vw} ${vh} L 0 ${vh} Z M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z")`;
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
 * A Svelte action that highlights a target element with a spotlight effect.
 *
 * Creates a dimmed backdrop overlay with a cutout hole around the target element,
 * optionally showing annotation content positioned next to it. Useful for onboarding
 * tutorials, feature tours, and drawing attention to specific UI elements.
 *
 * The cutout uses `clip-path` with an SVG path, so pointer events in the hole area
 * pass through to the target element naturally.
 *
 * @param targetEl - The element to spotlight
 * @param fn - Function returning spotlight options (reactive)
 *
 * @example
 * ```svelte
 * <!-- Basic usage with programmatic control -->
 * <button
 *   use:spotlight={() => ({
 *     content: "Click here to get started!",
 *     position: "bottom",
 *     id: "intro-step-1",
 *   })}
 * >
 *   Get Started
 * </button>
 *
 * <button onclick={() => showSpotlight('intro-step-1')}>
 *   Start Tour
 * </button>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Reactive open control -->
 * <div use:spotlight={() => ({
 *   content: { component: TourStep, props: { step: 1 } },
 *   position: "right",
 *   open: showTour,
 *   onHide: () => showTour = false,
 * })}>
 *   Target content
 * </div>
 * ```
 */
export function spotlight(targetEl: HTMLElement, fn?: () => SpotlightOptions) {
	const isSupported = isAnchorPositioningSupported();

	// State
	let backdropEl: HTMLDivElement | null = null;
	let annotationEl: HTMLDivElement | null = null;
	let anchorEl: HTMLDivElement | null = null; // invisible anchor for CSS Anchor Positioning
	let mountedComponent: ReturnType<typeof mount> | null = null;
	let isVisible = false;
	let do_debug = false;
	let prevOpen: boolean | undefined = undefined;
	let resizeObserver: ResizeObserver | null = null;

	// Unique identifiers
	const rnd = Math.random().toString(36).slice(2);
	const anchorName = `--anchor-spotlight-${rnd}`;

	// Current options
	let currentOptions: SpotlightOptions = {};

	const debug = (...args: unknown[]) => {
		if (do_debug) console.debug("[spotlight]", rnd, ...args);
	};

	function onEscape(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			hide();
		}
	}

	function onBackdropClick(e: MouseEvent) {
		// Only close if clicking the backdrop itself (not the annotation or the hole)
		if (e.target === backdropEl) {
			hide();
		}
	}

	/**
	 * Update the clip-path hole position to match the current target rect.
	 */
	function updateHolePosition() {
		if (!backdropEl || !isVisible) return;

		const rect = targetEl.getBoundingClientRect();
		const padding = currentOptions.padding ?? 8;
		const borderRadius = currentOptions.borderRadius ?? 8;

		debug("updateHolePosition()", rect);

		backdropEl.style.clipPath = buildClipPath(rect, padding, borderRadius);

		// Update the invisible anchor element position
		if (anchorEl) {
			anchorEl.style.left = `${rect.left - padding}px`;
			anchorEl.style.top = `${rect.top - padding}px`;
			anchorEl.style.width = `${rect.width + padding * 2}px`;
			anchorEl.style.height = `${rect.height + padding * 2}px`;
		}

		// Update fallback annotation position
		if (annotationEl && !isSupported) {
			positionAnnotationFallback(rect, padding);
		}
	}

	/**
	 * Position annotation without CSS Anchor Positioning (fallback).
	 */
	function positionAnnotationFallback(rect: DOMRect, padding: number) {
		if (!annotationEl) return;

		const pos = currentOptions.position || "bottom";
		const offset = 8; // px fallback offset
		const x = rect.left - padding;
		const y = rect.top - padding;
		const w = rect.width + padding * 2;
		const h = rect.height + padding * 2;

		// Reset position
		annotationEl.style.left = "";
		annotationEl.style.top = "";
		annotationEl.style.right = "";
		annotationEl.style.bottom = "";

		if (pos.startsWith("top")) {
			annotationEl.style.left = `${x}px`;
			annotationEl.style.bottom = `${window.innerHeight - y + offset}px`;
		} else if (pos.startsWith("bottom")) {
			annotationEl.style.left = `${x}px`;
			annotationEl.style.top = `${y + h + offset}px`;
		} else if (pos === "left") {
			annotationEl.style.right = `${window.innerWidth - x + offset}px`;
			annotationEl.style.top = `${y}px`;
		} else if (pos === "right") {
			annotationEl.style.left = `${x + w + offset}px`;
			annotationEl.style.top = `${y}px`;
		}
	}

	function renderContent() {
		if (!annotationEl || !currentOptions.content) return;

		debug("renderContent()");

		if (mountedComponent) {
			unmount(mountedComponent);
			mountedComponent = null;
		}

		annotationEl.innerHTML = "";

		const content = currentOptions.content;

		if (isSimpleContent(content)) {
			annotationEl.innerHTML = getStringContent(content);
		} else {
			mountedComponent = mount(SpotlightContent, {
				target: annotationEl,
				props: { thc: content as THC },
			});
		}
	}

	function show() {
		debug("show()", {
			enabled: currentOptions.enabled,
			content: currentOptions.content,
		});

		if (!currentOptions.enabled) return;
		if (isVisible) return;

		isVisible = true;
		if (currentOptions.id) {
			spotlightOpenStates[currentOptions.id] = true;
		}

		const padding = currentOptions.padding ?? 8;
		const borderRadius = currentOptions.borderRadius ?? 8;
		const offsetValue = currentOptions.offset || "0.5rem";

		// Optionally scroll target into view
		if (currentOptions.scrollIntoView !== false) {
			targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
		}

		// Wait for potential scroll to settle before measuring
		requestAnimationFrame(() => {
			if (!isVisible) return; // may have been hidden in the meantime

			const rect = targetEl.getBoundingClientRect();

			// 1. Create backdrop overlay
			backdropEl = document.createElement("div");
			backdropEl.style.cssText = `
				position: fixed;
				inset: 0;
				z-index: 50;
				background: var(--stuic-spotlight-backdrop-bg);
				transition-duration: ${TRANSITION}ms;
			`;
			backdropEl.classList.add(
				...twMerge(
					"stuic-spotlight-backdrop",
					currentOptions.classBackdrop
				).split(/\s/)
			);
			backdropEl.style.clipPath = buildClipPath(rect, padding, borderRadius);
			document.body.appendChild(backdropEl);

			// 2. Create invisible anchor element for CSS Anchor Positioning
			anchorEl = document.createElement("div");
			anchorEl.style.cssText = `
				position: fixed;
				left: ${rect.left - padding}px;
				top: ${rect.top - padding}px;
				width: ${rect.width + padding * 2}px;
				height: ${rect.height + padding * 2}px;
				pointer-events: none;
				z-index: -1;
			`;
			addAnchorName(anchorEl, anchorName);
			document.body.appendChild(anchorEl);

			// 3. Create annotation element (if content provided)
			if (currentOptions.content) {
				annotationEl = document.createElement("div");
				annotationEl.setAttribute("role", "dialog");

				if (isSupported) {
					annotationEl.style.cssText = `
						position: fixed;
						position-anchor: ${anchorName};
						position-area: ${POSITION_MAP[currentOptions.position || "bottom"] || "bottom"};
						transition-duration: ${TRANSITION}ms;
						margin: ${offsetValue};
						z-index: 50;
					`;
					annotationEl.classList.add(
						...twMerge(
							"stuic-spotlight-annotation",
							_classAnnotation,
							currentOptions.class
						).split(/\s/)
					);
				} else {
					// Fallback positioning
					annotationEl.style.cssText = `
						position: fixed;
						transition-duration: ${TRANSITION}ms;
						z-index: 50;
						max-width: 90vw;
					`;
					annotationEl.classList.add(
						...twMerge(
							"stuic-spotlight-annotation-fallback",
							_classAnnotation,
							currentOptions.class
						).split(/\s/)
					);
					positionAnnotationFallback(rect, padding);
				}

				document.body.appendChild(annotationEl);
				renderContent();
			}

			// 4. Lock body scroll
			BodyScroll.lock();

			// 5. Transition in
			requestAnimationFrame(() => {
				backdropEl?.classList.add("spot-visible");
				if (annotationEl) {
					annotationEl.classList.add("spot-block");
					requestAnimationFrame(() => {
						annotationEl?.classList.add("spot-visible");
					});
				}
				currentOptions.onShow?.();
			});

			// 6. Event listeners
			if (currentOptions.closeOnEscape !== false) {
				document.addEventListener("keydown", onEscape);
			}
			if (currentOptions.closeOnBackdropClick !== false) {
				backdropEl.addEventListener("click", onBackdropClick);
			}

			// 7. Watch for target position changes
			resizeObserver = new ResizeObserver(updateHolePosition);
			resizeObserver.observe(targetEl);
			window.addEventListener("resize", updateHolePosition);
			window.addEventListener("scroll", updateHolePosition, true);
		});
	}

	function hide() {
		debug("hide()");

		if (!isVisible) return;
		isVisible = false;
		if (currentOptions.id) {
			spotlightOpenStates[currentOptions.id] = false;
		}

		// Remove event listeners
		document.removeEventListener("keydown", onEscape);
		window.removeEventListener("resize", updateHolePosition);
		window.removeEventListener("scroll", updateHolePosition, true);
		resizeObserver?.disconnect();
		resizeObserver = null;

		// Unlock body scroll
		BodyScroll.unlock();

		// Transition out
		backdropEl?.classList.remove("spot-visible");
		annotationEl?.classList.remove("spot-visible");

		setTimeout(() => {
			if (mountedComponent) {
				unmount(mountedComponent);
				mountedComponent = null;
			}

			if (anchorEl) {
				removeAnchorName(anchorEl, anchorName);
				anchorEl.remove();
				anchorEl = null;
			}

			backdropEl?.remove();
			annotationEl?.remove();
			backdropEl = null;
			annotationEl = null;

			currentOptions.onHide?.();
		}, TRANSITION);
	}

	// Reactive params effect
	$effect(() => {
		const opts = fn?.() || {};

		currentOptions = {
			enabled: opts.enabled ?? true,
			content: opts.content,
			position: opts.position || "bottom",
			padding: opts.padding ?? 8,
			borderRadius: opts.borderRadius ?? 8,
			class: opts.class,
			classBackdrop: opts.classBackdrop,
			offset: opts.offset,
			closeOnEscape: opts.closeOnEscape ?? true,
			closeOnBackdropClick: opts.closeOnBackdropClick ?? true,
			scrollIntoView: opts.scrollIntoView ?? true,
			onShow: opts.onShow,
			onHide: opts.onHide,
			debug: opts.debug,
			id: opts.id,
		};

		do_debug = !!opts.debug;

		// Register in global registry if id provided
		if (opts.id) {
			spotlightRegistry.set(opts.id, { show, hide });
		}

		// Update if visible
		if (isVisible) {
			updateHolePosition();
			if (annotationEl && isSupported) {
				annotationEl.style.setProperty(
					"position-area",
					POSITION_MAP[currentOptions.position || "bottom"] || "bottom"
				);
			}
			if (currentOptions.content) {
				renderContent();
			}
		}

		// Handle programmatic open/close
		const openValue = opts.open;
		if (openValue !== undefined && openValue !== prevOpen) {
			if (openValue && !isVisible) {
				show();
			} else if (!openValue && isVisible) {
				hide();
			}
		}
		prevOpen = openValue;
	});

	// Cleanup effect
	$effect(() => {
		return () => {
			// Cleanup on unmount
			if (mountedComponent) {
				unmount(mountedComponent);
				mountedComponent = null;
			}

			if (isVisible) {
				BodyScroll.unlock();
			}

			if (anchorEl) {
				removeAnchorName(anchorEl, anchorName);
				anchorEl.remove();
			}

			backdropEl?.remove();
			annotationEl?.remove();
			resizeObserver?.disconnect();

			document.removeEventListener("keydown", onEscape);
			window.removeEventListener("resize", updateHolePosition);
			window.removeEventListener("scroll", updateHolePosition, true);

			// Unregister from registry
			if (currentOptions.id) {
				spotlightRegistry.delete(currentOptions.id);
				delete spotlightOpenStates[currentOptions.id];
			}
		};
	});
}
