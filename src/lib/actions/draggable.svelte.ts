/**
 * Options for the {@link draggable} action.
 */
export interface DraggableOptions {
	/** Master switch. When `false` the action is inert. Default `true`. */
	enabled?: boolean;
	/**
	 * CSS selector for descendants that must NOT initiate a drag. A `pointerdown`
	 * whose target matches (via `closest`) is ignored — e.g. `"[data-no-drag]"`
	 * for buttons living inside an otherwise-draggable header.
	 */
	ignore?: string;
	/**
	 * Distance in px the pointer must travel before the gesture counts as a real
	 * drag (reported via `onEnd`'s `moved`). Used by consumers to distinguish a
	 * click/double-click from a drag. Default `3`.
	 */
	threshold?: number;
	/** Called on a valid drag start (pointer captured). */
	onStart?: (e: PointerEvent) => void;
	/**
	 * Called on every pointer move while dragging, with the cumulative delta from
	 * the drag's start point.
	 */
	onMove?: (delta: { dx: number; dy: number }, e: PointerEvent) => void;
	/** Called when the drag ends; `moved` is `true` if it passed `threshold`. */
	onEnd?: (info: { moved: boolean }, e: PointerEvent) => void;
}

/**
 * A Svelte action that turns an element into a drag handle and reports pointer
 * deltas — without taking any opinion on what gets moved. The consumer owns the
 * positioned element, clamping, and persistence; this action only translates
 * pointer gestures into `{dx, dy}` deltas.
 *
 * Built on Pointer Events with pointer capture, so a single code path covers
 * mouse, touch and pen, and the drag keeps tracking even if the pointer leaves
 * the element. Pair with `touch-action: none` on the handle to stop the browser
 * from scrolling/zooming mid-drag.
 *
 * @param node - The handle element.
 * @param fn - Function returning the current {@link DraggableOptions}.
 *
 * @example
 * ```svelte
 * <div
 *   use:draggable={() => ({
 *     ignore: "[data-no-drag]",
 *     onStart: () => (start = { ...pos }),
 *     onMove: ({ dx, dy }) => (pos = clamp(start.x + dx, start.y + dy)),
 *     onEnd: ({ moved }) => (wasDragged = moved),
 *   })}
 * >
 *   drag me
 * </div>
 * ```
 */
export function draggable(node: HTMLElement, fn?: () => DraggableOptions) {
	$effect(() => {
		const {
			enabled = true,
			ignore,
			threshold = 3,
			onStart,
			onMove,
			onEnd,
		} = fn?.() || {};

		if (!enabled) return;

		let dragging = false;
		let moved = false;
		let startX = 0;
		let startY = 0;
		let pointerId = -1;

		function onPointerDown(e: PointerEvent) {
			// primary button / touch / pen only
			if (e.button !== 0 && e.pointerType === "mouse") return;
			if (ignore && (e.target as Element)?.closest?.(ignore)) return;

			dragging = true;
			moved = false;
			startX = e.clientX;
			startY = e.clientY;
			pointerId = e.pointerId;

			try {
				node.setPointerCapture(e.pointerId);
			} catch {
				/* capture is best-effort */
			}
			document.body.style.userSelect = "none";
			onStart?.(e);
		}

		function onPointerMove(e: PointerEvent) {
			if (!dragging) return;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			if (!moved && Math.hypot(dx, dy) > threshold) moved = true;
			onMove?.({ dx, dy }, e);
		}

		function onPointerUp(e: PointerEvent) {
			if (!dragging) return;
			dragging = false;
			try {
				node.releasePointerCapture(pointerId);
			} catch {
				/* noop */
			}
			document.body.style.userSelect = "";
			onEnd?.({ moved }, e);
		}

		node.addEventListener("pointerdown", onPointerDown);
		node.addEventListener("pointermove", onPointerMove);
		node.addEventListener("pointerup", onPointerUp);
		node.addEventListener("pointercancel", onPointerUp);

		return () => {
			node.removeEventListener("pointerdown", onPointerDown);
			node.removeEventListener("pointermove", onPointerMove);
			node.removeEventListener("pointerup", onPointerUp);
			node.removeEventListener("pointercancel", onPointerUp);
			document.body.style.userSelect = "";
		};
	});
}
