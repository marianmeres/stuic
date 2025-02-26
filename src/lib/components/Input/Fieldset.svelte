<script lang="ts">
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";
	import Thc from "../Thc/Thc.svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	//
	import "../../stuic.css";
	import "./_internal/fieldset.css";

	interface Props {
		legend?: THC;
		class?: string;
		classLegend?: string;
		children?: Snippet;
	}
	let { legend, class: classProp, children, classLegend }: Props = $props();
</script>

<fieldset class={twMerge("stuic-fieldset", classProp)}>
	{#if legend}
		<legend class={twMerge(classLegend)}>
			<Thc thc={legend} forceAsHtml />
		</legend>
	{/if}
	{@render children?.()}
</fieldset>
