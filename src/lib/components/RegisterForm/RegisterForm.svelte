<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		RegisterFieldConfig,
		RegisterFormData,
		RegisterFormValidationError,
	} from "./_internal/register-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
		/** Bindable register data. Default: createEmptyRegisterFormData() */
		formData?: RegisterFormData;

		/** Called on form submit after client-side validation passes. */
		onSubmit: (data: RegisterFormData) => void;

		/** Whether the form is currently submitting (disables CTA) */
		isSubmitting?: boolean;

		/** Field-specific validation errors (e.g., from server) */
		errors?: RegisterFormValidationError[];

		/**
		 * General error message (not field-specific).
		 * Rendered as an alert box above the form.
		 * Example: "Email already registered"
		 */
		error?: string;

		/** Show password confirmation field. Default: true */
		showPasswordConfirm?: boolean;

		/** Minimum password length. Fed into FieldInput `minlength` + validator. Default: 8 */
		passwordMinLength?: number;

		/**
		 * Declarative extra fields rendered as FieldInput entries.
		 * Values bind into `formData.extra[name]`.
		 */
		extraFields?: RegisterFieldConfig[];

		/**
		 * Escape hatch for non-FieldInput extras (e.g., terms-of-service checkbox).
		 * Rendered after the declarative `extraFields` (bottom position) and before the submit.
		 * Receives `formData` (bindable) and a `fieldError(name)` lookup.
		 */
		extraFieldsSlot?: Snippet<
			[
				{
					formData: RegisterFormData;
					fieldError: (name: string) => string | undefined;
				},
			]
		>;

		/** Override CTA label */
		submitLabel?: string;

		/** Override CTA label while submitting */
		submittingLabel?: string;

		/** Override the CTA section */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/**
		 * Social/OAuth login buttons rendered below the primary form.
		 * When provided, a styled "or continue with" divider is shown above.
		 * Consumer renders the buttons — the library provides layout + divider.
		 */
		socialLogins?: Snippet;

		/**
		 * Override the divider label above social login buttons.
		 * Default: i18n key "register_form.social_divider" ("or continue with").
		 * Set to `false` to hide the divider while still rendering socialLogins.
		 */
		socialDividerLabel?: string | false;

		/**
		 * Content below the form.
		 * Use for "Already have an account?" links, legal text, etc.
		 */
		footer?: Snippet;

		/** Optional notifications instance — errors will be sent via notifications.error() */
		notifications?: NotificationsStack;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLFormElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/register-form-i18n-defaults.js";
	import {
		createEmptyRegisterFormData,
		validateRegisterForm,
	} from "./_internal/register-form-utils.js";
	import Button from "../Button/Button.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import { onSubmitValidityCheck } from "../../actions/on-submit-validity-check.svelte.js";

	let {
		formData = $bindable(createEmptyRegisterFormData()),
		onSubmit,
		isSubmitting = false,
		errors: externalErrors = [],
		error,
		notifications,
		showPasswordConfirm = true,
		passwordMinLength = 8,
		extraFields = [],
		extraFieldsSlot,
		submitLabel,
		submittingLabel,
		submitButton,
		socialLogins,
		socialDividerLabel,
		footer,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let topFields = $derived(extraFields.filter((f) => f.position === "top"));
	let bottomFields = $derived(extraFields.filter((f) => f.position !== "top"));

	// Internal validation errors (set on submit)
	let internalErrors = $state<RegisterFormValidationError[]>([]);

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

	function extraValue(cfg: RegisterFieldConfig): string {
		const v = formData.extra?.[cfg.name];
		if (v == null) return typeof cfg.initialValue === "string" ? cfg.initialValue : "";
		return typeof v === "string" ? v : String(v);
	}

	function setExtraValue(cfg: RegisterFieldConfig, value: string) {
		// Ensure `extra` exists even if the consumer passed a partial object.
		if (!formData.extra) formData.extra = {};
		formData.extra[cfg.name] = value;
	}

	function handleSubmitValid() {
		const validationErrors = validateRegisterForm(formData, t, extraFields, {
			showPasswordConfirm,
			passwordMinLength,
		});
		internalErrors = validationErrors;

		if (validationErrors.length === 0 && externalErrors.length === 0) {
			onSubmit(formData);
		}
	}

	$effect(() => {
		if (error && notifications) notifications.error(error);
	});

	// The onSubmitValidityCheck action intercepts native submit (capture phase,
	// stopImmediatePropagation) and dispatches a custom "submit_valid" event.
	// Listen for it on the form element as a fallback.
	$effect(() => {
		const node = el;
		if (!node) return;
		node.addEventListener("submit_valid", handleSubmitValid);
		return () => node.removeEventListener("submit_valid", handleSubmitValid);
	});

	let _class = $derived(unstyled ? classProp : twMerge("stuic-register-form", classProp));
</script>

<form bind:this={el} class={_class} use:onSubmitValidityCheck {...rest}>
	<!-- General error alert -->
	<DismissibleMessage message={error} intent="destructive" onDismiss={false} />

	<!-- Top-position extra fields -->
	{#each topFields as cfg (cfg.name)}
		<FieldInput
			value={extraValue(cfg)}
			oninput={(e: Event) =>
				setExtraValue(cfg, (e.currentTarget as HTMLInputElement).value)}
			label={cfg.label}
			type={cfg.type ?? "text"}
			placeholder={cfg.placeholder}
			autocomplete={cfg.autocomplete}
			required={cfg.required}
			name={`register-extra-${cfg.name}`}
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError(cfg.name) || "";
				},
			}}
			{...cfg.props}
		/>
	{/each}

	<!--
			svelte-ignore binding_property_non_reactive:
			formData is a $bindable prop — deep reactivity depends on the consumer
			passing a $state() object. The bindings work correctly regardless.
		-->
	<!-- Email -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:value={formData.email}
		label={t("register_form.email_label")}
		type="email"
		placeholder={t("register_form.email_placeholder")}
		autocomplete="email"
		required
		name="register-email"
		labelLeftBreakpoint={0}
		validate={{
			customValidator() {
				return fieldError("email") || "";
			},
		}}
	/>

	<!-- Password -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:value={formData.password}
		label={t("register_form.password_label")}
		autocomplete="new-password"
		type="password"
		placeholder={t("register_form.password_placeholder")}
		required
		minlength={passwordMinLength}
		name="register-password"
		labelLeftBreakpoint={0}
		validate={{
			customValidator() {
				return fieldError("password") || "";
			},
		}}
	/>

	<!-- Password confirm -->
	{#if showPasswordConfirm}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:value={formData.passwordConfirm}
			label={t("register_form.password_confirm_label")}
			autocomplete="new-password"
			type="password"
			placeholder={t("register_form.password_confirm_placeholder")}
			required
			minlength={passwordMinLength}
			name="register-password-confirm"
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError("passwordConfirm") || "";
				},
			}}
		/>
	{/if}

	<!-- Bottom-position extra fields (default) -->
	{#each bottomFields as cfg (cfg.name)}
		<FieldInput
			value={extraValue(cfg)}
			oninput={(e: Event) =>
				setExtraValue(cfg, (e.currentTarget as HTMLInputElement).value)}
			label={cfg.label}
			type={cfg.type ?? "text"}
			placeholder={cfg.placeholder}
			autocomplete={cfg.autocomplete}
			required={cfg.required}
			name={`register-extra-${cfg.name}`}
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError(cfg.name) || "";
				},
			}}
			{...cfg.props}
		/>
	{/each}

	<!-- Escape-hatch slot (terms checkbox, custom fields, etc.) -->
	{#if extraFieldsSlot}
		{@render extraFieldsSlot({ formData, fieldError })}
	{/if}

	<!-- CTA -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: isSubmitting })}
	{:else}
		<div class={unstyled ? undefined : "stuic-register-form-submit"}>
			<Button intent="primary" type="submit" disabled={isSubmitting} class="w-full">
				{isSubmitting
					? (submittingLabel ?? t("register_form.submitting"))
					: (submitLabel ?? t("register_form.submit"))}
			</Button>
		</div>
	{/if}

	<!-- Social logins -->
	{#if socialLogins}
		<div class={unstyled ? undefined : "stuic-register-form-social"}>
			{#if socialDividerLabel !== false}
				<div class={unstyled ? undefined : "stuic-register-form-social-divider"}>
					<span>
						{typeof socialDividerLabel === "string"
							? socialDividerLabel
							: t("register_form.social_divider")}
					</span>
				</div>
			{/if}
			<div class={unstyled ? undefined : "stuic-register-form-social-buttons"}>
				{@render socialLogins()}
			</div>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
