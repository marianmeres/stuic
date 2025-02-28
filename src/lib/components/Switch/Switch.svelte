<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import type { FormEventHandler, HTMLButtonAttributes } from "svelte/elements";
	import { twMerge } from "../../utils/tw-merge.js";

	import "./switch.css";

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
</script>

<button
	bind:this={button}
	class={twMerge("stuic-switch", size, classProp)}
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
	<span aria-hidden="true" data-checked={checked} class={twMerge("dot", size, dotClass)}>
		{#if checked}
			{@render on?.()}
		{:else}
			{@render off?.()}
		{/if}
	</span>
</button>
