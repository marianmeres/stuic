<script lang="ts">
	import Modal from "$lib/components/ModalPrompt/Modal.svelte";
	import { AlertConfirmPrompt, AlertConfirmPromptStack, Button } from "$lib/index.js";
	import X from "$lib/components/X/X.svelte";
	import { dummyText } from "../../_utils/dummy-text.js";

	let modal: Modal = $state()!;
	let value = $state();

	const acp = new AlertConfirmPromptStack();
</script>

<p class="mb-4">General modal dialog (no dialog element implementation - no top-layer)</p>

<Button onclick={modal?.open}>Open</Button>
<hr class="my-4" />
{value}

<Modal
	bind:this={modal}
	onEscape={modal?.close}
	class="border"
	classMain="p-4"
	classHeader="p-4 bg-neutral-200 dark:bg-black border-b flex items-center"
	classFooter="p-4 bg-neutral-100 dark:bg-black border-t flex items-center"
>
	{#snippet header()}
		<span class="flex-1">header</span>
		<Button onclick={modal.close} size="sm"><X /></Button>
	{/snippet}

	<div>{@html dummyText(10)}</div>

	{#snippet footer()}
		<div class="space-x-2">
			<Button
				onclick={() => {
					acp.alert("Yo!");
				}}>footer alert</Button
			>
			<Button
				onclick={() => {
					value = new Date();
					modal.close();
				}}>Set value and close</Button
			>
		</div>
	{/snippet}
</Modal>

<AlertConfirmPrompt {acp} />
