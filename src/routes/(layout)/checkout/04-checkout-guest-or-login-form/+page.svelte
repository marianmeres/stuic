<script lang="ts">
	import {
		CheckoutGuestOrLoginForm,
		createEmptyCustomerFormData,
		createEmptyLoginFormData,
		type CheckoutCustomerFormData,
		type CheckoutLoginFormData,
	} from "$lib/index.js";

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
			--stuic-tabbed-menu-tab-bg: transparent;
			--stuic-tabbed-menu-tab-bg-active: var(--stuic-color-foreground);
			--stuic-tabbed-menu-tab-text-active: var(--stuic-color-background);
			--stuic-tabbed-menu-border: var(--stuic-color-border);
			--stuic-tabbed-menu-border-active: var(--stuic-color-foreground);
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
