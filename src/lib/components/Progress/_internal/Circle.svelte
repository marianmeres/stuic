<script lang="ts">
	import { svgCircle } from "../../../utils/svg-circle.js";
	import { twMerge } from "../../../utils/tw-merge.js";

	interface Props {
		progress: number;
		class?: string;
		style?: string;
	}

	let { progress = 0, class: classProp, style: styleProp }: Props = $props();

	let container: HTMLDivElement;
	let circleApi: ReturnType<typeof svgCircle> | null = null;

	// Create SVG once when container is mounted
	$effect(() => {
		if (container && !circleApi) {
			circleApi = svgCircle({
				completeness: Math.min(100, Math.max(0, progress)) / 100,
				strokeWidth: 10, // in viewBox units (100x100)
				bgStrokeColor: "var(--stuic-progress-bg)",
				circleStyle:
					"stroke: var(--stuic-progress-accent); transition: stroke-dashoffset var(--stuic-progress-transition) linear;",
				roundedEdges: true,
				rotate: -90, // start from top
			});
			container.appendChild(circleApi.svg);
		}
	});

	// Update progress reactively
	$effect(() => {
		circleApi?.setCompleteness(Math.min(100, Math.max(0, progress)) / 100);
	});
</script>

<div bind:this={container} class={twMerge("stuic-progress-circle", classProp)} style={styleProp}></div>
