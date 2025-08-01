import {
	localStorageState,
	sessionStorageState,
} from "../utils/persistent-state.svelte.js";

type KnownStorage = "local" | "session";

const DIVIDER_ATTR = "resizable-cols-divider";
const DEFAULT_INITIAL_SPLIT = 33;

/** Will validate html nodes and potentially create divider. */
function ensure_nodes(
	container: HTMLDivElement,
	dividerOptions: Partial<{
		initialSplit: number;
		zIndex: number;
		width: number;
		bgColor: string;
		hoverWidth: number;
		hoverBgColor: string;
	}> = {}
) {
	const children = Array.from(container.children) as HTMLDivElement[];

	let panelA: HTMLDivElement;
	let panelB: HTMLDivElement;
	let divider: HTMLDivElement;

	// Check if divider already exists
	const existingDivider = children.find((n) =>
		n.hasAttribute(`data-${DIVIDER_ATTR}`)
	) as HTMLDivElement;

	let {
		initialSplit = DEFAULT_INITIAL_SPLIT,
		zIndex = 10,
		width = 2,
		bgColor = "#ccc",
		hoverWidth = 2,
		hoverBgColor = "#aaa",
	} = dividerOptions ?? {};

	if (existingDivider) {
		// should have exactly 3 children (2 panels + 1 divider)
		if (children.length !== 3) return false;

		[panelA, panelB] = children.filter((child) => child !== divider);

		divider = existingDivider;
	} else {
		// should have exactly 2 children (panels only)
		if (children.length !== 2) return false;

		[panelA, panelB] = children;

		// create divider
		divider = document.createElement("div");
		divider.setAttribute(`data-${DIVIDER_ATTR}`, "true");

		// insert divider between panels
		container.insertBefore(divider, panelB);
	}

	// ensure styles
	// height: 100%;
	// position: absolute;
	divider.style.cssText = `
        width: ${width}px;
        background-color: ${bgColor};
        left: ${initialSplit}%;
        transform: translateX(-50%);
        cursor: col-resize;
        z-index: ${zIndex};`;

	// add/remove hover styles
	divider.addEventListener("mouseenter", () => {
		divider.style.backgroundColor = hoverBgColor;
		divider.style.width = `${hoverWidth}px`;
	});

	divider.addEventListener("mouseleave", () => {
		divider.style.backgroundColor = bgColor;
		divider.style.width = `${width}px`;
	});

	panelA.style.width = `${initialSplit}%`;
	panelB.style.width = `${100 - initialSplit}%`;
	panelA.style.height = "100%";
	panelB.style.height = "100%";

	return { panelA, panelB, divider };
}

export function resizableCols(
	el: HTMLDivElement,
	fn?: () => {
		// master switch
		enabled?: boolean;
		// min width (percentage) or either col
		minWidth?: number;
		// divider options
		divider?: Partial<{
			initialSplit: number;
			zIndex: number;
			width: number;
			bgColor: string;
			hoverWidth: number;
			hoverBgColor: string;
		}>;
		// storage key identifier - if provided, will store the width value in session/local storage
		key?: string;
		storage?: KnownStorage;
	}
) {
	let enabled: boolean = true;
	let minWidth: number = 15;

	// if we have a key, lets use it. We must do it, before `ensure_nodes` so we can hack the options
	let { key, storage: storageType, divider: dividerOptions = {} } = fn?.() || {};
	let __defaultInitialSplit = dividerOptions.initialSplit || DEFAULT_INITIAL_SPLIT;

	const storage = key
		? (storageType === "local" ? localStorageState : sessionStorageState)(
				`${DIVIDER_ATTR}-${key}`,
				dividerOptions.initialSplit || __defaultInitialSplit
			)
		: null;

	if (storage) {
		dividerOptions.initialSplit = storage.current;
	}

	const { panelA, divider, panelB } = ensure_nodes(el, dividerOptions) || {};

	// unexpected html structure (too few or too many elements)
	if (!panelA) {
		console.warn("[resizableCols] Ignoring... (unexpected container html structure)");
		return;
	}

	let isDragging = false;

	function _do_resize(newPos: number) {
		// set new position respecting minWidth constraints
		newPos = Math.max(minWidth, Math.min(100 - minWidth, newPos));

		// update panel widths and divider position
		panelA!.style.width = `${newPos}%`;
		panelB!.style.width = `${100 - newPos}%`;
		divider!.style.left = `${newPos}%`;

		// maybe save
		if (storage) storage.current = newPos;
	}

	function drag_start(e: Event) {
		if (!enabled) return;

		e.preventDefault();
		isDragging = true;

		//
		document.addEventListener("mousemove", drag);
		document.addEventListener("touchmove", drag);
		document.addEventListener("mouseup", drag_end);
		document.addEventListener("touchend", drag_end);
	}

	function drag(e: any) {
		if (!isDragging || !enabled) return;

		let clientX;
		if (e.type === "touchmove") {
			clientX = e.touches[0].clientX;
		} else {
			clientX = e.clientX;
		}

		const elRect = el.getBoundingClientRect();
		let newPos = ((clientX - elRect.left) / elRect.width) * 100;

		_do_resize(newPos);
		// const elRect = el.getBoundingClientRect();
		// let newPos = ((clientX - elRect.left) / elRect.width) * 100;

		// // set new position respecting minWidth constraints
		// newPos = Math.max(minWidth, Math.min(100 - minWidth, newPos));

		// // update panel widths and divider position
		// panelA!.style.width = `${newPos}%`;
		// panelB!.style.width = `${100 - newPos}%`;
		// divider!.style.left = `${newPos}%`;

		// // maybe save
		// if (storage) storage.current = newPos;
	}

	function drag_end(e: Event) {
		isDragging = false;

		// Remove event listeners
		document.removeEventListener("mousemove", drag);
		document.removeEventListener("touchmove", drag);
		document.removeEventListener("mouseup", drag_end);
		document.removeEventListener("touchend", drag_end);
	}

	function on_resize(e: Event) {
		// ensure divider position matches panel A's width
		const panelAWidth =
			(parseFloat(getComputedStyle(panelA!).width) / el.offsetWidth) * 100;
		divider!.style.left = `${panelAWidth}%`;
	}

	function on_dblclick(e: Event) {
		_do_resize(__defaultInitialSplit);
	}

	// "reactive" params re/set
	$effect(() => {
		let options = fn?.() || {};
		if (options.enabled !== undefined) enabled = !!options.enabled;
		if (options.minWidth !== undefined) minWidth = options.minWidth;
		// no cleanups here
	});

	// add/remove listeners effect ("non-reactive")
	$effect(() => {
		// start
		divider!.addEventListener("mousedown", drag_start);
		divider!.addEventListener("touchstart", drag_start);
		divider!.addEventListener("dblclick", on_dblclick);
		window.addEventListener("resize", on_resize);

		return () => {
			divider!.removeEventListener("mousedown", drag_start);
			divider!.removeEventListener("touchstart", drag_start);
			divider!.removeEventListener("dblclick", on_dblclick);
			window.removeEventListener("resize", on_resize);

			// this is duplicate cleanup, which should not harm (better safe than sorry)...
			document.removeEventListener("mousemove", drag);
			document.removeEventListener("touchmove", drag);
			document.removeEventListener("mouseup", drag_end);
			document.removeEventListener("touchend", drag_end);
		};
	});
}
