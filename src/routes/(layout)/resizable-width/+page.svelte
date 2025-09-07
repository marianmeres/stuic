<script lang="ts">
	import { resizableWidth } from "../../../lib/index.js";
	let width1 = $state<string>("");
	let width2 = $state<string>("");
</script>

<div class="border flex mb-4">
	<div
		class="relative p-4"
		use:resizableWidth={() => ({
			initial: 250,
			min: 100,
			max: 500,
			units: "px",
			onResize(info) {
				width1 = Math.round(info.width) + info.units;
			},
			key: "example-1",
		})}
	>
		{width1}
	</div>
	<div class="flex-1 p-4 py-10">right</div>
</div>

<div class="border flex mb-4">
	<div
		class="relative p-4"
		use:resizableWidth={() => ({
			initial: 50,
			min: 10,
			max: 90,
			units: "%",
			onResize(info) {
				width2 = Math.round(info.width) + info.units;
			},
			key: "example-2",
			handleClass:
				"w-[5px] hover:w-[10px] hover:right-[-3px] bg-red-300 hover:bg-red-500",
			handleDragClass: "hidden",
		})}
	>
		{width2}
	</div>
	<div class="flex-1 p-4 py-12">right</div>
</div>
