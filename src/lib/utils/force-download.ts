/**
 * Forces a file download from a URL, bypassing the browser's default behavior.
 *
 * Fetches the resource, creates a blob URL, and triggers a download via an invisible link.
 * Works even for URLs that would normally open in the browser (PDFs, images, etc.).
 *
 * @param url - The URL of the file to download
 * @param fileName - Optional filename for the downloaded file
 * @param _errorLog - Optional error logging function (default: console.error)
 * @returns `true` if download succeeded, `false` on error
 *
 * @example
 * ```ts
 * await forceDownload('https://example.com/report.pdf', 'yearly-report.pdf');
 * ```
 */
export async function forceDownload(
	url: string,
	fileName?: string,
	_errorLog: (msg: string) => void = console.error
) {
	try {
		// fetch the resource
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Response ${res.statusText}`);

		// convert response to a Blob and create a temporary URL
		const blob = await res.blob();
		const blobUrl = window.URL.createObjectURL(blob);

		// use the "Invisible Link" trick with the Blob URL
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = fileName || "";
		document.body.appendChild(link);
		link.click();

		// cleanup & free memory
		document.body.removeChild(link);
		window.URL.revokeObjectURL(blobUrl);

		return true;
	} catch (error) {
		_errorLog?.(`Download failed: ${error}`);
		return false;
	}
}
