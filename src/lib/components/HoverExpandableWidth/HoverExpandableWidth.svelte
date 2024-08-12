<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { DevicePointer } from '../../utils/device-pointer.js';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';
	import { twMerge2 } from '../../utils/tw-merge2.js';
	import { windowSize } from '../../utils/window-size.js';

	const clog = createClog('HoverExpandableWidth');
	const dispatch = createEventDispatcher();

	// master switch... if false nothing happens
	export let enabled = DevicePointer.isFine;

	//
	export let shadowOpacity = 0.5;

	// transition duration (default is matching the "transition-all" tw value)
	export let duration = 150;

	//
	export let targetWidth = 256;

	// delay before execution of expand/shrink
	export let delayIn = 400;
	export let delayOut = 100;

	//
	let _class = '';
	export { _class as class };

	//
	let _isExpanded = false;
	let _isShrinking = false;
	let _isExpanding = false;

	//
	let el: HTMLElement;

	//
	let _delayTimer: number | null;
	const _resetDelayTimer = () => {
		if (_delayTimer) clearTimeout(_delayTimer);
		_delayTimer = null;
	};
	const _planDelayedExec = (_fn: CallableFunction, _delay: number) => {
		_resetDelayTimer();
		_delayTimer = setTimeout(() => {
			_fn();
			_resetDelayTimer();
		}, _delay) as any;
	};

	let box: DOMRect;

	//
	const _expand = () => {
		if (!enabled) return;
		if (_isExpanding || _isShrinking || _isExpanded) return;

		_isExpanded = true; // asap
		_isExpanding = true;

		box = el.getBoundingClientRect();
		const win = get(windowSize);
		const pos = {
			top: box.top,
			bottom: win.height - box.bottom,
			left: box.left,
			right: win.width - box.right,
		};

		// <offset-x>, <offset-y>, <blur-radius>, <spread-radius>
		el.style.boxShadow = `16px 0 24px -16px rgb(0 0 0 / ${shadowOpacity})`;

		// kind of ugly - need to set props in multiple steps...

		// no transition yet
		el.style.top = `${pos.top}px`;
		el.style.right = `${pos.right}px`;
		el.style.bottom = `${pos.bottom}px`;
		el.style.left = `${pos.left}px`;

		el.style.width = 'auto';
		el.style.height = 'auto';

		el.style.zIndex = '1';

		setTimeout(
			() => (_isExpanding = false),
			duration + (1000 / 60) * 3 // 3 x raf
		);

		requestAnimationFrame(() => {
			// still no transition...
			el.style.position = `fixed`;
			requestAnimationFrame(() => {
				// still no transition...
				el.style.width = `${box.width}px`;
				requestAnimationFrame(() => {
					// transition now!
					!$prefersReducedMotionStore && (el.style.transitionProperty = 'all');
					el.style.width = `${targetWidth}px`;
				});
			});
		});
	};

	//
	const _shrink = () => {
		if (!enabled) return;
		if (_isExpanding || _isShrinking || !_isExpanded) return;

		_isExpanded = false; // asap
		_isShrinking = true;

		el.style.boxShadow = 'none';
		el.style.width = `${box.width}px`;

		setTimeout(() => {
			_isShrinking = false;

			// now reset all back to defaults
			el.style.position = `static`;

			el.style.top = 'auto';
			el.style.right = 'auto';
			el.style.bottom = 'auto';
			el.style.left = 'auto';

			el.style.width = '100%';
			el.style.height = '100%';

			el.style.zIndex = '0';
			el.style.transitionProperty = 'none';
		}, duration);
	};

	$: dispatch('change', _isExpanded);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	bind:this={el}
	on:mouseenter={() => _planDelayedExec(_expand, delayIn)}
	on:mouseleave={() => _planDelayedExec(_shrink, delayOut)}
	on:click
	aria-expanded={_isExpanded}
	class={twMerge2(`overflow-x-hidden overflow-y-auto ${_class}`)}
	style="width: 100%; height: 100%; transition-duration: {duration}ms;"
>
	<slot
		isExpanded={_isExpanded}
		isExpanding={_isExpanding}
		isShrinking={_isShrinking}
		inTransition={_isExpanding || _isShrinking}
	/>
</div>
