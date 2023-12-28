import { derived, writable } from 'svelte/store';

const getWindowSize = () => {
	const { width, height, scale } = window?.visualViewport || {
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
window?.visualViewport?.addEventListener('resize', windowSize.touch);
window?.visualViewport?.addEventListener('scroll', windowSize.touch);

// https://tailwindcss.com/docs/responsive-design
export const breakpoint = derived<[typeof windowSize], string | null>(
	[windowSize],
	([{ width: w }]) => {
		const list = <[string, number][]>[
			['sm', 640],
			['md', 768],
			['lg', 1024],
			['xl', 1280],
			['2xl', 1536],
		];
		return list.reduce<string | null>((m, [k, v]) => (w && w >= v ? k : m), null);
	}
);
