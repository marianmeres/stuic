import { on } from "svelte/events";
import { watch } from "./watch.svelte.js";

export interface OnClickOutsideOptions {
	/**
	 * Start listening right away. Pass `false` and call `start()` yourself (e.g. only
	 * while a menu is open) to avoid a document listener per closed instance.
	 * @default true
	 */
	immediate?: boolean;
}

export interface OnClickOutsideController {
	/** Start listening (no-op if already listening). */
	start: () => void;
	/** Stop listening and drop any pending touch follow-up. */
	stop: () => void;
	/** Whether the handler is currently enabled (reactive). */
	readonly enabled: boolean;
}

/**
 * Calls `callback` when a primary-button `pointerdown` lands outside `container`.
 *
 * - Listens on the container's document in the bubble phase, so a `pointerdown` whose
 *   propagation was stopped before reaching the document (e.g. a dialog box calling
 *   `stopPropagation`) never counts as "outside" — that is how stacked dialogs avoid
 *   closing each other.
 * - Touch: the callback waits for the `click` that follows the tap, so a scroll or drag
 *   that starts outside does not fire it. Mouse and pen fire on `pointerdown` itself.
 * - A `pointerdown` whose target is the container itself (a `::before`/`::after`
 *   pseudo-element press) counts as outside only if the point is outside the
 *   container's box.
 * - Secondary buttons, detached targets and non-element targets are ignored.
 *
 * Must be called during component initialization (it sets up effects). Listeners are
 * removed on `stop()` and when the owning component is destroyed.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	let menu = $state<HTMLElement>();
 * 	let isOpen = $state(false);
 *
 * 	const clickOutside = onClickOutside(() => menu, () => (isOpen = false), {
 * 		immediate: false,
 * 	});
 *
 * 	$effect(() => {
 * 		if (isOpen && menu) clickOutside.start();
 * 		else clickOutside.stop();
 * 	});
 * </script>
 * ```
 */
export function onClickOutside<T extends Element = HTMLElement>(
	container: () => T | null | undefined,
	callback: (event: PointerEvent) => void,
	options: OnClickOutsideOptions = {}
): OnClickOutsideController {
	const { immediate = true } = options;

	let enabled = $state(immediate);
	const node = $derived(container());

	let removeListener: (() => void) | null = null;
	let removeTouchFollowUp: (() => void) | null = null;

	function clearTouchFollowUp() {
		removeTouchFollowUp?.();
		removeTouchFollowUp = null;
	}

	function listen(el: Element) {
		const doc = el.ownerDocument;
		return on(doc, "pointerdown", (e) => {
			// a new press supersedes a touch follow-up still waiting for its click
			clearTouchFollowUp();
			if (!isOutside(e, el)) return;

			if (e.pointerType === "touch") {
				// a tap completes with a click; a scroll or drag never does
				removeTouchFollowUp = on(
					doc,
					"click",
					() => {
						removeTouchFollowUp = null;
						callback(e);
					},
					{ once: true }
				);
			} else {
				callback(e);
			}
		});
	}

	function cleanup() {
		clearTouchFollowUp();
		removeListener?.();
		removeListener = null;
	}

	watch([() => enabled, () => node], ([isEnabled, el]) => {
		cleanup();
		if (isEnabled && el) removeListener = listen(el);
	});

	// component destroy
	$effect(() => cleanup);

	return {
		start: () => {
			enabled = true;
		},
		stop: () => {
			enabled = false;
		},
		get enabled() {
			return enabled;
		},
	};
}

function isOutside(e: PointerEvent, container: Element): boolean {
	// primary button only (a touch contact or pen tip reports 0 as well)
	if (e.button > 0) return false;

	const target = e.target;
	if (!(target instanceof Element)) return false;

	// a handler earlier in the chain may already have removed the target
	if (!container.ownerDocument.documentElement.contains(target)) return false;

	if (target === container) {
		// a press on the container's pseudo-element reports the container as the
		// target — decide by geometry
		const r = container.getBoundingClientRect();
		const inBox =
			r.left <= e.clientX &&
			e.clientX <= r.right &&
			r.top <= e.clientY &&
			e.clientY <= r.bottom;
		return !inBox;
	}

	return !container.contains(target);
}
