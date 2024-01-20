<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import {
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from '../../index.js';
	import { slide } from 'svelte/transition';
	import { getId } from '../../index.js';

	let _class = '';
	export { _class as class };

	export let invalidClass = 'border-primary';
	export let labelClass = '';
	export let descriptionClass = '';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let checked = false;
	export let label = '';
	export let name = '';
	export let description = '';
	export let tabindex = 0;

	export let disabled: boolean | undefined = undefined;
	export let readonly: boolean | undefined = undefined;
	export let required: boolean | undefined = undefined;

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
	const setValidationResult = (res: ValidationResult) => (validation = res);

	let idDesc = getId();
</script>

<div class={twMerge(`flex items-start mb-4 ${_class}`)}>
	<div class="flex h-6 items-center ml-1">
		<input
			{id}
			type="checkbox"
			bind:checked
			aria-checked={checked}
			aria-describedby={description ? idDesc : undefined}
			{name}
			class={twMerge(`
				size-4 rounded
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
			{readonly}
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
		{#if description || $$slots.description}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class={twMerge(`text-sm opacity-50 ${descriptionClass}`)}
				class:cursor-pointer={!disabled}
				class:cursor-not-allowed={disabled}
				on:click={() => !disabled && (checked = !checked)}
			>
				{#if $$slots.description}
					<slot name="description" />
				{:else}
					{@html description}
				{/if}
			</div>
		{/if}
	</div>
</div>
