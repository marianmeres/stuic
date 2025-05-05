<script lang="ts">
	import { createTickerRAF } from "@marianmeres/ticker";
	import { onMount } from "svelte";

	let { class: _class, enabled = true }: { class?: string; enabled?: boolean } = $props();

	const speed = 250;
	let visible = $state([false, false, false]);
	let i = $state(0);

	onMount(() => {
		const ticker = createTickerRAF(speed, true);
		const unsub = ticker.subscribe((t) => {
			if (i > visible.length - 1) {
				i = 0;
				visible = visible.map((v) => false);
			} else {
				visible[i] = true;
				i++;
			}
		});
		return () => {
			ticker.stop();
			unsub();
		};
	});
</script>

<!-- prettier-ignore -->
<span class={_class}>
	<span 
		class={visible[0] || !enabled ? 'opacity-100' : 'opacity-0'} 
		style="transition-duration: {speed}ms;"
	>.</span><span 
		class={visible[1] || !enabled ? 'opacity-100' : 'opacity-0'}
		style="transition-duration: {speed}ms;"
	>.</span><span 
		class={visible[2] || !enabled ? 'opacity-100' : 'opacity-0'}
		style="transition-duration: {speed}ms;"
	>.</span>
</span>

<style>
	span span {
		transition-property: opacity;
	}
</style>
