declare type Subscribe<T> = (value: T) => void;
declare type Unsubscribe = () => void;
declare type Update<T> = (value: T) => T;

interface StoreReadable<T> {
	subscribe(cb: Subscribe<T>): Unsubscribe;
}

interface StoreLike<T> extends StoreReadable<T> {
	set(value: T): void;
	update(cb: Update<T>): void;
}

/**
 * Options for the autoscroll action.
 */
export type AutoscrollOptions = ScrollOptions & {
	dependencies?: StoreReadable<any>[];
	logger?: (...args: any[]) => void;
	newScrollableContentSignal?: StoreLike<boolean>;
	shouldScrollThresholdPx?: number;
	startScrollTimeout?: number;
};

const DEFAULTS = {
	shouldScrollThresholdPx: 100,
	startScrollTimeout: 300,
};

/**
 * A Svelte action that automatically scrolls a container when new content is added.
 *
 * Only scrolls if the user is already near the bottom of the content (within threshold).
 * Useful for chat interfaces, log viewers, or any container with streaming content.
 *
 * Features:
 * - Smooth scrolling by default
 * - Respects user scroll position (won't interrupt manual scrolling)
 * - Observes child mutations and resize events
 * - Supports reactive store dependencies for manual trigger
 *
 * @param node - The scrollable container element
 * @param options - Configuration options
 * @param options.behavior - Scroll behavior: 'smooth' | 'instant' | 'auto' (default: 'smooth')
 * @param options.shouldScrollThresholdPx - Distance from bottom to trigger auto-scroll (default: 100)
 * @param options.startScrollTimeout - Delay before scrolling on dependency change (default: 300ms)
 * @param options.dependencies - Stores that trigger scroll when updated
 * @param options.newScrollableContentSignal - Store to signal when new content is available but not scrolled
 * @param options.logger - Optional debug logger function
 * @returns Svelte action lifecycle methods
 *
 * @example
 * ```svelte
 * <div class="chat-messages" use:autoscroll>
 *   {#each messages as msg}
 *     <div>{msg.text}</div>
 *   {/each}
 * </div>
 *
 * <!-- With options -->
 * <div use:autoscroll={{ behavior: 'instant', shouldScrollThresholdPx: 50 }}>
 *   ...
 * </div>
 * ```
 */
export function autoscroll(
	node: HTMLElement,
	options: AutoscrollOptions = {
		shouldScrollThresholdPx: DEFAULTS.shouldScrollThresholdPx,
		startScrollTimeout: DEFAULTS.startScrollTimeout,
	}
) {
	// use "smooth" by default
	options.behavior ??= 'smooth';
	options.shouldScrollThresholdPx ??= DEFAULTS.shouldScrollThresholdPx;
	options.startScrollTimeout ??= DEFAULTS.startScrollTimeout;

	const {
		behavior,
		shouldScrollThresholdPx,
		dependencies,
		logger,
		newScrollableContentSignal,
		startScrollTimeout,
	} = options || {};

	let origScrollHeight = 0;

	const log = (...args: any[]) =>
		typeof logger === 'function' && logger.apply(null, [...args]);

	const shouldScroll = () => {
		const { scrollTop, clientHeight } = node;
		const result =
			origScrollHeight - scrollTop - clientHeight < (shouldScrollThresholdPx as number);
		log('shouldScroll?', result, { scrollTop, origScrollHeight, clientHeight });
		return result;
	};

	const scroll = () => {
		const opts = { top: node.scrollHeight, left: node.scrollWidth, behavior };
		log(`scrollTo(${JSON.stringify(opts)})`);
		node.scrollTo(opts);
	};

	// for when children change sizes
	const resizeObserver = new ResizeObserver(() => {
		log('observed resize...');
		shouldScroll() && scroll();
	});

	// for when children
	const mutationObserver = new MutationObserver(() => {
		log('observed mutation...');
		shouldScroll() ? scroll() : newScrollableContentSignal?.set(true);
		origScrollHeight = node.scrollHeight;
	});

	const unsubs =
		dependencies?.map((dep) =>
			dep.subscribe((v) => {
				log('dependency update...', v);
				setTimeout(scroll, startScrollTimeout);
			})
		) ?? [];

	// observe size of all children
	for (const child of node.children) {
		resizeObserver.observe(child);
	}

	mutationObserver.observe(node, { childList: true, subtree: true });

	return {
		destroy() {
			if (mutationObserver) {
				mutationObserver.disconnect();
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			for (const unsubscribe of unsubs) {
				unsubscribe();
			}
		},
	};
}
