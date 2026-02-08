// ============================================================================
// Types
// ============================================================================

/** Base color value with optional pseudo states */
export type ColorValue = {
	DEFAULT: string;
	hover?: string;
	active?: string;
};

/** Color pair enforcing the -foreground convention, with optional pseudo states */
export type ColorPair = {
	DEFAULT: string;
	foreground: string;
	hover?: string;
	active?: string;
};

/** Single color: either a plain string or an object with pseudo states */
export type SingleColor = string | ColorValue;

/** Known intent color keys */
export type IntentColorKey =
	| "primary" // main action color ("do this")
	| "accent" // complementary highlight color ("notice this"). A.k.a "secondary"
	| "destructive"
	| "warning"
	| "success";

/** Known role color keys (paired) */
export type RolePairedKey = "background" | "muted" | "surface";

/** Known role color keys (single value) */
export type RoleSingleKey = "foreground" | "border" | "input" | "ring";

/** Helper: require known keys, allow additional */
export type WithRequired<TRequired extends string, TValue> = Record<TRequired, TValue> &
	Record<string, TValue>;

/** Helper: partial known keys, allow additional */
export type WithOptional<TKnown extends string, TValue> = Partial<
	Record<TKnown, TValue>
> &
	Record<string, TValue>;

// ============================================================================
// Schema
// ============================================================================

export type TokenSchema = {
	colors: {
		intent: WithRequired<IntentColorKey, ColorPair>;
		role: {
			// "background" | "surface" | "muted";
			paired: WithRequired<RolePairedKey, ColorPair>;
			// "foreground" | "border" | "input" | "ring"
			single: WithRequired<RoleSingleKey, SingleColor>;
		};
	};
};

export type GeneratedTokens = Record<string, string>;

// ============================================================================
// Helpers
// ============================================================================

/** Check if a single color is an object with states or a plain string */
function isSingleColorObject(value: SingleColor): value is ColorValue {
	return typeof value === "object" && "DEFAULT" in value;
}

/** Tailwind shade scale (ordered light → dark) */
const SHADE_SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Derive hover/active shades from a Tailwind CSS variable.
 * Light mode steps darker (+1, +2 in scale), dark mode steps lighter (-1, -2).
 * Returns defaultValue for both if the value is not a parseable shade variable.
 */
function deriveShadeSteps(
	defaultValue: string,
	mode: "light" | "dark"
): { hover: string; active: string } {
	const match = defaultValue.match(/^var\(--color-([a-z]+)-(\d+)\)$/);
	if (!match) return { hover: defaultValue, active: defaultValue };

	const [, name, shadeStr] = match;
	const shade = parseInt(shadeStr, 10);
	const idx = SHADE_SCALE.indexOf(shade);
	if (idx === -1) return { hover: defaultValue, active: defaultValue };

	const step = mode === "light" ? 1 : -1;
	const hoverIdx = idx + step;
	const activeIdx = idx + step * 2;

	if (hoverIdx < 0 || hoverIdx >= SHADE_SCALE.length) return { hover: defaultValue, active: defaultValue };
	if (activeIdx < 0 || activeIdx >= SHADE_SCALE.length) return { hover: defaultValue, active: defaultValue };

	return {
		hover: `var(--color-${name}-${SHADE_SCALE[hoverIdx]})`,
		active: `var(--color-${name}-${SHADE_SCALE[activeIdx]})`,
	};
}

/** Fill missing hover/active on a ColorPair using shade derivation */
function fillPairStates(pair: ColorPair, mode: "light" | "dark"): ColorPair {
	if (pair.hover !== undefined && pair.active !== undefined) return pair;
	const derived = deriveShadeSteps(pair.DEFAULT, mode);
	return { ...pair, hover: pair.hover ?? derived.hover, active: pair.active ?? derived.active };
}

/** Fill missing hover/active on a ColorValue using shade derivation */
function fillColorValueStates(color: ColorValue, mode: "light" | "dark"): ColorValue {
	if (color.hover !== undefined && color.active !== undefined) return color;
	const derived = deriveShadeSteps(color.DEFAULT, mode);
	return { ...color, hover: color.hover ?? derived.hover, active: color.active ?? derived.active };
}

/** Generate color tokens for a paired color (with foreground) */
function generatePairedColorTokens(
	tokens: GeneratedTokens,
	key: string,
	pair: ColorPair,
	prefix: string = "stuic-"
): void {
	// Main color
	tokens[`${prefix}color-${key}`] = pair.DEFAULT;
	tokens[`${prefix}color-${key}-hover`] = pair.hover ?? pair.DEFAULT;
	tokens[`${prefix}color-${key}-active`] = pair.active ?? pair.DEFAULT;

	// Foreground
	tokens[`${prefix}color-${key}-foreground`] = pair.foreground;
	tokens[`${prefix}color-${key}-foreground-hover`] = pair.foreground;
	tokens[`${prefix}color-${key}-foreground-active`] = pair.foreground;
}

/** Generate color tokens for a single color */
function generateSingleColorTokens(
	tokens: GeneratedTokens,
	key: string,
	color: SingleColor,
	prefix: string = "stuic-"
): void {
	if (isSingleColorObject(color)) {
		tokens[`${prefix}color-${key}`] = color.DEFAULT;
		tokens[`${prefix}color-${key}-hover`] = color.hover ?? color.DEFAULT;
		tokens[`${prefix}color-${key}-active`] = color.active ?? color.DEFAULT;
	} else {
		// Plain string: use same value for all states
		tokens[`${prefix}color-${key}`] = color;
		tokens[`${prefix}color-${key}-hover`] = color;
		tokens[`${prefix}color-${key}-active`] = color;
	}
}

