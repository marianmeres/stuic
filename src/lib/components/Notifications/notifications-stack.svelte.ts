import { createTicker } from "@marianmeres/ticker";
import type { Component } from "svelte";
import { strHash } from "../../utils/str-hash.js";
import { getTHCStringContent, type THC } from "../Thc/Thc.svelte";

/**
 * Wrapper for passing a Svelte component with props.
 */
export interface ComponentWrap {
	component: Component;
	props?: Record<string, unknown>;
}

/**
 * Sort order for notifications in the stack.
 */
export type NotificationsSortOrder = "asc" | "desc";

/**
 * Visual type/category of a notification. Affects styling and icon.
 */
export type NotificationType = "info" | "success" | "warn" | "error" | string;

/**
 * Input options for creating a notification.
 */
export interface NotificationInput extends Record<string, unknown> {
	/** Unique id of the notification. If not provided, will be calculated from content.
	Multiple notifications with the same id will be ignored (but the `count` will be increased). */
	id: string | number;

	/** Optional UI rendering well known hint (has no effect on the functionality, can be
	any string), defaults to "info". */
	type: NotificationType;

	/** The actual notification message (either plain text, html or component)
	notifications without any content will be ignored. */
	content: THC;

	// generic action handler for triggered actions...
	// on: NotificationOnEventHandler;

	// Same as `on('click', ...)` except that UI may detect if this exists (e.g. show
	// pointer cursor), which would not be possible for `on('click', ...)`
	onClick: (self: Notification, all: Notification[], data: unknown) => void;

	/** Notification specific time-to-live in milliseconds (after which notif will be auto discarded)
	use 0 to disable auto disposal */
	ttl: number;

	/** Number of notifications in the queue with the same `id`. If you do not provide your
	own id, it will be calculated from content. */
	count: number;

	/** Optional, in shape `{ component, props }` */
	component?: Component | ComponentWrap;

	//
	iconFn: (() => string) | boolean;

	//
	// class?: Partial<NotificationKnownClasses>;

	// pragmatic shortcut to THC
	forceAsHtml?: boolean;
}
/**
 * Internal notification object with computed properties.
 */
export interface Notification extends NotificationInput {
	/** For sorting the queue, will default to now. */
	created: Date;

	/** State progress or living time in percents. A hint for UI to maybe display some progress bar...
	 * Will be update by the dispose checker... (so the update frequency is equal to `disposeInterval`) */
	_ttlProgress: number;
}

/**
 * Parameter type for creating notifications - either a simple string message or full options.
 */
export type NotificationCreateParam = string | Partial<NotificationInput>;

/**
 * Configuration options for the NotificationsStack.
 */
export interface NotificationsStackOptions {
	/** Maximum number of notifications kept in the queue, if exceeded, older ones (by `created`)
	will be discarded. Use 0 (zero) to disable capacity check. */
	maxCapacity: number;

	/** Default value for Notification.type, defaults to "info". */
	defaultType: string;

	/** Global time-to-live in milliseconds (after which notifs will be auto discarded).
	Use 0 to disable default auto disposal. */
	defaultTtl: number;

	/** Will prolong the defaultTtl with some extra (in milliseconds) based on the content
	 * length. Use 0 to disable. */
	extraTtlPerChar: number;

	/** How to sort the queue, "asc" (default) or "desc".
	Sorting is always done by the `created` prop. */
	sortOrder?: NotificationsSortOrder;

	/** How often to check for disposed ones? (milliseconds). Note that this interval
	 * also effects how often the progress is updated. The higher the more precise...
	 * (which may have visual implications if used with progress bar). Reasonable value
	 * would be between 100ms and 1_000ms. */
	disposeInterval?: number;
}

const DEFAULT_OPTIONS: Partial<NotificationsStackOptions> = {
	maxCapacity: 5,
	defaultTtl: 3_000,
	extraTtlPerChar: 20,
	defaultType: "info",
	sortOrder: "asc",
	disposeInterval: 500,
};

// const isFn = (v: unknown) => typeof v === "function";

const _id = (type: string, content: unknown) => {
	const c = content as { component?: unknown; html?: string; text?: string } | string;
	const str =
		typeof c === "object" && c?.component
			? "component"
			: (typeof c === "object" ? c?.html || c?.text : c) || content;
	return ["id", type, strHash(String(str))].join("-");
};

/**
 * A reactive notification queue manager with auto-disposal and deduplication.
 *
 * Manages a stack of notifications with automatic time-to-live (TTL) disposal,
 * duplicate detection, and capacity limits.
 *
 * @example
 * ```ts
 * // Create a notification stack
 * const notifications = new NotificationsStack([], {
 *   maxCapacity: 5,
 *   defaultTtl: 5000
 * });
 *
 * // Add notifications
 * notifications.info('Operation completed');
 * notifications.success('File saved!');
 * notifications.warn('Low disk space');
 * notifications.error('Connection failed', { ttl: 0 }); // Won't auto-dismiss
 *
 * // Remove a notification
 * notifications.removeById('some-id');
 *
 * // Access the stack (reactive)
 * console.log(notifications.stack);
 *
 * // Cleanup
 * notifications.destroy();
 * ```
 */
