<script lang="ts" context="module">
	import { twMerge } from 'tailwind-merge';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export class ButtonConfig {
		static defaultSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
		static defaultShadow = false;
		static defaultRounded = true;
		static defaultVariant: string | undefined = undefined;

		// hover:brightness-[1.15]
		static presetBase = `
			text-base
			text-center whitespace-nowrap
			inline-flex justify-center items-center gap-x-1
			border border-transparent
			hover:brightness-[1.1]
			active:brightness-[0.95]
			disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:brightness-100
			no-underline
		`.trim();

		static presetSquare = 'p-0 aspect-square';

		static presetsRounded = {
			xs: 'rounded',
			sm: 'rounded',
			md: 'rounded-md',
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
			xs: 'px-2   py-0.5 text-xs',
			sm: 'px-3   py-1   text-sm',
			md: 'px-3.5 py-1   text-base',
			lg: 'px-4   py-1.5 text-lg',
			xl: 'px-4   py-2   text-xl',
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
		static variant: Record<string, string> = {};
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
		// variant && ButtonConfig.variant?.[variant],
		variant &&
			`${variant || ''}`.split(' ').reduce((m, v) => {
				m += ButtonConfig.variant?.[v] + ' ';
				return m;
			}, ''),
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
		on:click
		on:change
		on:keydown
		on:keyup
		on:touchstart|passive
		on:touchend
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
		{...$$restProps}
		on:click
		on:change
		on:keydown
		on:keyup
		on:touchstart|passive
		on:touchend
		on:touchcancel
		on:mouseenter
		on:mouseleave
	>
		<slot />
	</button>
{/if}
