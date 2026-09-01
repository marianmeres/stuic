<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	export type EmptyStateVariant = "plain" | "outline" | "dashed";
	export type EmptyStateSize = "sm" | "md" | "lg";

	export interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "title"
	> {
		/** Icon area content (typically `{ html: iconSearch({ size: 48 }) }`) */
		icon?: THC;
		/** Title (the "Nothing here yet" headline) */
		title?: THC;
		/** Short supporting description below the title */
		description?: THC;
		/** Container treatment */
		variant?: EmptyStateVariant;
		/** Size preset (padding, icon and typography scale) */
		size?: EmptyStateSize;
		/** CTA area below the description (buttons, links) */
		actions?: Snippet;
		/** Override the entire default layout */
		children?: Snippet;
		/** Override the icon area */
		renderIcon?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for the icon area */
		classIcon?: string;
		/** Class for the title */
		classTitle?: string;
		/** Class for the description */
		classDescription?: string;
		/** Class for the actions area */
		classActions?: string;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";

	let {
		icon,
		title,
		description,
		variant = "plain",
		size = "md",
		actions,
		children,
		renderIcon,
		unstyled = false,
		class: classProp,
		classIcon: classIconProp,
		classTitle: classTitleProp,
		classDescription: classDescriptionProp,
		classActions: classActionsProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-empty-state", classProp));
	let _classIcon = $derived(
		unstyled ? classIconProp : twMerge("stuic-empty-state-icon", classIconProp)
	);
	let _classTitle = $derived(
		unstyled ? classTitleProp : twMerge("stuic-empty-state-title", classTitleProp)
	);
	let _classDescription = $derived(
		unstyled
			? classDescriptionProp
			: twMerge("stuic-empty-state-description", classDescriptionProp)
	);
	let _classActions = $derived(
		unstyled ? classActionsProp : twMerge("stuic-empty-state-actions", classActionsProp)
	);
</script>

<div
	bind:this={el}
	class={_class}
	data-variant={!unstyled ? variant : undefined}
	data-size={!unstyled ? size : undefined}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		{#if renderIcon || icon}
			<div class={_classIcon}>
				{#if renderIcon}
					{@render renderIcon()}
				{:else if icon}
					<Thc thc={icon} />
				{/if}
			</div>
		{/if}
		{#if title}
			<div class={_classTitle}>
				<Thc thc={title} />
			</div>
		{/if}
		{#if description}
			<div class={_classDescription}>
				<Thc thc={description} />
			</div>
		{/if}
		{#if actions}
			<div class={_classActions}>
				{@render actions()}
			</div>
		{/if}
	{/if}
</div>
