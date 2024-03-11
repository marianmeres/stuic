<script context="module" lang="ts">
	import { createClog } from '@marianmeres/clog';
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import Thc from '../Thc/Thc.svelte';
	import X from '../X/X.svelte';
	import { notificationsDefaultIcons } from './notifications-icons.js';
	import type {
		Notification,
		NotificationKnownClasses,
		NotificationType,
		createNotificationsStore,
	} from './notifications.js';

	const X_POSITIONS = ['left', 'center', 'right'] as const;
	const Y_POSITIONS = ['top', 'center', 'bottom'] as const;

	// https://github.com/microsoft/TypeScript/issues/28046#issuecomment-480516434
	type ArrayElement<T extends ReadonlyArray<unknown>> =
		T extends ReadonlyArray<infer ArrayElement> ? ArrayElement : never;

	export type NOTIFICATIONS_POSX = ArrayElement<typeof X_POSITIONS>;
	export type NOTIFICATIONS_POSY = ArrayElement<typeof Y_POSITIONS>;

	const DEFAULT: {
		posX: NOTIFICATIONS_POSX;
		posXMobile: NOTIFICATIONS_POSX;
		posY: NOTIFICATIONS_POSY;
		posYMobile: NOTIFICATIONS_POSY;
	} = {
		posX: 'center',
		posXMobile: 'center',
		posY: 'top',
		posYMobile: 'bottom',
	};

	// prettier-ignore
	const XMAP = { left: 'sm:items-start', center: 'sm:items-center', right: 'sm:items-end' };
	// prettier-ignore
	const XMAP_M = { left: 'items-start', center: 'items-center', right: 'items-end' };

	// prettier-ignore
	const YMAP = { top: 'sm:items-start', center: 'sm:items-center', bottom: 'sm:items-end' };
	// prettier-ignore
	const YMAP_M = { top: 'items-start', center: 'items-center', bottom: 'items-end' };

	export class NotificationsConfig {
		static preset = {
			wrap: `
                fixed z-50
            `,
			wrapInner: `
                p-4 space-y-4
            `,
			notification: {
				box: `
                    relative flex
                    pointer-events-auto 
                    w-full max-w-lg
                    rounded-md
                    shadow-lg
                    bg-gray-700 text-white
                `,
				count: `
                    absolute -top-2 -right-2 
                    w-auto h-auto
                    flex items-center justify-center
                    px-2 py-1 rounded-full
                    leading-none text-xs
                    bg-black text-white
                `,
				icon: `
                    flex items-start justify-center
                    pt-4 pr-0 pb-4 pl-4
                    text-gray-200
                `,
				content: `
                    flex-1
                    flex flex-col justify-center
                    text-sm
                    pl-4 pr-1 py-3
                `,
				button: `
                    flex flex-col items-center justify-center
                    leading-none
                    px-3
                    hover:bg-black/20
                    focus-visible:bg-black/20 focus-visible:outline-none focus-visible:ring-0
                    group
                    rounded-tr-md rounded-br-md
                `,
				x: `
                    opacity-75 group-hover:opacity-100
                `,
			},
		};

		// prettier-ignore
		static presetByType: Record<NotificationType, NotificationKnownClasses> = {
			info:    { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			success: { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			warn:    { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			error:   { box: `bg-red-700`, count: ``, icon: ``, content: ``, button: ``, x: `` },
		};
	}
</script>

<script lang="ts">
	const clog = createClog('Notifications');

	// the store created by createNotificationsStore()
	export let notifications: ReturnType<typeof createNotificationsStore>;
	// $: clog($notifications);

	export let forceAsHtml: boolean | undefined = undefined;
	export let defaultIcons: Partial<Record<NotificationType, () => string>> =
		notificationsDefaultIcons;

	export let classes: Partial<NotificationKnownClasses> = {};
	export let classesByType: Partial<
		Record<NotificationType, Partial<NotificationKnownClasses>>
	> = {};

	export let ariaCloseLabel = 'Discard';

	// right|center|left
	export let posX: NOTIFICATIONS_POSX = DEFAULT.posX;
	export let posXMobile: NOTIFICATIONS_POSX = DEFAULT.posXMobile;

	// top|center|bottom
	export let posY: NOTIFICATIONS_POSY = DEFAULT.posY;
	export let posYMobile: NOTIFICATIONS_POSY = DEFAULT.posYMobile;

	// sanitize
	let x: NOTIFICATIONS_POSX,
		y: NOTIFICATIONS_POSY,
		xMobile: NOTIFICATIONS_POSX,
		yMobile: NOTIFICATIONS_POSY;

	export function getPositionConfig() {
		return {
			posX: x,
			posY: y,
			posXMobile: xMobile,
			posYMobile: yMobile,
		};
	}

	// x
	$: x = X_POSITIONS.includes(posX) ? posX : DEFAULT.posX;
	$: xMobile = X_POSITIONS.includes(posXMobile) ? posXMobile : DEFAULT.posXMobile;

	// y
	$: y = Y_POSITIONS.includes(posY) ? posY : DEFAULT.posY;
	$: yMobile = Y_POSITIONS.includes(posYMobile) ? posYMobile : DEFAULT.posYMobile;

	$: _wrapClass = twMerge(
		NotificationsConfig.preset.wrap,
		`flex flex-row inset-0 
        pointer-events-none bg-transparent`,
		YMAP_M[yMobile],
		YMAP[y]
	);

	$: _wrapInnerClass = twMerge(
		NotificationsConfig.preset.wrapInner,
		`flex flex-col w-full 
        pointer-events-none bg-transparent`,
		XMAP_M[xMobile],
		XMAP[x]
	);

	const _collectClasses = (n: Notification, k: keyof NotificationKnownClasses) => [
		NotificationsConfig?.preset?.notification?.[k] || '',
		classes?.[k] || '',
		NotificationsConfig?.presetByType?.[n.type]?.[k] || '',
		classesByType?.[n.type]?.[k] || '',
		n.class?.[k] || '',
	];

	//
	const _boxClass = (n: Notification) => twMerge(..._collectClasses(n, 'box'));
	const _countClass = (n: Notification) => twMerge(..._collectClasses(n, 'count'));
	const _iconClass = (n: Notification) => twMerge(..._collectClasses(n, 'icon'));
	const _contentClass = (n: Notification) => twMerge(..._collectClasses(n, 'content'));
	const _buttonClass = (n: Notification) => twMerge(..._collectClasses(n, 'button'));
	const _xClass = (n: Notification) => twMerge(..._collectClasses(n, 'x'));
	const _iconFn = (o: Notification) => o.iconFn ?? defaultIcons?.[o.type];

	const _isFn = (v: any) => typeof v === 'function';
</script>

{#if $notifications.length}
	<div class={_wrapClass} aria-live="assertive">
		<div class={_wrapInnerClass}>
			{#each $notifications as n}
				{@const iconFn = _iconFn(n)}
				<!-- use your own component -->
				{#if n?.component}
					<svelte:component
						this={n.component.component || n.component}
						{...n.component.props || {}}
						notification={n}
						{notifications}
					/>
				{:else}
					<!-- svelte-ignore 
                            a11y-click-events-have-key-events 
                            a11y-no-noninteractive-element-interactions 
                            a11y-mouse-events-have-key-events -->
					<div
						transition:fade|global={{ duration: 200 }}
						class={_boxClass(n)}
						class:cursor-pointer={typeof n.onClick === 'function'}
						data-notification-type={n.type}
						data-notification-multiple={n.count > 1 ? true : undefined}
						role="alert"
						on:mouseover={() => notifications.event(n.id, notifications.EVENT.MOUSEOVER)}
						on:mouseout={() => notifications.event(n.id, notifications.EVENT.MOUSEOUT)}
						on:click={() => notifications.event(n.id, notifications.EVENT.CLICK)}
					>
						{#if n.count > 1}
							<div class={_countClass(n)}>
								{n.count}
							</div>
						{/if}

						{#if _isFn(iconFn)}
							<div class={_iconClass(n)}>{@html iconFn()}</div>
						{/if}

						<div class={_contentClass(n)}>
							<Thc
								thc={n.content}
								forceAsHtml={n.forceAsHtml ?? forceAsHtml}
								notification={n}
								{notifications}
							/>
						</div>

						<button
							class={_buttonClass(n)}
							aria-label={ariaCloseLabel}
							on:click|preventDefault|stopPropagation={() => notifications.remove(n.id)}
						>
							<X class={_xClass(n)} />
						</button>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}
