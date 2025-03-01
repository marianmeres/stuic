<script lang="ts">
	import type { Snippet } from "svelte";
	import { DevicePointer } from "../../utils/device-pointer.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import { getViewport } from "../../utils/viewport.svelte.js";
	import { waitForNextRepaint, waitForTransitionEnd } from "../../utils/paint.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";

	interface Props {
		enabled?: boolean;
		class?: string;
		shadowOpacity?: number;
		duration?: number;
		targetWidth?: number;
		delayIn?: number;
		delayOut?: number;
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

	let {
		enabled = DevicePointer.isFine,
		shadowOpacity = 0.5,
		duration: _duration = 150,
		targetWidth = 256,
		delayIn = 400,
		delayOut = 400,
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
	let _timer: any;
	let box = $state<DOMRect>();
	let win: ReturnType<typeof getViewport>["rect"];
	let duration = $derived(prefersReduced.current ? 0 : _duration);

	function clear() {
		clearTimeout(_timer);
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
		if (isExpanding || isShrinking || isExpanded) return;

		// asap
		isExpanded = true;
		isExpanding = true;

		box = el.getBoundingClientRect();
		win ??= getViewport().rect;
		const pos = {
			top: box.top,
			bottom: win!.height - box.bottom,
			left: box.left,
			right: win!.width - box.right,
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

		el.style.zIndex = "1";

		// kind of ugly - need to set props in multiple steps...
		(async () => {
			await waitForNextRepaint();
			el.style.position = `fixed`;

			await waitForNextRepaint();
			el.style.width = `${box!.width}px`;

			await waitForNextRepaint();
			el.style.transitionProperty = "all";
			el.style.width = `${targetWidth}px`;

			await waitForTransitionEnd(el);
			isExpanding = false;
		})();
	}

	function shrink() {
		if (!enabled) return;
		if (isExpanding || isShrinking || !isExpanded) return;

		// asap
		isExpanded = false;
		isShrinking = true;

		el.style.boxShadow = "none";
		el.style.width = `${box!.width}px`;

		(async () => {
			await waitForTransitionEnd(el);
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
	style="width: 100%; height: 100%; transition-duration: {duration}ms;"
	aria-expanded={isExpanded}
	{...rest}
>
	{@render children({ isExpanded, isShrinking, isExpanding, inTransition })}
</div>
