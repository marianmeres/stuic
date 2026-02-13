export interface PreloadImgOptions {
	src: string;
	srcset?: string;
	sizes?: string;
	debug?: boolean;
}

/**
 * Preloads a single image by creating an Image element and loading the URL.
 *
 * @param options - Image options including src, and optionally srcset, sizes, debug
 * @returns A Promise that resolves with the loaded Image element, or rejects on error
 *
 * @example
 * ```ts
 * await preloadImg({ src: '/hero.jpg' });
 * await preloadImg({ src: '/hero.jpg', srcset: '/hero-2x.jpg 2x', sizes: '100vw' });
 * ```
 */
export function preloadImg(options: PreloadImgOptions): Promise<HTMLImageElement> {
	if (options.debug) console.debug(`preloading: ${options.src}`);
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		if (options.srcset) img.srcset = options.srcset;
		if (options.sizes) img.sizes = options.sizes;
		img.src = options.src; // must be set AFTER srcset
	});
}

/**
 * Preloads multiple images in parallel.
 *
 * @param options - Array of image options to preload
 * @returns A Promise that resolves when all images are loaded
 *
 * @example
 * ```ts
 * await preloadImgs([{ src: '/img1.jpg' }, { src: '/img2.jpg', srcset: '/img2-2x.jpg 2x' }]);
 * ```
 */
export function preloadImgs(options: PreloadImgOptions[]): Promise<HTMLImageElement[]> {
	return Promise.all(options.map((o) => preloadImg(o)));
}
