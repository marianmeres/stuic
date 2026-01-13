<script lang="ts">
	import { sleep, tooltip, popover } from "$lib/index.js";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let showCustom = $state(true);

	let content = $state("Please wait...");

	// $inspect(1111, content);

	let label1 = dummySentence(1);
	let label2 = dummySentence(1);
	let label3 = dummySentence(1);
</script>

<!-- h-500 so we can test flipping on scroll -->
<div class="h-500">
	<div class="w-full flex items-start justify-between">
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

	<hr class="my-8" />

	<div class="p-4 space-y-4">
		<h2 class="text-xl font-semibold">Combined with Popover</h2>
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Tooltip and popover can be used on the same element thanks to the anchor-name helper
		</p>

		<div class="flex gap-4 flex-wrap">
			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				aria-label="Hover for tooltip, click for popover"
				use:tooltip
				use:popover={() => ({
					content: "This is a popover (click triggered)",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Tooltip + Popover
			</button>

			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				use:tooltip={() => ({
					content: "Quick tooltip info",
					position: "top",
				})}
				use:popover={() => ({
					content: "Detailed popover content",
					position: "bottom",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Both Custom
			</button>

			<button
				class="px-4 py-2 bg-cyan-500 text-white rounded"
				use:tooltip={() => ({
					content: "Tooltip on the right",
					position: "right",
				})}
				use:popover={() => ({
					content: "Popover on the left",
					position: "left",
					class: "p-3 bg-white dark:bg-neutral-800",
				})}
			>
				Different Positions
			</button>
		</div>
	</div>
</div>
