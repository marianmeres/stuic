/**
 * Options for the focus trap action.
 */
export interface FocusTrapOptions {
	enabled?: boolean;
	autoFocusFirst?: boolean;
}

const defaults: FocusTrapOptions = { enabled: true, autoFocusFirst: true };

/**
 * A Svelte action that traps keyboard focus within a container element.
 *
 * Prevents focus from leaving the container when using Tab/Shift+Tab navigation.
 * Useful for modals, dialogs, and other overlay components for accessibility compliance.
 *
 * Features:
 * - Auto-focuses the first focusable element on mount
 * - Respects tabindex ordering
 * - Handles dynamically added/removed elements via MutationObserver
 * - Excludes disabled elements and negative tabindexes
 *
 * @param node - The container element to trap focus within
 * @param options - Configuration options
 * @param options.enabled - Whether the trap is active (default: true)
 * @param options.autoFocusFirst - Auto-focus first focusable element (default: true)
 * @returns Svelte action lifecycle methods
 *
 * @example
 * ```svelte
 * <div use:focusTrap>
 *   <button>First (focused on mount)</button>
 *   <input type="text" />
 *   <button>Last (Tab wraps to First)</button>
 * </div>
 *
 * <!-- With options -->
 * <div use:focusTrap={{ enabled: isOpen, autoFocusFirst: false }}>
 *   ...
 * </div>
 * ```
 */
export function focusTrap(node: HTMLElement, options: FocusTrapOptions = {}) {
	let enabled: boolean;
	const { enabled: _enabled, autoFocusFirst } = { ...defaults, ...(options || {}) };
	enabled = _enabled ?? true;

	const focusableSelectors = [
		"[contentEditable=true]",
		//
		"button:not([disabled])",
		"input:not([disabled])",
		"select:not([disabled])",
		"textarea:not([disabled])",
		//
		"a[href]",
		"area[href]",
		"details",
		"iframe",
		// see more below on tabindexes
		'[tabindex]:not([tabindex^="-"])',
	].join(",");

	let first: HTMLElement;
	let last: HTMLElement;

	// When the first element is selected, shift+tab pressed, jump to the last selectable item.
	function onFirstElemKeydown(e: KeyboardEvent): void {
		if (e.shiftKey && e.code === "Tab") {
			e.preventDefault();
			last.focus();
		}
	}

	// When the last item selected, tab pressed, jump to the first selectable item.
	function onLastElemKeydown(e: KeyboardEvent): void {
		if (!e.shiftKey && e.code === "Tab") {
			e.preventDefault();
			first.focus();
		}
	}

	const queryElements = (fromObserver: boolean) => {
		if (enabled === false) return;

		let maxTabindex = 0;

		const focusable: HTMLElement[] = (
			[...node.querySelectorAll(focusableSelectors)] as HTMLElement[]
		)
			// filter negative tabindexes (afaik there is no :not([disabled] OR [tabindex^="-"]))
			.filter((e: HTMLElement) => {
				// reusing loop for a side job here... see sort below
				maxTabindex = Math.max(maxTabindex, parseInt(e.getAttribute("tabindex") || "0"));
				//
				if (e.getAttribute("disabled") === "") return false;
				if ((e.getAttribute("tabindex") || "").startsWith("-")) return false;
				return true;
			})
			// important to sort by tabindex, so the first/last will work as expected
			// but must increase zero to max + 1 first, because browsers focus zeros as last...
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
			.sort((e1: HTMLElement, e2: HTMLElement) => {
				const a = parseInt(e1.getAttribute("tabindex") || "0") || maxTabindex + 1;
				const b = parseInt(e2.getAttribute("tabindex") || "0") || maxTabindex + 1;
				return a - b;
			});

		if (focusable.length) {
			first = focusable[0];
			last = focusable[focusable.length - 1];

			// Auto-focus first focusable element only when not called from observer
			if (!fromObserver && autoFocusFirst) first.focus();

			// Listen for keydown on first & last element
			first.addEventListener("keydown", onFirstElemKeydown);
			last.addEventListener("keydown", onLastElemKeydown);
		}
	};

	queryElements(false);

	function cleanup(): void {
		if (first) first.removeEventListener("keydown", onFirstElemKeydown);
		if (last) last.removeEventListener("keydown", onLastElemKeydown);
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
			if (enabled) {
				queryElements(false);
			} else {
				cleanup();
			}
		},
		destroy() {
			cleanup();
			observer.disconnect();
		},
	};
}
