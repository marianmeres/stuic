<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { focusTrap } from '../../actions/FocusTrap/focusTrap.js';
	import { prefersReducedMotionStore } from '../../utils/PrefersReducedMotion/PrefersReducedMotion.js';
	import { BackdropConfig } from './backdrop.js';

	const dispatch = createEventDispatcher();

	let _class = '';
	export { _class as class };

	// use zero to no transition
	export let fadeInDuration = BackdropConfig.fadeInDuration;
	export let fadeOutDuration = BackdropConfig.fadeOutDuration;
	export let transitionEnabled = !$prefersReducedMotionStore;

	$: if (!transitionEnabled) {
		fadeInDuration = 0;
		fadeOutDuration = 0;
	}

	let el: HTMLElement;
	$: if (el) dispatch('element', { backdrop: el });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- prettier-ignore -->
<div
	bind:this={el}
	class={twMerge(`
		fixed top-0 left-0 right-0 bottom-0 flex z-10 
		${BackdropConfig.class} ${_class}
	`.trim())}
	on:click
	on:mousedown
	on:touchstart|passive
	on:touchend|passive
	on:keydown={(e) => e.code === 'Escape' && dispatch('escape')}
	in:fade={{ duration: fadeInDuration }}
	out:fade={{ duration: fadeOutDuration }}
	use:focusTrap={true}
>
	<slot />
</div>
