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
		`<script>(function(){var K=${k};var C=document.documentElement.classList;if(K in localStorage){localStorage.getItem(K)==="dark"?C.add("dark"):C.remove("dark");}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){C.add("dark");}})();<\/script>`
	);
</script>

<!--
	If you do not wish to take the system preference into account use ColorSchemeLocal sibling.
-->
<svelte:head>
	{@html bootstrap}
</svelte:head>
