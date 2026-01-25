<script lang="ts">
	import { Button, DismissibleMessage, FieldCheckbox, FieldSelect } from "$lib/index.js";
	import type { MessageIntent } from "$lib/components/DismissibleMessage/DismissibleMessage.svelte";
	import { dummySentence } from "../../_utils/dummy-text.js";

	let message = $state("");
	let _intent = $state<string>("");
	let intent = $derived<MessageIntent | undefined>(
		(_intent as MessageIntent) || undefined
	);

	let withIcon = $state(false);
</script>

<div class="space-y-6">
	<DismissibleMessage {message} {intent} {withIcon} />

	<div class="flex gap-4 items-center flex-wrap">
		<FieldCheckbox bind:checked={withIcon} label="with icon" class="mb-0!" />
		<FieldSelect
			bind:value={_intent}
			class="inline-block! mb-0!"
			renderSize="sm"
			options={[
				{ value: "", label: "No intent or 'info' (default)" },
				{ value: "success", label: "success" },
				{ value: "warning", label: "warning" },
				{ value: "destructive", label: "destructive" },
			]}
		/>

		<Button onclick={() => (message = dummySentence(5))}>Show message</Button>
	</div>

	<div class="mt-8 space-y-2 bg-linear-to-r from-cyan-500 to-blue-500 p-4">
		<h3 class="font-semibold mb-4">Intent Examples (non-dismissible)</h3>
		<p>Intentional bg color so the dismissible message boxes bg is unaffected</p>

		<DismissibleMessage message="Default message with no intent" {withIcon} />

		<DismissibleMessage
			intent="info"
			message="Info: This is an informational message"
			{withIcon}
		/>

		<DismissibleMessage
			intent="success"
			message="Success: Operation completed successfully"
			{withIcon}
		/>

		<DismissibleMessage
			intent="warning"
			message="Warning: Please review before continuing"
			{withIcon}
		/>

		<DismissibleMessage
			intent="destructive"
			message="Error: Something went wrong"
			{withIcon}
		/>
	</div>
</div>
