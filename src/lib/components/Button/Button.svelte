<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { twMerge } from "../../utils/tw-merge.js";

	// order matters I guess...
	import "../../stuic.css";
	import "./button.css";

	// interface Props extends DataAttributes, Partial<Omit<HTMLButtonElement, 'children'>> {
	interface Props extends HTMLButtonAttributes {
		variant?: "primary" | "secondary" | string;
		size?: "sm" | "md" | "lg" | string;
		muted?: boolean;
		class?: string;
		href?: string;
		children?: Snippet;
	}

	let {
		variant,
		size,
		class: classProp,
		muted,
		href,
		children,
		...rest
	}: Props = $props();

	// see button.css
	const _class = $derived(
		["stuic-button", variant, size, muted && "muted"].filter(Boolean).join(" ")
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
