// actual worker
export function increaseHeightToScrollHeight(el: HTMLElement, max = 0, min = 0) {
	//
	let h = max ? Math.min(max, el.scrollHeight) : el.scrollHeight;
	h = Math.max(min, h);

	// only increase size
	if (el.getBoundingClientRect().height < h) {
		el.style.height = `${h}px`;
	}
}

// action wrap
export function autogrow(
	el: HTMLTextAreaElement,
	options: Partial<{ max: number; min: number; allowed: boolean }> | null = null
) {
	const { max, min, allowed } = { max: 250, min: 0, allowed: true, ...(options || {}) };
	if (!allowed) return;

	const _doGrow = () => increaseHeightToScrollHeight(el, max, min);
	_doGrow(); // resize asap (on mount) as well...

	el.addEventListener('input', _doGrow);
	return {
		destroy: () => el.removeEventListener('input', _doGrow),
	};
}
