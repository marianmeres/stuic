<script lang="ts">
	import { Button, Backdrop, stopPropagation } from "$lib/index.js";

	let visible = $state(false);
	const close = () => (visible = false);

	let duration = $state<undefined | number>();
</script>

<Button
	onclick={() => {
		duration = 1_000;
		visible = true;
	}}
	class="sm"
>
	slow
</Button>

<Button
	onclick={() => {
		duration = undefined;
		visible = true;
	}}
	class="sm"
>
	fast (default)
</Button>

<Backdrop
	class="justify-center items-center bg-black/25"
	onEscape={close}
	onmousedown={close}
	fadeInDuration={duration}
	fadeOutDuration={duration}
	{visible}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="bg-white w-90 h-25 flex items-center justify-center space-x-2"
		onmousedown={stopPropagation()}
	>
		<Button size="sm" onclick={close}>close</Button>
		<Button size="sm" onclick={() => console.log("noop")}>noop</Button>
	</div>
</Backdrop>
