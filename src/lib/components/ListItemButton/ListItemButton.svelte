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
		/** Size preset affecting padding and min-height (sm, md, lg) */
		size?: "sm" | "md" | "lg" | string;
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		/** Enable touch-friendly sizing (larger tap targets). "auto" detects coarse pointer. */
		touchFriendly?: boolean | "auto";
		/** Icon/content displayed before the main content */
		iconBefore?: THC;
		/** Icon/content displayed after the main content */
		iconAfter?: THC;
		/** Render as anchor tag instead of button */
		href?: string;
		/** CSS classes for the button element */
		class?: string;
		/** CSS classes for the icon before slot */
		classIconBefore?: string;
		/** CSS classes for the icon after slot */
		classIconAfter?: string;
		/** CSS classes applied when active */
		classActive?: string;
		/** CSS classes applied when focused */
		classFocused?: string;
		/** Bindable element reference */
		el?: HTMLButtonElement | HTMLAnchorElement;
	}

	export interface ListItemButtonPresetClasses {
		size: Record<string, string>;
		touchFriendly: string;
	}

	export const LIST_ITEM_BUTTON_STUIC_BASE_CLASSES = `
		w-full
		flex items-center gap-2
		text-left
		rounded-[var(--lib-radius)]
		cursor-pointer
		touch-action-manipulation

		bg-lib-bg dark:bg-lib-bg-dark
		text-lib-text dark:text-lib-text-dark

		border border-lib-border dark:border-lib-border-dark

		hover:bg-lib-hover-bg dark:hover:bg-lib-hover-bg-dark
		hover:text-lib-hover-text dark:hover:text-lib-hover-text-dark
		hover:border-lib-hover-border dark:hover:border-lib-hover-border-dark

		focus:outline-none
		focus-visible:bg-lib-focus-bg dark:focus-visible:bg-lib-focus-bg-dark
		focus-visible:text-lib-focus-text dark:focus-visible:text-lib-focus-text-dark
		focus-visible:border-lib-focus-border dark:focus-visible:border-lib-focus-border-dark

		disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
	`;

	export const LIST_ITEM_BUTTON_STUIC_PRESET_CLASSES: ListItemButtonPresetClasses = {
		size: {
			sm: `px-2 py-1.5 text-sm min-h-[36px]`,
			md: `px-2.5 py-2 text-base min-h-[40px]`,
			lg: `px-3 py-2.5 text-base min-h-[44px]`,
		},
		touchFriendly: `min-h-[44px] py-2.5`,
	};

	export const LIST_ITEM_BUTTON_ACTIVE_CLASSES = `
		bg-lib-active-bg dark:bg-lib-active-bg-dark
		text-lib-active-text dark:text-lib-active-text-dark
		border-lib-active-border dark:border-lib-active-border-dark
	`;

	export const LIST_ITEM_BUTTON_FOCUSED_CLASSES = `
		bg-lib-focus-bg dark:bg-lib-focus-bg-dark
		text-lib-focus-text dark:text-lib-focus-text-dark
		border-lib-focus-border dark:border-lib-focus-border-dark
	`;
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
		iconBefore,
		iconAfter,
		href,
		class: classProp,
		classIconBefore,
		classIconAfter,
		classActive,
		classFocused,
		el = $bindable(),
		...rest
	}: Props = $props();

	const devicePointer = new DevicePointer();

	const _base = LIST_ITEM_BUTTON_STUIC_BASE_CLASSES;
	const _preset = LIST_ITEM_BUTTON_STUIC_PRESET_CLASSES;

	let _touchClasses = $derived.by(() => {
		if (touchFriendly === true) return _preset.touchFriendly;
		if (touchFriendly === "auto" && devicePointer.isCoarse) return _preset.touchFriendly;
		return "";
	});

	let _class = $derived(
		[
			"stuic-list-item-button",
			size,
			active && "active",
			focused && "focused",
			!unstyled && _base,
			!unstyled && size && _preset.size[size],
			!unstyled && _touchClasses,
			!unstyled && active && LIST_ITEM_BUTTON_ACTIVE_CLASSES,
			!unstyled && focused && !active && LIST_ITEM_BUTTON_FOCUSED_CLASSES,
			active && classActive,
			focused && !active && classFocused,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

{#snippet content()}
	{#if iconBefore}
		<span class={twMerge("shrink-0", classIconBefore)}>
			<Thc thc={iconBefore} />
		</span>
	{/if}
	<span class="flex-1 min-w-0">
		{@render children?.()}
	</span>
	{#if iconAfter}
		<span class={twMerge("shrink-0", classIconAfter)}>
			<Thc thc={iconAfter} />
		</span>
	{/if}
{/snippet}

{#if href}
	<a {href} bind:this={el} class={twMerge(_class, classProp)} {...rest as any}>
		{@render content()}
	</a>
{:else}
	<button bind:this={el} class={twMerge(_class, classProp)} type="button" {...rest}>
		{@render content()}
	</button>
{/if}
