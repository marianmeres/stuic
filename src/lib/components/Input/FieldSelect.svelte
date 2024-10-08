<script context="module" lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { ValidateOptions, ValidationResult } from '../../actions/validate.js';
	import { validate as validateAction } from '../../actions/validate.js';
	import { getId } from '../../utils/get-id.js';
	import { twMerge2 } from '../../utils/tw-merge2.js';
	import type { THC } from '../Thc/Thc.svelte';
	import Thc from '../Thc/Thc.svelte';

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

	const _emptyClasses = (): FieldSelectConfigClasses => ({
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

	const _PRESET: FieldSelectConfigClasses = {
		box: 'mb-4 grid', // gap-4
		wrap: `
            rounded-md border border-neutral-300 dark:border-neutral-600
            bg-neutral-100 dark:bg-neutral-700
            focus-within:border-stuic-primary
            focus-within:ring-4
            focus-within:ring-stuic-primary
            focus-within:ring-opacity-20
		`,
		label: `block flex-1 px-2 mb-1`,
		input: `
			rounded-md border-0 block w-full flex-1
			bg-neutral-100 dark:bg-neutral-700
			tracking-tight
			focus:outline-0 focus-visible:ring-0
			placeholder:text-neutral-950/35 dark:placeholder:text-neutral-50/35
			placeholder:tracking-tight
		`,
		invalid: `border-stuic-primary`,
		validationMessage: `my-1 text-xs text-stuic-primary px-2 tracking-tight`,
		description: `mx-2 mt-1 text-sm opacity-50`,
		below: `mx-2 my-1`,
		asterix: `after:content-['*'] after:opacity-30 after:pl-1`,
	};

	const _PRESET_BY_SIZE: FieldSelectConfigClassesBySize = {
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

	export class FieldSelectConfig {
		//
		static class: FieldSelectConfigClasses = _emptyClasses();
		static classBySize: FieldSelectConfigClassesBySize = {
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
	const clog = createClog('FieldSelect');
	const dispatch = createEventDispatcher();

	interface Option {
		label: string;
		value?: string;
		optgroup?: string;
	}
	export let options: (string | Option)[] = [];

	let _class: FieldSelectConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldSelectConfigClassesBySize = {};

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

	export let labelLeft = FieldSelectConfig.labelLeft;
	export let labelLeftWidth: 'normal' | 'wide' = FieldSelectConfig.labelLeftWidth;

	//
	let validation: ValidationResult;
	const setValidationResult = (res: ValidationResult) => (validation = res);

	const _normalizeAndGroupOptions = (opts: (string | Option)[]) => {
		const groupped = new Map<string, Option[]>();
		opts.forEach((v) => {
			if (typeof v === 'string') v = { label: v };
			if (v.value === undefined) v.value = v.label;
			const optgLabel = v.optgroup || '';
			if (!groupped.has(optgLabel)) groupped.set(optgLabel, []);
			const optgroup = groupped.get(optgLabel);
			optgroup!.push(v);
		});
		return groupped;
	};

	//
	let _options: Map<string, Option[]>;
	$: _options = _normalizeAndGroupOptions(options);

	let _inputEl: HTMLInputElement | HTMLTextAreaElement;
	$: if (_inputEl) dispatch('input_mounted', _inputEl);

	//
	const _collectClasses = (k: keyof FieldSelectConfigClasses, extra = '') =>
		[
			_PRESET?.[k] || '',
			_PRESET_BY_SIZE?.[size]?.[k] || '',
			FieldSelectConfig?.class?.[k] || '',
			FieldSelectConfig?.classBySize?.[size]?.[k] || '',
			extra || '',
			_class?.[k] || '',
			classBySize?.[size]?.[k] || '',
		].join(' ');

	$: _boxClass = twMerge2(_collectClasses('box'));

	$: _labelClass = twMerge2(
		_collectClasses(
			'label',
			showAsterixOnRequired && required ? _collectClasses('asterix') : ''
		)
	);

	$: _wrapClass = twMerge2(
		_collectClasses(
			'wrap',
			validation && !validation.valid ? _collectClasses('invalid') : ''
		)
	);

	$: _inputClass = twMerge2('form-input', _collectClasses('input'));
	$: _validationMessageClass = twMerge2(_collectClasses('validationMessage'));
	$: _descriptionClass = twMerge2(_collectClasses('description'));
	$: _belowClass = twMerge2(_collectClasses('below'));
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
				<select
					class={_inputClass}
					bind:value
					bind:this={_inputEl}
					{id}
					{disabled}
					{required}
					{tabindex}
					{autofocus}
					{name}
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
					on:touchcancel
					on:mouseenter
					on:mouseleave
				>
					{#each _options as [_optgroup, _opts]}
						{#if _optgroup}
							<optgroup label={_optgroup}>
								{#each _opts as o}
									<option value={o.value}>{o.label}</option>
								{/each}
							</optgroup>
						{:else}
							{#each _opts as o}
								<option value={o.value}>{o.label}</option>
							{/each}
						{/if}
					{/each}
				</select>

				<slot name="input_after" {id} />
			</div>
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
