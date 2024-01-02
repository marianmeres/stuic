// copied from skeleton

interface FocusTrapOptions {
	enabled?: boolean;
	autoFocusFirst?: boolean;
}

const defaults: FocusTrapOptions = { enabled: true, autoFocusFirst: true };

// Action: Focus Trap
export function focusTrap(node: HTMLElement, options: FocusTrapOptions = {}) {
	let { enabled, autoFocusFirst } = { ...defaults, ...(options || {}) };

	const focusableSelectors = [
		'[contentEditable=true]:not([tabindex^="-"])',
		//
		'button:not([disabled]):not([tabindex^="-"])',
		'input:not([disabled]):not([tabindex^="-"])',
		'select:not([disabled]):not([tabindex^="-"])',
		'textarea:not([disabled]):not([tabindex^="-"])',
		//
		'a[href]:not([tabindex^="-"])',
		'area[href]:not([tabindex^="-"])',
		'details:not([tabindex^="-"])',
		'iframe:not([tabindex^="-"])',
		//
		'[tabindex]:not([tabindex^="-"])',
	].join(',');

	let first: HTMLElement;
	let last: HTMLElement;

	// When the first element is selected, shift+tab pressed, jump to the last selectable item.
	function onFirstElemKeydown(e: KeyboardEvent): void {
		if (e.shiftKey && e.code === 'Tab') {
			e.preventDefault();
			last.focus();
		}
	}

	// When the last item selected, tab pressed, jump to the first selectable item.
	function onLastElemKeydown(e: KeyboardEvent): void {
		if (!e.shiftKey && e.code === 'Tab') {
			e.preventDefault();
			first.focus();
		}
	}

	const queryElements = (fromObserver: boolean) => {
		if (enabled === false) return;

		const focusable: HTMLElement[] = (
			[...node.querySelectorAll(focusableSelectors)] as HTMLElement[]
		)
			// in case I didn't get the selectors right, make sure to manually check as well...
			// (negligible overhead, if any...)
			.filter((e: HTMLElement) => {
				if (e.getAttribute('disabled') === '') return false;
				if ((e.getAttribute('tabindex') || '').startsWith('-')) return false;
				return true;
			})
			// important to sort by tabindex, so the first/last will work as expected
			.sort((e1: HTMLElement, e2: HTMLElement) => {
				const a = parseInt(e1.getAttribute('tabindex') || '0');
				const b = parseInt(e2.getAttribute('tabindex') || '0');
				return a - b;
			});

		if (focusable.length) {
			first = focusable[0];
			last = focusable[focusable.length - 1];

			// Auto-focus first focusable element only when not called from observer
			if (!fromObserver && autoFocusFirst) first.focus();

			// Listen for keydown on first & last element
			first.addEventListener('keydown', onFirstElemKeydown);
			last.addEventListener('keydown', onLastElemKeydown);
		}
	};

	queryElements(false);

	function cleanup(): void {
		if (first) first.removeEventListener('keydown', onFirstElemKeydown);
		if (last) last.removeEventListener('keydown', onLastElemKeydown);
	}

	// When children of node are changed (added or removed)
	const onObservationChange = (
		mutationRecords: MutationRecord[],
		observer: MutationObserver
	) => {
		if (mutationRecords.length) {
			cleanup();
			queryElements(true);
		}
		return observer;
	};
	const observer = new MutationObserver(onObservationChange);
	observer.observe(node, { childList: true, subtree: true });

	// Lifecycle
	return {
		update(options: FocusTrapOptions = {}) {
			options?.enabled ? queryElements(false) : cleanup();
		},
		destroy() {
			cleanup();
			observer.disconnect();
		},
	};
}
