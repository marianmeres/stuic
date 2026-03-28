<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type {
		DropdownMenuPosition,
		DropdownMenuItem,
		DropdownMenuActionItem,
	} from "../DropdownMenu/DropdownMenu.svelte";

	export interface HeaderNavItem {
		/** Unique identifier */
		id: string | number;
		/** Display label — supports THC (string, html, component, snippet) */
		label: THC;
		/** Navigation URL (renders as <a> in both expanded and collapsed modes) */
		href?: string;
		/** Link target (e.g., "_blank"). Only relevant when href is set. */
		target?: string;
		/** Click handler (alternative to href) */
		onclick?: () => void;
		/** Icon before the label — supports THC */
		icon?: THC;
		/** Whether this item is the current/active page */
		active?: boolean;
		/** Whether this item is disabled */
		disabled?: boolean;
		/** Additional CSS classes */
		class?: string;
	}

	export interface HeaderLocaleItem {
		/** Locale identifier (e.g., "en", "sk", "cs") */
		id: string;
		/** Display label — supports THC (string, html, component, snippet) */
		label: THC;
	}

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/** Logo/brand snippet — full control over the left branding area */
		logo?: Snippet;
		/** Horizontal alignment of the nav items in expanded mode */
		navAlign?: "left" | "right";
		/** Simple text alternative to the logo snippet */
		projectName?: string;
		/** Navigation items — inline when expanded, DropdownMenu when collapsed */
		items?: HeaderNavItem[];
		/** Avatar/user snippet — rendered at the far right */
		avatar?: Snippet;
		/** When provided, makes the avatar interactive. In expanded mode wraps it in a
		 *  button; in collapsed mode moves it into the dropdown as an action item. */
		avatarOnClick?: () => void;
		/** Label for the avatar dropdown item in collapsed mode (defaults to "Account") */
		avatarLabel?: THC;
		/** Available locales for the language switcher */
		locales?: HeaderLocaleItem[];
		/** Currently active locale ID — should match one of the locales[].id values */
		activeLocale?: string;
		/** Called when the user selects a different locale */
		onLocaleChange?: (localeId: string) => void;
		/** Section header label for locales in collapsed dropdown (defaults to "Language") */
		localeLabel?: THC;
		/** Element width (px) below which nav collapses to hamburger. 0 to disable. */
		collapseThreshold?: number;
		/** Fixed positioning (top of viewport) */
		fixed?: boolean;
		/** Bindable: whether the header is currently in collapsed (hamburger) mode */
		isCollapsed?: boolean;
		/** Bindable: whether the hamburger dropdown is currently open */
		isMenuOpen?: boolean;
		/** Position for the collapsed dropdown menu */
		dropdownPosition?: DropdownMenuPosition;
		/** Hamburger/X icon size in px */
		iconSize?: number;
		/** Called when a nav item is selected (both modes) */
		onSelect?: (item: HeaderNavItem) => void;
		/** Skip all default styling */
		unstyled?: boolean;
		/** Additional CSS classes for the root <header> */
		class?: string;
		/** Classes for the logo area */
		classLogo?: string;
		/** Classes for the nav area (expanded mode) */
		classNav?: string;
		/** Classes for individual nav items (expanded mode) */
		classNavItem?: string;
		/** Classes for active nav items */
		classNavItemActive?: string;
		/** Classes for the end area (avatar + hamburger) */
		classEnd?: string;
		/** Classes for the avatar container */
		classAvatar?: string;
		/** Classes for the locale switcher trigger (expanded mode) */
		classLocale?: string;
		/** Classes for the hamburger button */
		classHamburger?: string;
		/** Classes for the dropdown wrapper (collapsed mode) */
		classDropdown?: string;
		/** Escape hatch: override the entire inner layout */
		children?: Snippet<
			[{ isCollapsed: boolean; items: HeaderNavItem[]; offsetWidth: number }]
		>;
		/** Bindable root element reference */
		el?: HTMLElement;
	}

	export const HEADER_BASE_CLASSES = "stuic-header";
	export const HEADER_LOGO_CLASSES = "stuic-header-logo";
	export const HEADER_NAV_CLASSES = "stuic-header-nav";
	export const HEADER_NAV_ITEM_CLASSES = "stuic-header-nav-item";
	export const HEADER_END_CLASSES = "stuic-header-end";
	export const HEADER_HAMBURGER_CLASSES = "stuic-header-hamburger";
	export const HEADER_LOCALE_CLASSES = "stuic-header-locale";
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconMenu, iconX, iconCheck, iconChevronDown } from "../../icons/index.js";
	import Thc from "../Thc/Thc.svelte";
	import Button from "../Button/Button.svelte";
	import DropdownMenu from "../DropdownMenu/DropdownMenu.svelte";
	import IconSwap from "../IconSwap/IconSwap.svelte";

	let {
		logo,
		projectName,
		navAlign = "right",
		items = [],
		avatar,
		avatarOnClick,
		avatarLabel = "Account",
		locales = [],
		activeLocale,
		onLocaleChange,
		localeLabel = "Language",
		collapseThreshold = 768,
		fixed = false,
		isCollapsed = $bindable(false),
		isMenuOpen = $bindable(false),
		dropdownPosition = "bottom-span-right",
		iconSize = 24,
		onSelect,
		unstyled = false,
		class: classProp,
		classLogo,
		classNav,
		classNavItem,
		classNavItemActive,
		classEnd,
		classAvatar,
		classLocale,
		classHamburger,
		classDropdown,
		children,
		el = $bindable(),
		...rest
	}: Props = $props();

	// Width measurement (same pattern as Card)
	let _offsetWidth = $state(0);

	// Collapsed state based on threshold
	let _isCollapsed = $derived.by(() => {
		if (!collapseThreshold) return false;
		return _offsetWidth > 0 && _offsetWidth < collapseThreshold;
	});

	// Sync bindable
	$effect(() => {
		isCollapsed = _isCollapsed;
	});

	// Close menu when switching from collapsed to expanded
	$effect(() => {
		if (!_isCollapsed && isMenuOpen) {
			isMenuOpen = false;
		}
	});

	// Whether the avatar moves into the dropdown when collapsed
	let _avatarInDropdown = $derived(!!(avatar && avatarOnClick));

	// Locale switcher: only render when 2+ locales
	let _hasLocales = $derived(locales.length > 1);

	// Active locale object (for trigger label); fallback to first
	let _activeLocale = $derived(locales.find((l) => l.id === activeLocale) ?? locales[0]);

	// Locale items for the expanded-mode DropdownMenu
	let _localeDropdownItems = $derived.by((): DropdownMenuItem[] => {
		return locales.map(
			(locale) =>
				({
					type: "action" as const,
					id: locale.id,
					label: locale.label,
					contentBefore:
						locale.id === activeLocale
							? { html: iconCheck({ size: 14 }) }
							: {
									html: `<span style="width:14px;display:inline-block"></span>`,
								},
					onSelect: () => onLocaleChange?.(locale.id),
				}) satisfies DropdownMenuActionItem
		);
	});

	// Map HeaderNavItem[] to DropdownMenuItem[] for collapsed mode
	let _dropdownItems = $derived.by((): DropdownMenuItem[] => {
		const navItems: DropdownMenuItem[] = items.map(
			(item) =>
				({
					type: "action" as const,
					id: item.id,
					label: item.label,
					contentBefore: item.icon,
					disabled: item.disabled,
					class: item.class,
					href: item.href,
					target: item.target,
					onSelect: () => {
						item.onclick?.();
						onSelect?.(item);
					},
				}) satisfies DropdownMenuActionItem
		);

		// Append locale section when locales are available
		if (_hasLocales) {
			if (navItems.length > 0) {
				navItems.push({ type: "divider" });
			}
			navItems.push({ type: "header", label: localeLabel! });
			for (const locale of locales) {
				navItems.push({
					type: "action",
					id: `__locale_${locale.id}__`,
					label: locale.label,
					contentBefore:
						locale.id === activeLocale
							? { html: iconCheck({ size: 14 }) }
							: {
									html: `<span style="width:14px;display:inline-block"></span>`,
								},
					onSelect: () => onLocaleChange?.(locale.id),
				} satisfies DropdownMenuActionItem);
			}
		}

		// Append avatar as a dropdown item when avatarOnClick is set
		if (_avatarInDropdown) {
			if (navItems.length > 0) {
				navItems.push({ type: "divider" });
			}
			navItems.push({
				type: "action",
				id: "__avatar__",
				label: avatarLabel!,
				onSelect: () => avatarOnClick!(),
			} satisfies DropdownMenuActionItem);
		}

		return navItems;
	});

	// CSS classes
	let _class = $derived(unstyled ? classProp : twMerge(HEADER_BASE_CLASSES, classProp));
	let _classLogo = $derived(
		unstyled ? classLogo : twMerge(HEADER_LOGO_CLASSES, classLogo)
	);
	let _classNav = $derived(unstyled ? classNav : twMerge(HEADER_NAV_CLASSES, classNav));
	let _classEnd = $derived(unstyled ? classEnd : twMerge(HEADER_END_CLASSES, classEnd));
	let _classLocale = $derived(
		unstyled ? classLocale : twMerge(HEADER_LOCALE_CLASSES, classLocale)
	);

	function handleItemClick(item: HeaderNavItem) {
		if (item.disabled) return;
		item.onclick?.();
		onSelect?.(item);
	}
