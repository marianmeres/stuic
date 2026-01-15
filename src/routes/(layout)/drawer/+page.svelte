<script lang="ts">
	import { Button, FieldSelect, Drawer, X } from "$lib/index.js";
	import { dummyText } from "../../_utils/dummy-text.js";

	let visible = $state(false); // "raw" open/close strategy
	let drawer: Drawer = $state()!; // "api" open/close strategy

	let position = $state<"left" | "top" | "right" | "bottom">("left");
</script>

<FieldSelect
	bind:value={position}
	class="pr-2 inline-block"
	classInput="field-sizing-content"
	options={["left", "right", "top", "bottom"]}
	renderSize="sm"
/>

<Button onclick={drawer?.open} size="sm" class="shadow-none">Open drawer</Button>

<Drawer
	bind:this={drawer}
	bind:visible
	{position}
	classBackdrop="z-10 bg-neutral-950/50 cursor-pointer"
	class="bg-neutral-50 dark:bg-neutral-700 cursor-auto"
	onEscape={drawer?.close}
	onOutside={drawer?.close}
>
	<div class="h-full">
		<div class="p-4 bg-gray-200 dark:bg-neutral-950">
			<Button onclick={drawer?.close} size="sm" class="[.sm]:p-0"><X /></Button>
		</div>
		<div class="p-4 w-100 max-w-100">
			<Button onclick={() => console.log("noop")} size="sm">noop</Button>
			{@html dummyText(30)}
		</div>
	</div>
</Drawer>
