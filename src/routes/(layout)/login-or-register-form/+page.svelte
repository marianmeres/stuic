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
	import LoginFormsNav from "../login-form/LoginFormsNav.svelte";

	// --- Interactive demo state ---
	let mode = $state<LoginOrRegisterFormMode>("login");
	let loginData = $state<LoginFormData>(createEmptyLoginFormData());
	let registerData = $state<RegisterFormData>(createEmptyRegisterFormData());
	let verifyEmail = $state("");
	let verifyError = $state<string | undefined>(undefined);
	let isSubmitting = $state(false);
	let lastSubmit = $state<
		| { kind: "login"; data: LoginFormData }
		| { kind: "register"; data: RegisterFormData }
		| { kind: "verify"; code: string }
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
		// Simulate backend response: { requiresVerification: true }
		setTimeout(() => {
			isSubmitting = false;
			verifyEmail = data.email || "user@example.com";
			verifyError = undefined;
			mode = "verify";
		}, 1200);
	}

	function handleVerify(code: string) {
		isSubmitting = true;
		lastSubmit = { kind: "verify", code };
		setTimeout(() => {
			isSubmitting = false;
			if (code === "111111") {
				alert("Verified! Welcome " + verifyEmail);
				verifyError = undefined;
			} else {
				verifyError = `Invalid code: ${code}`;
			}
		}, 800);
	}

	async function handleResendCode() {
		await new Promise((r) => setTimeout(r, 400));
	}

	// --- Controls ---
	let showSocialLogins = $state(true);
	let showFooter = $state(true);
	let showExtraFields = $state(false);
	let useCustomSwitcher = $state(false);
	let showGeneralError = $state(false);

	let loginGeneralError = $derived(
		showGeneralError ? "Invalid email or password" : undefined
	);
	let registerGeneralError = $derived(
		showGeneralError ? "Registration failed — please try again" : undefined
	);

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
	let modalVerifyEmail = $state("");
	let modalVerifyError = $state<string | undefined>(undefined);
	let modalSubmitCount = $state(0);
	let modalShowGeneralError = $state(false);
	let modalLoginError = $derived(
		modalShowGeneralError ? "Invalid email or password" : undefined
	);
	let modalRegisterError = $derived(
		modalShowGeneralError ? "Registration failed — please try again" : undefined
	);

	function handleModalLogin(data: LoginFormData) {
		modalSubmitCount++;
		setTimeout(() => {
			modalRef.close();
			alert("Logged in as " + data.email);
		}, 800);
	}

	function handleModalRegister(data: RegisterFormData) {
		modalSubmitCount++;
		// Simulate "requiresVerification" backend response
		setTimeout(() => {
			modalVerifyEmail = data.email || "user@example.com";
			modalVerifyError = undefined;
			modalMode = "verify";
		}, 600);
	}

	function handleModalVerify(code: string) {
		setTimeout(() => {
			if (code === "111111") {
				modalRef.close();
				alert("Verified " + modalVerifyEmail);
				modalVerifyError = undefined;
			} else {
				modalVerifyError = `Invalid code: ${code}`;
			}
		}, 400);
	}

	async function handleModalResendCode() {
		await new Promise((r) => setTimeout(r, 300));
	}

	// --- Bug-repro modal (Issues A / B / C from the BUG-stuic-LoginOrRegisterFormModal report) ---
	let bugModalRef: LoginOrRegisterFormModal = $state()!;
	let bugMode = $state<LoginOrRegisterFormMode>("login");
	let bugIsSubmitting = $state(false);
	let bugFormError = $state<string | undefined>(undefined);
	let bugLoginCallCount = $state(0);
	let bugFailNextSubmit = $state(true);
	let bugClearErrorOnModeChange = $state(true);
	let bugAllowBackdropClose = $state(false);
	let bugSubmitLog = $state<string[]>([]);

	function bugLog(msg: string) {
		bugSubmitLog = [...bugSubmitLog, `${new Date().toLocaleTimeString()} — ${msg}`].slice(
			-10
		);
	}

	async function handleBugLogin(data: LoginFormData) {
		bugLoginCallCount++;
		bugLog(`onLogin called (#${bugLoginCallCount}) — ${data.email}`);
		bugIsSubmitting = true;
		bugFormError = undefined;
		await new Promise((r) => setTimeout(r, 300));
		if (bugFailNextSubmit) {
			bugFormError = "Invalid email and/or password";
			bugLog("→ failed (server returned 401-equivalent)");
		} else {
			bugLog("→ succeeded — closing modal");
			bugModalRef.close();
		}
		bugIsSubmitting = false;
	}

	async function handleBugRegister(data: RegisterFormData) {
		bugLog(`onRegister called — ${data.email}`);
		bugIsSubmitting = true;
		bugFormError = undefined;
		await new Promise((r) => setTimeout(r, 300));
		if (bugFailNextSubmit) {
			bugFormError = "Registration failed";
		} else {
			bugModalRef.close();
		}
		bugIsSubmitting = false;
	}
