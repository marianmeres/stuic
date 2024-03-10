// initially copied from skeleton, adjusted

interface FocusTrapOptions {
	enabled?: boolean;
	autoFocusFirst?: boolean;
}

const defaults: FocusTrapOptions = { enabled: true, autoFocusFirst: true };

export function focusTrap(node: HTMLElement, options: FocusTrapOptions = {}) {
	let { enabled, autoFocusFirst } = { ...defaults, ...(options || {}) };

	const focusableSelectors = [
		'[contentEditable=true]',
		//
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		//
		'a[href]',
		'area[href]',
		'details',
		'iframe',
		// see more below on tabindexes
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

		let maxTabindex = 0;

		let focusable: HTMLElement[] = (
			[...node.querySelectorAll(focusableSelectors)] as HTMLElement[]
		)
			// filter negative tabindexes (afaik there is no :not([disabled] OR [tabindex^="-"]))
			.filter((e: HTMLElement) => {
				// reusing loop for a side job here... see sort below
				maxTabindex = Math.max(maxTabindex, parseInt(e.getAttribute('tabindex') || '0'));
				//
				if (e.getAttribute('disabled') === '') return false;
				if ((e.getAttribute('tabindex') || '').startsWith('-')) return false;
				return true;
			})
			// important to sort by tabindex, so the first/last will work as expected
			// but must increase zero to max + 1 first, because browsers focus zeros as last...
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
			.sort((e1: HTMLElement, e2: HTMLElement) => {
				const a = parseInt(e1.getAttribute('tabindex') || '0') || maxTabindex + 1;
				const b = parseInt(e2.getAttribute('tabindex') || '0') || maxTabindex + 1;
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
		first && first.removeEventListener('keydown', onFirstElemKeydown);
		last && last.removeEventListener('keydown', onLastElemKeydown);
	}

	// When children of node are changed (added or removed)
	const observer = new MutationObserver(
		(mutations: MutationRecord[], observer: MutationObserver) => {
			if (mutations.length) {
				cleanup();
				queryElements(true);
			}
			return observer;
		}
	);
	observer.observe(node, { childList: true, subtree: true });

	// Lifecycle
	return {
		update(options: FocusTrapOptions = {}) {
			enabled = !!options?.enabled;
			enabled ? queryElements(false) : cleanup();
		},
		destroy() {
			cleanup();
			observer.disconnect();
		},
	};
}
