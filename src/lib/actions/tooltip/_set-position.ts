import { get as storeGet } from 'svelte/store';
import { calculateAlignment } from '../../utils/calculate-alignment.js';
import { windowSize } from '../../utils/window-size.js';
import { _maybePickSafePlacement } from './_maybe-pick-safe-placement.js';
import type { TooltipLogger, TooltipOptions } from './tooltip.js';

export const _setPosition = async (
	boundaryRoot: HTMLElement | undefined, // will default to window dimensions
	parent: HTMLElement,
	div: HTMLElement | null,
	arrow: HTMLElement | null,
	opts: TooltipOptions,
	log: TooltipLogger
) => {
	// if (!div || !arrow) return log('_setPosition noop');
	if (!div || !arrow) return;

	log('_setPosition');
	const rootRect = boundaryRoot?.getBoundingClientRect() || {
		...storeGet(windowSize),
		x: 0,
		y: 0,
	};
	const boundaryRootRect = {
		x: rootRect.x,
		y: rootRect.y,
		width: rootRect.width,
		height: rootRect.height,
	};
	const parentRect = parent.getBoundingClientRect();

	// IMPORTANT!
	// make sure the div is not hidden, so the rect dimensions will work fine
	div.classList.remove('hidden');

	return new Promise((resolve) => {
		// must wait for the next repaint to have correct dimensions...
		requestAnimationFrame(() => {
			const divRect = div.getBoundingClientRect();
			const r = calculateAlignment(boundaryRootRect, parentRect, divRect, opts.offset);

			log('tooltip rect', divRect);
			log('placements', r);

			// try to pick safe
			const safe = _maybePickSafePlacement(r, opts, log);

			// maybe quit...
			if (safe === false) {
				log('No safe position found...');
				return resolve(false);
			}

			log(`Preferred: '${opts.alignment}', safe: '${safe}'.`);

			// position the actual tooltip/popover
			div.style.left = `${r.position[safe].x}px`;
			div.style.top = `${r.position[safe].y}px`;

			// now dance with the arrow...
			let arrowStyles: Record<string, string | null> = {
				borderStyle: 'solid',
				left: 'auto',
				top: 'auto',
			};
			// need to reset all on reposition
			['borderTop', 'borderBottom', 'borderLeft', 'borderRight'].forEach((k) => {
				arrowStyles[`${k}Width`] = '0';
				arrowStyles[`${k}Color`] = null;
			});

			//
			const arrowSize = opts.arrowSize;
			let xOffset = 0;
			let yOffset = 0;
			//
			if (safe.startsWith('top')) {
				arrowStyles = {
					...arrowStyles,
					borderLeftColor: `transparent`,
					borderRightColor: `transparent`,
					borderLeftWidth: `${arrowSize * 0.75}px`,
					borderRightWidth: `${arrowSize * 0.75}px`,
					borderTopWidth: `${arrowSize}px`,
				};
				xOffset -= arrowSize / 2;
				yOffset -= arrowSize * 0.1;
			}
			//
			else if (safe.startsWith('bottom')) {
				arrowStyles = {
					...arrowStyles,
					borderLeftColor: `transparent`,
					borderRightColor: `transparent`,
					borderLeftWidth: `${arrowSize * 0.75}px`,
					borderRightWidth: `${arrowSize * 0.75}px`,
					borderBottomWidth: `${arrowSize}px`,
				};
				xOffset -= arrowSize / 2;
				yOffset -= arrowSize * 0.9;
			}
			//
			else if (safe.startsWith('right')) {
				arrowStyles = {
					...arrowStyles,
					borderTopColor: `transparent`,
					borderBottomColor: `transparent`,
					borderTopWidth: `${arrowSize * 0.75}px`,
					borderBottomWidth: `${arrowSize * 0.75}px`,
					borderRightWidth: `${arrowSize}px`,
				};
				xOffset -= arrowSize * 0.9;
				yOffset -= arrowSize / 2;
			}
			//
			else if (safe.startsWith('left')) {
				arrowStyles = {
					...arrowStyles,
					borderTopColor: `transparent`,
					borderBottomColor: `transparent`,
					borderTopWidth: `${arrowSize * 0.75}px`,
					borderBottomWidth: `${arrowSize * 0.75}px`,
					borderLeftWidth: `${arrowSize}px`,
				};
				xOffset -= arrowSize * 0.1;
				yOffset -= arrowSize / 2;
			}

			arrowStyles = {
				...arrowStyles,
				left: `${r.origin[safe].x + xOffset}px`,
				top: `${r.origin[safe].y + yOffset}px`,
			};

			// log('applying arrowStyles', arrowStyles);
			Object.entries(arrowStyles).forEach(([k, v]) => {
				// @ts-ignore
				arrow.style[k] = v;
			});

			//
			resolve(true);
		});
	});
};
