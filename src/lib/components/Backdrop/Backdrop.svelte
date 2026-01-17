<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FocusTrapOptions } from "../../actions/focus-trap.js";

	export interface Props extends Record<string, any> {
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

	// Stack to track visible Backdrops - only topmost handles Escape
	const escapeStack: Set<symbol> = new Set();
</script>

<script lang="ts">
	import { BodyScroll, focusTrap as focusTrapAction, twMerge } from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { watch } from "runed";
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	const clog = createClog("Backdrop").debug;

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

	// Unique ID for this Backdrop instance
	const instanceId = Symbol();

	$effect(() => {
		if (!visible || typeof onEscape !== "function") return;

		// Add to stack when visible
		escapeStack.add(instanceId);

		function onkeydown(e: KeyboardEvent) {
			// Skip if already handled by another component (ModalDialog, DropdownMenu, etc.)
			if (e.defaultPrevented) return;

			// Only handle if this is the topmost Backdrop
			const stack = [...escapeStack];
			if (stack[stack.length - 1] !== instanceId) return;

			if (e.key === "Escape") {
				e.preventDefault();
				onEscape?.();
			}
		}

		window.addEventListener("keydown", onkeydown);
		return () => {
			escapeStack.delete(instanceId);
			window.removeEventListener("keydown", onkeydown);
		};
	});

	let focusTrapOptions: FocusTrapOptions = $derived.by(() => {
		let opts = { enabled: true };
		if (typeof focusTrap === "boolean") {
			opts.enabled = focusTrap;
		} else if (typeof focusTrap === "object") {
			opts = { ...opts, ...focusTrap };
		}
		return opts;
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
		use:focusTrapAction={focusTrapOptions}
		{...rest}
	>
		{@render children?.()}
	</div>
{/if}
