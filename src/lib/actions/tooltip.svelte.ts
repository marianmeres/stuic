import { twMerge } from "../utils/tw-merge.js";
import { waitForTransitionEnd, waitForTwoRepaints } from "../utils/paint.js";

const TIMEOUT = 400;
const TRANSITION = 300;

function _isTooltipSupported() {
	return CSS.supports("anchor-name", "--anchor");
}

//
let _initialized = false;
function _globalInitOnce() {
	if (!_initialized) {
		_initialized = true;
		if (!_isTooltipSupported()) false;
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(`
            .stuic-tooltip {
                position: fixed;
                display: none;
                opacity: 0;
                transition-property: opacity;
                transition-duration: ${TRANSITION}ms;
            }
            @supports (anchor-name: --anchor) {
                .stuic-tooltip {
                    position-area: top span-right;
                    position-try: flip-block, flip-inline, flip-block flip-inline;
                }
                .stuic-tooltip.tt-block {
                    display: block;
                    opacity: 0;
				}
                .stuic-tooltip.tt-block.tt-visible {
                    display: block;
                    opacity: 1;
				}
            }
        `);
		document.adoptedStyleSheets = [sheet];
	}
	return true;
}

const _classTooltip = `
    bg-neutral-800 dark:bg-neutral-950 text-white 
    text-sm rounded mb-1 mr-4 mt-4 
    px-2.5 py-1.5
    max-w-[250px]
    z-50
`;

export function tooltip(
	anchorEl: HTMLElement,
	fn?: () => { enabled?: boolean; content?: string | null; debug?: boolean }
) {
	// the node has been mounted in the DOM
	if (!_globalInitOnce()) return;

	let tooltipEl: HTMLDivElement;
	const rnd = Math.random().toString(36).slice(2);
	const id = `tooltip-${rnd}`;
	const anchorName = `--anchor-${rnd}`;

	let _hideTimer: any = null;
	let _showTimer: any = null;

	$effect(() => {
		let { enabled, content, debug } = fn?.() || {};
		enabled ??= true;
		content ||= anchorEl.getAttribute("aria-label");
		// debug = true;

		const _debug = (...args: any[]) => {
			debug && console.debug("[tooltip]", rnd, ...args);
		};

		const _clearShow = () => {
			clearTimeout(_showTimer);
			_showTimer = null;
		};

		const _clearHide = () => {
			clearTimeout(_hideTimer);
			_hideTimer = null;
		};

		const _clear = () => {
			_clearShow();
			_clearHide();
		};

		const scheduleShow = () => {
			_debug("scheduleShow()");
			_clear();
			_showTimer = setTimeout(() => {
				if (!_hideTimer) {
					_debug("show...");
					_clearShow();
					anchorEl.setAttribute("aria-expanded", "true");
					tooltipEl.classList.add("tt-block");
					waitForTwoRepaints().then(() => {
						tooltipEl.classList.add("tt-visible");
					});
				}
			}, TIMEOUT);
		};

		const scheduleHide = () => {
			_debug("scheduleHide()");
			_clear();
			_hideTimer = setTimeout(() => {
				_debug("hide...");
				_clearHide();
				anchorEl.setAttribute("aria-expanded", "false");
				tooltipEl.classList.remove("tt-visible");
				waitForTransitionEnd(tooltipEl).then(() => {
					tooltipEl.classList.remove("tt-block");
				});
			}, TIMEOUT);
		};

		// local init once
		const _ensureTooltip = () => {
			_debug("_ensureTooltip()");
			if (!tooltipEl) {
				_debug("createElement...");
				tooltipEl = document.createElement("div");
				tooltipEl.setAttribute("id", id);
				tooltipEl.setAttribute("role", "tooltip");
				tooltipEl.classList.add(
					...twMerge("stuic-tooltip", _classTooltip, anchorEl.dataset.classTooltip).split(
						/\s/
					)
				);
				tooltipEl.style.cssText += `position-anchor: ${anchorName};`;
				document.body.appendChild(tooltipEl);
				//
				anchorEl.style.cssText += `anchor-name: ${anchorName};`;

				tooltipEl.addEventListener("mouseover", scheduleShow);
				tooltipEl.addEventListener("mouseout", scheduleHide);
			}

			anchorEl.setAttribute("aria-describedby", id);
			anchorEl.setAttribute("aria-expanded", "false");
			tooltipEl.textContent = "";
			tooltipEl.innerHTML = `${content}`;

			return tooltipEl;
		};

		const initAndShow = () => {
			_debug("initAndShow()");
			if (content) {
				_ensureTooltip();
				scheduleShow();
			}
		};

		anchorEl.addEventListener("mouseover", initAndShow);
		anchorEl.addEventListener("mouseout", scheduleHide);

		return () => {
			anchorEl.removeEventListener("mouseover", initAndShow);
			anchorEl.removeEventListener("mouseout", scheduleHide);

			// might not have been initialized
			tooltipEl?.removeEventListener("mouseover", scheduleShow);
			tooltipEl?.removeEventListener("mouseout", scheduleHide);
			tooltipEl?.remove();

			_clear();
		};
	});
}
