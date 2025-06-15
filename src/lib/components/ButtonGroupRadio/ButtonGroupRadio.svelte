<script lang="ts">
	import { ItemCollection, type Item } from "@marianmeres/item-collection";
	import { getId } from "../../utils/get-id.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import type { FieldRadiosOption } from "../Input/types.js";
	import Button from "../Button/Button.svelte";
	//
	import "./index.css";

	interface ItemColl extends ItemCollection<{ id: string; option: FieldRadiosOption }> {}

	interface Props {
		value?: string;
		tabindex?: number; // tooShort
		size?: "sm" | "md" | "lg" | string;
		//
		options: (string | FieldRadiosOption)[];
		disabled?: boolean;
		activeIndex?: number | undefined;
		//
		class?: string;
		classButton?: string;
		classButtonActive?: string;
		style?: string;
		// for side-effects, or validation... if would return explicit false, will not activate
		onButtonClick?: (
			index: number,
			coll: ItemColl
		) => Promise<boolean | undefined | void> | boolean | undefined | void;
		buttonProps?: (index: number, coll: ItemColl) => undefined | Record<string, any>;
	}

	let {
		options,
		value = $bindable(),
		tabindex = 0,
		disabled,
		size = "md",
		//
		activeIndex = $bindable(undefined),
		//
		class: classProp,
		classButton,
		classButtonActive,
		style,
		onButtonClick,
		buttonProps,
	}: Props = $props();

	const coll: ItemColl = $derived.by(() => {
		const out = new ItemCollection(
			options.map((o, i) => {
				// normalize string to FieldRadiosOption
				if (typeof o === "string") o = { label: o };
				// normalize FieldRadiosOption to ItemCollection's Item
				return { id: `opt-${i}-${Math.random().toString(36).slice(2, 8)}`, option: o };
			}),
			{}
		);

		if (activeIndex !== undefined) out.setActiveIndex(activeIndex);

		return out;
	});

	$effect(() => {
		return coll.subscribe((c) => {
			value = c.active?.option.value ?? c.active?.option.label;
			activeIndex = c.activeIndex;
		});
	});

	//
	const CLS = `
        p-1.5 rounded-lg inline-block space-x-2
        bg-button-group-bg text-button-group-text
        dark:bg-button-group-bg-dark dark:text-button-group-text-dark
        border-1
        border-button-group-border dark:border-button-group-border-dark
    `;

	// we need some active indication by default... use just something subtle here, in the wild
	// this will be styled with classButtonActive
	const CLS_ACTIVE = `
	    shadow-[0px_0px_1px_1px_rgba(0_0_0_/_.6)]
    `;

	let els = $state<Record<number, HTMLButtonElement>>({});

	async function maybe_activate(index: number, coll: ItemColl) {
		if ((await onButtonClick?.(index, coll)) !== false) {
			coll.setActiveIndex(index);
			els[index].focus();
		}
	}
</script>

{#if coll.size}
	<div
		class={twMerge(CLS, classProp)}
		{style}
		role="radiogroup"
		aria-labelledby={$coll?.active?.id || ""}
	>
		{#each coll.items as item, i}
			<Button
				tabindex={i === 0 ? tabindex : undefined}
				class={twMerge(
					"border-none shadow-none",
					classButton,
					$coll.activeIndex === i && [CLS_ACTIVE, classButtonActive].join(" ")
				)}
				{size}
				role="radio"
				aria-checked={$coll.activeIndex === i}
				onclick={async () => {
					await maybe_activate(i, coll);
				}}
				bind:el={els[i]}
				onkeydown={async (e) => {
					if (e.key === "ArrowRight") {
						await maybe_activate(Math.min(i + 1, coll.size - 1), coll);
					}
					if (e.key === "ArrowLeft") {
						await maybe_activate(Math.max(0, i - 1), coll);
					}
				}}
				id={item.id}
				{...buttonProps?.(i, coll) || {}}
			>
				{item.option.label}
			</Button>
		{/each}
	</div>
{/if}