</script>

<LoginFormsNav />

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
		<FieldSwitch
			bind:checked={showGeneralError}
			label="Show general error (mode-aware)"
			name="show-general-error"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-lg">
		<LoginOrRegisterForm
			bind:mode
			bind:loginData
			bind:registerData
			bind:verifyEmail
			onLogin={handleLogin}
			onRegister={handleRegister}
			onVerify={handleVerify}
			onResendCode={handleResendCode}
			{isSubmitting}
			onForgotPassword={() => alert("Forgot password!")}
			loginProps={{ error: loginGeneralError }}
			registerProps={{
				error: registerGeneralError,
				extraFields: showExtraFields ? sampleExtraFields : undefined,
			}}
			verifyProps={{ error: verifyError, resendCooldownSeconds: 5 }}
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
					lastSubmit.kind === "verify" ? { code: lastSubmit.code } : lastSubmit.data,
					null,
					2
				)}</pre>
		</div>
	{/if}
</section>

<!-- ============== VERIFY MODE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Verify mode</h2>
	<p class="text-sm opacity-60 mb-4">
		The composite form supports a third <code>"verify"</code> mode for the
		post-registration email-verify step. The mode switcher and shared social-logins are
		hidden; the form shows the <code>EmailVerifyForm</code>. Submit a real registration
		above (or use the button below) to flip into <code>"verify"</code>; then enter
		<code>111111</code>
		to "verify".
	</p>
	<div class="flex gap-2 items-center">
		<Button
			onclick={() => {
				verifyEmail = registerData.email || loginData.email || "demo@example.com";
				verifyError = undefined;
				mode = "verify";
			}}
		>
			Trigger verify mode (mock register response)
		</Button>
		<Button variant="outline" onclick={() => (mode = "login")}>Back to login</Button>
		<span class="text-sm opacity-60">
			current mode: <code>{mode}</code>
		</span>
	</div>
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
	<div class="max-w-sm mb-4">
		<FieldSwitch
			bind:checked={modalShowGeneralError}
			label="Show general error in modal (mode-aware)"
			name="modal-show-general-error"
			renderSize="sm"
		/>
	</div>

	<div class="flex gap-4 items-center">
		<LoginOrRegisterFormModal
			bind:this={modalRef}
			bind:mode={modalMode}
			bind:loginData={modalLoginData}
			bind:registerData={modalRegisterData}
			bind:verifyEmail={modalVerifyEmail}
			onLogin={handleModalLogin}
			onRegister={handleModalRegister}
			onVerify={handleModalVerify}
			onResendCode={handleModalResendCode}
			loginProps={{ error: modalLoginError }}
			registerProps={{ error: modalRegisterError }}
			verifyProps={{ error: modalVerifyError, resendCooldownSeconds: 5 }}
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
	<p class="text-xs opacity-60 mt-2">
		Submitting a registration in the modal flips the inner mode to <code>"verify"</code>
		and the modal title updates to "Verify your email". Use code <code>111111</code> to complete
		verification.
	</p>
</section>

