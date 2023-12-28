<script lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';
	import { windowSize } from '../../utils/window-size.js';
	import { twMerge } from 'tailwind-merge';

	const clog = createClog('HoverExpandableWidth');
	const dispatch = createEventDispatcher();

	// removing from api
	// export let force = false;

	//
	export let shadowOpacity = 0.5;

	//
	export let duration = 150;

	//
	export let targetWidth = 256;

	//
	let _class = '';
	export { _class as class };

	//
	$: _isExpanded = false;
	let _isShrinking = false;
	let _isExpanding = false;
	let _todo: null | CallableFunction;

	//
	let el: HTMLElement;

	const _maybeTodo = () => {
		if (typeof _todo === 'function') _todo();
		_todo = null;
	};

	//
	const _expand = () => {
		_todo = _expand;
		if (_isExpanding || _isShrinking || _isExpanded) return;

		_isExpanded = true; // asap
		_isExpanding = true;
		const box = el.getBoundingClientRect();
		const w = get(windowSize);
		const pos = {
			top: box.top,
			bottom: w.height - box.bottom,
			left: box.left,
			right: w.width - box.right,
		};

		// <offset-x>, <offset-y>, <blur-radius>, <spread-radius>
		el.style.boxShadow = `16px 0 24px -16px rgb(0 0 0 / ${shadowOpacity})`;

		// kind of ugly - need to set props in multiple steps...

		// no transition yet
		el.style.zIndex = `1`;
		el.style.top = `${pos.top}px`;
		el.style.right = `${pos.right}px`;
		el.style.bottom = `${pos.bottom}px`;
		el.style.left = `${pos.left}px`;
		el.style.width = 'auto';
		el.style.height = 'auto';

		setTimeout(
			() => {
				_isExpanding = false;
				// _isExpanded = true;
				_maybeTodo();
			},
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
		// if (force) return;
		_todo = _shrink;
		if (_isExpanding || _isShrinking || !_isExpanded) return;

		_isExpanded = false; // asap
		_isShrinking = true;
		el.style.position = `static`;
		el.style.zIndex = `auto`;
		el.style.top = 'auto';
		el.style.right = 'auto';
		el.style.bottom = 'auto';
		el.style.left = 'auto';
		el.style.width = '100%';
		el.style.height = '100%';
		el.style.boxShadow = 'none';

		setTimeout(() => {
			_isShrinking = false;
			el.style.transitionProperty = 'none';
			_maybeTodo();
		}, duration);
	};

	// $: force && _expand();
	$: dispatch('change', _isExpanded);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	bind:this={el}
	on:mouseenter={_expand}
	on:mouseleave={_shrink}
	on:click
	aria-expanded={_isExpanded}
	class={twMerge(`${_class}`)}
	style="width: 100%; height: 100%; transition-duration: {duration}ms;"
>
	<slot isExpanded={_isExpanded} inTransition={_isExpanding || _isShrinking} />
</div>
