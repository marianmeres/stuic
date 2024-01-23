<script lang="ts">
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { Thc, X, type THC, type TW_COLORS } from '../../index.js';

	let _class = '';
	export { _class as class };
	export let classContent = '';
	export let classDismiss = '';

	export let duration = 150;
	export let message: THC | null;

	export let onDismiss: (() => void) | null = () => (message = null);

	export let theme: 'primary' | 'secondary' | TW_COLORS = 'primary';

	// prettier-ignore
	const preset = {
		primary:   'bg-stuic-primary/10   text-stuic-primary   dark:bg-stuic-primary   dark:text-white/90',
		secondary: 'bg-stuic-secondary/10 text-stuic-secondary dark:bg-stuic-secondary dark:text-white/90',
		slate:     'bg-slate-100          text-slate-800       dark:bg-slate-700       dark:text-slate-100',
		gray:      'bg-gray-100           text-gray-800        dark:bg-gray-700        dark:text-gray-100',
		zinc:      'bg-zinc-100           text-zinc-800        dark:bg-zinc-700        dark:text-zinc-100',
		neutral:   'bg-neutral-100        text-neutral-800     dark:bg-neutral-700     dark:text-neutral-100',
		stone:     'bg-stone-100          text-stone-800       dark:bg-stone-700       dark:text-stone-100',
		red:       'bg-red-100            text-red-800         dark:bg-red-800         dark:text-red-100',
		orange:    'bg-orange-100         text-orange-800      dark:bg-orange-800      dark:text-orange-100',
		amber:     'bg-amber-100          text-amber-800       dark:bg-amber-800       dark:text-amber-100',
		yellow:    'bg-yellow-100         text-yellow-800      dark:bg-yellow-800      dark:text-yellow-50',
		lime:      'bg-lime-100           text-lime-800        dark:bg-lime-800        dark:text-lime-100',
		green:     'bg-green-100          text-green-800       dark:bg-green-800       dark:text-green-100',
		emerald:   'bg-emerald-100        text-emerald-800     dark:bg-emerald-800     dark:text-emerald-50',
		teal:      'bg-teal-100           text-teal-800        dark:bg-teal-800        dark:text-teal-50',
		cyan:      'bg-cyan-100           text-cyan-800        dark:bg-cyan-800        dark:text-cyan-50',
		sky:       'bg-sky-100            text-sky-800         dark:bg-sky-800         dark:text-sky-50',
		blue:      'bg-blue-100           text-blue-800        dark:bg-blue-800        dark:text-blue-100',
		indigo:    'bg-indigo-100         text-indigo-800      dark:bg-indigo-800      dark:text-indigo-100',
		violet:    'bg-violet-100         text-violet-800      dark:bg-violet-800      dark:text-violet-100',
		purple:    'bg-purple-100         text-purple-800      dark:bg-purple-800      dark:text-purple-100',
		fuchsia:   'bg-fuchsia-100        text-fuchsia-800     dark:bg-fuchsia-800     dark:text-fuchsia-100',
		pink:      'bg-pink-100           text-pink-800        dark:bg-pink-800        dark:text-pink-100',
		rose:      'bg-rose-100           text-rose-800        dark:bg-rose-800        dark:text-rose-100',
	};
</script>

{#if message}
	<div
		class={twMerge(`
			mb-4 rounded flex
            text-sm
			${preset[theme] ?? preset.primary} 
			${_class}
		`)}
		transition:slide={{ duration }}
	>
		<div class={twMerge(`flex-1 px-4 py-3 ${classContent}`)}>
			<Thc thc={message} />
		</div>

		{#if typeof onDismiss === 'function'}
			<button
				class={twMerge(`
					hover:bg-black/5 dark:hover:bg-black/20
					rounded rounded-l-none
					px-3
					flex items-center justify-center
					group
                    ${classDismiss}
                `)}
				on:click={() => onDismiss()}
			>
				<X class="opacity-75 group-hover:opacity-100" strokeWidth={1.5} />
			</button>
		{/if}
	</div>
{/if}
