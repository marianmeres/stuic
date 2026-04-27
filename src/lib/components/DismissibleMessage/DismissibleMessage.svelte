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
	import { untrack } from "svelte";
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
		onDismiss,
		withIcon,
		iconFn,
	}: Props = $props();

	// Track dismissal in local state instead of mutating the (non-bindable) `message`
	// prop. Mutating a destructured prop var creates a local shadow that Svelte 5
	// won't always overwrite when the parent re-passes the same value — so a user
	// who dismissed an error would never see the SAME error message again, even
	// after the parent re-set it. Keeping `_dismissed` separate sidesteps that and
	// makes the dismiss state reset cleanly whenever the message changes.
	let _message = $derived(message ? String(message) : "");
	let _dismissed = $state(false);
	let _show = $derived(isTHCNotEmpty(_message) && !_dismissed);

	// Reset the dismissed flag whenever the message changes — a new (or re-set)
	// message from the parent should re-show, even if the user previously dismissed.
	$effect(() => {
		void _message;
		untrack(() => {
			if (_dismissed) _dismissed = false;
		});
	});

	// Default dismiss handler hides the message locally. Parent state is left alone
	// (this prop isn't bindable). Consumers wanting parent-side cleanup pass their own.
	// `null`/`false` mean "no dismiss button" and are handled at the render site.
	let _onDismiss = $derived(
		typeof onDismiss === "function" ? onDismiss : () => (_dismissed = true)
	);

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
		role="alert"
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

		{#if onDismiss !== false && onDismiss !== null}
			<div class="dismiss">
				<Button
					x
					class="text-inherit"
					variant="ghost"
					roundedFull
					size="sm"
					type="button"
					onclick={() => _onDismiss()}
				/>
			</div>
		{/if}
	</div>
{/if}
