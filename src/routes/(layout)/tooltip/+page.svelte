<script lang="ts">
	import { sleep, tooltip } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let showCustom = $state(true);

	let content = $state("Please wait...");

	// $inspect(1111, content);

	let label1 = dummySentence(1);
	let label2 = dummySentence(1);
	let label3 = dummySentence(1);
</script>

<div class="w-full h-500 flex items-start justify-between">
	<div aria-label={label1} use:tooltip class="border">default</div>

	<div aria-label={label2} use:tooltip class="border">default</div>

	{#if showCustom}
		<span
			class="border"
			use:tooltip={() => ({
				content,
				class: "border border-red-500 bg-green-200 text-blue-900 text-xl",
				// debug: true,
				async onShow() {
					console.log("onShow()");
					await sleep(500);
					content = "3";
					await sleep(500);
					content = "2";
					await sleep(500);
					content = "1";
					await sleep(500);
					content = dummySentence(4);
				},
				async onHide() {
					console.log("onHide()");
					content = "Please wait...";
				},
			})}
		>
			custom
		</span>
	{/if}

	<div>
		<button
			class="text-xs opacity-50"
			onclick={() => {
				showCustom = !showCustom;
			}}>toggle custom</button
		>
	</div>

	<div use:tooltip class="border">noop</div>

	<div
		use:tooltip={() => ({ class: "bg-sky-600 dark:bg-sky-600 dark:text-white" })}
		aria-label={label3}
		class="border"
	>
		sky
	</div>
</div>
