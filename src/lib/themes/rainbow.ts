import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-blue-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-700)",
				active: "var(--color-blue-800)",
				// foregroundHover/Active not defined → falls back to foreground
			},
			accent: {
				DEFAULT: "var(--color-violet-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-violet-600)",
				active: "var(--color-violet-700)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-amber-600)",
				active: "var(--color-amber-700)",
			},
			success: {
				DEFAULT: "var(--color-green-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-green-700)",
				active: "var(--color-green-800)",
			},
			info: {
				DEFAULT: "var(--color-sky-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-600)",
				active: "var(--color-sky-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-slate-900)",
					// No hover/active for background (rarely needed)
				},
				surface: {
					DEFAULT: "var(--color-slate-50)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-100)",
					active: "var(--color-slate-200)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-200)",
					active: "var(--color-slate-300)",
				},
				"surface-2": {
					DEFAULT: "var(--color-slate-200)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
				},
				muted: {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-500)",
					hover: "var(--color-slate-200)",
					active: "var(--color-slate-300)",
				},
			},
			single: {
				// Plain string: same value for all states
				foreground: "var(--color-slate-900)",

				// Object with explicit hover/active
				border: {
					DEFAULT: "var(--color-slate-200)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-slate-50)",
					// active not defined → falls back to DEFAULT
				},
				ring: "color-mix(in srgb, var(--color-blue-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-blue-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-400)",
				active: "var(--color-blue-300)",
			},
			accent: {
				DEFAULT: "var(--color-violet-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-violet-300)",
				active: "var(--color-violet-200)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-amber-300)",
				active: "var(--color-amber-200)",
			},
			success: {
				DEFAULT: "var(--color-green-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-green-400)",
				active: "var(--color-green-300)",
			},
			info: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-sky-300)",
				active: "var(--color-sky-200)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-slate-900)",
					foreground: "var(--color-slate-50)",
				},
				surface: {
					DEFAULT: "var(--color-slate-800)",
					foreground: "var(--color-slate-100)",
					hover: "var(--color-slate-700)",
					active: "var(--color-slate-600)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-700)",
					foreground: "var(--color-slate-100)",
					hover: "var(--color-slate-600)",
					active: "var(--color-slate-500)",
				},
				"surface-2": {
					DEFAULT: "var(--color-slate-600)",
					foreground: "var(--color-slate-100)",
					hover: "var(--color-slate-500)",
					active: "var(--color-slate-400)",
				},
				muted: {
					DEFAULT: "var(--color-slate-700)",
					foreground: "var(--color-slate-400)",
					hover: "var(--color-slate-600)",
					active: "var(--color-slate-500)",
				},
			},
			single: {
				foreground: "var(--color-slate-50)",
				border: {
					DEFAULT: "var(--color-slate-700)",
					hover: "var(--color-slate-600)",
					active: "var(--color-slate-500)",
				},
				input: {
					DEFAULT: "var(--color-slate-800)",
					hover: "var(--color-slate-700)",
				},
				ring: "color-mix(in srgb, var(--color-blue-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
