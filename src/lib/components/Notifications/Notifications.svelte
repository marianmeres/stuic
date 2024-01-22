<script context="module" lang="ts">
	import { fade } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';
	import Thc from '../Thc/Thc.svelte';
	import X from '../X/X.svelte';
	import { notificationsDefaultIcons } from './notifications-icons.js';
	import type {
		Notification,
		NotificationType,
		createNotificationsStore,
	} from './notifications.js';
	import { createClog } from '@marianmeres/clog';

	const X_POSITIONS = ['left', 'center', 'right'] as const;
	const Y_POSITIONS = ['top', 'center', 'bottom'] as const;

	// https://github.com/microsoft/TypeScript/issues/28046#issuecomment-480516434
	type ArrayElement<T extends ReadonlyArray<unknown>> =
		T extends ReadonlyArray<infer ArrayElement> ? ArrayElement : never;

	type POSX = ArrayElement<typeof X_POSITIONS>;
	type POSY = ArrayElement<typeof Y_POSITIONS>;

	const DEFAULT: { posX: POSX; posXMobile: POSX; posY: POSY; posYMobile: POSY } = {
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

	interface NotifClasses {
		box: string;
		count: string;
		icon: string;
		content: string;
		button: string;
		x: string;
	}

	export class NotificationsConfig {
		static preset = {
			wrap: `
                fixed z-10
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
                    group
                    rounded-tr-md rounded-br-md
                `,
				x: `
                    opacity-75 group-hover:opacity-100
                `,
			},
		};

		// prettier-ignore
		static presetByType: Record<NotificationType, NotifClasses> = {
			info:    { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			success: { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			warn:    { box: ``,           count: ``, icon: ``, content: ``, button: ``, x: `` },
			error:   { box: `bg-red-700`, count: ``, icon: ``, content: ``, button: ``, x: `` },
		};

		static class = {
			wrap: '',
			wrapInner: '',
			notification: { box: ``, count: ``, icon: ``, content: ``, button: ``, x: `` },
		};

		// prettier-ignore
		static classByType: Record<NotificationType, NotifClasses> = {
			info:    { box: ``, count: ``, icon: ``, content: ``, button: ``, x: `` },
			success: { box: ``, count: ``, icon: ``, content: ``, button: ``, x: `` },
			warn:    { box: ``, count: ``, icon: ``, content: ``, button: ``, x: `` },
			error:   { box: ``, count: ``, icon: ``, content: ``, button: ``, x: `` },
		};

		static iconFn: Record<NotificationType, undefined | (() => string)> = {
			info: undefined,
			success: undefined,
			warn: undefined,
			error: undefined,
		};

		// conveniently hoisted THC option, since all content is rendered via THC
		static forceAsHtml: boolean | undefined = undefined;
	}
</script>

<script lang="ts">
	const clog = createClog('Notifications');

	// the store created by createNotificationsStore()
	export let notifications: ReturnType<typeof createNotificationsStore>;
	// $: clog($notifications);

	let _class = '';
	export { _class as class };

	export let ariaCloseLabel = 'Discard';

	// right|center|left
	export let posX: POSX = DEFAULT.posX;
	export let posXMobile: POSX = DEFAULT.posXMobile;

	// top|center|bottom
	export let posY: POSY = DEFAULT.posY;
	export let posYMobile: POSY = DEFAULT.posYMobile;

	// sanitize
	let x: POSX, y: POSY, xMobile: POSX, yMobile: POSY;

	// x
	$: x = X_POSITIONS.includes(posX) ? posX : DEFAULT.posX;
	$: xMobile = X_POSITIONS.includes(posXMobile) ? posXMobile : DEFAULT.posXMobile;

	// y
	$: y = Y_POSITIONS.includes(posY) ? posY : DEFAULT.posY;
	$: yMobile = Y_POSITIONS.includes(posYMobile) ? posYMobile : DEFAULT.posYMobile;

	$: _wrapClass = twMerge(
		NotificationsConfig.preset.wrap,
		NotificationsConfig.class.wrap,
		`flex flex-row inset-0 
        pointer-events-none bg-transparent`,
		YMAP_M[yMobile],
		YMAP[y]
	);

	$: _wrapInnerClass = twMerge(
		NotificationsConfig.preset.wrapInner,
		NotificationsConfig.class.wrapInner,
		`flex flex-col w-full 
        pointer-events-none bg-transparent`,
		XMAP_M[xMobile],
		XMAP[x]
	);

	//
	const _boxClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.box || '',
			NotificationsConfig?.class?.notification?.box || '',
			NotificationsConfig?.presetByType?.[n.type]?.box || '',
			NotificationsConfig?.classByType?.[n.type]?.box || '',
			n.class?.box || ''
		);

	const _countClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.count || '',
			NotificationsConfig?.class?.notification?.count || '',
			NotificationsConfig?.presetByType?.[n.type]?.count || '',
			NotificationsConfig?.classByType?.[n.type]?.count || '',
			n.class?.count || ''
		);

	const _iconClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.icon || '',
			NotificationsConfig?.class?.notification?.icon || '',
			NotificationsConfig?.presetByType?.[n.type]?.icon || '',
			NotificationsConfig?.classByType?.[n.type]?.icon || '',
			n.class?.icon || ''
		);

	const _contentClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.content || '',
			NotificationsConfig?.class?.notification?.content || '',
			NotificationsConfig?.presetByType?.[n.type]?.content || '',
			NotificationsConfig?.classByType?.[n.type]?.content || '',
			n.class?.content || ''
		);

	const _buttonClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.button || '',
			NotificationsConfig?.class?.notification?.button || '',
			NotificationsConfig?.presetByType?.[n.type]?.button || '',
			NotificationsConfig?.classByType?.[n.type]?.button || '',
			n.class?.button || ''
		);

	const _xClass = (n: Notification) =>
		twMerge(
			NotificationsConfig?.preset?.notification?.x || '',
			NotificationsConfig?.class?.notification?.x || '',
			NotificationsConfig?.presetByType?.[n.type]?.x || '',
			NotificationsConfig?.classByType?.[n.type]?.x || '',
			n.class?.x || ''
		);

	const _iconFn = (n: Notification) => {
		let iconFn: (() => string) | false = false;
		if (n?.iconFn === true) {
			// explicit "true" means default, that is:
			iconFn =
				// either runtime config
				NotificationsConfig.iconFn[n?.type] ||
				// or fixed default
				notificationsDefaultIcons[n?.type];
		} else if (n?.iconFn) {
			// custom instance
			iconFn = n.iconFn;
		} else {
			iconFn = false;
		}

		return iconFn;
	};
	const _isFn = (v: any) => typeof v === 'function';
</script>

<!-- {#if $notifications.length} -->
<div class={_wrapClass} aria-live="assertive">
	<div class={_wrapInnerClass}>
		{#if $notifications.length}
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
								forceAsHtml={n.forceAsHtml ?? NotificationsConfig.forceAsHtml}
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
		{/if}
	</div>
</div>
<!-- {/if} -->
