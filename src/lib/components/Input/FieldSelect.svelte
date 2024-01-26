<script context="module" lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import {
		getId,
		Thc,
		type THC,
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from '../../index.js';

	export interface FieldSelectConfigClasses {
		box?: string;
		wrap?: string;
		label?: string;
		input?: string;
		invalid?: string;
		validationMessage?: string;
		description?: string;
		below?: string;
		asterix?: string;
	}
	export interface FieldSelectConfigClassesBySize {
		sm?: FieldSelectConfigClasses;
		md?: FieldSelectConfigClasses;
		lg?: FieldSelectConfigClasses;
	}

	const _PRESET: FieldSelectConfigClasses = {
		box: 'mb-4',
		wrap: `
			flex items-center
            rounded-md border border-gray-300
            bg-gray-100
            focus-within:border-stuic-primary
            focus-within:ring-4
            focus-within:ring-stuic-primary
            focus-within:ring-opacity-20
		`,
		input: `
			rounded-md border-0 block w-full flex-1
			bg-transparent
			tracking-tight
			focus:outline-0 focus-visible:ring-0
			placeholder:text-black/35 placeholder:tracking-tight
		`,
		invalid: `border-stuic-primary`,
		validationMessage: `mt-1 text-xs text-stuic-primary px-2 tracking-tight`,
		description: `mx-2 mt-1 text-sm opacity-50`,
		below: `mx-2 mt-1`,
		asterix: `after:content-['*'] after:opacity-30 after:pl-1`,
	};

	const _PRESET_BY_SIZE: FieldSelectConfigClassesBySize = {};

	export class FieldSelectConfig {
		static class: FieldSelectConfigClasses = {};
		static classBySize: FieldSelectConfigClassesBySize = {};
	}
</script>

<script lang="ts">
	const dispatch = createEventDispatcher();

	const inputSizePreset = {
		sm: 'text-sm placeholder:text-sm',
		md: 'text-base placeholder:text-base',
		lg: 'text-lg  placeholder:text-lg',
	};
	const labelSizePreset = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-base font-bold',
	};

	interface Option {
		label: string;
		value?: string;
	}
	export let options: (string | Option)[] = [];

	let _class: FieldSelectConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldSelectConfigClassesBySize;

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let value: any; // badInput
	export let label: THC = '';
	export let name = '';
	export let tabindex = 0;

	export let description: THC = '';

	export let disabled = false;
	export let required = false; // valueMissing
	export let autofocus: true | undefined = undefined;

	//
	export let validate: ValidateOptions | true | undefined = undefined;

	export let showAsterixOnRequired = true;

	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => (validation = res);

	//
	let _options: Option[] = [];
	$: _options = options.map((v) => {
		if (typeof v === 'string') {
			v = { label: v };
		}
		if (v.value === undefined) {
			v.value = v.label;
		}
		return v;
	});

	let _inputEl: HTMLInputElement | HTMLTextAreaElement;
	$: if (_inputEl) dispatch('input_mounted', _inputEl);

	//
	const _collectClasses = (k: keyof FieldSelectConfigClasses, extra = '') => [
		_PRESET?.[k] || '',
		_PRESET_BY_SIZE?.[size]?.[k] || '',
		FieldSelectConfig?.class?.[k] || '',
		FieldSelectConfig?.classBySize?.[size]?.[k] || '',
		extra || '',
		_class?.[k] || '',
		classBySize?.[size]?.[k] || '',
	];

	$: _boxClass = twMerge(_collectClasses('box'));

	$: _labelClass = twMerge(
		_collectClasses(
			'label',
			showAsterixOnRequired && required ? _collectClasses('asterix').join(' ') : ''
		)
	);

	$: _wrapClass = twMerge(
		_collectClasses(
			'wrap',
			validation && !validation.valid ? _collectClasses('invalid').join(' ') : ''
		)
	);

	$: _inputClass = twMerge('form-input', _collectClasses('input'));
	$: _validationMessageClass = twMerge(_collectClasses('validationMessage'));
	$: _descriptionClass = twMerge(_collectClasses('description'));
	$: _belowClass = twMerge(_collectClasses('below'));
</script>

<div class={_boxClass}>
	<div class="flex items-end px-2 mb-1">
		{#if label || $$slots.label}
			<label for={id} class={_labelClass}>
				{#if $$slots.label}
					<slot name="label" />
				{:else}
					<Thc thc={label} forceAsHtml />
				{/if}
			</label>
		{/if}
		<slot name="right_of_label" />
	</div>
	<div class={_wrapClass} class:cursor-not-allowed={disabled} class:opacity-50={disabled}>
		<slot name="input_before" {id} />
		<select
			class={_inputClass}
			bind:value
			bind:this={_inputEl}
			{disabled}
			{required}
			{tabindex}
			{autofocus}
			{name}
			use:validateAction={validate
				? { ...(validate === true ? {} : validate), setValidationResult }
				: undefined}
		>
			{#each _options as o, i}
				<option value={o.value}>{o.label}</option>
			{/each}
		</select>

		<slot name="input_after" {id} />
	</div>
	{#if validation && !validation?.valid}
		<div transition:slide={{ duration: 150 }} class={_validationMessageClass}>
			{@html validation.message}
		</div>
	{/if}
	{#if description}
		<div class={_descriptionClass}>
			<Thc thc={description} forceAsHtml />
		</div>
	{/if}
	{#if $$slots.below}
		<div class={_belowClass}><slot name="below" {id} /></div>
	{/if}
</div>
