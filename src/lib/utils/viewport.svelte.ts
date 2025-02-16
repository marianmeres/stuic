interface Breakpoint {
	__current__: null | string;
	sm: boolean;
	md: boolean;
	lg: boolean;
	xl: boolean;
	"2xl": boolean;
}

interface ViewportRect {
	/** Returns the offset of the left edge of the visual viewport from the left edge of the
	 * layout viewport in CSS pixels. */
	offsetLeft: number;
	/** Returns the offset of the top edge of the visual viewport from the top edge of the
	 * layout viewport in CSS pixels. */
	offsetTop: number;
	/** Returns the x coordinate of the visual viewport relative to the initial containing
	 * block origin of the top edge in CSS pixels. */
	pageLeft: number;
	/** Returns the y coordinate of the visual viewport relative to the initial containing
	 * block origin of the top edge in CSS pixels. */
	pageTop: number;
	/** Returns the width of the visual viewport in CSS pixels. */
	width: number;
	/** Returns the height of the visual viewport in CSS pixels. */
	height: number;
	/** Returns the pinch-zoom scaling factor applied to the visual viewport. */
	scale: number;
}

// https://tailwindcss.com/docs/responsive-design
const _breakpoints = <[string, number][]>[
	["sm", 640],
	["md", 768],
	["lg", 1024],
	["xl", 1280],
	["2xl", 1536],
];

/**
 *
 */
class Viewport {
	#rect: ViewportRect | null = $state(null);

	#breakpoint: Breakpoint = $derived.by(() => {
		const w = this.#rect?.width || 0;
		return _breakpoints.reduce<Breakpoint>(
			(m: Breakpoint, [k, v]) => {
				const flag = w && w >= v;
				m = { ...m, [k]: flag, __current__: flag ? k : m.__current__ };
				return m;
			},
			{ __current__: null, sm: false, md: false, lg: false, xl: false, "2xl": false }
		);
	});

	constructor() {
		this.touch();
		// intentionally not debounced
		globalThis.visualViewport?.addEventListener("resize", this.touch.bind(this));
		globalThis.visualViewport?.addEventListener("scroll", this.touch.bind(this));
	}

	/**
	 * Will get the current stored value
	 */
	get rect(): ViewportRect | null {
		return this.#rect;
	}

	/**
	 * Will get the breakpoint info
	 */
	get breakpoint(): Breakpoint {
		return this.#breakpoint;
	}

	/**
	 * Will re-read the visualViewport data.
	 */
	touch(): Viewport {
		const { offsetLeft, offsetTop, pageLeft, pageTop, width, height, scale } =
			globalThis.visualViewport!;
		this.#rect = { offsetLeft, offsetTop, pageLeft, pageTop, width, height, scale };
		return this;
	}
}

// global single instance
let _viewport: Viewport;

/**
 * public accessor to single instance
 */
export function getViewport(): Viewport {
	return (_viewport ??= new Viewport());
}
