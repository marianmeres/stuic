<script context="module" lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { autogrow } from '../../actions/autogrow.js';
	import { trim } from '../../actions/trim.js';
	import type { ValidateOptions, ValidationResult } from '../../actions/validate.js';
	import { validate as validateAction } from '../../actions/validate.js';
	import { getId } from '../../utils/get-id.js';
	import type { THC } from '../Thc/Thc.svelte';
	import Thc from '../Thc/Thc.svelte';

	export interface FieldConfigClasses {
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

	export interface FieldConfigClassesBySize {
		sm?: FieldConfigClasses;
		md?: FieldConfigClasses;
		lg?: FieldConfigClasses;
	}

	const _emptyClasses = (): FieldConfigClasses => ({
		box: '',
		wrap: '',
		label: '',
		input: '',
		invalid: '',
		validationMessage: '',
		description: '',
		below: '',
		asterix: '',
	});

	const _PRESET: FieldConfigClasses = {
		box: 'mb-4 grid', //  gap-4
		wrap: `
			rounded-md border border-gray-300 dark:border-gray-600
			bg-gray-100 dark:bg-gray-700
			focus-within:border-stuic-primary
			focus-within:ring-4
			focus-within:ring-stuic-primary
			focus-within:ring-opacity-20
		`,
		label: `block flex-1 px-2 mb-1`, //
		input: `
			rounded-md border-0 w-full flex-1
			bg-transparent
			tracking-tight
			focus:outline-0 focus-visible:ring-0
			placeholder:tracking-tight
			placeholder:text-black/35 dark:placeholder:text-white/35
			text-black dark:text-white
		`,
		invalid: `border-stuic-primary`,
		validationMessage: `my-1 text-xs text-stuic-primary px-2 tracking-tight`,
		description: `mx-2 mt-1 text-sm opacity-50`,
		below: `mx-2 my-1`,
		asterix: `after:content-['*'] after:opacity-30 after:pl-1`,
	};

	const _PRESET_BY_SIZE: FieldConfigClassesBySize = {
		sm: {
			label: 'text-sm',
			input: 'text-sm placeholder:text-sm',
		},
		md: {
			label: 'text-base',
			input: 'text-base placeholder:text-base',
		},
		lg: {
			label: 'text-base font-bold',
			input: 'text-lg placeholder:text-lg',
		},
	};

	export class FieldConfig {
		//
		static class: FieldConfigClasses = _emptyClasses();
		static classBySize: FieldConfigClassesBySize = {
			sm: _emptyClasses(),
			md: _emptyClasses(),
			lg: _emptyClasses(),
		};
		static labelLeft = false;
		static labelLeftWidth: 'normal' | 'wide' = 'normal';
		//
		static readonly _preset = _PRESET;
		static readonly _presetBySize = _PRESET_BY_SIZE;
	}
</script>

<script lang="ts">
	import PinInput from './PinInput.svelte';

	const clog = createClog('Field');
	const dispatch = createEventDispatcher();
	const setType = (el: HTMLInputElement, t: any) => (el.type = t);

	let _class: FieldConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldConfigClassesBySize = {};

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let value: string; // badInput
	export let label: THC = '';
	export let type = 'text'; // typeMismatch,
	export let name = '';
	export let tabindex = 0;

	export let description: THC = '';

	export let autofocus: true | undefined = undefined;
	export let disabled = false;
	export let readonly = false;
	export let required = false; // valueMissing
	export let placeholder: string | undefined = undefined;
	export let autocomplete: string | undefined = undefined;

	//
	export let minlength: number | undefined = undefined; // tooShort
	export let maxlength: number | undefined = undefined; // tooLong
	export let min: number | undefined = undefined; // rangeUnderflow
	export let max: number | undefined = undefined; // rangeOverflow
	export let pattern: string | undefined = undefined; // patternMismatch
	export let step: number | undefined = undefined; // stepMismatch

	export let useTrim = true;
	export let textareaAutoEnlarge = true;

	//
	export let labelLeft = FieldConfig.labelLeft;
	export let labelLeftWidth: 'normal' | 'wide' = FieldConfig.labelLeftWidth;

	//
	export let validate: ValidateOptions | true | undefined = undefined;

	export let showAsterixOnRequired = true;
	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let _inputEl: HTMLInputElement | HTMLTextAreaElement;
	$: if (_inputEl) dispatch('input_mounted', _inputEl);

	//
	const _collectClasses = (k: keyof FieldConfigClasses, extra = '') => [
		_PRESET?.[k] || '',
		_PRESET_BY_SIZE?.[size]?.[k] || '',
		FieldConfig?.class?.[k] || '',
		FieldConfig?.classBySize?.[size]?.[k] || '',
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

	$: _inputClass = twMerge(
		'form-input',
		type === 'textarea' ? 'min-h-16' : '',
		_collectClasses('input')
	);

	$: _validationMessageClass = twMerge(_collectClasses('validationMessage'));
	$: _descriptionClass = twMerge(_collectClasses('description'));
	$: _belowClass = twMerge(_collectClasses('below'));
</script>

<div
	class={_boxClass}
	class:grid-cols-4={labelLeft && labelLeftWidth === 'normal'}
	class:grid-cols-3={labelLeft && labelLeftWidth === 'wide'}
>
	<div
		class="flex"
		class:items-end={!labelLeft}
		class:items-start={labelLeft}
		class:mt-1={labelLeft}
	>
		{#if label || $$slots.label}
			<label for={id} class={_labelClass} class:required>
				{#if $$slots.label}
					<slot name="label" />
				{:else}
					<Thc thc={label} forceAsHtml />
				{/if}
			</label>
		{/if}
		<slot name="right_of_label" />
	</div>
	<div
		class:col-span-3={labelLeft && labelLeftWidth === 'normal'}
		class:col-span-2={labelLeft && labelLeftWidth === 'wide'}
	>
		<div
			class={_wrapClass}
			class:cursor-not-allowed={disabled}
			class:opacity-50={disabled}
		>
			<div class="flex">
				<slot name="input_before" {id} />
				{#if type === 'textarea'}
					<textarea
						bind:value
						bind:this={_inputEl}
						{id}
						class={_inputClass}
						class:cursor-not-allowed={disabled}
						{name}
						{placeholder}
						{disabled}
						{readonly}
						{required}
						{autofocus}
						{tabindex}
						use:trim={useTrim}
						use:validateAction={validate
							? { ...(validate === true ? {} : validate), setValidationResult }
							: undefined}
						use:autogrow={{ allowed: textareaAutoEnlarge }}
						on:blur
						on:change
						on:click
						on:focus
						on:input
						on:keydown
						on:keyup
						on:touchstart|passive
						on:touchend|passive
						on:touchmove|passive
						on:touchcancel
						on:mouseenter
						on:mouseleave
						{...$$restProps}
					></textarea>
				{:else if type === 'pin'}
					<PinInput
						bind:value
						inputClass={_inputClass}
						on:input_mounted
						{id}
						{name}
						{disabled}
						{readonly}
						{required}
						{autofocus}
						{tabindex}
						{placeholder}
						{pattern}
						{setValidationResult}
						bind:validate
						on:blur
						on:change
						on:click
						on:focus
						on:input
						on:keydown
						on:keyup
						on:touchstart
						on:touchend
						on:touchmove
						on:touchcancel
						on:mouseenter
						on:mouseleave
						{...$$restProps}
					/>
				{:else}
					<input
						bind:value
						bind:this={_inputEl}
						use:setType={type}
						{id}
						class={_inputClass}
						class:cursor-not-allowed={disabled}
						{name}
						{placeholder}
						{disabled}
						{readonly}
						{required}
						{autofocus}
						{autocomplete}
						{tabindex}
						{minlength}
						{maxlength}
						{min}
						{max}
						{pattern}
						{step}
						use:trim={useTrim}
						use:validateAction={validate
							? { ...(validate === true ? {} : validate), setValidationResult }
							: undefined}
						on:blur
						on:change
						on:click
						on:focus
						on:input
						on:keydown
						on:keyup
						on:touchstart|passive
						on:touchend|passive
						on:touchmove|passive
						on:touchcancel
						on:mouseenter
						on:mouseleave
						{...$$restProps}
					/>
				{/if}
				<slot name="input_after" {id} />
			</div>
			<slot name="input_below" {id} />
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
</div>
