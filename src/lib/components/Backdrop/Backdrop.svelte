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
	import { focusTrap, type FocusTrapOptions } from '../../actions/focus-trap.js';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';
	import { twMerge2 } from '../../utils/tw-merge2.js';

	const dispatch = createEventDispatcher();

	// may be overriden by `focusTrapOptions.enabled` below
	export let useFocusTrap = true;

	// higher priority over `useFocusTrap` above
	export let focusTrapOptions: Partial<FocusTrapOptions> = {};

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
	class={twMerge2(`
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
	use:focusTrap={{ enabled: useFocusTrap, ...(focusTrapOptions || {}) }}
	role="presentation"
	tabindex="-1" 
>
	<slot />
</div>
