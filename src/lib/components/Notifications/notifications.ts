import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';
import { createTicker } from '@marianmeres/ticker';
import type { THC } from '../Thc/Thc.svelte';

export type NotificationsSortOrder = 'asc' | 'desc';

export type NotificationOnEventHandler = (
	eventName: string,
	self: Notification,
	all: Notification[],
	data: any
) => void;

export type NotificationType = 'info' | 'success' | 'warn' | 'error' | string;

interface ComponentWrap {
	component: Function;
	props?: any;
}

export interface NotificationInput extends Record<string, any> {
	// unique id of the notification. If not provided, will be calculated from content.
	// Multiple notifications with the same id will be ignored (but the `count` will be increased)
	id: any;

	// optional UI rendering well known hint (has no effect on the functionality, can be
	// any string), defaults to "info"
	type: NotificationType;

	// the actual notification message (either plain text, html or component)
	// notifications without any content will be ignored
	content: THC;

	// for sorting the queue, will default to now
	// created: Date;

	// generic action handler for triggered actions...
	on: NotificationOnEventHandler;

	// Same as `on('click', ...)` except that UI may detect if this exists (e.g. show
	// pointer cursor), which would not be possible for `on('click', ...)`
	onClick: (self: Notification, all: Notification[], data: any) => void;

	// notification specific time-to-live in seconds (after which notif will be auto discarded)
	// use 0 to disable auto disposal
	ttl: number;

	// Number of notifications in the queue with the same `id`. If you do not provide your
	// own id, it will be calculated from content.
	count: number;

	// optional, in shape `{ component, props }`
	component?: Function | ComponentWrap;

	//
	iconFn: (() => string) | boolean;

	// custom css classes to override/merge with defaults
	class?: Partial<{
		box: string;
		count: string;
		icon: string;
		content: string;
		button: string;
		x: string;
	}>;

	// pragmatic shortcut to THC
	forceAsHtml: boolean | undefined;
}
export interface Notification extends NotificationInput {
	// for sorting the queue, will default to now
	created: Date;

	// Number of notifications in the queue with the same `id`. If you do not provide your
	// own id, it will be calculated from content (type, text, html).
	// count: number;
}

export type NotificationCreateParam = string | Partial<NotificationInput>;

export interface NotiticationsCreateStoreOptions {
	// Maximum number of notifications kept in the queue, if exceeded, older ones (by `created`)
	// will be discarded.
	// Use 0 (zero) to disable capacity check
	maxCapacity: number;

	// Default value for Notification.type, defaults to "info".
	defaultType: string;

	// Global time-to-live in seconds (after which notifs will be auto discarded)
	// Use 0 to disable default auto disposal.
	defaultTtl: number;

	// How to sort the queue, "asc" (default) or "desc".
	// Sorting is always done by the `created` prop.
	sortOrder?: NotificationsSortOrder;

	// boolean to dis/allow default icons, or
	// custom type-to-fn map (function should return svg string)
	defaultIcons?: Record<NotificationType, () => string> | boolean;

	//
	forceAsHtml: boolean | undefined;

	// debug
	logger: (...v: any) => void;
}

const isFn = (v: any) => typeof v === 'function';

const DEFAULT_OPTIONS: Partial<NotiticationsCreateStoreOptions> = {
	maxCapacity: 5,
	defaultTtl: 10,
	defaultType: 'info',
	sortOrder: 'asc',
	defaultIcons: true,
	logger: createClog('notifications'),
};

export const NOTIFICATION_EVENT = {
	CLICK: 'click',
	CREATE: 'create',
	// `remove` programatically, or e.g. by clicking on X
	REMOVE: 'remove',
	// triggered when auto disposed by ttl expiration
	AUTO_DISPOSE: 'auto_dispose',
	// usefull for detecting interacion (so internally may notify as "seen")
	MOUSEOVER: 'mouseover',
	MOUSEOUT: 'mouseout',
};

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const _strHash = (str: string) =>
	`${str || ''}`.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);

const _id = (type: string, content: any) => {
	const str = content?.component
		? 'component'
		: content?.html || content?.text || content;
	return ['id', type, _strHash(str)].join('-');
};

