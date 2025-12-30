/**
 * Preloads a single image by creating an Image element and loading the URL.
 *
 * @param url - The image URL to preload
 * @param debug - If true, logs debug messages to console
 * @returns A Promise that resolves with the loaded Image element, or rejects on error
 *
 * @example
 * ```ts
 * await preloadImg('/hero.jpg');
 * // Image is now cached by the browser
 * ```
 */
export function preloadImg(url: string, debug = false) {
	if (debug) console.debug(`preloading: ${url}`);
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

/**
 * Preloads multiple images in parallel.
 *
 * @param urls - Array of image URLs to preload
 * @param debug - If true, logs debug messages to console
 * @returns A Promise that resolves when all images are loaded
 *
 * @example
 * ```ts
 * await preloadImgs(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
 * // All images are now cached
 * ```
 */
export function preloadImgs(urls: string[], debug = false) {
	return Promise.all(urls.map((url) => preloadImg(url, debug)));
}
