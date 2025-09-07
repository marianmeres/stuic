<script lang="ts">
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import Thc from "../Thc/Thc.svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	interface Props {
		legend?: THC;
		class?: string;
		classLegend?: string;
		children?: Snippet;
	}
	let { legend, class: classProp, children, classLegend }: Props = $props();
</script>

<fieldset
	class={twMerge(
		"stuic-fieldset",
		"border border-neutral-300 p-4 pt-3 rounded-md my-8",
		classProp
	)}
>
	{#if legend}
		<legend class={twMerge("px-2", classLegend)}>
			<Thc thc={legend} forceAsHtml />
		</legend>
	{/if}
	{@render children?.()}
</fieldset>
