<script lang="ts">
	import { fileDropzone, highlightDragover } from "../../../lib/index.js";
	let inputEl = $state<HTMLInputElement>()!;

	let names = $state<string[]>([]);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	use:highlightDragover={() => ({ classes: ["bg-red-100", "outline-4"] })}
	use:fileDropzone={() => ({
		inputEl,
		processFiles(files: FileList | null) {
			const max = 2;
			console.log("processFiles", files?.length, files);
			if (files?.length && files.length > max) {
				return (names = [`MAX ${max} ALLOWED`]);
			}
			names = Array.from(files ?? []).map((f) => f.name);
		},
		allowClick: true,
	})}
	class="flex items-center justify-center outline-2 outline-dashed w-full min-h-[480px]"
>
	{#if names.length}
		{@html names.join("<br/>")}
	{:else}
		File Dropzone
	{/if}
</div>

<input type="file" bind:this={inputEl} multiple style="display: none" />
