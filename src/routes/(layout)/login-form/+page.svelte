<script lang="ts">
	import {
		LoginForm,
		LoginFormModal,
		createEmptyLoginFormData,
		type LoginFormData,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import { iconGoogle, iconFacebook, iconApple } from "$lib/icons/index.js";

	// --- Interactive demo state ---
	let formData = $state<LoginFormData>(createEmptyLoginFormData());
	let isSubmitting = $state(false);
	let submitCount = $state(0);
	let lastSubmittedData = $state<LoginFormData | null>(null);

	function handleSubmit(data: LoginFormData) {
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
	let showSocialLogins = $state(true);
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

	// --- Modal demo state ---
	let loginModal: LoginFormModal = $state()!;
	let modalSubmitCount = $state(0);

	function handleModalSubmit(data: LoginFormData) {
		modalSubmitCount++;
		// Simulate async — close modal after "server" responds
		setTimeout(() => {
			loginModal.close();
			alert("Logged in as " + data.email);
		}, 1000);
	}
</script>

<h1 class="text-2xl font-bold mb-8">LoginForm</h1>

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
			bind:checked={showSocialLogins}
			label="Show social logins"
			name="show-social"
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
		<LoginForm
			bind:formData
			onSubmit={handleSubmit}
			{isSubmitting}
			errors={externalErrorsComputed}
			error={generalError}
			onForgotPassword={showForgotPassword ? handleForgotPassword : undefined}
			socialLogins={showSocialLogins ? socialButtons : undefined}
		>
			{#snippet footer()}
				{#if showFooter}
					<div class="text-center text-sm opacity-60 pt-2">
						Don't have an account? <button
							type="button"
							class="underline"
							onclick={() => alert("Sign up")}>Sign up</button
						>
					</div>
				{/if}
			{/snippet}
		</LoginForm>
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
		<LoginForm onSubmit={(data) => alert("Submitted: " + data.email)} />
	</div>
</section>

<!-- ============== WITH SOCIAL LOGINS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With social logins</h2>
	<p class="text-sm opacity-60 mb-4">
		The <code>socialLogins</code> snippet renders OAuth/social buttons with an auto-generated
		divider.
	</p>

	<div class="max-w-lg">
		<LoginForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			onForgotPassword={() => alert("Forgot password!")}
			socialLogins={socialButtons}
		/>
	</div>
</section>

<!-- ============== MODAL ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Modal</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>LoginFormModal</code> renders the login form inside a modal dialog with a trigger button.
	</p>

	<div class="flex gap-4 items-center">
		<LoginFormModal
			bind:this={loginModal}
			onSubmit={handleModalSubmit}
			onForgotPassword={() => alert("Forgot password!")}
			socialLogins={socialButtons}
		>
			{#snippet trigger({ open })}
				<Button onclick={open}>Open Login Modal</Button>
			{/snippet}
		</LoginFormModal>

		{#if modalSubmitCount > 0}
			<p class="text-sm">
				Modal submitted <strong>{modalSubmitCount}</strong> time{modalSubmitCount === 1
					? ""
					: "s"}
			</p>
		{/if}
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no login-form-specific CSS classes applied.
	</p>

	<div class="max-w-lg">
		<LoginForm
			unstyled
			class="space-y-4"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

{#snippet socialButtons()}
	<Button variant="outline" class="w-full" onclick={() => alert("Google login")}>
		{@html iconGoogle()} Continue with Google
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Facebook login")}>
		{@html iconFacebook()} Continue with Facebook
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Apple login")}>
		{@html iconApple()} Continue with Apple
	</Button>
{/snippet}
