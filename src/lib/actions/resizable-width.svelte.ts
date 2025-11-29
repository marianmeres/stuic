import {
	localStorageState,
	sessionStorageState,
} from "../utils/persistent-state.svelte.js";
import { twMerge } from "../utils/tw-merge.js";

/**
 * Options for the resizable width action.
 */
export interface ResizableWidthOptions {
	// master switch
	enabled?: boolean;
	initial?: number;
	min?: number;
	max?: number;
	units?: "px" | "%";
	key?: string | number | null | undefined;
	storage?: "local" | "session";
	handleClass?: string;
	handleDragClass?: string;
	onResize?: (info: { width: number; units: "px" | "%"; container: number }) => void;
	debug?: (...args: any[]) => void;
}

/**
 * A Svelte action that makes an element's width resizable via drag handle.
 *
 * Adds a draggable handle to the right edge of the element. Supports mouse and touch input.
 * Optionally persists the width to localStorage/sessionStorage.
 *
 * Features:
 * - Drag handle with visual feedback
 * - Min/max width constraints
 * - Support for px or % units
 * - Optional storage persistence with custom key
 * - Double-click handle to reset to initial width
 * - Touch device support
 *
 * @param el - The element to make resizable
 * @param fn - Function returning configuration options
 *
 * @remarks
 * The `units` option should not be changed dynamically after initialization.
 *
 * @example
 * ```svelte
 * <div
 *   use:resizableWidth={() => ({
 *     initial: 300,
 *     min: 200,
 *     max: 600,
 *     key: 'sidebar',
 *     storage: 'local',
 *     onResize: ({ width }) => console.log('Width:', width)
 *   })}
 *   class="h-full"
 * >
 *   Resizable sidebar content
 * </div>
 *
 * <!-- With percentage units -->
 * <div use:resizableWidth={() => ({ initial: 25, units: '%', max: 50 })}>
 *   ...
 * </div>
 * ```
 */
