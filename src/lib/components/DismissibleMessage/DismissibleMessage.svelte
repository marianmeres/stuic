<script lang="ts" context="module">
	import { slide } from 'svelte/transition';
	import { twMerge2 } from '../../utils/tw-merge2.js';
	import type { TW_COLORS } from '../../utils/tw-types.js';
	import Thc, { isTHCNotEmpty, type THC } from '../Thc/Thc.svelte';
	import X from '../X/X.svelte';

	// prettier-ignore
	const themes = {
		primary:   'bg-stuic-primary      text-stuic-on-primary   dark:bg-stuic-primary-dark   dark:text-stuic-on-primary-dark',
		secondary: 'bg-stuic-secondary    text-stuic-on-secondary dark:bg-stuic-secondary-dark dark:text-stuic-on-secondary-dark',
		slate:     'bg-slate-100          text-slate-800          dark:bg-slate-700            dark:text-slate-100',
		gray:      'bg-gray-100           text-gray-800           dark:bg-gray-700             dark:text-gray-100',
		zinc:      'bg-zinc-100           text-zinc-800           dark:bg-zinc-700             dark:text-zinc-100',
		neutral:   'bg-neutral-100        text-neutral-800        dark:bg-neutral-700          dark:text-neutral-100',
		stone:     'bg-stone-100          text-stone-800          dark:bg-stone-700            dark:text-stone-100',
		red:       'bg-red-100            text-red-800            dark:bg-red-800              dark:text-red-100',
		orange:    'bg-orange-100         text-orange-800         dark:bg-orange-800           dark:text-orange-100',
		amber:     'bg-amber-100          text-amber-800          dark:bg-amber-800            dark:text-amber-100',
		yellow:    'bg-yellow-100         text-yellow-800         dark:bg-yellow-800           dark:text-yellow-50',
		lime:      'bg-lime-100           text-lime-800           dark:bg-lime-800             dark:text-lime-100',
		green:     'bg-green-100          text-green-800          dark:bg-green-800            dark:text-green-100',
		emerald:   'bg-emerald-100        text-emerald-800        dark:bg-emerald-800          dark:text-emerald-50',
		teal:      'bg-teal-100           text-teal-800           dark:bg-teal-800             dark:text-teal-50',
		cyan:      'bg-cyan-100           text-cyan-800           dark:bg-cyan-800             dark:text-cyan-50',
		sky:       'bg-sky-100            text-sky-800            dark:bg-sky-800              dark:text-sky-50',
		blue:      'bg-blue-100           text-blue-800           dark:bg-blue-800             dark:text-blue-100',
		indigo:    'bg-indigo-100         text-indigo-800         dark:bg-indigo-800           dark:text-indigo-100',
		violet:    'bg-violet-100         text-violet-800         dark:bg-violet-800           dark:text-violet-100',
		purple:    'bg-purple-100         text-purple-800         dark:bg-purple-800           dark:text-purple-100',
		fuchsia:   'bg-fuchsia-100        text-fuchsia-800        dark:bg-fuchsia-800          dark:text-fuchsia-100',
		pink:      'bg-pink-100           text-pink-800           dark:bg-pink-800             dark:text-pink-100',
		rose:      'bg-rose-100           text-rose-800           dark:bg-rose-800             dark:text-rose-100',
	};

	const _PRESET = {
		box: `mb-4 rounded flex text-sm`,
		content: `flex-1 px-4 py-3`,
		dismiss: `
			hover:bg-neutral-950/5 dark:hover:bg-neutral-950/20
			focus-visible:bg-neutral-950/5 focus-visible:hover:bg-neutral-950/20 focus-visible:ring-0
			rounded rounded-l-none
			px-3
			flex items-center justify-center
			group
		`,
		x: `opacity-75 group-hover:opacity-100`,
	};

	export class DismissibleMessageConfig {
		static class = {
			box: ``,
			content: ``,
			dismiss: ``,
			x: ``,
		};
	}
</script>

<script lang="ts">
	let _class: {
		box?: string;
		content?: string;
		dismiss?: string;
		x?: string;
	} = {};
	export { _class as class };

	export let duration = 150;
	export let message: THC | Error;

	export let onDismiss: (() => void) | null | false = () => (message = '');

	export let theme: 'primary' | 'secondary' | TW_COLORS = 'primary';

	// pragmatic shortcut to THC
	export let forceAsHtml: boolean = false;

	// special pragmatic case
	$: if (message instanceof Error) message = message.toString();

	// basic {#if _isNotEmpty(message)} didn't slide in the first render if this component
	// was conditionally rendered (not sure why)... so hacking around it
	let show = false;
	$: if (isTHCNotEmpty(message)) {
		requestAnimationFrame(() => (show = true));
	} else {
		show = false;
	}

	const _collectClasses = (k: 'box' | 'content' | 'dismiss' | 'x', extra = '') => [
		(_PRESET as any)?.[k],
		(DismissibleMessageConfig as any)?.class?.[k],
		extra,
		(_class as any)?.[k],
	];
</script>

<!-- {#if isNotEmpty(message)} -->
{#if show}
	<div
		class={twMerge2(_collectClasses('box', themes[theme] ?? themes.primary))}
		transition:slide={{ duration }}
	>
		<div class={twMerge2(_collectClasses('content'))}>
			<Thc thc={message} {forceAsHtml} />
		</div>

		{#if typeof onDismiss === 'function'}
			<button class={twMerge2(_collectClasses('dismiss'))} on:click={() => onDismiss()}>
				<X class={twMerge2(_collectClasses('x'))} strokeWidth={1.5} />
			</button>
		{/if}
	</div>
{/if}
