/**
 * Creates a File object from a blob URL.
 *
 * Useful for converting blob URLs (e.g., from canvas.toBlob or URL.createObjectURL)
 * back into File objects for form uploads.
 *
 * @param blobUrl - The blob URL to convert (e.g., "blob:http://...")
 * @param fileName - The desired file name
 * @param mimeType - The MIME type for the file (e.g., "image/png")
 * @returns A Promise that resolves to a File object
 *
 * @example
 * ```ts
 * const file = await fileFromBlobUrl('blob:http://...', 'photo.png', 'image/png');
 * formData.append('file', file);
 * ```
 */
export async function fileFromBlobUrl(
	blobUrl: string,
	fileName: string,
	mimeType: string
) {
	// blobUrl is a internal memory address, so we need to fetch from it
	const response = await fetch(blobUrl);
	const blob = await response.blob();

	return new File([blob], fileName, { type: mimeType });
}
