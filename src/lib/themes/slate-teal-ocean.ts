import type { TokenSchema } from "../utils/design-tokens.js";

const light: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-slate-700)",
				foreground: "var(--color-white)",
				hover: "var(--color-slate-800)",
				active: "var(--color-slate-900)",
			},
			accent: {
				DEFAULT: "var(--color-teal-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-600)",
				active: "var(--color-teal-700)",
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
				DEFAULT: "var(--color-teal-600)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-700)",
				active: "var(--color-teal-800)",
			},
			info: {
				DEFAULT: "var(--color-cyan-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-cyan-600)",
				active: "var(--color-cyan-700)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-slate-50)",
					foreground: "var(--color-slate-900)",
				},
				surface: {
					DEFAULT: "var(--color-slate-200)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-300)",
					foreground: "var(--color-slate-900)",
					hover: "var(--color-slate-400)",
					active: "var(--color-slate-500)",
				},
				muted: {
					DEFAULT: "var(--color-slate-200)",
					foreground: "var(--color-slate-500)",
					hover: "var(--color-slate-300)",
					active: "var(--color-slate-400)",
				},
			},
			single: {
				foreground: "var(--color-slate-900)",
				border: {
					DEFAULT: "var(--color-slate-300)",
					hover: "var(--color-slate-400)",
					active: "var(--color-slate-500)",
				},
				input: {
					DEFAULT: "var(--color-white)",
					hover: "var(--color-slate-50)",
				},
				ring: "color-mix(in srgb, var(--color-teal-500) 20%, transparent)",
			},
		},
	},
};

const dark: TokenSchema = {
	colors: {
		intent: {
			primary: {
				DEFAULT: "var(--color-slate-400)",
				foreground: "var(--color-slate-950)",
				hover: "var(--color-slate-300)",
				active: "var(--color-slate-200)",
			},
			accent: {
				DEFAULT: "var(--color-teal-400)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-300)",
				active: "var(--color-teal-200)",
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
				DEFAULT: "var(--color-teal-500)",
				foreground: "var(--color-white)",
				hover: "var(--color-teal-400)",
				active: "var(--color-teal-300)",
			},
			info: {
				DEFAULT: "var(--color-cyan-400)",
				foreground: "var(--color-black)",
				hover: "var(--color-cyan-300)",
				active: "var(--color-cyan-200)",
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: "var(--color-slate-950)",
					foreground: "var(--color-slate-50)",
				},
				surface: {
					DEFAULT: "var(--color-slate-900)",
					foreground: "var(--color-slate-100)",
					hover: "var(--color-slate-800)",
					active: "var(--color-slate-700)",
				},
				"surface-1": {
					DEFAULT: "var(--color-slate-800)",
					foreground: "var(--color-slate-100)",
					hover: "var(--color-slate-700)",
					active: "var(--color-slate-600)",
				},
				muted: {
					DEFAULT: "var(--color-slate-800)",
					foreground: "var(--color-slate-500)",
					hover: "var(--color-slate-700)",
					active: "var(--color-slate-600)",
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
					DEFAULT: "var(--color-slate-900)",
					hover: "var(--color-slate-800)",
				},
				ring: "color-mix(in srgb, var(--color-teal-400) 25%, transparent)",
			},
		},
	},
};

export default { light, dark };
