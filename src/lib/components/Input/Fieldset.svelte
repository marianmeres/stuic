<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	export interface Props {
		legend?: THC;
		class?: string;
		classLegend?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import Thc from "../Thc/Thc.svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	let { legend, class: classProp, children, classLegend }: Props = $props();
</script>

<fieldset
	class={twMerge(
		"stuic-fieldset",
		"border border-[var(--stuic-color-border)] p-4 pt-3 rounded-md my-8",
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
