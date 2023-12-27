<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { prefersReducedMotionStore } from '../../utils/prefers-reduced-motion.js';

	const dispatch = createEventDispatcher();

	//
	export let position: 'left' | 'top' | 'right' | 'bottom' = 'left';

	//
	export let expandsOn: 'hover' | 'click' | 'both' = 'hover';

	//
	export let force = false;

	//
	let _class = '';
	export { _class as class };

	export let expandedClass = '';

	// prettier-ignore
	const _presetsCls = {
		left:   `left-0`,
		right:  `right-0`,
		top:    `top-0`,
		bottom: `bottom-0`,
	};

	//
	$: _isExpanded = !!force;
	const click = 'click';
	const hover = 'hover';
	const both = 'both';

	const _onHover = (flag: boolean) => {
		if (force) return (_isExpanded = true);
		if ([hover, both].includes(expandsOn)) _isExpanded = !!flag;
	};

	const _onClick = (e) => {
		if (force) return (_isExpanded = true);
		if ([click, both].includes(expandsOn)) _isExpanded = !_isExpanded;
	};

	$: dispatch('expanded', _isExpanded);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	on:mouseenter={() => _onHover(true)}
	on:mouseleave={() => _onHover(false)}
	on:click={_onClick}
	on:click
	aria-expanded={_isExpanded}
	class={twMerge(`
        absolute w-full h-full flex flex-col
        ${$prefersReducedMotionStore ? '' : 'transition-all'}
        ${_presetsCls[position] || ''} 
        ${_class}
        ${_isExpanded ? expandedClass : ''}
    `)}
>
	<slot isExpanded={_isExpanded} />
</div>
