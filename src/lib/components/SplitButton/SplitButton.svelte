<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";
	import type { IntentColorKey } from "../../utils/design-tokens.js";
	import type {
		Props as ButtonProps,
		ButtonVariant,
		ButtonSize,
	} from "../Button/Button.svelte";
	import type {
		Props as DropdownMenuProps,
		DropdownMenuItem,
		DropdownMenuPosition,
	} from "../DropdownMenu/DropdownMenu.svelte";
	import type { TooltipConfig } from "../../actions/tooltip/tooltip.svelte.js";

	/** Which side of the primary button the secondary (menu) trigger sits on. Logical (RTL-aware). */
	export type SplitButtonPlacement = "start" | "end";

	/** Args passed by DropdownMenu's `trigger` snippet (internal). */
	interface SecondaryTriggerArgs {
		isOpen: boolean;
		toggle: () => void;
		triggerProps: {
			id: string;
			"aria-haspopup": "menu";
			"aria-expanded": boolean;
			"aria-controls": string;
		};
	}

	export interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
		// ----- primary segment -----
		/** Primary button content (label and/or custom markup). */
		children?: Snippet<[{ checked?: boolean }]>;
		/**
		 * Convenience primary icon (SVG string or snippet). Rendered before `children`.
		 * When provided without `children`, the primary implicitly becomes an icon button.
		 */
		icon?: string | Snippet;
		/** Primary click handler. */
		onclick?: (e: MouseEvent) => void;
		/** Color intent forwarded to the primary button. */
		intent?: IntentColorKey;
		/** Visual variant forwarded to the primary button. */
		variant?: ButtonVariant | string;
		/** Size preset forwarded to both segments. */
		size?: ButtonSize | string;
		/** Icon-only primary (forwarded to Button). Auto-enabled when `icon` is set without `children`. */
		iconButton?: boolean;
		/** Toggle state forwarded to the primary button (pairs with `iconSwap`/`roleSwitch`). Bindable. */
		checked?: boolean;
		/** Enable switch/toggle behavior on the primary button. */
		roleSwitch?: boolean;
		/** Two icon states for swap animation on the primary button (implies icon button). */
		iconSwap?: ButtonProps["iconSwap"];
		/** Disable the primary button only (see `secondaryDisabled` for the trigger). */
		disabled?: boolean;
		/** Tooltip for the primary button (content string or config). */
		tooltip?: string | TooltipConfig;
		/**
		 * Escape hatch: any extra `ButtonProps` forwarded to the primary button.
		 * Wins over the top-level conveniences above.
		 */
		primaryProps?: Partial<ButtonProps>;
		/** Classes for the primary button. */
		classPrimary?: string;
		/** Bindable primary button element reference. */
		primaryEl?: HTMLElement;

		// ----- secondary (menu trigger) segment -----
		/** Which side the secondary trigger sits on (default `"start"` — the raised/pill look). */
		placement?: SplitButtonPlacement;
		/** Secondary trigger icon (SVG string or snippet). Defaults to a chevron that rotates when open. */
		secondaryIcon?: string | Snippet;
		/** Accessible label for the secondary trigger (default `"More options"`). */
		secondaryLabel?: string;
		/** Tooltip for the secondary trigger (content string or config). */
		secondaryTooltip?: string | TooltipConfig;
		/** Disable the secondary trigger only. */
		secondaryDisabled?: boolean;
		/**
		 * Custom secondary click handler — used INSTEAD of the built-in dropdown.
		 * Only relevant when `items` is not provided (`items` takes precedence).
		 */
		onSecondaryClick?: (e: MouseEvent) => void;
		/** Escape hatch: any extra `ButtonProps` forwarded to the secondary trigger button. */
		secondaryProps?: Partial<ButtonProps>;
		/** Classes for the secondary trigger button. */
		classSecondary?: string;
		/** Bindable secondary trigger element reference. */
		secondaryEl?: HTMLElement;

		// ----- dropdown menu -----
		/** Menu items — when provided, the secondary trigger opens a `DropdownMenu`. */
		items?: DropdownMenuItem[];
		/** Bindable menu open state. */
		menuOpen?: boolean;
		/** Menu position relative to the secondary trigger. */
		position?: DropdownMenuPosition;
		/** Menu offset from the secondary trigger (CSS value). */
		offset?: string;
		/**
		 * Escape hatch: any extra `DropdownMenuProps` forwarded to the `DropdownMenu`.
		 * Wins over the top-level `position`/`offset` conveniences.
		 */
		menuProps?: Partial<
			Omit<DropdownMenuProps, "items" | "trigger" | "isOpen" | "triggerEl" | "class">
		>;

		// ----- surface -----
		/**
		 * Classic split-button look: flush segments + hairline divider — instead of the
		 * default "raised" look (a distinct primary button on a shared pill surface).
		 */
		divided?: boolean;
		/** Fully-rounded pill (default `true`). Set `false` to use the button radius. */
		roundedFull?: boolean;

		// ----- universal -----
		/** Skip all default styling, use only custom classes */
		unstyled?: boolean;
		/** Additional CSS classes for the wrapper. */
		class?: string;
		/** Bindable wrapper element reference. */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import DropdownMenu from "../DropdownMenu/DropdownMenu.svelte";
	import { iconChevronDown } from "../../icons/index.js";

	let {
		children,
		icon,
		onclick,
		intent,
		variant = "solid",
		size = "md",
		iconButton,
		checked = $bindable(false),
		roleSwitch = false,
		iconSwap,
		disabled,
		tooltip,
		primaryProps,
		classPrimary,
		primaryEl = $bindable(),
		placement = "start",
		secondaryIcon,
		secondaryLabel = "More options",
		secondaryTooltip,
		secondaryDisabled,
		onSecondaryClick,
		secondaryProps,
		classSecondary,
		secondaryEl = $bindable(),
		items,
		menuOpen = $bindable(false),
		position,
		offset,
		menuProps,
		divided = false,
		roundedFull = true,
		unstyled = false,
		class: classProp,
		el = $bindable(),
		...rest
	}: Props = $props();

	let _class = $derived(unstyled ? classProp : twMerge("stuic-split-button", classProp));

	// icon-only primary → icon button (explicit `iconButton` always wins)
	let _iconButton = $derived(iconButton ?? (!!icon && !children));

	// Secondary defaults are mode-aware: neutral ghost circle on the raised pill
	// surface, primary-matching flush segment in divided mode.
	let _secondaryVariant = $derived(divided ? variant : "ghost");
	let _secondaryIntent = $derived(divided ? intent : undefined);

	// In divided mode segment corners are managed by CSS (flush inner, rounded outer)
	let _segmentRoundedFull = $derived(!divided && roundedFull);
