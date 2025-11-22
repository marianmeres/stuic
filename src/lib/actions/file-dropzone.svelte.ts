interface FileDropzoneOptions {
	enabled?: boolean;
	inputEl: HTMLInputElement;
	allowClick?: boolean;
	processFiles?: (files: FileList | null) => any | Promise<any>;
}

export function fileDropzone(el: HTMLElement, fn?: () => FileDropzoneOptions) {
	$effect(() => {
		let {
			enabled = true,
			allowClick = true,
			inputEl,
			processFiles,
		} = fn?.() || ({} as FileDropzoneOptions);

		if (!enabled) return;

		if (!inputEl) {
			console.warn("Missing inputEl instance, can't continue...");
			return;
		}

		function preventDefault(e: Event) {
			e.preventDefault();
			// e.stopPropagation();
		}

		function handle_drop(e: DragEvent) {
			handle_files(e?.dataTransfer?.files ?? null);
		}

		function handle_change(e: Event) {
			if (e.target instanceof HTMLInputElement) {
				handle_files(e.target.files);
			}
		}

		function handle_files(files: FileList | null) {
			processFiles?.(files);
		}

		function handle_click(e: Event) {
			if (allowClick) {
				e.stopPropagation();
				inputEl.click();
			}
		}

		// over/drop are critical, enter/leave I'm not sure
		const PREVENT = ["dragenter", "dragover", "dragleave", "drop"];
		PREVENT.forEach((name) => el.addEventListener(name, preventDefault));

		//
		el.addEventListener("drop", handle_drop);
		el.addEventListener("click", handle_click);
		inputEl.addEventListener("change", handle_change);

		//
		return () => {
			PREVENT.forEach((name) => el.removeEventListener(name, preventDefault));
			el.removeEventListener("drop", handle_drop);
			el.removeEventListener("click", handle_click);
			inputEl.removeEventListener("change", handle_change);
		};
	});
}
