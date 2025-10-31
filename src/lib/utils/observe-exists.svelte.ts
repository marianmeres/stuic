/** Will observe DOM changes and triggers callback when element presence changes */
export function observeExists(
	selector: string,
	options: Partial<{
		rootElement: HTMLElement;
	}> = {}
) {
	if (!selector) throw new TypeError("Expecting non empty selector");
	const { rootElement = document.body } = options;
	const ns = `[observeExists] [${selector}]`;
	const clog = (...args: any[]) => console.debug(ns, ...args);

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
