<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as GuestFormProps } from "./CheckoutGuestForm.svelte";
	import type { Props as LoginFormProps } from "./CheckoutLoginForm.svelte";
	import type { Props as LoginFormModalProps } from "../LoginForm/LoginFormModal.svelte";
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
	import TabbedMenu from "../TabbedMenu/TabbedMenu.svelte";
	import { H, type HLevel } from "../H/index.js";
	import CheckoutSectionHeader from "./CheckoutSectionHeader.svelte";

	// Map login_form.* keys → checkout.login.* keys (same as CheckoutLoginForm)
	const LOGIN_FORM_KEY_MAP: Record<string, string> = {
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
	};

	let {
		guestForm,
		loginForm,
		formMode = "tabbed",
		loginModal,
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

	let loginModalRef: LoginFormModal = $state()!;

	// Adapted t for LoginFormModal (maps login_form.* → checkout.login.*)
	let modalT = $derived(
		loginModal
			? (
					key: string,
					values?: false | null | undefined | Record<string, string | number>,
					fallback?: string | boolean
				) => t(LOGIN_FORM_KEY_MAP[key] ?? key, values, fallback)
			: undefined
	);

	let tabItems = $derived([
		{ id: "guest", label: guestTabLabel ?? t("checkout.guest_or_login.guest_tab") },
		{
			id: "login",
			label: loginTabLabel ?? t("checkout.guest_or_login.login_tab"),
			...(loginModal
				? {
						onSelect: () => {
							loginModalRef?.open();
							return false;
						},
					}
				: {}),
		},
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
		<TabbedMenu
			items={tabItems}
			value={activeTab}
			onSelect={(item) => {
				activeTab = item.id as "guest" | "login";
			}}
			{unstyled}
			class={unstyled ? undefined : "stuic-checkout-guest-or-login-tabs"}
		/>
		{#if activeTab === "guest" && guestForm}
			<div role="tabpanel">
				<CheckoutGuestForm {...guestForm} {notifications} t={tProp} {unstyled} />
			</div>
		{:else if activeTab === "login" && loginForm}
			<div role="tabpanel">
				<CheckoutLoginForm {...loginForm} {notifications} t={tProp} {unstyled} />
			</div>
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

	{#if loginModal && loginForm}
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
</div>
