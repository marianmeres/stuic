type Scheme = "dark" | "light";

declare global {
	interface Window {
		/**
		 * Optional global override for the localStorage key the inline bootstrap
		 * `<script>` in `<ColorSchemeLocal />` / `<ColorSchemeSystemAware />` reads
		 * from. Set this before the hydration component mounts (e.g. in
		 * `app.html` or at the very top of the root layout's `<script>`) to use a
		 * custom key with FOUC-free hydration. `ColorScheme.configure({ key })`
		 * also writes this global to keep runtime and bootstrap in sync.
		 */
		__COLOR_SCHEME_KEY__?: string;
	}
}

const DEFAULT_KEY = "stuic-color-scheme";
let _key = DEFAULT_KEY;
let _current = $state<Scheme>("light");

function _compute(): Scheme {
	const local = globalThis.localStorage?.getItem(_key) as Scheme | null;
	if (local === "dark" || local === "light") return local;
	// No persisted preference: defer to whatever the DOM (SSR'd <html> class
	// or a prior bootstrap) currently shows. The runtime has no opinion of
	// its own and never auto-derives from prefers-color-scheme.
	return globalThis?.document?.documentElement.classList.contains(ColorScheme.DARK)
		? ColorScheme.DARK
		: ColorScheme.LIGHT;
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
 * // Clear persisted preference (visual reverts on next reload)
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
 * - Runtime never auto-derives from `prefers-color-scheme`. When no
 *   preference is stored, it defers to whatever class the SSR'd `<html>`
 *   already has. To support OS-aware paint, mount
 *   `<ColorSchemeSystemAware />` (opt-in) or call `getSystemValue()` from
 *   your own UI.
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
	 *
	 * Also writes `window.__COLOR_SCHEME_KEY__` so a subsequent hydration
	 * component mount (or any external bootstrap script that reads the global)
	 * stays in sync with the runtime.
	 */
	static configure(opts: { key?: string }): void {
		if (opts?.key && opts.key !== _key) {
			_key = opts.key;
			if (typeof window !== "undefined") window.__COLOR_SCHEME_KEY__ = opts.key;
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
	 * Reads the `prefers-color-scheme` system setting. Manual-only utility —
	 * the runtime never invokes this implicitly. Wire it to a custom button if
	 * your app wants OS-aware behavior, e.g.
	 * `localStorage.setItem(ColorScheme.KEY, ColorScheme.getSystemValue())`
	 * followed by a re-sync, or mount `<ColorSchemeSystemAware />` for
	 * OS-aware first paint.
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
	 * Clears the persisted preference from `localStorage`. Does NOT change the
	 * current visual state in the active session — `_sync()` will read the
	 * (now empty) storage and the DOM (last applied class) and find no change.
	 * The visual revert to the app's SSR'd default happens on the next page
	 * load. The runtime never consults `prefers-color-scheme` on its own; call
	 * `ColorScheme.getSystemValue()` explicitly if you want that behavior.
	 */
	static reset(): void {
		globalThis.localStorage?.removeItem(_key);
		_sync();
	}
}

if (typeof window !== "undefined") {
	// If the app declared a custom key via the global (typical place: app.html,
	// before the bootstrap <script> runs), adopt it so the runtime reads/writes
	// the same key the bootstrap painted from.
	if (window.__COLOR_SCHEME_KEY__) _key = window.__COLOR_SCHEME_KEY__;
	// Seed from localStorage; if empty, fall back to the current <html> class
	// (set by SSR, app.html, or a bootstrap <script> in `<svelte:head>` that
	// has already executed inline). In CSR-only setups the bootstrap may run
	// after this read — that is fine, the hydration component's `$effect`
	// later calls `syncFromDom()` to reconcile.
	_current = _compute();
	window.addEventListener("storage", (e) => {
		if (e.key === _key) _sync();
	});
}
