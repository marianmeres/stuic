<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { TranslateFn } from "../../types.js";
	import type {
		RegisterFieldConfig,
		RegisterFormData,
		RegisterFormValidationError,
	} from "./_internal/register-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import type { Props as InnerProps } from "./RegisterForm.svelte";

	export interface Props {
		/** Bindable register data. Default: createEmptyRegisterFormData() */
		formData?: RegisterFormData;

		/** Called on form submit after client-side validation passes. */
		onSubmit: (data: RegisterFormData) => void;

		/** Whether the form is currently submitting (disables CTA) */
		isSubmitting?: boolean;

		/**
		 * Consumer-owned reason to refuse submission (stale token, unchecked terms,
		 * async check in flight…). Also blocks `onSubmit`. Default: false
		 */
		submitDisabled?: boolean;

		/** Field-specific validation errors (e.g., from server) */
		errors?: RegisterFormValidationError[];

		/**
		 * General error message (not field-specific).
		 * Rendered as an alert box above the form.
		 */
		error?: string;

		/** Render the built-in email field (unmounted when false). Default: true */
		showEmail?: boolean;

		/** Render the built-in password field (unmounted when false). Default: true */
		showPassword?: boolean;

		/** Show password confirmation field. Default: true */
		showPasswordConfirm?: boolean;

		/** Minimum password length. Default: 8 */
		passwordMinLength?: number;

		/**
		 * Rendered at the credentials position. Combined with `showEmail` /
		 * `showPassword` = false it replaces the credential block (identity-first
		 * signup, invite summary, magic-link explainer).
		 */
		credentialsSlot?: InnerProps["credentialsSlot"];

		/** Passthrough props for the built-in email field. */
		emailFieldProps?: InnerProps["emailFieldProps"];

		/** Passthrough props for the built-in password field. */
		passwordFieldProps?: InnerProps["passwordFieldProps"];

		/** Passthrough props for the built-in confirm field. */
		passwordConfirmFieldProps?: InnerProps["passwordConfirmFieldProps"];

		/** Declarative extra fields */
		extraFields?: RegisterFieldConfig[];

		/** Escape-hatch slot for non-FieldInput extras */
		extraFieldsSlot?: Snippet<
			[
				{
					formData: RegisterFormData;
					fieldError: (name: string) => string | undefined;
				},
			]
		>;

		/** Section break below the top-position extra fields. Default: auto. */
		topFieldsSeparator?: InnerProps["topFieldsSeparator"];

		/** Override CTA label */
		submitLabel?: string;

		/** Override CTA label while submitting */
		submittingLabel?: string;

		/** Override the CTA section */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/**
		 * Social/OAuth login buttons rendered below the primary form.
		 */
		socialLogins?: Snippet;

		/**
		 * Where the social block sits relative to the credentials.
		 * `"top"` renders it above them (divider below the buttons). Default: "bottom"
		 */
		socialPosition?: "top" | "bottom";

		/**
		 * Override the divider label above social login buttons.
		 */
		socialDividerLabel?: string | false;

		/**
		 * Content below the form.
		 */
		footer?: Snippet;

		/** Optional notifications instance */
		notifications?: NotificationsStack;

		/** Modal title. Default: i18n key "register_form.modal_title" ("Create account") */
		title?: string;

		/** Bindable modal visibility */
		visible?: boolean;

		/**
		 * Optional trigger element rendered outside the modal.
		 * Receives an `open` callback.
		 */
		trigger?: Snippet<[{ open: () => void }]>;

		/** CSS class for the Modal box */
		classModal?: string;

		/** CSS class for the Modal inner width container */
		classInner?: string;

		/** CSS class for the RegisterForm */
		classForm?: string;

		t?: TranslateFn;
		unstyled?: boolean;

		noXClose?: boolean;
		onClose?: () => false | void;
	}
</script>

<script lang="ts">
	import Modal from "../Modal/Modal.svelte";
	import RegisterForm from "./RegisterForm.svelte";
	import Button from "../Button/Button.svelte";
	import { t_default } from "./_internal/register-form-i18n-defaults.js";
	import { createEmptyRegisterFormData } from "./_internal/register-form-utils.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import H from "../H/H.svelte";
	import type { scrollToFirstInvalidField } from "../../utils/validate-fields.js";

	let {
		formData = $bindable(createEmptyRegisterFormData()),
		onSubmit,
		isSubmitting = false,
		submitDisabled,
		errors,
		error,
		showEmail,
		showPassword,
		showPasswordConfirm,
		passwordMinLength,
		credentialsSlot,
		emailFieldProps,
		passwordFieldProps,
		passwordConfirmFieldProps,
		extraFields,
		extraFieldsSlot,
		topFieldsSeparator,
		submitLabel,
		submittingLabel,
		submitButton,
		socialLogins,
		socialPosition,
		socialDividerLabel,
		footer,
		notifications,
		title,
		visible = $bindable(false),
		trigger,
		classModal,
		classInner,
		classForm,
		t: tProp,
		unstyled = false,
		noXClose = false,
		onClose,
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let modal: Modal = $state()!;
	let form = $state<RegisterForm>();

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modal.open(openerOrEvent);
	}

	export function close() {
		modal.close();
	}

	// Same imperative API the inner form exposes, forwarded. The form only exists
	// while the modal is open, so all three are no-ops when it is closed.

	/**
	 * Run every field's validator. Returns true if all valid — including when the
	 * modal is closed and there is no form to ask, so check `visible` first if
	 * that distinction matters.
	 */
	export function validate(): boolean {
		return form?.validate() ?? true;
	}

	/** Scroll + focus the first invalid field. Call after `validate()`. */
	export function scrollToFirstError(
		opts?: Parameters<typeof scrollToFirstInvalidField>[1]
	): boolean {
		return form?.scrollToFirstError(opts) ?? false;
	}

	/** Focus a field by name. Returns false if it is not currently rendered. */
	export function focusField(name: string): boolean {
		return form?.focusField(name) ?? false;
	}
</script>

{#if trigger}
	{@render trigger({ open: (e?: MouseEvent) => modal.open(e) })}
{/if}

<Modal
	bind:this={modal}
	bind:visible
	class={classModal}
	classInner={twMerge("max-w-sm md:max-w-sm", "h-auto md:h-auto m-auto", classInner)}
	classDialog="flex items-center justify-center"
>
	{#snippet header()}
		<div class="flex items-center justify-between p-4">
			<H level={1} renderLevel={3} class="pl-2">
				{title ?? t("register_form.modal_title")}
			</H>
			{#if !noXClose}
				<Button
					variant="ghost"
					onclick={() => {
						// no auto close if explicit false signal returned
						if (onClose?.() === false) return;
						modal.close();
					}}
					aria-label="Close"
					x
					iconButton
				/>
			{/if}
		</div>
	{/snippet}

	<div class="p-6 pt-3">
		<RegisterForm
			bind:this={form}
			bind:formData
			{onSubmit}
			{isSubmitting}
			{submitDisabled}
			{errors}
			{error}
			{showEmail}
			{showPassword}
			{showPasswordConfirm}
			{passwordMinLength}
			{credentialsSlot}
			{emailFieldProps}
			{passwordFieldProps}
			{passwordConfirmFieldProps}
			{extraFields}
			{extraFieldsSlot}
			{topFieldsSeparator}
			{submitLabel}
			{submittingLabel}
			{submitButton}
			{socialLogins}
			{socialPosition}
			{socialDividerLabel}
			{footer}
			{notifications}
			t={tProp}
			{unstyled}
			class={classForm}
		/>
	</div>
</Modal>
