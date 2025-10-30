<script lang="ts">
	import Modal from "$lib/components/Modal/Modal.svelte";
	import { AlertConfirmPrompt, AlertConfirmPromptStack, Button } from "$lib/index.js";
	import X from "$lib/components/X/X.svelte";
	import { dummyText } from "../../_utils/dummy-text.js";

	let modal: Modal = $state()!;
	let value = $state();

	const acp = new AlertConfirmPromptStack();
</script>

<p class="mb-4 h-[300px]">
	General modal dialog (no dialog element implementation - no top-layer)
</p>

<Button onclick={modal?.open}>Open</Button>
<hr class="my-4" />
{value}

<!-- classBackdrop="p-0 sm:p-0" -->
<Modal
	bind:this={modal}
	onEscape={modal?.close}
	class="md:border"
	classInner=""
	classMain="p-4"
	classHeader="p-4 bg-neutral-200 dark:bg-black border-b flex items-center"
	classFooter="p-4 bg-neutral-100 dark:bg-black border-t flex items-center"
>
	<!-- noScrollLock -->
	{#snippet header()}
		<span class="flex-1">header</span>
		<Button onclick={modal.close} size="sm"><X /></Button>
	{/snippet}

	<input type="text" />

	<!-- <div>{@html dummyText(30)}</div> -->
	<div>{@html dummyText(1)}</div>

	{#snippet footer()}
		<div class="flex justify-between w-full">
			<Button
				onclick={() => {
					acp.alert("Yo!");
				}}>alert</Button
			>
			<input type="text" />
			<Button
				onclick={() => {
					value = new Date();
					modal.close();
				}}>close</Button
			>
		</div>
	{/snippet}
</Modal>

<div class="my-12">
	{@html dummyText(20)}
</div>

<AlertConfirmPrompt {acp} />
