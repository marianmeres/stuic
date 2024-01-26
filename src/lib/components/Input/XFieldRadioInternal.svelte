<script context="module" lang="ts">
	import { twMerge } from 'tailwind-merge';
	import {
		getId,
		validate as validateAction,
		type FieldRadiosConfigClassesBySize,
		type ValidateOptions,
		type ValidationResult,
		type FieldRadiosConfigClasses,
		FieldRadiosConfig,
		Thc,
	} from '../../index.js';
	import { slide } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';

	const _PRESET: FieldRadiosConfigClasses = {
		box: 'flex items-start',
		label: 'block w-full',
		input: `
			size-4 rounded-full
			bg-gray-100
			border-gray-300
			shadow-sm
			text-stuic-primary
			cursor-pointer
			focus:border-stuic-primary
			focus:ring-4
			focus:ring-offset-0
			focus:ring-stuic-primary
			focus:ring-opacity-20
			disabled:cursor-not-allowed
		`,
		validationMessage: 'text-xs text-stuic-primary tracking-tight',
		description: 'text-sm opacity-50',
	};

	const _PRESET_BY_SIZE: FieldRadiosConfigClassesBySize = {
		sm: { label: 'text-sm' },
		md: { label: 'text-base' },
		lg: { label: 'text-base font-bold' },
	};
</script>

<script lang="ts">
	const dispatch = createEventDispatcher();

	let _class: FieldRadiosConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldRadiosConfigClassesBySize = {};

	// export let invalidClass = 'border-stuic-primary';
	// export let labelClass = '';
	// export let descriptionClass = '';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let value: any;
	export let group: any;
	export let label: string;
	export let name: string;
	export let description = '';
	export let tabindex = 0;

	export let disabled = false;
	export let required = false;

	// const labelSizePreset = {
	// 	sm: 'text-sm',
	// 	md: 'text-base',
	// 	lg: 'text-base font-bold',
	// };

	//
	// export let validationMessageClass = '';
	export let validate: ValidateOptions | true | undefined = undefined;

	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => {
		validation = res;
		dispatch('validation', validation);
	};

	let id = getId();
	let idDesc = getId();

	//
	const _collectClasses = (k: keyof FieldRadiosConfigClasses, extra = '') => [
		_PRESET?.[k] || '',
		_PRESET_BY_SIZE?.[size]?.[k] || '',
		FieldRadiosConfig?.class?.[k] || '',
		FieldRadiosConfig?.classBySize?.[size]?.[k] || '',
		extra || '',
		_class?.[k] || '',
		classBySize?.[size]?.[k] || '',
	];

	$: _boxClass = twMerge(_collectClasses('box'));
	$: _inputClass = twMerge(
		_collectClasses(
			'input',
			validation && !validation.valid ? _collectClasses('invalid').join(' ') : ''
		)
	);
	$: _labelClass = twMerge(_collectClasses('label'));
	$: _validationMessageClass = twMerge(_collectClasses('validationMessage'));
	$: _descriptionClass = twMerge(_collectClasses('description'));
</script>

<div class={_boxClass}>
	<div class="flex h-6 items-center ml-1">
		<input
			{id}
			type="radio"
			{value}
			bind:group
			aria-describedby={description ? idDesc : undefined}
			{name}
			class={_inputClass}
			{disabled}
			{required}
			{tabindex}
			use:validateAction={validate
				? { ...(validate === true ? {} : validate), setValidationResult }
				: undefined}
		/>
	</div>
	<div class="ml-3 w-full">
		{#if label}
			<label
				for={id}
				class={_labelClass}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
			>
				<Thc thc={label} forceAsHtml />
			</label>
		{/if}
		{#if validation && !validation?.valid}
			<div transition:slide={{ duration: 150 }} class={_validationMessageClass}>
				{@html validation.message}
			</div>
		{/if}
		{#if description}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class={_descriptionClass}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
				on:click={() => !disabled && (group = value)}
			>
				<Thc thc={description} forceAsHtml />
			</div>
		{/if}
	</div>
</div>
