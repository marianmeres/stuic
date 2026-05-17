<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type {
		DropdownMenuItem,
		DropdownMenuPosition,
	} from "../DropdownMenu/DropdownMenu.svelte";
	import type { Props as AvatarProps } from "../Avatar/Avatar.svelte";

	/**
	 * Identity passed by the consumer. When `null` / `undefined`, the menu
	 * renders in unauthenticated mode. When provided, the menu renders the
	 * header tile (avatar + email) and the authenticated item set.
	 */
	export interface UserAvatarMenuIdentity {
		/** Used for initials + auto-color hashing. Required when `identity` is set. */
		email: string;
		/** Optional display name (preferred over email in the header tile if present). */
		name?: string;
		/** Optional photo URL (forwarded to Avatar `src`). */
		src?: string;
		/** Optional role list — rendered under the email if `showRoles` is enabled. */
		roles?: string[];
	}

	/**
	 * Standard built-in actions. Consumers wire these by passing handlers;
	 * omitting a handler hides the corresponding item.
	 *
	 * The component never navigates, logs out, or toggles theme on its own —
	 * it only invokes callbacks. The only built-in side effect is
	 * `ColorScheme.toggle()` inside the color-scheme item (see `colorScheme`).
	 */
	export interface UserAvatarMenuActions {
		/** "View profile" item. Hidden when not provided. (Auth state only.) */
		onProfile?: () => void;
		/** "Settings" item. Hidden when not provided. (Auth state only.) */
		onSettings?: () => void;
		/** "Logout" item. Hidden when not provided. (Auth state only.) */
		onLogout?: () => void;
		/**
		 * "Login or register" item — combined affordance, typically wired to
		 * open a `LoginOrRegisterFormModal`. Hidden when not provided.
		 * (Unauth state only.) Independent of `onLogin` / `onRegister`; pass
		 * any combination of the three.
		 */
		onLoginOrRegister?: () => void;
		/** "Login" item. Hidden when not provided. (Unauth state only.) */
		onLogin?: () => void;
		/** "Register" item. Hidden when not provided. (Unauth state only.) */
		onRegister?: () => void;
	}

	/**
	 * Labels for built-in items. All optional — defaults are English strings.
	 * Consumers running i18n pass already-translated strings here.
	 */
	export interface UserAvatarMenuLabels {
		viewProfile?: string;
		settings?: string;
		logout?: string;
		loginOrRegister?: string;
		login?: string;
		register?: string;
		lightMode?: string;
		darkMode?: string;
		/** Trigger aria-label when authenticated. Default: "User menu". */
		triggerAuthed?: string;
		/** Trigger aria-label when unauthenticated. Default: "Sign in". */
		triggerAnon?: string;
	}

	/**
	 * Color-scheme item config. Defaults to enabled.
	 * Pass `false` to disable; pass an object to customize.
	 */
	export type UserAvatarMenuColorScheme =
		| boolean
		| {
				enabled?: boolean;
				/** Override the default `ColorScheme.toggle()` behavior. */
				onToggle?: () => void;
				/** Read current "is dark" state. Defaults to `ColorScheme.getValue() === "dark"`. */
				isDark?: () => boolean;
		  };

	export interface Props {
		/** Current user. `null` / `undefined` → unauthenticated mode. */
		identity?: UserAvatarMenuIdentity | null;

		/** Action handlers (see `UserAvatarMenuActions`). */
		actions?: UserAvatarMenuActions;

		/** Translated / customized labels. */
		labels?: UserAvatarMenuLabels;

		/** Color-scheme toggle config. Default: enabled. */
		colorScheme?: UserAvatarMenuColorScheme;

		/** Render the identity header tile (avatar + email) in the dropdown. Default: `true`. */
		showHeaderTile?: boolean;

		/** Render roles under the email in the header tile. Default: `false`. */
		showRoles?: boolean;

		/**
		 * Extra items appended to the standard set (after Logout / Register).
		 * Use for app-specific actions ("Switch project", "Billing", etc.).
		 */
		extraItems?: DropdownMenuItem[];

		/**
		 * Full override. When provided, the standard item set is IGNORED and the
		 * component renders exactly these items. `identity` is still consulted for
		 * the trigger; everything else (`actions`, `labels`, `colorScheme`,
		 * `showHeaderTile`, `showRoles`) is not.
		 */
		items?: DropdownMenuItem[];

		/** Forwarded to BOTH the trigger `Avatar` and the header-tile `Avatar`. */
		avatar?: Partial<Omit<AvatarProps, "onclick" | "initials" | "src" | "el">>;

		/**
		 * Overrides applied on top of `avatar` for the header-tile `Avatar` only
		 * (the larger avatar shown above the menu items inside the popup).
		 * Shallow-merged: keys present here win over `avatar`.
		 */
		avatarHeader?: Partial<Omit<AvatarProps, "onclick" | "initials" | "src" | "el">>;

		/** Forwarded to `DropdownMenu`. */
		position?: DropdownMenuPosition;
		offset?: string;
		maxHeight?: string;
		closeOnSelect?: boolean;
		classDropdown?: string;
		classTrigger?: string;

		/** Bindable open state (forwarded to `DropdownMenu`). */
		isOpen?: boolean;

		/**
		 * Optional custom trigger snippet. Receives the same args as
		 * `DropdownMenu`'s `trigger` snippet — `isOpen`, `toggle`, `triggerProps`.
		 */
		trigger?: Snippet<
			[
				{
					isOpen: boolean;
					toggle: () => void;
					triggerProps: {
						id: string;
						"aria-haspopup": "menu";
						"aria-expanded": boolean;
						"aria-controls": string;
					};
				},
			]
		>;

		/**
		 * Optional custom header-tile snippet. Replaces the default
		 * avatar + email tile rendered at the top of the menu.
		 */
		headerTile?: Snippet<[{ identity: UserAvatarMenuIdentity }]>;

		/** Skip default styling. */
		unstyled?: boolean;
		/** Additional CSS classes on the wrapper. */
		class?: string;
		/** Bindable wrapper element. */
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { twMerge } from "../../utils/tw-merge.js";
	import { iconLogOut, iconMoon, iconSun } from "../../icons/index.js";
	import Avatar from "../Avatar/Avatar.svelte";
	import DropdownMenu from "../DropdownMenu/DropdownMenu.svelte";
	import { ColorScheme } from "../ColorScheme/index.js";

	let {
		identity = null,
		actions = {},
		labels = {},
		colorScheme = true,
		showHeaderTile = true,
		showRoles = false,
		extraItems,
		items: itemsOverride,
		avatar: avatarOverrides,
		avatarHeader: avatarHeaderOverrides,
		position,
		offset,
		maxHeight,
		closeOnSelect,
		classDropdown,
		classTrigger,
		isOpen = $bindable(false),
		trigger,
		headerTile,
		unstyled = false,
		class: classProp,
		el = $bindable(),
	}: Props = $props();

	const isAuthed = $derived(!!identity);

	const avatarHeaderMerged = $derived({
		...(avatarOverrides ?? {}),
		...(avatarHeaderOverrides ?? {}),
	});

	// Color-scheme config normalization
	const cs = $derived(
		typeof colorScheme === "object" && colorScheme !== null ? colorScheme : {}
	);
	const csEnabled = $derived(
		colorScheme === false ? false : cs.enabled !== false /* default true */
	);

	const isDark = $derived(
		csEnabled
			? cs.isDark
				? cs.isDark()
				: ColorScheme.current === "dark"
			: false
	);

	function toggleColorScheme() {
		if (cs.onToggle) {
			cs.onToggle();
		} else {
			ColorScheme.toggle();
		}
	}

	// Default labels (English)
	const L = $derived({
		viewProfile: labels.viewProfile ?? "View profile",
		settings: labels.settings ?? "Settings",
		logout: labels.logout ?? "Logout",
		loginOrRegister: labels.loginOrRegister ?? "Login or register",
		login: labels.login ?? "Login",
		register: labels.register ?? "Register",
		lightMode: labels.lightMode ?? "Light mode",
		darkMode: labels.darkMode ?? "Dark mode",
		triggerAuthed: labels.triggerAuthed ?? "User menu",
		triggerAnon: labels.triggerAnon ?? "Sign in",
	});

	function buildColorSchemeItem(): DropdownMenuItem {
		return {
			type: "action",
			id: "color-scheme",
			label: isDark ? L.lightMode : L.darkMode,
			contentBefore: {
				html: isDark ? iconSun({ size: 16 }) : iconMoon({ size: 16 }),
			},
			onSelect: toggleColorScheme,
		};
	}

	const computedItems = $derived.by((): DropdownMenuItem[] => {
		if (itemsOverride) return itemsOverride;

		const out: DropdownMenuItem[] = [];

		if (isAuthed) {
			if (showHeaderTile) {
				out.push({
					type: "custom",
					id: "header-tile",
					content: { snippet: renderHeaderTile },
				});
			}

			let renderedAny = false;
			if (actions.onProfile) {
				out.push({
					type: "action",
					id: "profile",
					label: L.viewProfile,
					onSelect: actions.onProfile,
				});
				renderedAny = true;
			}
			if (actions.onSettings) {
				out.push({
					type: "action",
					id: "settings",
					label: L.settings,
					onSelect: actions.onSettings,
				});
				renderedAny = true;
			}
			if (csEnabled) {
				out.push(buildColorSchemeItem());
				renderedAny = true;
			}

			if (renderedAny && actions.onLogout) {
				out.push({ type: "divider", id: "div-logout" });
			}

			if (actions.onLogout) {
				out.push({
					type: "action",
					id: "logout",
					label: L.logout,
					contentBefore: { html: iconLogOut({ size: 16 }) },
					onSelect: actions.onLogout,
				});
			}
		} else {
			if (actions.onLoginOrRegister) {
				out.push({
					type: "action",
					id: "login-or-register",
					label: L.loginOrRegister,
					onSelect: actions.onLoginOrRegister,
				});
			}
			if (actions.onLogin) {
				out.push({
					type: "action",
					id: "login",
					label: L.login,
					onSelect: actions.onLogin,
				});
			}
			if (actions.onRegister) {
				out.push({
					type: "action",
					id: "register",
					label: L.register,
					onSelect: actions.onRegister,
				});
			}
			if (csEnabled) out.push(buildColorSchemeItem());
		}

		if (extraItems?.length) out.push(...extraItems);
		return out;
	});

	const wrapperClass = $derived(
		twMerge(!unstyled && "stuic-user-avatar-menu", classProp)
	);
</script>

{#snippet defaultHeaderTile()}
	{#if identity}
		<div class={!unstyled ? "stuic-user-avatar-menu-header" : undefined}>
			<Avatar
				initials={identity.email}
				initialsLength={1}
				autoColor
				hashSource={identity.email}
				src={identity.src}
				onclick={actions.onProfile}
				{...avatarHeaderMerged}
			/>
			<div class={!unstyled ? "stuic-user-avatar-menu-header-email" : undefined}>
				{identity.name ?? identity.email}
			</div>
			{#if showRoles && identity.roles?.length}
				<div class={!unstyled ? "stuic-user-avatar-menu-header-roles" : undefined}>
					{identity.roles.join(", ")}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet renderHeaderTile(_args: Record<string, any>)}
	{#if identity}
		{#if headerTile}
			{@render headerTile({ identity })}
		{:else}
			{@render defaultHeaderTile()}
		{/if}
	{/if}
{/snippet}

{#snippet defaultTrigger({
	toggle,
	triggerProps,
}: {
	isOpen: boolean;
	toggle: () => void;
	triggerProps: Record<string, any>;
})}
	<button
		type="button"
		onclick={toggle}
		aria-label={isAuthed ? L.triggerAuthed : L.triggerAnon}
		class={twMerge(!unstyled && "stuic-user-avatar-menu-trigger", classTrigger)}
		{...triggerProps}
	>
		{#if isAuthed && identity}
			<Avatar
				initials={identity.email}
				initialsLength={1}
				autoColor
				hashSource={identity.email}
				src={identity.src}
				{...avatarOverrides}
			/>
		{:else}
			<Avatar {...avatarOverrides} />
		{/if}
	</button>
{/snippet}

<div bind:this={el} class={wrapperClass}>
	<DropdownMenu
		items={computedItems}
		bind:isOpen
		{position}
		{offset}
		{maxHeight}
		{closeOnSelect}
		classDropdown={twMerge(!unstyled && "stuic-user-avatar-menu-dropdown", classDropdown)}
		{unstyled}
		trigger={trigger ?? defaultTrigger}
	/>
</div>