export class NotificationsStack {
	#stack = $state<Notification[]>([]);
	readonly options = $state<NotificationsStackOptions>()!;
	#ticker: ReturnType<typeof createTicker>;
	#unsubs: CallableFunction[] = [];

	constructor(
		initial: NotificationCreateParam[] = [],
		opts: Partial<NotificationsStackOptions> = {}
	) {
		this.options = { ...DEFAULT_OPTIONS, ...(opts || {}) } as NotificationsStackOptions;
		initial.forEach((n) => this.#add(n));

		// auto dispose feature
		this.#ticker = createTicker(this.options.disposeInterval, true);
		const _tickerUnsub = this.#ticker.subscribe(this.#onTick);

		this.#unsubs.push(() => {
			this.#ticker.stop();
			_tickerUnsub();
		});
	}

	#onTick = (ts: number) => {
		if (!ts) return;
		const updated = this.#stack.reduce((memo, n) => {
			if (n.ttl) {
				const start = n.created.valueOf();
				const end = start + n.ttl;
				const now = Date.now();
				const expired = end < now;
				if (!expired) {
					// we can't know exactly the offset here, but using full is good enough...
					const offset = this.options.disposeInterval || 0;
					n._ttlProgress = (now - start + offset) / (end - start);
					memo.push(n);
				}
			} else {
				memo.push(n);
			}
			return memo;
		}, [] as Notification[]);
		// since we're updating progress, we must reassign every time, not just if disposed
		this.#stack = updated;
	};

	#maybeTtlExtra(content: THC): number {
		return getTHCStringContent(content).length * this.options.extraTtlPerChar;
	}

	/** Will normalize item to internal shape. */
	#normalize = (n: NotificationCreateParam): Notification | null => {
		const o: Partial<Notification> = typeof n === "string" ? { id: 0, content: n } : n;

		if (!o.content) return null;

		o.type ||= this.options.defaultType;
		o.id ||= _id((o as Notification).type, o.content);
		o.created = new Date(o.created || Date.now());
		o.count ??= 1;
		o.ttl ??= this.options.defaultTtl + this.#maybeTtlExtra(o.content);
		o._ttlProgress = 0;

		return o as Notification;
	};

	#findIndexById = (id: string | number) => {
		return this.#stack.findIndex((n) => n.id === id);
	};

	#removeByIndex = (idx: number) => {
		if (idx > -1) this.#stack.splice(idx, 1);
	};

	/** Will add to stack */
	#add = (n: NotificationCreateParam) => {
		const notif: Notification | null = this.#normalize(n);
		// return early on invalid
		if (!notif) return;

		const { maxCapacity, sortOrder } = this.options;
		const idx = this.#findIndexById(notif.id);
		let stack = this.#stack;

		if (idx > -1) {
			stack[idx].count++;
			stack[idx].created = new Date(
				Math.max(stack[idx].created.valueOf(), notif.created.valueOf())
			);
		} else {
			stack.push(notif);
			stack.sort((a, b) => {
				const _a = a.created.valueOf();
				const _b = b.created.valueOf();
				return sortOrder === "desc" ? _b - _a : _a - _b;
			});
		}

		// keep only `maxCapacity`
		if (maxCapacity && stack.length > maxCapacity) {
			stack =
				sortOrder === "desc"
					? stack.slice(0, maxCapacity)
					: stack.slice(-1 * maxCapacity);
		}

		this.#stack = stack;

		return this;
	};

	/** Will remove the notification from stack */
	removeById = (id: string | number) => {
		this.#removeByIndex(this.#findIndexById(id));
		return this;
	};

	/** Will cleanup the stack. */
	reset = () => {
		this.#stack = [];
		return this;
	};

	/**
	 * Will get the first in stack (for testing mostly)
	 */
	get head() {
		return this.#stack.at(0);
	}

	/** Will return clone (intentionally) of internal data. */
	get stack() {
		return [...this.#stack];
	}

	/** Will get the current stack size */
	get length() {
		return this.#stack.length;
	}

	/** Will do internal cleanups. */
	destroy = () => {
		this.reset();
		this.#unsubs.forEach((fn) => fn());
	};

	/** Main api. */
	info = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "info", content });
	};

	/** Main api. */
	success = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "success", content });
	};

	/** Main api. */
	warn = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "warn", content });
	};

	/** "warn" alias */
	warning = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "warn", content });
	};

	/** Main api. */
	error = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "error", content });
	};

	/** "error" alias */
	destructive = (content: THC, n?: Partial<NotificationInput>) => {
		return this.#add({ ...(n || {}), type: "error", content });
	};
}
