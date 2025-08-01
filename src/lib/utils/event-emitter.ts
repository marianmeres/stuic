/** Sugar, Ah, Honey, Honey... */
export class EventEmitter extends EventTarget {
	constructor() {
		super();
	}

	/** Alias for dispatchEvent(CustomEvent) */
	emit(eventName: string, detail: any = null) {
		this.dispatchEvent(new CustomEvent(eventName, { detail }));
	}

	/** Alias for addEventListener */
	on(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.addEventListener(eventName, listener);
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
