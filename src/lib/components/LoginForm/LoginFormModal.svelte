<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { TranslateFn } from "../../types.js";
	import type {
		LoginFormData,
		LoginFormValidationError,
	} from "./_internal/login-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export interface Props {
		/** Bindable login data. Default: createEmptyLoginFormData() */
		formData?: LoginFormData;

		/** Called on form submit after client-side validation passes. */
		onSubmit: (data: LoginFormData) => void;

		/** Whether the form is currently submitting (disables CTA) */
		isSubmitting?: boolean;

		/** Field-specific validation errors (e.g., from server) */
		errors?: LoginFormValidationError[];

		/**
		 * General error message (not field-specific).
		 * Rendered as an alert box above the form.
		 */
		error?: string;

		/**
		 * Called when "Forgot password?" is clicked.
		 * If undefined, the link is not rendered.
		 */
		onForgotPassword?: () => void;

		/** Show "Remember me" checkbox. Default: true */
		showRememberMe?: boolean;

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
		 * Override the divider label above social login buttons.
		 */
		socialDividerLabel?: string | false;

		/**
		 * Content below the form.
		 */
		footer?: Snippet;

		/** Optional notifications instance */
		notifications?: NotificationsStack;

		/** Modal title. Default: i18n key "login_form.modal_title" ("Log In") */
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

		/** CSS class for the LoginForm */
		classForm?: string;

		t?: TranslateFn;
		unstyled?: boolean;

		noXClose?: boolean;
		onClose?: () => false | void;
	}
</script>

<script lang="ts">
	import Modal from "../Modal/Modal.svelte";
	import LoginForm from "./LoginForm.svelte";
	import Button from "../Button/Button.svelte";
	import { iconX } from "../../icons/index.js";
	import { t_default } from "./_internal/login-form-i18n-defaults.js";
	import { createEmptyLoginFormData } from "./_internal/login-form-utils.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import H from "../H/H.svelte";

	let {
		formData = $bindable(createEmptyLoginFormData()),
		onSubmit,
		isSubmitting = false,
		errors,
		error,
		onForgotPassword,
		showRememberMe,
		submitLabel,
		submittingLabel,
		submitButton,
		socialLogins,
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

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		modal.open(openerOrEvent);
	}

	export function close() {
		modal.close();
	}
</script>

{#if trigger}
	{@render trigger({ open: (e?: MouseEvent) => modal.open(e) })}
{/if}

<!-- classDialog="size-auto md:size-auto" -->
<Modal
	bind:this={modal}
	bind:visible
	class={classModal}
	classInner={twMerge("max-w-sm md:max-w-sm", "h-auto md:h-auto m-auto", classInner)}
	classDialog="flex items-center justify-center"
>
	{#snippet header()}
		<div class="flex items-center justify-between p-4 pb-0">
			<H level={1} renderLevel={3} class="pl-2">
				{title ?? t("login_form.modal_title")}
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
					aspect1
					roundedFull
				/>
			{/if}
		</div>
	{/snippet}

	<div class="p-6 pt-3">
		<LoginForm
			bind:formData
			{onSubmit}
			{isSubmitting}
			{errors}
			{error}
			{onForgotPassword}
			{showRememberMe}
			{submitLabel}
			{submittingLabel}
			{submitButton}
			{socialLogins}
			{socialDividerLabel}
			{footer}
			{notifications}
			t={tProp}
			{unstyled}
			class={classForm}
			compact
		/>
	</div>
</Modal>
