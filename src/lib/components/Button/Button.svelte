<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	// order matters
	import '../../stuic.css';
	import { twMerge } from '../../utils/tw-merge2.js';
	import './button.css';

	// interface Props extends DataAttributes, Partial<Omit<HTMLButtonElement, 'children'>> {
	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | string;
		size?: 'sm' | 'md' | 'lg' | string;
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

	// I ended up not using classes here at all... see button.css
	const _class = '';
</script>

{#if href}
	<a
		{href}
		data-stuic-button
		data-button-variant={variant || undefined}
		data-button-size={size === 'md' ? undefined : size || undefined}
		data-button-muted={muted || undefined}
		class={twMerge(_class, classProp)}
		{...rest as any}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		data-stuic-button
		data-button-variant={variant || undefined}
		data-button-size={size === 'md' ? undefined : size || undefined}
		data-button-muted={muted || undefined}
		class={twMerge(_class, classProp)}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}
