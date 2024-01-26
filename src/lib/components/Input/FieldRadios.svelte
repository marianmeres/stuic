<script context="module" lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { twMerge } from 'tailwind-merge';
	import { getId } from '../../index.js';
	import XFieldRadioInternal from './XFieldRadioInternal.svelte';

	export interface FieldRadiosConfigClasses {
		group?: string;
		box?: string;
		label?: string;
		input?: string;
		invalid?: string;
		validationMessage?: string;
		description?: string;
	}
	export interface FieldRadiosConfigClassesBySize {
		sm?: FieldRadiosConfigClasses;
		md?: FieldRadiosConfigClasses;
		lg?: FieldRadiosConfigClasses;
	}

	export class FieldRadiosConfig {
		static class: FieldRadiosConfigClasses;
		static classBySize: FieldRadiosConfigClassesBySize;
	}
</script>

<script lang="ts">
	const clog = createClog('FieldRadio');

	interface Option {
		label: string;
		value?: string;
		description?: string;
	}
	export let options: (string | Option)[] = [];

	let _class: FieldRadiosConfigClasses = {};
	export { _class as class };
	export let classBySize: FieldRadiosConfigClassesBySize = {};

	//
	$: if (typeof _class === 'string') {
		_class = { group: _class };
	}

	// export let invalidClass = '';
	export let size: 'sm' | 'md' | 'lg' = 'md';

	export let name = '';
	export let value: any;

	export let disabled = false;
	export let required = false;
	export let tabindex = 0;

	// validate not supported here

	//
	let _options: Option[] = [];
	$: _options = options.map((v) => {
		if (typeof v === 'string') {
			v = { label: v };
		}
		return v;
	});

	$: name ||= getId();
</script>

{#if options.length}
	<div class={twMerge(`gap-y-2 grid ${_class.group || ''}`)}>
		{#each _options as o, i}
			<XFieldRadioInternal
				bind:group={value}
				{name}
				label={o.label}
				value={o.value || o.label}
				description={o.description}
				class={_class}
				{classBySize}
				{disabled}
				{tabindex}
				{required}
				{size}
			/>
		{/each}
	</div>
{/if}
