<script lang="ts" module>
	export interface Props {
		type?: "bar" | "circle";
		progress?: number;
		class?: string;
		style?: string;
		classBar?: string;
		styleBar?: string;
	}
</script>

<script lang="ts">
	import Bar from "./_internal/Bar.svelte";
	import Circle from "./_internal/Circle.svelte";

	let {
		type = "bar",
		progress = 0,
		class: classProp,
		style: styleProp,
		classBar,
		styleBar,
	}: Props = $props();
</script>

{#if type === "bar"}
	<Bar {progress} class={classProp} style={styleProp} {classBar} {styleBar} />
{:else if type === "circle"}
	<Circle {progress} class={classProp} style={styleProp} />
{/if}
