<script lang="ts">
	import { fade } from "svelte/transition";
	import type { TW_COLORS } from "../../types.js";
	import { twMerge } from "../../utils/tw-merge.js";
	import Thc from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import { notificationsDefaultIcons } from "./notifications-icons.js";
	import "./notifications.css";
	import type {
		Notification,
		NotificationsStack,
		NotificationType,
	} from "./notifications.svelte.js";
	import Progress from "../Progress/Progress.svelte";

	const X_POSITIONS = ["left", "center", "right"] as const;
	const Y_POSITIONS = ["top", "center", "bottom"] as const;

	type NOTIFICATIONS_POSX = (typeof X_POSITIONS)[number];
	type NOTIFICATIONS_POSY = (typeof Y_POSITIONS)[number];

	const DEFAULT: {
		posX: NOTIFICATIONS_POSX;
		posXMobile: NOTIFICATIONS_POSX;
		posY: NOTIFICATIONS_POSY;
		posYMobile: NOTIFICATIONS_POSY;
	} = {
		posX: "right",
		posXMobile: "center",
		posY: "top",
		posYMobile: "bottom",
	};

	// prettier-ignore
	const XMAP = { left: 'sm:items-start', center: 'sm:items-center', right: 'sm:items-end' };
	// prettier-ignore
	const XMAP_M = { left: 'items-start', center: 'items-center', right: 'items-end' };

	// prettier-ignore
	const YMAP = { top: 'sm:items-start', center: 'sm:items-center', bottom: 'sm:items-end' };
	// prettier-ignore
	const YMAP_M = { top: 'items-start', center: 'items-center', bottom: 'items-end' };

	interface Props {
		notifications: NotificationsStack;
		// right|center|left
		posX?: NOTIFICATIONS_POSX;
		posXMobile?: NOTIFICATIONS_POSX;
		// top|center|bottom
		posY?: NOTIFICATIONS_POSY;
		posYMobile?: NOTIFICATIONS_POSY;
		//
		themeInfo?: TW_COLORS;
		themeError?: TW_COLORS;
		themeWarn?: TW_COLORS;
		themeSuccess?: TW_COLORS;
		//
		classWrap?: string;
		classWrapInner?: string;
		class?: string; // classNotifBox
		classNotifCount?: string;
		classNotifIcon?: string;
		classNotifContent?: string;
		classNotifButton?: string;
		classNotifButtonX?: string;
		//
		classProgress?: string;
		classProgressBar?: string;
		//
		forceAsHtml?: boolean;
		ariaCloseLabel?: string;
		duration?: number;
		//
		noProgress?: boolean;
	}

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
		//
		classWrap,
		classWrapInner,
		class: classNotifBox,
		classNotifCount,
		classNotifIcon,
		classNotifContent,
		classNotifButton,
		classNotifButtonX,
		//
		classProgress,
		classProgressBar,
		//
		forceAsHtml,
		ariaCloseLabel = "Close",
		duration = 200,
		noProgress,
	}: Props = $props();

	let { x, y, xMobile, yMobile } = $derived.by(() => {
		const x = X_POSITIONS.includes(posX) ? posX : DEFAULT.posX;
		const xMobile = X_POSITIONS.includes(posXMobile) ? posXMobile : DEFAULT.posXMobile;
		const y = Y_POSITIONS.includes(posY) ? posY : DEFAULT.posY;
		const yMobile = Y_POSITIONS.includes(posYMobile) ? posYMobile : DEFAULT.posYMobile;
		return { x, y, xMobile, yMobile };
	});

	const maybeComponent = (n: Notification): { Cmp: any; props: any } => {
		// todo when needed
		return { Cmp: null, props: null };
	};

	const maybeIcon = (n: Notification) => n.iconFn ?? notificationsDefaultIcons?.[n.type];

	const _classWrap = `
        fixed z-50 flex flex-row inset-0 
        pointer-events-none bg-transparent`;

	const _classWrapInner = `
        p-4 space-y-4
        flex flex-col w-full 
        pointer-events-none bg-transparent`;

	const _classNotifBox = `
        relative flex
        pointer-events-auto 
        w-full max-w-sm
        rounded-md
        shadow-lg
        border-notif-border dark:border-notif-border-dark
        bg-notif-bg text-notif-text
        dark:bg-notif-bg-dark dark:text-notif-text-dark`;

	const _classNotifCount = `
        absolute -top-2 -right-2 
        w-auto h-auto
        flex items-center justify-center
        px-2 py-1 rounded-full
        leading-none text-xs
        bg-neutral-950 text-neutral-50`;

	const _classNotifIcon = `
        flex items-start justify-center
        pt-4 pr-0 pb-4 pl-4
        text-neutral-200`;

	const _classNotifContent = `
        flex-1
        flex flex-col justify-center
        text-sm
        pl-4 pr-1 py-3`;

	const _classNotifButton = `
        flex flex-col items-center justify-center
        leading-none
        px-3
        hover:bg-neutral-950/20
        focus-visible:bg-neutral-950/20 focus-visible:outline-none focus-visible:ring-0
        group
        rounded-tr-md rounded-br-md`;

	const _classNotifButtonX = `opacity-75 group-hover:opacity-100`;

	const _classProgress = `absolute inset-0 size-full bg-transparent rounded-tl-md rounded-bl-md`;
	const _classProgressBar = `bg-white/10 dark:bg-white/5 size-full rounded-tl-md rounded-bl-md`;

	const _buildTheme = (type: NotificationType) => {
		let theme =
			{
				info: themeInfo,
				error: themeError,
				success: themeSuccess,
				warn: themeWarn,
			}[type] || "info";
		return `
            --color-notif-bg: var(--color-notif-${type}-bg, var(--color-${theme}-700));
            --color-notif-text: var(--color-notif-${type}-text, var(--color-${theme}-50));
            --color-notif-border: var(--color-notif-${type}-border, var(--color-${theme}-900));

            --color-notif-bg-dark: var(--color-notif-${type}-bg-dark, var(--color-${theme}-800));
            --color-notif-text-dark: var(--color-notif-${type}-text-dark, var(--color-${theme}-200));
            --color-notif-border-dark: var(--color-notif-${type}-border-dark, var(--color-${theme}-500));
        `;
	};
</script>

{#if notifications.stack.length}
	<div
		aria-live="assertive"
		class={twMerge("stuic-notifs wrap", _classWrap, YMAP_M[yMobile], YMAP[y], classWrap)}
	>
		<div
			class={twMerge(
				"wrap-inner",
				_classWrapInner,
				XMAP_M[xMobile],
				XMAP[x],
				classWrapInner
			)}
		>
			{#each notifications.stack as n (n.id)}
				{@const { Cmp, props } = maybeComponent(n)}
				{@const iconFn = maybeIcon(n)}
				{#if Cmp}
					<Cmp {...props || {}} notification={n} {notifications} />
				{:else}
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
						{#if typeof iconFn === "function"}
							<div class={twMerge("icon", _classNotifIcon, classNotifIcon)}>
								{@html iconFn()}
							</div>
						{/if}

						<div class={twMerge("content", _classNotifContent, classNotifContent)}>
							<Thc
								thc={n.content}
								forceAsHtml={n.forceAsHtml ?? forceAsHtml}
								notification={n}
								{notifications}
							/>
						</div>

						<button
							class={twMerge("button", _classNotifButton, classNotifButton)}
							aria-label={ariaCloseLabel}
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								notifications.removeById(n.id);
							}}
						>
							<X class={twMerge("x", _classNotifButtonX, classNotifButtonX)} />
						</button>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}
