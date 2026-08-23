<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as FieldInputProps } from "../Input/FieldInput.svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
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

		/**
		 * Consumer-owned reason to refuse submission which is neither "submitting"
		 * nor a field error — e.g. an external identity whose server-side TTL has
		 * lapsed, an unchecked terms box rendered in `extraFieldsSlot`, or an async
		 * availability check still in flight.
		 *
		 * Disables the default CTA, is reflected in the `submitButton` snippet
		 * payload, and also prevents `onSubmit` from firing at all — so a custom
		 * `submitButton` which ignores `disabled` still cannot post. Default: false
		 */
		submitDisabled?: boolean;

		/** Field-specific validation errors (e.g., from server) */
		errors?: RegisterFormValidationError[];

		/**
		 * General error message (not field-specific).
		 * Rendered as an alert box above the form.
		 * Example: "Email already registered"
		 */
		error?: string;

		/**
		 * Render the built-in email field. When false the field is UNMOUNTED (not
		 * hidden) and skipped by validation — use it when the account identity is
		 * established elsewhere (OAuth provider, invite token, magic link) and pair
		 * it with `credentialsSlot`. Default: true
		 */
		showEmail?: boolean;

		/**
		 * Render the built-in password field. When false it (and, transitively, the
		 * confirm field) is UNMOUNTED and skipped by validation — e.g. passwordless
		 * / identity-first signup. Default: true
		 */
		showPassword?: boolean;

		/**
		 * Show password confirmation field. Subordinate to `showPassword`:
		 * `showPassword={false}` implies no confirm field regardless. Default: true
		 */
		showPasswordConfirm?: boolean;

		/** Minimum password length. Fed into FieldInput `minlength` + validator. Default: 8 */
		passwordMinLength?: number;

		/**
		 * Rendered at the credentials position — after whatever core fields are
		 * still shown, before the bottom-position extra fields.
		 *
		 * Combined with `showEmail` / `showPassword` = false this REPLACES the
		 * credential block: use it for an identity established elsewhere ("Signed
		 * in as x@y.z — change / use a password instead"), an invite summary, or a
		 * magic-link explainer. Receives `formData` and a `fieldError(name)` lookup.
		 */
		credentialsSlot?: Snippet<
			[
				{
					formData: RegisterFormData;
					fieldError: (name: string) => string | undefined;
				},
			]
		>;

		/**
		 * Passthrough props merged onto the built-in email `FieldInput`, applied
		 * AFTER the component's own — so `label`, `placeholder`, `description`,
		 * `autocomplete`, `renderSize`, `classInput`… are overridable without
		 * supplying a full `t`.
		 *
		 * `validate` is composed rather than replaced: your `customValidator` runs
		 * when there is no server/internal error for the field, so the `errors`
		 * wiring can't be knocked out by accident (`validate: false` is ignored for
		 * the same reason). `value` is ignored — the field is bound to `formData`.
		 */
		emailFieldProps?: Partial<FieldInputProps>;

		/** Passthrough props for the built-in password field. See `emailFieldProps`. */
		passwordFieldProps?: Partial<FieldInputProps>;

		/** Passthrough props for the built-in confirm field. See `emailFieldProps`. */
		passwordConfirmFieldProps?: Partial<FieldInputProps>;

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
		 * Where the social block sits relative to the credentials:
		 * - `"bottom"` (default) — after the CTA, divider ABOVE the buttons
		 * - `"top"` — between the top-position extra fields and the credentials,
		 *   divider BELOW the buttons
		 *
		 * `"top"` suits identity-first signup, where the provider button is an
		 * alternative to the credentials only — fields required on both paths
		 * (workspace id, invite code…) stay above the choice. Default: "bottom"
		 */
		socialPosition?: "top" | "bottom";

		/**
		 * Override the divider label next to the social login buttons.
		 * Default: i18n key "register_form.social_divider" ("or continue with") at
		 * the bottom position, "register_form.social_divider_alt" ("or") at the top
		 * one — where the divider faces the credentials, so "or continue with"
		 * would read backwards.
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
	import { untrack } from "svelte";
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
	import {
		scrollToFirstInvalidField,
		validateAllFields,
	} from "../../utils/validate-fields.js";

	let {
		formData = $bindable(createEmptyRegisterFormData()),
		onSubmit,
		isSubmitting = false,
		submitDisabled = false,
		errors: externalErrors = [],
		error,
		notifications,
		showEmail = true,
		showPassword = true,
		showPasswordConfirm = true,
		passwordMinLength = 8,
		credentialsSlot,
		emailFieldProps,
		passwordFieldProps,
		passwordConfirmFieldProps,
		extraFields = [],
		extraFieldsSlot,
		submitLabel,
		submittingLabel,
		submitButton,
		socialLogins,
		socialPosition = "bottom",
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
	// when the parent re-renders without binding `el`. See LoginForm for the full
	// rationale — same Svelte 5 `$bindable` + `bind:this` gotcha applies here.
	let formEl = $state<HTMLFormElement | undefined>();
	$effect(() => {
		el = formEl;
	});

	let topFields = $derived(extraFields.filter((f) => f.position === "top"));
	let bottomFields = $derived(extraFields.filter((f) => f.position !== "top"));

	// `showPasswordConfirm` is subordinate to `showPassword` — a confirm field
	// without the password it confirms is meaningless (and would still be
	// validated against it).
	let renderPasswordConfirm = $derived(showPassword && showPasswordConfirm);

	// Internal validation errors (set on submit)
	let internalErrors = $state<RegisterFormValidationError[]>([]);

	// Clear internal field errors as soon as the user edits any tracked field, so a
	// previous failed-submit's errors don't linger after the user has fixed them.
	// Re-validation on the next submit will repopulate `internalErrors` if anything
	// is still wrong. `untrack` for the read+write so this effect only re-runs on
	// formData changes — otherwise `handleSubmitValid` setting `internalErrors`
	// would immediately re-fire this effect and wipe the errors back out.
	$effect(() => {
		void formData.email;
		void formData.password;
		void formData.passwordConfirm;
		for (const f of extraFields) void formData.extra?.[f.name];
		untrack(() => {
			if (internalErrors.length) internalErrors = [];
		});
	});

	// Seed `RegisterFieldConfig.initialValue` into `formData.extra`. `extraValue()`
	// only ever used it as a *display* fallback, so an untouched field with a
	// required `initialValue` failed validation ("… is required") while its value
	// sat plainly visible in the input, and an untouched optional one submitted
	// `undefined`. Never clobbers a value the consumer already provided.
	// `.pre` so the seed lands before the first paint; the bare `formData.extra`
	// read tracks a wholesale replacement of the container (which would drop the
	// seeds) without tracking the per-key writes below, so it converges.
	$effect.pre(() => {
		const seeds = extraFields
			.filter((f) => f.initialValue != null)
			.map((f) => [f.name, f.initialValue] as const);
		void formData.extra;
		if (!seeds.length) return;
		untrack(() => {
			if (!formData.extra) formData.extra = {};
			for (const [name, initialValue] of seeds) {
				if (formData.extra[name] == null) formData.extra[name] = initialValue;
			}
		});
	});

	// --- server-supplied (`errors`) staleness ---------------------------------
	//
	// `errors` is consumer-owned: this form can render it but cannot clear it.
	// That used to wedge the form permanently — the per-field `customValidator`
	// kept reporting the server error no matter what the user typed, so
	// `onSubmitValidityCheck` routed every subsequent submit to `submit_invalid`
	// and `onSubmit` was never called again. The consumer's own "clear errors on
	// submit" code could not help: their submit handler is exactly what was being
	// suppressed.
	//
	// Fix: remember the field values that were on screen when a set of errors was
	// delivered. An error on a field this form renders stays "live" while that
	// field still holds that value, and goes stale once the user edits it —
	// dropped from the inline messages AND from the submit gate. Same lifecycle
	// `internalErrors` already have. (Typing the rejected value back in makes it
	// live again, which is correct: that exact value is known-bad.) Errors on
	// anything else keep their old, blocking-until-you-clear-it behavior.

	/** Content (not array identity, not order) of the external errors. */
	function _errorsKey(errs: RegisterFormValidationError[]): string {
		return JSON.stringify(errs.map((e) => [e.field, e.message]).sort());
	}

	/** Is this error's field one this form renders — i.e. can the user fix it here? */
	function _isRenderedField(field: string): boolean {
		if (field === "email") return showEmail;
		if (field === "password") return showPassword;
		if (field === "passwordConfirm") return renderPasswordConfirm;
		return extraFields.some((f) => f.name === field);
	}

	/** Comparable current value for a rendered field's name. */
	function _valueOf(field: string): string {
		if (field === "email") return formData.email ?? "";
		if (field === "password") return formData.password ?? "";
		if (field === "passwordConfirm") return formData.passwordConfirm ?? "";
		const v = formData.extra?.[field];
		return v == null ? "" : String(v);
	}

	// Reassigned wholesale, never mutated — that is what makes it reactive, so a
	// plain Map is correct here (SvelteMap would only add overhead).
	let errorsSnapshot = $state.raw<Map<string, string>>(new Map());

	// Set when `onSubmit` actually fires; cleared when a new snapshot is taken.
	// Lets an IDENTICAL error redelivered after a resubmit count as a fresh
	// delivery (its content key is unchanged, so content comparison alone would
	// wrongly keep suppressing it). Deliberately NOT `$state`: it must not
	// re-trigger the snapshot effect below.
	let _submittedSinceSnapshot = false;
	let _lastErrorsKey: string | null = null;

	// Snapshot on delivery. Keyed on the errors' CONTENT, not the array identity —
	// consumers routinely pass an inline literal / freshly derived array, whose
	// identity changes on every parent re-render; re-snapshotting mid-typing would
	// resurrect the error and restore the deadlock.
	$effect(() => {
		const key = _errorsKey(externalErrors);
		untrack(() => {
			if (key === _lastErrorsKey && !_submittedSinceSnapshot) return;
			_lastErrorsKey = key;
			_submittedSinceSnapshot = false;
			const snap = new Map<string, string>();
			for (const e of externalErrors) {
				if (_isRenderedField(e.field)) snap.set(e.field, _valueOf(e.field));
			}
			errorsSnapshot = snap;
		});
	});

	let liveExternalErrors = $derived(
		externalErrors.filter((e) => {
			// An error on a field this form does NOT render is the consumer's to
			// show (via `fieldError()` inside their own slot) and the consumer's to
			// clear — there is no edit here that could answer it. It keeps blocking,
			// exactly as it always has. Only errors the user can actually act on
			// self-clear; anything else would let the form post past a block the
			// consumer deliberately set (an unchecked terms box, a failed captcha).
			if (!_isRenderedField(e.field)) return true;
			const snapped = errorsSnapshot.get(e.field);
			// no snapshot yet (first paint, before the effect above runs) => live
			return snapped === undefined || snapped === _valueOf(e.field);
		})
	);

	// Merge internal + external errors; external takes precedence per field
	let allErrors = $derived.by(() => {
		const map = new Map<string, string>();
		for (const e of internalErrors) map.set(e.field, e.message);
		for (const e of liveExternalErrors) map.set(e.field, e.message);
		return [...map.entries()].map(([field, message]) => ({ field, message }));
	});

	function fieldError(field: string): string | undefined {
		return allErrors.find((e) => e.field === field)?.message;
	}

	// Core-field passthrough. `validate` is pulled out of the spread and composed
	// instead of overwritten: silently replacing it would remove the only render
	// path for `errors` while the submit gate still blocks — i.e. reintroduce the
	// very deadlock above, invisibly. (No type can guard this: FieldInput's Props
	// extend `Record<string, any>`, so `Omit` is a no-op there.)
	function _fieldProps(p: Partial<FieldInputProps> | undefined) {
		if (!p) return undefined;
		const { validate: _ignored, value: _bound, ...rest } = p;
		return rest;
	}

	function _fieldValidate(field: string, p: Partial<FieldInputProps> | undefined) {
		const own = p?.validate && typeof p.validate === "object" ? p.validate : undefined;
		return {
			...own,
			customValidator(
				...args: Parameters<NonNullable<ValidateOptions["customValidator"]>>
			) {
				return fieldError(field) || own?.customValidator?.(...args) || "";
			},
		};
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
		// Hard block, not just a disabled CTA — a custom `submitButton` that ignores
		// the payload's `disabled` must not post either (nor post twice).
		if (submitDisabled || isSubmitting) return;

		const validationErrors = validateRegisterForm(formData, t, extraFields, {
			showEmail,
			showPassword,
			showPasswordConfirm,
			passwordMinLength,
		});
		internalErrors = validationErrors;

		if (validationErrors.length === 0 && liveExternalErrors.length === 0) {
			_submittedSinceSnapshot = true;
			onSubmit(formData);
		}
	}

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

	let _class = $derived(unstyled ? classProp : twMerge("stuic-register-form", classProp));

	// Imperative API ----------------------------------------------------------
	// Extra-field refs are keyed by `cfg.name`, NOT by `{#each}` index: the each
	// block is keyed by name, so an index-based array pointed at the wrong
	// component after any reorder — and `focusField()` wants the by-name map anyway.
	let extraFieldRefs = $state<Record<string, FieldInput | undefined>>({});
	let emailField = $state<FieldInput>();
	let passwordField = $state<FieldInput>();
	let passwordConfirmField = $state<FieldInput>();

	/** Currently rendered fields, in display order. */
	function _fields() {
		return [
			...topFields.map((f) => extraFieldRefs[f.name]),
			...(showEmail ? [emailField] : []),
			...(showPassword ? [passwordField] : []),
			...(renderPasswordConfirm ? [passwordConfirmField] : []),
			...bottomFields.map((f) => extraFieldRefs[f.name]),
		];
	}

	/** Currently rendered field by name, or undefined. */
	function _fieldByName(name: string): FieldInput | undefined {
		if (name === "email") return showEmail ? emailField : undefined;
		if (name === "password") return showPassword ? passwordField : undefined;
		if (name === "passwordConfirm")
			return renderPasswordConfirm ? passwordConfirmField : undefined;
		return extraFields.some((f) => f.name === name) ? extraFieldRefs[name] : undefined;
	}

	// Surface a newly-arrived error message without waiting for the user's next
	// interaction. Inline messages are rendered by each field's own validation run
	// (the `validate` action fires on change/blur), so an error that appears AFTER
	// the validators last ran stayed invisible until the next keystroke or CTA
	// click. That hit both sources: `validateRegisterForm`'s result, which is
	// computed on `submit_valid` — i.e. after the validity walk has already run
	// every field's validator — and a server `errors` delivery, which lands once
	// the submit is over. Either way the first click produced a button that did
	// nothing, with no message anywhere. `untrack` so this only re-runs when the
	// error set itself changes.
	$effect(() => {
		const named = allErrors.map((e) => e.field);
		if (!named.length) return;
		untrack(() => {
			for (const name of named) _fieldByName(name)?.validate?.();
		});
	});

	/**
	 * Run every field's validator and render any inline errors. Returns true
	 * if all fields are valid. Useful from custom submit handlers.
	 */
	export function validate(): boolean {
		// A consumer running their own submit path calls this instead of going
		// through `handleSubmitValid`, so it has to arm the same "a round-trip is
		// starting" flag — otherwise a byte-identical repeat rejection would be
		// mistaken for the previous, already-answered one and stay suppressed.
		_submittedSinceSnapshot = true;
		return validateAllFields(_fields());
	}

	/**
	 * Scroll the first invalid field into view and focus it. Returns true
	 * if a field was scrolled. Call after `validate()`.
	 */
	export function scrollToFirstError(
		opts?: Parameters<typeof scrollToFirstInvalidField>[1]
	): boolean {
		return scrollToFirstInvalidField(_fields(), opts);
	}

	/**
	 * Focus a field by name: "email" | "password" | "passwordConfirm", or any
	 * `extraFields` name (core names win on a collision). Returns false if the
	 * field is not currently rendered.
	 *
	 * Useful when the credential block is swapped out under the user (the control
	 * they last touched unmounts, so focus would otherwise fall to `<body>`), or
	 * to put the cursor in a field the server rejected — `scrollToFirstError()` is
	 * the wrong tool there, it depends on the internal validator having failed.
	 */
	export function focusField(name: string): boolean {
		const field = _fieldByName(name);
		if (!field?.focus) return false;
		field.focus();
		return true;
	}
