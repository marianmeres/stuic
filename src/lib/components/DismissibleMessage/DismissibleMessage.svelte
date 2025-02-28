<script lang="ts">
	import { slide } from "svelte/transition";
	import type { TW_COLORS } from "../../types.js";
	import Thc, { isTHCNotEmpty, type THC } from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	import "./dismiss.css";

	interface Props {
		class?: string;
		classContent?: string;
		classDismiss?: string;
		classX?: string;
		message: THC | Error;
		theme?: TW_COLORS;
		forceAsHtml?: boolean;
		duration?: number;
		onDismiss?: (() => void) | null | false;
	}

	let {
		class: classProps,
		classContent,
		classDismiss,
		classX,
		message,
		theme,
		forceAsHtml = true,
		duration = 150,
		onDismiss = () => (message = ""),
	}: Props = $props();

	let _message = $derived(`${message}`);
	let _show = $derived(isTHCNotEmpty(_message));
</script>

{#if _show}
	<div
		class={twMerge(
			"stuic-dismissible-message",
			`mb-4 rounded flex text-sm 
            bg-dismiss-bg dark:bg-dismiss-bg-dark 
            border-dismiss-border dark:border-dismiss-border-dark 
            text-dismiss-text dark:text-dismiss-text-dark`,
			classProps
		)}
		style={theme
			? `
                    --color-dismiss-bg: var(--color-${theme}-100, var(--color-neutral-200));
                    --color-dismiss-bg-dark: var(--color-${theme}-800, var(--color-neutral-700));

                    --color-dismiss-text: var(--color-${theme}-800, var(--color-neutral-700));
                    --color-dismiss-text-dark: var(--color-${theme}-100, var(--color-neutral-200));

                    --color-dismiss-border: var(--color-${theme}-500, var(--color-neutral-500));
                    --color-dismiss-border-dark: var(--color-${theme}-500, var(--color-neutral-500));
                `
			: ""}
		transition:slide={{ duration }}
	>
		<div class={twMerge("content", "flex-1 px-4 py-3", classContent)}>
			<Thc thc={_message} {forceAsHtml} />
		</div>

		{#if typeof onDismiss === "function"}
			<button
				onclick={() => onDismiss()}
				class={twMerge(
					"dismiss",
					`hover:bg-neutral-950/5 dark:hover:bg-neutral-950/20
                    focus-visible:bg-neutral-950/5 focus-visible:hover:bg-neutral-950/20 focus-visible:ring-0
                    rounded rounded-l-none
                    px-3
                    flex items-center justify-center
                    group`,
					classDismiss
				)}
			>
				<X
					class={twMerge("x", "opacity-75 group-hover:opacity-100", classX)}
					strokeWidth={1.5}
				/>
			</button>
		{/if}
	</div>
{/if}
