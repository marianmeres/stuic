<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
		/** Array of visual states (HTML strings or Snippets) */
		states: Array<string | Snippet>;
		/** Index of the currently visible state (0-based) */
		active?: number;
		/** Transition duration in ms (default: 300). Set 0 to disable. */
		duration?: number;
		/** CSS transition-timing-function (default: "ease") */
		easing?: string;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the container */
		class?: string;
		/** Additional CSS classes for each state wrapper */
		stateClass?: string;
		/** Bindable root element reference */
		el?: HTMLSpanElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";

	let {
		states,
		active = $bindable(0),
		duration: durationProp = 300,
		easing = "ease",
		unstyled = false,
		class: classProp,
		stateClass,
		el = $bindable(),
		...rest
	}: Props = $props();

	const prefersReduced = prefersReducedMotion();
	let duration = $derived(prefersReduced.current ? 0 : durationProp);
	let _active = $derived(Math.max(0, Math.min(active, states.length - 1)));
</script>

<span
	bind:this={el}
	class={unstyled ? classProp : twMerge("stuic-icon-swap", classProp)}
	style:--stuic-icon-swap-duration="{duration}ms"
	style:--stuic-icon-swap-easing={easing}
	data-active={_active}
	{...rest}
>
	{#each states as state, i (i)}
		<span
			class={unstyled ? stateClass : twMerge("stuic-icon-swap-state", stateClass)}
			data-visible={i === _active ? "true" : undefined}
			aria-hidden={i !== _active}
		>
			{#if typeof state === "string"}
				{@html state}
			{:else}
				{@render state()}
			{/if}
		</span>
	{/each}
</span>
