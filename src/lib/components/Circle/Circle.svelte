<script lang="ts">
	import { svgCircle, type SvgCircleOptions } from "../../utils/svg-circle.js";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		strokeWidth = 10,
		completeness = 1,
		bgStrokeColor,
		class: classProp = "",
		roundedEdges = true,
		rotate = 0,
		strokeWidthRatio = 0,
		style,
	}: Partial<SvgCircleOptions> & { style?: string } = $props();

	let container: HTMLDivElement = $state()!;

	const circle = svgCircle({
		strokeWidth,
		completeness,
		bgStrokeColor,
		roundedEdges,
		rotate,
		strokeWidthRatio,
	});

	$effect(() => {
		container.appendChild(circle.svg);
	});

	$effect(() => {
		circle.setCompleteness(completeness);
	});

	$effect(() => {
		circle.setRotate(rotate);
	});
</script>

<div bind:this={container} class={twMerge("size-6", classProp)} {style}></div>
