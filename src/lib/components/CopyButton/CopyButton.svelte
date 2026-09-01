<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type { THC } from "../Thc/Thc.svelte";
	import type { TranslateFn } from "../../types.js";
	import type { Props as ButtonProps } from "../Button/Button.svelte";
	import type { TooltipConfig } from "../../actions/tooltip/tooltip.svelte.js";

	/** Feedback phase the button is in. Exposed as `data-state` and to `children`. */
	export type CopyButtonState = "idle" | "copied" | "error";

	/** What to copy: a string, or a getter (sync or async) resolved on click. */
	export type CopyButtonText = string | (() => string | Promise<string>);

	export interface Props extends Omit<
		ButtonProps,
		| "children"
		| "onclick"
		| "href"
		| "target"
		| "checked"
		| "roleSwitch"
		| "iconSwap"
		| "x"
		| "nav"
		| "spinner"
		| "spinnerOnly"
		| "tooltip"
	> {
		/**
		 * The text to copy. A getter is resolved on click (sync or async) — use it for
		 * values that are expensive to build or only known at click time. Keep async
		 * getters fast: browsers gate clipboard writes on the user gesture.
		 */
		text: CopyButtonText;
		/**
		 * Visible label next to the icon. Without it the button is icon-only and gets
		 * an accessible name from `t("copy")`. Pass `true` for the localized default
		 * ("Copy").
		 */
		label?: THC | true;
		/** Label while in the "copied" state (default: `t("copied")`). Only with `label`. */
		labelCopied?: THC;
		/** Label while in the "error" state (default: `t("copy_failed")`). Only with `label`. */
		labelError?: THC;
		/** Idle icon as an svg/html string (default: copy icon). `false` renders no icons. */
		icon?: string | false;
		/** "copied" icon (default: check). `false` hides it; omitted follows `icon === false`. */
		iconCopied?: string | false;
		/** "error" icon (default: ×). `false` hides it; omitted follows `icon === false`. */
		iconError?: string | false;
		/**
		 * How long the copied/error feedback stays (ms, default 2000). `0` keeps it until
		 * the next click.
		 */
		feedbackDuration?: number;
		/** Button intent while "copied" (default `"success"`). `false` keeps `intent`. */
		intentCopied?: IntentColorKey | false;
		/** Button intent while in "error" (default `"destructive"`). `false` keeps `intent`. */
		intentError?: IntentColorKey | false;
		/** Fired after a successful copy, with the text that was copied. */
		onCopied?: (text: string) => void;
		/** Fired when the copy failed (clipboard unavailable, permission denied, getter threw). */
		onError?: (error: unknown) => void;
		/**
		 * Plain click hook, called before copying. Call `e.preventDefault()` to skip the
		 * copy for this click.
		 */
		onclick?: (e: MouseEvent) => void;
		/**
		 * Tooltip (the stuic `tooltip` action), state-aware: it reads "Copy" while idle
		 * and flips to "Copied" / "Copy failed" with the feedback — live, while it is
		 * showing. `true` uses those localized texts; a string replaces the idle text
		 * only; a `TooltipConfig` gives full control (position, class, …) and only
		 * falls back to the state text when it returns no `content`; `false` disables.
		 * Default: on for icon-only buttons, off when a `label` or `children` already
		 * carry the feedback.
		 */
		tooltip?: boolean | string | TooltipConfig;
		/** i18n translate function (see `createCopyButtonT`) */
		t?: TranslateFn;
		/** Override the whole button content; receives the current feedback state. */
		children?: Snippet<[{ state: CopyButtonState; copied: boolean }]>;
		/** Class for the icon wrapper */
		classIcon?: string;
		/** Class for the label wrapper */
		classLabel?: string;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { copyToClipboard } from "../../utils/copy-to-clipboard.js";
	import { iconCopy, iconCheck, iconX } from "../../icons/index.js";
	import Button from "../Button/Button.svelte";
	import Thc from "../Thc/Thc.svelte";
	import { t_default } from "./i18n.js";

	let {
		text,
		label,
		labelCopied,
		labelError,
		icon,
		iconCopied,
		iconError,
		feedbackDuration = 2000,
		intentCopied = "success",
		intentError = "destructive",
		onCopied,
		onError,
		onclick,
		tooltip: tooltipProp,
		t = t_default,
		children,
		intent,
		variant = "ghost",
		size = "sm",
		disabled,
		unstyled = false,
		class: classProp,
		classIcon: classIconProp,
		classLabel: classLabelProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let phase = $state<CopyButtonState>("idle");
	// Live-region text. Cleared on reset so the next feedback is a fresh announcement.
	let announcement = $state("");

	let timer: ReturnType<typeof setTimeout> | undefined;
	// Click sequence — a click whose async work finishes after a newer click has
	// started must not overwrite that newer click's feedback.
	let seq = 0;

	function clearTimer() {
		if (timer) clearTimeout(timer);
		timer = undefined;
	}

	function setFeedback(next: Exclude<CopyButtonState, "idle">) {
		clearTimer();
		phase = next;
		announcement = next === "copied" ? t("copied") : t("copy_failed");
		if (feedbackDuration > 0) {
			timer = setTimeout(() => {
				timer = undefined;
				phase = "idle";
				announcement = "";
			}, feedbackDuration);
		}
	}

	async function handleClick(e: MouseEvent) {
		onclick?.(e);
		if (e.defaultPrevented) return;

		const id = ++seq;
		try {
			// A plain string (or sync getter) is written synchronously within the click —
			// Safari wants the clipboard write close to the user gesture.
			const maybe = typeof text === "function" ? text() : text;
			const value =
				typeof (maybe as Promise<string>)?.then === "function"
					? await (maybe as Promise<string>)
					: (maybe as string);
			await copyToClipboard(value);
			if (id !== seq) return;
			setFeedback("copied");
			onCopied?.(value);
		} catch (err) {
			if (id !== seq) return;
			setFeedback("error");
			onError?.(err);
		}
	}

	// pending feedback reset must not fire into an unmounted component
	$effect(() => clearTimer);

	let copied = $derived(phase === "copied");

	let _intent = $derived.by(() => {
		if (phase === "copied") return intentCopied === false ? intent : intentCopied;
		if (phase === "error") return intentError === false ? intent : intentError;
		return intent;
	});

	let _label: THC | undefined = $derived.by(() => {
		if (!label) return undefined;
		if (phase === "copied") return labelCopied ?? t("copied");
		if (phase === "error") return labelError ?? t("copy_failed");
		return label === true ? t("copy") : label;
	});

	let _icon: string | undefined = $derived.by(() => {
		const base = icon === false ? undefined : (icon ?? iconCopy());
		if (phase === "copied") {
			if (iconCopied === false) return undefined;
			return iconCopied ?? (icon === false ? undefined : iconCheck());
		}
		if (phase === "error") {
			if (iconError === false) return undefined;
			return iconError ?? (icon === false ? undefined : iconX());
		}
		return base;
	});

	let _iconOnly = $derived(!children && !label);

	// The localized text for the current phase — the icon-only accessible name and
	// the default tooltip content.
	let _stateText = $derived(
		phase === "copied" ? t("copied") : phase === "error" ? t("copy_failed") : t("copy")
	);

	// One stable config closure (the tooltip action keeps the function it was mounted
	// with and re-reads it reactively) that branches on the prop inside.
	const _tooltipConfig: TooltipConfig = () => {
		if (tooltipProp === false || (tooltipProp === undefined && !_iconOnly)) {
			return { enabled: false };
		}
		if (typeof tooltipProp === "function") {
			const cfg = tooltipProp();
			return { ...cfg, content: cfg.content ?? _stateText };
		}
		return {
			enabled: true,
			content:
				phase === "idle" && typeof tooltipProp === "string" ? tooltipProp : _stateText,
		};
	};

	let _class = $derived(unstyled ? classProp : twMerge("stuic-copy-button", classProp));
	let _classIcon = $derived(
		unstyled ? classIconProp : twMerge("stuic-copy-button-icon", classIconProp)
	);
	let _classLabel = $derived(
		unstyled ? classLabelProp : twMerge("stuic-copy-button-label", classLabelProp)
	);
</script>

{#snippet content()}
	{#if children}
		{@render children({ state: phase, copied })}
	{:else}
		{#if _icon}
			<span class={_classIcon} aria-hidden="true">{@html _icon}</span>
		{/if}
		{#if _label !== undefined}
			<span class={_classLabel}><Thc thc={_label} /></span>
		{/if}
	{/if}
{/snippet}

<Button
	bind:el
	type="button"
	class={_class}
	intent={_intent}
	{variant}
	{size}
	iconButton={_iconOnly}
	{disabled}
	{unstyled}
	aria-label={_iconOnly ? _stateText : undefined}
	tooltip={_tooltipConfig}
	data-state={phase}
	onclick={handleClick}
	children={content}
	{...rest}
/>
<!-- Announces the outcome to assistive tech. A sibling (not inside the button) so the
     announcement never leaks into the button's accessible name. -->
<span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
	{announcement}
</span>
