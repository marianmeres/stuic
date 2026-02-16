<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutCustomerFormData,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import type { Props as FieldPhoneNumberProps } from "../Input/FieldPhoneNumber.svelte";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
		/** Bindable form data. Default: createEmptyCustomerFormData() */
		formData?: CheckoutCustomerFormData;

		/** Called on form submit after client-side validation passes. */
		onSubmit: (data: CheckoutCustomerFormData) => void;

		/** Whether the form is currently submitting (disables CTA) */
		isSubmitting?: boolean;

		/** External validation errors (e.g., from server). Displayed per-field. */
		errors?: CheckoutValidationError[];

		/** Whether to show the B2B fields section. Default: true */
		showB2bFields?: boolean;

		/** Whether B2B section starts expanded. Default: false */
		b2bExpanded?: boolean;

		/**
		 * Which fields to display. All default to true.
		 * Note: email is always shown and required regardless of this setting.
		 */
		fields?: {
			first_name?: boolean;
			last_name?: boolean;
			phone?: boolean;
			company_name?: boolean;
			tax_id?: boolean;
			vat_number?: boolean;
		};

		/** Extra props forwarded to the internal FieldPhoneNumber component. */
		phoneFieldProps?: Partial<FieldPhoneNumberProps>;

		/** Override the CTA button label. Takes precedence over i18n. */
		submitLabel?: string;

		/** Override the CTA button label while submitting. */
		submittingLabel?: string;

		/** Override the CTA section entirely */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/**
		 * Override built-in validation.
		 * Return empty array = valid. When provided, replaces (not extends) built-in validation.
		 */
		validate?: (data: CheckoutCustomerFormData) => CheckoutValidationError[];

		/** Optional notifications instance */
		notifications?: NotificationsStack;

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
		createEmptyCustomerFormData,
		validateCustomerForm,
	} from "./_internal/checkout-utils.js";
	import Button from "../Button/Button.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldPhoneNumber from "../Input/FieldPhoneNumber.svelte";

	let {
		formData = $bindable(createEmptyCustomerFormData()),
		onSubmit,
		isSubmitting = false,
		errors: externalErrors = [],
		notifications,
		showB2bFields = true,
		b2bExpanded = false,
		fields,
		phoneFieldProps,
		submitLabel,
		submittingLabel,
		submitButton,
		validate: validateProp,
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

		// Run validation
		const validationErrors = validateProp
			? validateProp(formData)
			: validateCustomerForm(formData, t);

		internalErrors = validationErrors;

		if (validationErrors.length === 0 && externalErrors.length === 0) {
			onSubmit(formData);
		}
	}

	let containerWidth = $state(0);
	let isSmall = $derived(containerWidth > 0 && containerWidth < 480);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-guest-form", classProp)
	);
</script>

<form
	bind:this={el}
	bind:offsetWidth={containerWidth}
	class={_class}
	data-small={!unstyled && isSmall ? "" : undefined}
	onsubmit={handleSubmit}
	novalidate
	{...rest}
>
	<!--
		svelte-ignore binding_property_non_reactive:
		formData is a $bindable prop — deep reactivity depends on the consumer
		passing a $state() object. The bindings work correctly regardless.
	-->
	<!-- Email (always shown, always required) -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:value={formData.email}
		label={t("checkout.guest.email_label")}
		type="email"
		placeholder={t("checkout.guest.email_placeholder")}
		required
		name="checkout-guest-email"
		labelLeftBreakpoint={0}
		validate={{
			customValidator(val) {
				return fieldError("email") || "";
			},
		}}
	/>

	<!-- First Name + Last Name -->
	{#if fields?.first_name !== false || fields?.last_name !== false}
		<div class={unstyled ? undefined : "stuic-checkout-guest-row"}>
			{#if fields?.first_name !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
					bind:value={formData.first_name}
					label={t("checkout.guest.first_name_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.guest.first_name_placeholder")}
					name="checkout-guest-first-name"
				/>
			{/if}
			{#if fields?.last_name !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
					bind:value={formData.last_name}
					label={t("checkout.guest.last_name_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.guest.last_name_placeholder")}
					name="checkout-guest-last-name"
				/>
			{/if}
		</div>
	{/if}

	<!-- Phone -->
	{#if fields?.phone !== false}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldPhoneNumber
			bind:value={formData.phone}
			label={t("checkout.guest.phone_label")}
			placeholder={t("checkout.guest.phone_placeholder")}
			name="checkout-guest-phone"
			labelLeftBreakpoint={0}
			{...phoneFieldProps}
		/>
	{/if}

	<!-- B2B Section -->
	{#if showB2bFields}
		<details class={unstyled ? undefined : "stuic-checkout-guest-b2b"} open={b2bExpanded}>
			<summary class={unstyled ? undefined : "stuic-checkout-guest-b2b-summary"}>
				{t("checkout.guest.b2b_toggle")}
			</summary>
			<div class={unstyled ? undefined : "stuic-checkout-guest-b2b-content"}>
				{#if fields?.company_name !== false}
					<!-- svelte-ignore binding_property_non_reactive -->
					<FieldInput
						bind:value={formData.company_name}
						label={t("checkout.guest.company_name_label")}
						name="checkout-guest-company-name"
						labelLeftBreakpoint={0}
					/>
				{/if}
				{#if fields?.tax_id !== false || fields?.vat_number !== false}
					<div class={unstyled ? undefined : "stuic-checkout-guest-row"}>
						{#if fields?.tax_id !== false}
							<!-- svelte-ignore binding_property_non_reactive -->
							<FieldInput
								bind:value={formData.tax_id}
								label={t("checkout.guest.tax_id_label")}
								name="checkout-guest-tax-id"
							/>
						{/if}
						{#if fields?.vat_number !== false}
							<!-- svelte-ignore binding_property_non_reactive -->
							<FieldInput
								bind:value={formData.vat_number}
								label={t("checkout.guest.vat_number_label")}
								name="checkout-guest-vat-number"
							/>
						{/if}
					</div>
				{/if}
			</div>
		</details>
	{/if}

	<!-- CTA -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: isSubmitting })}
	{:else}
		<div class={unstyled ? undefined : "stuic-checkout-guest-submit"}>
			<Button intent="primary" type="submit" disabled={isSubmitting} class="w-full">
				{isSubmitting
					? (submittingLabel ?? t("checkout.guest.submitting"))
					: (submitLabel ?? t("checkout.guest.submit"))}
			</Button>
		</div>
	{/if}
</form>
