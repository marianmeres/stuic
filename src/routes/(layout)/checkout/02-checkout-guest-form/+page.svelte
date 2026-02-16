<script lang="ts">
	import {
		CheckoutGuestForm,
		createEmptyCustomerFormData,
		validateCustomerForm,
		type CheckoutCustomerFormData,
		type CheckoutValidationError,
	} from "$lib/index.js";
	import { t_default } from "$lib/components/Checkout/_internal/checkout-i18n-defaults.js";
	import Button from "$lib/components/Button/Button.svelte";
	import FieldSwitch from "$lib/components/Input/FieldSwitch.svelte";

	// --- Interactive demo state ---
	let formData = $state<CheckoutCustomerFormData>(createEmptyCustomerFormData());
	let isSubmitting = $state(false);
	let submitCount = $state(0);
	let lastSubmittedData = $state<CheckoutCustomerFormData | null>(null);

	function handleSubmit(data: CheckoutCustomerFormData) {
		submitCount++;
		isSubmitting = true;
		lastSubmittedData = { ...data };
		setTimeout(() => {
			isSubmitting = false;
		}, 1500);
	}

	// --- External errors demo ---
	let showExternalErrors = $state(false);

	let externalErrorsComputed = $derived(
		showExternalErrors
			? [{ field: "email", message: "This email is already registered" }]
			: []
	);

	// --- Controls ---
	let showB2b = $state(true);
	let b2bExpanded = $state(false);
	let showFirstName = $state(true);
	let showLastName = $state(true);
	let showPhone = $state(true);

	let fieldsConfig = $derived({
		first_name: showFirstName,
		last_name: showLastName,
		phone: showPhone,
	});

	// --- Custom validation demo ---
	function strictValidation(data: CheckoutCustomerFormData): CheckoutValidationError[] {
		const errors = validateCustomerForm(data, t_default);
		if (!data.first_name.trim()) {
			errors.push({ field: "first_name", message: "First name is required" });
		}
		if (!data.last_name.trim()) {
			errors.push({ field: "last_name", message: "Last name is required" });
		}
		return errors;
	}
</script>

<h1 class="text-2xl font-bold mb-8">CheckoutGuestForm</h1>

<!-- ============== INTERACTIVE DEMO ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Interactive</h2>
	<p class="text-sm opacity-60 mb-4">
		Full form with configurable fields, B2B toggle, and submit handler.
	</p>

	<div class="max-w-sm mb-4 space-y-2">
		<FieldSwitch
			bind:checked={showB2b}
			label="Show B2B fields"
			name="show-b2b"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={b2bExpanded}
			label="B2B expanded"
			name="b2b-expanded"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showFirstName}
			label="Show First Name"
			name="show-first-name"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showLastName}
			label="Show Last Name"
			name="show-last-name"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showPhone}
			label="Show Phone"
			name="show-phone"
			renderSize="sm"
		/>
		<FieldSwitch
			bind:checked={showExternalErrors}
			label="Inject external error"
			name="show-external-errors"
			renderSize="sm"
		/>
	</div>

	{#if submitCount > 0}
		<p class="text-sm mb-4">
			Submitted <strong>{submitCount}</strong> time{submitCount === 1 ? "" : "s"}
		</p>
	{/if}

	<div class="max-w-full">
		<CheckoutGuestForm
			bind:formData
			onSubmit={handleSubmit}
			{isSubmitting}
			showB2bFields={showB2b}
			{b2bExpanded}
			fields={fieldsConfig}
			errors={externalErrorsComputed}
			phoneFieldProps={{
				defaultCountry: "SK",
				preferredCountries: ["SK", "CZ", "AT", "DE"],
			}}
		/>
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
		<CheckoutGuestForm onSubmit={(data) => alert("Submitted: " + data.email)} />
	</div>
</section>

<!-- ============== NO B2B ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Without B2B fields</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>showB2bFields=&#123;false&#125;</code> hides the business information section.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			showB2bFields={false}
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== EMAIL ONLY ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Email only</h2>
	<p class="text-sm opacity-60 mb-4">
		All optional fields hidden. Only email remains (always required).
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			fields={{ first_name: false, last_name: false, phone: false }}
			showB2bFields={false}
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== FIRST NAME ONLY (SINGLE COLUMN) ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Single name field</h2>
	<p class="text-sm opacity-60 mb-4">
		Only first name shown — row adjusts to single column automatically.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			fields={{ last_name: false, phone: false }}
			showB2bFields={false}
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CUSTOM LABELS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom CTA labels</h2>
	<p class="text-sm opacity-60 mb-4">
		Override <code>submitLabel</code> and <code>submittingLabel</code>.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			submitLabel="Proceed to Payment"
			submittingLabel="Processing..."
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CUSTOM VALIDATION ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom validation</h2>
	<p class="text-sm opacity-60 mb-4">
		Uses <code>validate</code> prop to require first name and last name in addition to email.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			validate={strictValidation}
			onSubmit={(data) => alert("Submitted: " + JSON.stringify(data))}
		/>
	</div>
</section>

<!-- ============== CUSTOM SUBMIT BUTTON ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Custom submit button (snippet)</h2>
	<p class="text-sm opacity-60 mb-4">Override the CTA section with a custom snippet.</p>

	<div class="max-w-lg">
		<CheckoutGuestForm onSubmit={(data) => alert("Submitted: " + data.email)}>
			{#snippet submitButton({ isSubmitting: submitting, disabled })}
				<div class="flex gap-2">
					<Button type="submit" intent="primary" {disabled} class="flex-1">
						{submitting ? "Please wait..." : "Create Account & Continue"}
					</Button>
					<Button type="button" variant="outline" onclick={() => alert("Skip clicked")}>
						Skip
					</Button>
				</div>
			{/snippet}
		</CheckoutGuestForm>
	</div>
</section>

<!-- ============== B2B EXPANDED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">B2B expanded by default</h2>
	<p class="text-sm opacity-60 mb-4">
		<code>b2bExpanded</code> opens the business fields section on load.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			b2bExpanded
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== EXTERNAL ERRORS ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">External errors</h2>
	<p class="text-sm opacity-60 mb-4">
		Server-side errors injected via the <code>errors</code> prop. Try submitting with email
		filled in.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			errors={[{ field: "email", message: "This email is already registered" }]}
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== UNSTYLED ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">Unstyled</h2>
	<p class="text-sm opacity-60 mb-4">
		With <code>unstyled</code> prop — no checkout-specific CSS classes applied. FieldInput styling
		still applies.
	</p>

	<div class="max-w-lg">
		<CheckoutGuestForm
			unstyled
			class="space-y-4"
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>

<!-- ============== CSS VARIABLE OVERRIDE ============== -->
<section class="mb-12">
	<h2 class="text-lg font-bold mb-2">CSS variable overrides</h2>
	<p class="text-sm opacity-60 mb-4">Customized via CSS variables on a wrapper.</p>

	<div
		class="max-w-lg"
		style="
			--stuic-checkout-guest-gap: 1.5rem;
			--stuic-checkout-guest-b2b-radius: 0.75rem;
			--stuic-checkout-guest-b2b-padding: 1.5rem;
		"
	>
		<CheckoutGuestForm
			b2bExpanded
			onSubmit={(data) => alert("Submitted: " + data.email)}
		/>
	</div>
</section>
