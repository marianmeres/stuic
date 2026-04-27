<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";
	import type { Props as OtpInputProps } from "../OtpInput/OtpInput.svelte";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
		/** Email address the code was sent to. Displayed in the subhead. */
		email: string;

		/** Called when the user submits a code (manually or via OtpInput auto-complete). */
		onSubmit: (code: string) => void;

		/**
		 * Called when the user clicks "Resend code". When provided, the resend control
		 * renders inside the form. The form owns the cooldown UI internally.
		 */
		onResend?: () => Promise<void> | void;

		/**
		 * Cooldown (seconds) after a successful resend, during which the resend
		 * link is disabled and shows a countdown. Default: 30.
		 */
		resendCooldownSeconds?: number;

		/** Disables submit button + OtpInput while submitting. */
		isSubmitting?: boolean;

		/** General error (rendered as a DismissibleMessage above the form). */
		error?: string;

		/** Optional: shown inline, e.g., "3 attempts remaining". Set to undefined to hide. */
		attemptsRemaining?: number;

		/** Code length. Default: 6. Forwarded to OtpInput. */
		codeLength?: number;

		/** Pass-through props for the inner OtpInput (spread). */
		otpInputProps?: Omit<
			OtpInputProps,
			"value" | "length" | "onComplete" | "error" | "disabled"
		>;

		/** Optional notifications instance — `error()` is called when `error` is set. */
		notifications?: NotificationsStack;

		/** Footer snippet (e.g., "Wrong email? Start over"). */
		footer?: Snippet;

		/** Override CTA section. */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/**
		 * Override or suppress the form heading. By default the heading is rendered
		 * with the i18n value of `email_verify_form.heading`. Pass a string to override
		 * the text, or `false` to skip rendering the heading entirely (useful when the
		 * surrounding container — e.g. a modal — already provides a title).
		 */
		heading?: string | false;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLFormElement;
	}
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/email-verify-form-i18n-defaults.js";
	import Button from "../Button/Button.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import H from "../H/H.svelte";
	import OtpInput from "../OtpInput/OtpInput.svelte";

	let {
		email,
		onSubmit,
		onResend,
		resendCooldownSeconds = 30,
		isSubmitting = false,
		error,
		attemptsRemaining,
		codeLength = 6,
		otpInputProps,
		notifications,
		footer,
		submitButton,
		heading,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// Mirror the form ref into local $state so it survives prop re-application
	// when the parent re-renders without binding `el`. See LoginForm for the full
	// rationale — same Svelte 5 `$bindable` + `bind:this` gotcha applies here.
	// EmailVerifyForm uses `onsubmit={handleFormSubmit}` (declarative attribute)
	// so the listener wouldn't get torn down the way LoginForm/RegisterForm did,
	// but the public `el` prop is still unsafe for consumers that bind it after
	// any parent re-render — same fix for consistency.
	let formEl = $state<HTMLFormElement | undefined>();
	$effect(() => {
		el = formEl;
	});

	let code = $state("");
	let cooldownRemaining = $state(0);
	let resentFlash = $state(false);
	let isResending = $state(false);
	let cooldownTimer: ReturnType<typeof setInterval> | null = null;
	let resentFlashTimer: ReturnType<typeof setTimeout> | null = null;

	function clearTimers() {
		if (cooldownTimer) {
			clearInterval(cooldownTimer);
			cooldownTimer = null;
		}
		if (resentFlashTimer) {
			clearTimeout(resentFlashTimer);
			resentFlashTimer = null;
		}
	}

	onDestroy(clearTimers);

	const HTML_ESCAPES: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	};

	function escapeHtml(s: string): string {
		return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
	}

	let subheadingHtml = $derived(
		t("email_verify_form.subheading", {
			email: `<strong>${escapeHtml(email ?? "")}</strong>`,
		})
	);

	function startCooldown() {
		cooldownRemaining = resendCooldownSeconds;
		if (cooldownTimer) clearInterval(cooldownTimer);
		cooldownTimer = setInterval(() => {
			cooldownRemaining -= 1;
			if (cooldownRemaining <= 0) {
				cooldownRemaining = 0;
				if (cooldownTimer) {
					clearInterval(cooldownTimer);
					cooldownTimer = null;
				}
			}
		}, 1000);
	}

	function flashResent() {
		resentFlash = true;
		if (resentFlashTimer) clearTimeout(resentFlashTimer);
		resentFlashTimer = setTimeout(() => {
			resentFlash = false;
			resentFlashTimer = null;
		}, 3000);
	}

	async function handleResendClick() {
		if (!onResend) return;
		if (cooldownRemaining > 0 || isResending) return;
		isResending = true;
		try {
			await onResend();
			flashResent();
			startCooldown();
		} finally {
			isResending = false;
		}
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (isSubmitting) return;
		if (code.length !== codeLength) return;
		onSubmit(code);
	}

	$effect(() => {
		if (error && notifications) notifications.error(error);
	});

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-email-verify-form", classProp)
	);

	let submitDisabled = $derived(code.length !== codeLength || isSubmitting);
</script>

<form bind:this={formEl} class={_class} onsubmit={handleFormSubmit} {...rest}>
	<!-- Heading -->
	{#if heading !== false}
		<H level={2} class={unstyled ? undefined : "stuic-email-verify-form-heading"}>
			{typeof heading === "string" ? heading : t("email_verify_form.heading")}
		</H>
	{/if}

	<!-- Subheading with bolded email -->
	<p class={unstyled ? undefined : "stuic-email-verify-form-subheading"}>
		<!-- email is HTML-escaped before substitution; the surrounding template is i18n-controlled -->
		{@html subheadingHtml}
	</p>

	<!-- General error alert -->
	<DismissibleMessage message={error} intent="destructive" onDismiss={false} />

	<!-- OTP input -->
	<div class={unstyled ? undefined : "stuic-email-verify-form-otp"}>
		<OtpInput
			bind:value={code}
			length={codeLength}
			onComplete={(c) => onSubmit(c)}
			error={!!error}
			disabled={isSubmitting}
			{...otpInputProps}
		/>
	</div>

	<!-- Attempts remaining hint -->
	{#if attemptsRemaining != null}
		<small class={unstyled ? undefined : "stuic-email-verify-form-attempts"}>
			{t("email_verify_form.attempts_remaining", { count: attemptsRemaining })}
		</small>
	{/if}

	<!-- Submit button -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: submitDisabled })}
	{:else}
		<div class={unstyled ? undefined : "stuic-email-verify-form-submit"}>
			<Button
				intent="primary"
				type="submit"
				disabled={submitDisabled}
				class="w-full"
			>
				{isSubmitting
					? t("email_verify_form.submitting")
					: t("email_verify_form.submit")}
			</Button>
		</div>
	{/if}

	<!-- Resend control -->
	{#if onResend}
		<div class={unstyled ? undefined : "stuic-email-verify-form-resend"}>
			{#if cooldownRemaining > 0}
				<span class={unstyled ? undefined : "stuic-email-verify-form-resend-cooldown"}>
					{t("email_verify_form.resend_cooldown", { seconds: cooldownRemaining })}
				</span>
			{:else if resentFlash}
				<span class={unstyled ? undefined : "stuic-email-verify-form-resend-flash"}>
					{t("email_verify_form.resent")}
				</span>
			{:else}
				<span>{t("email_verify_form.resend_prompt")}</span>
				<Button
					variant="link"
					type="button"
					size="sm"
					onclick={handleResendClick}
					disabled={isResending}
				>
					{t("email_verify_form.resend")}
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
