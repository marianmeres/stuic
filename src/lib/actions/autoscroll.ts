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
