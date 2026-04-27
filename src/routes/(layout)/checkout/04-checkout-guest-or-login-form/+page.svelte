<script lang="ts">
	import {
		CheckoutGuestOrLoginForm,
		createEmptyCustomerFormData,
		createEmptyLoginFormData,
		type CheckoutCustomerFormData,
		type CheckoutLoginFormData,
		type LoginFormData,
		type RegisterFormData,
		type LoginOrRegisterFormMode,
	} from "$lib/index.js";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	// --- State ---
	let actionLog = $state<string[]>([]);

	function log(msg: string) {
		actionLog = [...actionLog, `${msg} at ${new Date().toLocaleTimeString()}`];
	}

	// -- Guest form state --
	let guestData = $state<CheckoutCustomerFormData>(createEmptyCustomerFormData());
	let guestSubmitting = $state(false);

	function handleGuestSubmit(data: CheckoutCustomerFormData) {
		guestSubmitting = true;
		log(`Guest submit: ${data.email}`);
		setTimeout(() => (guestSubmitting = false), 1500);
	}

	// -- Login form state --
	let loginData = $state<CheckoutLoginFormData>(createEmptyLoginFormData());
	let loginSubmitting = $state(false);
	let loginError = $state<string>("");

	function handleLoginSubmit(data: CheckoutLoginFormData) {
		loginSubmitting = true;
		log(`Login submit: ${data.email}`);
		setTimeout(() => {
			loginSubmitting = false;
			loginError = "Invalid email or password";
		}, 1500);
	}

	// -- Bindable activeTab --
	let activeTab = $state<"guest" | "login">("guest");

	// -- Mode switcher --
	let selectedMode = $state<"guest-only" | "login-only" | "tabbed" | "stacked">("tabbed");
	const modes = ["guest-only", "login-only", "tabbed", "stacked"] as const;

	// -- loginOrRegisterModal demo state --
	let lorMode = $state<LoginOrRegisterFormMode>("login");
	let lorVerifyEmail = $state("");
	let lorIsSubmitting = $state(false);
	let lorFormError = $state<string | undefined>(undefined);
	let lorRequireVerification = $state(true);

	const lorLoginProps = $derived({ error: lorFormError, showRememberMe: true });
	const lorRegisterProps = $derived({ error: lorFormError });
	const lorVerifyProps = $derived({ error: lorFormError, resendCooldownSeconds: 5 });

	async function handleLorLogin(data: LoginFormData) {
		lorIsSubmitting = true;
		lorFormError = undefined;
		log(`LoR login: ${data.email}`);
		await new Promise((r) => setTimeout(r, 600));
		if (lorRequireVerification) {
			lorVerifyEmail = data.email;
			lorMode = "verify";
			log("→ requiresVerification: true (routed to verify)");
		} else {
			lorFormError = "Invalid email or password";
			log("→ login failed");
		}
		lorIsSubmitting = false;
	}

	async function handleLorRegister(data: RegisterFormData) {
		lorIsSubmitting = true;
		lorFormError = undefined;
		log(`LoR register: ${data.email}`);
		await new Promise((r) => setTimeout(r, 600));
		lorVerifyEmail = data.email;
		lorMode = "verify";
		log("→ register OK; routed to verify");
		lorIsSubmitting = false;
	}

	async function handleLorVerify(code: string) {
		lorIsSubmitting = true;
		lorFormError = undefined;
		log(`LoR verify code: ${code}`);
		await new Promise((r) => setTimeout(r, 400));
		if (code === "111111") {
			log(`→ verified ${lorVerifyEmail}; modal would close here`);
			lorMode = "login";
			lorVerifyEmail = "";
		} else {
			lorFormError = `Invalid code (try 111111)`;
		}
		lorIsSubmitting = false;
	}

	async function handleLorResendCode() {
		await new Promise((r) => setTimeout(r, 200));
		log(`LoR resent code to ${lorVerifyEmail}`);
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutGuestOrLoginForm</h1>

<!-- ============== DEFAULT (tabbed with pill switcher) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default (tabbed with pill switcher)</h2>
	<p class="text-sm opacity-60 mb-4">
		Pill-styled tabs switch between guest and login forms. Default mode.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			guestForm={{
				formData: guestData,
				onSubmit: handleGuestSubmit,
				isSubmitting: guestSubmitting,
			}}
			loginForm={{
				formData: loginData,
				onSubmit: handleLoginSubmit,
				isSubmitting: loginSubmitting,
				error: loginError || undefined,
				onForgotPassword: () => log("Forgot password clicked"),
			}}
		/>
	</div>
</section>

<!-- ============== FORM MODE SWITCHER ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Form mode switcher</h2>
	<p class="text-sm opacity-60 mb-4">Toggle between form modes to see each layout.</p>

	<div class="flex gap-2 mb-6">
		{#each modes as mode}
			<button
				class="px-3 py-1.5 text-sm rounded border transition-colors
					{selectedMode === mode
					? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-transparent'
					: 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
				onclick={() => (selectedMode = mode)}
			>
				{mode}
			</button>
		{/each}
	</div>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			formMode={selectedMode}
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
				onForgotPassword: () => log("Forgot password clicked"),
			}}
		/>
	</div>
</section>

<!-- ============== BINDABLE ACTIVE TAB ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Bindable activeTab</h2>
	<p class="text-sm opacity-60 mb-4">
		External buttons control the active tab via <code>bind:activeTab</code>.
	</p>

	<div class="flex gap-2 mb-4">
		<button
			class="px-3 py-1.5 text-sm rounded border transition-colors
				{activeTab === 'guest'
				? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-transparent'
				: 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
			onclick={() => (activeTab = "guest")}
		>
			Switch to Guest
		</button>
		<button
			class="px-3 py-1.5 text-sm rounded border transition-colors
				{activeTab === 'login'
				? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-transparent'
				: 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
			onclick={() => (activeTab = "login")}
		>
			Switch to Login
		</button>
		<span class="px-3 py-1.5 text-sm font-mono opacity-60">
			activeTab = "{activeTab}"
		</span>
	</div>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			bind:activeTab
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		/>
	</div>
</section>

<!-- ============== CUSTOM TAB LABELS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom tab labels</h2>
	<p class="text-sm opacity-60 mb-4">
		Override default tab labels with <code>guestTabLabel</code> and
		<code>loginTabLabel</code>.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			guestTabLabel="Continue as Guest"
			loginTabLabel="Sign In"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		/>
	</div>
</section>

<!-- ============== WITH HEADING (string) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With heading (string)</h2>
	<p class="text-sm opacity-60 mb-4">
		Pass a string to <code>heading</code> for a styled heading above the switcher.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			heading="Contact Information"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		/>
	</div>
</section>

<!-- ============== WITH HEADING (snippet) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">With heading (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">
		Pass a snippet to <code>heading</code> for custom heading markup.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		>
			{#snippet heading()}
				<div class="flex items-center gap-2 mb-3">
					<span class="text-lg">&#128100;</span>
					<h3 class="text-lg font-semibold m-0">How would you like to checkout?</h3>
				</div>
			{/snippet}
		</CheckoutGuestOrLoginForm>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized styling via CSS variables.</p>

	<div
		class="max-w-md"
		style="
			--stuic-checkout-guest-or-login-tabs-margin-bottom: 1.5rem;
			--stuic-button-group-button-bg-active: var(--stuic-color-foreground);
			--stuic-button-group-button-text-active: var(--stuic-color-background);
			--stuic-button-group-button-bg-active-hover: var(--stuic-color-foreground);
			--stuic-button-group-button-text-active-hover: var(--stuic-color-background);
		"
	>
		<CheckoutGuestOrLoginForm
			heading="Custom Styled"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		/>
	</div>
</section>

<!-- ============== LOGIN AS MODAL (tabbed) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Login as modal (tabbed)</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>loginModal</code> prop, clicking the login tab opens a
		<code>LoginFormModal</code> instead of rendering the form inline. The guest form stays visible.
		The modal title defaults to the login tab label.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: loginData,
				onSubmit: handleLoginSubmit,
				isSubmitting: loginSubmitting,
				error: loginError || undefined,
				onForgotPassword: () => log("Forgot password clicked"),
			}}
			loginModal={{}}
		/>
	</div>
</section>

<!-- ============== LOGIN AS MODAL (custom tab + title override) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Login as modal (custom tab label + title override)</h2>
	<p class="text-sm opacity-60 mb-4">
		Custom <code>loginTabLabel</code> auto-forwards to modal title. Or override with explicit
		<code>loginModal.title</code>.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			heading="Contact Information"
			loginTabLabel="Sign In"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
				onForgotPassword: () => log("Forgot password clicked"),
			}}
			loginModal={{}}
		/>
	</div>
