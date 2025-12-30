<script lang="ts" module>
	export interface Props {
		type?: "bar" | "circle";
		progress?: number;
		class?: string;
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
		classBar,
		styleBar,
	}: Props = $props();
</script>

{#if type === "bar"}
	<Bar {progress} class={classProp} {classBar} {styleBar} />
{:else if type === "circle"}
	<Circle {progress} class={classProp} />
{/if}
