/**
 * Tiny module-level stacking counter shared by all `Float` instances.
 *
 * Each call returns a strictly increasing integer used as the panel's
 * `z-index` *order* offset (added on top of the `--stuic-float-z` floor in CSS).
 * The most recently raised panel therefore always wins. A plain module
 * singleton is intentional — every import shares the same counter.
 */
let order = 0;

/**
 * Returns the next stacking order (a strictly increasing integer).
 *
 * Used both when a `Float` mounts (so later panels start above earlier ones)
 * and on `bringToFront()`.
 *
 * @returns The next order value (>= 1).
 */
export function nextFloatOrder(): number {
	return ++order;
}

/**
 * Current highest issued order. Mostly useful for tests / debugging.
 *
 * @returns The last value returned by {@link nextFloatOrder} (0 if none yet).
 */
export function currentFloatOrder(): number {
	return order;
}
