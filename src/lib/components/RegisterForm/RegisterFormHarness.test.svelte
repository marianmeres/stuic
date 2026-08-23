<!--
	TEST-ONLY harness (not a real component, not exported, excluded from the
	published package via the `*.test.*` rule in package.json `files`).

	Two things need a real consumer around RegisterForm:
	  1. `formData` deep reactivity — the component writes into a bound $state object;
	  2. `errors` delivered AFTER the user has typed, which is the whole point of the
	     stale-external-error behavior (a plain prop passed at render time can only
	     model "errors were already there on mount").
	The credentials/social snippets live here too, so tests can toggle them by flag.
-->
<script lang="ts">
	import { untrack } from "svelte";
	import RegisterForm, { type Props } from "./RegisterForm.svelte";
	import { createEmptyRegisterFormData } from "./_internal/register-form-utils.js";
	import type {
		RegisterFormData,
		RegisterFormValidationError,
	} from "./_internal/register-form-types.js";

	let {
		initial,
		withCredentialsSlot = false,
		withSocialLogins = false,
		...rest
	}: {
		/** Seed values for the harness-owned formData (read once). */
		initial?: Partial<RegisterFormData>;
		/** Render a stub `credentialsSlot`. */
		withCredentialsSlot?: boolean;
		/** Render a stub `socialLogins`. */
		withSocialLogins?: boolean;
	} & Omit<Props, "formData" | "errors" | "credentialsSlot" | "socialLogins"> = $props();

	// Not exported directly: `bind:formData` compiles to a reassignment, and Svelte
	// forbids exporting reassigned state — expose via getFormData().
	let formData: RegisterFormData = $state({
		...createEmptyRegisterFormData(),
		...untrack(() => initial),
	});

	let errors = $state<RegisterFormValidationError[]>([]);

	export function getFormData(): RegisterFormData {
		return formData;
	}

	/** Deliver server-side field errors, the way a submit handler would. */
	export function setErrors(next: RegisterFormValidationError[]): void {
		errors = next;
	}

	let form = $state<RegisterForm>();

	export function validate(): boolean {
		return form?.validate() ?? false;
	}

	export function focusField(name: string): boolean {
		return form?.focusField(name) ?? false;
	}
</script>

{#snippet credentialsSlot()}
	<div data-testid="credentials-slot">Signed in as jane@example.com</div>
{/snippet}

{#snippet socialLogins()}
	<button type="button" data-testid="social-button">Continue with Example</button>
{/snippet}

<RegisterForm
	bind:this={form}
	bind:formData
	{errors}
	credentialsSlot={withCredentialsSlot ? credentialsSlot : undefined}
	socialLogins={withSocialLogins ? socialLogins : undefined}
	{...rest}
/>
