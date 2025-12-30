/**
 * Checks if a given string represents an image, either by file extension or MIME type.
 *
 * Supports common browser-compatible image formats: jpg, jpeg, png, gif, webp, svg, bmp, ico, avif.
 *
 * @param mimeOrPath - A file path (e.g., "photo.jpg") or MIME type (e.g., "image/png")
 * @returns `true` if the input matches a known image extension or MIME type pattern
 *
 * @example
 * ```ts
 * isImage('photo.jpg');        // true
 * isImage('image/png');        // true
 * isImage('document.pdf');     // false
 * isImage('application/json'); // false
 * ```
 */
export function isImage(mimeOrPath: string): boolean {
	// common browser supported image file extensions
	const exts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif"];

	// looks like a path?
	const rgx = new RegExp(`\\.(${exts.join("|")})$`, "i");
	if (rgx.test(mimeOrPath)) {
		return true;
	}

	// looks like an image mime type?
	return /^image\/[^/]+/i.test(`${mimeOrPath}`);
}
