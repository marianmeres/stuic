<script lang="ts" module>
	export interface Props {
		/**
		 * Override the localStorage key the inline bootstrap script reads.
		 * Default: `"stuic-color-scheme"`. When set, also reconfigures the runtime
		 * (equivalent to calling `ColorScheme.configure({ key })`).
		 */
		key?: string;
	}
</script>

<script lang="ts">
	import { ColorScheme } from "./color-scheme.svelte.js";

	let { key }: Props = $props();
	$effect(() => {
		if (key) ColorScheme.configure({ key });
	});
	const k = $derived(JSON.stringify(key ?? "stuic-color-scheme"));
	const bootstrap = $derived(
		`<script>(function(){var K=${k};var C=document.documentElement.classList;localStorage.getItem(K)==="dark"?C.add("dark"):C.remove("dark");})();<\/script>`
	);
</script>

<!--
    Similar to ColorSchemeSystemAware, except that it never reads window.matchMedia and only
    relies on the local userland setting.
-->
<svelte:head>
	{@html bootstrap}
</svelte:head>
