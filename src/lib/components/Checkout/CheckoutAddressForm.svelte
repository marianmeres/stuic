<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { TranslateFn } from "../../types.js";
	import type {
		CheckoutAddressData,
		CheckoutValidationError,
	} from "./_internal/checkout-types.js";

	export interface Props extends Omit<HTMLAttributes<HTMLFieldSetElement>, "children"> {
		/** Bindable address data. Default: createEmptyAddress() */
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
		 * When provided, replaces the default text input for country.
		 */
		countryField?: Snippet<
			[
				{
					/** Current country value */
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

		t?: TranslateFn;
		unstyled?: boolean;
		class?: string;
		el?: HTMLFieldSetElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { t_default } from "./_internal/checkout-i18n-defaults.js";
	import { createEmptyAddress } from "./_internal/checkout-utils.js";
	import FieldInput from "../Input/FieldInput.svelte";

	const DEFAULT_REQUIRED = ["name", "street", "city", "postal_code", "country"];

	let {
		address = $bindable(createEmptyAddress()),
		label = "address",
		errors: externalErrors = [],
		fields,
		requiredFields = DEFAULT_REQUIRED,
		countryField,
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

	let _class = $derived(
		unstyled ? classProp : twMerge("stuic-checkout-address", classProp)
	);
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

	<!-- City + Postal Code (2-column grid) -->
	{#if fields?.city !== false || fields?.postal_code !== false}
		<div class={unstyled ? undefined : "stuic-checkout-address-row"}>
			{#if fields?.city !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
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
			{#if fields?.postal_code !== false}
				<!-- svelte-ignore binding_property_non_reactive -->
				<FieldInput
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
				value: address.country,
				onchange: (v) => {
					address.country = v;
				},
				error: fieldError("country"),
				label: t("checkout.address.country_label"),
				id: `${label}-country`,
			})}
		{:else}
			<!-- svelte-ignore binding_property_non_reactive -->
			<FieldInput
				bind:value={address.country}
				label={t("checkout.address.country_label")}
				placeholder={t("checkout.address.country_placeholder")}
				required={isRequired("country")}
				name="{label}-country"
				id="{label}-country"
				labelLeftBreakpoint={0}
				validate={{
					customValidator(val) {
						return fieldError("country") || "";
					},
				}}
			/>
		{/if}
	{/if}

	<!-- Phone (full width, block label) -->
	{#if fields?.phone !== false}
		<!-- svelte-ignore binding_property_non_reactive -->
		<FieldInput
			bind:value={address.phone}
			label={t("checkout.address.phone_label")}
			type="tel"
			placeholder={t("checkout.address.phone_placeholder")}
			required={isRequired("phone")}
			name="{label}-phone"
			id="{label}-phone"
			labelLeftBreakpoint={0}
			validate={{
				customValidator(val) {
					return fieldError("phone") || "";
				},
			}}
		/>
	{/if}
</fieldset>
