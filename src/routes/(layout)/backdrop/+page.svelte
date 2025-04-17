<script lang="ts">
	import { Button, Backdrop, stopPropagation } from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";

	const clog = createClog("backdrop/+page");
	let visible = $state(false);

	let backdrop: Backdrop = $state()!;
	let duration = $state<undefined | number>();

	$inspect("visible", visible).with(clog);
</script>

<Button
	onclick={(e) => {
		duration = 1_000;
		backdrop.open(e);
	}}
	class="sm"
>
	slow
</Button>

<Button
	onclick={(e) => {
		duration = undefined;
		backdrop.open(e);
	}}
	class="sm"
>
	fast (default)
</Button>

<!-- <Button onclick={backdrop?.open}>open via instance</Button> -->

<Backdrop
	bind:this={backdrop}
	class="justify-center items-center bg-black/25"
	onEscape={backdrop?.close}
	onmousedown={backdrop?.close}
	fadeInDuration={duration}
	fadeOutDuration={duration}
	bind:visible
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="bg-white w-90 h-25 flex items-center justify-center space-x-2"
		onmousedown={stopPropagation()}
	>
		<Button size="sm" onclick={backdrop.close}>close</Button>
		<Button size="sm" onclick={() => console.log("noop")}>noop</Button>
	</div>
</Backdrop>
