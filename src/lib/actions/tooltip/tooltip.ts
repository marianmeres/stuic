import { createStore } from '@marianmeres/store';
import {
	derived,
	get as storeGet,
	writable,
	type Readable,
	type Writable,
} from 'svelte/store';
import { twMerge } from 'tailwind-merge';
import { windowSize } from '../../index.js';
import type { Alignment } from '../../utils/calculate-alignment.js';
import { _makeInVisible, _makeVisible } from './_make-visible.js';
import { _setPosition } from './_set-position.js';

export class TooltipConfig {
	static presetBase = `
		text-sm
		bg-gray-950 dark:bg-gray-950 
		text-gray-50 dark:text-gray-50
		px-3 py-2
		rounded-md
		shadow-lg
		z-50
		max-w-96 w-max
	`;

	static class = '';

	static arrowPresetBase = `border-gray-950 dark:border-gray-950 z-50`;

	static arrowClass = ``;

	static defaultOptions: Partial<TooltipOptions> = {};
}

export class PopoverConfig {
	static presetBase = `
		text-sm
		bg-gray-950 dark:bg-gray-950 
		text-gray-50 dark:text-gray-50
		px-3 py-2
		rounded-md
		shadow-lg
		z-50
	`;
	// max-w-96 w-max

	static class = '';

	static arrowPresetBase = `border-gray-950 dark:border-gray-950 z-50`;

	static arrowClass = ``;

	static defaultOptions: Partial<TooltipOptions> = {};
}

export type TooltipLogger = (...args: any[]) => void;

export type TooltipTrigger = 'hover' | 'focus' | 'click';

export interface TooltipOptions {
	content: string;
	popover: HTMLElement | null;
	alignment: Alignment;
	allowHtml: boolean;
	delay: number;
	class: string;
	arrowClass: string;
	triggers: TooltipTrigger[];
	logger?: TooltipLogger;
	boundaryRoot?: HTMLElement;
	arrowSize: number; // in px
	offset: number;
	hideOnInsufficientSpace: boolean;
	// will listen to trigger repositioning...
	touch?: Readable<number>;
	trigger?: Readable<boolean>;
	notifier?: Writable<boolean>;
}

const DEFAULTS: TooltipOptions = {
	content: '',
	popover: null,
	alignment: 'top',
	allowHtml: true,
	delay: 300,
	triggers: ['hover'], // 'focus', 'click'
	class: '',
	arrowClass: '',
	arrowSize: 8,
	offset: 10,
	hideOnInsufficientSpace: false,
};

const TRIGGERS: Record<string, Record<string, string[]>> = {
	hover: { show: ['mouseover'], hide: ['mouseout'] },
	focus: { show: ['focusin'], hide: ['blur'] },
	click: { show: ['click'], hide: [] }, // no hide for click, will toggle instead
};

// default TW value
export const _TRANSITION_OPACITY_DUR = 150;

const _ensureDiv = (
	div: HTMLElement | null,
	opts: TooltipOptions,
	log: TooltipLogger
): HTMLElement => {
	log('_ensureDiv');
	if (!div) {
		log('creating tooltip div...');
		div = document.createElement('div');
		document.body.appendChild(div);
	} else {
		log('div exists... going to apply classes');
	}

	let classes: any = '';
	if (opts.popover) {
		classes = [PopoverConfig.presetBase, PopoverConfig.class, opts.class].join(' ');
	} else {
		classes = [TooltipConfig.presetBase, TooltipConfig.class, opts.class].join(' ');
	}
	// make sure these are never overwritten (must come last)
	classes = twMerge(classes, 'fixed block transition-opacity')
		.split(/\s/)
		.filter(Boolean);

	div.classList.add(...classes);
	div.style.opacity = '0';
	// log(`Div classes applied (+ opacity 0)`, classes);
	return div;
};

