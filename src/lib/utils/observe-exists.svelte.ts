/**
 * Observes DOM changes and reactively tracks whether an element matching the selector exists.
 *
 * Uses MutationObserver to watch for DOM changes and updates a reactive `current` property
 * that indicates whether the element is present.
 *
 * @param selector - A CSS selector to watch for
 * @param options - Optional configuration
 * @param options.rootElement - The root element to observe (default: document.body)
 * @returns An object with reactive `current` property, `disconnect()` and `forceCheck()` methods
 * @throws TypeError if selector is empty
 *
 * @example
 * ```ts
 * const modalExists = observeExists('.modal-open');
 *
 * // In a component:
 * {#if modalExists.current}
 *   <Backdrop />
 * {/if}
 *
 * // Cleanup:
 * onDestroy(() => modalExists.disconnect());
 * ```
 */
export function observeExists(
	selector: string,
	options: Partial<{
		rootElement: HTMLElement;
	}> = {}
) {
	if (!selector) throw new TypeError("Expecting non empty selector");
	const { rootElement = document.body } = options;
	const ns = `[observeExists] [${selector}]`;
	const clog = (...args: unknown[]) => console.debug(ns, ...args);

	const check = () => rootElement.querySelector(selector) !== null;

	let current = $state(check());

	//
	const observer = new MutationObserver((mutations) => {
		let shouldCheck = false;

		for (const mutation of mutations) {
			if (mutation.type === "childList") {
				// was something added or removed?
				if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
					shouldCheck = true;
					break;
				}
			}
		}

		if (shouldCheck) current = check();
	});

	// start observing now
	clog(`connecting...`);
	observer.observe(rootElement, { childList: true, subtree: true });

	return {
		get current() {
			return current;
		},
		disconnect() {
			clog(`disconnecting...`);
			observer.disconnect();
		},
		forceCheck() {
			check();
		},
	};
}
