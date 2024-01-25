<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import {
		getId,
		validate as validateAction,
		type ValidateOptions,
		type ValidationResult,
	} from '../../index.js';

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

	let _class = '';
	export { _class as class };
	export let wrapClass = '';
	export let invalidClass = 'border-stuic-primary';

	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let id = getId();
	export let value: any; // badInput
	export let label = '';
	export let name = '';
	export let tabindex = 0;

	export let description = '';
	export let descriptionClass = '';

	export let disabled = false;
	export let required = false; // valueMissing
	export let autofocus: true | undefined = undefined;

	//
	export let validationMessageClass = '';
	export let validate: ValidateOptions | true | undefined = undefined;
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
	$: inputClass = twMerge(`
		rounded-md border-0 block w-full flex-1
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
					labelSizePreset[size]
				)}
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
		class={twMerge(`
            flex items-center
            rounded-md border border-gray-300
            bg-gray-100
            focus-within:border-stuic-primary
            focus-within:ring-4
            focus-within:ring-stuic-primary
            focus-within:ring-opacity-20
			${wrapClass}
			${validation && !validation.valid ? invalidClass : ''}
        `)}
		class:cursor-not-allowed={disabled}
		class:opacity-50={disabled}
	>
		<slot name="input_before" {id} />
		<select
			class={inputClass}
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