// ============================================================================
// Generator
// ============================================================================

export function generateCssTokens(
	schema: TokenSchema,
	prefix: string = "stuic-",
	mode: "light" | "dark" = "light"
): GeneratedTokens {
	const tokens: GeneratedTokens = {};

	// Intent colors (auto-derive hover/active from shade steps)
	for (const [key, pair] of Object.entries(schema.colors.intent)) {
		generatePairedColorTokens(tokens, key, fillPairStates(pair, mode), prefix);
	}

	// Surface-intent tokens (auto-derived from intent colors)
	// These provide subtle tinted backgrounds for callouts, alerts, highlighted content, etc.
	const contrastMix = mode === "light" ? "black" : "white";
	for (const key of Object.keys(schema.colors.intent)) {
		// Background: 15% tint
		tokens[`${prefix}color-surface-${key}`] =
			`color-mix(in srgb, var(--${prefix}color-${key}) 15%, var(--stuic-color-background))`;
		// Foreground: darken in light mode, lighten in dark mode for contrast
		tokens[`${prefix}color-surface-${key}-foreground`] =
			`color-mix(in srgb, var(--${prefix}color-${key}), ${contrastMix} 10%)`;
		// Border: 30% tint
		tokens[`${prefix}color-surface-${key}-border`] =
			`color-mix(in srgb, var(--${prefix}color-${key}) 30%, var(--stuic-color-background))`;
	}

	// Role colors (paired) — auto-derive except "background" (no hover/active by design)
	for (const [key, pair] of Object.entries(schema.colors.role.paired)) {
		const filled = key === "background" ? pair : fillPairStates(pair, mode);
		generatePairedColorTokens(tokens, key, filled, prefix);
	}

	// Role colors (single) — auto-derive for object types (e.g. border)
	for (const [key, color] of Object.entries(schema.colors.role.single)) {
		if (isSingleColorObject(color)) {
			generateSingleColorTokens(tokens, key, fillColorValueStates(color, mode), prefix);
		} else {
			generateSingleColorTokens(tokens, key, color, prefix);
		}
	}

	return tokens;
}

// ============================================================================
// CSS Output Helpers
// ============================================================================

// Generic fallback for any Tailwind color variable
// This is a safety net for Vite HMR timing - rarely visible in practice
const GENERIC_COLOR_FALLBACK = "#737373"; // neutral-500 (mid-gray)

/**
 * Add generic fallback to var(--color-X) references
 * Input:  "var(--color-neutral-800)"
 * Output: "var(--color-neutral-800, #737373)"
 *
 * Works for ANY Tailwind color (neutral, blue, red, etc.)
 */
function addColorFallback(value: string): string {
	// Match var(--color-X) pattern (but not if it already has a fallback)
	const match = value.match(/^var\(--color-([^,)]+)\)$/);
	if (match) {
		const colorName = match[1];
		// Special cases for obvious colors
		if (colorName === "white") return `var(--color-white, #ffffff)`;
		if (colorName === "black") return `var(--color-black, #000000)`;
		// Generic fallback for all other colors
		return `var(--color-${colorName}, ${GENERIC_COLOR_FALLBACK})`;
	}
	return value;
}

/** Convert tokens object to CSS :root declaration */
export function toCssString(tokens: GeneratedTokens, selector = ":root"): string {
	// Find max key length for padding
	const maxLen = Math.max(...Object.keys(tokens).map((k) => `--${k}`.length));

	// Helper to extract base color name from token key
	const getBaseColor = (key: string): string => {
		// e.g., "stuic-color-primary-foreground-hover" → "primary"
		// e.g., "stuic-color-surface-1-foreground" → "surface-1"
		const match = key.match(/^stuic-color-([a-z]+-?\d*)/);
		return match ? match[1] : key;
	};

	// Group tokens by base color name (preserving order)
	const groups = new Map<string, [string, string][]>();
	for (const [key, value] of Object.entries(tokens)) {
		const base = getBaseColor(key);
		if (!groups.has(base)) {
			groups.set(base, []);
		}
		groups.get(base)!.push([key, value]);
	}

	// Format a token with padding (include colon in key)
	const formatVar = ([key, value]: [string, string]): string => {
		const cssKey = `--${key}:`;
		const valueWithFallback = addColorFallback(value);
		return `\t${cssKey.padEnd(maxLen + 1)} ${valueWithFallback};`;
	};

	// Build output with empty lines between each color group
	const parts: string[] = [];
	for (const entries of groups.values()) {
		parts.push(entries.map(formatVar).join("\n"));
	}

	return `${selector} {\n${parts.join("\n\n")}\n}\n`;
}

/** Create dark mode override tokens */
export function createDarkOverride(
	baseTokens: GeneratedTokens,
	overrides: Partial<GeneratedTokens>
): GeneratedTokens {
	const darkTokens: GeneratedTokens = {};

	for (const [key, value] of Object.entries(overrides)) {
		if (key in baseTokens && value !== undefined) {
			darkTokens[key] = value;
		}
	}

	return darkTokens;
}

// ============================================================================
// Theme Schema (light + dark)
// ============================================================================

/** A complete theme definition with required light mode and optional dark mode */
export type ThemeSchema = { light: TokenSchema; dark?: TokenSchema };

/** Generate complete CSS string for a theme (light + optional dark mode) */
export function generateThemeCss(schema: ThemeSchema, prefix: string = "stuic-"): string {
	let css = toCssString(generateCssTokens(schema.light, prefix, "light"));
	if (schema.dark) {
		css +=
			"\n" + toCssString(generateCssTokens(schema.dark, prefix, "dark"), ":root.dark");
	}
	return css;
}
