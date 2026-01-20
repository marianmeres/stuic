<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/index.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";

	export interface TabbedMenuItem {
		id: string | number;
		label: THC;
		disabled?: boolean;
		class?: string;
		data?: Record<string, any>;
		onSelect?: () => void | boolean;
		href?: string;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
		items: TabbedMenuItem[];
		value?: string | number;
		disabled?: boolean;
		onSelect?: (item: TabbedMenuItem) => void;
		//
		class?: string;
		classItem?: string;
		classButton?: string;
		classButtonActive?: string;
		classButtonDisabled?: string;
		//
		unstyled?: boolean;
		//
		el?: HTMLUListElement;
	}
</script>

<script lang="ts">
	import "./index.css";

	//
	let {
		items,
		value = $bindable(),
		disabled,
		onSelect,
		//
		class: classProp,
		classItem,
		classButton,
		classButtonActive,
		classButtonDisabled,
		//
		unstyled,
		//
		el = $bindable(),
		...rest
	}: Props = $props();

	const CLS = `
		stuic-tabbed-menu
		flex flex-row
		gap-1
		list-none m-0 p-0
	`;

	const CLS_ITEM = `
        min-w-0 flex-1 max-w-40
    `;

	const CLS_BUTTON = `
		px-4 py-2
		rounded-t-md
		border border-b-0
		border-(--stuic-tabbed-menu-border)
		bg-(--stuic-tabbed-menu-tab-bg)
		text-(--stuic-tabbed-menu-tab-text)
		cursor-pointer
		transition-colors duration-150
		hover:brightness-105
        truncate w-full
        block
        text-center
	`;
	// focus-visible:outline-2 focus-visible:outline-offset-2

	const CLS_BUTTON_ACTIVE = `
		bg-(--stuic-tabbed-menu-tab-bg-active)
		text-(--stuic-tabbed-menu-tab-text-active)
		font-medium
	`;

	const CLS_BUTTON_DISABLED = `
		opacity-50 cursor-not-allowed
		pointer-events-none
	`;

	let buttonEls = $state<Record<string | number, HTMLButtonElement | HTMLAnchorElement>>(
		{}
	);

	function selectItem(item: TabbedMenuItem) {
		if (item.disabled || disabled) return;
		// item-level handler takes priority
		if (item.onSelect?.() === false) return;
		value = item.id;
		onSelect?.(item);
	}

	function handleKeydown(e: KeyboardEvent, item: TabbedMenuItem) {
		const enabledItems = items.filter((i) => !i.disabled && !disabled);
		const currentEnabledIndex = enabledItems.findIndex((i) => i.id === item.id);

		if (["ArrowRight", "ArrowDown"].includes(e.key)) {
			e.preventDefault();
			const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
			const nextItem = enabledItems[nextIndex];
			buttonEls[nextItem.id]?.focus();
		} else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
			e.preventDefault();
			const prevIndex =
				(currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
			const prevItem = enabledItems[prevIndex];
			buttonEls[prevItem.id]?.focus();
		} else if (["Enter", " "].includes(e.key)) {
			// For anchors, let Enter trigger native navigation (onclick still fires)
			if (e.key === "Enter" && item.href) return;
			e.preventDefault();
			selectItem(item);
		} else if (e.key === "Home") {
			e.preventDefault();
			const firstItem = enabledItems[0];
			if (firstItem) buttonEls[firstItem.id]?.focus();
		} else if (e.key === "End") {
			e.preventDefault();
			const lastItem = enabledItems[enabledItems.length - 1];
			if (lastItem) buttonEls[lastItem.id]?.focus();
		}
	}

	function getButtonClass(item: TabbedMenuItem): string {
		const isActive = value === item.id;
		const isDisabled = item.disabled || disabled;

		return twMerge(
			!unstyled && CLS_BUTTON,
			classButton,
			isActive && !unstyled && CLS_BUTTON_ACTIVE,
			isActive && classButtonActive,
			isDisabled && !unstyled && CLS_BUTTON_DISABLED,
			isDisabled && classButtonDisabled,
			item.class
		);
	}
</script>

{#if items.length}
	<ul
		bind:this={el}
		class={twMerge(!unstyled && CLS, classProp)}
		role="tablist"
		{...rest}
	>
		{#each items as item (item.id)}
			{@const props = {
				role: "tab",
				["aria-selected"]: value === item.id,
				["aria-disabled"]: item.disabled || disabled || undefined,
				tabindex: value === item.id ? 0 : -1,
				class: getButtonClass(item),
				onclick: () => selectItem(item),
				onkeydown: (e: KeyboardEvent) => handleKeydown(e, item),
			}}
			<li class={twMerge(CLS_ITEM, classItem)} role="presentation">
				{#if item.href}
					<a href={item.href} {...props} bind:this={buttonEls[item.id]}>
						<Thc thc={item.label} />
					</a>
				{:else}
					<button type="button" {...props} bind:this={buttonEls[item.id]}>
						<Thc thc={item.label} />
					</button>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
