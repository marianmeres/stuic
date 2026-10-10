<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	/** Camera cutout drawn over the top of the screen. */
	export type PhoneFrameNotch = "none" | "island" | "notch";

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children" | "class"> {
		/**
		 * Screenshot URL. The image fills the screen (`object-fit: cover`, anchored to the
		 * top). Omit it and render your own content with `children` instead.
		 */
		src?: string;
		/** Alt text of the screenshot. With `href` this is also the link's accessible name. */
		alt?: string;
		/**
		 * Intrinsic pixel width of the screenshot (the `<img width>` attribute, so the
		 * browser reserves space before the image loads). This does NOT size the frame —
		 * size the frame with `class` (e.g. `w-64`).
		 */
		width?: number | string;
		/** Intrinsic pixel height of the screenshot (see `width`). */
		height?: number | string;
		/** `<img srcset>` pass-through, for 1×/2× screenshots. */
		srcset?: string;
		/** `<img sizes>` pass-through. */
		sizes?: string;
		/** Image loading. `lazy` by default; use `eager` for a hero (above-the-fold) screenshot. */
		loading?: "lazy" | "eager";
		/** `<img fetchpriority>` pass-through. `high` for the LCP screenshot. */
		fetchpriority?: "high" | "low" | "auto";
		/**
		 * Custom screen content (an iframe, a live component, a video...). Takes precedence
		 * over `src`. The screen clips it and fixes its size; make the content fill it
		 * (`w-full h-full`).
		 */
		children?: Snippet;
		/** Makes the whole frame a link: renders `<a>` instead of `<div>`. */
		href?: string;
		/** Link target (e.g. `"_blank"`). Only relevant when `href` is set. */
		target?: string;
		/** Link `rel`. Defaults to `"noopener"` when `target` is `"_blank"`. */
		rel?: string;
		/**
		 * Screen aspect ratio as a CSS `aspect-ratio` value (`"390 / 844"`, `390 / 844`,
		 * `0.46`). Defaults to the `--stuic-phone-frame-screen-aspect-ratio` token
		 * (`390 / 844`, an iPhone 14 class screen in CSS px). Ignored while `screenHeight`
		 * is set.
		 */
		aspectRatio?: string | number;
		/**
		 * Fixed screen height (any CSS length). The screen becomes a window of that height
		 * showing the TOP of the content, the rest is clipped and the aspect ratio no
		 * longer applies. For a responsive version (clipped on narrow screens, whole phone
		 * from a breakpoint up) set the `--stuic-phone-frame-screen-height` token through
		 * `class` instead — see the README.
		 */
		screenHeight?: string;
		/** Camera cutout drawn over the top of the screen. `none` by default. */
		notch?: PhoneFrameNotch;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the frame (the bezel). Size the frame here. */
		class?: string;
		/** Additional CSS classes for the screen (the clipping window inside the bezel). */
		classScreen?: string;
		/** Additional CSS classes for the `<img>`. */
		classImage?: string;
		/** Bindable element reference (the `<div>` or `<a>`). */
		el?: HTMLElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		src,
		alt = "",
		width,
		height,
		srcset,
		sizes,
		loading = "lazy",
		fetchpriority,
		children,
		href,
		target,
		rel,
		aspectRatio,
		screenHeight,
		notch = "none",
		unstyled = false,
		class: classProp,
		classScreen: classScreenProp,
		classImage: classImageProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-phone-frame", classProp));
	let _classScreen = $derived(
		unstyled ? classScreenProp : twMerge("stuic-phone-frame-screen", classScreenProp)
	);
	let _classImage = $derived(
		unstyled ? classImageProp : twMerge("stuic-phone-frame-image", classImageProp)
	);

	// Prop-driven tokens go on the screen itself (closest to where they are read), so
	// `style` from rest props stays untouched on the root.
	let _screenStyle = $derived.by(() => {
		const styles: string[] = [];
		if (aspectRatio !== undefined && aspectRatio !== "") {
			styles.push(`--stuic-phone-frame-screen-aspect-ratio: ${aspectRatio}`);
		}
		if (screenHeight) styles.push(`--stuic-phone-frame-screen-height: ${screenHeight}`);
		return styles.length ? styles.join("; ") : undefined;
	});

	let _notch = $derived(!unstyled && notch !== "none" ? notch : undefined);

	let _rel = $derived(rel ?? (target === "_blank" ? "noopener" : undefined));
</script>

{#snippet screen()}
	<div class={_classScreen} style={_screenStyle}>
		{#if children}
			{@render children()}
		{:else if src}
			<img
				{src}
				{alt}
				{width}
				{height}
				{srcset}
				{sizes}
				{loading}
				{fetchpriority}
				decoding="async"
				class={_classImage}
			/>
		{/if}
		{#if _notch}
			<div class="stuic-phone-frame-notch" aria-hidden="true"></div>
		{/if}
	</div>
{/snippet}

{#if href}
	<a
		bind:this={el}
		{href}
		{target}
		rel={_rel}
		class={_class}
		data-notch={_notch}
		{...rest}
	>
		{@render screen()}
	</a>
{:else}
	<div bind:this={el} class={_class} data-notch={_notch} {...rest}>
		{@render screen()}
	</div>
{/if}
