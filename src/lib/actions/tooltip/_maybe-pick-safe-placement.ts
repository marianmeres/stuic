import type { calculateAlignment } from '../../index.js';
import type { Alignment } from '../../utils/calculate-alignment.js';
import type { TooltipLogger, TooltipOptions } from './tooltip.js';

export const _maybePickSafePlacement = (
	calc: ReturnType<typeof calculateAlignment>,
	opts: TooltipOptions,
	log: TooltipLogger
): Alignment | false => {
	let preferred = opts.alignment;
	let picked: Alignment | false = preferred;

	const sides = {
		top: ['top', 'topLeft', 'topRight'],
		bottom: ['bottom', 'bottomLeft', 'bottomRight'],
		left: ['left', 'leftTop', 'leftBottom'],
		right: ['right', 'rightTop', 'rightBottom'],
	};

	// try alternatives within same side
	const _trySideVariant = (val: Alignment): Alignment => {
		for (let side of Object.keys(sides)) {
			if (val.startsWith(side)) {
				for (let pos of (sides as any)[side]) {
					if (calc.position[pos as Alignment].safe) {
						log(`_trySideVariant for '${val}', found '${pos}'`);
						return pos as Alignment;
					}
				}
			}
		}
		log(`_trySideVariant for '${val}', found none (returning orig '${val}')`);
		return val;
	};

	// DRY
	const _trySideOpposite = (val: Alignment): Alignment => {
		const opposites = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
		for (let [k, v] of Object.entries(opposites)) {
			if (val.startsWith(k)) {
				const r = val.replace(k, v) as Alignment;
				log(`_trySideOpposite for '${val}', found '${r}'`);
				return r;
			}
		}
		log(`_trySideOpposite for '${val}', found none (returning orig '${val}')`);
		return val;
	};

	const _switchAxis = (val: Alignment): Alignment => {
		const opposites = { top: 'right', bottom: 'right', left: 'top', right: 'top' };
		for (let [k, v] of Object.entries(opposites)) {
			if (val.startsWith(k)) {
				log(`_switchAxis for '${val}', found '${v}'`);
				return v as Alignment;
			}
		}
		log(`_switchAxis for '${val}', found none (returning orig '${val}')`);
		return val;
	};

	// kind of stupid, brute force approach...

	// same side variant
	if (!calc.position[picked].safe) {
		picked = _trySideVariant(picked);
	}

	// oposite side
	if (!calc.position[picked].safe) {
		picked = _trySideOpposite(picked);
		// oposite side variant
		if (!calc.position[picked].safe) {
			picked = _trySideVariant(picked);
		}
	}

	// switch axis
	if (!calc.position[picked].safe) {
		picked = _switchAxis(picked);

		// now second round

		// same side variant
		if (!calc.position[picked].safe) {
			picked = _trySideVariant(picked);
		}
		// oposite side
		if (!calc.position[picked].safe) {
			picked = _trySideOpposite(picked);
			// oposite side variant
			if (!calc.position[picked].safe) {
				picked = _trySideVariant(picked);
			}
		}
	}

	// finally, if still no luck, revert to
	// a) either unsafe original (to avoid noise) and do not dance anymore, or
	// b) hide (if configured so)
	if (!calc.position[picked].safe) {
		picked = opts.hideOnInsufficientSpace ? false : preferred;
	}

	return picked;
};
