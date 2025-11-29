/**
 * A convenient wrapper around `EventTarget` with a friendlier API.
 *
 * Provides `on`, `off`, `once`, `emit`, and `removeAllListeners` methods similar to Node.js EventEmitter.
 * Uses AbortController internally for efficient listener cleanup.
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter();
 *
 * const unsub = emitter.on('message', (e) => console.log(e.detail));
 * emitter.emit('message', { text: 'Hello!' });
 *
 * unsub(); // Remove the listener
 * // or
 * emitter.removeAllListeners(); // Remove all listeners
 * ```
 */
export class EventEmitter extends EventTarget {
	#abortController = new AbortController();

	constructor() {
		super();
	}

	/**
	 * Adds an event listener with automatic abort signal attachment.
	 * Overrides the native method to enable `removeAllListeners()` functionality.
	 */
	override addEventListener(
		type: string,
		listener: any, // fuck it (we would need 3 signatures)
		options: boolean | AddEventListenerOptions = {}
	): void {
		// normalize opts (for the `once` shorthand)
		options = typeof options === "boolean" ? { capture: options } : options;

		// make sure to always add abort signal
		options = { ...options, signal: this.#abortController.signal };

		super.addEventListener(type, listener, options);
	}

	/**
	 * Removes all registered event listeners at once.
	 */
	removeAllListeners() {
		this.#abortController.abort();
		this.#abortController = new AbortController(); // reset for future listeners
	}

	/**
	 * Emits an event with optional detail data.
	 * @param eventName - The name of the event to emit
	 * @param detail - Optional data to attach to the event
	 */
	emit(eventName: string, detail: any = null) {
		this.dispatchEvent(new CustomEvent(eventName, { detail }));
	}

	/**
	 * Subscribes to an event. Returns an unsubscribe function.
	 * @param eventName - The name of the event
	 * @param listener - The callback function
	 * @param options - Optional event listener options
	 * @returns A function to remove the listener
	 */
	on(
		eventName: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	) {
		this.addEventListener(eventName, listener, options);
		return () => this.removeEventListener(eventName, listener);
	}

	/**
	 * Removes an event listener.
	 * @param eventName - The name of the event
	 * @param listener - The callback function to remove
	 * @returns `this` for chaining
	 */
	off(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.removeEventListener(eventName, listener);
		return this;
	}

	/**
	 * Subscribes to an event for a single invocation only.
	 * @param eventName - The name of the event
	 * @param listener - The callback function (called at most once)
	 * @returns A function to remove the listener before it fires
	 */
	once(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.addEventListener(eventName, listener, { once: true });
		return () => this.removeEventListener(eventName, listener);
	}
}
