<script lang="ts">
	import { Button, FieldSelect, Drawer, X } from "$lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

	let visible = $state(false);
	let position = $state<"left" | "top" | "right" | "bottom">("left");

	const open = () => (visible = true);
	const close = () => (visible = false);
</script>

<FieldSelect
	bind:value={position}
	class="pr-2 inline-block"
	classInput="field-sizing-content"
	options={["left", "right", "top", "bottom"]}
	renderSize="sm"
/>

<Button onclick={open} size="sm" class="shadow-none">Open drawer</Button>

<Drawer
	bind:visible
	{position}
	classBackdrop="z-10 bg-neutral-950/50 cursor-pointer"
	class="bg-neutral-50 dark:bg-neutral-700 cursor-auto"
	onEscape={close}
>
	<div class="h-full">
		<div class="p-4 bg-gray-200 dark:bg-neutral-950">
			<Button onclick={close} size="sm" class="[.sm]:p-0"><X /></Button>
		</div>
		<div class="p-4 w-[400px] max-w-[400px]">
			{@html dummyText(30)}
		</div>
	</div>
</Drawer>
