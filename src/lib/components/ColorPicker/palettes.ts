/** One palette entry: a bare CSS color string, or a color with a label. */
export type ColorPickerSwatch = string | ColorPickerSwatchObject;

/** The object form of a palette entry. */
export interface ColorPickerSwatchObject {
	/**
	 * Any CSS color string — `#3b82f6`, `oklch(62.8% 0.258 29.2)`, `rgb(0 0 0)`,
	 * `transparent`, or a custom property reference like
	 * `var(--stuic-color-primary)`. Rendered as-is; never parsed.
	 */
	value: string;
	/**
	 * Accessible name (and `title`) of the swatch. Passed through the component's
	 * `t` with itself as the fallback, so plain labels ("Brand blue") render
	 * verbatim while short keys ("red") get translated by a bundled catalog.
	 * Defaults to `value`.
	 */
	label?: string;
}

/**
 * The default `palette` of `ColorPicker`: 12 fixed hues plus white / grey / black.
 *
 * Deliberately literal hex, not theme tokens — a swatch palette must read the
 * same on every theme (several of the bundled ones are monochrome). Use
 * {@link COLOR_PICKER_PALETTE_THEME} when theme-following colors are what you want.
 */
export const COLOR_PICKER_PALETTE: ColorPickerSwatch[] = [
	{ value: "#ef4444", label: "red" },
	{ value: "#f97316", label: "orange" },
	{ value: "#f59e0b", label: "amber" },
	{ value: "#eab308", label: "yellow" },
	{ value: "#84cc16", label: "lime" },
	{ value: "#22c55e", label: "green" },
	{ value: "#14b8a6", label: "teal" },
	{ value: "#06b6d4", label: "cyan" },
	{ value: "#3b82f6", label: "blue" },
	{ value: "#6366f1", label: "indigo" },
	{ value: "#8b5cf6", label: "violet" },
	{ value: "#ec4899", label: "pink" },
	{ value: "#ffffff", label: "white" },
	{ value: "#6b7280", label: "gray" },
	{ value: "#000000", label: "black" },
];

/**
 * An opt-in palette of design-token colors — pass it as `palette` when the picked
 * color should follow the active theme:
 *
 * ```svelte
 * <ColorPicker bind:value palette={COLOR_PICKER_PALETTE_THEME} />
 * ```
 *
 * The stored value is the `var(--stuic-color-*)` reference itself, so it keeps
 * following the theme wherever it is later applied. Two consequences worth
 * knowing: the native color input cannot display such a value (it falls back to
 * black until the user picks a hex), and on the monochrome themes several of
 * these resolve to near-identical greys.
 */
export const COLOR_PICKER_PALETTE_THEME: ColorPickerSwatch[] = [
	{ value: "var(--stuic-color-primary)", label: "primary" },
	{ value: "var(--stuic-color-accent)", label: "accent" },
	{ value: "var(--stuic-color-success)", label: "success" },
	{ value: "var(--stuic-color-warning)", label: "warning" },
	{ value: "var(--stuic-color-destructive)", label: "destructive" },
	{ value: "var(--stuic-color-foreground)", label: "foreground" },
	{ value: "var(--stuic-color-muted-foreground)", label: "muted_foreground" },
	{ value: "var(--stuic-color-muted)", label: "muted" },
	{ value: "var(--stuic-color-background)", label: "background" },
];
