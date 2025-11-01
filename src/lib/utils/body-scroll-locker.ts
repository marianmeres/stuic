import { createClog } from "@marianmeres/clog";
import { isBrowser } from "./is-browser.js";

interface BodyStyles {
	position: string | null;
	top: string | null;
	width: string | null;
	overflow: string | null;
}

const clog = createClog("BodyScroll").debug;
const document = globalThis.document ?? {};

/**
 * Helper for "locking" and "unlocking" body scroll (window.scrollY) position
 */
export class BodyScroll {
	static lock() {
		if (!isBrowser()) return;

		const data = document.body.dataset;

		// Only save the scroll position if it hasn't been saved already
		if (data.originalScrollY === undefined) {
			const scrollY = window.scrollY || window.pageYOffset;

			// Save body styles as serialized json
			data.originalScrollStyleBackup = BodyScroll._get_body_style();

			// Save the original scroll position in dataset
			data.originalScrollY = `${scrollY}`;
			data.scrollLockCount = "1";

			// Apply the fixed positioning
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
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
				BodyScroll._restore_body_styles(data.originalScrollStyleBackup!);

				// Remove our data attributes
				delete data.originalScrollY;
				delete data.originalScrollStyleBackup;
				delete data.scrollLockCount;

				// Restore the scroll position
				window.scrollTo(0, originalScrollY);
			}
		}
	}

	private static _get_body_style() {
		// we want only explicitly defined, not computed
		const style = document.body.style;
		return JSON.stringify({
			position: style.position || null,
			top: style.position || null,
			width: style.width || null,
			overflow: style.overflow || null,
		});
	}

	private static _restore_body_styles(originalJsonString: string) {
		let original: BodyStyles = { position: null, top: null, width: null, overflow: null };
		try {
			original = JSON.parse(originalJsonString);
		} catch (e) {}

		(["position", "top", "width", "overflow"] as (keyof BodyStyles)[]).forEach((k) => {
			if (original[k] !== null) {
				document.body.style[k] = original[k];
			} else {
				document.body.style.removeProperty(k);
			}
		});
	}
}
