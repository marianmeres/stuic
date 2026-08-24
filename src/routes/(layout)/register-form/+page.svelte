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
	import LoginFormsNav from "../login-form/LoginFormsNav.svelte";

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
	let socialOnTop = $state(false);
	let showExternalErrors = $state(false);
	let showGeneralError = $state(false);
	let showPasswordConfirm = $state(true);
	let submitDisabled = $state(false);

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

	// --- Identity-first demo state ---
	// The account identity is established by an external party (OAuth provider,
	// invite, magic link) BEFORE the account exists, so the credential fields are
	// unmounted and replaced by `credentialsSlot`. The workspace id is required on
	// both paths, so it sits above the choice (socialPosition="top").
	let identity = $state<{ provider: string; email: string } | null>(null);
	let identityExpired = $state(false);
	let identityForm = $state<RegisterForm>();
	let identityData = $state<RegisterFormData>(createEmptyRegisterFormData());
	let identityErrors = $state<{ field: string; message: string }[]>([]);
	let identitySubmitted = $state<RegisterFormData | null>(null);

	const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

	const identityExtraFields: RegisterFieldConfig[] = [
		{
			name: "workspace_id",
			label: "Workspace id",
			position: "top",
			required: true,
			// seeded into formData.extra on mount (not just displayed)
			initialValue: "acme",
			validate: (v) =>
				SLUG_RE.test(
					String(v ?? "")
						.trim()
						.toLowerCase()
				)
					? undefined
					: "Lowercase letters, digits and dashes (3–32 chars).",
			props: {
				description: `Try "taken" to see a server-side field error.`,
				autocomplete: "off",
				autocapitalize: "none",
				spellcheck: false,
			},
		},
	];

	function confirmIdentity(provider: string) {
		identity = { provider, email: `jane@${provider.toLowerCase()}.example.com` };
		identityErrors = [];
		// the provider button the user just clicked is about to unmount — without
		// this, focus falls to <body> and the next Tab restarts at the document top
		identityForm?.focusField("workspace_id");
	}

	function handleIdentitySubmit(data: RegisterFormData) {
		identitySubmitted = JSON.parse(JSON.stringify(data));
		// pretend the server rejects this particular workspace id
		if (String(data.extra?.workspace_id ?? "") === "taken") {
			identityErrors = [
				{ field: "workspace_id", message: "That workspace id is already taken" },
			];
			identityForm?.focusField("workspace_id");
		} else {
			identityErrors = [];
		}
	}

	// --- "Workspace id, no choice below" demo state ---
	// Same field, but the credentials below it are plain inputs — so the auto
	// separator stays off and the field is simply the first row of the column.
	let forceTopSeparator = $state(false);

	const workspaceIdField: RegisterFieldConfig = {
		name: "workspace_id",
		label: "Workspace id",
		position: "top",
		required: true,
		props: {
			description: "Your team's URL: acme.example.com",
			autocomplete: "off",
			autocapitalize: "none",
			spellcheck: false,
		},
	};

	// --- Invite-first demo state ---
	// No provider buttons at all: the invite itself is the identity, so the
	// credentials are replaced wholesale and the separator is auto-on.
	const invite = { email: "jane@corp.com", by: "Tom Ford" };

	// --- Grouped top fields demo state ---
	const workspaceGroupFields: RegisterFieldConfig[] = [
		{
			name: "workspace_name",
			label: "Workspace name",
			position: "top",
			required: true,
			initialValue: "Acme Inc.",
		},
		{
			...workspaceIdField,
			initialValue: "acme",
			props: { ...workspaceIdField.props, description: "acme.example.com" },
		},
	];

	// --- Modal demo state ---
	let registerModal: RegisterFormModal = $state()!;
	let modalSubmitCount = $state(0);
	let modalShowGeneralError = $state(false);
	let modalGeneralError = $derived(
		modalShowGeneralError ? "Registration failed — please try again" : undefined
	);

	function handleModalSubmit(data: RegisterFormData) {
		modalSubmitCount++;
		setTimeout(() => {
			registerModal.close();
			alert("Registered as " + data.email);
		}, 1000);
	}
</script>

<LoginFormsNav />

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
			bind:checked={socialOnTop}
			label={`socialPosition="top"`}
			name="social-on-top"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={submitDisabled}
			label="submitDisabled"
			name="submit-disabled"
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
			{submitDisabled}
			errors={externalErrorsComputed}
			error={generalError}
			extraFields={showExtraFields ? sampleExtraFields : undefined}
			extraFieldsSlot={showExtraSlot ? termsSlot : undefined}
			socialLogins={showSocialLogins ? socialButtons : undefined}
			socialPosition={socialOnTop ? "top" : "bottom"}
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

