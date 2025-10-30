<script lang="ts" module>
	interface BodyStyles {
		position: string | null;
		top: string | null;
		width: string | null;
		overflow: string | null;
	}

	function get_body_style(): BodyStyles {
		// const style = window.getComputedStyle(document.body);
		const style = document.body.style; // we want only explicitly defined, not computed
		return {
			position: style.position || null,
			top: style.top || null,
			width: style.width || null,
			overflow: style.overflow || null,
		};
	}

	function restore_body_styles(original: BodyStyles) {
		(["position", "top", "width", "overflow"] as (keyof BodyStyles)[]).forEach((k) => {
			if (original[k] !== null) {
				document.body.style[k] = original[k];
			} else {
				document.body.style.removeProperty(k);
			}
		});
	}
</script>

<script lang="ts">
	import {
		focusTrap as focusTrapAction,
		twMerge,
		waitForNextRepaint,
		type FocusTrapOptions,
	} from "$lib/index.js";
	import { createClog } from "@marianmeres/clog";
	import { PressedKeys, watch } from "runed";
	import { onDestroy, tick, type Snippet } from "svelte";
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

	// lock body scroll when open and restore back
	let _original: BodyStyles = {
		position: null,
		top: null,
		width: null,
		overflow: null,
	};

	function _restore() {
		const scrollY = document.body.style.top;
		restore_body_styles(_original);
		// Restore scroll position
		window.scrollTo(0, parseInt(scrollY || "0") * -1);
	}

	$effect(() => {
		if (noScrollLock) return;
		if (visible) {
			_original = get_body_style();
			const scrollY = window.scrollY;
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
		} else {
			_restore();
		}
		return _restore; // onDestroy as well
	});

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
