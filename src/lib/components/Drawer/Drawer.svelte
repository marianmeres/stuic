<script lang="ts">
	import { fly } from "svelte/transition";
	import { type FocusTrapOptions } from "../../actions/focus-trap.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Backdrop from "../Backdrop/Backdrop.svelte";
	import type { Snippet } from "svelte";
	import { onClickOutside } from "runed";

	const prefersReduced = prefersReducedMotion();
	const DEFAULT_POS = "left";

	interface Props {
		visible?: boolean;
		position?: "left" | "top" | "right" | "bottom";
		children: Snippet;
		class?: string;
		classBackdrop?: string;
		labelledby?: string;
		describedby?: string;
		transitionDuration?: number;
		// transitionEnabled?: boolean;
		elBackdrop?: HTMLDivElement;
		el?: HTMLDivElement;
		focusTrap?: boolean | FocusTrapOptions;
		// will be used in `fly` config. Ideally should match with the provided tw classes
		// to make the animation optimal. May include ccs units (will be considered as pixels otherwise).
		animOffset?: string | number;
		onEscape?: () => void;
		onOutside?: false | (() => void);
	}

	let {
		visible = $bindable(false),
		position = DEFAULT_POS,
		children,
		class: classProp,
		classBackdrop,
		labelledby,
		describedby,
		transitionDuration = 200,
		// transitionEnabled = true,
		elBackdrop = $bindable(),
		el = $bindable(),
		focusTrap,
		animOffset = "75vw",
		onEscape,
		onOutside,
	}: Props = $props();

	$effect(() => {
		if (prefersReduced.current) transitionDuration = 0;
	});

	// opinionated: make backdrop fade-in a little faster (but never longer than 200)... looks better
	let fadeInDuration = $derived(Math.min(transitionDuration * 0.7, 200));

	// prettier-ignore
	const _classPresetsBackdrop = {
		left:   `justify-start`,
		right:  `justify-end`,
		top:    `items-start`,
		bottom: `items-end`,
	};

	// prettier-ignore
	const _classPresets = {
		left:   `w-full sm:w-[75vw] h-full`,
		right:  `w-full sm:w-[75vw] h-full`,
        // top/bottom are full by default
		top:    `w-full             h-full`, //  sm:h-[75vh]
		bottom: `w-full             h-full`, //  sm:h-[75vh]
	};

	// prettier-ignore
	let _animPresets = $derived({
        left:   { x: `-${animOffset}`, y: 0 },
		right:  { x: animOffset,       y: 0 },
		top:    { x: 0,                y: `-${animOffset}`},
		bottom: { x: 0,                y: animOffset },
    });

	onClickOutside(
		() => el,
		() => {
			// explicit false means ignoring outside click
			if (typeof onOutside === "function") onOutside();
			else if (onOutside !== false) visible = false;
		}
	);

	let _classBackdrop = $derived(
		_classPresetsBackdrop[position] ?? _classPresetsBackdrop[DEFAULT_POS]
	);

	let _class = $derived(_classPresets[position] ?? _classPresets[DEFAULT_POS]);

	let flyOptions = $derived({
		duration: transitionDuration,
		...(_animPresets[position] ?? _animPresets[DEFAULT_POS]),
	});
</script>

<Backdrop
	bind:el={elBackdrop}
	{visible}
	class={twMerge(_classBackdrop, classBackdrop)}
	{focusTrap}
	{fadeInDuration}
	fadeOutDuration={transitionDuration}
	{onEscape}
>
	<div
		bind:this={el}
		aria-modal="true"
		role="dialog"
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		class={twMerge("overflow-y-auto", _class, classProp)}
		transition:fly={flyOptions}
	>
		{@render children()}
	</div>
</Backdrop>
