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

	// snippet-content example: an alert with an action button inside the message
	let sending = $state(false);
	let sentCount = $state(0);
	let bannerKey = $state(0);
	async function resend() {
		sending = true;
		await new Promise((r) => setTimeout(r, 800));
		sending = false;
		sentCount++;
	}
</script>

{#snippet verifyEmailBody()}
	<span class="flex-1">
		Your email address is not verified.
		{#if sentCount}<span class="opacity-70">(sent {sentCount}×)</span>{/if}
	</span>
	<Button
		size="sm"
		variant="outline"
		disabled={sending}
		spinner={sending}
		onclick={resend}
	>
		Resend verification email
	</Button>
{/snippet}

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

	<div class="mt-8 space-y-2">
		<h3 class="font-semibold mb-4">THC content</h3>
		<p class="text-sm opacity-80 mb-4">
			<code>message</code> is a THC — a snippet (or
			<code>&lbrace; snippet &rbrace;</code>,
			<code>&lbrace; component &rbrace;</code>, <code>&lbrace; html &rbrace;</code>,
			<code>&lbrace; text &rbrace;</code>) renders as a real subtree, so an alert can
			carry its own action button. The dismiss button is named via
			<code>dismissLabel</code>.
		</p>

		{#key bannerKey}
			<DismissibleMessage
				message={verifyEmailBody}
				intent="warning"
				withIcon
				classContent="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
				dismissLabel="Dismiss this banner"
			/>
		{/key}
		<Button size="sm" variant="ghost" onclick={() => bannerKey++}>Reset banner</Button>

		<DismissibleMessage
			message={{ html: "<b>Saved.</b> Rendered from <code>{ html }</code>." }}
			intent="success"
			{withIcon}
			onDismiss={false}
		/>

		<DismissibleMessage
			message={{ text: "Rendered from { text } (escaped: <b>not bold</b>)" }}
			forceAsHtml={false}
			intent="info"
			{withIcon}
			onDismiss={false}
		/>
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

	<div class="mt-8 space-y-2">
		<h3 class="font-semibold mb-4">With left border (border-l-4)</h3>

		<DismissibleMessage
			class="border-0 border-l-4"
			intent="info"
			message="Info: This is an informational message"
			{withIcon}
		/>

		<DismissibleMessage
			class="border-0 border-l-4"
			intent="success"
			message="Success: Operation completed successfully"
			{withIcon}
		/>

		<DismissibleMessage
			class="border-0 border-l-4"
			intent="warning"
			message="Warning: Please review before continuing"
			{withIcon}
		/>

		<DismissibleMessage
			class="border-0 border-l-4"
			intent="destructive"
			message="Error: Something went wrong"
			{withIcon}
		/>

		<div class="mt-4 text-sm opacity-80">
			<p class="mb-2">
				To apply this styling globally in a consuming app, override the component's
				border-width CSS custom property (a multi-value shorthand is accepted):
			</p>
			<pre class="p-3 bg-black/5 dark:bg-white/10 rounded text-xs overflow-x-auto"><code
					>:root &lbrace;
  --stuic-dismissible-message-border-width: 0 0 0 4px;
&rbrace;</code
				></pre>
			<p class="mt-2">
				Alternatively, target the <code>.stuic-dismissible-message</code> class directly.
			</p>
		</div>
	</div>
</div>
