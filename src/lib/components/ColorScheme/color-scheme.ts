const _window = typeof window !== 'undefined' ? window : null;

export class ColorScheme {
	static readonly KEY = 'color-scheme';
	static readonly DARK = 'dark';
	static readonly LIGHT = 'light';

	static getSystemValue = () =>
		_window?.matchMedia(`(prefers-color-scheme: ${ColorScheme.DARK})`).matches
			? ColorScheme.DARK
			: ColorScheme.LIGHT;

	static getLocalValue = (fallback: string | null = null) =>
		localStorage?.getItem(ColorScheme.KEY) || fallback;

	static getValue = () => ColorScheme.getLocalValue(ColorScheme.getSystemValue());

	static toggle = () => {
		// returns bool, indicating whether token is in the list after the call or not.
		const isDark = _window?.document.documentElement.classList.toggle(ColorScheme.DARK);
		localStorage?.setItem(ColorScheme.KEY, isDark ? ColorScheme.DARK : ColorScheme.LIGHT);
	};

	static reset = () => {
		localStorage?.removeItem(ColorScheme.KEY);
	};
}
