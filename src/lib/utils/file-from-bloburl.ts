/**  */
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
