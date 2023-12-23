export class ColorScheme {
	static readonly KEY = 'color-scheme';
	static readonly DARK = 'dark';
	static readonly LIGHT = 'light';

	static getSystemValue = () =>
		window?.matchMedia(`(prefers-color-scheme: ${ColorScheme.DARK})`).matches
			? ColorScheme.DARK
			: ColorScheme.LIGHT;

	static getLocalValue = (fallback: string | null = null) =>
		localStorage?.getItem(ColorScheme.KEY) || fallback;

	static getValue = () => ColorScheme.getLocalValue(ColorScheme.getSystemValue());

	static toggle = () => {
		// returns bool, indicating whether token is in the list after the call or not.
		const isDark = window?.document.documentElement.classList.toggle(ColorScheme.DARK);
		localStorage?.setItem(ColorScheme.KEY, isDark ? ColorScheme.DARK : ColorScheme.LIGHT);
	};

	static reset = () => {
		localStorage?.removeItem(ColorScheme.KEY);
	};
}
