<script lang="ts">
	import { resizable, resizableWidth } from "../../../lib/index.js";
	let width1 = $state<string>("");
	let width2 = $state<string>("");
	let width3 = $state<string>("");
	let width4 = $state<string>("");
	let height1 = $state<string>("");
	let handleEl = $state<HTMLDivElement>();
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

<div class="border flex mb-4">
	<div class="flex-1 p-4 py-10">left</div>
	<div
		class="relative p-4"
		use:resizableWidth={() => ({
			initial: 250,
			min: 100,
			max: 500,
			units: "px",
			reverse: true,
			onResize(info) {
				width3 = Math.round(info.width) + info.units;
			},
			key: "example-3",
		})}
	>
		{width3} (reverse)
	</div>
</div>

<h2 class="text-xl font-semibold mt-12 mb-2">The <code>resizable</code> attachment</h2>
<p class="text-sm text-neutral-500 mb-4">
	<code>resizableWidth</code> is a thin wrapper over
	<code>{"{@attach resizable(...)}"}</code>, which also does heights (<code
		>axis: "y"</code
	>) and can drive a handle of your own (<code>handle</code>). Every handle is a focusable
	<code>role="separator"</code>: arrow keys along the axis, Shift for ×10, Home / End,
	Enter resets.
</p>

<div class="border flex flex-col h-64 mb-4">
	<div
		class="p-4"
		{@attach resizable({
			axis: "y",
			initial: 40,
			units: "%",
			min: 20,
			max: 80,
			onResize(info) {
				height1 = Math.round(info.size) + info.units;
			},
			key: "example-y",
		})}
	>
		{height1} (axis: "y", %)
	</div>
	<div class="flex-1 p-4">bottom</div>
</div>

<div class="border flex mb-4">
	<div
		class="p-4"
		{@attach handleEl &&
			resizable({
				initial: 200,
				min: 100,
				max: 400,
				handle: handleEl,
				label: "Resize the left pane",
				onResize(info) {
					width4 = Math.round(info.size) + info.units;
				},
			})}
	>
		{width4} (own handle →)
	</div>
	<div
		bind:this={handleEl}
		class="w-2 shrink-0 cursor-col-resize bg-neutral-200 hover:bg-neutral-400 focus-visible:bg-neutral-400 data-[resizing]:bg-neutral-500 dark:bg-neutral-700 dark:hover:bg-neutral-500 outline-none"
	></div>
	<div class="flex-1 p-4 py-10">right</div>
</div>
