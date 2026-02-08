import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-500)",
				foreground: "var(--color-white)",
			},
			success: {
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-slate-900)",
				},
				muted: {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-500)",
				},
				surface: {
					DEFAULT: "var(--color-slate-200)",
					foreground: "var(--color-slate-900)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-300)",
					foreground: "var(--color-slate-900)",
				},
			},
			single: {
				foreground: "var(--color-slate-900)",
				border: {
					DEFAULT: "var(--color-slate-300)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-slate-50)",
				},
				ring: "color-mix(in srgb, var(--color-red-600) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
			},
			accent: {
				DEFAULT: "var(--color-sky-400)",
				foreground: "var(--color-white)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-white)",
			},
			success: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-slate-900)",
					foreground: "var(--color-slate-50)",
				},
				muted: {
					DEFAULT: "var(--color-slate-800)",
					foreground: "var(--color-slate-400)",
				},
				surface: {
					DEFAULT: "var(--color-slate-700)",
					foreground: "var(--color-slate-300)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-600)",
					foreground: "var(--color-slate-200)",
				},
			},
			single: {
				foreground: "var(--color-slate-50)",
				border: {
					DEFAULT: "var(--color-slate-700)",
				},
				input: {
					DEFAULT: "var(--color-slate-900)",
					hover: "var(--color-slate-800)",
				},
				ring: "color-mix(in srgb, var(--color-red-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
