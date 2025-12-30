<script lang="ts" module>
	import type { ItemCollection as ItemCollectionBase } from "@marianmeres/item-collection";
	import type { FieldRadiosOption } from "../Input/types.js";

	interface ItemCollectionItem {
		id: string;
		option: FieldRadiosOption;
	}
	export interface ItemColl extends ItemCollectionBase<ItemCollectionItem> {}

	export interface Props {
		value?: string;
		tabindex?: number;
		size?: "sm" | "md" | "lg" | string;
		options: (string | FieldRadiosOption)[];
		disabled?: boolean;
		activeIndex?: number | undefined;
		class?: string;
		classButton?: string;
		classButtonActive?: string;
		style?: string;
		/** Return false to prevent activation */
		onButtonClick?: (
			index: number,
			coll: ItemColl
		) => Promise<boolean | undefined | void> | boolean | undefined | void;
		buttonProps?: (index: number, coll: ItemColl) => undefined | Record<string, any>;
	}
</script>

<script lang="ts">
	import { ItemCollection } from "@marianmeres/item-collection";
	type ItemCollectionItem = { id: string; option: import("../Input/types.js").FieldRadiosOption };
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	//
	import "./index.css";

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

		if (value !== undefined) {
			const index = out.items.findIndex((item: ItemCollectionItem) => {
				return value === (item?.option.value ?? item.option.label);
			});
			if (index > -1) out.setActiveIndex(index);
		} else if (activeIndex !== undefined) out.setActiveIndex(activeIndex);

		return out;
	});

	$effect(() => {
		return coll.subscribe((c) => {
			value = c.active?.option.value ?? c.active?.option.label;
			activeIndex = c.activeIndex;
		});
	});

	const rounded = "rounded-md";
	const roundedBtn = "rounded-md";
	//
	const CLS = `
		stuic-button-group
        ${rounded}
		w-full
        py-1.5 px-1.5 inline-block space-x-1
        bg-button-group-bg text-button-group-text
        dark:bg-button-group-bg-dark dark:text-button-group-text-dark
        border-1
        border-button-group-border dark:border-button-group-border-dark
		flex justify-between
        
        focus-within:border-button-group-accent focus-within:dark:border-button-group-accent-dark
        focus-within:ring-button-group-accent/20 focus-within:dark:ring-button-group-accent-dark/20
        focus-within:ring-4
    `;

	const CLS_BUTTON = `
        ${rounded}
		w-full inline-block
	    bg-transparent text-button-group-text dark:text-button-group-text-dark
        hover:bg-transparent hover:text-button-group-text hover:dark:text-button-group-text-dark
        outline-none focus:outline-none
    `;

	// we need some active indication by default... use just something subtle here, in the wild
	// this will be styled with classButtonActive
	const CLS_BUTTON_ACTIVE = `
        shadow-none
        bg-button-group-bg-active dark:bg-button-group-bg-active-dark
        text-button-group-text-active dark:text-button-group-text-active-dark
        hover:bg-button-group-bg-active hover:dark:bg-button-group-bg-active
        hover:text-button-group-text-active hover:dark:text-button-group-text-active-dark
        ${roundedBtn}
    `;
	// shadow-[0px_0px_1px_1px_rgba(0_0_0_/_.6)]

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
				tabindex={$coll.activeIndex === i ? tabindex : -1}
				class={twMerge(
					"border-none shadow-none",
					CLS_BUTTON,
					classButton,
					$coll.activeIndex === i && [CLS_BUTTON_ACTIVE, classButtonActive].join(" ")
				)}
				{disabled}
				{size}
				type="button"
				role="radio"
				aria-checked={$coll.activeIndex === i}
				onclick={async () => {
					await maybe_activate(i, coll);
				}}
				bind:el={els[i]}
				onkeydown={async (e) => {
					if (["ArrowRight", "ArrowDown"].includes(e.key)) {
						await maybe_activate(Math.min(i + 1, coll.size - 1), coll);
					}
					if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
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
