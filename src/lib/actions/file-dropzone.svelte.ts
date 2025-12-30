/**
 * Options for the file dropzone action.
 */
interface FileDropzoneOptions {
	enabled?: boolean;
	inputEl: HTMLInputElement;
	allowClick?: boolean;
	processFiles?: (files: FileList | null, wasDrop?: boolean) => void | Promise<void>;
}

/**
 * A Svelte action that turns any element into a file drop zone.
 *
 * Handles drag-and-drop file uploads and optionally allows clicking to select files.
 * Works in conjunction with a hidden file input element.
 *
 * @param el - The drop zone element
 * @param fn - Function returning configuration options
 * @param fn.enabled - Whether the dropzone is active (default: true)
 * @param fn.inputEl - **Required** - Hidden file input element for file selection
 * @param fn.allowClick - Allow clicking the zone to open file picker (default: true)
 * @param fn.processFiles - Callback function to handle selected/dropped files
 *
 * @example
 * ```svelte
 * <script>
 *   let inputEl: HTMLInputElement;
 *
 *   function handleFiles(files: FileList | null) {
 *     if (files) {
 *       for (const file of files) {
 *         console.log('File:', file.name);
 *       }
 *     }
 *   }
 * </script>
 *
 * <input type="file" bind:this={inputEl} hidden multiple />
 *
 * <div
 *   use:fileDropzone={() => ({
 *     inputEl,
 *     processFiles: handleFiles
 *   })}
 *   class="border-2 border-dashed p-8"
 * >
 *   Drop files here or click to select
 * </div>
 * ```
 */
export function fileDropzone(el: HTMLElement, fn?: () => FileDropzoneOptions) {
	$effect(() => {
		const {
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
			handle_files(e?.dataTransfer?.files ?? null, true);
		}

		function handle_change(e: Event) {
			if (e.target instanceof HTMLInputElement) {
				handle_files(e.target.files);
			}
		}

		function handle_files(files: FileList | null, wasDrop = false) {
			processFiles?.(files, wasDrop);
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
