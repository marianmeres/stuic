<script lang="ts">
	import type { Snippet } from "svelte";
	import Backdrop from "../Backdrop/Backdrop.svelte";
	import { type FocusTrapOptions } from "../../actions/focus-trap.js";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";

	const prefersReduced = prefersReducedMotion();

	interface Props {
		visible?: boolean;
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		classBackdrop?: string;
		classInner?: string;
		class?: string;
		classHeader?: string;
		classMain?: string;
		classFooter?: string;

		labelledby?: string;
		describedby?: string;
		transitionDuration?: number;
		elBackdrop?: HTMLDivElement;
		el?: HTMLDivElement;
		focusTrap?: boolean | FocusTrapOptions;
		onEscape?: undefined | (() => void);

		noScrollLock?: boolean;
	}

	let {
		visible = $bindable(false),
		children,
		header,
		footer,
		classBackdrop,
		classInner,
		class: classProp,
		classHeader,
		classMain,
		classFooter,
		labelledby,
		describedby,
		transitionDuration = 100,
		// transitionEnabled = true,
		elBackdrop = $bindable(),
		el = $bindable(),
		focusTrap = true,
		onEscape,
		noScrollLock = false,
	}: Props = $props();

	let backdrop: Backdrop = $state()!;

	export function close() {
		backdrop.close();
	}

	export function open(openerOrEvent?: null | HTMLElement | MouseEvent) {
		backdrop.open(openerOrEvent);
	}

	export function setOpener(opener?: null | HTMLElement) {
		backdrop.setOpener(opener);
	}

	export function visibility() {
		return backdrop.visibility();
	}
</script>

<Backdrop
	bind:this={backdrop}
	bind:el={elBackdrop}
	bind:visible
	class={twMerge(
		"justify-center items-center bg-black/25 p-2 sm:p-4 md:p-[10vh] transition-all",
		classBackdrop
	)}
	{focusTrap}
	fadeOutDuration={transitionDuration}
	{onEscape}
	{noScrollLock}
>
	<div
		bind:this={el}
		role="dialog"
		aria-modal="true"
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		class={twMerge(
			"overflow-x-hidden overflow-y-hidden w-full h-full max-w-3xl",
			// "overflow-y-auto w-full h-full max-w-3xl max-h-[66vh] border",
			classInner
		)}
	>
		<div
			class={twMerge(
				"bg-white dark:bg-neutral-800 rounded-md flex flex-col overflow-hidden",
				"w-full max-h-full md:max-h-2/3",
				classProp
			)}
		>
			{#if header}
				<div class={twMerge("header", classHeader)}>
					{@render header()}
				</div>
			{/if}
			<div class={twMerge("main overflow-auto flex-1", classMain)}>
				{@render children()}
			</div>
			{#if footer}
				<div class={twMerge("footer", classFooter)}>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
</Backdrop>

<style>
	.main {
		scrollbar-width: thin;
	}
</style>
