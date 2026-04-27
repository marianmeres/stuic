<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { TranslateFn } from "../../types.js";
	import type {
		LoginOrRegisterFormMode,
		Props as InnerProps,
	} from "./LoginOrRegisterForm.svelte";
	import type { LoginFormData } from "../LoginForm/_internal/login-form-types.js";
	import type { RegisterFormData } from "../RegisterForm/_internal/register-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export interface Props {
		/** Bindable active mode. Default: "login" */
		mode?: LoginOrRegisterFormMode;

		/** Bindable login formData */
		loginData?: LoginFormData;

		/** Bindable register formData */
		registerData?: RegisterFormData;

		/** Bindable email used by EmailVerifyForm. */
		verifyEmail?: string;

		onLogin: (data: LoginFormData) => void;
		onRegister: (data: RegisterFormData) => void;

		/** Called when the user submits a code in the verify view. */
		onVerify?: (code: string) => void;

		/** Called when the user clicks "Resend code" in the verify view. */
		onResendCode?: () => Promise<void> | void;

		isSubmitting?: boolean;

		/**
		 * Called when "Forgot password?" is clicked in login mode.
		 * If undefined, the link is not rendered.
		 */
		onForgotPassword?: () => void;

		loginProps?: InnerProps["loginProps"];
		registerProps?: InnerProps["registerProps"];
		verifyProps?: InnerProps["verifyProps"];

		modeSwitcher?: InnerProps["modeSwitcher"];

		loginModeLabel?: string;
		registerModeLabel?: string;
		verifyModeLabel?: string;

		/** Shared social logins (rendered below the active form). */
		socialLogins?: Snippet;
		socialDividerLabel?: string | false;

		/** Footer snippet. Receives mode + setter. */
		footer?: InnerProps["footer"];

		notifications?: NotificationsStack;

		/**
		 * Override the modal title. If omitted, a mode-aware default is used
		 * ("Log In" vs "Create account").
		 */
		title?: string;

		/** Bindable modal visibility */
		visible?: boolean;

		/** Optional trigger element rendered outside the modal. */
		trigger?: Snippet<[{ open: () => void }]>;

		/** CSS class for the Modal box */
		classModal?: string;

		/** CSS class for the Modal inner width container */
		classInner?: string;

		/** CSS class for the LoginOrRegisterForm */
		classForm?: string;

		t?: TranslateFn;
		unstyled?: boolean;

		noXClose?: boolean;
		onClose?: () => false | void;

		/**
		 * Disable close on backdrop / outside click. Defaults to `true` because
		 * accidentally losing typed credentials due to a stray backdrop click is a
		 * worse UX than requiring an explicit close. Set to `false` to opt back in.
		 */
		noClickOutsideClose?: boolean;

		/**
		 * Called when the active form mode changes (login/register/verify). Receives
		 * `(next, prev)`. Use this to clear parent-owned, mode-specific state — e.g.,
		 * a general `error` string that shouldn't survive a transition between Login
		 * and Sign up.
		 */
		onModeChange?: (next: LoginOrRegisterFormMode, prev: LoginOrRegisterFormMode) => void;
	}
</script>

<script lang="ts">
	import Modal from "../Modal/Modal.svelte";
	import LoginOrRegisterForm from "./LoginOrRegisterForm.svelte";
	import Button from "../Button/Button.svelte";
	import { t_default } from "./_internal/login-or-register-form-i18n-defaults.js";
	import { createEmptyLoginFormData } from "../LoginForm/_internal/login-form-utils.js";
	import { createEmptyRegisterFormData } from "../RegisterForm/_internal/register-form-utils.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import H from "../H/H.svelte";

	let {
		mode = $bindable("login"),
		loginData = $bindable(createEmptyLoginFormData()),
		registerData = $bindable(createEmptyRegisterFormData()),
		verifyEmail = $bindable(""),
		onLogin,
		onRegister,
		onVerify,
		onResendCode,
		isSubmitting = false,
		onForgotPassword,
		loginProps,
		registerProps,
		verifyProps,
		modeSwitcher,
		loginModeLabel,
		registerModeLabel,
		verifyModeLabel,
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
		noClickOutsideClose = true,
		onModeChange,
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let resolvedTitle = $derived(
		title ??
			(mode === "verify"
				? t("login_or_register_form.modal_title_verify")
				: mode === "login"
					? t("login_or_register_form.modal_title_login")
					: t("login_or_register_form.modal_title_register"))
	);

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

<Modal
	bind:this={modal}
	bind:visible
	class={classModal}
	classInner={twMerge("max-w-sm md:max-w-sm", "h-auto md:h-auto m-auto", classInner)}
	classDialog="flex items-center justify-center"
	{noClickOutsideClose}
>
	{#snippet header()}
		<div class="flex items-center justify-between p-4">
			<H level={1} renderLevel={3} class="pl-2">
				{resolvedTitle}
			</H>
			{#if !noXClose}
				<Button
					variant="ghost"
					onclick={() => {
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
		<LoginOrRegisterForm
			bind:mode
			bind:loginData
			bind:registerData
			bind:verifyEmail
			{onLogin}
			{onRegister}
			{onVerify}
			{onResendCode}
			{isSubmitting}
			{onForgotPassword}
			{loginProps}
			{registerProps}
			{verifyProps}
			{modeSwitcher}
			{loginModeLabel}
			{registerModeLabel}
			{verifyModeLabel}
			{socialLogins}
			{socialDividerLabel}
			{footer}
			{notifications}
			{onModeChange}
			t={tProp}
			{unstyled}
			class={classForm}
		/>
	</div>
</Modal>
