import { writable } from 'svelte/store';

export interface DrawerOptions {
	open: boolean;
	id: string;
	meta: any;

	// --- Core ---
	position: 'left' | 'top' | 'right' | 'bottom';

	// --- Backdrop ---
	bgBackdrop: string;
	blur: string;
	padding: string;

	// --- Drawer ---
	bgDrawer: string;
	border: string;
	rounded: string;
	shadow: string;
	width: string;
	height: string;

	// -- Transitions ---
	duration: number;
	opacityTransition: boolean;

	// --- Regions ---
	regionBackdrop: string;
	regionDrawer: string;

	// --- A11y ---
	labelledby: string;
	describedby: string;
}

export type DrawerStore = ReturnType<typeof createDrawerStore>;

export const createDrawerStore = (initial: Partial<DrawerOptions> = {}) => {
	const { subscribe, set, update } = writable<Partial<DrawerOptions>>(initial);
	return {
		subscribe,
		set,
		update,
		open: (newOptions: Partial<DrawerOptions> = {}) =>
			update(() => ({ ...(newOptions || {}), open: true })),
		close: () => update((d) => ({ ...d, open: false })),
	};
};
