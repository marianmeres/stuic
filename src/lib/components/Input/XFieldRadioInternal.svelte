<script context="module" lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { ValidateOptions, ValidationResult } from '../../actions/validate.js';
	import { validate as validateAction } from '../../actions/validate.js';
	import { getId } from '../../utils/get-id.js';
	import { twMerge2 } from '../../utils/tw-merge2.js';
	import Thc from '../Thc/Thc.svelte';
	import {
		FieldRadiosConfig,
		type FieldRadiosConfigClasses,
		type FieldRadiosConfigClassesBySize,
	} from './FieldRadios.svelte';

	const _PRESET: FieldRadiosConfigClasses = {
		box: 'flex items-start',
		label: 'block w-full',
		input: `
			size-4 rounded-full
			bg-neutral-100
			border-neutral-300
			shadow-sm
			text-stuic-primary dark:text-stuic-primary-dark
			cursor-pointer
			focus:border-stuic-primary
			focus:ring-4
			focus:ring-offset-0
			focus:ring-stuic-primary
			focus:ring-opacity-20
			disabled:cursor-not-allowed
		`,
		validationMessage:
			'text-xs text-stuic-primary dark:text-stuic-primary-dark tracking-tight',
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
	const _collectClasses = (k: keyof FieldRadiosConfigClasses, extra = '') =>
		[
			_PRESET?.[k] || '',
			_PRESET_BY_SIZE?.[size]?.[k] || '',
			FieldRadiosConfig?.class?.[k] || '',
			FieldRadiosConfig?.classBySize?.[size]?.[k] || '',
			extra || '',
			_class?.[k] || '',
			classBySize?.[size]?.[k] || '',
		].join(' ');

	$: _boxClass = twMerge2(_collectClasses('box'));
	$: _inputClass = twMerge2(
		_collectClasses(
			'input',
			validation && !validation.valid ? _collectClasses('invalid') : ''
		)
	);
	$: _labelClass = twMerge2(_collectClasses('label'));
	$: _validationMessageClass = twMerge2(_collectClasses('validationMessage'));
	$: _descriptionClass = twMerge2(_collectClasses('description'));
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
