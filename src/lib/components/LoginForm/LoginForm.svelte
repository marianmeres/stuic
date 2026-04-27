<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import type {
		LoginFormData,
		LoginFormValidationError,
	} from "./_internal/login-form-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
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
		 * Example: "Invalid email or password"
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
		 * When provided, a styled "or continue with" divider is shown above.
		 * Consumer renders the buttons — the library provides layout + divider.
		 */
		socialLogins?: Snippet;

		/**
		 * Override the divider label above social login buttons.
		 * Default: i18n key "login_form.social_divider" ("or continue with").
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
	import { untrack } from "svelte";
	import { onSubmitValidityCheck } from "../../actions/on-submit-validity-check.svelte.js";
	import { tooltip } from "../../actions/tooltip/tooltip.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import FieldCheckbox from "../Input/FieldCheckbox.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import { t_default } from "./_internal/login-form-i18n-defaults.js";
	import {
		createEmptyLoginFormData,
		validateLoginForm,
	} from "./_internal/login-form-utils.js";

	let {
		formData = $bindable(createEmptyLoginFormData()),
		onSubmit,
		isSubmitting = false,
		errors: externalErrors = [],
		error,
		notifications,
		onForgotPassword,
		showRememberMe = true,
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

	// Mirror the form ref into local $state so it survives prop re-application
	// when the parent re-renders without binding `el`. Otherwise the bindable
	// prop reverts to its default (undefined) on the next parent re-render, the
	// `$effect` tracking it cleans up the `submit_valid` listener, and `bind:this`
	// does NOT re-fire (the form element wasn't unmounted) — leaving the form
	// alive in the DOM with no submit handler. Next click silently goes nowhere.
	// `el` stays the public API: consumers can still bind it; we mirror formEl
	// into it so the binding sees a value.
	let formEl = $state<HTMLFormElement | undefined>();
	$effect(() => {
		el = formEl;
	});

	// Internal validation errors (set on submit)
	let internalErrors = $state<LoginFormValidationError[]>([]);

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

	function handleSubmitValid() {
		// // [debug] kept commented for the next time Issue A regresses
		// // eslint-disable-next-line no-console
		// console.log("[LoginForm handleSubmitValid] entered", {
		// 	formData: { ...formData },
		// 	internalErrors: $state.snapshot(internalErrors),
		// 	externalErrors: [...externalErrors],
		// 	error,
		// });

		// Defensively clear any stale customValidity left on form fields by a prior
		// validation pass. The canonical fix lives in `onSubmitValidityCheck` (which
		// pre-clears before the per-field re-dispatch), but doing it here too is
		// cheap insurance against any future regression that lets a stale flag slip
		// past the action.
		if (formEl) {
			for (const node of Array.from(formEl.elements) as HTMLInputElement[]) {
				if (typeof node.setCustomValidity === "function") node.setCustomValidity("");
			}
		}

		const validationErrors = validateLoginForm(formData, t);
		internalErrors = validationErrors;

		// // [debug] kept commented for the next time Issue A regresses
		// // eslint-disable-next-line no-console
		// console.log("[LoginForm handleSubmitValid] post-validate", {
		// 	validationErrors,
		// 	externalErrorsLen: externalErrors.length,
		// 	willCallOnSubmit:
		// 		validationErrors.length === 0 && externalErrors.length === 0,
		// });

		if (validationErrors.length === 0 && externalErrors.length === 0) {
			onSubmit(formData);
		}
	}

	// Clear internal field errors as soon as the user edits the form, so a previous
	// failed-submit's errors don't linger after the user has fixed them. Re-validation
	// on the next submit will repopulate `internalErrors` if anything is still wrong.
	// `untrack` for the read+write so this effect only re-runs on formData changes —
	// otherwise `handleSubmitValid` setting `internalErrors` would immediately re-fire
	// this effect and wipe the errors back out.
	$effect(() => {
		void formData.email;
		void formData.password;
		untrack(() => {
			if (internalErrors.length) internalErrors = [];
		});
	});

	$effect(() => {
		if (error && notifications) notifications.error(error);
	});

	// The onSubmitValidityCheck action intercepts native submit (capture phase,
	// stopImmediatePropagation) and dispatches a custom "submit_valid" event.
	// Listen for it on the form element as a fallback. Reads `formEl` (local state)
	// — NOT the `el` prop, which can revert to undefined on parent re-render and
	// would cause this $effect's cleanup to silently detach the listener.
	$effect(() => {
		const node = formEl;
		if (!node) return;
		node.addEventListener("submit_valid", handleSubmitValid);
		return () => node.removeEventListener("submit_valid", handleSubmitValid);
	});

	let _class = $derived(unstyled ? classProp : twMerge("stuic-login-form", classProp));
</script>

<form bind:this={formEl} class={_class} use:onSubmitValidityCheck {...rest}>
	<!-- General error alert -->
	<DismissibleMessage message={error} intent="destructive" />

	<!--
		svelte-ignore binding_property_non_reactive:
		formData is a $bindable prop — deep reactivity depends on the consumer
		passing a $state() object. The bindings work correctly regardless.
	-->
	<!-- Email -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:value={formData.email}
		label={t("login_form.email_label")}
		type="email"
		placeholder={t("login_form.email_placeholder")}
		autocomplete="email"
		required
		name="login-email"
		labelLeftBreakpoint={0}
		validate={{
			customValidator(val) {
				return fieldError("email") || "";
			},
		}}
	/>

	<!-- Password -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:value={formData.password}
		label={t("login_form.password_label")}
		autocomplete="current-password"
		type="password"
		placeholder={t("login_form.password_placeholder")}
		required
		name="login-password"
		labelLeftBreakpoint={0}
		validate={{
			customValidator(val) {
				return fieldError("password") || "";
			},
		}}
	/>

	<!-- CTA -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: isSubmitting })}
	{:else}
		<div class={unstyled ? undefined : "stuic-login-form-submit"}>
			<Button intent="primary" type="submit" disabled={isSubmitting} class="w-full">
				{isSubmitting
					? (submittingLabel ?? t("login_form.submitting"))
					: (submitLabel ?? t("login_form.submit"))}
			</Button>
		</div>
	{/if}

	<!-- Remember me + Forgot password -->
	{#if showRememberMe || onForgotPassword}
		<div class={unstyled ? undefined : "stuic-login-form-options"}>
			{#if showRememberMe}
				<!-- svelte-ignore binding_property_non_reactive -->
				<span use:tooltip aria-label={t("login_form.remember_me_tooltip")}>
					<FieldCheckbox
						bind:checked={formData.rememberMe}
						label={t("login_form.remember_me")}
						name="login-remember-me"
						class="mb-0"
					/>
				</span>
			{/if}
			{#if onForgotPassword}
				<Button
					variant="link"
					type="button"
					class={unstyled ? undefined : "text-muted-foreground ml-auto"}
					size="sm"
					onclick={onForgotPassword}
				>
					{t("login_form.forgot_password")}
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Social logins -->
	{#if socialLogins}
		<div class={unstyled ? undefined : "stuic-login-form-social"}>
			{#if socialDividerLabel !== false}
				<div class={unstyled ? undefined : "stuic-login-form-social-divider"}>
					<span>
						{typeof socialDividerLabel === "string"
							? socialDividerLabel
							: t("login_form.social_divider")}
					</span>
				</div>
			{/if}
			<div class={unstyled ? undefined : "stuic-login-form-social-buttons"}>
				{@render socialLogins()}
			</div>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
