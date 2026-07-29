<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`).
	CheckoutAddressForm's subdivision behavior depends on deep reactivity of the
	bound `address` object (the field swaps modes on `address.country` edits and
	reconciliation writes back into `address.state_or_region`), so the harness
	owns a real `$state` address — the way a real consumer would — and exposes
	it for tests to mutate and assert directly.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import CheckoutAddressForm, { type Props } from "./CheckoutAddressForm.svelte";
	import type {
		CheckoutAddressData,
		CheckoutSubdivisionOption,
	} from "./_internal/checkout-types.js";
	import { createEmptyAddress } from "./_internal/checkout-utils.js";

	let {
		initial,
		withCustomStateField = false,
		...rest
	}: {
		/** Seed values for the harness-owned address (read once). */
		initial?: Partial<CheckoutAddressData>;
		/** Render a stub `stateField` snippet instead of the built-in field. */
		withCustomStateField?: boolean;
	} & Omit<Props, "address" | "stateField"> = $props();

	// Not exported directly: `bind:address` compiles to a reassignment, and
	// Svelte forbids exporting reassigned state — expose via getAddress().
	let address: CheckoutAddressData = $state({
		...createEmptyAddress(),
		...untrack(() => initial),
	});

	export function getAddress(): CheckoutAddressData {
		return address;
	}

	let form = $state<CheckoutAddressForm>();

	export function validate(): boolean {
		return form?.validate() ?? false;
	}
</script>

{#snippet customStateField(p: {
	value: string;
	onchange: (value: string) => void;
	error?: string;
	label: string;
	id: string;
	options: CheckoutSubdivisionOption[] | null;
})}
	<div data-testid="custom-state-field">
		<span data-testid="custom-state-options">
			{p.options ? p.options.map((o) => o.code).join(",") : "null"}
		</span>
		<button type="button" data-testid="custom-state-set" onclick={() => p.onchange("MI")}>
			set MI
		</button>
	</div>
{/snippet}

<CheckoutAddressForm
	bind:this={form}
	bind:address
	stateField={withCustomStateField ? customStateField : undefined}
	{...rest}
/>
