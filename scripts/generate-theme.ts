import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as themes from "@marianmeres/design-tokens/themes";
import {
	type ThemeSchema,
	generateCssTokens,
	toCssString,
} from "@marianmeres/design-tokens";

const PREFIX = "stuic-";
const OUTDIR = "src/lib/themes/css";

/** Convert camelCase to kebab-case */
function toKebab(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function generateThemeCss(schema: ThemeSchema): string {
	let css =
		"/* prettier-ignore */\n" +
		toCssString(generateCssTokens(schema.light, PREFIX, "light")) +
		"\n";
	if (schema.dark) {
		css +=
			"/* prettier-ignore */\n" +
			toCssString(generateCssTokens(schema.dark, PREFIX, "dark"), ":root.dark");
	}
	return css;
}

type Args =
	| { mode: "single"; infile: string; outfile: string }
	| { mode: "batch" };

function parseArgs(): Args {
	const args = process.argv.slice(2);
	let infile = "";
	let outfile = "";

	for (const arg of args) {
		if (arg.startsWith("--infile=")) {
			infile = arg.replace("--infile=", "");
		} else if (arg.startsWith("--outfile=")) {
			outfile = arg.replace("--outfile=", "");
		}
	}

	if (infile) {
		return { mode: "single", infile, outfile };
	}

	return { mode: "batch" };
}

async function processSingleFile(infile: string, outfile: string) {
	const infilePath = resolve(process.cwd(), infile);
	const mod = await import(infilePath);
	const schema: ThemeSchema = mod.default;
	const css = generateThemeCss(schema);

	if (outfile) {
		const outfilePath = resolve(process.cwd(), outfile);
		writeFileSync(outfilePath, css, "utf-8");
		console.log(`Generated: ${outfile}`);
	} else {
		console.log(css);
	}
}

function processBatch() {
	const outdirPath = resolve(process.cwd(), OUTDIR);
	let processed = 0;

	for (const [name, value] of Object.entries(themes)) {
		// Skip type re-exports (ThemeSchema is a type, not a theme object)
		if (!value || typeof value !== "object" || !("light" in value)) continue;

		const schema = value as ThemeSchema;
		const css = generateThemeCss(schema);
		const filename = `${toKebab(name)}.css`;
		writeFileSync(resolve(outdirPath, filename), css, "utf-8");
		console.log(`Generated: ${filename}`);
		processed++;
	}

	console.log(`\nProcessed ${processed} theme(s)`);
}

async function main() {
	const args = parseArgs();

	if (args.mode === "single") {
		await processSingleFile(args.infile, args.outfile);
	} else {
		processBatch();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
