<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";

	export interface Props extends Omit<HTMLButtonAttributes, "children" | "class"> {
		/** Content displayed in the button */
		children?: Snippet;
		/** Whether this item is currently active/selected (visual state) */
		active?: boolean;
		/** Whether this item is currently focused via keyboard navigation */
		focused?: boolean;
		/** Size preset affecting padding and min-height (sm, md, lg) or custom Tailwind classes */
		size?: "sm" | "md" | "lg" | string;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		/** Enable touch-friendly sizing (larger tap targets). "auto" detects coarse pointer. */
		touchFriendly?: boolean | "auto";
		/** Icon/content displayed before the main content */
		contentBefore?: THC;
		/** Icon/content displayed after the main content */
		contentAfter?: THC;
		/** Render as anchor tag instead of button */
		href?: string;
		/** CSS classes for the button element */
		class?: string;
		/** CSS classes for the icon before slot */
		classContentBefore?: string;
		/** CSS classes for the icon after slot */
		classContentAfter?: string;
		/** CSS classes applied when active */
		classActive?: string;
		/** CSS classes applied when focused */
		classFocused?: string;
		/** Bindable element reference */
		el?: HTMLButtonElement | HTMLAnchorElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { DevicePointer } from "../../utils/device-pointer.svelte.js";
	import Thc from "../Thc/Thc.svelte";
	import "./index.css";

	let {
		children,
		active = false,
		focused = false,
		size = "md",
		unstyled = false,
		touchFriendly = false,
		contentBefore,
		contentAfter,
		href,
		class: classProp,
		classContentBefore,
		classContentAfter,
		classActive,
		classFocused,
		el = $bindable(),
		...rest
	}: Props = $props();

	const devicePointer = new DevicePointer();

	// Check if size is a known preset
	const isPresetSize = (s: string): s is "sm" | "md" | "lg" =>
		["sm", "md", "lg"].includes(s);

	// Compute whether touch-friendly should be active
	let isTouchFriendly = $derived.by(() => {
		if (touchFriendly === true) return true;
		if (touchFriendly === "auto" && devicePointer.isCoarse) return true;
		return false;
	});

	// Build class string - styling is handled by CSS + data attributes
	let _class = $derived(
		twMerge(
			!unstyled && "stuic-list-item-button",
			// Custom size classes when not using preset
			!unstyled && !isPresetSize(size) && size,
			// User-provided state classes
			active && classActive,
			focused && !active && classFocused,
			classProp
		)
	);
</script>

{#snippet content()}
	{#if contentBefore}
		<span class={twMerge("shrink-0", classContentBefore)}>
			<Thc thc={contentBefore} />
		</span>
	{/if}
	<span class="flex-1 min-w-0">
		{@render children?.()}
	</span>
	{#if contentAfter}
		<span class={twMerge("shrink-0", classContentAfter)}>
			<Thc thc={contentAfter} />
		</span>
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		bind:this={el}
		class={_class}
		data-size={!unstyled && isPresetSize(size) ? size : undefined}
		data-active={!unstyled && active ? "" : undefined}
		data-focused={!unstyled && focused ? "" : undefined}
		data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
		{...rest as any}
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={el}
		class={_class}
		type="button"
		data-size={!unstyled && isPresetSize(size) ? size : undefined}
		data-active={!unstyled && active ? "" : undefined}
		data-focused={!unstyled && focused ? "" : undefined}
		data-touch-friendly={!unstyled && isTouchFriendly ? "" : undefined}
		{...rest}
	>
		{@render content()}
	</button>
{/if}
