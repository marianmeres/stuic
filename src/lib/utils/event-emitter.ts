/** Sugar, Ah, Honey, Honey... */
export class EventEmitter extends EventTarget {
	#abortController = new AbortController();

	constructor() {
		super();
	}

	/** Overriding so we can use removeAll (via the abortController) later... */
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

	/** Yeah! */
	removeAllListeners() {
		this.#abortController.abort();
		this.#abortController = new AbortController(); // reset for future listeners
	}

	/** Alias for dispatchEvent(CustomEvent) */
	emit(eventName: string, detail: any = null) {
		this.dispatchEvent(new CustomEvent(eventName, { detail }));
	}

	/** Alias for addEventListener */
	on(
		eventName: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	) {
		this.addEventListener(eventName, listener, options);
		return () => this.removeEventListener(eventName, listener);
	}

	/** Alias for removeEventListener */
	off(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.removeEventListener(eventName, listener);
		return this;
	}

	/** Alias for addEventListener with once flag */
	once(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.addEventListener(eventName, listener, { once: true });
		return () => this.removeEventListener(eventName, listener);
	}
}
