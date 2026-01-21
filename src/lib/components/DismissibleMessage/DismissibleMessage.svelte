<script lang="ts" module>
	import type { TW_COLORS } from "../../types.js";
	import type { THC } from "../Thc/Thc.svelte";

	export interface Props {
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
</script>

<script lang="ts">
	import { slide } from "svelte/transition";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";

	import Button from "../Button/Button.svelte";
	import "./index.css";

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
			"mb-4 rounded flex",
			"bg-(--stuic-dismissible-message-bg)",
			"border-(--stuic-dismissible-message-border)",
			"text-(--stuic-dismissible-message-text)",
			classProps
		)}
		style={theme
			? `
                    --stuic-dismissible-message-bg: var(--color-${theme}-100);
                    --stuic-dismissible-message-text: var(--color-${theme}-800);
                    --stuic-dismissible-message-border: var(--color-${theme}-500);
                `
			: ``}
		transition:slide={{ duration }}
	>
		<div class={twMerge("content", "flex-1 px-4 py-3", classContent)}>
			<Thc thc={_message} {forceAsHtml} />
		</div>

		{#if typeof onDismiss === "function"}
			<div class="p-3 flex flex-col items-center justify-center">
				<Button
					x
					variant="ghost"
					roundedFull
					type="button"
					onclick={() => onDismiss()}
					style="color: var(--color-{theme}-800)"
				/>
			</div>
		{/if}
	</div>
{/if}
