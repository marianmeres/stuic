<script lang="ts" context="module">
	export class BackdropConfig {
		static class = '';
		static fadeInDuration = 50;
		static fadeOutDuration = 150;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import { focusTrap } from '../../actions/focus-trap.js';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';

	const dispatch = createEventDispatcher();

	export let useFocusTrap = true;

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
		fixed inset-0 flex z-10 
		${BackdropConfig.class} ${_class}
	`.trim())}
	on:click
	on:mousedown
	on:mouseup
	on:touchstart|passive
	on:touchend|passive
	on:keydown={(e) => e.code === 'Escape' && dispatch('escape')}
	in:fade={{ duration: fadeInDuration }}
	out:fade={{ duration: fadeOutDuration }}
	use:focusTrap={{ enabled: useFocusTrap }}
	role="presentation"
	tabindex="-1" 
>
	<slot />
</div>