<!-- ============== BUG REPRO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Bug repro (Issues A / B / C)</h2>
	<p class="text-sm opacity-60 mb-4">
		Targeted reproduction harness for the
		<code>BUG-stuic-LoginOrRegisterFormModal</code>
		report. Drives the modal through a failed-submit cycle so the silent-retry, accidental-backdrop-close,
		and stale-error-on-mode-switch behaviours can be exercised here without the real backend.
	</p>

	<div class="max-w-md mb-4 space-y-2">
		<FieldSwitch
			bind:checked={bugFailNextSubmit}
			label="Next submit fails (returns 'Invalid email and/or password')"
			name="bug-fail-next-submit"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={bugClearErrorOnModeChange}
			label="Clear error on mode change (uses new onModeChange prop — Issue C fix)"
			name="bug-clear-on-mode-change"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={bugAllowBackdropClose}
			label="Allow backdrop close (sets noClickOutsideClose=false — opt-out of Issue B fix)"
			name="bug-allow-backdrop-close"
			renderSize="sm"
		/>
	</div>

	<div class="flex gap-3 items-start flex-wrap">
		<LoginOrRegisterFormModal
			bind:this={bugModalRef}
			bind:mode={bugMode}
			onLogin={handleBugLogin}
			onRegister={handleBugRegister}
			isSubmitting={bugIsSubmitting}
			loginProps={{ error: bugFormError }}
			registerProps={{ error: bugFormError }}
			noClickOutsideClose={!bugAllowBackdropClose}
			onModeChange={
				bugClearErrorOnModeChange ? () => (bugFormError = undefined) : undefined
			}
		>
			{#snippet trigger({ open })}
				<Button onclick={open}>Open bug-repro modal</Button>
			{/snippet}
		</LoginOrRegisterFormModal>

		<div class="text-sm space-y-1 max-w-md">
			<div>
				<strong>onLogin call count:</strong>
				<code>{bugLoginCallCount}</code>
				— if Issue A is fixed this should increment on every submit click, even when the previous
				submit returned an error.
			</div>
			<div>
				<strong>Current mode:</strong>
				<code>{bugMode}</code>
			</div>
			<div>
				<strong>Current error:</strong>
				<code>{bugFormError ?? "(none)"}</code>
			</div>
		</div>
	</div>

	<div class="mt-4 grid md:grid-cols-3 gap-4 text-xs">
		<div class="space-y-1">
			<h3 class="text-sm font-semibold">Issue A — silent retry</h3>
			<ol class="list-decimal pl-5 space-y-1 opacity-80">
				<li>Open modal, leave "Next submit fails" ON.</li>
				<li>Type any email + password, submit.</li>
				<li>Wait for the red error banner.</li>
				<li>
					<em>Without dismissing it</em>, change the password and submit again.
				</li>
				<li>
					Watch <code>onLogin call count</code> — must increment to 2 (the fix's symptom).
				</li>
			</ol>
		</div>
		<div class="space-y-1">
			<h3 class="text-sm font-semibold">Issue B — accidental close</h3>
			<ol class="list-decimal pl-5 space-y-1 opacity-80">
				<li>Open modal.</li>
				<li>Click in the empty area between the modal box and the screen edge.</li>
				<li>
					With "Allow backdrop close" OFF (default after fix): modal stays open. Toggle ON to
					see the legacy behaviour.
				</li>
			</ol>
		</div>
		<div class="space-y-1">
			<h3 class="text-sm font-semibold">Issue C — stale error on mode switch</h3>
			<ol class="list-decimal pl-5 space-y-1 opacity-80">
				<li>Open modal, submit (with failures ON) so the error banner shows.</li>
				<li>Click the "Sign up" tab.</li>
				<li>
					With "Clear error on mode change" ON: banner disappears via the new
					<code>onModeChange</code> callback. Toggle OFF to see the stale-banner bug.
				</li>
			</ol>
		</div>
	</div>

	{#if bugSubmitLog.length}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Event log (last 10):</h3>
			<pre
				class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{bugSubmitLog.join("\n")}</pre>
		</div>
	{/if}
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