export function resizableWidth(el: HTMLDivElement, fn?: () => ResizableWidthOptions) {
	const DEFAULT_HANDLE_CLS = [
		"group",
		"absolute top-0 right-0 bottom-0",
		"w-[1px]",
		"bg-black/20 hover:bg-black/30",
		"dark:bg-white/10 dark:hover:bg-white/20",
		"transition-colors duration-200",
		"touch-none cursor-ew-resize",
	].join(" ");

	const DEFAULT_DRAG_HANDLE_CLS = [
		"absolute h-[20px] w-[9px]",
		"-translate-x-[4px] top-1/2 -translate-y-1/2",
		"rounded border border-black/20 dark:border-white/20",
		"bg-gray-300 group-hover:bg-gray-400",
		"dark:bg-gray-600 dark:group-hover:bg-gray-500",
		"transition-colors duration-200",
		"touch-none cursor-ew-resize",
	].join(" ");

	function create_handle(
		el: HTMLDivElement,
		handleClass?: string,
		handleDragClass?: string
	) {
		const handle = document.createElement("div");
		handle.setAttribute("data-handle", "true");

		const dragHandle = document.createElement("div");
		dragHandle.classList.add(
			...twMerge(DEFAULT_DRAG_HANDLE_CLS, handleDragClass).split(" ")
		);

		handle.appendChild(dragHandle);
		el.appendChild(handle);

		//
		handle.classList.add(...twMerge(DEFAULT_HANDLE_CLS, handleClass).split(" "));

		return handle;
	}

	$effect(() => {
		let {
			enabled = true,
			initial = 0,
			min = 0,
			max = 0,
			units = "px",
			key,
			storage = "session",
			handleClass = "",
			handleDragClass = "",
			onResize,
			debug,
		} = fn?.() || {};

		const _debug = (...args: any[]) => debug?.("[resizable-width]", ...args);
		_debug("$effect");

		if (!enabled) return;

		// initialize ////////////////////////////////////////////////////////////////////

		//
		let isResizing = false;
		let startX = 0;
		let startWidth = 0;
		let containerW: number | undefined = undefined;
		//
		const handle = create_handle(el, handleClass, handleDragClass);
		const container = el.parentElement!;

		// do we have a storage? if so, adjust the initial value...
		const initialBackup = initial;
		const _storage = get_storage(storage, key, initial);
		if (_storage) initial = _storage.current ?? initial;

		// handlers/workers/helpers //////////////////////////////////////////////////////

		function set_width(pxOrPercent: number) {
			if (pxOrPercent) {
				_debug(`set_width(${pxOrPercent})`);
				set_width_px(
					units === "%" ? container.offsetWidth * (pxOrPercent / 100) : pxOrPercent
				);
			}
		}

		function set_width_px(widthPx: number) {
			_debug(`set_width_px(${widthPx})`);
			containerW ??= container.offsetWidth;

			const clamp = (value: number) => {
				const _initial = value;
				if (min) value = Math.max(min, value);
				if (max) value = Math.min(max, value);
				_initial !== value && _debug("clamped", value, units);
				return value;
			};

			let width: number;
			if (units === "%") {
				const widthPercent = Math.min(100, (widthPx / containerW) * 100); // convert to % (with 100 max)
				width = clamp(widthPercent);
			} else {
				width = clamp(widthPx);
			}

			el.style.width = `${width}${units}`;
			_debug("new width", width, units);

			const info = { width, units, container: containerW };
			onResize?.(info);

			// maybe save to storage
			if (_storage) _storage.current = width;

			return info;
		}

		function resize_start(e: any) {
			e.preventDefault(); // prevent scrolling on touch devices
			isResizing = true;

			//
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			startX = clientX;
			startWidth = parseInt(getComputedStyle(el).width, 10);
			containerW = container.offsetWidth;

			//
			document.body.style.cursor = "ew-resize";
			document.body.style.userSelect = "none";
		}

		function resize(e: any) {
			if (!isResizing) return;
			e.preventDefault(); // prevent scrolling on touch devices

			//
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const deltaX = clientX - startX;
			let width = startWidth + deltaX;

			set_width_px(width);
		}

		function resize_stop() {
			if (isResizing) {
				isResizing = false;
				containerW = undefined;
				//
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			}
		}

		function on_dblclick() {
			set_width(initialBackup);
		}

		// initial styles ////////////////////////////////////////////////////////////////
		el.style.position = "relative"; // so the handle will work
		set_width(initial);

		// listeners /////////////////////////////////////////////////////////////////////
		// handle
		handle.addEventListener("dblclick", on_dblclick);
		handle.addEventListener("selectstart", (e) => e.preventDefault()); // prevent text selection during resize
		// mouse
		handle.addEventListener("mousedown", resize_start);
		document.addEventListener("mousemove", resize);
		document.addEventListener("mouseup", resize_stop);
		// touch
		handle.addEventListener("touchstart", resize_start, { passive: false });
		document.addEventListener("touchmove", resize, { passive: false });
		document.addEventListener("touchend", resize_stop);
		document.addEventListener("touchcancel", resize_stop);

		// cleanup ///////////////////////////////////////////////////////////////////////
		return () => {
			// mouse
			document.removeEventListener("mousemove", resize);
			document.removeEventListener("mouseup", resize_stop);
			// touch
			document.removeEventListener("touchmove", resize);
			document.removeEventListener("touchend", resize_stop);
			document.removeEventListener("touchcancel", resize_stop);
			// will also remove it's own event listeners
			handle.remove();
		};
	});
}

// helpers ///////////////////////////////////////////////////////////////////////////////

function get_storage(
	type: "local" | "session",
	key?: string | number | null | undefined,
	initialValue?: number
) {
	if (key) {
		return (type === "session" ? sessionStorageState : localStorageState)(
			`resizable-width-${key}`,
			initialValue
		);
	}
	return null;
}
