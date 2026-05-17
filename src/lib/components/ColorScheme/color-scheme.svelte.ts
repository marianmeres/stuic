type Scheme = "dark" | "light";

const DEFAULT_KEY = "stuic-color-scheme";
let _key = DEFAULT_KEY;
let _current = $state<Scheme>("light");

function _compute(): Scheme {
	const local = globalThis.localStorage?.getItem(_key) as Scheme | null;
	if (local === "dark" || local === "light") return local;
	return ColorScheme.getSystemValue();
}

function _applyDom(scheme: Scheme): void {
	globalThis?.document?.documentElement.classList.toggle(
		ColorScheme.DARK,
		scheme === ColorScheme.DARK
	);
}

function _sync(): void {
	const next = _compute();
	if (next !== _current) {
		_current = next;
		_applyDom(next);
	}
}

/**
 * A utility class for managing light/dark color scheme preferences.
 *
 * Handles localStorage persistence and DOM class toggling.
 * Works with Tailwind CSS dark mode (class-based strategy).
 *
 * The `ColorScheme.current` getter is reactive (Svelte 5 `$state`): reading it
 * inside a `$derived`/`$effect`/template will react to toggles and cross-tab
 * `storage` events.
 *
 * @example
 * ```ts
 * // Reactive current value (use in templates / $derived / $effect):
 * const scheme = ColorScheme.current; // 'light' or 'dark'
 *
 * // Toggle between light and dark
 * ColorScheme.toggle();
 *
 * // Reset to system preference
 * ColorScheme.reset();
 *
 * // Use a custom localStorage key (call early in app boot):
 * ColorScheme.configure({ key: "myapp:color-scheme" });
 * ```
 *
 * @remarks
 * - Default localStorage key: "stuic-color-scheme" (override via `configure`)
 * - Adds/removes "dark" class on `<html>` element
 * - Works with Tailwind's `darkMode: 'class'` configuration
 * - Pair with `<ColorSchemeLocal />` or `<ColorSchemeSystemAware />` for
 *   FOUC-free initial paint
 */
export class ColorScheme {
	static readonly DARK = "dark" as const;
	static readonly LIGHT = "light" as const;

	/**
	 * The active localStorage key. Default is `"stuic-color-scheme"`. Override via
	 * `ColorScheme.configure({ key })` or the `key` prop on the hydration components.
	 */
	static get KEY(): string {
		return _key;
	}

	/**
	 * Configure the runtime. Call early in app boot, before any consumer reads
	 * `ColorScheme.current`. Mutates module state; safe to call more than once
	 * (last write wins). Calling without changes is a no-op.
	 */
	static configure(opts: { key?: string }): void {
		if (opts?.key && opts.key !== _key) {
			_key = opts.key;
			_sync();
		}
	}

	/**
	 * Reactive current value. Read inside `$derived`, `$effect`, or a Svelte
	 * template to react to scheme changes (including cross-tab `storage` events).
	 */
	static get current(): Scheme {
		return _current;
	}

	/**
	 * Re-seed `current` from the actual `<html>` class state. Used by the
	 * hydration components after their inline bootstrap `<script>` has run, so
	 * the runtime matches whichever strategy actually painted the DOM. Does NOT
	 * write to the DOM.
	 */
	static syncFromDom(): void {
		if (typeof document === "undefined") return;
		const next = document.documentElement.classList.contains(ColorScheme.DARK)
			? ColorScheme.DARK
			: ColorScheme.LIGHT;
		if (next !== _current) _current = next;
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
		return (globalThis.localStorage?.getItem(_key) as Scheme) || fallback;
	}

	/**
	 * Backward-compatible alias for `current`.
	 */
	static getValue(): Scheme {
		return _current;
	}

	/**
	 * Toggles between light and dark, persists to localStorage, and updates the DOM.
	 */
	static toggle(): void {
		const next: Scheme =
			_current === ColorScheme.DARK ? ColorScheme.LIGHT : ColorScheme.DARK;
		globalThis.localStorage?.setItem(_key, next);
		_applyDom(next);
		_current = next;
	}

	/**
	 * Resets color scheme to system preference by removing the localStorage value
	 * and re-applying the resolved scheme.
	 */
	static reset(): void {
		globalThis.localStorage?.removeItem(_key);
		_sync();
	}
}

if (typeof window !== "undefined") {
	// Seed from localStorage (with system-pref fallback). Reading from the DOM
	// here is unreliable: module init runs before the hydration component's
	// inline <script> is appended to <head>, so the dark class isn't there yet.
	_current = _compute();
	window.addEventListener("storage", (e) => {
		if (e.key === _key) _sync();
	});
}
