<script lang="ts" context="module">
	export type SwitchPreHook = (previosValue: boolean) => Promise<void | boolean>;

	export class SwitchConfig {
		static defaultSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
		static defaultVariant: string | undefined = undefined;

		static presetBase = `
			relative inline-flex flex-shrink-0 items-center
			m-2
			rounded-full cursor-pointer
			transition-colors duration-100
			
			hover:brightness-[1.05] active:brightness-[0.95]
			disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:brightness-100

			bg-neutral-400 dark:bg-neutral-400
			data-[checked=true]:bg-stuic-primary dark:data-[checked=true]:bg-stuic-primary-dark
		`.trim();

		static presetsSize = {
			xs: 'h-4 w-7',
			sm: 'h-5 w-9',
			md: 'h-6 w-11',
			lg: 'h-7 w-14',
			xl: 'h-8 w-16',
		};

		static class = '';

		// to be defined at consumer level...
		static variant: Record<string, string> = {};

		// DOT

		static presetBaseDot = `
			block flex items-center justify-center
			translate-x-1 rounded-full  
			transition-all duration-100
			shadow
			bg-neutral-50 dark:bg-neutral-50
			text-neutral-950 dark:text-neutral-950
		`.trim();

		static presetsSizeDot = {
			// size + translate-x = width
			xs: 'size-2 data-[checked=true]:translate-x-4',
			sm: 'size-3 data-[checked=true]:translate-x-5',
			md: 'size-4 data-[checked=true]:translate-x-6',
			lg: 'size-5 data-[checked=true]:translate-x-8',
			xl: 'size-6 data-[checked=true]:translate-x-9',
		};

		static classDot = '';

		// to be defined at consumer level...
		static variantDot: Record<string, string> = {};
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { twMerge2 } from '../../utils/tw-merge2.js';

	let _class = '';
	export { _class as class };
	export let classDot: string = '';

	export let label: string = '';
	export let checked: boolean = false;
	export let disabled: boolean = false;
	export let tabindex = 0;
	export let variant: string | undefined = SwitchConfig.defaultVariant;

	export let stopPropagation = true;
	export let preventDefault = false;

	const _defaultNoopHook = () => Promise.resolve(undefined);
	export let preHook: SwitchPreHook = _defaultNoopHook;

	const _whitelist = ['xs', 'sm', 'md', 'lg', 'xl'];
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = SwitchConfig.defaultSize;
	$: if (!_whitelist.includes(size)) size = SwitchConfig.defaultSize;

	let switchClass: string;
	$: switchClass = twMerge2(
		SwitchConfig.presetBase,
		SwitchConfig.presetsSize[size],
		SwitchConfig.class,
		variant &&
			`${variant || ''}`.split(' ').reduce((m, v) => {
				m += SwitchConfig.variant?.[v] + ' ';
				return m;
			}, ''),
		_class
	);

	let dotClass: string;
	$: dotClass = twMerge2(
		SwitchConfig.presetBaseDot,
		SwitchConfig.presetsSizeDot[size],
		SwitchConfig.classDot,
		classDot
	);

	const dispatch = createEventDispatcher();
</script>

<button
	class={switchClass}
	type="button"
	role="switch"
	aria-checked={checked}
	class:checked
	data-checked={checked}
	data-size={size}
	{tabindex}
	{disabled}
	on:click={async (e) => {
		stopPropagation && e.stopPropagation();
		preventDefault && e.preventDefault();

		// ability to break execution (do the change) by returning explicit `false`
		if (typeof preHook === 'function' && (await preHook(checked)) === false) {
			return false;
		}

		checked = !checked;
		dispatch('change', checked);
	}}
	on:click
	on:keydown
	on:keyup
	on:touchstart|passive
	on:touchend|passive
	on:touchmove|passive
	on:touchcancel
	on:mouseenter
	on:mouseleave
>
	{#if label}<span class="sr-only">{@html label}</span>{/if}
	<span aria-hidden="true" data-checked={checked} data-size={size} class={dotClass}>
		{#if checked}
			<slot name="on" />
		{:else}
			<slot name="off" />
		{/if}
	</span>
</button>
