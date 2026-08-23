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
	import { untrack } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import {
		createExternalFieldErrors,
		repaintFieldErrors,
	} from "../../utils/field-errors.svelte.js";
	import {
		scrollToFirstInvalidField,
		validateAllFields,
	} from "../../utils/validate-fields.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import {
		createEmptyCustomerFormData,
		validateCustomerForm,
	} from "./_internal/checkout-utils.js";
	import Button from "../Button/Button.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldPhoneNumber from "../Input/FieldPhoneNumber.svelte";
	import { validatePhoneNumber } from "../Input/phone-validation.js";

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

	/** Is this field currently rendered? (B2B block + per-field `fields` opt-outs) */
	function _isRendered(field: string): boolean {
		switch (field) {
			case "email":
				return true;
			case "first_name":
			case "last_name":
			case "phone":
				return fields?.[field] !== false;
			case "company_name":
			case "tax_id":
			case "vat_number":
				return showB2bFields && fields?.[field] !== false;
			default:
				return false;
		}
	}

	// Clear internal field errors as soon as the user edits the form, so a previous
	// failed submit's errors don't linger after the user has fixed them — matching
	// the other STUIC forms. `untrack` the read+write so this effect re-runs only
	// on formData changes, not when handleSubmit sets internalErrors.
	$effect(() => {
		void formData.email;
		void formData.first_name;
		void formData.last_name;
		void formData.phone;
		void formData.company_name;
		void formData.tax_id;
		void formData.vat_number;
		untrack(() => {
			if (internalErrors.length) internalErrors = [];
		});
	});

	// Give the consumer-owned `errors` prop a lifecycle: an entry for a field this
	// form renders self-clears once the user edits it, instead of blocking submit
	// forever through the gate below (the consumer's own handler, which would have
	// cleared the errors, is exactly what was being suppressed). Entries for
	// anything else keep blocking until the consumer drops them.
	const external = createExternalFieldErrors({
		errors: () => externalErrors,
		isRendered: _isRendered,
		valueOf: (field) =>
			(formData as unknown as Record<string, string | undefined>)[field] ?? "",
	});

	// Merge internal + external errors; external takes precedence per field
	let allErrors = $derived.by(() => {
		const map = new Map<string, string>();
		for (const e of internalErrors) map.set(e.field, e.message);
		for (const e of external.live) map.set(e.field, e.message);
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

		if (validationErrors.length === 0 && external.live.length === 0) {
			external.markSubmitted();
			onSubmit(formData);
		}
	}

	let containerWidth = $state(0);
	let isSmall = $derived(containerWidth > 0 && containerWidth < 480);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-guest-form", classProp)
	);

	// Imperative API ----------------------------------------------------------
	// Field refs collected during render so consumers can trigger per-field
	// inline messages without going through native form submission.
	let emailField = $state<FieldInput>();
	let firstNameField = $state<FieldInput>();
	let lastNameField = $state<FieldInput>();
	let phoneField = $state<FieldPhoneNumber>();
	let companyNameField = $state<FieldInput>();
	let taxIdField = $state<FieldInput>();
	let vatNumberField = $state<FieldInput>();

	function _fields() {
		return [
			emailField,
			firstNameField,
			lastNameField,
			phoneField,
			companyNameField,
			taxIdField,
			vatNumberField,
		];
	}

	function _fieldByName(name: string) {
		if (!_isRendered(name)) return undefined;
		switch (name) {
			case "email":
				return emailField;
			case "first_name":
				return firstNameField;
			case "last_name":
				return lastNameField;
			case "phone":
				return phoneField;
			case "company_name":
				return companyNameField;
			case "tax_id":
				return taxIdField;
			case "vat_number":
				return vatNumberField;
			default:
				return undefined;
		}
	}

	// Paint newly-arrived error messages without waiting for the user's next
	// interaction — otherwise a failed validation (or a server `errors` delivery)
	// blocked the submit with no message anywhere.
	repaintFieldErrors(() => allErrors, _fieldByName);

	/**
	 * Run every visible field's validator and render any inline errors.
	 * Returns true if all fields are valid.
	 */
	export function validate(): boolean {
		// Consumers posting from their own handler never reach `handleSubmit`, so
		// this has to arm the same "a round-trip is starting" flag.
		external.markSubmitted();
		return validateAllFields(_fields());
	}

	/**
	 * Scroll the first invalid field into view and focus it. Returns true
	 * if a field was scrolled. Call after `validate()`.
	 */
	export function scrollToFirstError(
		opts?: Parameters<typeof scrollToFirstInvalidField>[1]
	): boolean {
		return scrollToFirstInvalidField(_fields(), opts);
	}

	/** Clear all inline validation messages on the rendered fields. */
	export function clearValidation(): void {
		for (const f of _fields()) f?.clearValidation?.();
	}
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
		NOTE on `binding_property_non_reactive`: formData is a $bindable prop — deep
		reactivity depends on the consumer passing a $state() object. The bindings
		work correctly regardless; the per-field directives below silence the hint.
		(This block intentionally does NOT start with the literal directive word so
		it isn't parsed as one — every following word would become a bogus code.)
	-->
	<!-- Email (always shown, always required) -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:this={emailField}
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
					bind:this={firstNameField}
					bind:value={formData.first_name}
					label={t("checkout.guest.first_name_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.guest.first_name_placeholder")}
					name="checkout-guest-first-name"
					validate={{
						customValidator() {
							return fieldError("first_name") || "";
						},
					}}
				/>
			{/if}
			{#if fields?.last_name !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
					bind:this={lastNameField}
					bind:value={formData.last_name}
					label={t("checkout.guest.last_name_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.guest.last_name_placeholder")}
					name="checkout-guest-last-name"
					validate={{
						customValidator() {
							return fieldError("last_name") || "";
						},
					}}
				/>
			{/if}
		</div>
	{/if}

	<!-- Phone -->
	{#if fields?.phone !== false}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldPhoneNumber
			bind:this={phoneField}
			bind:value={formData.phone}
			label={t("checkout.guest.phone_label")}
			placeholder={t("checkout.guest.phone_placeholder")}
			name="checkout-guest-phone"
			labelLeftBreakpoint={0}
			validate={{
				// FieldPhoneNumber's customValidator REPLACES its built-in
				// `validatePhoneNumber`, so surface the server error and then
				// delegate rather than knocking phone validation out.
				customValidator(val, ctx, el) {
					return fieldError("phone") || validatePhoneNumber(val, ctx, el) || "";
				},
			}}
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
						bind:this={companyNameField}
						bind:value={formData.company_name}
						label={t("checkout.guest.company_name_label")}
						name="checkout-guest-company-name"
						labelLeftBreakpoint={0}
						validate={{
							customValidator() {
								return fieldError("company_name") || "";
							},
						}}
					/>
				{/if}
				{#if fields?.tax_id !== false || fields?.vat_number !== false}
					<div class={unstyled ? undefined : "stuic-checkout-guest-row"}>
						{#if fields?.tax_id !== false}
							<!-- svelte-ignore binding_property_non_reactive -->
							<FieldInput
								bind:this={taxIdField}
								bind:value={formData.tax_id}
								label={t("checkout.guest.tax_id_label")}
								name="checkout-guest-tax-id"
								validate={{
									customValidator() {
										return fieldError("tax_id") || "";
									},
								}}
							/>
						{/if}
						{#if fields?.vat_number !== false}
							<!-- svelte-ignore binding_property_non_reactive -->
							<FieldInput
								bind:this={vatNumberField}
								bind:value={formData.vat_number}
								label={t("checkout.guest.vat_number_label")}
								name="checkout-guest-vat-number"
								validate={{
									customValidator() {
										return fieldError("vat_number") || "";
									},
								}}
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
