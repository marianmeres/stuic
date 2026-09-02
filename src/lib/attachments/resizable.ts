import type { Attachment } from "svelte/attachments";
import { getId } from "../utils/get-id.js";
import {
	localStorageState,
	sessionStorageState,
} from "../utils/persistent-state.svelte.js";
import { twMerge } from "../utils/tw-merge.js";

/** Which box dimension is resized: `x` = width, `y` = height. */
export type ResizableAxis = "x" | "y";

/** `px`, or `%` of the parent element's size along the axis. */
export type ResizableUnits = "px" | "%";

/** Payload of {@link ResizableOptions.onResize}. */
export interface ResizableInfo {
	/** The applied (clamped) size, in `units` */
	size: number;
	units: ResizableUnits;
	axis: ResizableAxis;
	/** The parent element's size along the axis in px, as measured for this resize */
	container: number;
}

/** Imperative handle, delivered through {@link ResizableOptions.onInit}. */
export interface ResizableApi {
	/** The last applied size, in `units` */
	readonly current: number;
	/** Applies a size (in `units`): clamped to `min` / `max`, persisted, announced, reported via `onResize` */
	set(size: number): void;
	/** Restores `resetTo` (defaults to `initial`) — what double-click / Enter on the handle do */
	reset(): void;
}

/**
 * Options for the {@link resizable} attachment.
 */
export interface ResizableOptions {
	/** Master switch. When `false` nothing is set up: no handle, no size applied. Default `true`. */
	enabled?: boolean;
	/**
	 * `x` resizes the width (the handle sits on a vertical edge), `y` resizes the height
	 * (horizontal edge). Default `x`.
	 */
	axis?: ResizableAxis;
	/**
	 * Size applied on setup when nothing is stored under `key`. `0` (default) leaves the
	 * element's own CSS size alone until the first resize.
	 */
	initial?: number;
	/** Lower bound in `units`. `0` = none. */
	min?: number;
	/** Upper bound in `units`. `0` = none (`%` is still capped at 100). */
	max?: number;
	/** `px` (default) or `%` of the parent element. Not meant to change after setup. */
	units?: ResizableUnits;
	/**
	 * Puts the handle on the start edge (left / top) and inverts the drag direction — for
	 * an element sitting at the end (right / bottom) of its container.
	 */
	reverse?: boolean;
	/** Persist the size under this key (as `resizable-width-<key>` / `resizable-height-<key>`). */
	key?: string | number | null | undefined;
	/** Where `key` persists to. Default `session`. */
	storage?: "local" | "session";
	/** Keyboard step in `units`; Shift multiplies it by 10. Default `10` for px, `1` for %. */
	step?: number;
	/** Accessible name of the handle (it is a `separator`). Default `"Resize"`. */
	label?: string;
	/** The size restored by double-click / Enter / `api.reset()`. Defaults to `initial`. */
	resetTo?: number;
	/**
	 * Use this element as the handle instead of creating one inside the resized element.
	 * It receives the separator semantics, the keyboard and the pointer handling (and
	 * `touch-action: none`), but no visual styling — that stays with the consumer.
	 */
	handle?: HTMLElement;
	/** Extra classes of the created handle (the full-edge strip). Ignored with `handle`. */
	handleClass?: string;
	/** Extra classes of the created handle's grip. Ignored with `handle`. */
	handleDragClass?: string;
	/** Fires whenever a size is applied: on setup, while dragging, per key press, on reset and `api.set()` */
	onResize?: (info: ResizableInfo) => void;
	/** Receives the imperative api, once per setup */
	onInit?: (api: ResizableApi) => void;
	debug?: (...args: unknown[]) => void;
}

const DEFAULT_LABEL = "Resize";

