<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as LoginFormProps } from "../LoginForm/LoginForm.svelte";
	import type { LoginFormData } from "../LoginForm/_internal/login-form-types.js";
	import type { Props as RegisterFormProps } from "../RegisterForm/RegisterForm.svelte";
	import type { RegisterFormData } from "../RegisterForm/_internal/register-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export type LoginOrRegisterFormMode = "login" | "register";

	type InnerPropsCommonOmit =
		| "formData"
		| "onSubmit"
		| "isSubmitting"
		| "t"
		| "notifications"
		| "socialLogins"
		| "socialDividerLabel"
		| "footer";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		/** Bindable active mode. Default: "login" */
		mode?: LoginOrRegisterFormMode;

		/** Bindable login formData (forwarded to LoginForm) */
		loginData?: LoginFormData;

		/** Bindable register formData (forwarded to RegisterForm) */
		registerData?: RegisterFormData;

		/** Called when the inner LoginForm submits successfully. */
		onLogin: (data: LoginFormData) => void;

		/** Called when the inner RegisterForm submits successfully. */
		onRegister: (data: RegisterFormData) => void;

		/** Applied to both inner forms' submit buttons. */
		isSubmitting?: boolean;

		/** Pass-through props for the inner LoginForm (spread). */
		loginProps?: Omit<LoginFormProps, InnerPropsCommonOmit>;

		/** Pass-through props for the inner RegisterForm (spread). */
		registerProps?: Omit<RegisterFormProps, InnerPropsCommonOmit>;

		/** Override the built-in ButtonGroupRadio mode switcher. */
		modeSwitcher?: Snippet<
			[
				{
					mode: LoginOrRegisterFormMode;
					setMode: (m: LoginOrRegisterFormMode) => void;
					t: TranslateFn;
				},
			]
		>;

		/** Override the "Log in" tab label. */
		loginModeLabel?: string;

		/** Override the "Sign up" tab label. */
		registerModeLabel?: string;

		/**
		 * Social/OAuth login buttons rendered ONCE below the active form.
		 * Shared between both modes (OAuth works for either flow).
		 */
		socialLogins?: Snippet;

		/**
		 * Override the divider label above social login buttons.
		 * Default: i18n key "login_or_register_form.social_divider".
		 * Set to `false` to hide the divider while still rendering socialLogins.
		 */
		socialDividerLabel?: string | false;

		/**
		 * Footer snippet. Receives the current mode + setter so consumers can
		 * render mode-aware content (e.g., "Already have an account? Sign in").
		 */
		footer?: Snippet<
			[
				{
					mode: LoginOrRegisterFormMode;
					setMode: (m: LoginOrRegisterFormMode) => void;
				},
			]
		>;

		notifications?: NotificationsStack;
		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/login-or-register-form-i18n-defaults.js";
	import LoginForm from "../LoginForm/LoginForm.svelte";
	import { createEmptyLoginFormData } from "../LoginForm/_internal/login-form-utils.js";
	import RegisterForm from "../RegisterForm/RegisterForm.svelte";
	import { createEmptyRegisterFormData } from "../RegisterForm/_internal/register-form-utils.js";
	import ButtonGroupRadio from "../ButtonGroupRadio/ButtonGroupRadio.svelte";

	let {
		mode = $bindable("login"),
		loginData = $bindable(createEmptyLoginFormData()),
		registerData = $bindable(createEmptyRegisterFormData()),
		onLogin,
		onRegister,
		isSubmitting = false,
		loginProps,
		registerProps,
		modeSwitcher,
		loginModeLabel,
		registerModeLabel,
		socialLogins,
		socialDividerLabel,
		footer,
		notifications,
		t: tProp,
		unstyled = false,
		class: classProp,
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	let loginLabel = $derived(loginModeLabel ?? t("login_or_register_form.mode_login"));
	let registerLabel = $derived(
		registerModeLabel ?? t("login_or_register_form.mode_register")
	);

	// One-shot email transfer at the transition boundary. Keeps the email
	// persistent across mode switches without setting up a continuous sync
	// effect (which would be prone to loops).
	function setMode(next: LoginOrRegisterFormMode) {
		if (next === mode) return;
		if (next === "register") {
			registerData.email = loginData.email;
		} else {
			loginData.email = registerData.email;
		}
		mode = next;
	}

	let switcherOptions = $derived([
		{ label: loginLabel, value: "login" },
		{ label: registerLabel, value: "register" },
	]);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-login-or-register-form", classProp)
	);
</script>

<div class={_class} {...rest}>
	<!-- Mode switcher -->
	<div class={unstyled ? undefined : "stuic-login-or-register-form-switcher"}>
		{#if modeSwitcher}
			{@render modeSwitcher({ mode, setMode, t })}
		{:else}
			<ButtonGroupRadio
				options={switcherOptions}
				value={mode}
				onButtonClick={(idx) => {
					setMode(idx === 0 ? "login" : "register");
					return false;
				}}
			/>
		{/if}
	</div>

	<!-- Active form -->
	<div class={unstyled ? undefined : "stuic-login-or-register-form-body"}>
		{#if mode === "login"}
			<!-- svelte-ignore binding_property_non_reactive -->
			<LoginForm
				bind:formData={loginData}
				onSubmit={onLogin}
				{isSubmitting}
				{notifications}
				t={tProp}
				{...loginProps}
			/>
		{:else}
			<!-- svelte-ignore binding_property_non_reactive -->
			<RegisterForm
				bind:formData={registerData}
				onSubmit={onRegister}
				{isSubmitting}
				{notifications}
				t={tProp}
				{...registerProps}
			/>
		{/if}
	</div>

	<!-- Shared social logins -->
	{#if socialLogins}
		<div class={unstyled ? undefined : "stuic-login-or-register-form-social"}>
			{#if socialDividerLabel !== false}
				<div class={unstyled ? undefined : "stuic-login-or-register-form-social-divider"}>
					<span>
						{typeof socialDividerLabel === "string"
							? socialDividerLabel
							: t("login_or_register_form.social_divider")}
					</span>
				</div>
			{/if}
			<div class={unstyled ? undefined : "stuic-login-or-register-form-social-buttons"}>
				{@render socialLogins()}
			</div>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer({ mode, setMode })}
	{/if}
</div>
