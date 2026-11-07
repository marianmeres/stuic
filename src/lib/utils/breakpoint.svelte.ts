import { innerWidth } from "svelte/reactivity/window";

// https://tailwindcss.com/docs/responsive-design
const _breakpoints = <[string, number][]>[
	["sm", 640],
	["md", 768],
	["lg", 1024],
	["xl", 1280],
	["2xl", 1536],
];

interface BreakpointValue {
	current: null | string;
	sm: boolean;
	md: boolean;
	lg: boolean;
	xl: boolean;
	"2xl": boolean;
}

const _resolve = (w: number): BreakpointValue =>
	_breakpoints.reduce<BreakpointValue>(
		(m: BreakpointValue, [k, v]) => {
			const flag = w >= v;
			return { ...m, [k]: flag, current: flag ? k : m.current };
		},
		{ current: null, sm: false, md: false, lg: false, xl: false, "2xl": false }
	);

/**
 * A reactive class that tracks the current Tailwind CSS breakpoint.
 *
 * Every getter reads `innerWidth` from `svelte/reactivity/window`, so it updates when the
 * window is resized, in any reactive context.
 * Breakpoints follow Tailwind's default values: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px).
 *
 * @example
 * ```ts
 * const bp = new Breakpoint();
 *
 * // In a component:
 * {#if bp.md}
 *   <DesktopNav />
 * {:else}
 *   <MobileNav />
 * {/if}
 *
 * // Current breakpoint name:
 * console.log(bp.current); // "md", "lg", etc. or null for < 640px
 * ```
 */
export class Breakpoint {
	/** Singleton */
	static #instance: Breakpoint | undefined;

	// Computed on every read, deliberately not a `$derived`. A derived belongs to the effect
	// that is running when it is created, and the singleton is created lazily by whichever
	// component reads `instance` first. Once that component unmounts, every later reader
	// would read a derived owned by a destroyed effect: Svelte warns `derived_inert` on every
	// resize and hands back the last value, so the breakpoint stops following the window.
	// Reading `innerWidth.current` directly subscribes the caller and belongs to no one.
	// The cost is five comparisons per read.
	get #bp(): BreakpointValue {
		return _resolve(innerWidth.current ?? 0);
	}

	static get instance() {
		// return (Breakpoint.#instance ??= new Breakpoint();) // does not work with Svelte correctly...
		if (!Breakpoint.#instance) {
			Breakpoint.#instance = new Breakpoint();
		}
		return Breakpoint.#instance;
	}

	get current() {
		return this.#bp.current;
	}

	get sm() {
		return this.#bp.sm;
	}

	get md() {
		return this.#bp.md;
	}

	get lg() {
		return this.#bp.lg;
	}

	get xl() {
		return this.#bp.xl;
	}

	get ["2xl"]() {
		return this.#bp["2xl"];
	}

	get isMobile() {
		return !this.#bp.md;
	}

	get dump() {
		return this.#bp;
	}
}
