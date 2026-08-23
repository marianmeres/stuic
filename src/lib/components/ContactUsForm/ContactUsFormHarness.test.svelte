<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`).
	Owns `formData` as real $state and lets tests deliver `errors` AFTER the user
	has typed — the only way to exercise the stale-external-error lifecycle.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import ContactUsForm, { type Props } from "./ContactUsForm.svelte";
	import { createEmptyContactFormData } from "./_internal/contact-form-utils.js";
	import type {
		ContactFormData,
		ContactFormValidationError,
	} from "./_internal/contact-form-types.js";

	let {
		initial,
		...rest
	}: {
		/** Seed values for the harness-owned formData (read once). */
		initial?: Partial<ContactFormData>;
	} & Omit<Props, "formData" | "errors"> = $props();

	let formData: ContactFormData = $state({
		...createEmptyContactFormData(),
		...untrack(() => initial),
	});

	let errors = $state<ContactFormValidationError[]>([]);

	export function getFormData(): ContactFormData {
		return formData;
	}

	/** Deliver server-side field errors, the way a submit handler would. */
	export function setErrors(next: ContactFormValidationError[]): void {
		errors = next;
	}

	let form = $state<ContactUsForm>();

	export function validate(): boolean {
		return form?.validate() ?? false;
	}

	export function scrollToFirstError(): boolean {
		return form?.scrollToFirstError({ behavior: "auto" }) ?? false;
	}
</script>

<ContactUsForm bind:this={form} bind:formData {errors} {...rest} />
