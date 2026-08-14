import { mount, unmount } from "svelte";
import { twMerge } from "../../utils/tw-merge.js";
import { addAnchorName, removeAnchorName } from "../../utils/anchor-name.js";
import {
	buildPositionTryFallbacks,
	clampIntoViewport,
} from "../../utils/anchor-position.js";
import { BodyScroll } from "../../utils/body-scroll-locker.js";
import { resolveContainerOption } from "../../utils/overlay-container.js";
import type { THC } from "../../components/Thc/Thc.svelte";
import SpotlightContent from "./SpotlightContent.svelte";

//

const TRANSITION = 200;

// Reactive state tracking which spotlights are open by ID
const spotlightOpenStates: Record<string, boolean> = $state({});

/**
 * Imperative handle for a registered spotlight.
 */
export interface SpotlightControl {
	show: () => void;
	hide: () => void;
	reposition: () => void;
}

// Registry of spotlights by ID for programmatic control
const spotlightRegistry = new Map<string, SpotlightControl>();

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
 * Force a registered spotlight to re-measure its target and reposition the
 * clip-path hole, anchor, and annotation. Useful after layout shifts that
 * auto-tracking cannot observe (or when `autoTrack` is disabled).
 *
 * @param id - The spotlight ID to reposition
 *
 * @example
 * ```ts
 * // after toggling a collapsible sibling
 * requestAnimationFrame(() => repositionSpotlight('onboarding-step-1'));
 * ```
 */
export function repositionSpotlight(id: string) {
	spotlightRegistry.get(id)?.reposition();
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
	/**
	 * Keep the spotlight glued to its target by running a per-frame
	 * `requestAnimationFrame` compare-loop while visible. Catches layout
	 * shifts that `ResizeObserver` + window resize/scroll miss — e.g. a
	 * sibling collapsing in a flex/grid row and pushing the target sideways.
	 *
	 * The loop reads `getBoundingClientRect()` once per frame and only calls
	 * the internal reposition when the rect actually changed, so cost while
	 * idle is negligible. Set to `false` to keep the old behavior.
	 *
	 * Default: `true`.
	 */
	autoTrack?: boolean;
	/** Debug mode */
	debug?: boolean;
	/**
	 * Where to append the overlay elements (backdrop, anchor, annotation).
	 * Defaults to the current behavior: `document.body`. Pass a bounded shell
	 * (framed app, embedded widget, dashboard pane) to keep the overlay inside
	 * it — required when that shell is a stacking context, since a body-level
	 * overlay can then only paint entirely above or entirely below it. A
	 * function returning `null` falls back to the default.
	 */
	container?: HTMLElement | (() => HTMLElement | null);
}

/**
 * The coordinate space the overlay's `position: fixed` elements resolve
 * against: the viewport by default, or the padding box of a containing-block
 * ancestor when the overlay is portalled inside one. `left`/`top` are viewport
 * (visual) coordinates of its origin; `width`/`height` are LAYOUT-space size
 * (what `clip-path` and `left/top` px writes are expressed in); `scaleX/Y`
 * convert visual rect px into layout px (≠ 1 inside a scaled ancestor).
 */
interface OverlayOrigin {
	left: number;
	top: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
}

const VIEWPORT_ORIGIN = (): OverlayOrigin => ({
	left: 0,
	top: 0,
	width: window.innerWidth,
	height: window.innerHeight,
	scaleX: 1,
	scaleY: 1,
});

/**
 * Builds the clip-path value for the backdrop overlay with a rounded-rectangle
 * hole. `rect` is the target's viewport rect; `o` is the backdrop's own
 * coordinate space (see {@link OverlayOrigin}) — clip-path coordinates are
 * local to the backdrop element, so the hole is translated by the origin and
 * the outer box is the backdrop's layout size.
 */
