<script lang="ts" module>
	export const BUTTON_STUIC_BASE_CLASSES = `
		bg-button-bg text-button-text 
		dark:bg-button-bg-dark dark:text-button-text-dark
		font-mono text-sm text-center 
		leading-none
		border-1
		border-button-border dark:border-button-border-dark
		rounded-md
		inline-flex items-center justify-center gap-x-2
		px-3 py-2.5
		select-none

		hover:brightness-105
		active:brightness-95
		disabled:hover:brightness-100 disabled:opacity-50

		focus:brightness-105
		focus:border-button-border-focus focus:dark:border-button-border-focus-dark

		        focus:outline-4         focus:outline-black/10         focus:dark:outline-white/20
		focus-visible:outline-4 focus-visible:outline-black/10 focus-visible:dark:outline-white/20
	`;

	export const BUTTON_STUIC_PRESET_CLASSES: any = {
		size: {
			sm: `text-sm rounded-sm px-2 py-1`,
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
		inverse: `
			bg-transparent dark:bg-transparent 
			hover:bg-button-bg hover:dark:bg-button-bg-dark
			hover:brightness-100 
		`,
	};
</script>

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
		noborder?: boolean;
		unstyled?: boolean;
		inverse?: boolean; // a.k.a. formerly "outlined"
		class?: string;
		href?: string;
		children?: Snippet<[{ checked?: boolean }]>;
		// support for switch
		roleSwitch?: boolean;
		checked?: boolean;
		el?: Element;
	}

	let {
		variant,
		size,
		class: classProp,
		muted,
		noshadow,
		noborder,
		inverse,
		unstyled,
		href,
		children,
		//
		roleSwitch = false,
		checked = $bindable(false),
		el = $bindable(),
		//
		...rest
	}: Props = $props();

	// let button: HTMLButtonElement | undefined = $state();

	$effect(() => {
		const toggle = () => (checked = !checked);
		if (!href && roleSwitch && el) {
			el?.addEventListener("click", toggle);
		}
		return () => el?.removeEventListener("click", toggle);
	});

	const _base = BUTTON_STUIC_BASE_CLASSES;
	const _preset: any = BUTTON_STUIC_PRESET_CLASSES;

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
			noborder && "border-none",
			inverse && "inverse",
			// now, attach the default tw classes (unless not explicitly forbidden)
			!unstyled && _base,
			!unstyled && size && _preset.size[size],
			!unstyled && variant && _preset.variant[variant],
			!unstyled && muted && _preset.muted,
			!unstyled && !noshadow && _preset.shadow,
			!unstyled && inverse && _preset.inverse,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

{#if href}
	<a {href} bind:this={el} class={twMerge(_class, classProp)} {...rest as any}>
		{@render children?.({})}
	</a>
{:else}
	<button bind:this={el} class={twMerge(_class, classProp)} {...rest}>
		{@render children?.({ checked })}
	</button>
{/if}
