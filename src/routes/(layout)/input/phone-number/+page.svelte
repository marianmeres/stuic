<script lang="ts">
	import { FieldPhoneNumber } from "$lib/index.js";
	import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

	let value = $state("");
	let country = $state("");
	let dialCode = $state("");
	let localNumber = $state("");

	let value2 = $state("+421905123456");

	let validatedValue = $state("");
	let validatedCountry = $state("");
</script>

<div class="max-w-lg mx-auto py-8 space-y-12">
	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Basic (with built-in validation)</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				alert("Form submitted: " + value);
			}}
			class="space-y-4"
		>
			<FieldPhoneNumber
				bind:value
				bind:country
				bind:dialCode
				bind:localNumber
				label="Phone number"
				placeholder="905 123 456"
				defaultCountry="SK"
				name="phone"
			/>
			<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
				<div>value: <strong>{value}</strong></div>
				<div>country: <strong>{country}</strong></div>
				<div>dialCode: <strong>{dialCode}</strong></div>
				<div>localNumber: <strong>{localNumber}</strong></div>
			</div>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">With preferred countries</h2>
		<FieldPhoneNumber
			bind:value={value2}
			label="Phone"
			placeholder="Enter phone"
			defaultCountry="SK"
			preferredCountries={["SK", "CZ", "AT", "DE", "PL", "HU"]}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			value: <strong>{value2}</strong>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">No flags</h2>
		<FieldPhoneNumber
			label="Phone (no flags)"
			placeholder="Enter phone"
			defaultCountry="US"
			flags={false}
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Filtered countries</h2>
		<FieldPhoneNumber
			label="EU phone"
			placeholder="Enter phone"
			defaultCountry="DE"
			countries={["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL", "CZ", "SK"]}
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled</h2>
		<FieldPhoneNumber
			label="Phone (disabled)"
			placeholder="Enter phone"
			defaultCountry="SK"
			disabled
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Validation opt-out</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				alert("Form submitted!");
			}}
			class="space-y-4"
		>
			<FieldPhoneNumber
				label="Phone (no validation)"
				placeholder="Enter phone"
				defaultCountry="SK"
				name="phone-no-validate"
				validate={false}
			/>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Required with validation</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				alert("Form submitted!");
			}}
			class="space-y-4"
		>
			<FieldPhoneNumber
				label="Phone (required)"
				placeholder="Enter phone"
				defaultCountry="SK"
				name="phone-required"
				required
			/>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">With parsed details</h2>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				alert("Valid phone: " + validatedValue);
			}}
			class="space-y-4"
		>
			<FieldPhoneNumber
				bind:value={validatedValue}
				bind:country={validatedCountry}
				label="Phone (validated)"
				placeholder="Enter phone"
				defaultCountry="SK"
				preferredCountries={["SK", "CZ", "DE", "US", "GB"]}
				name="phone-validated"
				required
			/>
			<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
				<div>value: <strong>{validatedValue}</strong></div>
				<div>
					isValid: <strong
						>{validatedValue
							? isValidPhoneNumber(validatedValue)
								? "yes"
								: "no"
							: "-"}</strong
					>
				</div>
				{#if validatedValue && isValidPhoneNumber(validatedValue)}
					{@const parsed = parsePhoneNumber(validatedValue)}
					<div>country: <strong>{parsed.country ?? validatedCountry}</strong></div>
					<div>national: <strong>{parsed.formatNational()}</strong></div>
					<div>international: <strong>{parsed.formatInternational()}</strong></div>
					<div>E.164: <strong>{parsed.format("E.164")}</strong></div>
				{/if}
			</div>
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Submit
			</button>
		</form>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Sizes</h2>
		<FieldPhoneNumber
			label="Small"
			placeholder="Enter phone"
			defaultCountry="SK"
			renderSize="sm"
		/>
		<FieldPhoneNumber
			label="Medium (default)"
			placeholder="Enter phone"
			defaultCountry="SK"
			renderSize="md"
		/>
		<FieldPhoneNumber
			label="Large"
			placeholder="Enter phone"
			defaultCountry="SK"
			renderSize="lg"
		/>
	</section>
</div>
