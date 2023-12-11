<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { focusTrap } from '../../actions/FocusTrap/focusTrap.js';
	import { fade, fly } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import type { DrawerStore, DrawerOptions } from './drawer.ts';
	import { prefersReducedMotionStore } from '../../utils/PrefersReducedMotion/PrefersReducedMotion.js';
	import type { SvelteEvent } from '../../types.js';

	const dispatch = createEventDispatcher();

	export let allowCloseOnEscape = true;

	export let drawerStore: DrawerStore;
	export let position: 'left' | 'top' | 'right' | 'bottom' = 'left';

	// Backdrop
	// export let bgBackdrop: string = '';
	// export let blur: string = '';
	// export let padding: string = '';
	// export let zIndex: string = 'z-40';

	// Drawer
	export let bgDrawer: string = '';
	export let border: string = '';
	export let rounded: string = '';
	export let shadow: string = '';
	export let width: string = '';
	export let height: string = '';
	// Regions
	export let regionBackdrop: string = '';
	export let regionDrawer: string = '';
	// A11y
	export let labelledby: string = '';
	export let describedby: string = '';

	// Transitions
	export let transitionDuration = 200;
	export let transitionEnabled = !$prefersReducedMotionStore;
	export let transitionOpacity = true;

	// prettier-ignore
	const presets = {
		top: { alignment: 'items-start', width: 'w-full', height: 'h-[50%]' },
		bottom: { alignment: 'items-end', width: 'w-full', height: ' h-[50%]' },
		left: { alignment: 'justify-start', width: 'w-[90%]', height: 'h-full' },
		right: { alignment: 'justify-end', width: 'w-[90%]', height: 'h-full' }
	};

	// Local
	// let elBackdrop: HTMLElement;
	let elDrawer: HTMLElement;
	let anim = { x: 0, y: 0 };

	// Record a record of default props on init
	// NOTE: these must stay in sync with the props implemented above.
	// prettier-ignore
	const propDefaults: any = {
		position,
		bgBackdrop, blur, padding,
		bgDrawer, border, rounded, shadow,
		width, height, transitionOpacity,
		regionBackdrop, regionDrawer,
		labelledby, describedby,
		transitionDuration
	};

	// Override provided props, else restore prop defaults
	// NOTE: these must stay in sync with the props implemented above.
	function applyProps(options: Partial<DrawerOptions>): void {
		// prettier-ignore
		[
			'position',
			// Backdrop
			// 'bgBackdrop', 'blur', 'padding', 'zIndex',
			// Drawer
			'bgDrawer', 'border', 'rounded', 'shadow', 'width', 'height',
			// Regions
			'regionBackdrop', 'regionDrawer',
			// A11y
			'labelledby', 'describedby',
			// Transitions
			'transitionDuration', 'transitionOpacity',
		].forEach((k) => (options as any)[k] || propDefaults[k]);
	}

	function applyAnimationSettings(): void {
		if (!BROWSER) return;
		// prettier-ignore
		switch (position) {
			case 'top':    anim = { x: 0, y: -window.innerWidth }; break;
			case 'bottom': anim = { x: 0, y: window.innerWidth }; break;
			case 'left':   anim = { x: -window.innerHeight, y: 0 }; break;
			case 'right':  anim = { x: window.innerHeight, y: 0 }; break;
			default: console.error('Error: unknown position property value.'); break;
		}
	}

	// function onDrawerInteraction(event: SvelteEvent<MouseEvent, HTMLDivElement>): void {
	// 	if (event.target === elBackdrop) {
	// 		drawerStore.close();
	// 		dispatch('backdrop', event);
	// 	} else {
	// 		dispatch('drawer', event);
	// 	}
	// }

	// function onKeydownWindow(event: SvelteEvent<KeyboardEvent, Window>): void {
	// 	if (!$drawerStore) return;
	// 	if (allowCloseOnEscape && event.code === 'Escape') drawerStore.close();
	// }

	//
	onMount(
		drawerStore.subscribe((settings: Partial<DrawerOptions>) => {
			if (settings.open !== true) return;
			applyProps(settings);
			applyAnimationSettings();
		})
	);
</script>

<!-- <svelte:window on:keydown={onKeydownWindow} /> -->

{#if $drawerStore.open === true}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- <div
		bind:this={elBackdrop}
		class="drawer-backdrop {classesBackdrop}"
		on:mousedown={onDrawerInteraction}
		on:touchstart|passive
		on:touchend|passive
		on:keypress
		in:dynamicTransition|local={{
			transition: fade,
			params: { duration },
			enabled: transitionEnabled && transitionOpacity,
		}}
		out:dynamicTransition|local={{
			transition: fade,
			params: { duration },
			enabled: transitionEnabled && transitionOpacity,
		}}
		use:focusTrap={true}
	> -->
	<div
		bind:this={elDrawer}
		class="drawer {classesDrawer}"
		data-testid="drawer"
		role="dialog"
		aria-modal="true"
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		in:dynamicTransition|local={{
			transition: fly,
			params: {
				x: anim.x,
				y: anim.y,
				duration,
				opacity: opacityTransition ? undefined : 1,
			},
			enabled: transitionEnabled,
		}}
		out:dynamicTransition|local={{
			transition: fly,
			params: {
				x: anim.x,
				y: anim.y,
				duration,
				opacity: opacityTransition ? undefined : 1,
				easing: cubicIn,
			},
			enabled: transitionEnabled,
		}}
	>
		<slot />
	</div>
	<!-- </div> -->
{/if}
