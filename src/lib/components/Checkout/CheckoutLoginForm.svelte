<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutLoginFormData,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
		/** Bindable login data. Default: createEmptyLoginFormData() */
		formData?: CheckoutLoginFormData;

		/** Called on form submit after client-side validation passes. */
		onSubmit: (data: CheckoutLoginFormData) => void;

		/** Whether the form is currently submitting (disables CTA) */
		isSubmitting?: boolean;

		/** Field-specific validation errors (e.g., from server) */
		errors?: CheckoutValidationError[];

		/**
		 * General error message (not field-specific).
		 * Rendered as an alert box above the form.
		 * Example: "Invalid email or password"
		 */
		error?: string;

		/**
		 * Called when "Forgot password?" is clicked.
		 * If undefined, the link is not rendered.
		 */
		onForgotPassword?: () => void;

		/** Override CTA label */
		submitLabel?: string;

		/** Override CTA label while submitting */
		submittingLabel?: string;

		/** Override the CTA section */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/**
		 * Content below the form.
		 * Use for "Or continue as guest" links, OAuth buttons, etc.
		 */
		footer?: Snippet;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLFormElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import {
		createEmptyLoginFormData,
		validateLoginForm,
	} from "./_internal/checkout-utils.js";
	import Button from "../Button/Button.svelte";
	import FieldInput from "../Input/FieldInput.svelte";

	let {
		formData = $bindable(createEmptyLoginFormData()),
		onSubmit,
		isSubmitting = false,
		errors: externalErrors = [],
		error,
		onForgotPassword,
		submitLabel,
		submittingLabel,
		submitButton,
		footer,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// Internal validation errors (set on submit)
	let internalErrors = $state<CheckoutValidationError[]>([]);

	// Merge internal + external errors; external takes precedence per field
	let allErrors = $derived.by(() => {
		const map = new Map<string, string>();
		for (const e of internalErrors) map.set(e.field, e.message);
		for (const e of externalErrors) map.set(e.field, e.message);
		return [...map.entries()].map(([field, message]) => ({ field, message }));
	});

	function fieldError(field: string): string | undefined {
		return allErrors.find((e) => e.field === field)?.message;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const validationErrors = validateLoginForm(formData, t);
		internalErrors = validationErrors;

		if (validationErrors.length === 0 && externalErrors.length === 0) {
			onSubmit(formData);
		}
	}

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-login-form", classProp)
	);
</script>

<form bind:this={el} class={_class} onsubmit={handleSubmit} novalidate {...rest}>
	<!-- General error alert -->
	{#if error}
		<div class={unstyled ? undefined : "stuic-checkout-alert"} role="alert">
			{error}
		</div>
	{/if}

	<!-- Email -->
	<FieldInput
		bind:value={formData.email}
		label={t("checkout.login.email_label")}
		type="email"
		placeholder={t("checkout.login.email_placeholder")}
		required
		name="checkout-login-email"
		labelLeftBreakpoint={0}
		validate={{
			customValidator(val) {
				return fieldError("email") || "";
			},
		}}
	/>

	<!-- Password -->
	<FieldInput
		bind:value={formData.password}
		label={t("checkout.login.password_label")}
		type="password"
		placeholder={t("checkout.login.password_placeholder")}
		required
		name="checkout-login-password"
		labelLeftBreakpoint={0}
		validate={{
			customValidator(val) {
				return fieldError("password") || "";
			},
		}}
	/>

	<!-- Forgot password -->
	{#if onForgotPassword}
		<button
			type="button"
			class={unstyled ? undefined : "stuic-checkout-login-forgot"}
			onclick={onForgotPassword}
		>
			{t("checkout.login.forgot_password")}
		</button>
	{/if}

	<!-- CTA -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: isSubmitting })}
	{:else}
		<div class={unstyled ? undefined : "stuic-checkout-login-submit"}>
			<Button intent="primary" type="submit" disabled={isSubmitting} class="w-full">
				{isSubmitting
					? (submittingLabel ?? t("checkout.login.submitting"))
					: (submitLabel ?? t("checkout.login.submit"))}
			</Button>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
