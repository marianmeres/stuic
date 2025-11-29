/**
 * A utility class for managing light/dark color scheme preferences.
 *
 * Handles system preferences, localStorage persistence, and DOM class toggling.
 * Works with Tailwind CSS dark mode (class-based strategy).
 *
 * @example
 * ```ts
 * // Get current color scheme (local preference or system default)
 * const scheme = ColorScheme.getValue(); // 'light' or 'dark'
 *
 * // Toggle between light and dark
 * ColorScheme.toggle();
 *
 * // Check system preference only
 * const systemPref = ColorScheme.getSystemValue();
 *
 * // Reset to system preference
 * ColorScheme.reset();
 * ```
 *
 * @remarks
 * - Uses localStorage key: "stuic-color-scheme"
 * - Adds/removes "dark" class on `<html>` element
 * - Works with Tailwind's `darkMode: 'class'` configuration
 */
export class ColorScheme {
	static readonly KEY = "stuic-color-scheme" as const;
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
	 * Resets color scheme to system preference by removing localStorage value and classes.
	 */
	static reset(): void {
		globalThis.localStorage?.removeItem(ColorScheme.KEY);
		globalThis?.document?.documentElement.classList.remove(
			ColorScheme.DARK,
			ColorScheme.LIGHT
		);
	}
}
