<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import type { FormEventHandler, HTMLButtonAttributes } from "svelte/elements";
	import { twMerge } from "../../utils/tw-merge.js";

	import "./index.css";

	interface Props extends HTMLButtonAttributes {
		button?: HTMLButtonElement;
		checked?: boolean;
		size?: "xs" | "sm" | "md" | "lg" | "xl" | string;
		class?: string;
		dotClass?: string;
		label?: string;
		disabled?: boolean;
		tabindex?: number;
		on?: Snippet;
		off?: Snippet;
		onclick?: (event: MouseEvent) => void;
		onchange?: FormEventHandler<HTMLButtonElement> | null | undefined;
		preHook?: (current: boolean) => Promise<false | any>;
	}

	let {
		button = $bindable(),
		size = "md",
		class: classProp,
		dotClass,
		checked = $bindable(false),
		disabled,
		tabindex = 0,
		label,
		on,
		off,
		onclick,
		preHook,
		...rest
	}: Props = $props();

	const _preset: any = {
		size: {
			xs: `h-4 w-7`,
			sm: `h-5 w-9`,
			md: `h-6 w-11`,
			lg: `h-7 w-13`,
			xl: `h-8 w-15`,
		},
		dot: {
			size: {
				xs: `size-2 data-[checked=true]:translate-x-4`,
				sm: `size-3 data-[checked=true]:translate-x-5`,
				md: `size-4 data-[checked=true]:translate-x-6`,
				lg: `size-5 data-[checked=true]:translate-x-7`,
				xl: `size-6 data-[checked=true]:translate-x-8`,
			},
		},
	};
</script>

<!-- <div class="inline-block relative"> -->
<button
	bind:this={button}
	class={twMerge(
		"stuic-switch",
		`m-2 
			relative inline-flex flex-shrink-0 items-center
			rounded-full cursor-pointer
	
			transition-colors duration-100
	
			hover:brightness-[1.05] active:brightness-[0.95]
			disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:brightness-100
	
			bg-neutral-400 dark:bg-neutral-400
	
			aria-[checked=true]:bg-switch-accent
			dark:aria-[checked=true]:bg-switch-accent-dark
	
			focus:outline-0
			focus:ring-switch-accent/20 focus:dark:ring-switch-accent-dark/20
			focus:ring-4`,
		size,
		_preset.size[size],
		classProp
	)}
	type="button"
	role="switch"
	aria-checked={checked}
	value={`${!!checked}`}
	{tabindex}
	{disabled}
	onclick={async (e) => {
		if (typeof preHook === "function" && (await preHook(checked)) === false) {
			return false;
		}
		checked = !checked;

		await tick();

		if (typeof onclick === "function") onclick(e);

		button!.dispatchEvent(
			new CustomEvent("change", { bubbles: true, cancelable: true, detail: checked })
		);
	}}
	{...rest}
>
	{#if label}<span class="sr-only">{@html label}</span>{/if}
	<span
		aria-hidden="true"
		data-checked={checked}
		class={twMerge(
			"dot",
			`flex items-center justify-center
				translate-x-1 rounded-full  
				transition-all duration-100
				shadow
				bg-neutral-50 dark:bg-neutral-50
				text-neutral-950 dark:text-neutral-950`,
			size,
			_preset.dot.size[size],
			dotClass
		)}
	>
		{#if checked}
			{@render on?.()}
		{:else}
			{@render off?.()}
		{/if}
	</span>
</button>
