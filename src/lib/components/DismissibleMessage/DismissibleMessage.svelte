<script lang="ts" module>
	import type { THC } from "../Thc/Thc.svelte";

	export type MessageIntent = "destructive" | "warning" | "success" | "info";

	export interface Props {
		class?: string;
		classContent?: string;
		classIcon?: string;
		message: THC | Error | undefined | null;
		intent?: MessageIntent;
		forceAsHtml?: boolean;
		duration?: number;
		onDismiss?: (() => void) | null | false;
		withIcon?: boolean;
		iconFn?: (() => string) | false;
	}
</script>

<script lang="ts">
	import { slide } from "svelte/transition";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import Button from "../Button/Button.svelte";
	import {
		iconAlertWarning,
		iconAlertSuccess,
		iconAlertInfo,
		iconAlertError,
	} from "$lib/icons/index.js";

	const INTENT_ICONS: Record<MessageIntent, () => string> = {
		destructive: () => iconAlertError({ size: 29 }),
		warning: () => iconAlertWarning({ size: 29 }),
		success: () => iconAlertSuccess({ size: 29 }),
		info: () => iconAlertInfo({ size: 29 }),
	};

	let {
		class: classProps,
		classContent,
		classIcon,
		message,
		intent,
		forceAsHtml = true,
		duration = 150,
		onDismiss = () => (message = ""),
		withIcon,
		iconFn,
	}: Props = $props();

	let _message = $derived(message ? String(message) : "");
	let _show = $derived(isTHCNotEmpty(_message));

	let _iconHtml = $derived.by(() => {
		if (iconFn === false) return "";
		if (typeof iconFn === "function") return iconFn();
		if (withIcon && intent) return INTENT_ICONS[intent]?.();
		return "";
	});
</script>

{#if _show}
	<div
		class={twMerge("stuic-dismissible-message", "mb-4", classProps)}
		data-intent={intent}
		transition:slide={{ duration }}
	>
		{#if _iconHtml}
			<div class={twMerge("icon", classIcon)}>
				{@html _iconHtml}
			</div>
		{/if}

		<div class={twMerge("content", classContent)}>
			<Thc thc={_message} {forceAsHtml} />
		</div>

		{#if typeof onDismiss === "function"}
			<div class="dismiss">
				<Button
					x
					class="text-inherit"
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
