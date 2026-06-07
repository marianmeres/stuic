/**
 * Pure helpers for the MarkdownEditor's editing-surface max-height resolution.
 *
 * Deliberately framework-free (no DOM, no Svelte) so the height-capping logic is
 * unit-testable without a browser/layout engine. `MarkdownEditor.svelte` does the
 * actual DOM measurement and feeds the resulting numbers through these helpers.
 */

/**
 * Base cap applied to the editing surface, as a CSS expression. Reads the
 * themeable `--stuic-markdown-editor-max-height` custom property, falling back
 * to `32rem`. The `32rem` fallback is kept in sync with the same value in
 * `index.css` (`.stuic-markdown-editor-surface`).
 */
export const DEFAULT_MAX_HEIGHT_VAR = "var(--stuic-markdown-editor-max-height, 32rem)";

/**
 * Normalize a `maxHeight` prop value into a CSS length.
 * - `number` → pixels (`240` → `"240px"`)
 * - `string` → used verbatim (any CSS length: `"40rem"`, `"60vh"`, `"min(40rem,50vh)"`)
 * - `null` / `undefined` / empty / non-finite → `null` (caller uses the default)
 */
export function maxHeightToCss(value: number | string | null | undefined): string | null {
	if (value == null) return null;
	if (typeof value === "number") return Number.isFinite(value) ? `${value}px` : null;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : null;
}

/**
 * Combine the configured cap (`base`, a CSS length/expression) with the measured
 * parent-available height. When a positive `parentAvailablePx` is given the
 * surface is capped to the smaller of the two via CSS `min()`, so it never
 * overflows a height-constrained parent. Otherwise the base cap is returned
 * unchanged.
 */
export function surfaceMaxHeight(base: string, parentAvailablePx: number | null): string {
	if (parentAvailablePx != null && parentAvailablePx > 0) {
		return `min(${base}, ${Math.round(parentAvailablePx)}px)`;
	}
	return base;
}

/** Inputs for {@link computeParentAvailable}, in CSS px (viewport coords for tops/bottoms). */
export interface ParentAvailableInput {
	/** Viewport-relative top of the element we measure from (the editing surface). */
	fromTop: number;
	/** Viewport-relative bottom of the parent's border box (`getBoundingClientRect().bottom`). */
	parentBottom: number;
	/** Parent computed `border-bottom-width` in px. Default `0`. */
	parentBorderBottom?: number;
	/** Parent computed `padding-bottom` in px. Default `0`. */
	parentPaddingBottom?: number;
	/** Extra breathing room to leave below the editor, in px. Default `0`. */
	bottomGap?: number;
}

/**
 * Compute the vertical space available to the editor inside its parent: the
 * distance from `fromTop` down to the bottom of the parent's content box, less
 * an optional `bottomGap`.
 *
 * Returns `null` when the result is not positive — the parent is smaller than
 * the editor's offset (e.g. not laid out yet), so no meaningful cap can be
 * derived and the caller should fall back to the configured base.
 *
 * Note: in an auto-height (content-sized) parent this naturally returns roughly
 * the editor's own height, so `surfaceMaxHeight(base, …)` resolves to the base
 * cap and the parent constraint only bites when the parent is genuinely smaller.
 */
export function computeParentAvailable(input: ParentAvailableInput): number | null {
	const {
		fromTop,
		parentBottom,
		parentBorderBottom = 0,
		parentPaddingBottom = 0,
		bottomGap = 0,
	} = input;
	const contentBottom = parentBottom - parentBorderBottom - parentPaddingBottom;
	const available = contentBottom - fromTop - bottomGap;
	return available > 0 ? Math.floor(available) : null;
}
