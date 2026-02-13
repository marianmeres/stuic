<script lang="ts">
	import { twMerge } from "../../../utils/tw-merge.js";

	interface Props {
		progress: number;
		class?: string;
		style?: string;
		classBar?: string;
		styleBar?: string;
	}

	let {
		progress = 0,
		class: classProp,
		style: styleProp,
		classBar,
		styleBar = "",
	}: Props = $props();
</script>

<div class={twMerge("stuic-progress-bar", classProp)} style={styleProp}>
	<div
		class={twMerge("bar", classBar)}
		style="width:{Math.min(100, Math.max(0, progress))}%; {styleBar}"
	></div>
</div>