</section>

<!-- ============== LOGIN-OR-REGISTER MODAL (login + register + verify-OTP) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">
		Login-or-register modal (login + register + verify-OTP)
	</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>loginOrRegisterModal</code> prop, the login tab opens a
		<code>LoginOrRegisterFormModal</code>
		giving consumers all three flows — login, self-registration, and post-register OTP verification
		— in a single modal. The consumer owns <code>mode</code> / <code>verifyEmail</code> state and
		flips them in response to backend signals (e.g.,
		<code>requiresVerification</code>). Use <code>onModeChange</code> to keep external state in sync.
		Valid OTP for the demo: <code>111111</code>.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={lorRequireVerification}
			label="Login response: requiresVerification (routes to verify mode)"
			name="lor-require-verification"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			heading="Contact Information"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: () => {},
			}}
			loginOrRegisterModal={{
				mode: lorMode,
				verifyEmail: lorVerifyEmail,
				onLogin: handleLorLogin,
				onRegister: handleLorRegister,
				onVerify: handleLorVerify,
				onResendCode: handleLorResendCode,
				onForgotPassword: () => log("LoR forgot password clicked"),
				onModeChange: (next) => {
					lorMode = next;
					lorFormError = undefined;
					log(`LoR mode → ${next}`);
				},
				isSubmitting: lorIsSubmitting,
				loginProps: lorLoginProps,
				registerProps: lorRegisterProps,
				verifyProps: lorVerifyProps,
				onClose: () => {
					lorFormError = undefined;
					log("LoR modal closed");
				},
			}}
		/>
	</div>

	<p class="text-xs opacity-60 mt-3">
		current modal mode: <code>{lorMode}</code>
		{#if lorVerifyEmail}
			· verifyEmail: <code>{lorVerifyEmail}</code>
		{/if}
	</p>
</section>

<!-- ============== STACKED MODE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Stacked mode</h2>
	<p class="text-sm opacity-60 mb-4">
		Login form on top, divider with "or", then guest form below.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			formMode="stacked"
			heading="Contact Information"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
				error: loginError || undefined,
				onForgotPassword: () => log("Forgot password"),
			}}
		/>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes.
	</p>

	<div class="max-w-md">
		<CheckoutGuestOrLoginForm
			unstyled
			class="space-y-4"
			guestForm={{
				formData: createEmptyCustomerFormData(),
				onSubmit: (data) => log(`Guest: ${data.email}`),
			}}
			loginForm={{
				formData: createEmptyLoginFormData(),
				onSubmit: (data) => log(`Login: ${data.email}`),
			}}
		/>
	</div>
</section>

<!-- ============== ACTION LOG ============== -->
{#if actionLog.length > 0}
	<section class="mb-12">
		<h2 class="text-lg font-bold mb-2">Action log</h2>
		<pre
			class="text-xs p-3 bg-neutral-100 dark:bg-neutral-900 rounded overflow-auto max-h-48">{actionLog.join(
				"\n"
			)}</pre>
		<button
			class="mt-2 text-xs px-2 py-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
			onclick={() => (actionLog = [])}
		>
			Clear log
		</button>
	</section>
{/if}
