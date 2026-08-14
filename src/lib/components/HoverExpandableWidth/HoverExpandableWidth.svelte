<script lang="ts" module>
	import type { Snippet } from "svelte";

	export interface Props {
		enabled?: boolean;
		class?: string;
		shadowOpacity?: number;
		duration?: number;
		targetWidth?: number;
		delayIn?: number;
		delayOut?: number;
		zIndex?: number;
		children: Snippet<
			[
				{
					isExpanded: boolean;
					isExpanding: boolean;
					isShrinking: boolean;
					inTransition: boolean;
				},
			]
		>;
	}
</script>

<script lang="ts">
	import {
		fixedContainingBlockAncestor,
		fixedContainingBlockRect,
	} from "../../utils/containing-block.js";
	import { DevicePointer } from "../../utils/device-pointer.svelte.js";
	import { waitForNextRepaint, waitForTransitionEnd } from "../../utils/paint.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";

	const dp = new DevicePointer();

	let {
		enabled = dp.isFine,
		shadowOpacity = 0.5,
		duration: _duration = 150,
		targetWidth = 256,
		delayIn = 500,
		delayOut = 300,
		zIndex = 10,
		class: classProp,
		children,
		...rest
	}: Props = $props();

	//
	const prefersReduced = prefersReducedMotion();
	let el = $state<HTMLDivElement>()!;
	let isExpanded = $state(false);
	let isShrinking = $state(false);
	let isExpanding = $state(false);
	let inTransition = $derived(isExpanding || isShrinking);
	let _timer: ReturnType<typeof setTimeout> | null = null;
	let box = $state<DOMRect>();
	let duration = $derived(prefersReduced.current ? 0 : _duration);

	$effect(() => {
		return () => clear();
	});

	function clear() {
		if (_timer) clearTimeout(_timer);
		_timer = null;
	}

	function schedule(fn: CallableFunction, delay: number) {
		clear();
		_timer = setTimeout(() => {
			fn?.();
			clear();
		}, delay);
	}

	function expand() {
		if (!enabled) return;
		if (!el) return;
		if (isExpanding || isShrinking || isExpanded) return;

		// asap
		isExpanded = true;
		isExpanding = true;

		// Pin the element in place: the inset values below resolve against the
		// containing block once `position: fixed` is applied — the viewport,
		// unless an ancestor (`transform`, `contain: layout|paint`, …)
		// establishes one. Insets are LAYOUT px in the CB's content space, while
		// rects are visual: divide out the accumulated ancestor scale, add the
		// CB's scroll offsets (a fixed element whose CB is a scroll container
		// behaves like an absolute one — it scrolls with the content), and
		// derive bottom/right from the CB size so the top+height+bottom
		// constraint stays exact. With no CB ancestor this reduces to the plain
		// viewport-edge distances.
		box = el.getBoundingClientRect();
		const cbEl = fixedContainingBlockAncestor(el);
		const cb = fixedContainingBlockRect(el);
		const sx =
			el.offsetWidth && Math.abs(box.width - el.offsetWidth) > 1
				? box.width / el.offsetWidth
				: 1;
		const sy =
			el.offsetHeight && Math.abs(box.height - el.offsetHeight) > 1
				? box.height / el.offsetHeight
				: 1;
		const top = (box.top - cb.top) / sy + (cbEl?.scrollTop ?? 0);
		const left = (box.left - cb.left) / sx + (cbEl?.scrollLeft ?? 0);
		const pos = {
			top,
			left,
			bottom: cb.height / sy - top - box.height / sy,
			right: cb.width / sx - left - box.width / sx,
		};

		// <offset-x>, <offset-y>, <blur-radius>, <spread-radius>
		el.style.boxShadow = `16px 0 24px -16px rgb(0 0 0 / ${shadowOpacity})`;

		// no transition yet
		el.style.top = `${pos.top}px`;
		el.style.right = `${pos.right}px`;
		el.style.bottom = `${pos.bottom}px`;
		el.style.left = `${pos.left}px`;

		el.style.width = "auto";
		el.style.height = "auto";

		el.style.zIndex = `${zIndex}`;

		// kind of ugly - need to set props in multiple steps...
		(async () => {
			await waitForNextRepaint();
			if (!el) return;
			el.style.position = `fixed`;

			await waitForNextRepaint();
			if (!el) return;
			el.style.width = `${box!.width}px`;

			await waitForNextRepaint();
			if (!el) return;
			el.style.transitionProperty = "all";
			el.style.width = `${targetWidth}px`;

			await waitForTransitionEnd(el);
			if (!el) return;
			isExpanding = false;
		})();
	}

	function shrink() {
		if (!enabled) return;
		if (!el) return;
		if (!box) return;
		if (isExpanding || isShrinking || !isExpanded) return;

		// asap
		isExpanded = false;
		isShrinking = true;

		el.style.boxShadow = "none";
		el.style.width = `${box!.width}px`;

		(async () => {
			await waitForTransitionEnd(el);
			if (!el) return;
			isShrinking = false;

			// now reset all back to defaults
			el.style.position = `static`;

			el.style.top = "auto";
			el.style.right = "auto";
			el.style.bottom = "auto";
			el.style.left = "auto";

			el.style.width = "100%";
			el.style.height = "100%";

			el.style.zIndex = "0";
			el.style.transitionProperty = "none";
		})();
	}
</script>

<div
	bind:this={el}
	onmouseenter={() => schedule(expand, delayIn)}
	onmouseleave={() => schedule(shrink, delayOut)}
	class={twMerge("stuic-expandable", "overflow-x-hidden overflow-y-auto", classProp)}
	style="width: 100%; height: 100%; transition-timing-function: ease-in; transition-duration: {duration}ms;"
	aria-expanded={isExpanded}
	{...rest}
>
	{@render children({ isExpanded, isShrinking, isExpanding, inTransition })}
</div>
