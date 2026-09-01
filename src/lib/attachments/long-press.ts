import type { Attachment } from "svelte/attachments";

export interface LongPressOptions {
	/** Called when the press exceeds `duration` without moving beyond `moveTolerance`. */
	onLongPress: (event: PointerEvent) => void;
	/** How long (ms) the pointer must stay down before firing. Default 500. */
	duration?: number;
	/** Movement (px, straight-line) that cancels the pending press. Default 10. */
	moveTolerance?: number;
	/** Pointer types that can long-press. Default `["touch", "pen"]` (mouse has right-click). */
	pointerTypes?: string[];
	/**
	 * Swallow the `click` that some platforms fire when the finger lifts after a
	 * long-press, so it can't activate whatever sits under it (link, button) right
	 * after the long-press action ran. Default true.
	 */
	suppressClick?: boolean;
}

/**
 * Svelte attachment (factory) that detects a long-press on the host element and calls
 * `onLongPress` with the initiating `pointerdown` event (its `clientX`/`clientY` is
 * where the press happened).
 *
 * Semantics: only primary pointers of the configured `pointerTypes` arm the timer;
 * lifting, cancellation (e.g. the platform turning the gesture into a scroll), or
 * moving beyond `moveTolerance` disarms it. A native `contextmenu` event on the host
 * (Android fires it on long-press by itself) also disarms, so a host that handles
 * `contextmenu` never gets both paths for one gesture.
 *
 * The browser's own long-press behaviors are NOT prevented here — that is CSS the
 * consumer owns: `-webkit-touch-callout: none` (iOS link/image callout) and
 * `user-select: none` (text-selection long-press) on the host.
 *
 * @example
 * ```svelte
 * <div {@attach longPress({ onLongPress: (e) => openAt(e.clientX, e.clientY) })}>...</div>
 * ```
 *
 * Conditional usage (a falsy value means "no attachment"):
 * ```svelte
 * <div {@attach enabled && longPress({ onLongPress })}>...</div>
 * ```
 */
export function longPress(options: LongPressOptions): Attachment<HTMLElement> {
	return (node) => {
		const {
			onLongPress,
			duration = 500,
			moveTolerance = 10,
			pointerTypes = ["touch", "pen"],
			suppressClick = true,
		} = options;

		let timer: ReturnType<typeof setTimeout> | undefined;
		let startEvent: PointerEvent | undefined;
		let fired = false;
		let suppressing = false;

		const disarm = () => {
			if (timer !== undefined) clearTimeout(timer);
			timer = undefined;
			startEvent = undefined;
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onPointerCancel);
		};

		const onMove = (e: PointerEvent) => {
			if (!startEvent || e.pointerId !== startEvent.pointerId || fired) return;
			const dist = Math.hypot(
				e.clientX - startEvent.clientX,
				e.clientY - startEvent.clientY
			);
			if (dist > moveTolerance) disarm();
		};

		// The follow-up click (if the platform fires one) lands right after the
		// gesture ends — close the suppress window soon after, so a stale flag can
		// never swallow a later genuine click.
		const scheduleSuppressEnd = () => {
			if (fired && suppressing) setTimeout(() => (suppressing = false), 150);
		};

		const onUp = (e: PointerEvent) => {
			if (!startEvent || e.pointerId !== startEvent.pointerId) return;
			scheduleSuppressEnd();
			disarm();
		};

		const onPointerCancel = (e: PointerEvent) => {
			if (!startEvent || e.pointerId !== startEvent.pointerId) return;
			scheduleSuppressEnd();
			disarm();
		};

		const onDown = (e: PointerEvent) => {
			if (!e.isPrimary || !pointerTypes.includes(e.pointerType)) return;
			disarm();
			fired = false;
			startEvent = e;
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp);
			window.addEventListener("pointercancel", onPointerCancel);
			timer = setTimeout(() => {
				timer = undefined;
				fired = true;
				suppressing = suppressClick;
				onLongPress(e);
			}, duration);
		};

		// Android synthesizes contextmenu on long-press by itself — let that path win.
		const onNativeContextMenu = () => {
			scheduleSuppressEnd();
			disarm();
		};

		const onClickCapture = (e: MouseEvent) => {
			if (!suppressing) return;
			suppressing = false;
			e.preventDefault();
			e.stopPropagation();
		};

		node.addEventListener("pointerdown", onDown);
		node.addEventListener("contextmenu", onNativeContextMenu);
		window.addEventListener("click", onClickCapture, { capture: true });

		return () => {
			disarm();
			suppressing = false;
			node.removeEventListener("pointerdown", onDown);
			node.removeEventListener("contextmenu", onNativeContextMenu);
			window.removeEventListener("click", onClickCapture, { capture: true });
		};
	};
}
