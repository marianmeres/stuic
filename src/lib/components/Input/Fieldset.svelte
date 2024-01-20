<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let _class = '';
	export { _class as class };

	export let legend = '';
	export let legendClass = '';
</script>

<fieldset
	class={twMerge(`
        border border-gray-200 
        p-4 pt-3
        rounded-md
        ${_class}
    `)}
>
	{#if legend}
		<legend
			class={twMerge(`
                px-2
                ${legendClass}
            `)}
		>
			{@html legend}
		</legend>
	{/if}
	<slot />
</fieldset>
