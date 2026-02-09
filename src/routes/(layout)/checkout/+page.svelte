<script lang="ts">
	import {
		defaultFormatPrice,
		validateEmail,
		validateAddress,
		validateCustomerForm,
		createEmptyAddress,
		createEmptyCustomerFormData,
		createEmptyLoginFormData,
		type CheckoutAddressData,
		type CheckoutCustomerFormData,
		type CheckoutValidationError,
	} from "$lib/index.js";

	import FieldInput from "$lib/components/Input/FieldInput.svelte";
	import { t_default } from "$lib/components/Checkout/_internal/checkout-i18n-defaults.js";

	// --- Format price demos ---
	const priceExamples = [0, 99, 1299, 12999, 100000];

	// --- i18n interpolation demos ---
	const i18nExamples: { key: string; values: Record<string, string | number> | null }[] =
		[
			{ key: "checkout.cart.item_count_1", values: null },
			{ key: "checkout.cart.item_count_n", values: { count: 5 } },
			{ key: "checkout.delivery.free_above", values: { threshold: "$50.00" } },
			{ key: "checkout.complete.email_sent", values: { email: "user@example.com" } },
			{ key: "checkout.address.field_required", values: { field: "City" } },
			{ key: "checkout.step.place_order", values: null },
		];

	// --- Validation demos ---
	let emailInput = $state("");
	let emailError = $derived(validateEmail(emailInput, t_default));

	let addressData = $state<CheckoutAddressData>(createEmptyAddress());
	let addressErrors = $derived(validateAddress(addressData, "shipping", t_default));

	let customerData = $state<CheckoutCustomerFormData>(createEmptyCustomerFormData());
	let customerErrors = $derived(validateCustomerForm(customerData, t_default));

	// --- Factory demos ---
	const emptyAddress = createEmptyAddress();
	const emptyCustomer = createEmptyCustomerFormData();
	const emptyLogin = createEmptyLoginFormData();

	function addressFieldError(field: string): string | undefined {
		return addressErrors.find((e) => e.field === `shipping.${field}`)?.message;
	}
</script>

