<script lang="ts" module>
	import type { HTMLAttributes, HTMLAnchorAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { THC } from "../Thc/Thc.svelte";

	export type CardVariant = "vertical" | "horizontal";

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
		/** Image URL for the top (vertical) or side (horizontal) image area */
		image?: string;
		/** Alt text for the image */
		imageAlt?: string;
		/** Small label above the title (category, date, tag) */
		eyebrow?: THC;
		/** Card title */
		title?: THC;
		/** Short description below the title */
		description?: THC;
		/** Layout variant */
		variant?: CardVariant;
		/** When provided, the card renders as <a> */
		href?: string;
		/** Disabled state */
		disabled?: boolean;
		/** Override the entire card body */
		children?: Snippet;
		/** Override the image area */
		renderImage?: Snippet<[{ image: string; imageAlt: string }]>;
		/** Badge/overlay positioned over the image */
		renderBadge?: Snippet;
		/** Override the content area (eyebrow + title + description) */
		renderContent?: Snippet<[{ eyebrow?: THC; title?: THC; description?: THC }]>;
		/** Footer area (action buttons, metadata, etc.) */
		renderFooter?: Snippet;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Class for the image container */
		classImage?: string;
		/** Class for the content area */
		classContent?: string;
		/** Class for the footer area */
		classFooter?: string;
		/** Width (px) below which horizontal auto-switches to vertical. Set 0 to disable. */
		horizontalThreshold?: number;
		/** Bindable element reference */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";

	let {
		image,
		imageAlt,
		eyebrow,
		title,
		description,
		variant = "vertical",
		href,
		disabled = false,
		children,
		renderImage,
		renderBadge,
		renderContent,
		renderFooter,
		unstyled = false,
		class: classProp,
		classImage: classImageProp,
		classContent: classContentProp,
		classFooter: classFooterProp,
		horizontalThreshold = 480,
		el = $bindable(),
		onclick,
		...rest
	}: Props = $props();

	let _offsetWidth = $state(0);

	let _effectiveVariant = $derived.by(() => {
		if (variant !== "horizontal" || !horizontalThreshold) return variant;
		return _offsetWidth > 0 && _offsetWidth < horizontalThreshold ? "vertical" : "horizontal";
	});

	let _class = $derived(unstyled ? classProp : twMerge("stuic-card", classProp));
	let _classImage = $derived(unstyled ? classImageProp : twMerge("stuic-card-image", classImageProp));
	let _classContent = $derived(unstyled ? classContentProp : twMerge("stuic-card-content", classContentProp));
	let _classBody = $derived(unstyled ? undefined : "stuic-card-body");
	let _classFooter = $derived(unstyled ? classFooterProp : twMerge("stuic-card-footer", classFooterProp));

	let _isInteractive = $derived(!!(href || onclick));
	let _hasImage = $derived(!!(image || renderImage));
	let _hasContent = $derived(!!(eyebrow || title || description || renderContent));
</script>

{#snippet cardInner()}
	{#if children}
		{@render children()}
	{:else}
		{#if _hasImage}
			<div class={_classImage}>
				{#if renderImage}
					{@render renderImage({ image: image ?? "", imageAlt: imageAlt ?? "" })}
				{:else if image}
					<img src={image} alt={imageAlt ?? ""} />
				{/if}
				{#if renderBadge}
					<div class={unstyled ? undefined : "stuic-card-badge"}>
						{@render renderBadge()}
					</div>
				{/if}
			</div>
		{/if}
		{#if _hasContent || renderContent || renderFooter}
			<div class={_classBody}>
				{#if renderContent}
					<div class={_classContent}>
						{@render renderContent({ eyebrow, title, description })}
					</div>
				{:else if _hasContent}
					<div class={_classContent}>
						{#if eyebrow}
							<div class={unstyled ? undefined : "stuic-card-eyebrow"}><Thc thc={eyebrow} /></div>
						{/if}
						{#if title}
							<div class={unstyled ? undefined : "stuic-card-title"}><Thc thc={title} /></div>
						{/if}
						{#if description}
							<div class={unstyled ? undefined : "stuic-card-description"}><Thc thc={description} /></div>
						{/if}
					</div>
				{/if}
				{#if renderFooter}
					<div class={_classFooter}>
						{@render renderFooter()}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		bind:this={el}
		bind:offsetWidth={_offsetWidth}
		class={_class}
		data-variant={!unstyled ? _effectiveVariant : undefined}
		data-interactive={!unstyled ? "" : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		aria-disabled={disabled ? "true" : undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render cardInner()}
	</a>
{:else if onclick}
	<button
		type="button"
		bind:this={el}
		bind:offsetWidth={_offsetWidth}
		class={_class}
		data-variant={!unstyled ? _effectiveVariant : undefined}
		data-interactive={!unstyled ? "" : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		{disabled}
		{onclick}
		{...rest as any}
	>
		{@render cardInner()}
	</button>
{:else}
	<div
		bind:this={el}
		bind:offsetWidth={_offsetWidth}
		class={_class}
		data-variant={!unstyled ? _effectiveVariant : undefined}
		data-disabled={!unstyled && disabled ? "" : undefined}
		{...rest}
	>
		{@render cardInner()}
	</div>
{/if}
