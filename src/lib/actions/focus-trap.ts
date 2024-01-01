// copied from skeleton

interface FocusTrapOptions {
	enabled?: boolean;
	autoFocusFirst?: boolean;
}

const defaults: FocusTrapOptions = { enabled: true, autoFocusFirst: false };

// Action: Focus Trap
export function focusTrap(node: HTMLElement, options: FocusTrapOptions = {}) {
	let { enabled, autoFocusFirst } = { ...defaults, ...(options || {}) };

	const focusableSelectors = [
		'a[href]',
		'area[href]',
		'details',
		'iframe',

		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',

		'[contentEditable=true]',
		'[tabindex]',
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
			// i am unable to get the selectors right (still getting false positives),
			// but filtering manually works well
			.filter((e: HTMLElement) => {
				if (e.getAttribute('disabled') === '') return false;
				if ((e.getAttribute('tabindex') || '').startsWith('-')) return false;
				return true;
			})
			// sort by tabindex, so the first/last will work as expected
			.toSorted((e1, e2) => {
				let a = parseInt(e1.getAttribute('tabindex') || '0');
				let b = parseInt(e2.getAttribute('tabindex') || '0');
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
