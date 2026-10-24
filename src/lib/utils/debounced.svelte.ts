import { watch } from "./watch.svelte.js";

/**
 * A reactive, debounced mirror of a getter's value.
 *
 * `current` starts as the getter's initial value. Every change of the source (re)starts a
 * timer, and `current` catches up only once `wait` ms pass with no further change.
 * Typeahead search is the typical use: bind the input to raw state and fetch on
 * `debounced.current`.
 *
 * Must be constructed during component initialization (it sets up effects). A pending
 * timer is dropped when the owning component is destroyed.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	let q = $state("");
 * 	const debounced = new Debounced(() => q, 150);
 * 	watch(() => debounced.current, (query) => search(query));
 * </script>
 *
 * <input bind:value={q} />
 * ```
 */
export class Debounced<T> {
	#current = $state<T | undefined>(undefined);
	#pending = $state(false);
	#timeout: ReturnType<typeof setTimeout> | null = null;
	#getter: () => T;
	#wait: number;

	/**
	 * @param getter Returns the (reactive) value to debounce.
	 * @param wait Delay in ms after the last change before `current` updates. Default 250.
	 */
	constructor(getter: () => T, wait = 250) {
		this.#getter = getter;
		this.#wait = wait;
		this.#current = getter();

		this.cancel = this.cancel.bind(this);
		this.setImmediately = this.setImmediately.bind(this);
		this.updateImmediately = this.updateImmediately.bind(this);

		// lazy: the initial value is already in place, only changes need the timer
		watch(getter, () => this.#schedule(), { lazy: true });

		// destroy -> drop the pending timer so it cannot write into a dead component
		$effect(() => () => this.cancel());
	}

	#schedule() {
		this.cancel();
		this.#pending = true;
		this.#timeout = setTimeout(() => {
			this.#timeout = null;
			this.#pending = false;
			this.#current = this.#getter();
		}, this.#wait);
	}

	/** The debounced value. */
	get current(): T {
		return this.#current as T;
	}

	/** Whether a timer is currently pending (reactive). */
	get pending(): boolean {
		return this.#pending;
	}

	/** Drop the pending timer (if any); `current` stays as it is. */
	cancel(): void {
		if (this.#timeout !== null) {
			clearTimeout(this.#timeout);
			this.#timeout = null;
		}
		this.#pending = false;
	}

	/** Skip the wait: sync `current` to the source value right now. */
	updateImmediately(): void {
		this.cancel();
		this.#current = this.#getter();
	}

	/** Skip the wait: set `current` to `value` right now. */
	setImmediately(value: T): void {
		this.cancel();
		this.#current = value;
	}
}
