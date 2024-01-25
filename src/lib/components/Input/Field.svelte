<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import {
		autogrow,
		getId,
		trim,
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from '../../index.js';

	const dispatch = createEventDispatcher();
	const setType = (el: HTMLInputElement, t: any) => (el.type = t);

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

	let _class = '';
	export { _class as class };
	export let labelClass = '';
	export let wrapClass = '';
	export let inputClass = '';
	export let invalidClass = 'border-stuic-primary';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let value: string; // badInput
	export let label = '';
	export let type = 'text'; // typeMismatch,
	export let name = '';
	export let tabindex = 0;

	export let description = '';
	export let descriptionClass = '';

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
	export let validationMessageClass = '';
	export let validate: ValidateOptions | true | undefined = undefined;
	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let _inputEl: HTMLInputElement | HTMLTextAreaElement;
	$: if (_inputEl) dispatch('input_mounted', _inputEl);

	//
	$: _inputClass = twMerge(`
		form-input
		rounded-md border-0 w-full flex-1
		bg-transparent
		tracking-tight
		focus:outline-0 focus-visible:ring-0
		placeholder:text-black/35 placeholder:tracking-tight
		${inputSizePreset[size]}
	`);
</script>

<div class={twMerge(`mb-4 ${_class}`)}>
	<div class="flex items-end px-2 mb-1">
		{#if label || $$slots.label}
			<label
				for={id}
				class={twMerge(
					'block flex-1',
					required ? "after:content-['*'] after:opacity-30 after:pl-1" : '',
					labelSizePreset[size],
					labelClass
				)}
				class:required
			>
				{#if $$slots.label}
					<slot name="label" />
				{:else}
					{@html label}
				{/if}
			</label>
		{/if}
		<slot name="right_of_label" />
	</div>
	<div
		class={twMerge(
			`rounded-md border border-gray-300
            bg-gray-100
            focus-within:border-stuic-primary
            focus-within:ring-4
            focus-within:ring-stuic-primary
            focus-within:ring-opacity-20`,
			wrapClass,
			validation && !validation.valid ? invalidClass : ''
		)}
		class:cursor-not-allowed={disabled}
		class:opacity-50={disabled}
	>
		<div class="flex items-center">
			<slot name="input_before" {id} />
			{#if type === 'textarea'}
				<textarea
					bind:value
					bind:this={_inputEl}
					{id}
					class={twMerge(`${_inputClass} min-h-16 ${inputClass}`)}
					class:cursor-not-allowed={disabled}
					{name}
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
					{...$$restProps}
				></textarea>
			{:else}
				<input
					bind:value
					bind:this={_inputEl}
					use:setType={type}
					{id}
					class={twMerge(`${_inputClass} ${inputClass}`)}
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
					{...$$restProps}
				/>
			{/if}
			<slot name="input_after" {id} />
		</div>
		<slot name="input_below" {id} />
	</div>
	{#if validation && !validation?.valid}
		<div
			transition:slide={{ duration: 150 }}
			class={twMerge(
				`mt-1 text-xs text-stuic-primary px-2 tracking-tight ${validationMessageClass}`
			)}
		>
			{@html validation.message}
		</div>
	{/if}
	{#if description}
		<div class={twMerge(`mx-2 mt-1 text-sm opacity-50 ${descriptionClass}`)}>
			{@html description}
		</div>
	{/if}
	{#if $$slots.below}
		<div class="mx-2 mt-1">
			<slot name="below" {id} />
		</div>
	{/if}
</div>
