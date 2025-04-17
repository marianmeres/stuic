export async function isMac() {
	const rx = /mac/i;

	// modern
	const nav: any = navigator as any;
	if (nav.userAgentData) {
		const uad = await nav.userAgentData.getHighEntropyValues(["platform"]);
		return rx.test(uad.platform);
	}

	// old fallback
	return rx.test(navigator.platform) || rx.test(navigator.userAgent);
}
