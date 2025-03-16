<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { twMerge } from "../../utils/tw-merge.js";
	//
	import "./index.css";

	// interface Props extends DataAttributes, Partial<Omit<HTMLButtonElement, 'children'>> {
	interface Props extends HTMLButtonAttributes {
		variant?: "primary" | "secondary" | string;
		size?: "sm" | "md" | "lg" | string;
		muted?: boolean;
		noshadow?: boolean;
		unstyled?: boolean;
		class?: string;
		href?: string;
		children?: Snippet;
	}

	let {
		variant,
		size,
		class: classProp,
		muted,
		noshadow,
		unstyled,
		href,
		children,
		...rest
	}: Props = $props();

	const _base = `
		bg-button-bg text-button-text 
		dark:bg-button-bg-dark dark:text-button-text-dark
		font-mono text-sm text-center
		border-1
		border-button-border dark:border-button-border-dark
		rounded-md
		inline-flex items-center justify-center gap-x-2
		px-3 py-1.5

		hover:brightness-[1.05]
		active:brightness-[0.95]
		disabled:hover:brightness-100

		focus:brightness-[1.05] focus:outline-0
		focus:border-button-border-focus focus:dark:border-button-border-focus-dark
	`;

	const _preset: any = {
		size: {
			sm: `text-xs rounded-sm px-2 py-0.5`,
			lg: `text-base rounded-md`,
		},
		variant: {
			primary: `font-medium`,
			secondary: `
				bg-neutral-100 dark:bg-neutral-600
				text-black/60 dark:text-white/80 
				shadow-[1px_1px_0_0_rgba(0_0_0_/_.2)]
				active:shadow-none active:translate-[1px]
				focus:shadow-black/30
			`,
		},
		muted: `text-black/70 dark:text-white/70`,
		shadow: `
			shadow-[1px_1px_0_0_rgba(0_0_0_/_.4)]
			active:shadow-none active:translate-[1px]
			disabled:shadow-none disabled:active:shadow-none disabled:active:translate-none
		`,
	};

	// see button.css
	let _class = $derived(
		[
			// "namespace" (so we can target it in css files when customizing)
			"stuic-button",
			// pass all styling props as classnames as well
			variant,
			size,
			muted && "muted",
			noshadow && "no-shadow",
			// now, attach the default tw classes (unless not explicitly forbidden)
			!unstyled && _base,
			!unstyled && size && _preset.size[size],
			!unstyled && variant && _preset.variant[variant],
			!unstyled && muted && _preset.muted,
			!unstyled && !noshadow && _preset.shadow,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

{#if href}
	<a {href} class={twMerge(_class, classProp)} {...rest as any}>
		{@render children?.()}
	</a>
{:else}
	<button class={twMerge(_class, classProp)} {...rest}>
		{@render children?.()}
	</button>
{/if}
