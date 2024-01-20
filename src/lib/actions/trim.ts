export const trim = (el: HTMLInputElement | HTMLTextAreaElement, enabled = true) => {
	const trim = (e: Event) => {
		if (enabled && typeof el.value === 'string') {
			el.value = el.value.trim();
		}
	};

	el.addEventListener('change', trim);

	return {
		update(enabledFlag?: boolean) {
			if (enabledFlag !== undefined) {
				enabled = !!enabled;
			}
		},
		destroy() {
			el.removeEventListener('change', trim);
		},
	};
};
