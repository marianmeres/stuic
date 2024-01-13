import { _TRANSITION_OPACITY_DUR, type TooltipLogger } from './tooltip.js';

export const _makeInVisible = (
	div: HTMLElement | null,
	arrow: HTMLElement | null,
	log: TooltipLogger
) => {
	(div || arrow) && log('_makeInVisible');
	div && (div.style.opacity = '0');
	arrow && (arrow.style.opacity = '0');
	setTimeout(() => {
		arrow?.classList.add('hidden');
		div?.classList.add('hidden');
		if (div) {
			div.style.left = `auto`;
			div.style.top = `auto`;
		}
	}, _TRANSITION_OPACITY_DUR);
};

export const _makeVisible = (
	div: HTMLElement | null,
	arrow: HTMLElement | null,
	log: TooltipLogger
) => {
	(div || arrow) && log('_makeVisible');
	if (div) {
		div.classList.remove('hidden');
		div.style.opacity = '1';
	}
	if (arrow) {
		arrow.classList.remove('hidden');
		arrow.style.opacity = '1';
	}
};
