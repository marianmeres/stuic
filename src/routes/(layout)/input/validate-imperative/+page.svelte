<script lang="ts">
	import {
		FieldCheckbox,
		FieldCountry,
		FieldInput,
		FieldPhoneNumber,
		FieldSelect,
		FieldTextarea,
		scrollToFirstInvalidField,
		validateAllFields,
	} from "$lib/index.js";

	// Pristine address form — exactly the carsinc checkout-shipping repro.
	// Nothing in this state has been touched by the user. Clicking "Continue"
	// runs validation imperatively and renders every inline error at once.

	type AddressErr = { field: string; message: string };

	let address = $state({
		name: "",
		phone: "",
		email: "",
		country: "",
		notes: "",
		acceptTerms: false,
	});

	// Server-style external errors. Tick the checkbox to enable them so you
	// can see the customValidator -> imperative validate() handoff work.
	let useExternalErrors = $state(false);
	let externalErrors: AddressErr[] = [
		{ field: "name", message: "Server says: that name is taken" },
		{ field: "email", message: "Server says: invalid email" },
	];
	function fieldError(field: string): string | undefined {
		if (!useExternalErrors) return undefined;
		return externalErrors.find((e) => e.field === field)?.message;
	}

	// Field refs collected during render.
	let nameField = $state<FieldInput>();
	let phoneField = $state<FieldPhoneNumber>();
	let emailField = $state<FieldInput>();
	let countryField = $state<FieldCountry>();
	let notesField = $state<FieldTextarea>();
	let acceptField = $state<FieldCheckbox>();
	let cuisineField = $state<FieldSelect>();
	let cuisine = $state("");

	let lastSubmit = $state<{ ok: boolean; data: any } | undefined>();

	function _fields() {
		return [
			nameField,
			phoneField,
			emailField,
			countryField,
			cuisineField,
			notesField,
			acceptField,
		];
	}

	function handleContinue() {
		const ok = validateAllFields(_fields());
		if (!ok) {
			scrollToFirstInvalidField(_fields());
			lastSubmit = { ok: false, data: null };
			return;
		}
		lastSubmit = { ok: true, data: $state.snapshot({ ...address, cuisine }) };
	}

	function reset() {
		for (const f of _fields()) f?.clearValidation?.();
		address = {
			name: "",
			phone: "",
			email: "",
			country: "",
			notes: "",
			acceptTerms: false,
		};
		cuisine = "";
		lastSubmit = undefined;
	}
</script>

<div class="max-w-2xl mx-auto py-8 space-y-12">
	<header class="space-y-2">
		<h1 class="text-2xl font-semibold">Imperative validate() — full flow</h1>
		<p class="text-sm opacity-70">
			This page wires several pristine fields together with the
			<code>validateAllFields()</code> + <code>scrollToFirstInvalidField()</code>
			utilities. Clicking <strong>Continue</strong> triggers every field's validator at
			once — no synthetic <code>change</code> events, no id-format coupling, no DOM lookups.
		</p>
	</header>

	<section class="space-y-3 p-4 rounded border border-(--stuic-color-border)">
		<FieldCheckbox bind:checked={useExternalErrors}>
			{#snippet label()}
				<span class="text-sm">
					Simulate server errors on <code>name</code> and <code>email</code>
				</span>
			{/snippet}
		</FieldCheckbox>
		<p class="text-xs opacity-60">
			When ticked, each field's <code>customValidator</code> returns a non-empty string
			from <code>fieldError(name)</code> — the exact pattern external-error pipelines use.
			Without imperative <code>validate()</code>, those errors stay invisible until each
			field is touched.
		</p>
	</section>

	<form class="space-y-2">
		<FieldInput
			bind:this={nameField}
			bind:value={address.name}
			label="Full name"
			required
			autocomplete="name"
			validate={{
				customValidator() {
					return fieldError("name") || "";
				},
			}}
		/>
		<FieldPhoneNumber
			bind:this={phoneField}
			bind:value={address.phone}
			label="Phone"
			defaultCountry="SK"
			required
			validate={{
				customValidator() {
					return fieldError("phone") || "";
				},
			}}
		/>
		<FieldInput
			bind:this={emailField}
			bind:value={address.email}
			label="Email"
			type="email"
			required
			validate={{
				customValidator() {
					return fieldError("email") || "";
				},
			}}
		/>
		<FieldCountry
			bind:this={countryField}
			bind:value={address.country}
			label="Country"
			required
			validate={{
				customValidator() {
					return fieldError("country") || "";
				},
			}}
		/>
		<FieldSelect
			bind:this={cuisineField}
			bind:value={cuisine}
			label="Favorite cuisine"
			required
			options={["", "Italian", "Mexican", "Japanese", "Indian"]}
			validate={{
				customValidator() {
					return fieldError("cuisine") || "";
				},
			}}
		/>
		<FieldTextarea
			bind:this={notesField}
			bind:value={address.notes}
			label="Delivery notes"
		/>
		<FieldCheckbox bind:this={acceptField} bind:checked={address.acceptTerms} required>
			{#snippet label()}
				<span>I accept the terms</span>
			{/snippet}
		</FieldCheckbox>

		<div class="flex gap-2 pt-2">
			<button
				type="button"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				onclick={handleContinue}
			>
				Continue
			</button>
			<button
				type="button"
				class="px-4 py-2 border rounded hover:bg-black/5"
				onclick={reset}
			>
				Reset
			</button>
		</div>
	</form>

	{#if lastSubmit}
		<section class="space-y-2">
			<h2 class="text-lg font-semibold">Last submit attempt</h2>
			<pre class="text-xs p-3 rounded bg-black/5 overflow-auto">{JSON.stringify(
					lastSubmit,
					null,
					2
				)}</pre>
		</section>
	{/if}

	<!-- Make the page tall so scrollToFirstInvalidField is visible -->
	<div style="height: 60vh"></div>
	<p class="text-sm opacity-60">
		(Extra height so scrolling to the first invalid field is observable.)
	</p>
</div>
