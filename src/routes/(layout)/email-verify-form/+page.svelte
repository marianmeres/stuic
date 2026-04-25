<script lang="ts">
	import { EmailVerifyForm } from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	let isSubmitting = $state(false);
	let error = $state<string | undefined>(undefined);
	let lastCode = $state<string | null>(null);
	let resentCount = $state(0);

	let showError = $state(false);
	let showAttempts = $state(false);
	let attempts = $state(3);

	function handleVerify(code: string) {
		isSubmitting = true;
		lastCode = code;
		error = undefined;
		setTimeout(() => {
			isSubmitting = false;
			if (code === "111111") {
				alert("Verified!");
			} else {
				error = `Invalid code: ${code}`;
				if (showAttempts && attempts > 0) attempts--;
			}
		}, 1200);
	}

	async function handleResend() {
		await new Promise((r) => setTimeout(r, 500));
		resentCount++;
	}

	$effect(() => {
		if (showError) error = "Invalid code: please try again.";
		else error = undefined;
	});
</script>

<h1 class="text-2xl font-bold mb-8">EmailVerifyForm</h1>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		The valid mock code is <code>111111</code>. Other inputs trigger an error. Resend has
		a short 5s cooldown for demo purposes.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showError}
			label="Show error banner"
			name="evf-error"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showAttempts}
			label="Show attempts remaining"
			name="evf-attempts"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-sm">
		<EmailVerifyForm
			email="user@example.com"
			onSubmit={handleVerify}
			onResend={handleResend}
			resendCooldownSeconds={5}
			{isSubmitting}
			{error}
			attemptsRemaining={showAttempts ? attempts : undefined}
		>
			{#snippet footer()}
				<div class="text-center text-sm opacity-60 pt-2">
					Wrong email? <button type="button" class="underline">Start over</button>
				</div>
			{/snippet}
		</EmailVerifyForm>
	</div>

	<div class="mt-4 grid grid-cols-2 gap-3">
		<div>
			<h3 class="text-sm font-semibold mb-1">Last submitted code</h3>
			<pre class="text-xs bg-muted p-3 rounded-md">{JSON.stringify(lastCode)}</pre>
		</div>
		<div>
			<h3 class="text-sm font-semibold mb-1">Resend count</h3>
			<pre class="text-xs bg-muted p-3 rounded-md">{resentCount}</pre>
		</div>
	</div>
	<div class="mt-3">
		<Button
			size="sm"
			onclick={() => {
				lastCode = null;
				resentCount = 0;
				attempts = 3;
				error = undefined;
				showError = false;
			}}
		>
			Reset demo state
		</Button>
	</div>
</section>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Minimal (no resend, no error, default cooldown)</h2>
	<div class="max-w-sm">
		<EmailVerifyForm
			email="someone@example.com"
			onSubmit={(code) => alert("Submitted: " + code)}
		/>
	</div>
</section>

<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> — no composite CSS classes applied.
	</p>
	<div class="max-w-sm">
		<EmailVerifyForm
			unstyled
			class="space-y-4"
			email="user@example.com"
			onSubmit={(code) => alert("Submitted: " + code)}
		/>
	</div>
</section>
