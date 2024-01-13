<script lang="ts" context="module">
	import { twMerge } from 'tailwind-merge';

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

			bg-zinc-300 dark:bg-zinc-700
			data-[checked=true]:bg-zinc-700 dark:data-[checked=true]:bg-zinc-300
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
			bg-white dark:bg-black
			text-black dark:text-white
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

	type Hook = (previosValue: boolean) => Promise<void | boolean>;
	const _defaultNoopHook = () => Promise.resolve(undefined);
	export let preHook: Hook = _defaultNoopHook;

	const _whitelist = ['xs', 'sm', 'md', 'lg', 'xl'];
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = SwitchConfig.defaultSize;
	$: if (!_whitelist.includes(size)) size = SwitchConfig.defaultSize;

	let switchClass: string;
	$: switchClass = twMerge(
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
	$: dotClass = twMerge(
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
	on:touchend
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
