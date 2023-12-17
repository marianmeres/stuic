<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { createSwitchStore } from '@marianmeres/switch-store';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { prefersReducedMotionStore } from '../../utils/PrefersReducedMotion/PrefersReducedMotion.js';
	import Backdrop from '../Backdrop/Backdrop.svelte';

	export type DrawerStore = ReturnType<typeof createDrawerStore>;
	export const createDrawerStore = (open = false) => createSwitchStore<any>(open);
</script>

<script lang="ts">
	const clog = createClog('Drawer');
	const dispatch = createEventDispatcher();

	export let drawer: DrawerStore;
	export let position: 'left' | 'top' | 'right' | 'bottom' = 'left';

	// main container class
	let _class = '';
	export { _class as class };

	// Backdrop
	export let backdropClass: string = '';

	// A11y
	export let labelledby: string = '';
	export let describedby: string = '';

	// Transitions
	export let transitionDuration = 200;
	export let transitionEnabled = !$prefersReducedMotionStore;

	// opinionated: make backdrop fade-in a little faster, and never longer than 200... looks better
	$: fadeInDuration = transitionEnabled ? Math.min(transitionDuration * 0.66, 200) : 0;

	const _presetsClsBackdrop = {
		left: `justify-start`,
		right: `justify-end`,
		top: `items-start`,
		bottom: `items-end`,
	};

	const _presetsCls = {
		left: `w-full sm:w-[66%] h-full`,
		right: `w-full sm:w-[66%] h-full`,
		top: `w-full h-full sm:h-[66%]`,
		bottom: `w-full h-full sm:h-[66%]`,
	};

	// prettier-ignore
	$: _presetsAnim = {
		left:   { axis: 'x' } as any,
		right:  { axis: 'x' } as any,
		top:    { axis: 'y' } as any,
		bottom: { axis: 'y' } as any,
	};

	//
	let el: HTMLElement;
	$: if (el) dispatch('element', { drawer: el });
</script>

{#if $drawer.isOpen}
	<!-- prettier-ignore -->
	<Backdrop
		class={twMerge(`
			${_presetsClsBackdrop[position] || ''}  ${backdropClass}
		`.trim())}
		on:escape
		on:click={(e) => dispatch('backdrop_click')}
		{fadeInDuration}
		fadeOutDuration={transitionEnabled ? transitionDuration : 0}
		on:element
	>
		<!-- 
			svelte-ignore 
			a11y-click-events-have-key-events 
			a11y-no-noninteractive-element-interactions 
		-->
		<div
			bind:this={el}
			on:click|stopPropagation
			aria-modal="true" 
			role="dialog"
			aria-labelledby={labelledby}
			aria-describedby={describedby}
			transition:slide={{
				duration: transitionEnabled ? transitionDuration : 0,
				...(_presetsAnim[position] || {}),
			}}
			class={twMerge(`
				flex overflow-y-auto transition-transform
				${_presetsCls[position] || ''}  ${_class}
			`.trim())}
		>
			<slot />
		</div>
	</Backdrop>
{/if}
