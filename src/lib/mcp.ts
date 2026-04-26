// @ts-nocheck - Deno-style imports for @marianmeres/mcp-server discovery
import { z } from "npm:zod";
import type { McpToolDefinition } from "jsr:@marianmeres/mcp-server/types";
import { generateThemeCss, type ThemeSchema } from "./utils/design-tokens.js";
import { hexToOklch, hexToRgb } from "./utils/colors.js";
import { generateAvatarColors } from "./utils/avatar-colors.js";

export const tools: McpToolDefinition[] = [
	{
		name: "generate-theme-css",
		description:
			"Generate complete STUIC CSS custom properties from a theme schema. " +
			"Accepts a ThemeSchema JSON with light (required) and dark (optional) TokenSchema objects. " +
			"Each TokenSchema defines intent colors (primary, accent, destructive, warning, success) " +
			"and role colors (background, muted, surface, foreground, border, input, ring). " +
			"Auto-derives hover/active states via color-mix() and generates surface tints.",
		params: {
			schema: z
				.string()
				.describe(
					"ThemeSchema as JSON string. Structure: " +
						'{ "light": { "colors": { "intent": { "primary": { "DEFAULT": "var(--color-stone-800)", "foreground": "var(--color-white)" }, ... }, ' +
						'"role": { "paired": { "background": { "DEFAULT": "...", "foreground": "..." }, ... }, ' +
						'"single": { "foreground": "...", "border": "...", "input": "...", "ring": "..." } } } }, "dark": { ... } }'
				),
			prefix: z
				.string()
				.default("stuic-")
				.describe("CSS variable prefix (default: 'stuic-')"),
		},
		handler: async ({ schema, prefix }) => {
			const parsed: ThemeSchema = JSON.parse(schema);
			return generateThemeCss(parsed, prefix);
		},
	},
	{
		name: "hex-to-oklch",
		description:
			"Convert a CSS HEX color to oklch() format. Useful for perceptually uniform color manipulation in modern CSS.",
		params: {
			hex: z
				.string()
				.describe('HEX color string, e.g. "#ff0000", "ff0000", "#f00"'),
		},
		handler: async ({ hex }) => {
			return hexToOklch(hex);
		},
	},
	{
		name: "hex-to-rgb",
		description:
			"Convert a CSS HEX color to RGB components. Returns JSON with r, g, b values (0-255).",
		params: {
			hex: z
				.string()
				.describe('HEX color string, e.g. "#ff0000", "ff0000", "#f00"'),
		},
		handler: async ({ hex }) => {
			const rgb = hexToRgb(hex);
			if (!rgb) return "Error: Invalid HEX color format";
			return JSON.stringify(rgb);
		},
	},
	{
		name: "generate-avatar-colors",
		description:
			"Generate deterministic pastel background and contrasting text colors from any string identifier (user ID, email, name). Same input always produces the same harmonious color pair.",
		params: {
			source: z
				.string()
				.describe(
					"String identifier to generate colors from (e.g. email, user ID)"
				),
		},
		handler: async ({ source }) => {
			return JSON.stringify(generateAvatarColors(source));
		},
	},
];
