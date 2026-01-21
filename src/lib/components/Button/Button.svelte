<script lang="ts" module>
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";

	export type ButtonVariant = "solid" | "outline" | "ghost" | "soft" | "link";
	export type ButtonSize = "sm" | "md" | "lg" | "xl";

	export interface Props extends Omit<HTMLButtonAttributes, "children"> {
		/** Color intent (semantic meaning) */
		intent?: IntentColorKey;
		/** Visual variant (how colors are applied) */
		variant?: ButtonVariant | string;
		/** Size preset */
		size?: ButtonSize | string;
		/** Reduce emphasis */
		muted?: boolean;
		/** 3D push effect */
		raised?: boolean;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Render as anchor tag instead of button */
		href?: string;
		/** Content snippet */
		children?: Snippet<[{ checked?: boolean }]>;
		/** Toggle state for switch behavior */
		checked?: boolean;
		/** Enable switch/toggle behavior */
		roleSwitch?: boolean;
		/** Bindable element reference */
		el?: HTMLElement;
		/** Optional tooltip configuration or direct content */
		tooltip?: string | TooltipConfig;
	}
</script>

<script lang="ts">
	import "./index.css";
	import { twMerge } from "../../utils/tw-merge.js";
	import { tooltip, type TooltipConfig } from "../../actions/tooltip/tooltip.svelte.js";

	let {
		class: classProp,
		intent,
		size = "md",
		variant = "solid",
		href,
		children,
		checked = $bindable(false),
		roleSwitch = false,
		el = $bindable(),
		muted = false,
		raised = false,
		unstyled = false,
		tooltip: _tooltip,
		...rest
	}: Props = $props();

	$effect(() => {
		const toggle = () => (checked = !checked);
		if (!href && roleSwitch && el) {
			el?.addEventListener("click", toggle);
		}
		return () => el?.removeEventListener("click", toggle);
	});

	// Build class string - add base class for CSS targeting unless unstyled
	let _class = $derived(unstyled ? classProp : twMerge("stuic-button", classProp));

	let _tooltipConfig: TooltipConfig = $derived.by(() => {
		if (typeof _tooltip === "string") {
			return () => ({ enabled: true, content: _tooltip });
		}
		return _tooltip ? _tooltip : () => ({ enabled: false });
	});
</script>

{#if href}
	<a
		{href}
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-raised={!unstyled && raised ? "true" : undefined}
		data-checked={roleSwitch && checked ? "true" : undefined}
		use:tooltip={_tooltipConfig}
		{...rest as HTMLAnchorAttributes}
	>
		{@render children?.({ checked })}
	</a>
{:else}
	<button
		bind:this={el}
		class={_class}
		data-intent={!unstyled ? intent : undefined}
		data-variant={!unstyled ? variant : undefined}
		data-size={!unstyled ? size : undefined}
		data-muted={!unstyled && muted ? "true" : undefined}
		data-raised={!unstyled && raised ? "true" : undefined}
		data-checked={roleSwitch && checked ? "true" : undefined}
		use:tooltip={_tooltipConfig}
		{...rest}
	>
		{@render children?.({ checked })}
	</button>
{/if}
