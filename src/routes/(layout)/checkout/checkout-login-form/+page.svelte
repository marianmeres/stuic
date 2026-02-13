<script lang="ts">
	import {
		CheckoutLoginForm,
		createEmptyLoginFormData,
		type CheckoutLoginFormData,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	// --- Interactive demo state ---
	let formData = $state<CheckoutLoginFormData>(createEmptyLoginFormData());
	let isSubmitting = $state(false);
	let submitCount = $state(0);
	let lastSubmittedData = $state<CheckoutLoginFormData | null>(null);

	function handleSubmit(data: CheckoutLoginFormData) {
		submitCount++;
		isSubmitting = true;
		lastSubmittedData = { ...data };
		setTimeout(() => {
			isSubmitting = false;
		}, 1500);
	}

	// --- Controls ---
	let showForgotPassword = $state(true);
	let showFooter = $state(true);
	let showExternalErrors = $state(false);
	let showGeneralError = $state(false);

	let externalErrorsComputed = $derived(
		showExternalErrors
			? [{ field: "email", message: "No account found with this email" }]
			: []
	);

	let generalError = $derived(showGeneralError ? "Invalid email or password" : undefined);

	function handleForgotPassword() {
		alert("Forgot password clicked!");
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutLoginForm</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">Full login form with configurable options.</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showForgotPassword}
			label="Show forgot password"
			name="show-forgot"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showFooter}
			label="Show footer"
			name="show-footer"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExternalErrors}
			label="Inject field error"
			name="show-external-errors"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showGeneralError}
			label="Show general error"
			name="show-general-error"
			renderSize="sm"
		/>
	</div>

	{#if submitCount > 0}
		<p class="text-sm mb-4">
			Submitted <strong>{submitCount}</strong> time{submitCount === 1 ? "" : "s"}
		</p>
	{/if}

	<div class="max-w-lg">
		<CheckoutLoginForm
			bind:formData
			onSubmit={handleSubmit}
			{isSubmitting}
			errors={externalErrorsComputed}
			error={generalError}
			onForgotPassword={showForgotPassword ? handleForgotPassword : undefined}
		>
			{#snippet footer()}
				{#if showFooter}
					<div class="text-center text-sm opacity-60 pt-2">
						Or <button
							type="button"
							class="underline"
							onclick={() => alert("Continue as guest")}>continue as guest</button
						>
					</div>
				{/if}
			{/snippet}
		</CheckoutLoginForm>
	</div>

	{#if lastSubmittedData}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Last submitted data:</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					lastSubmittedData,
					null,
					2
				)}</pre>
		</div>
	{/if}

	<div class="mt-4">
		<h3 class="text-sm font-semibold mb-1">Live formData:</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				formData,
				null,
				2
			)}</pre>
	</div>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		Only <code>onSubmit</code> provided — all defaults applied.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm onSubmit={(data) => alert("Submitted: " + data.email)} />
	</div>
</section>

<!-- ============== WITH FORGOT PASSWORD ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With forgot password</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>onForgotPassword</code> callback renders the "Forgot password?" link.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			onForgotPassword={() => alert("Forgot password!")}
		/>
	</div>
</section>

<!-- ============== WITH GENERAL ERROR ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With general error</h2>
	<p class="text-sm opacity-60 mb-4">
		The <code>error</code> prop renders a general alert above the form.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			error="Invalid email or password"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== WITH FIELD ERRORS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">External field errors</h2>
	<p class="text-sm opacity-60 mb-4">
		Server-side field errors injected via <code>errors</code> prop.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			errors={[{ field: "email", message: "No account found with this email" }]}
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CUSTOM CTA LABELS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom CTA labels</h2>
	<p class="text-sm opacity-60 mb-4">
		Override <code>submitLabel</code> and <code>submittingLabel</code>.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			submitLabel="Sign In"
			submittingLabel="Signing in..."
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CUSTOM SUBMIT BUTTON ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom submit button (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">Override the CTA section with a custom snippet.</p>

	<div class="max-w-lg">
		<CheckoutLoginForm onSubmit={(data) => alert("Submitted: " + data.email)}>
			{#snippet submitButton({ isSubmitting: submitting, disabled })}
				<div class="flex gap-2 pt-2">
					<Button type="submit" intent="primary" {disabled} class="flex-1">
						{submitting ? "Please wait..." : "Sign In with Email"}
					</Button>
				</div>
			{/snippet}
		</CheckoutLoginForm>
	</div>
</section>

<!-- ============== WITH FOOTER ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With footer</h2>
	<p class="text-sm opacity-60 mb-4">
		The <code>footer</code> snippet renders content below the form.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			onForgotPassword={() => alert("Forgot password!")}
		>
			{#snippet footer()}
				<div class="text-center text-sm opacity-60 pt-2 space-y-2">
					<p>
						Or continue as <button
							type="button"
							class="underline"
							onclick={() => alert("Guest")}>guest</button
						>
					</p>
					<p>
						Don't have an account? <button
							type="button"
							class="underline"
							onclick={() => alert("Register")}>Sign up</button
						>
					</p>
				</div>
			{/snippet}
		</CheckoutLoginForm>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no checkout-specific CSS classes applied. FieldInput styling
		still applies.
	</p>

	<div class="max-w-lg">
		<CheckoutLoginForm
			unstyled
			class="space-y-4"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		class="max-w-lg"
		style="
			--stuic-checkout-login-gap: 1.5rem;
			--stuic-checkout-login-forgot-font-size: 1rem;
		"
	>
		<CheckoutLoginForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			onForgotPassword={() => alert("Forgot password!")}
		/>
	</div>
</section>
