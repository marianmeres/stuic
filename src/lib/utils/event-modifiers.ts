export function once(fn: (e: Event) => any) {
	return function (e: Event) {
		// @ts-ignore
		if (fn) fn.call(this, e);
		fn = null as any;
	};
}

export function preventDefault(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.preventDefault();
		// @ts-ignore
		fn?.call(this, e);
	};
}

export function stopPropagation(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.stopPropagation();
		// @ts-ignore
		fn?.call(this, e);
	};
}

export function stopImmediatePropagation(fn?: (e: Event) => any) {
	return function (e: Event) {
		e.stopImmediatePropagation();
		// @ts-ignore
		fn?.call(this, e);
	};
}
