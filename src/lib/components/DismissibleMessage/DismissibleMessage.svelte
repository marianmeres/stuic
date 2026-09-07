<script lang="ts" module>
	import type { THC } from "../Thc/Thc.svelte";

	export type MessageIntent = "destructive" | "warning" | "success" | "info";

	export interface Props {
		class?: string;
		classContent?: string;
		classIcon?: string;
		/**
		 * Message content. Any THC form — a string, `{ text }`, `{ html }`, `{ component }`,
		 * `{ snippet }` or a bare snippet — is handed to `Thc` as-is; an `Error` is rendered
		 * as `String(error)`. Empty/nullish renders nothing.
		 */
		message: THC | Error | undefined | null;
		intent?: MessageIntent;
		/** Render a string or `{ text }` message via `{@html}` (snippets/components ignore it). */
		forceAsHtml?: boolean;
		duration?: number;
		onDismiss?: (() => void) | null | false;
		withIcon?: boolean;
		iconFn?: (() => string) | false;
		/** Accessible name (`aria-label` + `title`) of the built-in dismiss button. */
		dismissLabel?: string;
	}
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { slide } from "svelte/transition";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { getTHCStringContent, isTHCNotEmpty } from "../Thc/Thc.svelte";
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
		dismissLabel = "Dismiss",
	}: Props = $props();

	// Only the non-THC member of the union needs coercing. Every THC form is passed to
	// `Thc` intact — `String()`-ing the whole union used to flatten the object forms to
	// "[object Object]" and a snippet to its source text.
	let _message: THC = $derived(
		message instanceof Error ? String(message) : (message ?? "")
	);

	// Track dismissal in local state instead of mutating the (non-bindable) `message`
	// prop. Mutating a destructured prop var creates a local shadow that Svelte 5
	// won't always overwrite when the parent re-passes the same value — so a user
	// who dismissed an error would never see the SAME error message again, even
	// after the parent re-set it. Keeping `_dismissed` separate sidesteps that and
	// makes the dismiss state reset cleanly whenever the message changes.
	let _dismissed = $state(false);
	let _show = $derived(isTHCNotEmpty(_message) && !_dismissed);

	// Reset the dismissed flag whenever the message changes — a new (or re-set)
	// message from the parent should re-show, even if the user previously dismissed.
	//
	// Keyed on the string content where there is one (string, Error, `{ text }`,
	// `{ html }`), so an inline object literal — a new object on every parent render —
	// does not re-show a dismissed message on unrelated state changes. Component and
	// snippet forms have no string content and fall back to identity: a re-created
	// snippet is a message rebuilt from new data and re-shows.
	let _resetKey = $derived(getTHCStringContent(_message) || _message);
	$effect(() => {
		void _resetKey;
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
					title={dismissLabel}
					aria-label={dismissLabel}
					onclick={() => _onDismiss()}
				/>
			</div>
		{/if}
	</div>
{/if}
