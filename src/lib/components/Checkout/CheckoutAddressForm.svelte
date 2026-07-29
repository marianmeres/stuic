<script lang="ts" module>
	import type { Country } from "@marianmeres/countries";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type { Props as FieldCountryProps } from "../Input/FieldCountry.svelte";
	import type { Props as FieldPhoneNumberProps } from "../Input/FieldPhoneNumber.svelte";
	import type { Props as FieldSelectProps } from "../Input/FieldSelect.svelte";
	import type {
		CheckoutAddressData,
		CheckoutSubdivisionOption,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFieldSetElement>, "children"> {
		/**
		 * Bindable address data. Default: createEmptyAddress().
		 *
		 * Note: `address.country` is expected to be an ISO alpha-2 code (e.g. "SK")
		 * when used with the built-in country selector. Pre-existing free-text values
		 * won't match a country and will render as unselected.
		 */
		address?: CheckoutAddressData;

		/**
		 * Label prefix used for:
		 * - Accessible field IDs (e.g., "shipping-name", "billing-street")
		 * - Error field matching (errors with field "shipping.name" match when label="shipping")
		 * Default: "address"
		 */
		label?: string;

		/** External validation errors */
		errors?: CheckoutValidationError[];

		/** Which fields to display. All default to true. */
		fields?: {
			name?: boolean;
			street?: boolean;
			city?: boolean;
			state_or_region?: boolean;
			postal_code?: boolean;
			country?: boolean;
			phone?: boolean;
		};

		/**
		 * Which fields are required (shown with * marker, included in built-in validation).
		 * Default: ["name", "street", "city", "postal_code", "country"]
		 */
		requiredFields?: string[];

		/**
		 * Override the country field with a custom selector.
		 * When provided, replaces the default searchable country picker.
		 * `value` is an ISO alpha-2 code.
		 */
		countryField?: Snippet<
			[
				{
					/** Current country value (ISO alpha-2 code) */
					value: string;
					/** Called when country changes */
					onchange: (value: string) => void;
					/** Error message for this field (if any) */
					error?: string;
					/** Field label text */
					label: string;
					/** HTML id attribute for the input */
					id: string;
				},
			]
		>;

		/**
		 * Restrict the country selector to a specific list. Accepts ISO codes
		 * or already-resolved Country objects. Default: all countries.
		 */
		countryList?: Country[] | string[];

		/**
		 * ISO codes pinned at the top of the country dropdown, above a divider.
		 */
		preferredCountries?: string[];

		/**
		 * Override displayed country names. Keys are ISO alpha-2 codes,
		 * values are the localized name. Missing keys fall back to English.
		 */
		countryNames?: Record<string, string>;

		/**
		 * Subdivision (state/province/region) lists keyed by UPPERCASE ISO alpha-2
		 * country code. When the currently selected `address.country` has a
		 * non-empty entry, the `state_or_region` field renders as a fixed select
		 * over these options (storing the option `code`); for every other country
		 * it stays the default free-text input, whose value is never touched.
		 * stuic ships no subdivision data — pass exactly the countries your
		 * checkout logic keys on (tax, shipping). Default: undefined (free text
		 * everywhere, current behavior).
		 *
		 * When the built-in select is active, a stored value is reconciled
		 * against the list: an exact `code` match (case-insensitive) is
		 * normalized to the canonical code, an exact `name` match ("Michigan")
		 * is rewritten to its `code` ("MI"), and anything else is left
		 * untouched and renders as unselected — surfaced by required-validation
		 * rather than destroyed. Reconciliation is skipped when the `stateField`
		 * snippet replaces the field — a custom control owns its value.
		 *
		 * Country edits made through this form flip the mode live even for a
		 * plain (non-`$state`) `address` object; external mutations of a plain
		 * object are not observable — pass a `$state` object for those.
		 */
		subdivisions?: Record<string, CheckoutSubdivisionOption[]>;

		/**
		 * Whether `state_or_region` is required while the subdivision select is
		 * active (i.e. the current country has a `subdivisions` entry). Also
		 * accepts a per-country predicate receiving the UPPERCASE ISO code.
		 * Countries without a list keep the plain `requiredFields` behavior
		 * (as does a `requiredFields` entry for "state_or_region", which wins
		 * regardless). Default: true.
		 */
		subdivisionRequired?: boolean | ((countryIso: string) => boolean);

		/**
		 * Override the state/region field with a custom control (parity with
		 * `countryField`). When provided, replaces the built-in field in both
		 * modes; `options` is the active country's subdivision list, or null
		 * when the free-text input would apply.
		 */
		stateField?: Snippet<
			[
				{
					/** Current state/region value */
					value: string;
					/** Called when the value changes */
					onchange: (value: string) => void;
					/** Error message for this field (if any) */
					error?: string;
					/** Field label text */
					label: string;
					/** HTML id attribute for the input */
					id: string;
					/** Active country's subdivision list, or null (free-text mode) */
					options: CheckoutSubdivisionOption[] | null;
				},
			]
		>;

		/**
		 * Extra props forwarded to the internal FieldSelect when the subdivision
		 * select is active (parity with `countryFieldProps`).
		 */
		stateFieldProps?: Partial<FieldSelectProps>;

		/** Extra props forwarded to the internal FieldPhoneNumber component. */
		phoneFieldProps?: Partial<FieldPhoneNumberProps>;

		/** Extra props forwarded to the internal FieldCountry component. */
		countryFieldProps?: Partial<FieldCountryProps>;

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLFieldSetElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import {
		scrollToFirstInvalidField,
		validateAllFields,
	} from "../../utils/validate-fields.js";
	import FieldCountry from "../Input/FieldCountry.svelte";
	import FieldInput from "../Input/FieldInput.svelte";
	import FieldPhoneNumber from "../Input/FieldPhoneNumber.svelte";
	import FieldSelect from "../Input/FieldSelect.svelte";
	import { validatePhoneNumber } from "../Input/phone-validation.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { createEmptyAddress } from "./_internal/checkout-utils.js";

	const DEFAULT_REQUIRED = ["name", "street", "city", "postal_code", "country"];

	let {
		address = $bindable(createEmptyAddress()),
		label = "address",
		errors: externalErrors = [],
		fields,
		requiredFields = DEFAULT_REQUIRED,
		countryField,
		countryList,
		preferredCountries,
		countryNames,
		subdivisions,
		subdivisionRequired = true,
		stateField,
		stateFieldProps,
		phoneFieldProps,
		countryFieldProps,
		t: tProp,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let t = $derived(tProp ?? t_default);

	function fieldError(field: string): string | undefined {
		return externalErrors.find((e) => e.field.endsWith(`.${field}`))?.message;
	}

	function isRequired(field: string): boolean {
		return requiredFields.includes(field);
	}

	let containerWidth = $state(0);
	let isSmall = $derived(containerWidth > 0 && containerWidth < 480);

	// Subdivision select mode (see the `subdivisions` prop) --------------------
	// Local mirror of `address.country` (writable derived). The select/input
	// mode must react to country edits even when the consumer passed a plain
	// (non-$state) address object, whose deep mutations Svelte cannot observe —
	// so every country write that goes through this form also overrides the
	// mirror directly, while reactive addresses and prop replacement resync it
	// through the derived expression. External mutations of a plain object stay
	// unobservable (true for every field).
	let _country = $derived(address.country ?? "");

	function setCountry(v: string) {
		address.country = v;
		_country = v;
	}

	let _countryCC = $derived(_country.trim().toUpperCase());

	let _subdivisionList = $derived.by(() => {
		const list = _countryCC ? subdivisions?.[_countryCC] : undefined;
		return list?.length ? list : null;
	});

	let _subdivisionIsRequired = $derived(
		isRequired("state_or_region") ||
			(typeof subdivisionRequired === "function"
				? subdivisionRequired(_countryCC)
				: subdivisionRequired)
	);

	// Reconcile a pre-existing value whenever the built-in select becomes
	// active: legacy free-text rows ("Michigan", "mi") self-heal to the
	// canonical code ("MI"); anything unrecognized is left untouched (renders
	// unselected, caught by required-validation) — never destroyed. Converges:
	// the write triggers one re-run which then matches the code branch with
	// nothing to change. Skipped entirely under the `stateField` snippet — a
	// custom control owns its value (a controlled combobox writing in-progress
	// text through `onchange` must not have it rewritten mid-typing).
	$effect(() => {
		if (stateField) return;
		const list = _subdivisionList;
		if (!list) return;
		const raw = address.state_or_region ?? "";
		const needle = raw.trim().toLowerCase();
		if (!needle) return;
		const hit =
			list.find((o) => o.code.toLowerCase() === needle) ??
			list.find((o) => o.name.trim().toLowerCase() === needle);
		if (hit && raw !== hit.code) address.state_or_region = hit.code;
	});

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-address", classProp)
	);

	// Imperative API ----------------------------------------------------------
	// Field refs collected during render so consumers can trigger validation
	// without waiting for native form submission. Refs stay undefined for
	// fields hidden via the `fields` prop or replaced by the `countryField`/
	// `stateField` snippets — `validateAllFields` skips nullish entries.
	let nameField = $state<FieldInput>();
	let streetField = $state<FieldInput>();
	let cityField = $state<FieldInput>();
	let stateFieldRef = $state<FieldInput | FieldSelect>();
	let postalCodeField = $state<FieldInput>();
	let countryFieldRef = $state<FieldCountry>();
	let phoneField = $state<FieldPhoneNumber>();

	// DOM order top-to-bottom — first invalid wins for scrollToFirstError.
	function _fields() {
		return [
			nameField,
			streetField,
			cityField,
			stateFieldRef,
			postalCodeField,
			countryFieldRef,
			phoneField,
		];
	}

	/**
	 * Run every visible field's validator and render any inline errors.
	 * Returns true if all fields are valid. Pair with the `errors` prop:
	 * set external errors first, await `tick()`, then call `validate()`.
	 */
	export function validate(): boolean {
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

	/** Clear all inline validation messages on the rendered fields. */
	export function clearValidation(): void {
		for (const f of _fields()) f?.clearValidation?.();
	}
</script>

<fieldset
	bind:this={el}
	bind:offsetWidth={containerWidth}
	class={_class}
	data-small={!unstyled && isSmall ? "" : undefined}
	{...rest}
>
	<!-- Name (full width, block label) -->
	<!--
		svelte-ignore binding_property_non_reactive:
		address is a $bindable prop — deep reactivity depends on the consumer
		passing a $state() object. The bindings work correctly regardless.
	-->
	{#if fields?.name !== false}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={nameField}
			bind:value={address.name}
			label={t("checkout.address.name_label")}
			placeholder={t("checkout.address.name_placeholder")}
			required={isRequired("name")}
			name="{label}-name"
			id="{label}-name"
			labelLeftBreakpoint={0}
			validate={{
				customValidator(val) {
					return fieldError("name") || "";
				},
			}}
		/>
	{/if}

	<!-- Street (full width, block label) -->
	{#if fields?.street !== false}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:this={streetField}
			bind:value={address.street}
			label={t("checkout.address.street_label")}
			placeholder={t("checkout.address.street_placeholder")}
			required={isRequired("street")}
			name="{label}-street"
			id="{label}-street"
			labelLeftBreakpoint={0}
			validate={{
				customValidator(val) {
					return fieldError("street") || "";
				},
			}}
		/>
	{/if}

	<!-- City + State/Region + Postal Code (responsive 2- or 3-column grid) -->
	{#if fields?.city !== false || fields?.state_or_region !== false || fields?.postal_code !== false}
		<div class={unstyled ? undefined : "stuic-checkout-address-row"}>
			{#if fields?.city !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
					bind:this={cityField}
					bind:value={address.city}
					label={t("checkout.address.city_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.address.city_placeholder")}
					required={isRequired("city")}
					name="{label}-city"
					id="{label}-city"
					validate={{
						customValidator(val) {
							return fieldError("city") || "";
						},
					}}
				/>
			{/if}
			{#if fields?.state_or_region !== false}
				{#if stateField}
					{@render stateField({
						value: address.state_or_region ?? "",
						onchange: (v) => {
							address.state_or_region = v;
						},
						error: fieldError("state_or_region"),
						label: t("checkout.address.state_or_region_label"),
						id: `${label}-state_or_region`,
						options: _subdivisionList,
					})}
				{:else if _subdivisionList}
					<FieldSelect
						bind:this={stateFieldRef}
						bind:value={
							() => address.state_or_region ?? "",
							(v) => {
								address.state_or_region = String(v ?? "");
							}
						}
						options={[
							{
								label: t("checkout.address.state_or_region_select_placeholder"),
								value: "",
							},
							..._subdivisionList.map((o) => ({ label: o.name, value: o.code })),
						]}
						label={t("checkout.address.state_or_region_label")}
						labelLeftBreakpoint={0}
						required={_subdivisionIsRequired}
						name="{label}-state_or_region"
						id="{label}-state_or_region"
						validate={{
							customValidator(val) {
								return fieldError("state_or_region") || "";
							},
						}}
						{...stateFieldProps}
					/>
				{:else}
					<!-- svelte-ignore binding_property_non_reactive -->
					<FieldInput
						bind:this={stateFieldRef}
						bind:value={address.state_or_region}
						label={t("checkout.address.state_or_region_label")}
						labelLeftBreakpoint={0}
						placeholder={t("checkout.address.state_or_region_placeholder")}
						required={isRequired("state_or_region")}
						name="{label}-state_or_region"
						id="{label}-state_or_region"
						validate={{
							customValidator(val) {
								return fieldError("state_or_region") || "";
							},
						}}
					/>
				{/if}
			{/if}
			{#if fields?.postal_code !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
					bind:this={postalCodeField}
					bind:value={address.postal_code}
					label={t("checkout.address.postal_code_label")}
					labelLeftBreakpoint={0}
					placeholder={t("checkout.address.postal_code_placeholder")}
					required={isRequired("postal_code")}
					name="{label}-postal_code"
					id="{label}-postal_code"
					validate={{
						customValidator(val) {
							return fieldError("postal_code") || "";
						},
					}}
				/>
			{/if}
		</div>
	{/if}

	<!-- Country (full width, block label) -->
	{#if fields?.country !== false}
		{#if countryField}
			{@render countryField({
				value: _country,
				onchange: setCountry,
				error: fieldError("country"),
				label: t("checkout.address.country_label"),
				id: `${label}-country`,
			})}
		{:else}
			<FieldCountry
				bind:this={countryFieldRef}
				bind:value={() => _country, setCountry}
				label={t("checkout.address.country_label")}
				placeholder={t("checkout.address.country_placeholder")}
				required={isRequired("country")}
				name="{label}-country"
				id="{label}-country"
				labelLeftBreakpoint={0}
				{countryList}
				{preferredCountries}
				{countryNames}
				t={tProp}
				validate={{
					customValidator(val) {
						return fieldError("country") || "";
					},
				}}
				{...countryFieldProps}
			/>
		{/if}
	{/if}

	<!-- Phone (full width, block label) -->
	{#if fields?.phone !== false}
		<FieldPhoneNumber
			bind:this={phoneField}
			value={address.phone ?? ""}
			onChange={(v) => {
				address.phone = v;
			}}
			label={t("checkout.address.phone_label")}
			placeholder={t("checkout.address.phone_placeholder")}
			required={isRequired("phone")}
			name="{label}-phone"
			labelLeftBreakpoint={0}
			validate={{
				customValidator(val) {
					return fieldError("phone") || validatePhoneNumber(val) || "";
				},
			}}
			{...phoneFieldProps}
		/>
	{/if}
</fieldset>
