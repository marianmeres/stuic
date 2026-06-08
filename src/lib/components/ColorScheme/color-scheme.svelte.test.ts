import { expect, test, beforeEach } from "vitest";
import { flushSync } from "svelte";
import { ColorScheme } from "./color-scheme.svelte.js";

// NOT a render test. ColorScheme is a module-level Svelte $state SINGLETON: its
// `current` getter, the persisted localStorage key, and the `dark` class on <html>
// are all shared process-wide. Because the module's $state and `_key` survive
// across tests in the same browser worker, every test must isolate itself by
// resetting the three pieces of shared state up front, then assert ABSOLUTE
// post-conditions it sets within the test (never cross-test deltas).
//
// Isolation works because reset() removes the persisted key and calls the
// internal _sync(): with no localStorage value AND the dark class cleared,
// _compute() returns "light", so `current` lands back on "light" deterministically.
beforeEach(() => {
	localStorage.removeItem(ColorScheme.KEY);
	document.documentElement.classList.remove("dark");
	ColorScheme.reset();
});

const isDark = () => document.documentElement.classList.contains("dark");

test("KEY defaults to 'stuic-color-scheme'", () => {
	expect(ColorScheme.KEY).toBe("stuic-color-scheme");
});

test("beforeEach isolation lands current/DOM/storage in the light state", () => {
	expect(ColorScheme.current).toBe("light");
	expect(isDark()).toBe(false);
	expect(localStorage.getItem(ColorScheme.KEY)).toBeNull();
});

test("toggle() light -> dark sets current, persists 'dark', adds the dark class", () => {
	// Guarantee a known light starting point regardless of singleton bleed.
	if (ColorScheme.current === "dark") ColorScheme.toggle();
	expect(ColorScheme.current).toBe("light");

	ColorScheme.toggle();

	expect(ColorScheme.current).toBe("dark");
	expect(localStorage.getItem(ColorScheme.KEY)).toBe("dark");
	expect(isDark()).toBe(true);
});

test("toggle() dark -> light reverts current, persists 'light', removes the dark class", () => {
	if (ColorScheme.current === "light") ColorScheme.toggle();
	expect(ColorScheme.current).toBe("dark");

	ColorScheme.toggle();

	expect(ColorScheme.current).toBe("light");
	expect(localStorage.getItem(ColorScheme.KEY)).toBe("light");
	expect(isDark()).toBe(false);
});

test("getLocalValue() reflects the persisted localStorage value after toggling to dark", () => {
	if (ColorScheme.current === "dark") ColorScheme.toggle();
	expect(ColorScheme.current).toBe("light");

	ColorScheme.toggle(); // -> dark, writes "dark" to storage

	expect(ColorScheme.getLocalValue()).toBe("dark");
	// it is a direct read of localStorage, not the reactive snapshot
	expect(ColorScheme.getLocalValue()).toBe(localStorage.getItem(ColorScheme.KEY));
});

test("getLocalValue() returns its fallback when nothing is persisted", () => {
	// beforeEach removed the key, so storage is empty for this key.
	expect(localStorage.getItem(ColorScheme.KEY)).toBeNull();
	expect(ColorScheme.getLocalValue()).toBe("light"); // default fallback
	expect(ColorScheme.getLocalValue("dark")).toBe("dark"); // explicit fallback
});

test("reset() removes the persisted key from localStorage", () => {
	if (ColorScheme.current === "dark") ColorScheme.toggle();
	ColorScheme.toggle(); // -> dark, persists "dark"
	expect(localStorage.getItem(ColorScheme.KEY)).toBe("dark");

	ColorScheme.reset();

	expect(localStorage.getItem(ColorScheme.KEY)).toBeNull();
});

test("getValue() is an alias of current", () => {
	expect(ColorScheme.getValue()).toBe(ColorScheme.current);

	if (ColorScheme.current === "dark") ColorScheme.toggle();
	ColorScheme.toggle(); // -> dark
	expect(ColorScheme.getValue()).toBe("dark");
	expect(ColorScheme.getValue()).toBe(ColorScheme.current);
});

test("current is $state: a $derived recomputes when toggle() flips the scheme", () => {
	if (ColorScheme.current === "dark") ColorScheme.toggle();
	expect(ColorScheme.current).toBe("light");

	// Observe a $derived(ColorScheme.current) through a tracking $effect: reading
	// the derived directly from test code (`expect(label)...`) triggers Svelte's
	// `state_referenced_locally` warning and only ever "works" because deriveds
	// recompute lazily on read, not because of the flushSync — a misleading pass.
	// Recording the value inside an $effect proves the dependency is actually
	// tracked and re-runs on toggle. flushSync drives effect runs synchronously
	// so we can assert without timers.
	const seen: string[] = [];
	const cleanup = $effect.root(() => {
		const label = $derived(`scheme:${ColorScheme.current}`);
		$effect(() => {
			seen.push(label);
		});
	});

	flushSync();
	expect(seen.at(-1)).toBe("scheme:light");

	ColorScheme.toggle(); // -> dark
	flushSync();
	expect(seen.at(-1)).toBe("scheme:dark");

	cleanup();
});
