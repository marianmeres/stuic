<script lang="ts">
	import { Button, DismissibleMessage, FieldSelect } from "$lib/index.js";
	import type { MessageIntent } from "$lib/components/DismissibleMessage/DismissibleMessage.svelte";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let message = $state("");
	let _intent = $state<string>("");
	let intent = $derived<MessageIntent | undefined>((_intent as MessageIntent) || undefined);
</script>

<div class="space-y-6">
	<DismissibleMessage {message} {intent} />

	<div class="flex gap-2 items-center flex-wrap">
		<FieldSelect
			bind:value={_intent}
			class="inline-block"
			renderSize="sm"
			options={[
				{ value: "", label: "No intent (default)" },
				{ value: "info", label: "info" },
				{ value: "success", label: "success" },
				{ value: "warning", label: "warning" },
				{ value: "destructive", label: "destructive" },
			]}
		/>

		<Button onclick={() => (message = dummySentence(5))}>Show message</Button>
	</div>

	<div class="mt-8 space-y-2">
		<h3 class="font-semibold mb-4">Intent Examples (non-dismissible)</h3>

		<DismissibleMessage message="Default message with no intent" onDismiss={false} />

		<DismissibleMessage
			intent="info"
			message="Info: This is an informational message"
			onDismiss={false}
		/>

		<DismissibleMessage
			intent="success"
			message="Success: Operation completed successfully"
			onDismiss={false}
		/>

		<DismissibleMessage
			intent="warning"
			message="Warning: Please review before continuing"
			onDismiss={false}
		/>

		<DismissibleMessage
			intent="destructive"
			message="Error: Something went wrong"
			onDismiss={false}
		/>
	</div>
</div>
