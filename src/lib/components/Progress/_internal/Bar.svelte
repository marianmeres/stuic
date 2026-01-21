<script lang="ts">
	import { twMerge } from "../../../utils/tw-merge.js";

	import "../index.css";

	interface Props {
		progress: number;
		class?: string;
		classBar?: string;
		styleBar?: string;
	}

	let { progress = 0, class: classProp, classBar, styleBar = "" }: Props = $props();
</script>

<div
	class={twMerge(
		"stuic-progress-bar",
		"w-full h-2 bg-(--stuic-progress-bg) flex justify-start pointer-events-none",
		classProp
	)}
>
	<div
		class={twMerge(
			"bar",
			"w-full h-full bg-(--stuic-progress-accent) transition-[width] ease-linear duration-100",
			classBar
		)}
		style="width:{Math.min(100, Math.max(0, progress))}%; {styleBar}"
	></div>
</div>
