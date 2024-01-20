<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import {
		getId,
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from '../../index.js';
	import { slide } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let _class = '';
	export { _class as class };

	export let invalidClass = 'border-primary';
	export let labelClass = '';
	export let descriptionClass = '';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let value: any;
	export let group: any;
	export let label: string;
	export let name: string;
	export let description = '';
	export let tabindex = 0;

	export let disabled = false;
	export let required = false;

	const labelSizePreset = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-base font-bold',
	};

	//
	export let validationMessageClass = '';
	export let validate: ValidateOptions | true | undefined = undefined;

	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => {
		validation = res;
		dispatch('validation', validation);
	};

	let id = getId();
	let idDesc = getId();
</script>

<div class={twMerge(`flex items-start ${_class}`)}>
	<div class="flex h-6 items-center ml-1">
		<input
			{id}
			type="radio"
			{value}
			bind:group
			aria-describedby={description ? idDesc : undefined}
			{name}
			class={twMerge(`
				size-4 rounded-full
				bg-gray-100
				border-gray-300
				shadow-sm
				text-primary
				cursor-pointer
				focus:border-primary
				focus:ring-4
				focus:ring-offset-0
				focus:ring-primary
				focus:ring-opacity-20
				disabled:cursor-not-allowed
				${validation && !validation.valid ? invalidClass : ''}
			`)}
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
				class={twMerge(`block w-full ${labelSizePreset[size]} ${labelClass}`)}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
			>
				{@html label}
			</label>
		{/if}
		{#if validation && !validation?.valid}
			<div
				transition:slide={{ duration: 150 }}
				class={twMerge(`text-xs text-primary tracking-tight ${validationMessageClass}`)}
			>
				{@html validation.message}
			</div>
		{/if}
		{#if description}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class={twMerge(`text-sm opacity-50 ${descriptionClass}`)}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
				on:click={() => !disabled && (group = value)}
			>
				{@html description}
			</div>
		{/if}
	</div>
</div>