</script>

<header
	bind:this={el}
	bind:offsetWidth={_offsetWidth}
	class={_class}
	data-fixed={!unstyled && fixed ? "" : undefined}
	data-collapsed={!unstyled && _isCollapsed ? "" : undefined}
	{...rest}
>
	{#if children}
		{@render children({
			isCollapsed: _isCollapsed,
			items,
			offsetWidth: _offsetWidth,
		})}
	{:else}
		<!-- Logo / Brand -->
		{#if logo || projectName}
			<div class={_classLogo}>
				{#if logo}
					{@render logo()}
				{:else if projectName}
					<span class={unstyled ? undefined : "stuic-header-project-name"}>
						{projectName}
					</span>
				{/if}
			</div>
		{/if}

		<!-- Spacer (before nav when right-aligned) -->
		{#if navAlign !== "left"}
			<div class={unstyled ? undefined : "stuic-header-spacer"}></div>
		{/if}

		<!-- Nav items (expanded mode) -->
		{#if !_isCollapsed && items.length > 0}
			<nav class={_classNav}>
				{#each items as item (item.id)}
					<Button
						variant="ghost"
						size="sm"
						href={item.href}
						target={item.target}
						disabled={item.disabled}
						{unstyled}
						class={twMerge(
							!unstyled && HEADER_NAV_ITEM_CLASSES,
							!unstyled && item.active && classNavItemActive,
							classNavItem,
							item.class
						)}
						data-active={!unstyled && item.active ? "" : undefined}
						aria-current={item.active ? "page" : undefined}
						onclick={() => handleItemClick(item)}
					>
						{#if item.icon}
							<span class={unstyled ? undefined : "stuic-header-nav-icon"}>
								<Thc thc={item.icon} />
							</span>
						{/if}
						<Thc thc={item.label} />
					</Button>
				{/each}
			</nav>
		{/if}

		<!-- Spacer (after nav when left-aligned) -->
		{#if navAlign === "left"}
			<div class={unstyled ? undefined : "stuic-header-spacer"}></div>
		{/if}

		<!-- End area: locale + avatar + hamburger -->
		<div class={_classEnd}>
			<!-- Locale switcher (expanded mode only) -->
			{#if !_isCollapsed && _hasLocales}
				<DropdownMenu
					items={_localeDropdownItems}
					position="bottom-span-right"
					class={_classLocale}
				>
					{#snippet trigger({ isOpen, toggle, triggerProps })}
						<Button
							variant="ghost"
							size="sm"
							{unstyled}
							class={twMerge(
								!unstyled && "stuic-header-locale-trigger",
								classLocale
							)}
							onclick={toggle}
							aria-label="Change language"
							{...triggerProps}
						>
							{#if _activeLocale}
								<Thc thc={_activeLocale.label} />
							{/if}
							<span
								class={twMerge(
									!unstyled && "stuic-header-locale-chevron",
									isOpen && !unstyled && "stuic-header-locale-chevron-open"
								)}
							>
								{@html iconChevronDown({ size: 14 })}
							</span>
						</Button>
					{/snippet}
				</DropdownMenu>
			{/if}

			<!-- Avatar: hidden when collapsed + avatarOnClick (moves into dropdown) -->
			{#if avatar && !(_isCollapsed && _avatarInDropdown)}
				{#if avatarOnClick}
					<button
						type="button"
						class={twMerge(!unstyled && "stuic-header-avatar", classAvatar)}
						onclick={avatarOnClick}
					>
						{@render avatar()}
					</button>
				{:else}
					<div class={twMerge(!unstyled && "stuic-header-avatar", classAvatar)}>
						{@render avatar()}
					</div>
				{/if}
			{/if}

			{#if _isCollapsed && _dropdownItems.length > 0}
				<DropdownMenu
					items={_dropdownItems}
					bind:isOpen={isMenuOpen}
					position={dropdownPosition}
					class={classDropdown}
				>
					{#snippet trigger({ isOpen, toggle, triggerProps })}
						<Button
							variant="ghost"
							roundedFull
							aspect1
							size="sm"
							{unstyled}
							class={twMerge(!unstyled && HEADER_HAMBURGER_CLASSES, classHamburger)}
							onclick={toggle}
							aria-label={isOpen ? "Close menu" : "Open menu"}
							{...triggerProps}
						>
							<IconSwap
								active={isOpen ? 1 : 0}
								states={[iconMenu({ size: iconSize }), iconX({ size: iconSize })]}
							/>
						</Button>
					{/snippet}
				</DropdownMenu>
			{/if}
		</div>
	{/if}
</header>