/**
 * Makes an element's width (`axis: "x"`) or height (`axis: "y"`) resizable by dragging
 * its edge. The handle is a keyboard-operable ARIA window splitter (`role="separator"`,
 * focusable, `aria-valuenow` in `units`): arrow keys along the axis move it by `step`
 * (×10 with Shift), Home / End go to `min` / `max`, Enter (like double-click) resets.
 * Pointer Events with capture cover mouse, touch and pen in one code path.
 *
 * By default a thin handle strip with a grip is appended inside the element on the
 * resized edge (the element becomes `position: relative`); pass `handle` to drive an
 * element of your own (a sibling separator, say) instead. The size can be persisted
 * under `key`. `min` / `max` clamp every path (drag, keys, `api.set()`).
 *
 * A factory: call it with the options (or a function returning them — reactive reads
 * inside re-run the attachment) and attach the result.
 *
 * @example
 * ```svelte
 * <script>
 *   import { resizable } from "@marianmeres/stuic";
 * </script>
 *
 * <!-- side by side: the first flex child gets a draggable width -->
 * <div class="flex">
 *   <aside {@attach resizable({ initial: 300, min: 200, max: 600, key: "sidebar" })}>…</aside>
 *   <main class="flex-1">…</main>
 * </div>
 *
 * <!-- stacked: a draggable height, in % of the (definite-height) parent -->
 * <div class="flex flex-col h-96">
 *   <div {@attach resizable({ axis: "y", units: "%", initial: 40, max: 80 })}>…</div>
 *   <div class="flex-1">…</div>
 * </div>
 * ```
 *
 * @param options - {@link ResizableOptions}, or a function returning them
 */
export function resizable(
	options: ResizableOptions | (() => ResizableOptions) = {}
): Attachment<HTMLElement> {
	return (el) => setup(el, typeof options === "function" ? options() : options);
}

// internals //////////////////////////////////////////////////////////////////////////

const HANDLE_CLS_COMMON = [
	"group",
	"absolute",
	"bg-black/20 hover:bg-black/30",
	"dark:bg-white/10 dark:hover:bg-white/20",
	"transition-colors duration-200",
	"touch-none",
	"focus-visible:outline-2 focus-visible:outline-(--stuic-color-ring)",
];
const HANDLE_CLS_X = [...HANDLE_CLS_COMMON, "top-0 bottom-0 w-[1px] cursor-col-resize"];
const HANDLE_CLS_Y = [...HANDLE_CLS_COMMON, "left-0 right-0 h-[1px] cursor-row-resize"];

const GRIP_CLS_COMMON = [
	"absolute",
	"rounded border border-black/20 dark:border-white/20",
	"bg-gray-300 group-hover:bg-gray-400",
	"dark:bg-gray-600 dark:group-hover:bg-gray-500",
	"transition-colors duration-200",
	"touch-none",
];
const GRIP_CLS_X = [
	...GRIP_CLS_COMMON,
	"h-[20px] w-[9px] -translate-x-[4px] top-1/2 -translate-y-1/2 cursor-col-resize",
];
const GRIP_CLS_Y = [
	...GRIP_CLS_COMMON,
	"w-[20px] h-[9px] -translate-y-[4px] left-1/2 -translate-x-1/2 cursor-row-resize",
];

function create_handle(
	el: HTMLElement,
	isX: boolean,
	reverse: boolean,
	handleClass: string,
	handleDragClass: string
) {
	const handle = document.createElement("div");
	handle.setAttribute("data-handle", "true");

	const grip = document.createElement("div");
	grip.classList.add(
		...twMerge((isX ? GRIP_CLS_X : GRIP_CLS_Y).join(" "), handleDragClass).split(" ")
	);
	handle.appendChild(grip);

	const edge = isX ? (reverse ? "left-0" : "right-0") : reverse ? "top-0" : "bottom-0";
	handle.classList.add(
		...twMerge((isX ? HANDLE_CLS_X : HANDLE_CLS_Y).join(" "), edge, handleClass).split(
			" "
		)
	);

	el.appendChild(handle);
	return handle;
}

