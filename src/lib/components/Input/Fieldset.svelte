<script context="module" lang="ts">
	import { twMerge } from 'tailwind-merge';
	import Thc from '../Thc/Thc.svelte';

	export interface FieldsetConfigClasses {
		box?: string;
		legend?: string;
	}

	const _PRESET: FieldsetConfigClasses = {
		box: `border border-gray-200 p-4 pt-3 rounded-md`,
		legend: `px-2`,
	};

	export class FieldsetConfig {
		static class: FieldsetConfigClasses = {};
	}
</script>

<script lang="ts">
	let _class: FieldsetConfigClasses = {};
	export { _class as class };

	export let legend = '';

	const _collectClasses = (k: keyof FieldsetConfigClasses, extra = '') => [
		_PRESET?.[k] || '',
		FieldsetConfig?.class?.[k] || '',
		_class?.[k] || '',
	];
</script>

<fieldset class={twMerge(_collectClasses('box'))}>
	{#if legend}
		<legend class={twMerge(_collectClasses('legend'))}>
			<Thc thc={legend} forceAsHtml />
		</legend>
	{/if}
	<slot />
</fieldset>
