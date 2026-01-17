import { isBrowser } from "./is-browser.js";

interface BodyStyles {
	position: string | null;
	top: string | null;
	width: string | null;
	overflow: string | null;
	left: string | null;
	right: string | null;
}

// const clog = createClog("BodyScroll").debug;
const document = globalThis.document ?? {};

/**
 * A utility class for locking and unlocking body scroll position.
 *
 * Useful for modals, drawers, and other overlay components that need to prevent
 * background scrolling. Uses a reference counter to support nested lock/unlock calls.
 *
 * @example
 * ```ts
 * // Lock scroll when opening modal
 * BodyScroll.lock();
 *
 * // Unlock when closing
 * BodyScroll.unlock();
 *
 * // Supports nested calls - only unlocks when all locks are released
 * BodyScroll.lock();  // count: 1
 * BodyScroll.lock();  // count: 2
 * BodyScroll.unlock(); // count: 1 (still locked)
 * BodyScroll.unlock(); // count: 0 (now unlocked)
 * ```
 */
export class BodyScroll {
	static lock() {
		if (!isBrowser()) return;

		const data = document.body.dataset;

		// Only save the scroll position if it hasn't been saved already
		if (data.originalScrollY === undefined) {
			const scrollY = window.scrollY || window.pageYOffset;

			// Save body styles as serialized json
			data.originalScrollStyleBackup = BodyScroll.#get_body_style();

			// Save the original scroll position in dataset
			data.originalScrollY = `${scrollY}`;
			data.scrollLockCount = "1";

			// Apply the fixed positioning
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
			//
			document.body.style.left = "0";
			document.body.style.right = "0";
		} else {
			// Another component already locked the scroll, just increment the counter
			const currentCount = parseInt(data.scrollLockCount!, 10);
			data.scrollLockCount = `${currentCount + 1}`;
		}
	}

	static unlock() {
		if (!isBrowser()) return;

		const data = document.body.dataset;

		// Only proceed if scroll is currently locked
		if (data.scrollLockCount !== undefined) {
			const count = parseInt(data.scrollLockCount, 10);

			if (count > 1) {
				// Other components still need the lock, just decrement the counter
				data.scrollLockCount = `${count - 1}`;
			} else {
				// This is the last component, restore everything
				const originalScrollY = parseInt(data.originalScrollY!, 10);
				BodyScroll.#restore_body_styles(data.originalScrollStyleBackup!);

				// Remove our data attributes
				delete data.originalScrollY;
				delete data.originalScrollStyleBackup;
				delete data.scrollLockCount;

				// Restore the scroll position
				window.scrollTo(0, originalScrollY);
			}
		}
	}

	static #get_body_style() {
		// we want only explicitly defined, not computed
		const style = document.body.style;
		return JSON.stringify({
			position: style.position || null,
			top: style.position || null,
			width: style.width || null,
			overflow: style.overflow || null,
			left: style.left || null,
			right: style.left || null,
		});
	}

	static #restore_body_styles(originalJsonString: string) {
		let original: BodyStyles = {
			position: null,
			top: null,
			width: null,
			overflow: null,
			left: null,
			right: null,
		};
		try {
			original = JSON.parse(originalJsonString);
		} catch {
			// ignore parse errors, use defaults
		}

		(["position", "top", "width", "overflow"] as (keyof BodyStyles)[]).forEach((k) => {
			if (original[k] !== null) {
				document.body.style[k] = original[k];
			} else {
				document.body.style.removeProperty(k);
			}
		});
	}
}
