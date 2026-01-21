import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-red-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-700)",
				active: "var(--color-red-800)",
			},
			accent: {
				DEFAULT: "var(--color-blue-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-500)",
				active: "var(--color-blue-600)",
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
				DEFAULT: "var(--color-emerald-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-700)",
				active: "var(--color-emerald-800)",
			},
			info: {
				DEFAULT: "var(--color-blue-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-600)",
				active: "var(--color-blue-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-white)",
					foreground: "var(--color-slate-900)",
				},
				surface: {
					DEFAULT: "var(--color-slate-50)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-100)",
					active: "var(--color-slate-200)",
				},
				muted: {
					DEFAULT: "var(--color-slate-100)",
					foreground: "var(--color-slate-500)",
					hover: "var(--color-slate-200)",
					active: "var(--color-slate-300)",
				},
			},
			single: {
				foreground: "var(--color-slate-900)",
				border: {
					DEFAULT: "var(--color-slate-200)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
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
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			accent: {
				DEFAULT: "var(--color-blue-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-300)",
				active: "var(--color-blue-200)",
			},
			destructive: {
				DEFAULT: "var(--color-red-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-red-400)",
				active: "var(--color-red-300)",
			},
			warning: {
				DEFAULT: "var(--color-amber-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-amber-300)",
				active: "var(--color-amber-200)",
			},
			success: {
				DEFAULT: "var(--color-emerald-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-emerald-400)",
				active: "var(--color-emerald-300)",
			},
			info: {
				DEFAULT: "var(--color-blue-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-blue-300)",
				active: "var(--color-blue-200)",
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
				ring: "color-mix(in srgb, var(--color-red-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
