import { localStorageValue, sessionStorageValue } from "./storage-abstraction.js";

/**
 * Mirroring $state to local or session storage.
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
		this.#stored().set(this.#current);
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
 *
 */
export function localStorageState<T>(key: string, initialValue: T) {
	return new PersistentState<T>(key, initialValue, "local");
}

/**
 *
 */
export function sessionStorageState<T>(key: string, initialValue: T) {
	return new PersistentState<T>(key, initialValue, "session");
}