export const createNotificationsStore = (
	initial: NotificationCreateParam[] = [],
	opts: Partial<NotiticationsCreateStoreOptions> = {}
) => {
	if (!Array.isArray(initial)) initial = [initial];

	// merge provided with defaults
	opts = { ...DEFAULT_OPTIONS, ...(opts || {}) };

	const _log = (...args: any[]) =>
		isFn(opts.logger) && (opts.logger as any).apply(null, [...args]);

	const _setOption = (k: keyof NotiticationsCreateStoreOptions, v: any) => {
		// _log(`INFO: setting option '${k} = ${v}'`);
		if (/^maxCapacity|defaultTtl$/.test(k)) {
			v = parseInt(v, 10);
			if (isNaN(v) || v < 0) {
				_log(`WARN: invalid '${k}' option, falling back to default`);
				opts[k] = DEFAULT_OPTIONS[k] as any;
			} else {
				opts[k] = v;
			}
		} else {
			opts[k] = v;
		}
	};

	// sanitize options
	['maxCapacity', 'defaultTtl'].forEach((k: any) => _setOption(k, (opts as any)[k]));

	const _factory = (notification: NotificationCreateParam): Notification | null => {
		let notif: Partial<Notification> =
			typeof notification === 'string' ? { id: 0, content: notification } : notification;

		// ignore invalid (empty) notifs
		if (!notif.content) {
			_log(`WARN: ignoring empty notification`);
			return null;
		}

		notif.type ||= opts.defaultType; //
		notif.id ||= _id((notif as Notification).type, [notif.content].join());
		notif.created = new Date(notif.created || Date.now());
		notif.count ??= 1;
		notif.forceAsHtml ??= opts.forceAsHtml;

		//
		if (notif.ttl === undefined) notif.ttl = opts.defaultTtl;

		//
		if (notif.iconFn === undefined) {
			if (typeof opts.defaultIcons === 'boolean') {
				notif.iconFn = opts.defaultIcons;
			} else {
				notif.iconFn = opts.defaultIcons?.[(notif as Notification).type];
			}
		}

		return notif as Notification;
	};

	const _findIndexById = (notifs: Notification[], id: any) =>
		notifs.findIndex((n) => n.id === id);

	const _removeByIdx = (notifs: Notification[], idx: number) => {
		if (idx > -1) {
			notifs.splice(idx, 1);
			notifs = [...notifs];
		}
		return notifs;
	};

	const _add = (
		notifs: Notification[],
		notification: NotificationCreateParam,
		onAddHook: ((n: Notification) => void) | null = null
	) => {
		const notif = _factory(notification) as Notification;

		// return early on invalid
		if (!notif) return notifs;

		const _isDesc = opts.sortOrder === 'desc';

		const idx = _findIndexById(notifs, notif.id);
		if (idx > -1) {
			notifs[idx].count++;
			notifs[idx].created = new Date(
				Math.max(notifs[idx].created.valueOf(), notif.created.valueOf())
			);
		} else {
			notifs.push(notif as any);
			notifs.sort((a, b) => {
				let _a = a.created.valueOf();
				let _b = b.created.valueOf();
				return _isDesc ? _b - _a : _a - _b;
			});
		}

		if (isFn(onAddHook)) onAddHook?.(notif);

		// keep only `maxCapacity` in the queue
		if (opts.maxCapacity && notifs.length > opts.maxCapacity) {
			notifs = _isDesc
				? notifs.slice(0, opts.maxCapacity)
				: notifs.slice(-1 * opts.maxCapacity);
		}

		return [...notifs];
	};

	// main internal store
	let notifs: Notification[] = [];
	initial.forEach((n) => (notifs = _add(notifs, n)));
	const _store = createStore<Notification[]>(notifs);

	// auto dispose feature
	const ticker = createTicker(1_000);
	const _tickerInit = () => {
		const _tickerUnsub = ticker.start().subscribe((ts) => {
			if (ts) {
				const { disposed, kept } = _store.get().reduce(
					(memo, n) => {
						if (n.ttl) {
							const expiry = n.created.valueOf() + n.ttl * 1000;
							expiry >= Date.now() ? memo.kept.push(n) : memo.disposed.push(n);
						} else {
							memo.kept.push(n);
						}
						return memo;
					},
					{ disposed: [] as Notification[], kept: [] as Notification[] }
				);

				if (disposed.length) {
					disposed.forEach((n) => event(n.id, NOTIFICATION_EVENT.AUTO_DISPOSE));
					_store.set(kept);
				}
			}
		});
		return () => {
			ticker.stop();
			_tickerUnsub();
		};
	};

	//
	const findById = (id: string): Notification | null => {
		const notifs = _store.get();
		const idx = _findIndexById(notifs, id);
		return idx > -1 ? notifs[idx] : null;
	};

	const event = (id: string, eventName: string, data: any = null) => {
		const n = findById(id);
		if (n) {
			if (isFn(n.on)) {
				n.on(eventName, n, _store.get(), data);
			}
			if (eventName === NOTIFICATION_EVENT.CLICK && isFn(n.onClick)) {
				n.onClick(n, _store.get(), data);
			}
			return true;
		}
		return false;
	};

	// we need to keep track of subscriptions count, so we can do the cleanup
	let _subsCount = 0;
	let _tickerDestroy: CallableFunction;
	const subscribe = (cb: CallableFunction) => {
		if (!_subsCount++) _tickerDestroy = _tickerInit();
		const unsub = _store.subscribe(cb as any);
		return () => {
			if (!--_subsCount) _tickerDestroy();
			unsub();
		};
	};

	const add = (notif: NotificationCreateParam[] | NotificationCreateParam) => {
		if (!Array.isArray(notif)) notif = [notif];
		let notifs = _store.get();
		notif.forEach(
			(n: Notification) =>
				(notifs = _add(notifs, n, (_n) => event(_n.id, NOTIFICATION_EVENT.CREATE)))
		);
		_store.set(notifs);
	};

	return {
		subscribe,
		//
		get: (): Notification[] => _store.get(),
		//
		add,
		//
		event,
		//
		find: findById,
		//
		remove: (id: string) => {
			let notifs = _store.get();
			const idx = _findIndexById(notifs, id);
			if (idx > -1) {
				const notif = notifs[idx];
				event(id, NOTIFICATION_EVENT.REMOVE);
				_store.set(_removeByIdx(notifs, idx));
				return true;
			}
			return false;
		},
		//
		options: { ...opts },
		//
		EVENT: NOTIFICATION_EVENT,

		// some options setters (for playground mostly)
		setMaxCapacity: (v: number) => _setOption('maxCapacity', v),
		setSortOrder: (v: string) => _setOption('sortOrder', v),

		// sugar
		info: (content: THC, n?: Partial<NotificationInput>) =>
			add({ ...(n || {}), type: 'info', content }),

		success: (content: THC, n?: Partial<NotificationInput>) =>
			add({ ...(n || {}), type: 'success', content }),

		warn: (content: THC, n?: Partial<NotificationInput>) =>
			add({ ...(n || {}), type: 'warn', content }),

		error: (content: THC, n?: Partial<NotificationInput>) =>
			add({ ...(n || {}), type: 'error', content }),
	};
};
