<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutLoginFormData,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

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
		 * Social/OAuth login buttons rendered below the primary form.
		 * When provided, a styled "or continue with" divider is shown above.
		 * Consumer renders the buttons — the library provides layout + divider.
		 */
		socialLogins?: Snippet;

		/**
		 * Override the divider label above social login buttons.
		 * Default: i18n key "checkout.login.social_divider" ("or continue with").
		 * Set to `false` to hide the divider while still rendering socialLogins.
		 */
		socialDividerLabel?: string | false;

		/**
		 * Content below the form.
		 * Use for "Or continue as guest" links, sign-up links, etc.
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
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { createEmptyLoginFormData } from "./_internal/checkout-utils.js";
	import LoginForm from "../LoginForm/LoginForm.svelte";

	// Map login_form.* keys → checkout.login.* keys for backwards compatibility
	const KEY_MAP: Record<string, string> = {
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
	};

	let {
		formData = $bindable(createEmptyLoginFormData()),
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// Adapt the t function: LoginForm uses login_form.* keys,
	// but checkout consumers provide checkout.login.* translations
	let adaptedT = $derived(
		(
			key: string,
			values?: false | null | undefined | Record<string, string | number>,
			fallback?: string | boolean
		) => t(KEY_MAP[key] ?? key, values, fallback)
	);

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-login-form", classProp)
	);
</script>

<LoginForm bind:formData bind:el t={adaptedT} {unstyled} class={_class} {...rest} />
