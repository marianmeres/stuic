import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	type TokenSchema,
	generateCssTokens,
	toCssString,
} from "../src/lib/utils/design-tokens.ts";

function parseArgs(): { infile: string; outfile: string } {
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

	if (!infile) {
		console.error("Usage: --infile=<path> [--outfile=<path>]");
		process.exit(1);
	}

	return { infile, outfile };
}

async function main() {
	const { infile, outfile } = parseArgs();

	const infilePath = resolve(process.cwd(), infile);

	const module = await import(infilePath);
	const schema: { light: TokenSchema; dark?: TokenSchema } = module.default;

	let css =
		"/* prettier-ignore */\n" + toCssString(generateCssTokens(schema.light)) + "\n";

	if (schema.dark) {
		css +=
			"/* prettier-ignore */\n" +
			toCssString(generateCssTokens(schema.dark), ":root.dark");
	}

	if (outfile) {
		const outfilePath = resolve(process.cwd(), outfile);
		writeFileSync(outfilePath, css, "utf-8");
		console.log(`Generated: ${outfile}`);
	} else {
		console.log(css);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