const _ensureArrow = (
	arrow: HTMLElement | null,
	opts: TooltipOptions,
	log: TooltipLogger
): HTMLElement => {
	log('_ensureArrow');
	if (!arrow) {
		log('creating tooltip arrow...');
		arrow = document.createElement('div');
		document.body.appendChild(arrow);
	} else {
		log('arrow exists... going to apply classes');
	}

	let classes: any = '';
	// prettier-ignore
	if (opts.popover) {
		classes = [PopoverConfig.arrowPresetBase, PopoverConfig.arrowClass, opts.arrowClass].join(' ');
	} else {
		classes = [TooltipConfig.arrowPresetBase, TooltipConfig.arrowClass, opts.arrowClass].join(' ');
	}
	// make sure these are never overwritten (must come last)
	classes = twMerge(classes, 'fixed block size-0 transition-opacity')
		.split(/\s/)
		.filter(Boolean);

	arrow.classList.add(...classes);
	arrow.style.opacity = '0';
	// log(`Arrow classes applied (+ opacity 0)`, classes);
	return arrow;
};

// the action api
export function tooltip(
	node: HTMLElement,
	initialOptions: string | Partial<TooltipOptions> = {}
) {
	if (typeof initialOptions === 'string') initialOptions = { content: initialOptions };

	//
	initialOptions ??= {};
	let defaults = DEFAULTS;
	if (initialOptions.popover) {
		defaults = { ...defaults, ...PopoverConfig.defaultOptions };
	} else {
		defaults = { ...defaults, ...TooltipConfig.defaultOptions };
	}
	let opts: TooltipOptions = { ...defaults, ...initialOptions };
	const content = createStore(opts.content || '');

	// maybe use aria-label (if present and content is not set)
	const ariaLabel = node.getAttribute('aria-label');
	if (ariaLabel && !content.get()) content.set(ariaLabel);

	const _log = (...args: any[]) =>
		typeof opts.logger === 'function' &&
		opts.logger.apply(null, [`[tooltip/${node.id || '?'}]`, ...args]);

	//
	let _delayTimer: number | null;
	const _resetDelayTimer = () => {
		if (_delayTimer) clearTimeout(_delayTimer);
		_delayTimer = null;
	};
	const _planDelayedExec = (_fn: CallableFunction, _delay: number) => {
		_resetDelayTimer();
		_delayTimer = setTimeout(() => {
			_fn();
			_resetDelayTimer();
		}, _delay) as any;
	};

	// use popover if provided, otherwise new div will be created
	let div: HTMLElement | null = opts.popover;
	let arrow: HTMLElement | null;
	let _isOn = writable(false); // internal state store

	//
	const _show = async () => {
		_log('_show');
		// return early on no content
		if (!opts.popover && !content.get()) {
			_log('Nothing to show (neither popover, nor content provided)');
			return;
		}

		// create, apply core styles and append to DOM
		div = _ensureDiv(div, opts, _log);
		arrow = _ensureArrow(arrow, opts, _log);

		// set content
		if (!opts.popover) {
			if (opts.allowHtml) div.innerHTML = content.get();
			else div.textContent = content.get();
		}

		// measure stuff and set position (provided opts.alignment is considered just as
		// "preferred", which means it may be overwritten if there is no available space)
		if (await _setPosition(opts.boundaryRoot, node, div, arrow, opts, _log)) {
			// finally, fade in
			_makeVisible(div, arrow, _log);
			setTimeout(() => _isOn.set(true), _TRANSITION_OPACITY_DUR);
		} else {
			_makeInVisible(div, arrow, _log);
		}
	};
	let show = () => _planDelayedExec(_show, opts.delay);

	//
	const _hide = async () => {
		_log('_hide');
		_makeInVisible(div, arrow, _log);
		setTimeout(() => {
			destroy();
			_isOn.set(false);
		}, _TRANSITION_OPACITY_DUR);
	};
	const hide = () => _planDelayedExec(_hide, opts.delay);

	// no delay for toggle
	const toggle = async () => {
		_log('toggle');
		storeGet(_isOn) ? await _hide() : await _show();
	};

	//
	const destroy = () => {
		// for obscure cases, where parent node might have be removed from DOM
		// before the planned show/hide happens
		_resetDelayTimer();

		if (!div && !arrow && !opts.popover && !storeGet(_isOn)) return;

		_log('destroy');

		if (!opts.popover) {
			div?.remove();
			div = null;
		}
		arrow?.remove();
		arrow = null;
		_isOn.set(false);
	};

	//
	let unsubs: CallableFunction[] = [_isOn.subscribe((v) => opts?.notifier?.set(v))];

	// by default, listen to windowSize change, as well as window and boundaryRoot scroll
	const _scrollSignal = writable(0);
	const onScroll = () => _scrollSignal.set(Date.now());
	if (opts.boundaryRoot) {
		opts.boundaryRoot.addEventListener('scroll', onScroll);
		unsubs.push(() => opts.boundaryRoot?.removeEventListener('scroll', onScroll));
	}
	// also listen to window scroll
	window.addEventListener('scroll', onScroll);
	unsubs.push(() => window.removeEventListener('scroll', onScroll));

	const _setPositionTriggers: Readable<any>[] = [_scrollSignal, windowSize];
	if (opts.touch?.subscribe) _setPositionTriggers.push(opts.touch);
	const touch = derived(_setPositionTriggers, ([_]) => Date.now());

	// final, derived, notifier
	let _touchCount = 0;
	unsubs.push(
		touch.subscribe(async () => {
			// ignore first
			if (_touchCount++) {
				_log('touch...');
				if (await _setPosition(opts.boundaryRoot, node, div, arrow, opts, _log)) {
					_makeVisible(div, arrow, _log);
				} else {
					_makeInVisible(div, arrow, _log);
				}
			}
		})
	);

	// important to normalize triggers - if does contain 'click' remove all others
	if (opts.triggers.includes('click')) {
		_log('Click trigger recognized...');
		opts.triggers = ['click'];
		_log('Patching show as toggle');
		show = toggle; // also patch show/hide logic, since click does not have 'out' event...
	}

	// if manual trigger exists... (use raw show/hide, not the delayed one)
	if (opts.trigger?.subscribe) {
		unsubs.push(opts.trigger.subscribe((v) => (v ? _show() : _hide())));
	}

	// add show
	opts.triggers?.forEach((trigger: string) => {
		TRIGGERS[trigger]?.show.forEach((eventName) => {
			_log('addEventListener', eventName, 'show');
			node.addEventListener(eventName, show);
		});
	});

	// add hide
	opts.triggers?.forEach((trigger: string) => {
		TRIGGERS[trigger]?.hide.forEach((eventName) => {
			_log('addEventListener', eventName, 'hide');
			node.addEventListener(eventName, hide);
		});
	});

	return {
		//
		update(newOptions: string | Partial<TooltipOptions>) {
			if (typeof newOptions === 'string') newOptions = { content: newOptions };
			destroy();

			// these are not allowed to update on existing instance
			delete newOptions.triggers;
			delete newOptions.boundaryRoot;
			delete newOptions.touch;

			//
			opts = { ...opts, ...newOptions };
			content.set(opts.content);
		},
		//
		destroy() {
			unsubs.forEach((unsub) => typeof unsub === 'function' && unsub());
			destroy();

			// remove show
			opts.triggers?.forEach((trigger: string) => {
				TRIGGERS[trigger]?.show.forEach((eventName) => {
					node.removeEventListener(eventName, show);
				});
			});

			// remove hide
			opts.triggers?.forEach((trigger: string) => {
				TRIGGERS[trigger]?.hide.forEach((eventName) => {
					node.removeEventListener(eventName, hide);
				});
			});
		},
	};
}