function buildClipPath(
	rect: DOMRect,
	padding: number,
	borderRadius: number,
	o: OverlayOrigin
): string {
	const ow = o.width;
	const oh = o.height;
	const x = (rect.left - o.left) / o.scaleX - padding;
	const y = (rect.top - o.top) / o.scaleY - padding;
	const w = rect.width / o.scaleX + padding * 2;
	const h = rect.height / o.scaleY + padding * 2;
	const r = Math.min(borderRadius, w / 2, h / 2);

	if (r <= 0) {
		// Simple rectangular hole (no rounding)
		return `polygon(evenodd, 0 0, ${ow}px 0, ${ow}px ${oh}px, 0 ${oh}px, 0 0, ${x}px ${y}px, ${x}px ${y + h}px, ${x + w}px ${y + h}px, ${x + w}px ${y}px, ${x}px ${y}px)`;
	}

	// Rounded rectangular hole using SVG path syntax
	return `path(evenodd, "M 0 0 L ${ow} 0 L ${ow} ${oh} L 0 ${oh} Z M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z")`;
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
	let rafId: number | null = null;
	let lastRect: DOMRect | null = null;
	// True once the annotation is display:block and laid out — gates the
	// viewport clamp so it never measures a `display:none` element (zeros).
	let annotationShown = false;

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
	 * The coordinate space the overlay's fixed elements resolve against. The
	 * backdrop is `position: fixed; inset: 0`, so its own box IS that space —
	 * the containing block's padding box when a CB-forming ancestor exists
	 * (overlay portalled into a contained/transformed shell via `container`),
	 * the viewport otherwise. Measuring it handles both with no special-casing.
	 */
	function overlayOrigin(): OverlayOrigin {
		if (!backdropEl) return VIEWPORT_ORIGIN();
		const r = backdropEl.getBoundingClientRect();
		// offsetWidth/Height are layout-space; the rect is visual — the ratio is
		// the accumulated ancestor scale. offset* are integer-rounded, so treat
		// sub-pixel differences as "unscaled" to avoid noise on the default path.
		const w = backdropEl.offsetWidth || r.width;
		const h = backdropEl.offsetHeight || r.height;
		const sx = w && Math.abs(r.width - w) > 1 ? r.width / w : 1;
		const sy = h && Math.abs(r.height - h) > 1 ? r.height / h : 1;
		return { left: r.left, top: r.top, width: w, height: h, scaleX: sx, scaleY: sy };
	}

	/** Place the invisible anchor element over the (padded) hole. */
	function positionAnchor(rect: DOMRect, padding: number, o: OverlayOrigin) {
		if (!anchorEl) return;
		anchorEl.style.left = `${(rect.left - o.left) / o.scaleX - padding}px`;
		anchorEl.style.top = `${(rect.top - o.top) / o.scaleY - padding}px`;
		anchorEl.style.width = `${rect.width / o.scaleX + padding * 2}px`;
		anchorEl.style.height = `${rect.height / o.scaleY + padding * 2}px`;
	}

	/**
	 * Update the clip-path hole position to match the current target rect.
	 */
	function updateHolePosition() {
		if (!backdropEl || !isVisible) return;

		const rect = targetEl.getBoundingClientRect();
		const padding = currentOptions.padding ?? 8;
		const borderRadius = currentOptions.borderRadius ?? 8;
		const o = overlayOrigin();

		debug("updateHolePosition()", rect);

		backdropEl.style.clipPath = buildClipPath(rect, padding, borderRadius, o);

		// Update the invisible anchor element position
		positionAnchor(rect, padding, o);

		// Reposition / re-clamp the annotation. The fallback path recomputes its
		// base left/top here; the anchor path is re-placed by the browser. Either
		// way we re-clamp so an edge-anchored annotation stays on-screen as the
		// target moves (the anchor path has no built-in viewport clamping).
		if (annotationEl) {
			if (!isSupported) positionAnnotationFallback(rect, padding);
			clampAnnotationIntoViewport();
		}
	}

	/**
	 * Per-frame loop that re-measures the target and reposition the hole/anchor
	 * if the rect diverges from the last-seen rect. This catches movement that
	 * `ResizeObserver` (size only) and window resize/scroll (viewport only) miss
	 * — e.g. a sibling element collapsing in a flex/grid row and pushing the
	 * target sideways.
	 */
	function trackFrame() {
		if (!isVisible) {
			rafId = null;
			return;
		}
		const r = targetEl.getBoundingClientRect();
		if (
			!lastRect ||
			r.left !== lastRect.left ||
			r.top !== lastRect.top ||
			r.width !== lastRect.width ||
			r.height !== lastRect.height
		) {
			lastRect = r;
			updateHolePosition();
		}
		rafId = requestAnimationFrame(trackFrame);
	}

	function startAutoTrack() {
		if (rafId != null) return;
		lastRect = targetEl.getBoundingClientRect();
		rafId = requestAnimationFrame(trackFrame);
	}

	function stopAutoTrack() {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		lastRect = null;
	}

	/**
	 * Position annotation without CSS Anchor Positioning (fallback). All values
	 * are expressed in the overlay's coordinate space (see {@link overlayOrigin})
	 * — for a fixed element, `left/top/right/bottom` resolve against the
	 * containing block, which is the viewport only in the un-portalled default.
	 */
	function positionAnnotationFallback(rect: DOMRect, padding: number) {
		if (!annotationEl) return;

		const pos = currentOptions.position || "bottom";
		const offset = 8; // px fallback offset
		const o = overlayOrigin();
		const x = (rect.left - o.left) / o.scaleX - padding;
		const y = (rect.top - o.top) / o.scaleY - padding;
		const w = rect.width / o.scaleX + padding * 2;
		const h = rect.height / o.scaleY + padding * 2;

		// Reset position
		annotationEl.style.left = "";
		annotationEl.style.top = "";
		annotationEl.style.right = "";
		annotationEl.style.bottom = "";
		annotationEl.style.transform = "";

		if (pos.startsWith("top")) {
			annotationEl.style.left = `${x}px`;
			annotationEl.style.bottom = `${o.height - y + offset}px`;
		} else if (pos.startsWith("bottom")) {
			annotationEl.style.left = `${x}px`;
			annotationEl.style.top = `${y + h + offset}px`;
		} else if (pos === "left") {
			annotationEl.style.right = `${o.width - x + offset}px`;
			annotationEl.style.top = `${y}px`;
		} else if (pos === "right") {
			annotationEl.style.left = `${x + w + offset}px`;
			annotationEl.style.top = `${y}px`;
		}

		// Viewport clamping is handled by clampAnnotationIntoViewport(), called by
		// the caller once the annotation is laid out (and on every reposition).
	}

	/**
	 * Clamp the annotation into the viewport, on BOTH positioning paths. The CSS
	 * Anchor Positioning path has no built-in way to slide a centered annotation
	 * back on-screen when the target is near a viewport edge (visible on Android
	 * Chrome, which supports anchor positioning; iOS Safari ≤18 takes the JS
	 * fallback path). Gated on `annotationShown` so it never measures a
	 * `display:none` element. See {@link clampIntoViewport}.
	 */
	function clampAnnotationIntoViewport() {
		if (!annotationEl || !annotationShown) return;
		// Pass the empirically measured CB rect (the inset-0 backdrop's box) so
		// the clamp uses the SAME coordinate space as the hole/anchor math even
		// where the heuristic ancestor walk and the engine disagree (WebKit
		// filter shells).
		clampIntoViewport(
			annotationEl,
			undefined,
			backdropEl ? backdropEl.getBoundingClientRect() : undefined
		);
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

			const container = resolveContainerOption(currentOptions.container) ?? document.body;
			const rect = targetEl.getBoundingClientRect();

			// 1. Create backdrop overlay. Append BEFORE building the clip-path:
			// the hole coordinates are relative to the backdrop's own box, which
			// is only measurable once it is in the DOM (same JS turn — nothing
			// paints unclipped).
			backdropEl = document.createElement("div");
			backdropEl.style.cssText = `
				position: fixed;
				inset: 0;
				z-index: 50;
				background: var(--stuic-spotlight-backdrop-bg);
				transition-duration: ${TRANSITION}ms;
			`;
			backdropEl.classList.add(
				...twMerge("stuic-spotlight-backdrop", currentOptions.classBackdrop).split(/\s/)
			);
			container.appendChild(backdropEl);
			const o = overlayOrigin();
			backdropEl.style.clipPath = buildClipPath(rect, padding, borderRadius, o);

			// 2. Create invisible anchor element for CSS Anchor Positioning
			anchorEl = document.createElement("div");
			anchorEl.style.cssText = `
				position: fixed;
				pointer-events: none;
				z-index: -1;
			`;
			positionAnchor(rect, padding, o);
			addAnchorName(anchorEl, anchorName);
			container.appendChild(anchorEl);

			// 3. Create annotation element (if content provided)
			if (currentOptions.content) {
				annotationEl = document.createElement("div");
				annotationEl.setAttribute("role", "dialog");

				if (isSupported) {
					// NOTE: keep `vw`/`vh` here — this is the ANCHORED branch, where
					// the element's containing block is the `position-area` region (a
					// slice of the CB, often much smaller), so `%` would shrink the
					// annotation. Overflow is handled by position-try + the CB-aware
					// clamp.
					annotationEl.style.cssText = `
						position: fixed;
						position-anchor: ${anchorName};
						position-area: ${POSITION_MAP[currentOptions.position || "bottom"] || "bottom"};
						position-try-fallbacks: ${buildPositionTryFallbacks(currentOptions.position || "bottom")};
						position-try-order: normal;
						max-width: calc(100vw - 1rem);
						max-height: calc(100vh - 1rem);
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
					// Fallback positioning. `90%` (not `90vw`): the left/top values
					// are containing-block-relative, so the size must be too.
					annotationEl.style.cssText = `
						position: fixed;
						transition-duration: ${TRANSITION}ms;
						z-index: 50;
						max-width: 90%;
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

				container.appendChild(annotationEl);
				renderContent();
			}

			// 4. Lock body scroll
			BodyScroll.lock();

			// 5. Transition in
			requestAnimationFrame(() => {
				backdropEl?.classList.add("spot-visible");
				if (annotationEl) {
					annotationEl.classList.add("spot-block");
					// Now display:block and laid out — clamp into the viewport before
					// it fades in. Applies to both the anchor and fallback paths.
					annotationShown = true;
					clampAnnotationIntoViewport();
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

			// 7. Watch for target position changes — and for the overlay's own
			// coordinate space changing size (the backdrop tracks its container,
			// which resize/scroll listeners and target-rect comparison won't see)
			resizeObserver = new ResizeObserver(updateHolePosition);
			resizeObserver.observe(targetEl);
			resizeObserver.observe(backdropEl);
			window.addEventListener("resize", updateHolePosition);
			window.addEventListener("scroll", updateHolePosition, true);

			// 8. Per-frame compare-loop to catch layout shifts (sibling collapses,
			//    animated ancestors, etc.) that the observers above don't see.
			if (currentOptions.autoTrack !== false) {
				startAutoTrack();
			}
		});
	}

	function hide() {
		debug("hide()");

		if (!isVisible) return;
		isVisible = false;
		annotationShown = false;
		if (currentOptions.id) {
			spotlightOpenStates[currentOptions.id] = false;
		}

		// Remove event listeners
		document.removeEventListener("keydown", onEscape);
		window.removeEventListener("resize", updateHolePosition);
		window.removeEventListener("scroll", updateHolePosition, true);
		resizeObserver?.disconnect();
		resizeObserver = null;
		stopAutoTrack();

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
			autoTrack: opts.autoTrack ?? true,
			onShow: opts.onShow,
			onHide: opts.onHide,
			debug: opts.debug,
			id: opts.id,
			container: opts.container,
		};

		do_debug = !!opts.debug;

		// Register in global registry if id provided
		if (opts.id) {
			spotlightRegistry.set(opts.id, {
				show,
				hide,
				reposition: updateHolePosition,
			});
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
			annotationShown = false;
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
			stopAutoTrack();

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
