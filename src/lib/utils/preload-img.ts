export function preloadImg(url: string, debug = false) {
	debug && console.debug(`preloading: ${url}`);
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

export function preloadImgs(urls: string[], debug = false) {
	return Promise.all(urls.map((url) => preloadImg(url, debug)));
}
