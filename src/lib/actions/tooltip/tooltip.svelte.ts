import { twMerge } from "../../utils/tw-merge.js";
import { waitForTransitionEnd, waitForTwoRepaints } from "../../utils/paint.js";
import { untrack } from "svelte";
import "./tooltip.css";

const TIMEOUT = 200;
const TRANSITION = 200;

export function isTooltipSupported() {
	return (
		CSS.supports("anchor-name", "--anchor") &&
		CSS.supports("position-area", "top") &&
		CSS.supports("position-try", "top") &&
		CSS.supports("position-try-fallbacks", "top")
	);
}

//
// let _initialized = false;
// function global_init_once() {
// 	if (!is_tooltip_supported()) {
// 		console.warn("Tooltips not supported...");
// 		return false;
// 	}

// 	if (!_initialized) {
// 		_initialized = true;
// 		// const sheet = new CSSStyleSheet();
// 		// sheet.replaceSync(`
// 		//     .stuic-tooltip {
// 		//         position: fixed;
// 		//         display: none;
// 		//         opacity: 0;
// 		//         transition-property: opacity;
// 		//         transition-duration: ${TRANSITION}ms;
// 		//     }
// 		//     @supports (anchor-name: --anchor) {
// 		//         .stuic-tooltip {
// 		// 			position-area: top span-right;
// 		// 			position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
// 		//         }
// 		//         .stuic-tooltip.tt-block {
// 		//             display: block;
// 		//             opacity: 0;
// 		// 		}
// 		//         .stuic-tooltip.tt-block.tt-visible {
// 		//             display: block;
// 		//             opacity: 1;
// 		// 		}
// 		//     }
// 		// `);
// 		// document.adoptedStyleSheets = [sheet];
// 	}

// 	return true;
// }

const _classTooltip = `
    bg-tooltip-bg dark:bg-tooltip-bg-dark text-tooltip-text dark:text-tooltip-text-dark
    text-sm rounded my-1
    px-2.5 py-1.5
    max-w-[250px]
    z-50
`;

/**
 *
 */
export function tooltip(
	anchorEl: HTMLElement,
	fn?: () => {
		enabled?: boolean;
		content?: string | null;
		debug?: boolean;
		class?: string;
		onShow?: CallableFunction;
		onHide?: CallableFunction;
	}
) {
	// the node has been mounted in the DOM
	if (!isTooltipSupported()) return;

	//
	let tooltipEl: HTMLDivElement;
	let hide_timer: any = null;
	let show_timer: any = null;
	let do_debug: any = false;
	let on_show: CallableFunction | null | undefined = null;
	let on_hide: CallableFunction | null | undefined = null;
	let content: string | null | undefined = null;
	let classTooltip: string | null | undefined = null;
	let enabled: boolean = true;

	//
	const rnd = Math.random().toString(36).slice(2);
	const id = `tooltip-${rnd}`;
	const anchorName = `--anchor-${rnd}`;

	// node once init
	anchorEl.style.cssText += `anchor-name: ${anchorName};`;
	anchorEl.setAttribute("aria-describedby", id);
	anchorEl.setAttribute("aria-expanded", "false");

	const debug = (...args: any[]) => {
		do_debug && console.debug("[tooltip]", rnd, ...args);
	};

	function ensure_tooltip() {
		debug("ensure_tooltip()", content, classTooltip);

		if (!content) return false;

		// lazy factory init
		if (!tooltipEl) {
			debug("creating element...");
			tooltipEl = document.createElement("div");
			tooltipEl.setAttribute("id", id);
			tooltipEl.setAttribute("role", "tooltip");
			tooltipEl.style.cssText += `position-anchor: ${anchorName}; transition-duration: ${TRANSITION}ms;`;
			tooltipEl.classList.add(...twMerge("stuic-tooltip", _classTooltip).split(/\s/));
			document.body.appendChild(tooltipEl);
			//
			tooltipEl.addEventListener("mouseover", schedule_show);
			tooltipEl.addEventListener("mouseout", schedule_hide);
		}

		// re/set based on params
		set_content();

		return true;
	}

	function set_content() {
		if (tooltipEl) {
			debug("set_content()", classTooltip, content);
			if (classTooltip) {
				let old = tooltipEl.className;
				tooltipEl.className = ""; // reset
				tooltipEl.classList.add(...twMerge(old, classTooltip).split(/\s/));
			}
			tooltipEl.textContent = "";
			tooltipEl.innerHTML = `${content}`;
		}
	}

	function clear_show() {
		clearTimeout(show_timer);
		show_timer = null;
	}

	function clear_hide() {
		clearTimeout(hide_timer);
		hide_timer = null;
	}

	function clear_both() {
		clear_show();
		clear_hide();
	}

	function schedule_show() {
		debug("schedule_show()", enabled);
		clear_both();
		if (!enabled || !ensure_tooltip()) return;
		show_timer = setTimeout(() => {
			if (!hide_timer) {
				debug("show...");
				clear_show();
				anchorEl.setAttribute("aria-expanded", "true");
				//
				tooltipEl.classList.add("tt-block");
				setTimeout(() => {
					tooltipEl.classList.add("tt-visible");
					on_show?.();
				}, TRANSITION);
				// waitForTwoRepaints().then(() => {
				// 	tooltipEl.classList.add("tt-visible");
				// this approach is nicer, but I have a suspicion of the event handlers not being destroyed properly (maybe just a hot-reload issues...)
				// 	waitForTransitionEnd(tooltipEl).then(() => on_show?.());
				// });
			}
		}, TIMEOUT);
	}

	function schedule_hide() {
		debug("scheduleHide()", enabled);
		clear_both();
		if (!tooltipEl) {
			return console.warn(id, "Unexpected tooltip instance...");
		}
		hide_timer = setTimeout(() => {
			debug("hide...");
			clear_hide();
			anchorEl.setAttribute("aria-expanded", "false");
			tooltipEl.classList.remove("tt-visible");
			setTimeout(() => {
				tooltipEl.classList.remove("tt-block");
				on_hide?.();
			}, TRANSITION);
			// this approach is nicer, but I have a suspicion of the event handlers not being destroyed properly (maybe just a hot-reload issues...)
			// waitForTransitionEnd(tooltipEl).then(() => {
			// 	tooltipEl.classList.remove("tt-block");
			// 	on_hide?.();
			// });
		}, TIMEOUT);
	}

	// "reactive" params re/set
	$effect(() => {
		let {
			enabled: _enabled,
			content: _content,
			debug: debugParam,
			class: _classTooltip,
			onShow,
			onHide,
		} = fn?.() || {};

		// re/assign new params
		do_debug = !!debugParam;
		on_show = onShow;
		on_hide = onHide;
		content = _content ||= anchorEl.getAttribute("aria-label");
		classTooltip = _classTooltip;
		enabled = _enabled ?? true;

		// this will be effective here only if currently in open state, otherwise noop
		set_content();

		// do not return cleanups here - we want the tooltipEl to persist params change
	});

	// add/remove listeners effect ("non-reactive")
	$effect(() => {
		anchorEl.addEventListener("mouseover", schedule_show);
		anchorEl.addEventListener("mouseout", schedule_hide);

		return () => {
			anchorEl.removeEventListener("mouseover", schedule_show);
			anchorEl.removeEventListener("mouseout", schedule_hide);

			// might not have been initialized
			tooltipEl?.removeEventListener("mouseover", schedule_show);
			tooltipEl?.removeEventListener("mouseout", schedule_hide);
			tooltipEl?.remove();

			clear_both();
		};
	});
}