</script>

{#snippet primaryContent({ checked }: { checked?: boolean })}
	{#if typeof icon === "string"}
		<span class="stuic-split-button-icon" aria-hidden="true">{@html icon}</span>
	{:else if icon}
		{@render icon()}
	{/if}
	{@render children?.({ checked })}
{/snippet}

{#snippet primary()}
	<Button
		bind:el={primaryEl}
		bind:checked
		class={twMerge("stuic-split-button-primary", classPrimary)}
		{intent}
		{variant}
		{size}
		iconButton={_iconButton}
		{roleSwitch}
		{iconSwap}
		{disabled}
		{tooltip}
		{unstyled}
		roundedFull={_segmentRoundedFull}
		type="button"
		{onclick}
		children={icon || children ? primaryContent : undefined}
		{...primaryProps}
	/>
{/snippet}

{#snippet secondary(args?: SecondaryTriggerArgs)}
	<Button
		bind:el={secondaryEl}
		class={twMerge("stuic-split-button-secondary", classSecondary)}
		intent={_secondaryIntent}
		variant={_secondaryVariant}
		{size}
		iconButton
		{unstyled}
		roundedFull={_segmentRoundedFull}
		disabled={secondaryDisabled}
		tooltip={secondaryTooltip}
		aria-label={secondaryLabel}
		type="button"
		onclick={(e: MouseEvent) => (args ? args.toggle() : onSecondaryClick?.(e))}
		{...args?.triggerProps}
		{...secondaryProps}
	>
		{#if typeof secondaryIcon === "string"}
			<span class="stuic-split-button-icon" aria-hidden="true">{@html secondaryIcon}</span
			>
		{:else if secondaryIcon}
			{@render secondaryIcon()}
		{:else}
			<span class="stuic-split-button-caret" aria-hidden="true">
				{@html iconChevronDown({ size: 20 })}
			</span>
		{/if}
	</Button>
{/snippet}

{#snippet dropdownTrigger(args: SecondaryTriggerArgs)}
	{@render secondary(args)}
{/snippet}

{#snippet secondaryRegion()}
	{#if items}
		<DropdownMenu
			{items}
			bind:isOpen={menuOpen}
			bind:triggerEl={
				() => secondaryEl as HTMLButtonElement | undefined, (v) => (secondaryEl = v)
			}
			{position}
			{offset}
			{unstyled}
			class="stuic-split-button-menu"
			trigger={dropdownTrigger}
			{...menuProps}
		/>
	{:else}
		{@render secondary()}
	{/if}
{/snippet}

<div
	bind:this={el}
	class={_class}
	role="group"
	data-placement={!unstyled ? placement : undefined}
	data-divided={!unstyled && divided ? "true" : undefined}
	data-rounded-full={!unstyled && roundedFull ? "true" : undefined}
	data-size={!unstyled ? size : undefined}
	data-open={menuOpen ? "true" : undefined}
	{...rest}
>
	{#if placement === "start"}
		{@render secondaryRegion()}
		{#if divided}<span class="stuic-split-button-divider" aria-hidden="true"></span>{/if}
		{@render primary()}
	{:else}
		{@render primary()}
		{#if divided}<span class="stuic-split-button-divider" aria-hidden="true"></span>{/if}
		{@render secondaryRegion()}
	{/if}
</div>
