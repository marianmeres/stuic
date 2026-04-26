<script lang="ts" module>
	import type {
		HTMLAttributes,
		HTMLAnchorAttributes,
		HTMLButtonAttributes,
	} from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type { THC } from "../Thc/Thc.svelte";

	export type PillVariant = "solid" | "outline" | "ghost" | "soft" | "link";
	export type PillSize = "sm" | "md" | "lg";

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/** Color intent (semantic meaning) */
		intent?: IntentColorKey;
		/** Visual variant (how colors are applied) */
		variant?: PillVariant | string;
		/** Size preset */
		size?: PillSize | string;
		/** Reduce emphasis (lower opacity) */
		muted?: boolean;
		/** Selected/active state — useful for filter-chip behavior */
		active?: boolean;
		/** Pill is fully rounded by default; set false to use element radius */
		roundedFull?: boolean;
		/** Render as block-level flex (full width). Inline-flex by default. */
		block?: boolean;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Render as anchor tag */
		href?: string;
		/** Link target (e.g. "_blank") — only relevant when href is set */
		target?: string;
		/** Render as button (when href not set) */
		onclick?: (e: MouseEvent) => void;
		/** Disabled (interactive variants only) */
		disabled?: boolean;
		/** Show built-in X dismiss control */
		dismissible?: boolean;
		/** Called when X is clicked. Stops propagation so parent onclick is unaffected. */
		ondismiss?: (e: MouseEvent) => void;
		/** Status dot rendered before content (uses current intent color) */
		dot?: boolean;
		/** Content rendered before children */
		contentBefore?: THC;
		/** Content rendered after children */
		contentAfter?: THC;
		/** Bindable element reference */
		el?: HTMLElement;
		/** Content snippet */
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc, { isTHCNotEmpty } from "../Thc/Thc.svelte";
	import { X } from "../X/index.js";

	let {
		class: classProp,
		intent,
		variant = "soft",
		size = "md",
		muted = false,
		active = false,
		roundedFull = true,
		block = false,
		unstyled = false,
		href,
		target,
		onclick,
		disabled,
		dismissible = false,
		ondismiss,
		dot = false,
		contentBefore,
		contentAfter,
		el = $bindable(),
		children,
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-pill", classProp));

	function handleDismiss(e: MouseEvent) {
		e.stopPropagation();
		ondismiss?.(e);
	}
</script>

{#snippet body()}
	{#if dot}
		<span class="stuic-pill-dot" aria-hidden="true"></span>
	{/if}
	{#if isTHCNotEmpty(contentBefore)}
		<Thc thc={contentBefore as THC} />
	{/if}
	{@render children?.()}
	{#if isTHCNotEmpty(contentAfter)}
		<Thc thc={contentAfter as THC} />
	{/if}
{/snippet}

{#snippet dismissBtn()}
	<button
		type="button"
		class="stuic-pill-dismiss"
		aria-label="Dismiss"
		onclick={handleDismiss}
		{disabled}
	>
		<X strokeWidth={2} />
	</button>
{/snippet}

{#if dismissible}
	<!-- Wrapper pattern: outer span carries pill styling; inner element is the
	     interactive area (when href/onclick); X dismiss is a sibling button. -->
	<span
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-active={!unstyled && active ? "true" : undefined}
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-block={!unstyled && block ? "true" : undefined}
		data-with-dot={!unstyled && dot ? "true" : undefined}
		data-dismissible="true"
		{...rest}
	>
		{#if href}
			<a {href} {target} class="stuic-pill-main">
				{@render body()}
			</a>
		{:else if onclick}
			<button type="button" class="stuic-pill-main" {onclick} {disabled}>
				{@render body()}
			</button>
		{:else}
			{@render body()}
		{/if}
		{@render dismissBtn()}
	</span>
{:else if href}
	<a
		{href}
		{target}
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-active={!unstyled && active ? "true" : undefined}
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-block={!unstyled && block ? "true" : undefined}
		data-with-dot={!unstyled && dot ? "true" : undefined}
		data-interactive="true"
		{...rest as HTMLAnchorAttributes}
	>
		{@render body()}
	</a>
{:else if onclick}
	<button
		type="button"
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-active={!unstyled && active ? "true" : undefined}
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-block={!unstyled && block ? "true" : undefined}
		data-with-dot={!unstyled && dot ? "true" : undefined}
		data-interactive="true"
		{onclick}
		{disabled}
		{...rest as HTMLButtonAttributes}
	>
		{@render body()}
	</button>
{:else}
	<span
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-active={!unstyled && active ? "true" : undefined}
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-block={!unstyled && block ? "true" : undefined}
		data-with-dot={!unstyled && dot ? "true" : undefined}
		{...rest}
	>
		{@render body()}
	</span>
{/if}