<div class="p-4">
	<ul class="space-y-2">
		{#each ["checkout-progress"] as link}
			<li>
				<a
					href="/checkout/{link}"
					class="block p-2 px-4 rounded-lg bg-neutral-200 dark:bg-neutral-900 hover:text-white hover:bg-neutral-600"
					>{link}</a
				>
			</li>
		{/each}
	</ul>
</div>

<hr class="my-6" />

<h1 class="text-2xl font-bold mb-8">Checkout — Shared Foundation</h1>

<!-- ============== FORMAT PRICE ============== -->
<h2 class="text-lg font-bold mb-4">defaultFormatPrice()</h2>
<p class="text-sm opacity-60 mb-4">
	Converts cents to a simple decimal string. Host projects override with locale-aware
	formatting.
</p>
<div class="max-w-md">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-border">
				<th class="text-left py-2">Cents</th>
				<th class="text-left py-2">Output</th>
			</tr>
		</thead>
		<tbody>
			{#each priceExamples as cents}
				<tr class="border-b border-border/50">
					<td class="py-2 font-mono">{cents}</td>
					<td class="py-2 font-mono">{defaultFormatPrice(cents)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<hr class="my-8" />

<!-- ============== I18N DEFAULTS ============== -->
<h2 class="text-lg font-bold mb-4">t_default() — i18n Interpolation</h2>
<p class="text-sm opacity-60 mb-4">
	Default English translations with <code>{"{placeholder}"}</code> interpolation.
</p>
<div class="max-w-xl">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-border">
				<th class="text-left py-2">Key</th>
				<th class="text-left py-2">Values</th>
				<th class="text-left py-2">Result</th>
			</tr>
		</thead>
		<tbody>
			{#each i18nExamples as { key, values }}
				<tr class="border-b border-border/50">
					<td class="py-2 font-mono text-xs">{key}</td>
					<td class="py-2 font-mono text-xs">{values ? JSON.stringify(values) : "—"}</td>
					<td class="py-2">{t_default(key, values)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<hr class="my-8" />

<!-- ============== EMAIL VALIDATION ============== -->
<h2 class="text-lg font-bold mb-4">validateEmail()</h2>
<p class="text-sm opacity-60 mb-4">
	Interactive email validation using FieldInput with custom validator wired to checkout's
	<code>validateEmail()</code>.
</p>
<div class="max-w-md">
	<FieldInput
		bind:value={emailInput}
		label="Email"
		name="email-demo"
		type="email"
		placeholder="you@example.com"
		required
		validate={{
			customValidator(val) {
				return validateEmail(String(val || ""), t_default) || "";
			},
		}}
	>
		{#snippet description()}
			{#if !emailError && emailInput.trim()}
				<span class="text-green-600">Valid</span>
			{/if}
		{/snippet}
	</FieldInput>
</div>

<hr class="my-8" />

<!-- ============== ADDRESS VALIDATION ============== -->
<h2 class="text-lg font-bold mb-4">validateAddress()</h2>
<p class="text-sm opacity-60 mb-4">
	Address validation — all required fields using FieldInput with checkout's
	<code>validateAddress()</code>.
</p>
<div class="max-w-md space-y-1">
	<FieldInput
		bind:value={addressData.name}
		label={t_default("checkout.address.name_label")}
		name="addr-name"
		required
		validate={{
			customValidator() {
				return addressFieldError("name") || "";
			},
		}}
	/>
	<FieldInput
		bind:value={addressData.street}
		label={t_default("checkout.address.street_label")}
		name="addr-street"
		required
		validate={{
			customValidator() {
				return addressFieldError("street") || "";
			},
		}}
	/>
	<FieldInput
		bind:value={addressData.city}
		label={t_default("checkout.address.city_label")}
		name="addr-city"
		required
		validate={{
			customValidator() {
				return addressFieldError("city") || "";
			},
		}}
	/>
	<FieldInput
		bind:value={addressData.postal_code}
		label={t_default("checkout.address.postal_code_label")}
		name="addr-postal-code"
		required
		validate={{
			customValidator() {
				return addressFieldError("postal_code") || "";
			},
		}}
	/>
	<FieldInput
		bind:value={addressData.country}
		label={t_default("checkout.address.country_label")}
		name="addr-country"
		required
		validate={{
			customValidator() {
				return addressFieldError("country") || "";
			},
		}}
	/>
	<div class="text-sm pt-2">
		Errors: <span class="font-mono">{addressErrors.length}</span>
	</div>
</div>

<hr class="my-8" />

<!-- ============== CUSTOMER FORM VALIDATION ============== -->
<h2 class="text-lg font-bold mb-4">validateCustomerForm()</h2>
<p class="text-sm opacity-60 mb-4">Customer form validation — only email is required.</p>
<div class="max-w-md">
	<FieldInput
		bind:value={customerData.email}
		label="Email"
		name="cust-email"
		type="email"
		placeholder="you@example.com"
		required
		validate={{
			customValidator(val) {
				const errors = validateCustomerForm(
					{ ...customerData, email: String(val || "") },
					t_default
				);
				return errors[0]?.message || "";
			},
		}}
	/>
</div>

<hr class="my-8" />

<!-- ============== CSS CLASSES DEMO ============== -->
<h2 class="text-lg font-bold mb-4">Shared CSS Classes</h2>
<p class="text-sm opacity-60 mb-4">
	Visual rendering of the shared checkout CSS classes (raw HTML, not FieldInput).
</p>
<div class="max-w-md space-y-6">
	<div>
		<h3 class="text-sm font-semibold mb-2">
			.stuic-checkout-label + .stuic-checkout-input
		</h3>
		<label class="stuic-checkout-label" for="sample-input">Sample Label</label>
		<input
			id="sample-input"
			type="text"
			class="stuic-checkout-input"
			placeholder="Sample input"
		/>
	</div>

	<div>
		<h3 class="text-sm font-semibold mb-2">.stuic-checkout-input-error</h3>
		<input
			type="text"
			class="stuic-checkout-input stuic-checkout-input-error"
			value="Invalid value"
		/>
		<p class="stuic-checkout-field-error">This field has an error</p>
	</div>

	<div>
		<h3 class="text-sm font-semibold mb-2">.stuic-checkout-alert</h3>
		<div class="stuic-checkout-alert">
			Please fix the following issues before placing your order.
		</div>
	</div>
</div>

<hr class="my-8" />

<!-- ============== FACTORY FUNCTIONS ============== -->
<h2 class="text-lg font-bold mb-4">Empty Data Factories</h2>
<p class="text-sm opacity-60 mb-4">Output of factory functions for initial form state.</p>
<div class="max-w-xl space-y-4">
	<div>
		<h3 class="text-sm font-semibold mb-1">createEmptyAddress()</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				emptyAddress,
				null,
				2
			)}</pre>
	</div>
	<div>
		<h3 class="text-sm font-semibold mb-1">createEmptyCustomerFormData()</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				emptyCustomer,
				null,
				2
			)}</pre>
	</div>
	<div>
		<h3 class="text-sm font-semibold mb-1">createEmptyLoginFormData()</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				emptyLogin,
				null,
				2
			)}</pre>
	</div>
</div>
