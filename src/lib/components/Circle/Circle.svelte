<script lang="ts" module>
	import type { SvgCircleOptions } from "../../utils/svg-circle.js";

	export interface Props extends Partial<SvgCircleOptions> {
		/** Inline styles for the container element */
		style?: string;
		/**
		 * CSS classes for the `<svg>` element (forwarded to the helper's `class`
		 * option). Since the stroke is `currentColor`, a text color utility here
		 * colors the ring.
		 */
		circleClass?: string;
		/** Inline styles for the `<circle>` element */
		circleStyle?: string;
		/** Transition duration in ms on the stroke-dashoffset */
		animateCompletenessMs?: number;
	}
</script>

<script lang="ts">
	import { svgCircle } from "../../utils/svg-circle.js";
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
	}: Props = $props();

	let container: HTMLDivElement = $state()!;

	// Note: completeness and rotate are NOT included here - they're updated via setters
	// to avoid recreating the SVG on every change
	let circle = $derived(
		svgCircle({
			strokeWidth,
			bgStrokeColor,
			roundedEdges,
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
		// Capture the current instance: `circle` is a derived, so reading it again in the
		// teardown would resolve to the freshly rebuilt svg and leave the previous node
		// behind (stacking one <svg> per structural prop change).
		const { svg } = circle;
		container.appendChild(svg);
		return () => svg.remove();
	});

	$effect(() => {
		circle.setCompleteness(completeness);
	});

	$effect(() => {
		circle.setRotate(rotate);
	});
</script>

<div bind:this={container} class={twMerge("size-6", classProp)} {style}></div>
