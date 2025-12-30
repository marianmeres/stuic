import { localStorageValue, sessionStorageValue } from "./storage-abstraction.js";

/**
 * A reactive state class that automatically persists to localStorage or sessionStorage.
 *
 * Changes to `current` are automatically saved to storage. On initialization,
 * the value is loaded from storage if it exists.
 *
 * @typeParam T - The type of the stored value
 */
class PersistentState<T> {
	#current = $state<T>();

	constructor(
		public readonly key: string,
		public readonly initialValue: T,
		public readonly type: "local" | "session" = "session"
	) {
		this.current = this.#stored().get() ?? this.initialValue;
	}

	#stored() {
		const strg = this.type === "local" ? localStorageValue : sessionStorageValue;
		return strg(this.key, this.initialValue);
	}

	#save() {
		this.#stored().set(this.#current as T);
	}

	get current(): T {
		return this.#current!;
	}

	set current(val: T) {
		this.#current = val;
		this.#save();
	}

	reset() {
		this.current = this.initialValue;
	}

	remove() {
		this.#stored().remove();
	}
}

/**
 * Creates a reactive state that persists to localStorage.
 *
 * The value is automatically loaded from storage on creation and saved on every change.
 *
 * @typeParam T - The type of the stored value
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist in storage
 * @returns A PersistentState instance with reactive `current` property
 *
 * @example
 * ```ts
 * const theme = localStorageState('theme', 'light');
 *
 * // Read:
 * console.log(theme.current); // 'light'
 *
 * // Write (automatically persisted):
 * theme.current = 'dark';
 *
 * // Reset to initial value:
 * theme.reset();
 * ```
 */
export function localStorageState<T>(key: string, initialValue: T) {
	return new PersistentState<T>(key, initialValue, "local");
}

/**
 * Creates a reactive state that persists to sessionStorage.
 *
 * Similar to `localStorageState` but data is cleared when the browser session ends.
 *
 * @typeParam T - The type of the stored value
 * @param key - The sessionStorage key
 * @param initialValue - Default value if key doesn't exist in storage
 * @returns A PersistentState instance with reactive `current` property
 *
 * @example
 * ```ts
 * const formDraft = sessionStorageState('draft', { title: '', body: '' });
 * formDraft.current = { title: 'My Post', body: '...' };
 * // Data persists until browser tab/window is closed
 * ```
 */
export function sessionStorageState<T>(key: string, initialValue: T) {
	return new PersistentState<T>(key, initialValue, "session");
}
