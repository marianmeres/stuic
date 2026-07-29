<!--
	TEST-ONLY harness (excluded from the published package via the `*.test.*`
	rule in package.json `files`). Unlike CheckoutAddressFormHarness, the
	address here is deliberately a PLAIN object (not $state) — simulating a
	consumer binding an API response directly. Svelte cannot observe deep
	mutations of it, so this pins that country edits made THROUGH the form
	(here: the countryField snippet's onchange, the same write path the
	built-in FieldCountry uses) still flip the subdivision mode live.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import CheckoutAddressForm, { type Props } from "./CheckoutAddressForm.svelte";
	import type { CheckoutAddressData } from "./_internal/checkout-types.js";
	import { createEmptyAddress } from "./_internal/checkout-utils.js";

	let {
		initial,
		...rest
	}: {
		/** Seed values for the plain address object (read once). */
		initial?: Partial<CheckoutAddressData>;
	} & Omit<Props, "address" | "countryField"> = $props();

	// Deliberately NOT $state.
	// svelte-ignore non_reactive_update
	let address: CheckoutAddressData = {
		...createEmptyAddress(),
		...untrack(() => initial),
	};

	export function getAddress(): CheckoutAddressData {
		return address;
	}
</script>

<CheckoutAddressForm bind:address {...rest}>
	{#snippet countryField({ onchange, id })}
		<button type="button" data-testid="plain-country-us" onclick={() => onchange("US")}>
			US
		</button>
		<button type="button" data-testid="plain-country-sk" onclick={() => onchange("SK")}>
			SK
		</button>
		<span hidden {id}></span>
	{/snippet}
</CheckoutAddressForm>
