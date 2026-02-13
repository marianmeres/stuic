<script lang="ts">
	import {
		CheckoutReviewStep,
		defaultFormatPrice,
		createEmptyCustomerFormData,
		createEmptyLoginFormData,
		type CheckoutCustomerFormData,
		type CheckoutLoginFormData,
	} from "$lib/index.js";
	import type { CartComponentItem } from "$lib/components/Cart/Cart.svelte";

	// --- Sample items ---
	const sampleItems: CartComponentItem[] = [
		{
			id: "prod-1",
			name: "Classic T-Shirt",
			description: "100% cotton, navy blue",
			thumbnailSrc: "https://picsum.photos/seed/tshirt/80/80",
			unitPrice: 2999,
			quantity: 2,
			lineTotal: 5998,
		},
		{
			id: "prod-2",
			name: "Leather Belt",
			thumbnailSrc: "https://picsum.photos/seed/belt/80/80",
			unitPrice: 4500,
			quantity: 1,
			lineTotal: 4500,
		},
		{
			id: "prod-3",
			name: "Running Shoes Pro Max",
			description: "Breathable mesh, size 42",
			thumbnailSrc: "https://picsum.photos/seed/shoes/80/80",
			unitPrice: 12999,
			quantity: 1,
			lineTotal: 12999,
		},
	];

	function dollarFormat(cents: number): string {
		return "$" + (cents / 100).toFixed(2);
	}

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

	// -- Mode switcher --
	let selectedMode = $state<"guest-only" | "login-only" | "tabbed" | "stacked">(
		"guest-only"
	);
	const modes = ["guest-only", "login-only", "tabbed", "stacked"] as const;
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutReviewStep</h1>

<!-- ============== DEFAULT (guest-only) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Default (guest-only)</h2>
	<p class="text-sm opacity-60 mb-4">
		Two-column layout with cart review on the left and guest form on the right. Progress
		indicator at the top.
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		onEditCart={() => log("Edit cart clicked")}
		onStepNavigate={(step) => log(`Navigate to ${step.id}`)}
		guestForm={{
			formData: guestData,
			onSubmit: handleGuestSubmit,
			isSubmitting: guestSubmitting,
		}}
	/>
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

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		formMode={selectedMode}
		onEditCart={() => log("Edit cart clicked")}
		onStepNavigate={(step) => log(`Navigate to ${step.id}`)}
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
</section>

<!-- ============== TABBED MODE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Tabbed mode</h2>
	<p class="text-sm opacity-60 mb-4">Guest and login forms in switchable tabs.</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		formMode="tabbed"
		onEditCart={() => log("Edit cart")}
		guestForm={{
			formData: createEmptyCustomerFormData(),
			onSubmit: (data) => log(`Guest: ${data.email}`),
		}}
		loginForm={{
			formData: createEmptyLoginFormData(),
			onSubmit: (data) => log(`Login: ${data.email}`),
			onForgotPassword: () => log("Forgot password"),
		}}
	/>
</section>

<!-- ============== STACKED MODE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Stacked mode</h2>
	<p class="text-sm opacity-60 mb-4">
		Login form on top, divider with "or", then guest form below.
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		formMode="stacked"
		onEditCart={() => log("Edit cart")}
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
</section>

<!-- ============== LOGIN ONLY ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Login-only mode</h2>
	<p class="text-sm opacity-60 mb-4">
		Only the login form is displayed (no guest option).
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		formMode="login-only"
		onEditCart={() => log("Edit cart")}
		loginForm={{
			formData: createEmptyLoginFormData(),
			onSubmit: handleLoginSubmit,
			isSubmitting: loginSubmitting,
			error: loginError || undefined,
			onForgotPassword: () => log("Forgot password"),
		}}
	/>
</section>

<!-- ============== LOADING STATE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Loading state</h2>
	<p class="text-sm opacity-60 mb-4">
		Skeleton grid shown while <code>isLoading</code> is true.
	</p>

	<CheckoutReviewStep
		items={[]}
		isLoading
		formatPrice={dollarFormat}
		guestForm={{
			onSubmit: () => {},
		}}
	/>
</section>

<!-- ============== ERROR WITH EMPTY CART ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Error with empty cart</h2>
	<p class="text-sm opacity-60 mb-4">
		When <code>error</code> is set and items are empty, only the error alert is shown.
	</p>

	<CheckoutReviewStep
		items={[]}
		error="Your cart is empty. Please add items before checking out."
		formatPrice={dollarFormat}
		guestForm={{
			onSubmit: () => {},
		}}
	/>
</section>

<!-- ============== ERROR WITH ITEMS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Error with items (non-blocking)</h2>
	<p class="text-sm opacity-60 mb-4">
		Error alert shown above the grid, but content is still visible.
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		error="Some items in your cart may have changed."
		formatPrice={dollarFormat}
		guestForm={{
			formData: createEmptyCustomerFormData(),
			onSubmit: (data) => log(`Guest: ${data.email}`),
		}}
	/>
</section>

<!-- ============== CUSTOM COLUMN OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom column overrides (snippets)</h2>
	<p class="text-sm opacity-60 mb-4">
		Override left and right columns via <code>leftColumn</code> and
		<code>rightColumn</code> snippets.
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		guestForm={{
			onSubmit: () => {},
		}}
	>
		{#snippet leftColumn()}
			<div
				class="p-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-center text-blue-600 dark:text-blue-400"
			>
				Custom left column content
			</div>
		{/snippet}
		{#snippet rightColumn()}
			<div
				class="p-8 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg text-center text-green-600 dark:text-green-400"
			>
				Custom right column content
			</div>
		{/snippet}
	</CheckoutReviewStep>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized grid styling via CSS variables.</p>

	<div
		style="
			--stuic-checkout-review-step-grid-columns: 1fr 1fr;
			--stuic-checkout-review-step-grid-gap: 3rem;
		"
	>
		<CheckoutReviewStep
			items={sampleItems}
			formatPrice={dollarFormat}
			formMode="tabbed"
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

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no default CSS classes.
	</p>

	<CheckoutReviewStep
		items={sampleItems}
		formatPrice={dollarFormat}
		unstyled
		class="space-y-6"
		guestForm={{
			formData: createEmptyCustomerFormData(),
			onSubmit: (data) => log(`Guest: ${data.email}`),
		}}
	/>
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