</script>

{#snippet socialDivider(position: "top" | "bottom")}
	<div class={unstyled ? undefined : "stuic-register-form-social-divider"}>
		<span>
			{typeof socialDividerLabel === "string"
				? socialDividerLabel
				: t(
						position === "top"
							? "register_form.social_divider_alt"
							: "register_form.social_divider"
					)}
		</span>
	</div>
{/snippet}

<!--
	Same markup from either position — only the divider flips sides, so it always
	faces the credentials: above the buttons when "bottom", below them when "top".
-->
{#snippet socialBlock(position: "top" | "bottom")}
	{#if socialLogins}
		<div
			class={unstyled ? undefined : "stuic-register-form-social"}
			data-position={unstyled ? undefined : position}
		>
			{#if socialDividerLabel !== false && position === "bottom"}
				{@render socialDivider(position)}
			{/if}
			<div class={unstyled ? undefined : "stuic-register-form-social-buttons"}>
				{@render socialLogins()}
			</div>
			{#if socialDividerLabel !== false && position === "top"}
				{@render socialDivider(position)}
			{/if}
		</div>
	{/if}
{/snippet}

<form bind:this={formEl} class={_class} use:onSubmitValidityCheck novalidate {...rest}>
	<!-- General error alert -->
	<DismissibleMessage message={error} intent="destructive" />

	<!-- Top-position extra fields -->
	{#each topFields as cfg (cfg.name)}
		<FieldInput
			bind:this={extraFieldRefs[cfg.name]}
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

	<!-- Social logins above the credentials -->
	{#if socialPosition === "top"}
		{@render socialBlock("top")}
	{/if}

	<!--
			The per-field `binding_property_non_reactive` ignores below are deliberate:
			formData is a $bindable prop — deep reactivity depends on the consumer
			passing a $state() object. The bindings work correctly regardless.
			(Do not start this comment with the ignore directive itself — every
			following word would be parsed as another, bogus, ignore code.)
		-->
	<!-- Email -->
	{#if showEmail}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={emailField}
			bind:value={formData.email}
			label={t("register_form.email_label")}
			type="email"
			placeholder={t("register_form.email_placeholder")}
			autocomplete="email"
			required
			name="register-email"
			labelLeftBreakpoint={0}
			validate={_fieldValidate("email", emailFieldProps)}
			{..._fieldProps(emailFieldProps)}
		/>
	{/if}

	<!-- Password -->
	{#if showPassword}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={passwordField}
			bind:value={formData.password}
			label={t("register_form.password_label")}
			autocomplete="new-password"
			type="password"
			placeholder={t("register_form.password_placeholder")}
			required
			minlength={passwordMinLength}
			name="register-password"
			labelLeftBreakpoint={0}
			validate={_fieldValidate("password", passwordFieldProps)}
			{..._fieldProps(passwordFieldProps)}
		/>
	{/if}

	<!-- Password confirm -->
	{#if renderPasswordConfirm}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={passwordConfirmField}
			bind:value={formData.passwordConfirm}
			label={t("register_form.password_confirm_label")}
			autocomplete="new-password"
			type="password"
			placeholder={t("register_form.password_confirm_placeholder")}
			required
			minlength={passwordMinLength}
			name="register-password-confirm"
			labelLeftBreakpoint={0}
			validate={_fieldValidate("passwordConfirm", passwordConfirmFieldProps)}
			{..._fieldProps(passwordConfirmFieldProps)}
		/>
	{/if}

	<!-- Credentials slot — replaces the credential block in identity-first flows.
	     Wrapped so it inherits the same bottom rhythm the fields have (the form is
	     a zero-gap flex column); the class is the hook for changing that. -->
	{#if credentialsSlot}
		<div class={unstyled ? undefined : "stuic-register-form-credentials"}>
			{@render credentialsSlot({ formData, fieldError })}
		</div>
	{/if}

	<!-- Bottom-position extra fields (default) -->
	{#each bottomFields as cfg (cfg.name)}
		<FieldInput
			bind:this={extraFieldRefs[cfg.name]}
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
		{@render submitButton({ isSubmitting, disabled: isSubmitting || submitDisabled })}
	{:else}
		<div class={unstyled ? undefined : "stuic-register-form-submit"}>
			<Button
				intent="primary"
				type="submit"
				disabled={isSubmitting || submitDisabled}
				class="w-full"
			>
				{isSubmitting
					? (submittingLabel ?? t("register_form.submitting"))
					: (submitLabel ?? t("register_form.submit"))}
			</Button>
		</div>
	{/if}

	<!-- Social logins below the CTA (default) -->
	{#if socialPosition !== "top"}
		{@render socialBlock("bottom")}
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
