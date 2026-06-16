/**
 * Pure (DOM-free) positioning helpers for the `Float` component.
 *
 * Kept separate from `Float.svelte` so the math can be unit-tested in the fast
 * node test project (`*.test.ts`) without a browser.
 */

/** A 2D size. */
export interface FloatSize {
	width: number;
	height: number;
}

/** A 2D point (top-left corner, in px). */
export interface FloatPoint {
	x: number;
	y: number;
}

/**
 * Named placement preset, resolved against the viewport (with `Float`'s
 * `offset` applied as a gap from the corresponding edges).
 *
 * - Single axis names (`top`, `left`, ...) center the unspecified axis.
 * - `center` centers both axes.
 */
export type FloatPlacement =
	| "top-left"
	| "top"
	| "top-right"
	| "left"
	| "center"
	| "right"
	| "bottom-left"
	| "bottom"
	| "bottom-right";

/** All valid placements, handy for demos / iteration. */
export const FLOAT_PLACEMENTS: FloatPlacement[] = [
	"top-left",
	"top",
	"top-right",
	"left",
	"center",
	"right",
	"bottom-left",
	"bottom",
	"bottom-right",
];

/**
 * Normalizes a scalar-or-`{x,y}` offset into an `{x,y}` pair.
 *
 * @param offset - A single number (applied to both axes) or an explicit pair.
 * @returns The resolved `{x,y}` offset.
 */
export function normalizeOffset(
	offset: number | Partial<FloatPoint> | undefined,
	fallback = 0
): FloatPoint {
	if (offset == null) return { x: fallback, y: fallback };
	if (typeof offset === "number") return { x: offset, y: offset };
	return { x: offset.x ?? fallback, y: offset.y ?? fallback };
}

/**
 * Resolves a named {@link FloatPlacement} to an absolute top-left position so the
 * element sits inside the viewport with `offset` as the edge gap.
 *
 * The returned position is guaranteed to be within `[0, viewport - size]` on
 * each axis (it never needs further clamping).
 *
 * @param placement - The placement preset.
 * @param size - The measured element size.
 * @param viewport - The available viewport size.
 * @param offset - Edge gap (number or `{x,y}`).
 * @returns The resolved top-left `{x,y}`.
 *
 * @example
 * ```ts
 * resolvePlacement("top-right", { width: 200, height: 100 },
 *   { width: 1000, height: 800 }, { x: 16, y: 16 });
 * // -> { x: 784, y: 16 }
 * ```
 */
export function resolvePlacement(
	placement: FloatPlacement,
	size: FloatSize,
	viewport: FloatSize,
	offset: number | Partial<FloatPoint> = 0
): FloatPoint {
	const off = normalizeOffset(offset);
	const maxX = Math.max(0, viewport.width - size.width);
	const maxY = Math.max(0, viewport.height - size.height);

	// horizontal/vertical buckets
	let horiz: "left" | "center" | "right" = "center";
	let vert: "top" | "center" | "bottom" = "center";
	for (const part of placement.split("-")) {
		if (part === "left" || part === "right") horiz = part;
		else if (part === "top" || part === "bottom") vert = part;
		// "center" leaves the unspecified axis centered
	}

	const x = horiz === "left" ? off.x : horiz === "right" ? maxX - off.x : maxX / 2;
	const y = vert === "top" ? off.y : vert === "bottom" ? maxY - off.y : maxY / 2;

	// guard against offsets larger than the available space
	return {
		x: Math.min(Math.max(0, x), maxX),
		y: Math.min(Math.max(0, y), maxY),
	};
}

/**
 * Clamps a top-left position so the whole element stays inside the viewport
 * (never even partially off-screen), honoring an optional edge `margin`.
 *
 * When the element is larger than the viewport on an axis, it is pinned to the
 * leading edge (`margin`) on that axis.
 *
 * @param pos - The desired top-left position.
 * @param size - The measured element size.
 * @param viewport - The available viewport size.
 * @param margin - Minimum gap kept from every edge (default `0`).
 * @returns The clamped `{x,y}`.
 */
export function clampToViewport(
	pos: FloatPoint,
	size: FloatSize,
	viewport: FloatSize,
	margin = 0
): FloatPoint {
	const maxX = Math.max(margin, viewport.width - size.width - margin);
	const maxY = Math.max(margin, viewport.height - size.height - margin);
	return {
		x: Math.min(Math.max(margin, pos.x), maxX),
		y: Math.min(Math.max(margin, pos.y), maxY),
	};
}
