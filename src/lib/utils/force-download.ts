/**
 * forceDownload('https://example.com/report.pdf', 'yearly-report.pdf');
 */
export async function forceDownload(url: string, fileName?: string) {
	try {
		// fetch the resource
		const response = await fetch(url);
		if (!response.ok) throw new Error("Network response was not ok");

		// convert response to a Blob and create a temporary URL
		const blob = await response.blob();
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
		console.error("Download failed:", error);
		return false;
	}
}
