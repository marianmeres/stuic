<script lang="ts" module>
	import type { TW_COLORS } from "../../types.js";
	import type { NotificationsStack } from "./notifications-stack.svelte.js";
	import { notificationsDefaultIcons } from "./notifications-icons.js";

	const X_POSITIONS = ["left", "center", "right"] as const;
	const Y_POSITIONS = ["top", "center", "bottom"] as const;

	type NOTIFICATIONS_POSX = (typeof X_POSITIONS)[number];
	type NOTIFICATIONS_POSY = (typeof Y_POSITIONS)[number];

	export interface Props {
		notifications: NotificationsStack;
		posX?: NOTIFICATIONS_POSX;
		posXMobile?: NOTIFICATIONS_POSX;
		posY?: NOTIFICATIONS_POSY;
		posYMobile?: NOTIFICATIONS_POSY;
		themeInfo?: TW_COLORS;
		themeError?: TW_COLORS;
		themeWarn?: TW_COLORS;
		themeSuccess?: TW_COLORS;
		noTheme?: boolean;
		noIcons?: boolean;
		classWrapY?: string;
		classWrapX?: string;
		class?: string;
		classNotifCount?: string;
		classNotifIcon?: string;
		classNotifContent?: string;
		classNotifButton?: string;
		classNotifButtonX?: string;
		buttonXStrokeWidth?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4;
		classProgress?: string;
		classProgressBar?: string;
		forceAsHtml?: boolean;
		ariaCloseLabel?: string;
		duration?: number;
		noProgress?: boolean;
		noXButton?: boolean;
		iconFns?: Partial<Record<keyof typeof notificationsDefaultIcons, CallableFunction>>;
	}
</script>

<script lang="ts">
	import { fade } from "svelte/transition";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import "./index.css";
	import type { Notification, NotificationType } from "./notifications-stack.svelte.js";
	import Progress from "../Progress/Progress.svelte";

	const DEFAULT: {
		posX: "left" | "center" | "right";
		posXMobile: "left" | "center" | "right";
		posY: "top" | "center" | "bottom";
		posYMobile: "top" | "center" | "bottom";
	} = {
		posX: "right",
		posXMobile: "center",
		posY: "top",
		posYMobile: "top",
	};

	// prettier-ignore
	const XMAP = { left: 'sm:justify-start', center: 'sm:justify-center', right: 'sm:justify-end' };
	// prettier-ignore
	const XMAP_M = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

	// prettier-ignore
	const YMAP = { top: 'sm:justify-start', center: 'sm:justify-center', bottom: 'sm:justify-end' };
	// prettier-ignore
	const YMAP_M = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };

	let {
		notifications,
		//
		posX = DEFAULT.posX,
		posXMobile = DEFAULT.posXMobile,
		//
		posY = DEFAULT.posY,
		posYMobile = DEFAULT.posYMobile,
		//
		themeInfo = "neutral",
		themeError = "red",
		themeWarn = "yellow",
		themeSuccess = "green",
		// use truthy `noTheme` if manual css-only var customization is needed
		noTheme,
		noIcons,
		//
		classWrapY,
		classWrapX,
		class: classNotifBox,
		classNotifCount,
		classNotifIcon,
		classNotifContent,
		classNotifButton,
		classNotifButtonX,
		buttonXStrokeWidth = 3,
		//
		classProgress,
		classProgressBar,
		//
		forceAsHtml,
		ariaCloseLabel = "Close",
		duration = 200,
		noProgress,
		noXButton,
		iconFns = {},
	}: Props = $props();

	let popoverEl: HTMLDivElement | null = $state(null);

	let { x, y, xMobile, yMobile } = $derived.by(() => {
		const x = X_POSITIONS.includes(posX) ? posX : DEFAULT.posX;
		const xMobile = X_POSITIONS.includes(posXMobile) ? posXMobile : DEFAULT.posXMobile;
		const y = Y_POSITIONS.includes(posY) ? posY : DEFAULT.posY;
		const yMobile = Y_POSITIONS.includes(posYMobile) ? posYMobile : DEFAULT.posYMobile;
		return { x, y, xMobile, yMobile };
	});

	let _iconFns = $derived({ ...notificationsDefaultIcons, ...iconFns });

	const maybeIcon = (n: Notification) => {
		if (n.iconFn === false) return "";
		if (typeof n.iconFn === "function") return n.iconFn();
		return (_iconFns?.[n.type] as any)?.();
	};

	const _classWrapX = `
        fixed z-50 flex flex-row inset-0
        pointer-events-none bg-transparent`;

	const _classWrapY = `
        p-4 space-y-4
        flex flex-col inset-0
        w-full sm:w-auto
        pointer-events-none bg-transparent`;

	const _classNotifBox = `
        relative flex
        pointer-events-auto
        w-full sm:w-sm max-w-full sm:max-w-sm
        rounded-lg
        shadow-lg
        border border-(--stuic-notification-border)
        bg-(--stuic-notification-bg) text-(--stuic-notification-text)`;

	const _classNotifCount = `
        absolute -top-2 -right-2
        w-auto h-auto
        flex items-center justify-center
        px-2 py-1 rounded-full
        leading-none text-xs
        bg-neutral-950 text-neutral-50`;

	const _classNotifIcon = `
        flex items-center justify-center
        pt-4 pr-0 pb-4 pl-4
        text-neutral-200`;

	const _classNotifContent = `
        flex-1
        flex flex-col justify-center
        tracking-tight
        pl-4 pr-1 py-3`;

	const _classNotifButton = `
        flex flex-col items-center justify-center
        leading-none
        px-3
        hover:bg-neutral-950/10
        focus-visible:bg-neutral-950/10 focus-visible:outline-none focus-visible:ring-0
        group
        rounded-tr-md rounded-br-md`;

	const _classNotifButtonX = `opacity-75 group-hover:opacity-100`;

	const _classProgress = `absolute inset-0 size-full bg-transparent rounded-tl-md rounded-bl-md`;
	const _classProgressBar = `bg-white/10 dark:bg-white/10 size-full rounded-tl-md rounded-bl-md`;

	const _buildTheme = (type: NotificationType) => {
		if (noTheme) return "";
		let theme =
			{
				info: themeInfo,
				error: themeError,
				success: themeSuccess,
				warn: themeWarn,
			}[type] || "info";
		return [
			`--stuic-notification-bg: var(--color-${theme}-700);`,
			`--stuic-notification-text: var(--color-${theme}-50);`,
			`--stuic-notification-border: var(--color-${theme}-800);`,
		].join("");
	};

	// Manage popover visibility based on notifications
	$effect(() => {
		if (!popoverEl) return;

		const hasNotifications = notifications.stack.length > 0;

		try {
			if (hasNotifications && !popoverEl.matches(":popover-open")) {
				popoverEl.showPopover();
			} else if (!hasNotifications && popoverEl.matches(":popover-open")) {
				popoverEl.hidePopover();
			}
		} catch {
			// Popover API not supported - element remains in DOM flow
		}
	});
