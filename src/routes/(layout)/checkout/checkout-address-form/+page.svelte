<script lang="ts">
	import {
		CheckoutAddressForm,
		createEmptyAddress,
		validateAddress,
		type CheckoutAddressData,
		type CheckoutValidationError,
	} from "$lib/index.js";
	import { t_default } from "$lib/components/Checkout/_internal/checkout-i18n-defaults.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";
	import FieldSelect from "$lib/components/Input/FieldSelect.svelte";

	// --- Interactive demo state ---
	let address = $state<CheckoutAddressData>(createEmptyAddress());
	let errors = $state<CheckoutValidationError[]>([]);

	function handleValidate() {
		errors = validateAddress(address, "shipping", t_default);
	}

	function handleReset() {
		address = createEmptyAddress();
		errors = [];
	}

	// --- Controls ---
	let showName = $state(true);
	let showStreet = $state(true);
	let showCity = $state(true);
	let showPostalCode = $state(true);
	let showCountry = $state(true);
	let showPhone = $state(true);
	let useCustomCountry = $state(false);

	let fieldsConfig = $derived({
		name: showName,
		street: showStreet,
		city: showCity,
		postal_code: showPostalCode,
		country: showCountry,
		phone: showPhone,
	});

	// --- Billing demo ---
	let billingAddress = $state<CheckoutAddressData>(createEmptyAddress());
	let billingErrors = $state<CheckoutValidationError[]>([]);

	function handleBillingValidate() {
		billingErrors = validateAddress(billingAddress, "billing", t_default);
	}

	// --- Custom required fields demo ---
	let minimalAddress = $state<CheckoutAddressData>(createEmptyAddress());
	let minimalErrors = $state<CheckoutValidationError[]>([]);
	const minimalRequired = ["name", "city", "country"];

	function handleMinimalValidate() {
		const errs: CheckoutValidationError[] = [];
		for (const field of minimalRequired) {
			const value = minimalAddress[field as keyof CheckoutAddressData];
			if (!value || !String(value).trim()) {
				const label = t_default(`checkout.address.${field}_label`);
				errs.push({
					field: `minimal.${field}`,
					message: t_default("checkout.address.field_required", { field: label }),
				});
			}
		}
		minimalErrors = errs;
	}

	// --- Country options for custom selector demo ---
	const COUNTRIES = [
		"United States",
		"Canada",
		"United Kingdom",
		"Germany",
		"France",
		"Czech Republic",
		"Slovakia",
		"Austria",
	];
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutAddressForm</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Full address form with configurable fields and validation.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch bind:checked={showName} label="Show Name" name="show-name" renderSize="sm" />
		<FieldSwitch
			bind:checked={showStreet}
			label="Show Street"
			name="show-street"
			renderSize="sm"
		/>
		<FieldSwitch bind:checked={showCity} label="Show City" name="show-city" renderSize="sm" />
		<FieldSwitch
			bind:checked={showPostalCode}
			label="Show Postal Code"
			name="show-postal-code"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showCountry}
			label="Show Country"
			name="show-country"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showPhone}
			label="Show Phone"
			name="show-phone"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={useCustomCountry}
			label="Use custom country selector"
			name="use-custom-country"
			renderSize="sm"
		/>
	</div>

	<div class="max-w-lg">
		{#if useCustomCountry}
			<CheckoutAddressForm
				bind:address
				label="shipping"
				{errors}
				fields={fieldsConfig}
			>
				{#snippet countryField({ value, onchange, error, label: fieldLabel, id })}
					<FieldSelect
						options={COUNTRIES}
						value={value}
						onchange={(e) => onchange(e.currentTarget.value)}
						label={fieldLabel}
						{id}
						name={id}
						required
					/>
				{/snippet}
			</CheckoutAddressForm>
		{:else}
			<CheckoutAddressForm
				bind:address
				label="shipping"
				{errors}
				fields={fieldsConfig}
			/>
		{/if}
	</div>

	<div class="mt-4 flex gap-2">
		<Button size="sm" class="border px-3" onclick={handleValidate}>Validate</Button>
		<Button size="sm" class="border px-3" onclick={handleReset}>Reset</Button>
	</div>

	{#if errors.length > 0}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Validation errors:</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					errors,
					null,
					2
				)}</pre>
		</div>
	{/if}

	<div class="mt-4">
		<h3 class="text-sm font-semibold mb-1">Live address data:</h3>
		<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
				address,
				null,
				2
			)}</pre>
	</div>
