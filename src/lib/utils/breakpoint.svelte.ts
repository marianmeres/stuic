import { createClog } from "@marianmeres/clog";
import { innerWidth } from "svelte/reactivity/window";

const clog = createClog("breakpoint").debug;

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

export class Breakpoint {
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

	get dump() {
		return this.#bp;
	}
}
