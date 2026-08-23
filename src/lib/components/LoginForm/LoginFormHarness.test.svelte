<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`).
	Owns `formData` as real $state and lets tests deliver `errors` AFTER the user
	has typed — which is the only way to exercise the stale-external-error
	lifecycle (a prop passed at render time can only model "errors were already
	there on mount").
-->
<script lang="ts">
	import { untrack } from "svelte";
	import LoginForm, { type Props } from "./LoginForm.svelte";
	import { createEmptyLoginFormData } from "./_internal/login-form-utils.js";
	import type {
		LoginFormData,
		LoginFormValidationError,
	} from "./_internal/login-form-types.js";

	let {
		initial,
		...rest
	}: {
		/** Seed values for the harness-owned formData (read once). */
		initial?: Partial<LoginFormData>;
	} & Omit<Props, "formData" | "errors"> = $props();

	let formData: LoginFormData = $state({
		...createEmptyLoginFormData(),
		...untrack(() => initial),
	});

	let errors = $state<LoginFormValidationError[]>([]);

	export function getFormData(): LoginFormData {
		return formData;
	}

	/** Deliver server-side field errors, the way a submit handler would. */
	export function setErrors(next: LoginFormValidationError[]): void {
		errors = next;
	}

	let form = $state<LoginForm>();

	export function validate(): boolean {
		return form?.validate() ?? false;
	}
</script>

<LoginForm bind:this={form} bind:formData {errors} {...rest} />
