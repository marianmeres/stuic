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
		circleClass,
		circleStyle = "",
		animateCompletenessMs = 0,
	}: Partial<SvgCircleOptions> & {
		style?: string;
		circleClass?: string;
		circleStyle?: string;
		// transition duration in ms on the stroke-dashoffset
		animateCompletenessMs?: number;
	} = $props();

	let container: HTMLDivElement = $state()!;

	let circle = $derived(
		svgCircle({
			strokeWidth,
			completeness,
			bgStrokeColor,
			roundedEdges,
			rotate,
			strokeWidthRatio,
			class: circleClass,
			circleStyle:
				circleStyle +
				(animateCompletenessMs
					? `;transition: stroke-dashoffset ${animateCompletenessMs}ms linear;`
					: ""),
		})
	);

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
