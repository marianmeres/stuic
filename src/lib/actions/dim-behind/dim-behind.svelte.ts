import { BodyScroll } from "../../utils/body-scroll-locker.js";
import { resolveContainerOption } from "../../utils/overlay-container.js";

// --- Shared Backdrop Manager (one ref-counted backdrop per container) ---

const backdrops = new Map<HTMLElement, { el: HTMLDivElement; count: number }>();

const TRANSITION_SAFETY_MARGIN = 50;

/**
 * Actual transition duration of the backdrop element in ms — read from its
 * computed style, which resolves the whole var chain
 * (`--stuic-dim-behind-transition-duration`, `--stuic-transition`, …), unlike
 * reading a single custom property off the root. Computed values serialize in
 * seconds ("0.15s").
 */
function getTransitionDurationMs(el: HTMLElement): number {
	const raw = getComputedStyle(el).transitionDuration;
	const v = parseFloat(raw);
	if (!Number.isFinite(v) || v < 0) return 150;
	return raw.trim().endsWith("ms") ? v : v * 1000;
}

function getElementZIndex(): string {
	return (
		getComputedStyle(document.documentElement)
			.getPropertyValue("--stuic-dim-behind-element-z-index")
			.trim() || "41"
	);
}

function showBackdrop(container: HTMLElement, classBackdrop?: string): HTMLDivElement {
	let entry = backdrops.get(container);
	if (!entry) {
		const el = document.createElement("div");
		el.classList.add("stuic-dim-behind-backdrop");
		if (classBackdrop) {
			el.classList.add(...classBackdrop.split(/\s+/).filter(Boolean));
		}
		container.appendChild(el);
		// Force reflow for transition
		void el.offsetHeight;
		el.classList.add("dim-visible");
		entry = { el, count: 0 };
		backdrops.set(container, entry);
	}
	entry.count++;
	return entry.el;
}

function hideBackdrop(container: HTMLElement) {
	const entry = backdrops.get(container);
	if (!entry) return;
	entry.count = Math.max(0, entry.count - 1);
	if (entry.count === 0) {
		// Drop the registry entry immediately so a show() during the fade-out
		// creates a fresh backdrop instead of resurrecting the dying one.
		backdrops.delete(container);
		const el = entry.el;
		el.classList.remove("dim-visible");
		const cleanup = () => el.remove();
		el.addEventListener("transitionend", cleanup, { once: true });
		// Safety fallback in case transitionend doesn't fire
		setTimeout(cleanup, getTransitionDurationMs(el) + TRANSITION_SAFETY_MARGIN);
	}
}

// --- Registry ---

const dimBehindOpenStates: Record<string, boolean> = $state({});

const dimBehindRegistry = new Map<
	string,
	{
		show: () => void;
		hide: () => void;
	}
>();

/**
 * Show a dim-behind effect by its registered ID.
 *
 * @param id - The dimBehind ID to activate
 *
 * @example
 * ```ts
 * showDimBehind('highlight-cta');
 * ```
 */
export function showDimBehind(id: string) {
	dimBehindRegistry.get(id)?.show();
}

/**
 * Hide a dim-behind effect by its registered ID.
 *
 * @param id - The dimBehind ID to deactivate
 */
export function hideDimBehind(id: string) {
	dimBehindRegistry.get(id)?.hide();
}

/**
 * Check if a dim-behind effect is currently active by its registered ID.
 *
 * @param id - The dimBehind ID to check
 * @returns true if the dim-behind effect is active
 */
export function isDimBehindOpen(id: string): boolean {
	return dimBehindOpenStates[id] ?? false;
}

// --- Options ---

/**
 * Options for the dimBehind action.
 */
export interface DimBehindOptions {
	/** Programmatically control active state (reactive) */
	open?: boolean;
	/** Whether the dim effect can be activated (default: true) */
	enabled?: boolean;
	/** Unique ID for registry-based programmatic control */
	id?: string;
	/** Per-instance z-index for the elevated element (overrides CSS token) */
	zIndex?: number;
	/** Lock body scroll while dimmed (default: false) */
	scrollLock?: boolean;
	/** Close on Escape key (default: true) */
	closeOnEscape?: boolean;
	/** Close when backdrop is clicked (default: true) */
	closeOnBackdropClick?: boolean;
	/** Custom CSS class for the backdrop element */
	classBackdrop?: string;
	/** Callback when dim effect activates */
	onShow?: () => void;
	/** Callback when dim effect deactivates */
	onHide?: () => void;
	/** Debug mode */
	debug?: boolean;
	/**
	 * Where to append the backdrop. Defaults to the current behavior:
	 * `document.body`. Pass a bounded shell (framed app, embedded widget,
	 * dashboard pane) to keep the backdrop inside it — required when that shell
	 * is a stacking context, since the elevated target's z-index can then only
	 * compete with a backdrop living in the same context. Each distinct
	 * container gets its own ref-counted backdrop. A function returning `null`
	 * falls back to the default.
	 */
	container?: HTMLElement | (() => HTMLElement | null);
}

// --- Action ---