</script>

<div
	bind:this={popoverEl}
	popover="manual"
	class="stuic-notifs-popover"
	aria-live="assertive"
>
	<div
		class={twMerge(
			"stuic-notifs wrap-x",
			_classWrapX,
			XMAP[x],
			XMAP_M[xMobile],
			classWrapX
		)}
	>
		<div class={twMerge("wrap-y", _classWrapY, YMAP_M[yMobile], YMAP[y], classWrapY)}>
			{#each notifications.stack as n (n.id)}
				{@const iconHtml = maybeIcon(n)}
				{@const showXButton = !noXButton || n.ttl > 1000}
				<div
					class={twMerge("box", _classNotifBox, classNotifBox)}
					transition:fade|global={{ duration }}
					role="alert"
					style={_buildTheme(n.type)}
				>
					{#if n.ttl && !noProgress}
						<Progress
							progress={100 - n._ttlProgress * 100}
							class={twMerge(_classProgress, classProgress)}
							classBar={twMerge(_classProgressBar, classProgressBar)}
							styleBar="transition-duration: {notifications.options.disposeInterval}ms;"
						/>
					{/if}

					{#if n.count > 1}
						<div class={twMerge("count", _classNotifCount, classNotifCount)}>
							{n.count}
						</div>
					{/if}
					{#if !noIcons && iconHtml}
						<div class={twMerge("icon", _classNotifIcon, classNotifIcon)}>
							{@html iconHtml}
						</div>
					{/if}

					<div
						class={twMerge(
							"content",
							_classNotifContent,
							classNotifContent,
							!showXButton && "pr-4"
						)}
					>
						<Thc
							thc={n.content}
							forceAsHtml={n.forceAsHtml ?? forceAsHtml}
							notification={n}
							{notifications}
						/>
					</div>

					{#if showXButton}
						<button
							type="button"
							class={twMerge("button", _classNotifButton, classNotifButton)}
							aria-label={ariaCloseLabel}
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								e.stopImmediatePropagation();
								notifications.removeById(n.id);
							}}
						>
							<X
								class={twMerge("x", _classNotifButtonX, classNotifButtonX)}
								strokeWidth={buttonXStrokeWidth}
							/>
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Override default popover positioning */
	.stuic-notifs-popover {
		/* Reset popover defaults */
		position: fixed;
		inset: 0;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		max-width: none;
		max-height: none;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
	}

	/* Transparent backdrop so content behind is clickable */
	.stuic-notifs-popover::backdrop {
		background: transparent;
		pointer-events: none;
	}
</style>
