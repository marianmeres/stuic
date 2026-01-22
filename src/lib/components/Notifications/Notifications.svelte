<script lang="ts" module>
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
		noIcons?: boolean;
		noProgress?: boolean;
		noXButton?: boolean;
		forceAsHtml?: boolean;
		ariaCloseLabel?: string;
		duration?: number;
		iconFns?: Partial<Record<keyof typeof notificationsDefaultIcons, CallableFunction>>;
		// Class overrides
		class?: string;
		classWrapY?: string;
		classWrapX?: string;
		classNotifCount?: string;
		classNotifIcon?: string;
		classNotifContent?: string;
		classProgress?: string;
		classProgressBar?: string;
		el?: HTMLDivElement;
	}
</script>

<script lang="ts">
	import { fade } from "svelte/transition";
	import { twMerge } from "../../utils/tw-merge.js";
	import Button from "../Button/Button.svelte";
	import Thc from "../Thc/Thc.svelte";
	import X from "../X/X.svelte";
	import type { Notification } from "./notifications-stack.svelte.js";
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
		noIcons,
		noProgress,
		noXButton,
		forceAsHtml,
		ariaCloseLabel = "Close",
		duration = 200,
		iconFns = {},
		//
		class: classNotifBox,
		classWrapY,
		classWrapX,
		classNotifCount,
		classNotifIcon,
		classNotifContent,
		classProgress,
		classProgressBar,
		el = $bindable(),
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
			"stuic-notifs fixed z-50 flex flex-row inset-0 pointer-events-none bg-transparent",
			XMAP[x],
			XMAP_M[xMobile],
			classWrapX
		)}
	>
		<div
			class={twMerge(
				"flex flex-col inset-0 w-full sm:w-auto pointer-events-none bg-transparent",
				"p-4",
				YMAP_M[yMobile],
				YMAP[y],
				classWrapY
			)}
			style="gap: var(--stuic-notification-gap);"
		>
			{#each notifications.stack as n (n.id)}
				{@const iconHtml = maybeIcon(n)}
				{@const showXButton = !noXButton || n.ttl > 1000}
				<div
					bind:this={el}
					class={twMerge("stuic-notification", classNotifBox)}
					data-type={n.type}
					transition:fade|global={{ duration }}
					role="alert"
				>
					{#if n.ttl && !noProgress}
						<Progress
							progress={100 - n._ttlProgress * 100}
							class={twMerge("progress", classProgress)}
							classBar={twMerge("progress-bar", classProgressBar)}
							styleBar="transition-duration: {notifications.options.disposeInterval}ms;"
						/>
					{/if}

					{#if n.count > 1}
						<div class={twMerge("count", classNotifCount)}>
							{n.count}
						</div>
					{/if}
					{#if !noIcons && iconHtml}
						<div class={twMerge("icon hidden! sm:block!", classNotifIcon)}>
							{@html iconHtml}
						</div>
					{/if}

					<div
						class={twMerge(
							"content",
							!showXButton && "no-close-button",
							classNotifContent
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
						<Button
							unstyled
							class="close-button"
							aria-label={ariaCloseLabel}
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								e.stopImmediatePropagation();
								notifications.removeById(n.id);
							}}
						>
							<X />
						</Button>
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
