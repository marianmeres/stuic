<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { FocusTrapOptions } from "../../actions/focus-trap.js";

	export interface Props {
		visible?: boolean;
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		/** Classes for the backdrop overlay element */
		classBackdrop?: string;
		/** Classes for the inner container (constrains content width) */
		classInner?: string;
		class?: string;
		classHeader?: string;
		classMain?: string;
		classFooter?: string;
		/** ID reference for aria-labelledby */
		labelledby?: string;
		/** ID reference for aria-describedby */
		describedby?: string;
		/** Transition duration in ms (respects prefers-reduced-motion) */
		transitionDuration?: number;
		elBackdrop?: HTMLDivElement;
		el?: HTMLDivElement;
		/** Enable focus trap, or pass options to customize behavior */
		focusTrap?: boolean | FocusTrapOptions;
		/** Called when Escape key is pressed while modal is open */
		onEscape?: undefined | (() => void);
		/** Disable body scroll lock when modal is open */
		noScrollLock?: boolean;
		/** Fires when the backdrop is clicked "directly" */
		onBackdropClick?: undefined | (() => void);
	}
</script>

<script lang="ts">
	import Backdrop from "../Backdrop/Backdrop.svelte";
	import { prefersReducedMotion } from "../../utils/prefers-reduced-motion.svelte.js";
	import { twMerge } from "../../utils/tw-merge.js";

	const prefersReduced = prefersReducedMotion();

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
		onBackdropClick,
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
		// "justify-center items-center bg-black/25 p-2 sm:p-4 md:p-[10vh] transition-all",
		"justify-center items-center bg-black/25 transition-all",
		"md:p-[10vh]",
		classBackdrop
	)}
	{focusTrap}
	fadeOutDuration={transitionDuration}
	{onEscape}
	{noScrollLock}
	{onBackdropClick}
>
	<div
		bind:this={el}
		role="dialog"
		aria-modal="true"
		aria-labelledby={labelledby}
		aria-describedby={describedby}
		class={twMerge(
			"overflow-x-hidden overflow-y-hidden flex flex-col",
			"w-full max-w-3xl",
			"h-dvh md:h-full",
			classInner
		)}
	>
		<div
			class={twMerge(
				"bg-white dark:bg-neutral-800",
				"flex flex-col overflow-hidden",
				"rounded-none md:rounded-md",
				"w-full flex-1 md:max-h-2/3",
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
