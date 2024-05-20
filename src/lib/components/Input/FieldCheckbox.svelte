<script context="module" lang="ts">
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import type { ValidateOptions, ValidationResult } from '../../actions/validate.js';
	import { validate as validateAction } from '../../actions/validate.js';
	import { getId } from '../../utils/get-id.js';
	import type { THC } from '../Thc/Thc.svelte';
	import Thc from '../Thc/Thc.svelte';

	export interface FieldCheckboxConfigClasses {
		box?: string;
		label?: string;
		input?: string;
		invalid?: string;
		validationMessage?: string;
		description?: string;
	}
	export interface FieldCheckboxConfigClassesBySize {
		sm?: FieldCheckboxConfigClasses;
		md?: FieldCheckboxConfigClasses;
		lg?: FieldCheckboxConfigClasses;
	}

	const _emptyClasses = (): FieldCheckboxConfigClasses => ({
		box: '',
		label: '',
		input: '',
		invalid: '',
		validationMessage: '',
		description: '',
	});

	const _PRESET: FieldCheckboxConfigClasses = {
		box: 'flex items-start mb-4',
		label: 'block w-full',
		input: `
			size-4 rounded
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

	const _PRESET_BY_SIZE: FieldCheckboxConfigClassesBySize = {
		sm: { label: 'text-sm' },
		md: { label: 'text-base' },
		lg: { label: 'text-base font-bold' },
	};

	export class FieldCheckboxConfig {
		static class: FieldCheckboxConfigClasses = _emptyClasses();
		static classBySize: FieldCheckboxConfigClassesBySize = {
			sm: _emptyClasses(),
			md: _emptyClasses(),
			lg: _emptyClasses(),
		};
	}
</script>

<script lang="ts">
	let _class: FieldCheckboxConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldCheckboxConfigClassesBySize = {};

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let checked = false;
	export let label: THC = '';
	export let name = '';
	export let description: THC = '';
	export let tabindex = 0;

	export let disabled: boolean | undefined = undefined;
	export let readonly: boolean | undefined = undefined;
	export let required: boolean | undefined = undefined;

	//
	export let validate: ValidateOptions | true | undefined = undefined;

	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let idDesc = getId();

	const _collectClasses = (k: keyof FieldCheckboxConfigClasses, extra = '') => [
		_PRESET?.[k] || '',
		_PRESET_BY_SIZE?.[size]?.[k] || '',
		FieldCheckboxConfig?.class?.[k] || '',
		FieldCheckboxConfig?.classBySize?.[size]?.[k] || '',
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
			type="checkbox"
			bind:checked
			aria-checked={checked}
			aria-describedby={description ? idDesc : undefined}
			{name}
			class={_inputClass}
			{disabled}
			{readonly}
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
		{#if description || $$slots.description}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class={_descriptionClass}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
				on:click={() => !disabled && (checked = !checked)}
			>
				{#if $$slots.description}
					<slot name="description" />
				{:else}
					<Thc thc={description} forceAsHtml />
				{/if}
			</div>
		{/if}
	</div>
</div>
