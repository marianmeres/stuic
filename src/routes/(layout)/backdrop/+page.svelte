<script lang="ts">
	import { Button, Backdrop, stopPropagation } from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { dummyText } from "../../_utils/dummy-text.js";

	const clog = createClog("backdrop/+page");
	let visible = $state(false);

	let backdrop: Backdrop = $state()!;
	let duration = $state<undefined | number>();
	let backdrop2: Backdrop = $state()!;

	$inspect("visible", visible).with(clog);
</script>

<Button
	onclick={(e) => {
		duration = undefined;
		backdrop.open(e);
	}}
	class="sm"
>
	default
</Button>

<Button
	onclick={(e) => {
		duration = 1_000;
		backdrop.open(e);
	}}
	class="sm"
>
	slow
</Button>

<!-- <Button onclick={backdrop?.open}>open via instance</Button> -->
<!-- data-onmousedown={backdrop?.close} -->

<Backdrop
	bind:this={backdrop}
	class="justify-center items-center bg-black/25"
	onEscape={backdrop?.close}
	fadeInDuration={duration}
	fadeOutDuration={duration}
	onBackdropClick={backdrop.close}
	bind:visible
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="bg-white w-90 h-25 flex items-center justify-center space-x-2"
		onmousedown={stopPropagation()}
	>
		<Button size="sm" onclick={backdrop.close}>close</Button>
		<Button size="sm" onclick={() => console.log("noop")}>noop</Button>

		<Button size="sm" onclick={backdrop2?.open}>second</Button>

		<Backdrop
			bind:this={backdrop2}
			class="justify-center items-center bg-black/25"
			onEscape={backdrop2?.close}
			noScrollLock
		>
			<div class="bg-red-300 w-90 h-25 flex items-center justify-center space-x-2">
				<Button size="sm" onclick={backdrop2.close}>close</Button>
			</div>
		</Backdrop>
	</div>
</Backdrop>

<div class="my-12">
	{@html dummyText(10)}
</div>

<Button
	onclick={(e) => {
		duration = undefined;
		backdrop.open(e);
	}}
	class="sm"
>
	default
</Button>

<div class="my-12">
	{@html dummyText(10)}
</div>
