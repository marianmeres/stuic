import { isBrowser } from "./is-browser.js";

/**
 * An in-memory storage implementation with the same interface as `localStorage`/`sessionStorage`.
 *
 * Used as a fallback when browser storage is unavailable (e.g., SSR, private browsing).
 */
export class MemoryStorage {
	#storage = new Map();

	setItem(key: string, value: any) {
		this.#storage.set(key, value);
	}
	getItem(key: string) {
		return this.#storage.get(key) ?? null;
	}
	removeItem(key: string) {
		this.#storage.delete(key);
	}
	clear() {
		this.#storage.clear();
	}
	get length() {
		return this.#storage.size;
	}
	entries() {
		return [...this.#storage.entries()];
	}
}

/**
 * A unified abstraction over localStorage, sessionStorage, and memory storage.
 *
 * Automatically falls back to memory storage in non-browser environments.
 * Handles JSON serialization/deserialization automatically.
 *
 * @example
 * ```ts
 * const storage = new StorageAbstraction('local');
 * storage.set('user', { name: 'John' });
 * storage.get('user'); // { name: 'John' }
 * ```
 */
export class StorageAbstraction {
	#type: "local" | "session" | "memory";
	#storage: Storage | MemoryStorage;
	#serializer: (v: any) => string = JSON.stringify;
	#deserializer: (v: string) => any = JSON.parse;

	constructor(
		storageType: "local" | "session" | "memory" = "local",
		serializer?: (v: any) => string,
		deserializer?: (v: string) => any
	) {
		this.#type = `${storageType}`.toLowerCase() as "local" | "session" | "memory";

		if (!isBrowser() || this.#type === "memory") {
			this.#storage = new MemoryStorage();
		} else if (this.#type === "local") {
			this.#storage = localStorage;
		} else {
			this.#storage = sessionStorage;
		}

		if (serializer) this.#serializer = serializer;
		if (deserializer) this.#deserializer = deserializer;
	}

	#serialize(value: any) {
		return this.#serializer(value);
	}

	#deserialize(value: any) {
		try {
			return this.#deserializer(value);
		} catch (e) {
			console.error(`Unable to deserialize value "${value}". Details: ${e}`);
			return value;
		}
	}

	set(key: string, value: any) {
		try {
			this.#storage.setItem(key, this.#serialize(value));
		} catch (e) {
			console.error(`Unable to set "${key}". Details: ${e}`);
		}
		return this;
	}

	get(key: string) {
		try {
			const value = this.#storage.getItem(key);
			return this.#deserialize(value);
		} catch (e) {
			console.error(`Unable to get "${key}". Details: ${e}`);
		}
	}

	remove(key: string) {
		try {
			this.#storage.removeItem(key);
			return true;
		} catch (e) {
			console.error(`Unable to remove "${key}". Details: ${e}`);
			return false;
		}
	}

	clear() {
		try {
			this.#storage.clear();
			return true;
		} catch (e) {
			console.error(`Unable to clear. Details: ${e}`);
			return false;
		}
	}

	has(key: string) {
		return this.#storage.getItem(key) !== null;
	}

	entries() {
		if (this.#type === "memory") return this.#storage.entries();

		const out = [];

		for (let i = 0; i < this.#storage.length; i++) {
			const key = (this.#storage as Storage).key(i);
			const value = this.#storage.getItem(key!);
			out.push([key, value]);
		}

		return out;
	}

	get length() {
		return this.#storage.length;
	}
}

function storage_value(type: "local" | "session" | "memory", key: string, initial: any) {
	const s = new StorageAbstraction(type);
	if (!s.has(key)) s.set(key, initial);

	return {
		get() {
			return s.get(key);
		},
		set(v: any) {
			return s.set(key, v);
		},
		remove() {
			s.remove(key);
		},
	};
}

/**
 * Creates a reactive-like value backed by localStorage.
 *
 * @param key - The storage key
 * @param initial - Initial value if key doesn't exist
 * @returns An object with `get()`, `set()`, and `remove()` methods
 *
 * @example
 * ```ts
 * const theme = localStorageValue('theme', 'light');
 * theme.get();        // 'light'
 * theme.set('dark');  // Persists to localStorage
 * ```
 */
export function localStorageValue(key: string, initial: any) {
	return storage_value("local", key, initial);
}

/**
 * Creates a reactive-like value backed by sessionStorage.
 *
 * @param key - The storage key
 * @param initial - Initial value if key doesn't exist
 * @returns An object with `get()`, `set()`, and `remove()` methods
 *
 * @example
 * ```ts
 * const token = sessionStorageValue('token', null);
 * token.set('abc123');
 * ```
 */
export function sessionStorageValue(key: string, initial: any) {
	return storage_value("session", key, initial);
}

/**
 * Creates a reactive-like value backed by in-memory storage.
 *
 * Useful for temporary storage that doesn't persist across page reloads.
 *
 * @param key - The storage key
 * @param initial - Initial value if key doesn't exist
 * @returns An object with `get()`, `set()`, and `remove()` methods
 */
export function memoryStorageValue(key: string, initial: any) {
	return storage_value("memory", key, initial);
}
