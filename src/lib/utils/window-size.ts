import { derived, writable } from 'svelte/store';

const _window = typeof window !== 'undefined' ? window : null;

const getWindowSize = () => {
	const { width, height, scale } = _window?.visualViewport || {
		width: 0,
		height: 0,
		scale: 1,
	};
	return { width, height, scale };
};

let _trigger = writable(0);
export const windowSize = {
	...derived([_trigger], ([_]) => getWindowSize()),
	touch: () => _trigger.set(Date.now()),
};

// init now!
windowSize.touch();

// intentionally not debounced
_window?.visualViewport?.addEventListener('resize', windowSize.touch);
_window?.visualViewport?.addEventListener('scroll', windowSize.touch);

// https://tailwindcss.com/docs/responsive-design
interface Breakpoint {
	__current__: null | string;
	sm: boolean;
	md: boolean;
	lg: boolean;
	xl: boolean;
	'2xl': boolean;
}
export const breakpoint = derived<[typeof windowSize], Breakpoint>(
	[windowSize],
	([{ width: w }]) => {
		const list = <[string, number][]>[
			['sm', 640],
			['md', 768],
			['lg', 1024],
			['xl', 1280],
			['2xl', 1536],
		];
		// return list.reduce<string | null>((m, [k, v]) => (w && w >= v ? k : m), null);
		return list.reduce<Breakpoint>(
			(m: Breakpoint, [k, v]) => {
				const flag = w && w >= v;
				m = { ...m, [k]: flag, __current__: flag ? k : m.__current__ };
				return m;
			},
			{ __current__: null, sm: false, md: false, lg: false, xl: false, '2xl': false }
		);
	}
);
