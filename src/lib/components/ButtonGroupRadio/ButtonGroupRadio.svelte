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
		//
		tooltip?: TooltipConfig;
	}
</script>

<script lang="ts">
	import { ItemCollection } from "@marianmeres/item-collection";
	type ItemCollectionItem = {
		id: string;
		option: import("../Input/types.js").FieldRadiosOption;
	};
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	//
	import { tooltip, type TooltipConfig } from "../../actions/index.js";

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
		tooltip: tooltipConfig = () => ({ enabled: false }),
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

	// Base class - structural styling handled by CSS
	const CLS = `stuic-button-group`;

	// Button class - styling handled by CSS via aria-checked attribute
	const CLS_BUTTON = `stuic-button-group-button`;

	let els = $state<Record<number, HTMLButtonElement>>({});

	// An option is non-interactive if the whole group is disabled or the option
	// itself is flagged `disabled`.
	function is_disabled(index: number): boolean {
		return !!disabled || !!coll.items[index]?.option.disabled;
	}

	// Find the next enabled index in `dir` (+1/-1), skipping disabled options.
	// Does not wrap and clamps at the edges (returns `from` if none found).
	function next_enabled_index(from: number, dir: 1 | -1): number {
		for (let i = from + dir; i >= 0 && i < coll.size; i += dir) {
			if (!is_disabled(i)) return i;
		}
		return from;
	}

	async function maybe_activate(index: number, coll: ItemColl) {
		if (is_disabled(index)) return;
		if ((await onButtonClick?.(index, coll)) !== false) {
			coll.setActiveIndex(index);
			els[index].focus();
		}
	}
</script>

{#if coll.size}
	<div
		class={twMerge(CLS, classProp)}
		data-size={size}
		{style}
		role="radiogroup"
		aria-labelledby={$coll?.active?.id || ""}
		use:tooltip={tooltipConfig}
	>
		{#each coll.items as item, i}
			<Button
				unstyled
				tabindex={$coll.activeIndex === i ? tabindex : -1}
				class={twMerge(
					CLS_BUTTON,
					classButton,
					$coll.activeIndex === i && classButtonActive
				)}
				disabled={disabled || item.option.disabled}
				type="button"
				role="radio"
				aria-checked={$coll.activeIndex === i}
				onclick={async () => {
					await maybe_activate(i, coll);
				}}
				bind:el={els[i]}
				onkeydown={async (e) => {
					if (["ArrowRight", "ArrowDown"].includes(e.key)) {
						await maybe_activate(next_enabled_index(i, 1), coll);
					}
					if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
						await maybe_activate(next_enabled_index(i, -1), coll);
					}
				}}
				id={item.id}
				{...buttonProps?.(i, coll) || {}}
			>
				{@html item.option.label}
			</Button>
		{/each}
	</div>
{/if}
