// ============================================================================
// Types
// ============================================================================

/** Base color value with optional pseudo states */
type ColorValue = {
	DEFAULT: string;
	hover?: string;
	active?: string;
};

/** Color pair enforcing the -foreground convention, with optional pseudo states */
type ColorPair = {
	DEFAULT: string;
	foreground: string;
	hover?: string;
	active?: string;
	foregroundHover?: string;
	foregroundActive?: string;
};

/** Single color: either a plain string or an object with pseudo states */
type SingleColor = string | ColorValue;

/** Known intent color keys */
export type IntentColorKey =
	| "primary" // main action color ("do this")
	| "accent" // complementary highlight color ("notice this")
	| "destructive"
	| "warning"
	| "success"
	| "info";

/** Known role color keys (paired) */
export type RolePairedKey = "background" | "surface" | "muted";

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
	tokens[`${prefix}color-${key}-foreground-hover`] =
		pair.foregroundHover ?? pair.foreground;
	tokens[`${prefix}color-${key}-foreground-active`] =
		pair.foregroundActive ?? pair.foreground;
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
	prefix: string = "stuic-"
): GeneratedTokens {
	const tokens: GeneratedTokens = {};

	// Intent colors
	for (const [key, pair] of Object.entries(schema.colors.intent)) {
		generatePairedColorTokens(tokens, key, pair, prefix);
	}

	// Role colors (paired)
	for (const [key, pair] of Object.entries(schema.colors.role.paired)) {
		generatePairedColorTokens(tokens, key, pair, prefix);
	}

	// Role colors (single)
	for (const [key, color] of Object.entries(schema.colors.role.single)) {
		generateSingleColorTokens(tokens, key, color, prefix);
	}

	return tokens;
}

// ============================================================================
// CSS Output Helpers
// ============================================================================

/** Convert tokens object to CSS :root declaration */
export function toCssString(tokens: GeneratedTokens, selector = ":root"): string {
	// Find max key length for padding
	const maxLen = Math.max(...Object.keys(tokens).map((k) => `--${k}`.length));

	// Helper to extract base color name from token key
	const getBaseColor = (key: string): string => {
		// e.g., "stuic-color-primary-foreground-hover" → "primary"
		const match = key.match(/^stuic-color-([^-]+)/);
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
		return `\t${cssKey.padEnd(maxLen + 1)} ${value};`;
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
