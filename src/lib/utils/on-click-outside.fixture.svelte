<script lang="ts">
	import { onClickOutside } from "./on-click-outside.svelte.js";

	let {
		immediate = true,
		onOutside,
	}: { immediate?: boolean; onOutside: (e: PointerEvent) => void } = $props();

	let box = $state<HTMLDivElement>();
	// the fixture deliberately captures the initial `onOutside` / `immediate`
	// svelte-ignore state_referenced_locally
	const clickOutside = onClickOutside(() => box, onOutside, { immediate });

	const swallow = (e: Event) => e.stopPropagation();
</script>

<div data-testid="box" bind:this={box} style="width: 200px; height: 100px; padding: 8px;">
	<button data-testid="inside">inside</button>
</div>
<button data-testid="outside">outside</button>
<!-- pointerdown never reaches the document (the stacked-dialog case) -->
<button data-testid="stopped" onpointerdown={swallow}>stopped</button>
<!-- controls swallow their own pointerdown so they do not count as "outside" presses -->
<button data-testid="start" onpointerdown={swallow} onclick={() => clickOutside.start()}>
	start
</button>
<button data-testid="stop" onpointerdown={swallow} onclick={() => clickOutside.stop()}>
	stop
</button>
<output data-testid="enabled">{clickOutside.enabled ? "on" : "off"}</output>
