import { beforeEach, expect, test, vi } from "vitest";
import { ColorScheme } from "./color-scheme.svelte.js";

// The three-state preference and OS following. A real browser cannot flip
// prefers-color-scheme from inside a test, so each test stubs `matchMedia` with
// a fake it controls BEFORE turning following on: the runtime subscribes to the
// query when following starts (and drops it when it stops), so the subscription
// lands on that test's fake. Same singleton caveats as color-scheme.svelte.test.ts:
// beforeEach resets every piece of shared state, assertions are absolute.

const KEY = "stuic-color-scheme";

function fakeOs(dark: boolean) {
	let matches = dark;
	const listeners = new Set<() => void>();
	const mql = {
		get matches() {
			return matches;
		},
		addEventListener: (_type: string, fn: () => void) => listeners.add(fn),
		removeEventListener: (_type: string, fn: () => void) => listeners.delete(fn),
	};
	vi.stubGlobal("matchMedia", () => mql);
	return {
		/** Flip the OS setting and fire `change`, as the browser would. */
		set(next: boolean) {
			matches = next;
			for (const fn of listeners) fn();
		},
		get listening() {
			return listeners.size;
		},
	};
}

beforeEach(() => {
	ColorScheme.configure({ followSystem: false });
	vi.unstubAllGlobals();
	localStorage.removeItem(KEY);
	document.documentElement.classList.remove("dark");
	ColorScheme.reset();
});

const isDark = () => document.documentElement.classList.contains("dark");

test("without followSystem the OS is never consulted: nothing stored defers to the DOM", () => {
	const os = fakeOs(true);
	expect(ColorScheme.followsSystem).toBe(false);
	expect(ColorScheme.preference).toBe("system");
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);

	os.set(false);
	os.set(true);
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);
});

test("configure({ followSystem: true }) applies the OS setting and follows it live", () => {
	const os = fakeOs(true);
	ColorScheme.configure({ followSystem: true });
	expect(ColorScheme.followsSystem).toBe(true);
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);

	os.set(false);
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);

	os.set(true);
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);

	// Stopping drops the subscription: nothing listens for an app that does not follow.
	expect(os.listening).toBe(1);
	ColorScheme.configure({ followSystem: false });
	expect(os.listening).toBe(0);
});

test("a stored preference wins over a followed OS setting, and over its changes", () => {
	localStorage.setItem(KEY, "light");
	const os = fakeOs(true);
	ColorScheme.configure({ followSystem: true });
	expect(ColorScheme.preference).toBe("light");
	expect(ColorScheme.current).toBe("light");

	os.set(false);
	os.set(true);
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);
});

test("setPreference('dark' | 'light') persists, applies and is the reported preference", () => {
	fakeOs(false);

	ColorScheme.setPreference("dark");
	expect(localStorage.getItem(KEY)).toBe("dark");
	expect(ColorScheme.preference).toBe("dark");
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);

	ColorScheme.setPreference("light");
	expect(localStorage.getItem(KEY)).toBe("light");
	expect(ColorScheme.preference).toBe("light");
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);
});

test("setPreference('system') clears the stored value, applies the OS and follows it", () => {
	const os = fakeOs(true);
	ColorScheme.setPreference("light");
	expect(isDark()).toBe(false);

	ColorScheme.setPreference("system");
	expect(localStorage.getItem(KEY)).toBeNull();
	expect(ColorScheme.preference).toBe("system");
	expect(ColorScheme.followsSystem).toBe(true);
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);

	os.set(false);
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);
});

test("toggle() makes the preference explicit", () => {
	fakeOs(false);
	expect(ColorScheme.preference).toBe("system");
	ColorScheme.toggle();
	expect(ColorScheme.preference).toBe("dark");
	ColorScheme.toggle();
	expect(ColorScheme.preference).toBe("light");
});

test("reset() while following the OS is setPreference('system')", () => {
	fakeOs(true);
	ColorScheme.configure({ followSystem: true });
	ColorScheme.setPreference("light");
	expect(isDark()).toBe(false);

	ColorScheme.reset();
	expect(ColorScheme.preference).toBe("system");
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);
});

test("another tab clearing the stored value hands the scheme back to the OS", () => {
	fakeOs(true);
	ColorScheme.configure({ followSystem: true });
	ColorScheme.setPreference("light");

	// What the other tab's setPreference("system") leaves behind, then the event
	// this tab receives for it.
	localStorage.removeItem(KEY);
	window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: null }));

	expect(ColorScheme.preference).toBe("system");
	expect(ColorScheme.current).toBe("dark");
	expect(isDark()).toBe(true);
});
