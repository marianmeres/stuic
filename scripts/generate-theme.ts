import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	type TokenSchema,
	generateCssTokens,
	toCssString,
} from "../src/lib/utils/design-tokens.ts";

type Args =
	| { mode: "single"; infile: string; outfile: string }
	| { mode: "directory"; indir: string; outdir: string };

function parseArgs(): Args {
	const args = process.argv.slice(2);
	let infile = "";
	let outfile = "";
	let indir = "";
	let outdir = "";

	for (const arg of args) {
		if (arg.startsWith("--infile=")) {
			infile = arg.replace("--infile=", "");
		} else if (arg.startsWith("--outfile=")) {
			outfile = arg.replace("--outfile=", "");
		} else if (arg.startsWith("--indir=")) {
			indir = arg.replace("--indir=", "");
		} else if (arg.startsWith("--outdir=")) {
			outdir = arg.replace("--outdir=", "");
		}
	}

	if (infile) {
		return { mode: "single", infile, outfile };
	}

	if (indir) {
		if (!outdir) {
			console.error("--outdir is required when using --indir");
			process.exit(1);
		}
		return { mode: "directory", indir, outdir };
	}

	console.error(
		"Usage: --infile=<path> [--outfile=<path>]\n       --indir=<path> --outdir=<path>",
	);
	process.exit(1);
}

type ThemeSchema = { light: TokenSchema; dark?: TokenSchema };

function isValidThemeModule(
	mod: unknown,
): mod is { default: ThemeSchema } {
	if (!mod || typeof mod !== "object") return false;
	const def = (mod as Record<string, unknown>).default;
	if (!def || typeof def !== "object") return false;
	const schema = def as Record<string, unknown>;
	if (!schema.light || typeof schema.light !== "object") return false;
	const light = schema.light as Record<string, unknown>;
	if (!light.colors || typeof light.colors !== "object") return false;
	const colors = light.colors as Record<string, unknown>;
	if (!colors.intent || !colors.role) return false;
	if (schema.dark) {
		if (typeof schema.dark !== "object") return false;
		const dark = schema.dark as Record<string, unknown>;
		if (!dark.colors || typeof dark.colors !== "object") return false;
		const darkColors = dark.colors as Record<string, unknown>;
		if (!darkColors.intent || !darkColors.role) return false;
	}
	return true;
}

function generateThemeCss(schema: ThemeSchema): string {
	let css =
		"/* prettier-ignore */\n" +
		toCssString(generateCssTokens(schema.light)) +
		"\n";
	if (schema.dark) {
		css +=
			"/* prettier-ignore */\n" +
			toCssString(generateCssTokens(schema.dark), ":root.dark");
	}
	return css;
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

async function processDirectory(indir: string, outdir: string) {
	const indirPath = resolve(process.cwd(), indir);
	const outdirPath = resolve(process.cwd(), outdir);

	const files = readdirSync(indirPath).filter((f: string) => f.endsWith(".ts"));
	let processed = 0;
	let skipped = 0;

	for (const file of files) {
		const infilePath = resolve(indirPath, file);
		try {
			const mod = await import(infilePath);
			if (!isValidThemeModule(mod)) {
				skipped++;
				continue;
			}
			const css = generateThemeCss(mod.default);
			const outfile = file.replace(/\.ts$/, ".css");
			writeFileSync(resolve(outdirPath, outfile), css, "utf-8");
			console.log(`Generated: ${outfile}`);
			processed++;
		} catch {
			skipped++;
		}
	}
	console.log(`\nProcessed ${processed} theme(s), skipped ${skipped} file(s)`);
}

async function main() {
	const args = parseArgs();

	if (args.mode === "single") {
		await processSingleFile(args.infile, args.outfile);
	} else {
		await processDirectory(args.indir, args.outdir);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
