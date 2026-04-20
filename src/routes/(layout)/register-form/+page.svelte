<script lang="ts">
	import {
		RegisterForm,
		RegisterFormModal,
		createEmptyRegisterFormData,
		type RegisterFormData,
		type RegisterFieldConfig,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldCheckbox from "$lib/components/Input/FieldCheckbox.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import { iconGoogle, iconFacebook, iconApple } from "$lib/icons/index.js";

	// --- Interactive demo state ---
	let formData = $state<RegisterFormData>(createEmptyRegisterFormData());
	let isSubmitting = $state(false);
	let submitCount = $state(0);
	let lastSubmittedData = $state<RegisterFormData | null>(null);

	function handleSubmit(data: RegisterFormData) {
		submitCount++;
		isSubmitting = true;
		lastSubmittedData = JSON.parse(JSON.stringify(data));
		setTimeout(() => {
			isSubmitting = false;
		}, 1500);
	}

	// --- Controls ---
	let showExtraFields = $state(true);
	let showExtraSlot = $state(true);
	let showFooter = $state(true);
	let showSocialLogins = $state(true);
	let showExternalErrors = $state(false);
	let showGeneralError = $state(false);
	let showPasswordConfirm = $state(true);
	let compact = $state(false);

	const sampleExtraFields: RegisterFieldConfig[] = [
		{
			name: "firstName",
			label: "First name",
			autocomplete: "given-name",
			required: true,
			position: "top",
		},
		{
			name: "company",
			label: "Company",
			autocomplete: "organization",
			position: "bottom",
		},
		{
			name: "phone",
			label: "Phone",
			type: "tel",
			autocomplete: "tel",
			validate: (v) => {
				const s = String(v ?? "").trim();
				if (!s) return;
				return /^\+?[\d\s\-()]+$/.test(s) ? undefined : "Invalid phone number";
			},
			position: "bottom",
		},
	];

	let externalErrorsComputed = $derived.by(() => {
		const errs: { field: string; message: string }[] = [];
		if (showExternalErrors) {
			errs.push({ field: "email", message: "This email is already registered" });
		}
		// Terms checkbox validation lives outside the declarative config — wire it
		// through externalErrors on submit attempts so the demo can showcase the slot.
		if (showExtraSlot && submitCount > 0 && !formData.extra?.agreedToTerms) {
			errs.push({
				field: "agreedToTerms",
				message: "You must agree to the terms",
			});
		}
		return errs;
	});

	let generalError = $derived(
		showGeneralError ? "Registration failed — please try again" : undefined
	);

	// --- Modal demo state ---
	let registerModal: RegisterFormModal = $state()!;
	let modalSubmitCount = $state(0);

	function handleModalSubmit(data: RegisterFormData) {
		modalSubmitCount++;
		setTimeout(() => {
			registerModal.close();
			alert("Registered as " + data.email);
		}, 1000);
	}
</script>

<h1 class="text-2xl font-bold mb-8">RegisterForm</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Full register form with configurable options, declarative
		<code>extraFields</code> and escape-hatch <code>extraFieldsSlot</code>.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showExtraFields}
			label="Show extraFields (firstName / company / phone)"
			name="show-extra-fields"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExtraSlot}
			label="Show extraFieldsSlot (terms of service checkbox)"
			name="show-extra-slot"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showPasswordConfirm}
			label="Show password confirm"
			name="show-password-confirm"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={compact}
			label="Compact variant"
			name="compact"
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
			label="Inject field error (email)"
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
		<RegisterForm
			bind:formData
			onSubmit={handleSubmit}
			{isSubmitting}
			{showPasswordConfirm}
			{compact}
			errors={externalErrorsComputed}
			error={generalError}
			extraFields={showExtraFields ? sampleExtraFields : undefined}
			extraFieldsSlot={showExtraSlot ? termsSlot : undefined}
			socialLogins={showSocialLogins ? socialButtons : undefined}
		>
			{#snippet footer()}
				{#if showFooter}
					<div class="text-center text-sm opacity-60 pt-2">
						Already have an account? <button
							type="button"
							class="underline"
							onclick={() => alert("Sign in")}>Sign in</button
						>
					</div>
				{/if}
			{/snippet}
		</RegisterForm>
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
		<RegisterForm onSubmit={(data) => alert("Submitted: " + data.email)} />
	</div>
</section>

<!-- ============== WITH SOCIAL LOGINS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With social logins</h2>
	<p class="text-sm opacity-60 mb-4">
		The <code>socialLogins</code> snippet renders OAuth buttons with an auto-generated divider.
	</p>

	<div class="max-w-lg">
		<RegisterForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			socialLogins={socialButtons}
		/>
	</div>
</section>

<!-- ============== MODAL ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Modal</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>RegisterFormModal</code> renders the register form inside a modal dialog with a trigger
		button.
	</p>

	<div class="flex gap-4 items-center">
		<RegisterFormModal
			bind:this={registerModal}
			onSubmit={handleModalSubmit}
			extraFields={sampleExtraFields}
			socialLogins={socialButtons}
		>
			{#snippet trigger({ open })}
				<Button onclick={open}>Open Register Modal</Button>
			{/snippet}
		</RegisterFormModal>

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
		With <code>unstyled</code> prop — no register-form-specific CSS classes applied.
	</p>

	<div class="max-w-lg">
		<RegisterForm
			unstyled
			class="space-y-4"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

{#snippet socialButtons()}
	<Button variant="outline" class="w-full" onclick={() => alert("Google signup")}>
		{@html iconGoogle()} Sign up with Google
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Facebook signup")}>
		{@html iconFacebook()} Sign up with Facebook
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Apple signup")}>
		{@html iconApple()} Sign up with Apple
	</Button>
{/snippet}

{#snippet termsSlot({
	formData,
	fieldError,
}: {
	formData: RegisterFormData;
	fieldError: (name: string) => string | undefined;
})}
	<div class="mt-2">
		<FieldCheckbox
			checked={formData.extra?.agreedToTerms === true}
			onchange={(e) => {
				if (!formData.extra) formData.extra = {};
				formData.extra.agreedToTerms = (e.currentTarget as HTMLInputElement).checked;
			}}
			label="I agree to the terms of service and privacy policy"
			name="register-terms"
		/>
		{#if fieldError("agreedToTerms")}
			<div class="text-xs text-destructive mt-1">{fieldError("agreedToTerms")}</div>
		{/if}
	</div>
{/snippet}
