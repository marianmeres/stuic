import {
	localStorageState,
	sessionStorageState,
} from "../utils/persistent-state.svelte.js";
import { twMerge } from "../utils/tw-merge.js";

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
	onResize?: (info: { width: number; units: "px" | "%"; container: number }) => void;
	debug?: (...args: any[]) => void;
}

/**
 * Note: units should not be changed on the fly...
 */
export function resizableWidth(el: HTMLDivElement, fn?: () => ResizableWidthOptions) {
	const DEFAULT_HANDLE_CLS = [
		"absolute top-0 right-0 bottom-0",
		"w-[1px] hover:w-[4px] hover:right-[-1px]",
		"bg-black/10 hover:bg-black/20",
		"transition-colors duration-200",
		"touch-none cursor-ew-resize",
	].join(" ");

	function create_handle(el: HTMLDivElement, handleClass?: string) {
		const handle = document.createElement("div");
		handle.setAttribute("data-handle", "true");
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
		const handle = create_handle(el, handleClass);
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
