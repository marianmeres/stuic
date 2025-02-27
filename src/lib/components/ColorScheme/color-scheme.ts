/**
 * Color scheme toggler and manager
 */
export class ColorScheme {
	static readonly KEY = "color-scheme" as const;
	static readonly DARK = "dark" as const;
	static readonly LIGHT = "light" as const;

	/**
	 * Reads the `prefers-color-scheme` system setting
	 */
	static getSystemValue(): "dark" | "light" {
		return globalThis.matchMedia?.(`(prefers-color-scheme: ${ColorScheme.DARK})`).matches
			? ColorScheme.DARK
			: ColorScheme.LIGHT;
	}

	/**
	 * Reads locally (localStorage) saved value
	 */
	static getLocalValue(fallback: "dark" | "light" = "light"): "dark" | "light" {
		return (
			(globalThis.localStorage?.getItem(ColorScheme.KEY) as "dark" | "light") || fallback
		);
	}

	/**
	 * Tries local first, fallbacks to system
	 */
	static getValue(): "dark" | "light" {
		return ColorScheme.getLocalValue(ColorScheme.getSystemValue());
	}

	/**
	 * Sets and saves the opposite of current.
	 */
	static toggle(): void {
		// returns bool, indicating whether token is in the list after the call or not.
		const isDark = globalThis?.document?.documentElement.classList.toggle(
			ColorScheme.DARK
		);
		globalThis.localStorage?.setItem(
			ColorScheme.KEY,
			isDark ? ColorScheme.DARK : ColorScheme.LIGHT
		);
	}

	/**
	 *
	 */
	static reset(): void {
		globalThis.localStorage?.removeItem(ColorScheme.KEY);
		globalThis?.document?.documentElement.classList.remove(
			ColorScheme.DARK,
			ColorScheme.LIGHT
		);
	}
}
