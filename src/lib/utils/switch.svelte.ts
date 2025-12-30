import {
	localStorageValue,
	memoryStorageValue,
	sessionStorageValue,
} from "./storage-abstraction.js";

const storageTypeFactory = {
	local: localStorageValue,
	session: sessionStorageValue,
	memory: memoryStorageValue,
};

/**
 * A reactive three-state switch (true, false, null/undefined) with optional associated data.
 *
 * Useful for managing modal visibility, toggle states, or any tri-state boolean with metadata.
 * Optionally persists to localStorage, sessionStorage, or memory.
 *
 * @typeParam T - The type of associated data
 *
 * @example
 * ```ts
 * // Create a modal state with associated data
 * const modal = new SwitchState<{ id: number }>('edit-modal');
 *
 * // Open with data:
 * modal.on({ id: 123 });
 *
 * // Check state:
 * if (modal.isOn) {
 *   console.log(modal.data.id); // 123
 * }
 *
 * // Close:
 * modal.off();
 *
 * // Toggle:
 * modal.toggle();
 *
 * // Reset to undefined/null state:
 * modal.reset();
 * ```
 */
export class SwitchState<T> {
	// actual switch value (1 of 3 possible). Note that outer `undefined` is always inner `null`.
	#current: boolean | null = $state(null);

	// arbitrary data associated with the switch
	#data: T | null | undefined = $state<T | null | undefined>(null);

	#storage;

	onOff: ((data: T, self: SwitchState<T>) => void) | undefined | null = null;

	constructor(
		public readonly key: string,
		initial: boolean | null = null,
		public readonly storageType: "memory" | "local" | "session" = "memory",
		initialData: T | null = null
	) {
		this.#current = initial;
		this.#data = initialData;

		if (typeof storageTypeFactory[this.storageType] === "function") {
			this.#storage = storageTypeFactory[this.storageType]<{
				value: boolean | null;
				data: T | null;
			}>(this.key, {
				value: initial,
				data: null,
			});
		} else {
			console.warn(`Unknown storageType "${this.storageType}"`);
		}
	}

	// still public, but should not be used directly unless necessary for some reason
	__set(value: boolean | null, data?: T | null | undefined) {
		if (value !== null && typeof value !== "boolean") value = Boolean(value);
		this.#current = value;

		// only defined data will be set
		if (data !== undefined) this.#data = data;

		// mirror to storage
		this.#storage?.set({ value, data: data ?? null });

		// if we're closing fire (once) onOff if exists
		if (!value) {
			this.onOff?.(this.data, this);
			this.onOff = null;
		}
	}

	on(data?: T | null | undefined) {
		this.__set(true, data);
	}

	off(data?: T | null | undefined) {
		this.__set(false, data);
	}

	toggle(data?: T | null | undefined) {
		this.__set(!this.#current, data);
	}

	reset(data?: T | null | undefined) {
		this.__set(null, data);
	}

	get isOn() {
		return this.#current === true;
	}

	get isOff() {
		// both `false` or `null`
		return this.#current !== true;
	}

	// the outer "undefined" value is the 3rd state of the switch (internally the raw
	// value is always `null`)
	get isUndefined() {
		return this.#current === null;
	}

	get current() {
		return this.#current;
	}

	get data() {
		return this.#data as T;
	}

	set data(data: T) {
		this.__set(this.#current, data);
	}

	addData(data: T) {
		this.data = { ...(this.data || {}), ...data };
	}
}
