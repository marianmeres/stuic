<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as GuestFormProps } from "./CheckoutGuestForm.svelte";
	import type { Props as LoginFormProps } from "./CheckoutLoginForm.svelte";
	import type { Props as LoginFormModalProps } from "../LoginForm/LoginFormModal.svelte";
	import type { Props as LoginOrRegisterFormModalProps } from "../LoginOrRegisterForm/LoginOrRegisterFormModal.svelte";
	import type { LoginOrRegisterFormMode } from "../LoginOrRegisterForm/LoginOrRegisterForm.svelte";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export type FormMode = "guest-only" | "login-only" | "tabbed" | "stacked";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Guest form configuration. Required for "guest-only", "tabbed", "stacked" modes. */
		guestForm?: Omit<GuestFormProps, "t" | "unstyled" | "class" | "el">;

		/** Login form configuration. Required for "login-only", "tabbed", "stacked" modes. */
		loginForm?: Omit<LoginFormProps, "t" | "unstyled" | "class" | "el">;

		/**
		 * How to display the forms.
		 * - "guest-only": Only show guest form
		 * - "login-only": Only show login form
		 * - "tabbed": Show guest and login with pill-style tab switcher (default)
		 * - "stacked": Show both forms stacked vertically with a divider
		 */
		formMode?: FormMode;

		/**
		 * When provided, clicking the login tab opens a LoginFormModal
		 * instead of rendering the form inline (tabbed mode only).
		 * Form-related props are taken from loginForm.
		 */
		loginModal?: Pick<
			LoginFormModalProps,
			| "title"
			| "classModal"
			| "classInner"
			| "classForm"
			| "noXClose"
			| "onClose"
			| "showRememberMe"
		>;

		/**
		 * When provided (and `formMode === "tabbed"`), clicking the login tab opens
		 * a `LoginOrRegisterFormModal` instead of rendering `<CheckoutLoginForm>` inline,
		 * giving consumers login + register + verify-OTP in a single modal.
		 *
		 * Mutually exclusive with `loginModal` — if both are provided,
		 * `loginOrRegisterModal` wins.
		 *
		 * `mode` and `verifyEmail` are forwarded one-way (prop → modal); use
		 * `onModeChange` to keep consumer-side state in sync. To programmatically
		 * flip into verify mode (e.g., on a `requiresVerification` server response),
		 * the consumer updates its own `mode` state and the new value flows down.
		 */
		loginOrRegisterModal?: Pick<
			LoginOrRegisterFormModalProps,
			| "title"
			| "classModal"
			| "classInner"
			| "classForm"
			| "noXClose"
			| "noClickOutsideClose"
			| "onClose"
			| "mode"
			| "verifyEmail"
			| "onLogin"
			| "onRegister"
			| "onVerify"
			| "onResendCode"
			| "onForgotPassword"
			| "onModeChange"
			| "isSubmitting"
			| "loginProps"
			| "registerProps"
			| "verifyProps"
			| "socialLogins"
			| "socialDividerLabel"
			| "footer"
			| "modeSwitcher"
			| "loginModeLabel"
			| "registerModeLabel"
			| "verifyModeLabel"
		>;

		/** Tab label for the guest form tab. Default from i18n. */
		guestTabLabel?: string;

		/** Tab label for the login form tab. Default from i18n. */
		loginTabLabel?: string;

		/** Bindable active tab: "guest" or "login". Default: "guest" */
		activeTab?: "guest" | "login";

		/** Optional heading rendered above the switcher/forms */
		heading?: Snippet | string;

		/** Optional notifications instance — forwarded to child forms */
		notifications?: NotificationsStack;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLDivElement;

		//
		hLevel?: HLevel;
		hRenderLevel?: HLevel;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import CheckoutGuestForm from "./CheckoutGuestForm.svelte";
	import CheckoutLoginForm from "./CheckoutLoginForm.svelte";
	import LoginFormModal from "../LoginForm/LoginFormModal.svelte";
	import LoginOrRegisterFormModal from "../LoginOrRegisterForm/LoginOrRegisterFormModal.svelte";
	import ButtonGroupRadio from "../ButtonGroupRadio/ButtonGroupRadio.svelte";
	import { H, type HLevel } from "../H/index.js";
	import CheckoutSectionHeader from "./CheckoutSectionHeader.svelte";

	// Map login_form.* / register_form.* / email_verify_form.* keys to
	// their checkout.* equivalents so consumers can keep a single i18n prefix.
	const FORM_KEY_MAP: Record<string, string> = {
		// LoginForm
		"login_form.email_label": "checkout.login.email_label",
		"login_form.email_placeholder": "checkout.login.email_placeholder",
		"login_form.password_label": "checkout.login.password_label",
		"login_form.password_placeholder": "checkout.login.password_placeholder",
		"login_form.submit": "checkout.login.submit",
		"login_form.submitting": "checkout.login.submitting",
		"login_form.forgot_password": "checkout.login.forgot_password",
		"login_form.email_required": "checkout.login.email_required",
		"login_form.email_invalid": "checkout.login.email_invalid",
		"login_form.password_required": "checkout.login.password_required",
		"login_form.social_divider": "checkout.login.social_divider",
		"login_form.remember_me": "checkout.login.remember_me",
		"login_form.remember_me_tooltip": "checkout.login.remember_me_tooltip",
		"login_form.modal_title": "checkout.login.modal_title",
		// RegisterForm
		"register_form.email_label": "checkout.register.email_label",
		"register_form.email_placeholder": "checkout.register.email_placeholder",
		"register_form.password_label": "checkout.register.password_label",
		"register_form.password_placeholder": "checkout.register.password_placeholder",
		"register_form.password_confirm_label": "checkout.register.password_confirm_label",
		"register_form.password_confirm_placeholder":
			"checkout.register.password_confirm_placeholder",
		"register_form.submit": "checkout.register.submit",
		"register_form.submitting": "checkout.register.submitting",
		"register_form.email_required": "checkout.register.email_required",
		"register_form.email_invalid": "checkout.register.email_invalid",
		"register_form.password_required": "checkout.register.password_required",
		"register_form.password_too_short": "checkout.register.password_too_short",
		"register_form.password_confirm_required": "checkout.register.password_confirm_required",
		"register_form.password_mismatch": "checkout.register.password_mismatch",
		"register_form.field_required": "checkout.register.field_required",
		"register_form.social_divider": "checkout.register.social_divider",
		"register_form.already_have_account": "checkout.register.already_have_account",
		"register_form.modal_title": "checkout.register.modal_title",
		// EmailVerifyForm
		"email_verify_form.heading": "checkout.verify.heading",
		"email_verify_form.subheading": "checkout.verify.subheading",
		"email_verify_form.submit": "checkout.verify.submit",
		"email_verify_form.submitting": "checkout.verify.submitting",
		"email_verify_form.resend_prompt": "checkout.verify.resend_prompt",
		"email_verify_form.resend": "checkout.verify.resend",
		"email_verify_form.resend_cooldown": "checkout.verify.resend_cooldown",
		"email_verify_form.resent": "checkout.verify.resent",
		"email_verify_form.attempts_remaining": "checkout.verify.attempts_remaining",
		// LoginOrRegisterForm (composite)
		"login_or_register_form.mode_login": "checkout.login_or_register.mode_login",
		"login_or_register_form.mode_register": "checkout.login_or_register.mode_register",
		"login_or_register_form.mode_verify": "checkout.login_or_register.mode_verify",
		"login_or_register_form.social_divider": "checkout.login_or_register.social_divider",
		"login_or_register_form.modal_title_login": "checkout.login_or_register.modal_title_login",
		"login_or_register_form.modal_title_register":
			"checkout.login_or_register.modal_title_register",
		"login_or_register_form.modal_title_verify":
			"checkout.login_or_register.modal_title_verify",
	};

	let {
		guestForm,
		loginForm,
		formMode = "tabbed",
		loginModal,
		loginOrRegisterModal,
		notifications,
		guestTabLabel,
		loginTabLabel,
		activeTab = $bindable("guest"),
		heading,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		hLevel = 3,
		hRenderLevel = 3,
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// `loginOrRegisterModal` wins when both are passed.
	let _useLoginOrRegisterModal = $derived(!!loginOrRegisterModal);
	let _useLoginModal = $derived(!loginOrRegisterModal && !!loginModal);

	$effect(() => {
		if (loginModal && loginOrRegisterModal) {
			console.warn(
				"[CheckoutGuestOrLoginForm] Both `loginModal` and `loginOrRegisterModal` " +
					"were provided; `loginOrRegisterModal` takes precedence."
			);
		}
	});

	let loginModalRef: LoginFormModal = $state()!;
	let loginOrRegisterModalRef: LoginOrRegisterFormModal = $state()!;

	// Adapted t for the modals — maps login_form.* / register_form.* /
	// email_verify_form.* / login_or_register_form.* keys to their checkout.* equivalents.
	let modalT = $derived(
		loginModal || loginOrRegisterModal
			? (
					key: string,
					values?: false | null | undefined | Record<string, string | number>,
					fallback?: string | boolean
				) => t(FORM_KEY_MAP[key] ?? key, values, fallback)
			: undefined
	);

	// Local mirrors of the bindable LoginOrRegisterFormModal state — kept in sync
	// from the consumer-supplied values via $effect, so consumer-driven updates
	// (e.g., flipping `mode = "verify"` after a `requiresVerification` response)
	// flow down. Modal-driven changes are forwarded back via `onModeChange`.
	let _loroMode: LoginOrRegisterFormMode = $state("login");
	let _loroVerifyEmail = $state("");

	$effect(() => {
		if (loginOrRegisterModal?.mode !== undefined && loginOrRegisterModal.mode !== _loroMode) {
			_loroMode = loginOrRegisterModal.mode;
		}
	});
	$effect(() => {
		if (
			loginOrRegisterModal?.verifyEmail !== undefined &&
			loginOrRegisterModal.verifyEmail !== _loroVerifyEmail
		) {
			_loroVerifyEmail = loginOrRegisterModal.verifyEmail;
		}
	});

	let tabOptions = $derived([
		{ value: "guest", label: guestTabLabel ?? t("checkout.guest_or_login.guest_tab") },
		{ value: "login", label: loginTabLabel ?? t("checkout.guest_or_login.login_tab") },
	]);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-guest-or-login-form", classProp)
	);
