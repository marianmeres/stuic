<script lang="ts" context="module">
	import { twMerge } from 'tailwind-merge';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export class ButtonConfig {
		static defaultSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
		static defaultShadow = false;
		static defaultRounded = true;
		static defaultVariant: string | undefined = undefined;

		static presetBase = `
			text-center 
			inline-flex items-center gap-x-2
			hover:brightness-[1.05]
			active:brightness-[0.95]
			disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:brightness-100
			no-underline
			border
			
			bg-zinc-200 text-black
			dark:bg-zinc-600 dark:text-white
			border-zinc-400 dark:border-zinc-500
		`.trim();

		static presetSquare = 'p-0 aspect-square justify-center';

		static presetsRounded = {
			xs: 'rounded',
			sm: 'rounded',
			md: 'rounded',
			lg: 'rounded-md',
			xl: 'rounded-lg',
		};

		static presetsShadow = {
			xs: 'shadow-sm dark:shadow-black',
			sm: 'shadow    dark:shadow-black',
			md: 'shadow    dark:shadow-black',
			lg: 'shadow-md dark:shadow-black',
			xl: 'shadow-md dark:shadow-black',
		};

		static presetsSize = {
			xs: 'px-2   py-0.5 leading-tight text-xs',
			sm: 'px-2.5 py-0.5 leading-normal text-sm',
			md: 'px-3   py-1   leading-normal text-sm',
			lg: 'px-4   py-1.5 leading-normal text-base',
			xl: 'px-4   py-2   leading-normal text-lg',
		};

		static classBySize = {
			xs: '',
			sm: '',
			md: '',
			lg: '',
			xl: '',
		};

		static class = '';

		// to be defined at consumer level...
		static variant: Record<string, string> = {
			primary: `
				bg-stuic-primary text-stuic-on-primary
				dark:bg-stuic-primary-dark dark:text-stuic-on-primary-dark
			`.trim(),
		};
	}
</script>

<script lang="ts">
	let _class = '';
	export { _class as class };

	export let href = '';
	export let type: HTMLButtonAttributes['type'] = 'button';

	export let shadow: boolean = ButtonConfig.defaultShadow;
	export let rounded: boolean | 'full' = ButtonConfig.defaultRounded;
	export let variant: string | undefined = ButtonConfig.defaultVariant;

	export let square: boolean = false;
	export let disabled: boolean = false;

	// button only
	export let value: string | undefined = undefined;

	const _whitelist = ['xs', 'sm', 'md', 'lg', 'xl'];
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = ButtonConfig.defaultSize;
	$: if (!_whitelist.includes(size)) size = ButtonConfig.defaultSize;

	let buttonClass: string;
	$: buttonClass = twMerge(
		ButtonConfig.presetBase,
		// either full, or config, or none
		rounded
			? rounded === 'full' || square
				? 'rounded-full'
				: ButtonConfig.presetsRounded[size]
			: '',
		//
		shadow && ButtonConfig.presetsShadow[size],
		//
		ButtonConfig.presetsSize[size],
		//
		ButtonConfig.classBySize[size],
		//
		ButtonConfig.class,
		//
		variant &&
			`${variant || ''}`.split(' ').reduce((m, v) => {
				m += ButtonConfig.variant?.[v] + ' ';
				return m;
			}, ' '),
		//
		square && ButtonConfig.presetSquare,
		//
		_class
	);
</script>

{#if href}
	<a
		{href}
		class={buttonClass}
		{...$$restProps}
		role="button"
		data-button-size={size}
		data-button-shadow={shadow}
		data-button-rounded={rounded}
		data-button-variant={variant}
		on:focus
		on:blur
		on:click
		on:change
		on:keydown
		on:keyup
		on:touchstart|passive
		on:touchend|passive
		on:touchmove|passive
		on:touchcancel
		on:mouseenter
		on:mouseleave
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={buttonClass}
		{value}
		data-button-size={size}
		data-button-shadow={shadow}
		data-button-rounded={rounded}
		data-button-variant={variant}
		{...$$restProps}
		on:focus
		on:blur
		on:click
		on:change
		on:keydown
		on:keyup
		on:touchstart|passive
		on:touchend|passive
		on:touchmove|passive
		on:touchcancel
		on:mouseenter
		on:mouseleave
	>
		<slot />
	</button>
{/if}
