/**  */
export function isImage(mimeOrPath: string): boolean {
	// common browser supported image file extensions
	const exts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif"];

	// looks like a path?
	const rgx = new RegExp(`\.(${exts.join("|")})$`, "i");
	if (rgx.test(mimeOrPath)) {
		return true;
	}

	// looks like an image mime type?
	return /^image\/[^\/]+/i.test(`${mimeOrPath}`);
}
