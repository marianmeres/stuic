<script lang="ts">
	import {
		BodyScroll,
		focusTrap as focusTrapAction,
		twMerge,
		waitForNextRepaint,
		type FocusTrapOptions,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { PressedKeys, watch } from "runed";
	import { onDestroy, onMount, tick, type Snippet } from "svelte";
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
		noScrollLock?: boolean;
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
		noScrollLock,
		...rest
	}: Props = $props();

	let _opener: undefined | null | HTMLElement = $state();

	// let keys = new PressedKeys();
	// let isEscapePressed = $derived(keys.has("Escape"));
	// $effect(() => {
	// 	if (isEscapePressed && typeof onEscape === "function") {
	// 		// clog("Executing onEscape...");
	// 		onEscape();
	// 	}
	// });

	$effect(() => {
		if (!transitionEnabled) {
			fadeInDuration = 0;
			fadeOutDuration = 0;
		}
	});

	export function close() {
		visible = false;
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		visible = true;
		setOpener(
			(openerOrEvent as any)?.currentTarget ?? openerOrEvent ?? document.activeElement
		);
	}

	export function setOpener(opener?: null | HTMLElement) {
		_opener = opener;
	}

	export function visibility() {
		return {
			get visible() {
				return visible;
			},
		};
	}

	watch(
		() => visible,
		(isVisible, wasVisible) => {
			if (wasVisible && !isVisible && _opener) {
				_opener?.focus();
				_opener = null;
			}
		}
	);

	$effect(() => {
		if (noScrollLock) return;
		visible ? BodyScroll.lock() : BodyScroll.unlock();
	});

	// we need onDestroy as well
	// Note, that this will also reset if nested... (which is not desired, but ignoring)
	onDestroy(BodyScroll.unlock);

	$effect(() => {
		function onkeydown(e: KeyboardEvent) {
			if (e.key === "Escape" && typeof onEscape === "function") {
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();
				onEscape();
			}
		}
		el?.addEventListener("keydown", onkeydown);
		return () => el?.removeEventListener("keydown", onkeydown);
	});
</script>

{#if visible}
	<div
		bind:this={el}
		role="presentation"
		tabindex="-1"
		class={twMerge("fixed inset-0 flex z-10 h-dvh", classProp)}
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
