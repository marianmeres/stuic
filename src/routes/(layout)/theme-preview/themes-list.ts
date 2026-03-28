// Dynamic import of all theme CSS files from @marianmeres/design-tokens
const cssModules = import.meta.glob(
	"/node_modules/@marianmeres/design-tokens/dist/css/*.css",
	{ query: "?raw", import: "default", eager: true }
);

// Build the themes map: { "stone": "css content...", "blue-orange": "css content...", ... }
const themes: Record<string, string> = {};
for (const [path, css] of Object.entries(cssModules)) {
	const name = path.split("/").pop()!.replace(".css", "");
	themes[name] = css as string;
}

const themeNames = Object.keys(themes).sort();

export { themeNames, themes };