</script>

<div bind:this={el} class={_class} {...rest}>
	<!-- Optional heading -->
	{#if heading}
		<CheckoutSectionHeader>
			{#if typeof heading === "string"}
				<H level={hLevel} renderLevel={hRenderLevel}>
					{heading}
				</H>
			{:else}
				{@render heading()}
			{/if}
		</CheckoutSectionHeader>
	{/if}

	{#if formMode === "guest-only"}
		{#if guestForm}
			<CheckoutGuestForm {...guestForm} {notifications} t={tProp} {unstyled} />
		{/if}
	{:else if formMode === "login-only"}
		{#if loginForm}
			<CheckoutLoginForm {...loginForm} {notifications} t={tProp} {unstyled} />
		{/if}
	{:else if formMode === "tabbed"}
		<ButtonGroupRadio
			options={tabOptions}
			bind:value={activeTab as string}
			class={unstyled ? undefined : "stuic-checkout-guest-or-login-tabs"}
			onButtonClick={(index) => {
				if (tabOptions[index]?.value !== "login") return;
				if (_useLoginOrRegisterModal) {
					loginOrRegisterModalRef?.open();
					return false;
				}
				if (_useLoginModal) {
					loginModalRef?.open();
					return false;
				}
			}}
		/>
		{#if activeTab === "guest" && guestForm}
			<CheckoutGuestForm {...guestForm} {notifications} t={tProp} {unstyled} />
		{:else if activeTab === "login" && loginForm && !_useLoginOrRegisterModal && !_useLoginModal}
			<CheckoutLoginForm {...loginForm} {notifications} t={tProp} {unstyled} />
		{/if}
	{:else if formMode === "stacked"}
		{#if loginForm}
			<CheckoutLoginForm {...loginForm} {notifications} t={tProp} {unstyled} />
		{/if}
		<div class={unstyled ? undefined : "stuic-checkout-guest-or-login-divider"}>
			<span>{t("checkout.step.or_divider")}</span>
		</div>
		{#if guestForm}
			<CheckoutGuestForm {...guestForm} {notifications} t={tProp} {unstyled} />
		{/if}
	{/if}

	{#if _useLoginModal && loginModal && loginForm}
		<LoginFormModal
			bind:this={loginModalRef}
			formData={loginForm.formData}
			onSubmit={loginForm.onSubmit}
			isSubmitting={loginForm.isSubmitting}
			errors={loginForm.errors}
			error={loginForm.error}
			onForgotPassword={loginForm.onForgotPassword}
			submitLabel={loginForm.submitLabel}
			submittingLabel={loginForm.submittingLabel}
			submitButton={loginForm.submitButton}
			socialLogins={loginForm.socialLogins}
			socialDividerLabel={loginForm.socialDividerLabel}
			footer={loginForm.footer}
			{notifications}
			title={loginTabLabel ?? t("checkout.guest_or_login.login_tab")}
			t={modalT}
			{unstyled}
			{...loginModal}
		/>
	{/if}

	{#if _useLoginOrRegisterModal && loginOrRegisterModal}
		<LoginOrRegisterFormModal
			bind:this={loginOrRegisterModalRef}
			bind:mode={_loroMode}
			bind:verifyEmail={_loroVerifyEmail}
			onLogin={loginOrRegisterModal.onLogin}
			onRegister={loginOrRegisterModal.onRegister}
			onVerify={loginOrRegisterModal.onVerify}
			onResendCode={loginOrRegisterModal.onResendCode}
			onForgotPassword={loginOrRegisterModal.onForgotPassword}
			onModeChange={(next, prev) => {
				loginOrRegisterModal!.onModeChange?.(next, prev);
			}}
			isSubmitting={loginOrRegisterModal.isSubmitting}
			loginProps={loginOrRegisterModal.loginProps}
			registerProps={loginOrRegisterModal.registerProps}
			verifyProps={loginOrRegisterModal.verifyProps}
			modeSwitcher={loginOrRegisterModal.modeSwitcher}
			loginModeLabel={loginOrRegisterModal.loginModeLabel}
			registerModeLabel={loginOrRegisterModal.registerModeLabel}
			verifyModeLabel={loginOrRegisterModal.verifyModeLabel}
			socialLogins={loginOrRegisterModal.socialLogins}
			socialDividerLabel={loginOrRegisterModal.socialDividerLabel}
			footer={loginOrRegisterModal.footer}
			{notifications}
			title={loginOrRegisterModal.title}
			classModal={loginOrRegisterModal.classModal}
			classInner={loginOrRegisterModal.classInner}
			classForm={loginOrRegisterModal.classForm}
			noXClose={loginOrRegisterModal.noXClose}
			noClickOutsideClose={loginOrRegisterModal.noClickOutsideClose}
			onClose={loginOrRegisterModal.onClose}
			t={modalT}
			{unstyled}
		/>
	{/if}
</div>
