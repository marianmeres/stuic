type Scheme = "dark" | "light";

/**
 * What the viewer chose: a scheme, or `"system"` — nothing stored, so the app's
 * default applies (the OS setting, when the runtime follows it).
 */
export type ColorSchemePreference = Scheme | "system";

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
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";
let _key = DEFAULT_KEY;
let _followSystem = false;
let _current = $state<Scheme>("light");
let _preference = $state<ColorSchemePreference>("system");

function _stored(): Scheme | null {
	const local = globalThis.localStorage?.getItem(_key);
	return local === "dark" || local === "light" ? local : null;
}

function _compute(): Scheme {
	const local = _stored();
	if (local) return local;
	// No persisted preference. Following the OS (an explicit opt-in — see
	// `configure({ followSystem })`), the OS decides. Otherwise defer to whatever
	// the DOM (SSR'd <html> class or a prior bootstrap) currently shows: the
	// runtime has no opinion of its own.
	if (_followSystem) return ColorScheme.getSystemValue();
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

// Subscribed only while following the OS: an app that never opts in never
// listens. An OS switch (e.g. scheduled dark mode at sunset) then repaints an
// open page — unless a preference is stored, which _compute() lets win.
let _systemQuery: MediaQueryList | null = null;
function _onSystemChange(): void {
	_sync();
}

function _setFollowSystem(follow: boolean): void {
	if (follow === _followSystem) return;
	_followSystem = follow;
	if (follow) {
		_systemQuery = globalThis.matchMedia?.(SYSTEM_DARK_QUERY) ?? null;
		_systemQuery?.addEventListener?.("change", _onSystemChange);
	} else {
		_systemQuery?.removeEventListener?.("change", _onSystemChange);
		_systemQuery = null;
	}
}

function _sync(): void {
	_preference = _stored() ?? "system";
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
 * // Three-state: "system" | "light" | "dark" (reactive), and set it
 * const pref = ColorScheme.preference;
 * ColorScheme.setPreference("system");
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
 * - Runtime never auto-derives from `prefers-color-scheme` unless told to.
 *   When no preference is stored, it defers to whatever class the SSR'd
 *   `<html>` already has. To follow the OS — at first paint and live, as the
 *   OS setting changes — mount `<ColorSchemeSystemAware />`, call
 *   `configure({ followSystem: true })`, or `setPreference("system")`.
 */
export class ColorScheme {
	static readonly DARK = "dark" as const;
	static readonly LIGHT = "light" as const;
	static readonly SYSTEM = "system" as const;

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
	 *
	 * `followSystem: true` makes the OS setting (`prefers-color-scheme`) the
	 * scheme whenever no preference is stored — applied at once, and again every
	 * time the OS setting changes while the page is open. A stored "light" or
	 * "dark" still wins. `<ColorSchemeSystemAware />` turns it on.
	 */
	static configure(opts: { key?: string; followSystem?: boolean }): void {
		let changed = false;
		if (opts?.key && opts.key !== _key) {
			_key = opts.key;
			if (typeof window !== "undefined") window.__COLOR_SCHEME_KEY__ = opts.key;
			changed = true;
		}
		if (typeof opts?.followSystem === "boolean" && opts.followSystem !== _followSystem) {
			_setFollowSystem(opts.followSystem);
			changed = true;
		}
		if (changed) _sync();
	}

	/**
	 * Whether the runtime follows the OS setting when no preference is stored
	 * (see `configure({ followSystem })`).
	 */
	static get followsSystem(): boolean {
		return _followSystem;
	}

	/**
	 * Reactive current value. Read inside `$derived`, `$effect`, or a Svelte
	 * template to react to scheme changes (including cross-tab `storage` events).
	 */
	static get current(): Scheme {
		return _current;
	}

	/**
	 * Reactive stored preference: `"light"` or `"dark"` when the viewer picked
	 * one, `"system"` when nothing is stored. `current` is what is on screen;
	 * this is what was chosen. For a three-state system | light | dark control.
	 */
	static get preference(): ColorSchemePreference {
		return _preference;
	}

	/**
	 * Set the preference. `"light"` / `"dark"` are persisted and applied.
	 * `"system"` clears the stored value, applies the OS setting and follows it
	 * from then on — calling it is the opt-in, so it also turns `followSystem`
	 * on for the rest of the session. For first paint to agree after a reload,
	 * mount `<ColorSchemeSystemAware />` (or ship an equivalent bootstrap).
	 */
	static setPreference(preference: ColorSchemePreference): void {
		if (preference === ColorScheme.SYSTEM) {
			globalThis.localStorage?.removeItem(_key);
			_setFollowSystem(true);
		} else {
			globalThis.localStorage?.setItem(_key, preference);
		}
		_preference = preference;
		_current = _compute();
		_applyDom(_current);
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
	 * Reads the `prefers-color-scheme` system setting. The runtime consults it
	 * only when following the OS (`configure({ followSystem: true })`,
	 * `<ColorSchemeSystemAware />` or `setPreference("system")`).
	 */
	static getSystemValue(): Scheme {
		return globalThis.matchMedia?.(SYSTEM_DARK_QUERY).matches
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
		_preference = next;
	}

	/**
	 * Clears the persisted preference from `localStorage`. Without
	 * `followSystem` it does NOT change the current visual state in the active
	 * session — `_sync()` will read the (now empty) storage and the DOM (last
	 * applied class) and find no change; the visual revert to the app's SSR'd
	 * default happens on the next page load. With `followSystem` the OS setting
	 * applies at once — the same as `setPreference("system")`.
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
	_preference = _stored() ?? "system";
	window.addEventListener("storage", (e) => {
		if (e.key === _key) _sync();
	});
}
