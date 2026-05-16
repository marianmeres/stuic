<script lang="ts">
	import { FieldCountry, ISO_MAP } from "$lib/index.js";

	let value = $state("");
	let value2 = $state("SK");
	let value3 = $state("");
	let value4 = $state("");
	let validatedValue = $state("");

	// Localized country names (Slovak) for the i18n demo
	const COUNTRY_NAMES_SK: Record<string, string> = {
		SK: "Slovensko",
		CZ: "Česko",
		AT: "Rakúsko",
		DE: "Nemecko",
		FR: "Francúzsko",
		GB: "Spojené kráľovstvo",
		US: "Spojené štáty",
		IT: "Taliansko",
		ES: "Španielsko",
		PL: "Poľsko",
		HU: "Maďarsko",
	};

	function nameOf(iso: string): string {
		return iso ? (ISO_MAP.get(iso)?.name ?? iso) : "—";
	}
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
			<FieldCountry
				bind:value
				label="Country"
				placeholder="Select a country"
				name="country"
				required
			/>
			<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
				<div>value (ISO): <strong>{value || "—"}</strong></div>
				<div>name: <strong>{nameOf(value)}</strong></div>
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
		<p class="text-sm opacity-60">
			Preferred ISO codes are pinned at the top of the dropdown, above a divider —
			preserving the order given.
		</p>
		<FieldCountry
			bind:value={value2}
			label="Country"
			placeholder="Select a country"
			preferredCountries={["SK", "CZ", "AT", "DE", "PL", "HU"]}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			value: <strong>{value2}</strong>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Localized country names</h2>
		<p class="text-sm opacity-60">
			<code>countryNames</code> overrides displayed names. Missing keys fall back to English.
			Search matches against both localized and English names — try typing "germ" or "nemec".
		</p>
		<FieldCountry
			bind:value={value3}
			label="Krajina"
			placeholder="Vyberte krajinu"
			preferredCountries={["SK", "CZ", "AT", "DE"]}
			countryNames={COUNTRY_NAMES_SK}
		/>
		<div class="text-sm font-mono space-y-1 p-3 rounded bg-black/5">
			<div>value (ISO): <strong>{value3 || "—"}</strong></div>
			<div>english name: <strong>{nameOf(value3)}</strong></div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Filtered list (countryList)</h2>
		<p class="text-sm opacity-60">
			<code>countryList</code> restricts which countries are selectable. Accepts ISO codes
			or already-resolved <code>Country</code> objects.
		</p>
		<FieldCountry
			bind:value={value4}
			label="EU country"
			placeholder="Select a country"
			countryList={["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL", "CZ", "SK"]}
		/>
		<div class="text-sm font-mono p-3 rounded bg-black/5">
			value: <strong>{value4 || "—"}</strong>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">No flags</h2>
		<FieldCountry
			label="Country (no flags)"
			placeholder="Select a country"
			flags={false}
		/>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Disabled</h2>
		<FieldCountry
			label="Country (disabled)"
			placeholder="Select a country"
			value="SK"
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
			<FieldCountry
				label="Country (no validation)"
				placeholder="Select a country"
				name="country-no-validate"
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
				alert("Form submitted: " + validatedValue);
			}}
			class="space-y-4"
		>
			<FieldCountry
				bind:value={validatedValue}
				label="Country (required)"
				placeholder="Select a country"
				preferredCountries={["SK", "CZ", "DE", "US", "GB"]}
				name="country-required"
				required
			/>
			<div class="text-sm font-mono p-3 rounded bg-black/5">
				value: <strong>{validatedValue || "—"}</strong>
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
		<FieldCountry label="Small" placeholder="Select a country" renderSize="sm" />
		<FieldCountry
			label="Medium (default)"
			placeholder="Select a country"
			renderSize="md"
		/>
		<FieldCountry label="Large" placeholder="Select a country" renderSize="lg" />
	</section>
</div>
