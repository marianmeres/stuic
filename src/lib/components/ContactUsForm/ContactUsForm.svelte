<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		ContactBotCheck,
		ContactFieldConfig,
		ContactFormData,
		ContactFormValidationError,
	} from "./_internal/contact-form-types.js";
	import type { NotificationsStack } from "../Notifications/notifications-stack.svelte.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFormElement>, "children"> {
		/** Bindable contact data. Default: createEmptyContactFormData() */
		formData?: ContactFormData;

		/**
		 * Called on submit after client-side validation passes.
		 * `botCheck` carries the anti-bot signals (report-only — enforce them
		 * server-side; the form never blocks a submit because of them).
		 */
		onSubmit: (data: ContactFormData, botCheck: ContactBotCheck) => void;

		/** Whether the form is currently submitting (disables CTA). */
		isSubmitting?: boolean;

		/** Field-specific validation errors (e.g. from the server). */
		errors?: ContactFormValidationError[];

		/**
		 * General error message (not field-specific). Rendered as an alert box
		 * above the form. Example: "Something went wrong, please try again."
		 */
		error?: string;

		/** Show the Name field. Default: false */
		showName?: boolean;
		/** Require the Name field (only applies when shown). Default: true */
		requireName?: boolean;
		/** Show the Phone field. Default: false */
		showPhone?: boolean;
		/** Require the Phone field (only applies when shown). Default: false */
		requirePhone?: boolean;
		/** Show the Subject field. Default: false */
		showSubject?: boolean;
		/** Require the Subject field (only applies when shown). Default: false */
		requireSubject?: boolean;
		/**
		 * When provided (non-empty), the Subject renders as a `<select>` of these
		 * values instead of a free-text input, and the subject field is shown
		 * regardless of `showSubject`. A blank "select…" prompt is prepended so the
		 * initial empty value isn't silently auto-selected. The bound value is still
		 * the chosen string in `formData.subject`.
		 */
		subjectValues?: string[];
		/** Show the Company field. Default: false */
		showCompany?: boolean;
		/** Require the Company field (only applies when shown). Default: false */
		requireCompany?: boolean;
		/** Minimum message length. 0 (default) disables the check. */
		messageMinLength?: number;

		/**
		 * Declarative extra fields rendered as FieldInput entries.
		 * Values bind into `formData.extra[name]`.
		 */
		extraFields?: ContactFieldConfig[];

		/**
		 * Escape hatch for non-FieldInput extras (consent checkbox, custom widgets).
		 * Rendered after the declarative extras and before the submit button.
		 * Receives `formData` (bindable) and a `fieldError(name)` lookup.
		 */
		extraFieldsSlot?: Snippet<
			[
				{
					formData: ContactFormData;
					fieldError: (name: string) => string | undefined;
				},
			]
		>;

		/** Render the hidden honeypot trap. Default: true */
		useHoneypot?: boolean;
		/**
		 * Honeypot field name — tempting to bots but NOT a browser-autofill token
		 * (avoid url/website/email/name/phone/address). Default: "link".
		 */
		honeypotName?: string;
		/** Render the time-trap (rejects suspiciously fast submits). Default: true */
		useTimeTrap?: boolean;
		/** Minimum expected fill time (ms) before a submit looks human. Default: 2000 */
		timeTrapMinMs?: number;

		/** Override CTA label. */
		submitLabel?: string;
		/** Override CTA label while submitting. */
		submittingLabel?: string;
		/** Override the CTA section. */
		submitButton?: Snippet<[{ isSubmitting: boolean; disabled: boolean }]>;

		/** Content below the form (legal text, alternative contact links, etc.). */
		footer?: Snippet;

		/** Optional notifications instance — `error` is also sent via notifications.error(). */
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
	import { t_default } from "./_internal/contact-form-i18n-defaults.js";
	import {
		createEmptyContactFormData,
		validateContactForm,
	} from "./_internal/contact-form-utils.js";
	import Button from "../Button/Button.svelte";
	import DismissibleMessage from "../DismissibleMessage/DismissibleMessage.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldSelect from "../Input/FieldSelect.svelte";
	import FieldTextarea from "../Input/FieldTextarea.svelte";
	import Honeypot from "../Input/Honeypot.svelte";
	import TimeTrap from "../Input/TimeTrap.svelte";
	import { onSubmitValidityCheck } from "../../actions/on-submit-validity-check.svelte.js";
	import {
		scrollToFirstInvalidField,
		validateAllFields,
	} from "../../utils/validate-fields.js";
	import {
		createExternalFieldErrors,
		repaintFieldErrors,
	} from "../../utils/field-errors.svelte.js";

	let {
		formData = $bindable(createEmptyContactFormData()),
		onSubmit,
		isSubmitting = false,
		errors: externalErrors = [],
		error,
		showName = false,
		requireName = true,
		showPhone = false,
		requirePhone = false,
		showSubject = false,
		requireSubject = false,
		subjectValues,
		showCompany = false,
		requireCompany = false,
		messageMinLength = 0,
		extraFields = [],
		extraFieldsSlot,
		useHoneypot = true,
		honeypotName = "link",
		useTimeTrap = true,
		timeTrapMinMs = 2000,
		submitLabel,
		submittingLabel,
		submitButton,
		footer,
		notifications,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	// Mirror the form ref into local $state so it survives prop re-application
	// when the parent re-renders without binding `el`. Same Svelte 5 `$bindable`
	// + `bind:this` gotcha that LoginForm / RegisterForm document.
	let formEl = $state<HTMLFormElement | undefined>();
	$effect(() => {
		el = formEl;
	});

	let topFields = $derived(extraFields.filter((f) => f.position === "top"));
	let bottomFields = $derived(extraFields.filter((f) => f.position !== "top"));

	// Subject: render a <select> when subjectValues is non-empty (which also shows
	// the field regardless of showSubject); otherwise a free-text input gated by
	// showSubject. The select gets a prepended blank "prompt" option so the initial
	// empty subject isn't silently auto-selected to the first real value.
	let subjectAsSelect = $derived((subjectValues?.length ?? 0) > 0);
	let subjectShown = $derived(showSubject || subjectAsSelect);
	let subjectOptions = $derived([
		{ label: t("contact_form.subject_select_prompt"), value: "" },
		...(subjectValues ?? []).map((v) => ({ label: v, value: v })),
	]);

	// Bot-protection state (kept out of formData — surfaced via botCheck).
	let honeypotValue = $state("");
	let timeTrap = $state<TimeTrap>();
	let ttTooFast = $state(true);
	let ttElapsed = $state(0);

	// Internal validation errors (set on submit).
	let internalErrors = $state<ContactFormValidationError[]>([]);

	// Clear internal field errors as soon as the user edits any tracked field, so
	// a previous failed submit's errors don't linger after the user has fixed
	// them. `untrack` the read+write so this effect re-runs only on formData
	// changes (not when handleSubmitValid sets internalErrors).
	$effect(() => {
		void formData.name;
		void formData.email;
		void formData.phone;
		void formData.subject;
		void formData.company;
		void formData.message;
		for (const f of extraFields) void formData.extra?.[f.name];
		untrack(() => {
			if (internalErrors.length) internalErrors = [];
		});
	});

	// Seed `ContactFieldConfig.initialValue` into `formData.extra`. `extraValue()`
	// only ever used it as a *display* fallback, so an untouched field with a
	// required `initialValue` failed validation ("… is required") while its value
	// sat plainly visible in the input, and an untouched optional one submitted
	// `undefined`. Never clobbers a value the consumer already provided. `.pre` so
	// the seed lands before first paint; the bare `formData.extra` read tracks a
	// wholesale replacement of the container without tracking the per-key writes.
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

	// Give the consumer-owned `errors` prop a lifecycle: an entry for a field this
	// form renders self-clears once the user edits it, instead of wedging the form
	// forever (the field's customValidator kept reporting it, so every later
	// submit was routed to `submit_invalid` — including the consumer's own handler
	// that would have cleared the errors). Entries for anything else keep blocking
	// until the consumer drops them. See `createExternalFieldErrors`.
	const external = createExternalFieldErrors({
		errors: () => externalErrors,
		isRendered(field) {
			if (field === "name") return showName;
			if (field === "phone") return showPhone;
			if (field === "subject") return subjectShown;
			if (field === "company") return showCompany;
			if (field === "email" || field === "message") return true;
			return extraFields.some((f) => f.name === field);
		},
		valueOf(field) {
			switch (field) {
				case "name":
					return formData.name ?? "";
				case "email":
					return formData.email ?? "";
				case "phone":
					return formData.phone ?? "";
				case "subject":
					return formData.subject ?? "";
				case "company":
					return formData.company ?? "";
				case "message":
					return formData.message ?? "";
				default: {
					const v = formData.extra?.[field];
					return v == null ? "" : String(v);
				}
			}
		},
	});

	// Merge internal + external errors; external takes precedence per field.
	let allErrors = $derived.by(() => {
		const map = new Map<string, string>();
		for (const e of internalErrors) map.set(e.field, e.message);
		for (const e of external.live) map.set(e.field, e.message);
		return [...map.entries()].map(([field, message]) => ({ field, message }));
	});

	function fieldError(field: string): string | undefined {
		return allErrors.find((e) => e.field === field)?.message;
	}

	function extraValue(cfg: ContactFieldConfig): string {
		const v = formData.extra?.[cfg.name];
		if (v == null) return typeof cfg.initialValue === "string" ? cfg.initialValue : "";
		return typeof v === "string" ? v : String(v);
	}

	function setExtraValue(cfg: ContactFieldConfig, value: string) {
		if (!formData.extra) formData.extra = {};
		formData.extra[cfg.name] = value;
	}

	function buildBotCheck(): ContactBotCheck {
		const snap = useTimeTrap
			? (timeTrap?.check() ?? { elapsedMs: ttElapsed, isTooFast: ttTooFast })
			: { elapsedMs: 0, isTooFast: false };
		const honeypot = useHoneypot ? honeypotValue : "";
		const honeypotFilled = useHoneypot && honeypot.trim() !== "";
		const isTooFast = useTimeTrap && !!snap.isTooFast;
		return {
			honeypot,
			honeypotFilled,
			elapsedMs: snap.elapsedMs ?? 0,
			isTooFast,
			minMs: timeTrapMinMs,
			isLikelyBot: honeypotFilled || isTooFast,
		};
	}

	function handleSubmitValid() {
		const validationErrors = validateContactForm(formData, t, {
			showName,
			requireName,
			showPhone,
			requirePhone,
			showSubject: subjectShown,
			requireSubject,
			showCompany,
			requireCompany,
			messageMinLength,
			extraFields,
		});
		internalErrors = validationErrors;

		// Report-only on bot signals: we still submit when field validation passes
		// and hand the consumer the botCheck to enforce server-side.
		if (validationErrors.length === 0 && external.live.length === 0) {
			external.markSubmitted();
			onSubmit(formData, buildBotCheck());
		}
	}

	$effect(() => {
		if (error && notifications) notifications.error(error);
	});

	// onSubmitValidityCheck intercepts native submit and dispatches "submit_valid".
	// Bind to `formEl` (local state) — NOT the `el` prop, which can revert to
	// undefined on parent re-render and would silently detach the listener.
	$effect(() => {
		const node = formEl;
		if (!node) return;
		node.addEventListener("submit_valid", handleSubmitValid);
		return () => node.removeEventListener("submit_valid", handleSubmitValid);
	});

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-contact-us-form", classProp)
	);

	// Imperative API ----------------------------------------------------------
	// Extra-field refs are keyed by `cfg.name`, NOT by `{#each}` index: the each
	// block is keyed by name, so an index-based array pointed at the wrong
	// component after any reorder of `extraFields`.
	let extraFieldRefs = $state<Record<string, FieldInput | undefined>>({});
	let nameField = $state<FieldInput>();
	let emailField = $state<FieldInput>();
	let phoneField = $state<FieldInput>();
	let companyField = $state<FieldInput>();
	let subjectField = $state<FieldInput | FieldSelect>();
	let messageField = $state<FieldTextarea>();

	function _fields() {
		return [
			...topFields.map((f) => extraFieldRefs[f.name]),
			...(showName ? [nameField] : []),
			emailField,
			...(showPhone ? [phoneField] : []),
			...(showCompany ? [companyField] : []),
			...(subjectShown ? [subjectField] : []),
			messageField,
			...bottomFields.map((f) => extraFieldRefs[f.name]),
		];
	}

	function _fieldByName(name: string) {
		switch (name) {
			case "name":
				return showName ? nameField : undefined;
			case "email":
				return emailField;
			case "phone":
				return showPhone ? phoneField : undefined;
			case "company":
				return showCompany ? companyField : undefined;
			case "subject":
				return subjectShown ? subjectField : undefined;
			case "message":
				return messageField;
			default:
				return extraFields.some((f) => f.name === name)
					? extraFieldRefs[name]
					: undefined;
		}
	}

	// Paint newly-arrived error messages without waiting for the user's next
	// interaction. `validateContactForm` runs on `submit_valid` — after the
	// validity walk has already re-run every field's validator — and a server
	// `errors` delivery lands once the submit is over, so without this the first
	// failed click was a button that did nothing, with no message anywhere.
	repaintFieldErrors(() => allErrors, _fieldByName);

	/**
	 * Run every visible field's validator and render any inline errors. Returns
	 * true if all fields are valid. Useful from custom submit handlers.
	 */
	export function validate(): boolean {
		// Consumers posting from their own handler never reach `handleSubmitValid`,
		// so this has to arm the same "a round-trip is starting" flag.
		external.markSubmitted();
		return validateAllFields(_fields());
	}

	/**
	 * Scroll the first invalid field into view and focus it. Returns true if a
	 * field was scrolled. Call after `validate()`.
	 */
	export function scrollToFirstError(
		opts?: Parameters<typeof scrollToFirstInvalidField>[1]
	): boolean {
		return scrollToFirstInvalidField(_fields(), opts);
	}
