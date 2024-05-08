<script lang="ts" context="module">
	import { createClog } from '@marianmeres/clog';
	import { createSwitchStore } from '@marianmeres/switch-store';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { onOutside } from '../../actions/on-outside.js';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';
	import Backdrop from '../Backdrop/Backdrop.svelte';
	import type { FocusTrapOptions } from '../../actions/focus-trap.js';

	export type DrawerStore = ReturnType<typeof createDrawerStore>;
	export const createDrawerStore = (open = false) => createSwitchStore<any>(open);
</script>

<script lang="ts">
	const clog = createClog('Drawer');
	const dispatch = createEventDispatcher();

	export let drawer: DrawerStore;
	export let position: 'left' | 'top' | 'right' | 'bottom' = 'left';

	const _whitelist = ['left', 'top', 'right', 'bottom'];
	$: if (!_whitelist.includes(position)) position = 'left';

	// main container class
	let _class = '';
	export { _class as class };

	// Backdrop
	export let backdropClass: string = '';

	// A11y
	export let labelledby: string = '';
	export let describedby: string = '';

	// Transitions
	export let transitionDuration = 250;
	export let transitionEnabled = !$prefersReducedMotionStore;

	// will be used in `fly` config. Ideally should match with the provided tw classes
	// to make the animation optimal. May include ccs units (will be considered as pixels otherwise).
	export let animOffset: string | number = '66vw';

	//
	export let backdropFocusTrapOptions: Partial<FocusTrapOptions> = {};

	// opinionated: make backdrop fade-in a little faster (but never longer than 200)... looks better
	$: fadeInDuration = transitionEnabled ? Math.min(transitionDuration * 0.66, 200) : 0;

	// prettier-ignore
	const _presetsClsBackdrop = {
		left:   `justify-start`,
		right:  `justify-end`,
		top:    `items-start`,
		bottom: `items-end`,
	};

	// sm	640px
	// md	768px
	// lg	1024px
	// xl	1280px

	// prettier-ignore
	const _presetsCls = {
		left:   `w-full sm:w-[66vw] h-full`,
		right:  `w-full sm:w-[66vw] h-full`,
		top:    `w-full             h-full sm:h-[66vh]`,
		bottom: `w-full             h-full sm:h-[66vh]`,
	};

	// prettier-ignore
	$: _presetsAnim = {
		left:   { x: `-${animOffset}`, y: 0 },
		right:  { x: animOffset,       y: 0 },
		top:    { x: 0,                y: `-${animOffset}`},
		bottom: { x: 0,                y: animOffset },
	};

	//
	let el: HTMLElement;
	$: if (el) dispatch('element', { drawer: el });
</script>

{#if $drawer.isOpen}
	<Backdrop
		class={twMerge(`${_presetsClsBackdrop[position] || ''} ${backdropClass}`)}
		on:escape
		on:mousedown={(e) => dispatch('click_backdrop')}
		{fadeInDuration}
		fadeOutDuration={transitionEnabled ? transitionDuration : 0}
		on:element
		focusTrapOptions={backdropFocusTrapOptions}
	>
		<!-- 
			svelte-ignore 
			a11y-click-events-have-key-events 
			a11y-no-noninteractive-element-interactions 
		-->
		<div
			bind:this={el}
			on:mousedown|stopPropagation
			aria-modal="true"
			role="dialog"
			aria-labelledby={labelledby}
			aria-describedby={describedby}
			transition:fly={{
				duration: transitionEnabled ? transitionDuration : 0,
				...(_presetsAnim[position] || {}),
			}}
			class={twMerge(`overflow-y-auto ${_presetsCls[position] || ''} ${_class}`)}
			use:onOutside
		>
			<slot />
		</div>
	</Backdrop>
{/if}
