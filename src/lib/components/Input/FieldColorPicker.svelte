<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { ValidateOptions } from "../../actions/validate.svelte.js";
	import type { TranslateFn } from "../../types.js";
	import type { ColorPickerCustom } from "../ColorPicker/ColorPicker.svelte";
	import type { ColorPickerSwatch } from "../ColorPicker/palettes.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { InputWrapClassProps } from "./types.js";

	type SnippetWithId = Snippet<[{ id: string }]>;

	export interface Props extends InputWrapClassProps, Record<string, any> {
		/** Current color (bindable). Any CSS color string; `""` = no color */
		value?: string;
		label?: SnippetWithId | THC;
		description?: SnippetWithId | THC;
		class?: string;
		id?: string;
		renderSize?: "sm" | "md" | "lg" | string;
		required?: boolean;
		disabled?: boolean;
		validate?: boolean | Omit<ValidateOptions, "setValidationResult">;
		labelAfter?: SnippetWithId | THC;
		inputBefore?: SnippetWithId | THC;
		inputAfter?: SnippetWithId | THC;
		inputBelow?: SnippetWithId | THC;
		below?: SnippetWithId | THC;
		labelLeft?: boolean;
		labelLeftWidth?: "normal" | "wide";
		labelLeftBreakpoint?: number;
		/** Classes for the underlying <ColorPicker> root */
		classInput?: string;
		style?: string;
		//
		// Below: forwarded as-is to the underlying <ColorPicker>.
		//
		/** The swatches: color strings or `{ value, label }` objects */
		palette?: ColorPickerSwatch[];
		/** Cap the palette at this many swatches per row */
		columns?: number;
		/** Which custom-color controls to show (default `"both"`) */
		custom?: ColorPickerCustom;
		/** Offer clearing (the "no color" swatch, Delete / Backspace) */
		allowClear?: boolean;
		/** Form field name (hidden input) */
		name?: string;
		/** i18n translate function (see `createColorPickerT`) */
		t?: TranslateFn;
		/** Fires when the user commits a color (not while dragging the native picker) */
		onchange?: (value: string) => void;
		/** Class for every swatch button */
		classSwatch?: string;
	}
</script>

<script lang="ts">
	import type { ValidationResult } from "../../actions/validate.svelte.js";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import ColorPicker from "../ColorPicker/ColorPicker.svelte";
	import InputWrap from "./_internal/InputWrap.svelte";

	let {
		value = $bindable(""),
		label = "",
		id = getId(),
		description,
		class: classProp,
		renderSize = "md",
		//
		required = false,
		disabled = false,
		//
		// Renamed local binding to avoid collision with `export function validate()` below.
		validate: validateProp,
		//
		labelAfter,
		inputBefore,
		inputAfter,
		inputBelow,
		below,
		//
		labelLeft = false,
		labelLeftWidth = "normal",
		labelLeftBreakpoint = 480,
		//
		classInput,
		//
		palette,
		columns,
		custom,
		allowClear,
		name,
		t,
		onchange,
		classSwatch,
		//
		classLabel,
		classLabelBox,
		classInputBox,
		classInputBoxWrap,
		classInputBoxWrapInvalid,
		classDescBox,
		classDescBoxToggle,
		classBelowBox,
		classValidationBox,
		style = "",
		//
		...rest
	}: Props = $props();

	//
	let validation: ValidationResult | undefined = $state();
	const setValidationResult = (res: ValidationResult) => (validation = res);

	// Delegate the imperative API to the inner ColorPicker.
	let pickerRef: ColorPicker | undefined = $state();

	/** Trigger validation now. Renders the inline message if invalid. */
	export function validate(): ValidationResult | undefined {
		pickerRef?.validate();
		return validation;
	}

	/** Clear the inline validation message. */
	export function clearValidation(): void {
		pickerRef?.clearValidation?.();
		validation = undefined;
	}

	/** Current validation state. */
	export function getValidation(): ValidationResult | undefined {
		return validation;
	}

	/** Focus the swatch group's tab stop (or the first custom-color control). */
	export function focus(): void {
		pickerRef?.focus?.();
	}

	/** Scroll the field into view. Defaults to smooth + center. */
	export function scrollIntoView(opts?: ScrollIntoViewOptions): void {
		pickerRef?.scrollIntoView?.(opts);
	}
</script>

<InputWrap
	{description}
	class={classProp}
	size={renderSize}
	{id}
	{label}
	{labelAfter}
	{inputBefore}
	{inputAfter}
	{inputBelow}
	{below}
	{required}
	{disabled}
	{labelLeft}
	{labelLeftWidth}
	{labelLeftBreakpoint}
	{classLabel}
	{classLabelBox}
	{classInputBox}
	{classInputBoxWrapInvalid}
	{classDescBox}
	{classDescBoxToggle}
	{classBelowBox}
	{classValidationBox}
	{validation}
	classInputBoxWrap={twMerge("input-wrap-transparent", classInputBoxWrap)}
	{style}
>
	<!--
		`labelledby` (not the InputWrap's `for={id}`) is what names the swatch group: a
		radiogroup is a <div>, which a `for` cannot label. Matches InputWrap's own
		`{id}-label`, and only when there is a label to point at — otherwise the picker
		keeps its own `t("color")` name. The picker's string `label` prop is deliberately
		not forwarded: here `label` is the visible one.
	-->
	<ColorPicker
		bind:this={pickerRef}
		bind:value
		{palette}
		{columns}
		{custom}
		{allowClear}
		{name}
		{t}
		{onchange}
		{classSwatch}
		{required}
		{disabled}
		class={classInput}
		labelledby={label ? `${id}-label` : undefined}
		validate={validateProp}
		{setValidationResult}
		{...rest}
	/>
</InputWrap>
