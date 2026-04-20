<script lang="ts">
	import {
		LoginOrRegisterForm,
		LoginOrRegisterFormModal,
		createEmptyLoginFormData,
		createEmptyRegisterFormData,
		type LoginFormData,
		type RegisterFormData,
		type LoginOrRegisterFormMode,
		type RegisterFieldConfig,
	} from "$lib/index.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import { iconGoogle, iconFacebook, iconApple } from "$lib/icons/index.js";

	// --- Interactive demo state ---
	let mode = $state<LoginOrRegisterFormMode>("login");
	let loginData = $state<LoginFormData>(createEmptyLoginFormData());
	let registerData = $state<RegisterFormData>(createEmptyRegisterFormData());
	let isSubmitting = $state(false);
	let lastSubmit = $state<
		| { kind: "login"; data: LoginFormData }
		| { kind: "register"; data: RegisterFormData }
		| null
	>(null);

	function handleLogin(data: LoginFormData) {
		isSubmitting = true;
		lastSubmit = { kind: "login", data: { ...data } };
		setTimeout(() => (isSubmitting = false), 1200);
	}

	function handleRegister(data: RegisterFormData) {
		isSubmitting = true;
		lastSubmit = { kind: "register", data: JSON.parse(JSON.stringify(data)) };
		setTimeout(() => (isSubmitting = false), 1200);
	}

	// --- Controls ---
	let showSocialLogins = $state(true);
	let showFooter = $state(true);
	let showExtraFields = $state(false);
	let useCustomSwitcher = $state(false);

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
		},
	];

	// --- Modal demo state ---
	let modalRef: LoginOrRegisterFormModal = $state()!;
	let modalMode = $state<LoginOrRegisterFormMode>("login");
	let modalLoginData = $state<LoginFormData>(createEmptyLoginFormData());
	let modalRegisterData = $state<RegisterFormData>(createEmptyRegisterFormData());
	let modalSubmitCount = $state(0);

	function handleModalLogin(data: LoginFormData) {
		modalSubmitCount++;
		setTimeout(() => {
			modalRef.close();
			alert("Logged in as " + data.email);
		}, 800);
	}

	function handleModalRegister(data: RegisterFormData) {
		modalSubmitCount++;
		setTimeout(() => {
			modalRef.close();
			alert("Registered as " + data.email);
		}, 800);
	}
</script>

<h1 class="text-2xl font-bold mb-8">LoginOrRegisterForm</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Composite form that toggles between <code>LoginForm</code> and
		<code>RegisterForm</code>. Email persists across mode switches.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showSocialLogins}
			label="Show shared social logins"
			name="show-social"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showFooter}
			label="Show footer (mode-aware links)"
			name="show-footer"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExtraFields}
			label="Show extraFields on register form"
			name="show-extra"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={useCustomSwitcher}
			label="Use custom modeSwitcher snippet"
			name="use-custom-switcher"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-lg">
		<LoginOrRegisterForm
			bind:mode
			bind:loginData
			bind:registerData
			onLogin={handleLogin}
			onRegister={handleRegister}
			{isSubmitting}
			loginProps={{ onForgotPassword: () => alert("Forgot password!") }}
			registerProps={{
				extraFields: showExtraFields ? sampleExtraFields : undefined,
			}}
			socialLogins={showSocialLogins ? socialButtons : undefined}
			modeSwitcher={useCustomSwitcher ? customSwitcher : undefined}
		>
			{#snippet footer({ mode: currentMode, setMode })}
				{#if showFooter}
					<div class="text-center text-sm opacity-60 pt-2">
						{#if currentMode === "login"}
							Don't have an account?
							<button type="button" class="underline" onclick={() => setMode("register")}>
								Sign up
							</button>
						{:else}
							Already have an account?
							<button type="button" class="underline" onclick={() => setMode("login")}>
								Sign in
							</button>
						{/if}
					</div>
				{/if}
			{/snippet}
		</LoginOrRegisterForm>
	</div>

	<div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
		<div>
			<h3 class="text-sm font-semibold mb-1">Current mode</h3>
			<pre class="text-xs bg-muted p-3 rounded-md">{mode}</pre>
		</div>
		<div>
			<h3 class="text-sm font-semibold mb-1">loginData</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					loginData,
					null,
					2
				)}</pre>
		</div>
		<div>
			<h3 class="text-sm font-semibold mb-1">registerData</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					registerData,
					null,
					2
				)}</pre>
		</div>
	</div>

	{#if lastSubmit}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">
				Last submitted ({lastSubmit.kind}):
			</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					lastSubmit.data,
					null,
					2
				)}</pre>
		</div>
	{/if}
</section>

<!-- ============== BASIC ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		Only <code>onLogin</code> and <code>onRegister</code> provided.
	</p>
	<div class="max-w-lg">
		<LoginOrRegisterForm
			onLogin={(data) => alert("Login: " + data.email)}
			onRegister={(data) => alert("Register: " + data.email)}
		/>
	</div>
</section>

<!-- ============== MODAL ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Modal</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>LoginOrRegisterFormModal</code> renders the composite inside a modal dialog. The title
		updates live as the user toggles modes ("Log In" ↔ "Create account").
	</p>
	<div class="flex gap-4 items-center">
		<LoginOrRegisterFormModal
			bind:this={modalRef}
			bind:mode={modalMode}
			bind:loginData={modalLoginData}
			bind:registerData={modalRegisterData}
			onLogin={handleModalLogin}
			onRegister={handleModalRegister}
			socialLogins={socialButtons}
		>
			{#snippet trigger({ open })}
				<Button onclick={open}>Open Login/Register Modal</Button>
			{/snippet}
		</LoginOrRegisterFormModal>

		<p class="text-sm opacity-60">
			modal mode: <code>{modalMode}</code>
			{#if modalSubmitCount > 0}
				· submitted <strong>{modalSubmitCount}</strong> time{modalSubmitCount === 1
					? ""
					: "s"}
			{/if}
		</p>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> — no composite CSS classes applied.
	</p>
	<div class="max-w-lg">
		<LoginOrRegisterForm
			unstyled
			class="space-y-4"
			onLogin={(data) => alert("Login: " + data.email)}
			onRegister={(data) => alert("Register: " + data.email)}
		/>
	</div>
</section>

{#snippet socialButtons()}
	<Button variant="outline" class="w-full" onclick={() => alert("Google")}>
		{@html iconGoogle()} Continue with Google
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Facebook")}>
		{@html iconFacebook()} Continue with Facebook
	</Button>
	<Button variant="outline" class="w-full" onclick={() => alert("Apple")}>
		{@html iconApple()} Continue with Apple
	</Button>
{/snippet}

{#snippet customSwitcher({
	mode,
	setMode,
}: {
	mode: LoginOrRegisterFormMode;
	setMode: (m: LoginOrRegisterFormMode) => void;
	t: unknown;
})}
	<div class="flex gap-2 w-full">
		<Button
			class="flex-1"
			variant={mode === "login" ? "default" : "outline"}
			onclick={() => setMode("login")}
		>
			Sign in
		</Button>
		<Button
			class="flex-1"
			variant={mode === "register" ? "default" : "outline"}
			onclick={() => setMode("register")}
		>
			Create account
		</Button>
	</div>
{/snippet}