function setup(el: HTMLElement, options: ResizableOptions): (() => void) | void {
	const {
		enabled = true,
		axis = "x",
		initial = 0,
		min = 0,
		max = 0,
		units = "px",
		reverse = false,
		key,
		storage = "session",
		step = units === "%" ? 1 : 10,
		label = DEFAULT_LABEL,
		resetTo = initial,
		handle: providedHandle,
		handleClass = "",
		handleDragClass = "",
		onResize,
		onInit,
		debug,
	} = options;

	const _debug = (...args: unknown[]) => debug?.("[resizable]", ...args);
	_debug("setup", options);

	if (!enabled) return;
	const container = el.parentElement;
	if (!container) return;

	const isX = axis === "x";
	const dim = isX ? "width" : "height";

	// storage: a stored size wins over `initial`
	const stored = key
		? (storage === "local" ? localStorageState : sessionStorageState)(
				`resizable-${dim}-${key}`,
				initial
			)
		: null;

	// handle /////////////////////////////////////////////////////////////////////////
	const handle =
		providedHandle ?? create_handle(el, isX, reverse, handleClass, handleDragClass);
	// what a provided handle looked like before, so the cleanup can restore it
	const prevAttrs = new Map<string, string | null>();
	const set_attr = (name: string, value: string) => {
		if (!prevAttrs.has(name)) prevAttrs.set(name, handle.getAttribute(name));
		handle.setAttribute(name, value);
	};
	const prevPosition = el.style.position;
	const prevTouchAction = handle.style.touchAction;
	if (!providedHandle) el.style.position = "relative"; // the created handle is absolute
	handle.style.touchAction = "none"; // no scrolling / zooming mid-drag

	const assignedId = el.id ? null : (el.id = getId("stuic-resizable-"));
	set_attr("role", "separator");
	set_attr("tabindex", "0");
	set_attr("aria-orientation", isX ? "vertical" : "horizontal");
	set_attr("aria-label", label);
	set_attr("aria-controls", el.id);

	// sizing /////////////////////////////////////////////////////////////////////////
	const measure = () => (isX ? container.offsetWidth : container.offsetHeight);
	const current_px = () => parseFloat(getComputedStyle(el)[dim]) || 0;
	// px -> units; with no measurable container (hidden) a % size is left as it is
	const to_units = (px: number, cs: number) =>
		units === "%" ? (cs > 0 ? (px / cs) * 100 : current) : px;

	const clamp = (value: number) => {
		const before = value;
		if (min) value = Math.max(min, value);
		if (max) value = Math.min(max, value);
		if (before !== value) _debug("clamped", before, "->", value, units);
		return value;
	};

	let current = 0; // last applied size, in units

	function update_aria(cs: number) {
		set_attr("aria-valuemin", `${min || 0}`);
		set_attr("aria-valuemax", `${max || (units === "%" ? 100 : Math.round(cs))}`);
		set_attr("aria-valuenow", `${Math.round(current)}`);
		set_attr("aria-valuetext", `${Math.round(current)}${units}`);
	}

	function commit(size: number, cs: number): ResizableInfo {
		size = clamp(units === "%" ? Math.min(100, size) : size);
		el.style[dim] = `${size}${units}`;
		current = size;
		_debug("applied", size, units);
		update_aria(cs);
		const info: ResizableInfo = { size, units, axis, container: cs };
		onResize?.(info);
		if (stored) stored.current = size;
		return info;
	}

	/** Applies a size given in `units` — needs no container measurement, so it also works while hidden. */
	function apply(size: number) {
		commit(size, measure());
	}

	/** Applies a size given in px (a drag), against the container as measured when it started. */
	function apply_px(px: number, cs: number) {
		commit(to_units(px, cs), cs);
	}

	function reset() {
		if (resetTo) apply(resetTo);
	}

	// pointer ////////////////////////////////////////////////////////////////////////
	let dragging = false;
	let pointerId = -1;
	let startCoord = 0;
	let startPx = 0;
	let containerSize = 0;

	function on_pointerdown(e: PointerEvent) {
		if (e.button !== 0 && e.pointerType === "mouse") return;
		dragging = true;
		pointerId = e.pointerId;
		startCoord = isX ? e.clientX : e.clientY;
		startPx = current_px();
		containerSize = measure();
		try {
			handle.setPointerCapture(e.pointerId);
		} catch {
			/* capture is best-effort (synthetic pointers have no id to capture) */
		}
		document.body.style.cursor = isX ? "col-resize" : "row-resize";
		document.body.style.userSelect = "none";
		handle.setAttribute("data-resizing", "");
	}

	function on_pointermove(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;
		e.preventDefault();
		const delta = (isX ? e.clientX : e.clientY) - startCoord;
		apply_px(reverse ? startPx - delta : startPx + delta, containerSize);
	}

	function on_pointerup(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;
		stop();
	}

	function stop() {
		if (!dragging) return;
		dragging = false;
		try {
			handle.releasePointerCapture(pointerId);
		} catch {
			/* noop */
		}
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		handle.removeAttribute("data-resizing");
	}

	// keyboard ///////////////////////////////////////////////////////////////////////
	function on_keydown(e: KeyboardEvent) {
		const amount = e.shiftKey ? step * 10 : step;
		// delta along the screen direction (+ = right / down), like a pointer drag
		let delta: number;
		if (e.key === (isX ? "ArrowRight" : "ArrowDown")) delta = amount;
		else if (e.key === (isX ? "ArrowLeft" : "ArrowUp")) delta = -amount;
		else if (e.key === "Home") delta = NaN;
		else if (e.key === "End") delta = NaN;
		else if (e.key === "Enter") delta = NaN;
		else return;
		e.preventDefault();

		if (e.key === "Home") return apply(min || 0);
		if (e.key === "End") return apply(max || (units === "%" ? 100 : measure()));
		if (e.key === "Enter") return reset();

		apply(current + (reverse ? -delta : delta));
	}

	function on_dblclick() {
		reset();
	}

	function on_selectstart(e: Event) {
		e.preventDefault();
	}

	// go /////////////////////////////////////////////////////////////////////////////
	const startSize = stored ? (stored.current ?? initial) : initial;
	if (startSize) {
		apply(startSize);
	} else {
		const cs = measure();
		current = to_units(current_px(), cs);
		update_aria(cs);
	}

	handle.addEventListener("pointerdown", on_pointerdown);
	handle.addEventListener("pointermove", on_pointermove);
	handle.addEventListener("pointerup", on_pointerup);
	handle.addEventListener("pointercancel", on_pointerup);
	handle.addEventListener("keydown", on_keydown);
	handle.addEventListener("dblclick", on_dblclick);
	handle.addEventListener("selectstart", on_selectstart);

	onInit?.({
		get current() {
			return current;
		},
		set: apply,
		reset,
	});

	return () => {
		stop();
		handle.removeEventListener("pointerdown", on_pointerdown);
		handle.removeEventListener("pointermove", on_pointermove);
		handle.removeEventListener("pointerup", on_pointerup);
		handle.removeEventListener("pointercancel", on_pointerup);
		handle.removeEventListener("keydown", on_keydown);
		handle.removeEventListener("dblclick", on_dblclick);
		handle.removeEventListener("selectstart", on_selectstart);
		if (providedHandle) {
			for (const [name, value] of prevAttrs) {
				if (value === null) handle.removeAttribute(name);
				else handle.setAttribute(name, value);
			}
			handle.style.touchAction = prevTouchAction;
		} else {
			handle.remove();
			el.style.position = prevPosition;
		}
		if (assignedId && el.id === assignedId) el.removeAttribute("id");
	};
}
