<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`).
	Owns `formData` as real $state and lets tests deliver `errors` AFTER the user
	has typed — the only way to exercise the stale-external-error lifecycle.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import CheckoutGuestForm, { type Props } from "./CheckoutGuestForm.svelte";
	import { createEmptyCustomerFormData } from "./_internal/checkout-utils.js";
	import type {
		CheckoutCustomerFormData,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	let {
		initial,
		...rest
	}: {
		/** Seed values for the harness-owned formData (read once). */
		initial?: Partial<CheckoutCustomerFormData>;
	} & Omit<Props, "formData" | "errors"> = $props();

	let formData: CheckoutCustomerFormData = $state({
		...createEmptyCustomerFormData(),
		...untrack(() => initial),
	});

	let errors = $state<CheckoutValidationError[]>([]);

	export function getFormData(): CheckoutCustomerFormData {
		return formData;
	}

	/** Deliver server-side field errors, the way a submit handler would. */
	export function setErrors(next: CheckoutValidationError[]): void {
		errors = next;
	}

	let form = $state<CheckoutGuestForm>();

	export function validate(): boolean {
		return form?.validate() ?? false;
	}
</script>

<CheckoutGuestForm bind:this={form} bind:formData {errors} {...rest} />
