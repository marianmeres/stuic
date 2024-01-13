import path from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { createClog, createClogStr } from '@marianmeres/clog';
import { expect, test } from 'vitest';
import { calculateAlignment } from '../lib/utils/calculate-alignment.js';

const clog = createClogStr(path.basename(fileURLToPath(import.meta.url)));

test('calculate placement', async () => {
	// clog(1234);
	const r: any = calculateAlignment(
		{ width: 50, height: 60, x: 0, y: 0 },
		{ width: 20, height: 20, x: 0, y: 0 },
		{ width: 30, height: 30 },
		5
	);

	// prettier-ignore
	const expected = {
		origin: {
			top:    { x: 10, y: -5 },
			bottom: { x: 10, y: 25 },
			left:   { x: -5, y: 10 },
			right:  { x: 25, y: 10 },
		},
		position: {
			top:         { x: -5,  y: -35 },
			topRight:    { x: -10, y: -35 },
			topLeft:     { x: 0,   y: -35 },
			right:       { x: 25,  y: -5 },
			rightTop:    { x: 25,  y: 0 },
			rightBottom: { x: 25,  y: -10 },
			bottom:      { x: -5,  y: 25 },
			bottomLeft:  { x: 0,   y: 25 },
			bottomRight: { x: -10, y: 25 },
			left:        { x: -35, y: -5 },
			leftTop:     { x: -35, y: 0 },
			leftBottom:  { x: -35, y: -10 },
		},
	};

	// clog(r);
	Object.entries(expected).forEach(([key, coords]) => {
		expect((coords as any).x).toEqual(r[key].x);
		expect((coords as any).y).toEqual(r[key].y);
	});

	// expect(r).toEqual(expected);
});
