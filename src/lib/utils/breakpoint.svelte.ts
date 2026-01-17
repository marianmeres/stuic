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

/**
 * A reactive class that tracks the current Tailwind CSS breakpoint.
 *
 * Uses Svelte 5's `$derived` rune to reactively update when the window is resized.
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
	static #singleton: Breakpoint | undefined;

	#bp = $derived.by(() => {
		const w = innerWidth.current || 0;
		return _breakpoints.reduce<BreakpointValue>(
			(m: BreakpointValue, [k, v]) => {
				const flag = w && w >= v;
				m = { ...m, [k]: flag, current: flag ? k : m.current };
				return m;
			},
			{ current: null, sm: false, md: false, lg: false, xl: false, "2xl": false }
		);
	});

	static get instance() {
		return (Breakpoint.#singleton ??= new Breakpoint());
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
