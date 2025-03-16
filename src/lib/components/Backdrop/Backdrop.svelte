<script lang="ts">
	import {
		focusTrap as focusTrapAction,
		twMerge,
		type FocusTrapOptions,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { PressedKeys } from "runed";
	import { onMount, tick, untrack, type Snippet } from "svelte";
	import { fade } from "svelte/transition";

	const clog = createClog("Backdrop").debug;

	interface Props extends Record<string, any> {
		class?: string;
		focusTrap?: boolean | FocusTrapOptions;
		fadeInDuration?: number;
		fadeOutDuration?: number;
		transitionEnabled?: boolean;
		el?: HTMLDivElement;
		children?: Snippet;
		onEscape?: () => void;
		visible?: boolean;
	}

	let {
		class: classProp,
		focusTrap = true,
		fadeInDuration = 50,
		fadeOutDuration = 150,
		transitionEnabled = true,
		el = $bindable(),
		children,
		onEscape,
		visible = $bindable(false),
		...rest
	}: Props = $props();

	let keys = new PressedKeys();

	let isEscapePressed = $derived(keys.has("Escape"));
	$effect(() => {
		if (isEscapePressed && typeof onEscape === "function") {
			// clog("Executing onEscape...");
			onEscape();
		}
	});

	$effect(() => {
		if (!transitionEnabled) {
			fadeInDuration = 0;
			fadeOutDuration = 0;
		}
	});

	// $inspect("visible:", visible, "isEscapePressed:", isEscapePressed).with(clog);
</script>

{#if visible}
	<div
		bind:this={el}
		role="presentation"
		tabindex="-1"
		class={twMerge("fixed inset-0 flex z-10", classProp)}
		in:fade={{ duration: fadeInDuration }}
		out:fade={{ duration: fadeOutDuration }}
		use:focusTrapAction={{
			...(typeof focusTrap === "object" ? focusTrap : {}),
			enabled: typeof focusTrap === "boolean" ? focusTrap : !!focusTrap.enabled,
		}}
		{...rest}
	>
		{@render children?.()}
	</div>
{/if}