/**
 * A Svelte action that dims everything behind a target element.
 *
 * Creates a shared backdrop overlay and elevates the target element above it via z-index.
 * A simplified alternative to `spotlight` — no cutout hole, no annotations. Useful for
 * drawing attention to a specific element by dimming the rest of the page.
 *
 * Multiple elements can use dimBehind simultaneously — the backdrop is a singleton with
 * reference counting, while all elevated elements remain above it.
 *
 * @param node - The element to elevate above the backdrop
 * @param fn - Function returning dimBehind options (reactive via $effect)
 *
 * @example
 * ```svelte
 * <!-- Reactive control -->
 * <div use:dimBehind={() => ({ open: isDimmed, onHide: () => isDimmed = false })}>
 *   This element floats above the dimmed backdrop
 * </div>
 * ```
 *
 * @example
 * ```svelte
 * <!-- Programmatic control via ID -->
 * <div use:dimBehind={() => ({ id: 'highlight-cta' })}>
 *   Call to Action
 * </div>
 * <button onclick={() => showDimBehind('highlight-cta')}>Highlight</button>
 * ```
 */
export function dimBehind(node: HTMLElement, fn?: () => DimBehindOptions) {
	// State
	let isVisible = false;
	let prevOpen: boolean | undefined = undefined;
	let savedPosition = "";
	let savedZIndex = "";
	let currentOptions: DimBehindOptions = {};
	let do_debug = false;
	// The container/backdrop/locks this instance acquired — captured at show()
	// time so hide() releases exactly what was acquired even if options changed
	// while visible.
	let myContainer: HTMLElement | null = null;
	let myBackdropEl: HTMLDivElement | null = null;
	let myScrollLocked = false;

	const debug = (...args: unknown[]) => {
		if (do_debug) console.debug("[dimBehind]", ...args);
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
		if (e.target === myBackdropEl) {
			hide();
		}
	}

	function show() {
		if (isVisible) return;
		if (!currentOptions.enabled) return;

		debug("show()");
		isVisible = true;

		if (currentOptions.id) {
			dimBehindOpenStates[currentOptions.id] = true;
		}

		// Save original styles
		savedPosition = node.style.position;
		savedZIndex = node.style.zIndex;

		// Elevate node above backdrop
		const zIndex =
			currentOptions.zIndex !== undefined
				? String(currentOptions.zIndex)
				: getElementZIndex();
		node.style.position = "relative";
		node.style.zIndex = zIndex;

		// Show the (per-container, ref-counted) shared backdrop
		myContainer = resolveContainerOption(currentOptions.container) ?? document.body;
		myBackdropEl = showBackdrop(myContainer, currentOptions.classBackdrop);

		// Optional scroll lock
		if (currentOptions.scrollLock) {
			BodyScroll.lock();
			myScrollLocked = true;
		}

		// Event listeners
		if (currentOptions.closeOnEscape !== false) {
			document.addEventListener("keydown", onEscape);
		}
		if (currentOptions.closeOnBackdropClick !== false) {
			myBackdropEl.addEventListener("click", onBackdropClick);
		}

		currentOptions.onShow?.();
	}

	function hide() {
		if (!isVisible) return;

		debug("hide()");
		isVisible = false;

		if (currentOptions.id) {
			dimBehindOpenStates[currentOptions.id] = false;
		}

		// Restore original styles
		node.style.position = savedPosition;
		node.style.zIndex = savedZIndex;

		// Remove event listeners
		document.removeEventListener("keydown", onEscape);
		myBackdropEl?.removeEventListener("click", onBackdropClick);

		// Release the scroll lock iff THIS instance acquired one (the option may
		// have changed while visible)
		if (myScrollLocked) {
			BodyScroll.unlock();
			myScrollLocked = false;
		}

		// Release the shared backdrop
		if (myContainer) hideBackdrop(myContainer);
		myContainer = null;
		myBackdropEl = null;

		currentOptions.onHide?.();
	}

	// Reactive params effect
	$effect(() => {
		const opts = fn?.() || {};

		currentOptions = {
			open: opts.open,
			enabled: opts.enabled ?? true,
			id: opts.id,
			zIndex: opts.zIndex,
			scrollLock: opts.scrollLock ?? false,
			closeOnEscape: opts.closeOnEscape ?? true,
			closeOnBackdropClick: opts.closeOnBackdropClick ?? true,
			classBackdrop: opts.classBackdrop,
			onShow: opts.onShow,
			onHide: opts.onHide,
			debug: opts.debug,
			container: opts.container,
		};

		do_debug = !!opts.debug;

		// Register in global registry if id provided
		if (opts.id) {
			dimBehindRegistry.set(opts.id, { show, hide });
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
			if (isVisible) {
				node.style.position = savedPosition;
				node.style.zIndex = savedZIndex;

				if (myScrollLocked) {
					BodyScroll.unlock();
					myScrollLocked = false;
				}

				myBackdropEl?.removeEventListener("click", onBackdropClick);
				if (myContainer) hideBackdrop(myContainer);
				myContainer = null;
				myBackdropEl = null;

				document.removeEventListener("keydown", onEscape);
			}

			// Unregister from registry
			if (currentOptions.id) {
				dimBehindRegistry.delete(currentOptions.id);
				delete dimBehindOpenStates[currentOptions.id];
			}
		};
	});
}
