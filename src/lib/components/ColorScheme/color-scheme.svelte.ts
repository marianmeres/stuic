type Scheme = "dark" | "light";

let _current = $state<Scheme>("light");

function _compute(): Scheme {
	return ColorScheme.getLocalValue(ColorScheme.getSystemValue());
}

function _sync(): void {
	const next = _compute();
	if (next !== _current) _current = next;
}

/**
 * A utility class for managing light/dark color scheme preferences.
 *
 * Handles system preferences, localStorage persistence, and DOM class toggling.
 * Works with Tailwind CSS dark mode (class-based strategy).
 *
 * The `ColorScheme.current` getter is reactive (Svelte 5 `$state`): reading it
 * inside a `$derived`/`$effect`/template will react to toggles, cross-tab
 * `storage` events, and OS-level system-preference changes.
 *
 * @example
 * ```ts
 * // Reactive current value (use in templates / $derived / $effect):
 * const scheme = ColorScheme.current; // 'light' or 'dark'
 *
 * // Backward-compatible non-reactive read:
 * const v = ColorScheme.getValue();
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
	 * Reactive current value. Read inside `$derived`, `$effect`, or a Svelte
	 * template to react to scheme changes (including cross-tab `storage`
	 * events and OS-level system-preference changes).
	 */
	static get current(): Scheme {
		return _current;
	}

	/**
	 * Reads the `prefers-color-scheme` system setting
	 */
	static getSystemValue(): Scheme {
		return globalThis.matchMedia?.(`(prefers-color-scheme: ${ColorScheme.DARK})`).matches
			? ColorScheme.DARK
			: ColorScheme.LIGHT;
	}

	/**
	 * Reads locally (localStorage) saved value
	 */
	static getLocalValue(fallback: Scheme = "light"): Scheme {
		return (
			(globalThis.localStorage?.getItem(ColorScheme.KEY) as Scheme) || fallback
		);
	}

	/**
	 * Tries local first, fallbacks to system. Backward-compatible alias for `current`.
	 */
	static getValue(): Scheme {
		return ColorScheme.current;
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
		_sync();
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
		_sync();
	}
}

if (typeof window !== "undefined") {
	_current = _compute();
	window.addEventListener("storage", (e) => {
		if (e.key === ColorScheme.KEY) _sync();
	});
	window
		.matchMedia?.(`(prefers-color-scheme: ${ColorScheme.DARK})`)
		.addEventListener("change", () => _sync());
}