<!-- ============== IDENTITY-FIRST ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Identity-first signup</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>socialPosition="top"</code> puts the provider buttons above the credentials (the
		workspace id is required on both paths, so it stays above the choice). Confirming an
		identity unmounts the credential fields via
		<code>showEmail</code>/<code>showPassword</code> and replaces them with
		<code>credentialsSlot</code>. Submitting <code>taken</code> as the workspace id returns
		a server-side field error — edit the field and submit again to see it clear itself.
	</p>
	<p class="text-sm opacity-60 mb-4">
		Because the top-position fields are followed by a <em>choice</em> of sign-up path
		rather than by another input, they are closed off with a section rule — see
		<code>topFieldsSeparator</code> (auto here).
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={identityExpired}
			label="Identity expired (submitDisabled)"
			name="identity-expired"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-lg">
		<RegisterForm
			bind:this={identityForm}
			bind:formData={identityData}
			onSubmit={handleIdentitySubmit}
			errors={identityErrors}
			showEmail={!identity}
			showPassword={!identity}
			showPasswordConfirm={false}
			socialPosition="top"
			socialLogins={identity ? undefined : identityProviders}
			socialDividerLabel="or use an email and password"
			credentialsSlot={identity ? identityRow : undefined}
			emailFieldProps={{ label: "Owner email" }}
			passwordFieldProps={{
				label: "Password",
				description: "At least 8 characters.",
			}}
			submitDisabled={identityExpired}
			submitLabel="Create workspace"
			extraFields={identityExtraFields}
		/>
	</div>

	{#if identitySubmitted}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Last submitted data:</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					identitySubmitted,
					null,
					2
				)}</pre>
		</div>
	{/if}
</section>

<!-- ============== WORKSPACE ID, NO CHOICE BELOW ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Workspace id above plain credentials</h2>
	<p class="text-sm opacity-60 mb-4">
		The same top-position field, but what follows it is just more inputs — so the
		automatic <code>topFieldsSeparator</code> stays <strong>off</strong> and the field is simply
		the first row of one column. Flip the switch to force the rule on anyway.
	</p>

	<div class="max-w-sm mb-4">
		<FieldSwitch
			bind:checked={forceTopSeparator}
			label={`topFieldsSeparator={true}`}
			name="force-top-separator"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-lg">
		<RegisterForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			extraFields={[workspaceIdField]}
			topFieldsSeparator={forceTopSeparator ? true : undefined}
			submitLabel="Create workspace"
			socialLogins={socialButtons}
		/>
	</div>
</section>

<!-- ============== INVITE-FIRST ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Invite-first (no provider buttons)</h2>
	<p class="text-sm opacity-60 mb-4">
		The invite token is the identity, so there is nothing to choose: no
		<code>socialLogins</code> at all, and <code>credentialsSlot</code> replaces the credentials
		outright. The separator is still auto-on — the workspace id is a field the user fills in,
		the block below it is not.
	</p>

	<div class="max-w-lg">
		<RegisterForm
			onSubmit={(data) => alert("Workspace: " + data.extra?.workspace_id)}
			showEmail={false}
			showPassword={false}
			extraFields={[{ ...workspaceIdField, initialValue: "acme" }]}
			credentialsSlot={inviteRow}
			submitLabel="Accept invite"
		/>
	</div>
</section>

<!-- ============== GROUPED TOP FIELDS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Several top fields as one group</h2>
	<p class="text-sm opacity-60 mb-4">
		The rule closes the whole top-position <em>group</em>, not each field — the fields
		keep their normal rhythm between themselves and the break lands once, below the last
		of them.
	</p>

	<div class="max-w-lg">
		<RegisterForm
			onSubmit={(data) => alert("Submitted: " + data.email)}
			extraFields={workspaceGroupFields}
			showPasswordConfirm={false}
			socialPosition="top"
			socialLogins={plainProviders}
			socialDividerLabel="or use an email and password"
			emailFieldProps={{ label: "Owner email" }}
			submitLabel="Create workspace"
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

	<div class="max-w-sm mb-4">
		<FieldSwitch
			bind:checked={modalShowGeneralError}
			label="Show general error in modal"
			name="modal-show-general-error"
			renderSize="sm"
		/>
	</div>

	<div class="flex gap-4 items-center">
		<RegisterFormModal
			bind:this={registerModal}
			onSubmit={handleModalSubmit}
			error={modalGeneralError}
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

{#snippet identityProviders()}
	<Button variant="outline" class="w-full" onclick={() => confirmIdentity("Google")}>
		{@html iconGoogle()} Continue with Google
	</Button>
	<Button variant="outline" class="w-full" onclick={() => confirmIdentity("Apple")}>
		{@html iconApple()} Continue with Apple
	</Button>
{/snippet}

{#snippet plainProviders()}
	<Button variant="outline" class="w-full" onclick={() => alert("Google signup")}>
		{@html iconGoogle()} Continue with Google
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Apple signup")}>
		{@html iconApple()} Continue with Apple
	</Button>
{/snippet}

{#snippet identityRow()}
	<div class="mb-4 rounded-md border border-border p-3 text-sm">
		<div class="flex items-center justify-between gap-4">
			<div>
				<div class="opacity-60 text-xs">Signing up with {identity?.provider}</div>
				<div class="font-medium">{identity?.email}</div>
			</div>
			<button
				type="button"
				class="underline whitespace-nowrap"
				onclick={() => {
					identity = null;
					identityExpired = false;
				}}
			>
				Use a different account
			</button>
		</div>
		{#if identityExpired}
			<div class="text-xs text-destructive mt-2">
				This confirmation has expired — please confirm the account again.
			</div>
		{/if}
	</div>
{/snippet}

{#snippet inviteRow()}
	<div class="mb-4 rounded-md border border-border p-3 text-sm">
		<div class="opacity-60 text-xs">Invited by {invite.by}</div>
		<div class="font-medium">{invite.email}</div>
		<div class="opacity-60 text-xs mt-1">
			You'll set a password after accepting the invite.
		</div>
	</div>
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