</script>

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
			name={`contact-extra-${cfg.name}`}
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError(cfg.name) || "";
				},
			}}
			{...cfg.props}
		/>
	{/each}

	<!--
		NOTE on `binding_property_non_reactive`: formData is a $bindable prop — deep
		reactivity depends on the consumer passing a $state() object. The bindings
		work correctly regardless; the per-field directives below silence the hint.
		(This block intentionally does NOT start with the literal directive word so
		it isn't parsed as one.)
	-->
	<!-- Name -->
	{#if showName}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={nameField}
			bind:value={formData.name}
			label={t("contact_form.name_label")}
			type="text"
			placeholder={t("contact_form.name_placeholder")}
			autocomplete="name"
			required={requireName}
			name="contact-name"
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError("name") || "";
				},
			}}
		/>
	{/if}

	<!-- Email -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldInput
		bind:this={emailField}
		bind:value={formData.email}
		label={t("contact_form.email_label")}
		type="email"
		placeholder={t("contact_form.email_placeholder")}
		autocomplete="email"
		required
		name="contact-email"
		labelLeftBreakpoint={0}
		validate={{
			customValidator() {
				return fieldError("email") || "";
			},
		}}
	/>

	<!-- Phone -->
	{#if showPhone}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={phoneField}
			bind:value={formData.phone}
			label={t("contact_form.phone_label")}
			type="tel"
			placeholder={t("contact_form.phone_placeholder")}
			autocomplete="tel"
			required={requirePhone}
			name="contact-phone"
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError("phone") || "";
				},
			}}
		/>
	{/if}

	<!-- Company -->
	{#if showCompany}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={companyField}
			bind:value={formData.company}
			label={t("contact_form.company_label")}
			type="text"
			placeholder={t("contact_form.company_placeholder")}
			autocomplete="organization"
			required={requireCompany}
			name="contact-company"
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError("company") || "";
				},
			}}
		/>
	{/if}

	<!-- Subject — a <select> when subjectValues is provided, else free text -->
	{#if subjectShown}
		{#if subjectAsSelect}
			<!-- svelte-ignore binding_property_non_reactive -->
			<FieldSelect
				bind:this={subjectField}
				bind:value={formData.subject}
				label={t("contact_form.subject_label")}
				options={subjectOptions}
				required={requireSubject}
				name="contact-subject"
				labelLeftBreakpoint={0}
				validate={{
					customValidator() {
						return fieldError("subject") || "";
					},
				}}
			/>
		{:else}
			<!-- svelte-ignore binding_property_non_reactive -->
			<FieldInput
				bind:this={subjectField}
				bind:value={formData.subject}
				label={t("contact_form.subject_label")}
				type="text"
				placeholder={t("contact_form.subject_placeholder")}
				required={requireSubject}
				name="contact-subject"
				labelLeftBreakpoint={0}
				validate={{
					customValidator() {
						return fieldError("subject") || "";
					},
				}}
			/>
		{/if}
	{/if}

	<!-- Message -->
	<!-- svelte-ignore binding_property_non_reactive -->
	<FieldTextarea
		bind:this={messageField}
		bind:value={formData.message}
		label={t("contact_form.message_label")}
		placeholder={t("contact_form.message_placeholder")}
		required
		name="contact-message"
		labelLeftBreakpoint={0}
		validate={{
			customValidator() {
				return fieldError("message") || "";
			},
		}}
	/>

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
			name={`contact-extra-${cfg.name}`}
			labelLeftBreakpoint={0}
			validate={{
				customValidator() {
					return fieldError(cfg.name) || "";
				},
			}}
			{...cfg.props}
		/>
	{/each}

	<!-- Escape-hatch slot (consent checkbox, custom fields, etc.) -->
	{#if extraFieldsSlot}
		{@render extraFieldsSlot({ formData, fieldError })}
	{/if}

	<!-- Bot protection (rendered, but never blocks submit — see buildBotCheck) -->
	{#if useHoneypot}
		<Honeypot bind:value={honeypotValue} name={honeypotName} />
	{/if}
	{#if useTimeTrap}
		<TimeTrap
			bind:this={timeTrap}
			bind:isTooFast={ttTooFast}
			bind:elapsedMs={ttElapsed}
			minMs={timeTrapMinMs}
		/>
	{/if}

	<!-- CTA -->
	{#if submitButton}
		{@render submitButton({ isSubmitting, disabled: isSubmitting })}
	{:else}
		<div class={unstyled ? undefined : "stuic-contact-us-form-submit"}>
			<Button intent="primary" type="submit" disabled={isSubmitting} class="w-full">
				{isSubmitting
					? (submittingLabel ?? t("contact_form.submitting"))
					: (submitLabel ?? t("contact_form.submit"))}
			</Button>
		</div>
	{/if}

	<!-- Footer -->
	{#if footer}
		{@render footer()}
	{/if}
</form>
