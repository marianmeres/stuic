type Handler = (el: Node) => void;

export interface OnOutsideOptions {
	handler?: Handler | null;
	events?: string[];
}

// will notify and (optionally) execute on outside click/focusin/...
export const onOutside = (node: HTMLElement, options?: OnOutsideOptions) => {
	const DEFAULT_OPTIONS: OnOutsideOptions = {
		handler: null,
		events: ['click', 'focusin'],
	};
	const { handler, events } = { ...DEFAULT_OPTIONS, ...(options || {}) };

	const listener = (event: Event) => {
		if (!event?.target) return;
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('outside', { detail: event.target }));
			if (typeof handler === 'function') handler(event.target as Node);
		}
	};

	events?.forEach((eventName) => {
		document.addEventListener(eventName, listener, true);
	});

	return {
		destroy() {
			events?.forEach((eventName) => {
				document.removeEventListener(eventName, listener, true);
			});
		},
	};
};
