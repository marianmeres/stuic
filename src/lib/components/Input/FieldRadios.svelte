<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import XFieldRadioInternal from './XFieldRadioInternal.svelte';
	import { createClog } from '@marianmeres/clog';
	import { getId } from '../../index.js';

	const clog = createClog('FieldRadio');

	interface Option {
		label: string;
		value?: string;
		description?: string;
	}
	export let options: (string | Option)[] = [];

	let _class = '';
	export { _class as class };

	export let optionClass = '';
	export let labelClass = '';
	export let descriptionClass = '';

	export let invalidClass = '';
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
	<div class={twMerge(`space-y-1 ${_class}`)}>
		{#each _options as o, i}
			<XFieldRadioInternal
				bind:group={value}
				{name}
				label={o.label}
				value={o.value || o.label}
				description={o.description}
				class={optionClass}
				{labelClass}
				{descriptionClass}
				{disabled}
				{tabindex}
				{required}
				{invalidClass}
				{size}
			/>
		{/each}
	</div>
{/if}
