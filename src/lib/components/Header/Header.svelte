<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { THC } from "../Thc/Thc.svelte";
	import type { ButtonVariant } from "../Button/Button.svelte";
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

	export interface HeaderActionItem {
		/** Unique identifier */
		id: string | number;
		/** Icon — THC (string/html/component/snippet). The visible content.
		 *  Required for the default rendering; ignored when `render` is provided
		 *  (the snippet owns its own DOM). */
		icon?: THC;
		/** Accessible label (aria-label). */
		label: THC;
		/** Click handler */
		onclick?: () => void;
		/** Render as a link instead of a button */
		href?: string;
		/** Link target (e.g., "_blank"). Only relevant when href is set. */
		target?: string;
		/** Active state styling (e.g., when a panel triggered by this action is open) */
		active?: boolean;
		/** Whether this action is disabled */
		disabled?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Optional custom renderer. When provided, replaces the default
		 *  `<Button>` rendering for this action. The Header still owns
		 *  positioning (slot in the actions row) and the collapse decision.
		 *
		 *  Use this when an action needs custom DOM around its trigger —
		 *  e.g. a popover/tooltip directive, or a count/dot badge overlay.
		 *
		 *  Snippet args:
		 *  - `action`     — the item itself (lets a snippet be reused across items)
		 *  - `class`      — the same merged class the default `<Button>` would receive,
		 *                   so consumers can opt into the default look
		 *  - `isCollapsed`— current collapse state
		 *  - `onclick`    — pre-wired handler that calls `action.onclick` and
		 *                   `onActionSelect`; consumers can wire it to their
		 *                   button or ignore it. */
		render?: Snippet<
			[
				{
					action: HeaderActionItem;
					class: string;
					isCollapsed: boolean;
					onclick: () => void;
				},
			]
		>;
	}

	/** Collapse behavior when the header drops below `collapseThreshold`:
	 *  - "hamburger": nav items fold into a trailing dropdown along with the
	 *    locale switcher and an interactive avatar.
	 *  - "hide": nav items are hidden entirely. No trailing hamburger renders.
	 *    Avatar stays visible. Locale visibility is controlled by
	 *    `keepLocaleOnCollapse`. */
	export type HeaderCollapseMode = "hamburger" | "hide";

	/** Visibility for the built-in leading hamburger button:
	 *  - false/undefined: not rendered
	 *  - true: always rendered
	 *  - "collapsed": only rendered when the header is below the collapse threshold */
	export type HeaderLeadingHamburger = boolean | "collapsed";

	export interface Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
		/** Leading (left-side) slot. Renders before the logo/title.
		 *  Use for a hamburger button, back arrow, breadcrumbs, etc.
		 *  When provided, overrides the built-in `leadingHamburger`. */
		leading?: Snippet<[{ isCollapsed: boolean }]>;
		/** Convenience: render a built-in hamburger button in the leading slot.
		 *  Ignored when the `leading` snippet is provided. */
		leadingHamburger?: HeaderLeadingHamburger;
		/** Click handler for the built-in leading hamburger (typically opens a drawer) */
		onLeadingHamburger?: () => void;
		/** Icon for the built-in leading hamburger (defaults to a menu icon) */
		leadingHamburgerIcon?: THC;
		/** Aria-label for the built-in leading hamburger (defaults to "Open menu") */
		leadingHamburgerLabel?: string;
		/** Logo/brand snippet — full control over the left branding area */
		logo?: Snippet;
		/** Button variant for nav items and locale trigger (defaults to "ghost") */
		navVariant?: ButtonVariant;
		/** Simple text alternative to the logo snippet */
		projectName?: string;
		/** Navigation items — inline when expanded, DropdownMenu when collapsed */
		items?: HeaderNavItem[];
		/** Action icon buttons displayed between the locale switcher and the avatar.
		 *  Always visible — they do not fold into the trailing dropdown. */
		actions?: HeaderActionItem[];
		/** Called when an action is selected (in addition to the per-item onclick) */
		onActionSelect?: (action: HeaderActionItem) => void;
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
		/** Max-width of the inner content row. The outer `<header>` stays 100%
		 *  wide (background fills the parent); the inner content is centered and
		 *  capped at this value. Accepts any CSS length: "1024px", "72rem",
		 *  "100%", "none". Default: undefined → unbounded.
		 *  Equivalent global override:
		 *  `:root { --stuic-header-content-max-width: 72rem; }` */
		contentMaxWidth?: string | number;
		/** Element width (px) below which nav collapses to hamburger. 0 to disable. */
		collapseThreshold?: number;
		/** Collapse behavior when below threshold (defaults to "hamburger") */
		collapseMode?: HeaderCollapseMode;
		/** When `collapseMode === "hide"`, keep the locale switcher visible in
		 *  collapsed mode. No effect when `collapseMode === "hamburger"`
		 *  (locale already folds into the trailing dropdown there). */
		keepLocaleOnCollapse?: boolean;
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
		/** Classes for the inner content wrapper */
		classContent?: string;
		/** Classes for the leading area */
		classLeading?: string;
		/** Classes for the built-in leading hamburger button */
		classLeadingHamburger?: string;
		/** Classes for the logo area */
		classLogo?: string;
		/** Classes for the nav area (expanded mode) */
		classNav?: string;
		/** Classes for individual nav items (expanded mode) */
		classNavItem?: string;
		/** Classes for active nav items */
		classNavItemActive?: string;
		/** Classes for the actions wrapper */
		classActions?: string;
		/** Classes for individual action buttons */
		classAction?: string;
		/** Classes for active action buttons */
		classActionActive?: string;
		/** Classes for the end area (locale + avatar + trailing hamburger) */
		classEnd?: string;
		/** Classes for the avatar container */
		classAvatar?: string;
		/** Classes for the locale switcher trigger (expanded mode) */
		classLocale?: string;
		/** Classes for the trailing (right-side) hamburger button */
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
	export const HEADER_CONTENT_CLASSES = "stuic-header-content";
	export const HEADER_LEADING_CLASSES = "stuic-header-leading";
	export const HEADER_LEADING_HAMBURGER_CLASSES = "stuic-header-leading-hamburger";
	export const HEADER_LOGO_CLASSES = "stuic-header-logo";
	export const HEADER_NAV_CLASSES = "stuic-header-nav";
	export const HEADER_NAV_ITEM_CLASSES = "stuic-header-nav-item";
	export const HEADER_ACTIONS_CLASSES = "stuic-header-actions";
	export const HEADER_ACTION_CLASSES = "stuic-header-action";
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
		leading,
		leadingHamburger = false,
		onLeadingHamburger,
		leadingHamburgerIcon,
		leadingHamburgerLabel = "Open menu",
		logo,
		projectName,
		navVariant = "ghost",
		items = [],
		actions = [],
		onActionSelect,
		avatar,
		avatarOnClick,
		avatarLabel = "Account",
		locales = [],
		activeLocale,
		onLocaleChange,
		localeLabel = "Language",
		contentMaxWidth,
		collapseThreshold = 768,
		collapseMode = "hamburger",
		keepLocaleOnCollapse = false,
		fixed = false,
		isCollapsed = $bindable(false),
		isMenuOpen = $bindable(false),
		dropdownPosition = "bottom-span-right",
		iconSize = 24,
		onSelect,
		unstyled = false,
		class: classProp,
		classContent,
		classLeading,
		classLeadingHamburger,
		classLogo,
		classNav,
		classNavItem,
		classNavItemActive,
		classActions,
		classAction,
		classActionActive,
		classEnd,
		classAvatar,
		classLocale,
		classHamburger,
		classDropdown,
		children,
		el = $bindable(),
		...rest
	}: Props = $props();

	// Width measurement. We bind both outer and inner because:
	//  - Default layout renders an inner wrapper; the inner row width is what
	//    actually determines whether nav items fit, so collapse should key off it.
	//  - With the `children` escape hatch there is no inner wrapper, so we
	//    fall back to the outer measurement.
	let _outerWidth = $state(0);
	let _innerWidth = $state(0);
	let _measuredWidth = $derived(_innerWidth || _outerWidth);

	// Collapsed state based on threshold
	let _isCollapsed = $derived.by(() => {
		if (!collapseThreshold) return false;
		return _measuredWidth > 0 && _measuredWidth < collapseThreshold;
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

	// Whether the avatar moves into the dropdown when collapsed.
	// In "hide" mode the avatar always stays visible (never folds).
	let _avatarInDropdown = $derived(
		collapseMode === "hamburger" && !!(avatar && avatarOnClick)
	);

	// Whether to render the built-in leading hamburger (ignored when `leading` snippet is set)
	let _showLeadingHamburger = $derived.by(() => {
		if (leading) return false;
		if (leadingHamburger === "collapsed") return _isCollapsed;
		return !!leadingHamburger;
	});

	// Locale switcher: only render when 2+ locales
	let _hasLocales = $derived(locales.length > 1);

	// Visibility of the inline (expanded-form) locale switcher.
	// In "hamburger" mode: visible only when not collapsed (it folds into the
	// trailing dropdown when collapsed). In "hide" mode: visible when not
	// collapsed, or when collapsed and `keepLocaleOnCollapse` is set.
	let _showLocaleSwitcher = $derived(
		_hasLocales && (!_isCollapsed || (collapseMode === "hide" && keepLocaleOnCollapse))
	);

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

	// Map HeaderNavItem[] to DropdownMenuItem[] for collapsed mode.
	// In "hide" mode the trailing hamburger is suppressed entirely — return
	// an empty list so no dropdown trigger renders.
	let _dropdownItems = $derived.by((): DropdownMenuItem[] => {
		if (collapseMode === "hide") return [];
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
	let _classContent = $derived(
		unstyled ? classContent : twMerge(HEADER_CONTENT_CLASSES, classContent)
	);
	let _styleContent = $derived.by(() => {
		if (contentMaxWidth == null) return undefined;
		const value =
			typeof contentMaxWidth === "number" ? `${contentMaxWidth}px` : contentMaxWidth;
		return `--stuic-header-content-max-width: ${value}`;
	});
	let _classLeading = $derived(
		unstyled ? classLeading : twMerge(HEADER_LEADING_CLASSES, classLeading)
	);
	let _classLogo = $derived(
		unstyled ? classLogo : twMerge(HEADER_LOGO_CLASSES, classLogo)
	);
	let _classNav = $derived(unstyled ? classNav : twMerge(HEADER_NAV_CLASSES, classNav));
	let _classActions = $derived(
		unstyled ? classActions : twMerge(HEADER_ACTIONS_CLASSES, classActions)
	);
	let _classEnd = $derived(unstyled ? classEnd : twMerge(HEADER_END_CLASSES, classEnd));
	let _classLocale = $derived(
		unstyled ? classLocale : twMerge(HEADER_LOCALE_CLASSES, classLocale)
	);

	function handleItemClick(item: HeaderNavItem) {
		if (item.disabled) return;
		item.onclick?.();
		onSelect?.(item);
	}

	function handleActionClick(action: HeaderActionItem) {
		if (action.disabled) return;
		action.onclick?.();
		onActionSelect?.(action);
	}
</script>

<header
	bind:this={el}
	bind:offsetWidth={_outerWidth}
	class={_class}
	data-fixed={!unstyled && fixed ? "" : undefined}
	data-collapsed={!unstyled && _isCollapsed ? "" : undefined}
	{...rest}
>
	{#if children}
		{@render children({
			isCollapsed: _isCollapsed,
			items,
			offsetWidth: _measuredWidth,
		})}
	{:else}
		<div bind:offsetWidth={_innerWidth} class={_classContent} style={_styleContent}>
			<!-- Leading slot (left-side) -->
			{#if leading}
				<div class={_classLeading}>
					{@render leading({ isCollapsed: _isCollapsed })}
				</div>
			{:else if _showLeadingHamburger}
				<div class={_classLeading}>
					<Button
						variant="ghost"
						iconButton
						size="sm"
						{unstyled}
						class={twMerge(
							!unstyled && HEADER_LEADING_HAMBURGER_CLASSES,
							classLeadingHamburger
						)}
						onclick={onLeadingHamburger}
						aria-label={leadingHamburgerLabel}
					>
						{#if leadingHamburgerIcon}
							<Thc thc={leadingHamburgerIcon} />
						{:else}
							{@html iconMenu({ size: iconSize })}
						{/if}
					</Button>
				</div>
			{/if}

			<!-- Logo / Title (flex-1) -->
			<div class={_classLogo}>
				{#if logo}
					{@render logo()}
				{:else if projectName}
					<span class={unstyled ? undefined : "stuic-header-project-name"}>
						{projectName}
					</span>
				{/if}
			</div>

			<!-- Nav items (expanded mode) -->
			{#if !_isCollapsed && items.length > 0}
				<nav class={_classNav}>
					{#each items as item (item.id)}
						<Button
							variant={navVariant}
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

			<!-- End area: locale + actions + avatar + trailing hamburger -->
			<div class={_classEnd}>
				<!-- Locale switcher (shown when expanded, or in "hide" mode with keepLocaleOnCollapse) -->
				{#if _showLocaleSwitcher}
					<DropdownMenu
						items={_localeDropdownItems}
						position="bottom-span-right"
						class={_classLocale}
					>
						{#snippet trigger({ isOpen, toggle, triggerProps })}
							<Button
								variant={navVariant}
								size="sm"
								{unstyled}
								class={twMerge(!unstyled && "stuic-header-locale-trigger", classLocale)}
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

				<!-- Actions (icon buttons, always visible) -->
				{#if actions.length > 0}
					<div class={_classActions}>
						{#each actions as action (action.id)}
							{@const actionClass = twMerge(
								!unstyled && HEADER_ACTION_CLASSES,
								!unstyled && action.active && classActionActive,
								classAction,
								action.class
							)}
							{#if action.render}
								{@render action.render({
									action,
									class: actionClass,
									isCollapsed: _isCollapsed,
									onclick: () => handleActionClick(action),
								})}
							{:else}
								<Button
									variant="ghost"
									iconButton
									size="sm"
									href={action.href}
									target={action.target}
									disabled={action.disabled}
									{unstyled}
									class={actionClass}
									data-active={!unstyled && action.active ? "" : undefined}
									aria-label={typeof action.label === "string" ? action.label : undefined}
									onclick={() => handleActionClick(action)}
								>
									{#if action.icon !== undefined}
										<Thc thc={action.icon} />
									{/if}
								</Button>
							{/if}
						{/each}
					</div>
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
								iconButton
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
		</div>
	{/if}
</header>
