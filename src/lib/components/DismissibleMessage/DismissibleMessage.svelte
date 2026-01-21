<script lang="ts" module>
	import type { THC } from "../Thc/Thc.svelte";

	export type MessageIntent = "destructive" | "warning" | "success" | "info";

	export interface Props {
		class?: string;
		classContent?: string;
		message: THC | Error | undefined | null;
		intent?: MessageIntent;
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
		message,
		intent,
		forceAsHtml = true,
		duration = 150,
		onDismiss = () => (message = ""),
	}: Props = $props();

	let _message = $derived(message ? String(message) : "");
	let _show = $derived(isTHCNotEmpty(_message));
</script>

{#if _show}
	<div
		class={twMerge("stuic-dismissible-message", "mb-4", classProps)}
		data-intent={intent}
		transition:slide={{ duration }}
	>
		<div class={twMerge("content", classContent)}>
			<Thc thc={_message} {forceAsHtml} />
		</div>

		{#if typeof onDismiss === "function"}
			<div class="dismiss">
				<Button
					x
					class="text-inherit!"
					variant="ghost"
					roundedFull
					size="sm"
					type="button"
					onclick={() => onDismiss()}
				/>
			</div>
		{/if}
	</div>
{/if}