</section>

<!-- ============== BASIC (MINIMAL PROPS) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Basic (minimal props)</h2>
	<p class="text-sm opacity-60 mb-4">
		No props — all defaults applied. Label prefix defaults to "address".
	</p>

	<div class="max-w-lg">
		<CheckoutAddressForm />
	</div>
</section>

<!-- ============== BILLING ADDRESS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Billing address</h2>
	<p class="text-sm opacity-60 mb-4">
		Same component with <code>label="billing"</code> — generates billing-prefixed IDs and
		matches billing-prefixed errors.
	</p>

	<div class="max-w-lg">
		<CheckoutAddressForm
			bind:address={billingAddress}
			label="billing"
			errors={billingErrors}
		/>
	</div>

	<div class="mt-4 flex gap-2">
		<Button size="sm" class="border px-3" onclick={handleBillingValidate}>
			Validate Billing
		</Button>
		<Button
			size="sm"
			class="border px-3"
			onclick={() => {
				billingAddress = createEmptyAddress();
				billingErrors = [];
			}}
		>
			Reset
		</Button>
	</div>

	{#if billingErrors.length > 0}
		<div class="mt-4">
			<h3 class="text-sm font-semibold mb-1">Billing errors:</h3>
			<pre class="text-xs bg-muted p-3 rounded-md overflow-x-auto">{JSON.stringify(
					billingErrors,
					null,
					2
				)}</pre>
		</div>
	{/if}
</section>

<!-- ============== CUSTOM REQUIRED FIELDS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom required fields</h2>
	<p class="text-sm opacity-60 mb-4">
		Only name, city, and country are required.
		Street, postal code, and phone are optional.
	</p>

	<div class="max-w-lg">
		<CheckoutAddressForm
			bind:address={minimalAddress}
			label="minimal"
			errors={minimalErrors}
			requiredFields={minimalRequired}
		/>
	</div>

	<div class="mt-4 flex gap-2">
		<Button size="sm" class="border px-3" onclick={handleMinimalValidate}>Validate</Button>
		<Button
			size="sm"
			class="border px-3"
			onclick={() => {
				minimalAddress = createEmptyAddress();
				minimalErrors = [];
			}}
		>
			Reset
		</Button>
	</div>
</section>

<!-- ============== WITHOUT PHONE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Without phone field</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>fields=&#123;&#123; phone: false &#125;&#125;</code> hides the phone field.
	</p>

	<div class="max-w-lg">
		<CheckoutAddressForm fields={{ phone: false }} />
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no checkout-specific CSS classes applied.
		FieldInput styling still applies.
	</p>

	<div class="max-w-lg">
		<CheckoutAddressForm unstyled class="space-y-4" />
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDES ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div class="max-w-lg" style="--stuic-checkout-address-gap: 1.5rem;">
		<CheckoutAddressForm />
	</div>
</section>

<!-- ============== PRE-FILLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Pre-filled address</h2>
	<p class="text-sm opacity-60 mb-4">Address data pre-populated.</p>

	<div class="max-w-lg">
		<CheckoutAddressForm
			address={{
				name: "Jane Doe",
				street: "456 Oak Avenue",
				city: "Portland",
				postal_code: "97201",
				country: "United States",
				phone: "+1 (503) 555-0199",
			}}
		/>
	</div>
</section>
