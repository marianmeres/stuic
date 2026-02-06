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
		/** Render as rounded-full */
		roundedFull?: boolean;
		/** Render as aspect ratio 1 */
		aspect1?: boolean;
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
		/** Is this button a "X" button (this is a pragmatic convenience) */
		x?: boolean | XProps;
		/** Optional out-of-the-box spinner support  */
		spinner?: boolean | THC;
		/** Show only spinner when spinner? */
		spinnerOnly?: boolean;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { tooltip, type TooltipConfig } from "../../actions/tooltip/tooltip.svelte.js";
	import { X, type XProps } from "../X/index.js";
	import Thc, { type THC } from "../Thc/Thc.svelte";
	import Spinner from "../Spinner/Spinner.svelte";
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
		roundedFull = false,
		aspect1 = false,
		tooltip: _tooltip,
		x,
		spinner,
		spinnerOnly,
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

	const DEFAULT_X_CLS = "size-7 -m-2";

	let _xProps: undefined | XProps = $derived.by(() => {
		if (x) {
			const props = typeof x === "boolean" ? { class: "" } : { ...x };
			props.class = twMerge(DEFAULT_X_CLS, props.class);
			return props;
		}
	});

	// "x" implicitly set aspect1
	let _isAspect1 = $derived(aspect1 || _xProps);
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
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-aspect1={!unstyled && _isAspect1 ? "true" : undefined}
		use:tooltip={_tooltipConfig}
		{...rest as HTMLAnchorAttributes}
	>
		{#if _xProps}
			<X {..._xProps} />
		{:else}
			{#if spinner}
				{#if typeof spinner === "boolean"}
					<Spinner />
				{:else}
					<Thc thc={spinner} />
				{/if}
			{/if}
			{#if !spinner || (spinner && !spinnerOnly)}
				{@render children?.({ checked })}
			{/if}
		{/if}
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
		data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
		data-aspect1={!unstyled && _isAspect1 ? "true" : undefined}
		use:tooltip={_tooltipConfig}
		{...rest}
	>
		{#if _xProps}
			<X {..._xProps} />
		{:else}
			{#if spinner}
				{#if typeof spinner === "boolean"}
					<Spinner />
				{:else}
					<Thc thc={spinner} />
				{/if}
			{/if}
			{#if !spinner || (spinner && !spinnerOnly)}
				{@render children?.({ checked })}
			{/if}
		{/if}
	</button>
{/if}
