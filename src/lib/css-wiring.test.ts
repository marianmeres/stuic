import { expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

// STUIC centralizes CSS: every stylesheet must be reachable from src/lib/index.css
// (see docs/architecture.md, "CSS Import Architecture"). A stylesheet that is NOT
// reachable fails silently in the worst possible way — the file exists,
// svelte-package copies it to dist/, the build is green, publint is happy, and the
// styles simply never load for any consumer. Nothing else in the suite sees that.

const SRC_LIB = resolve(import.meta.dirname);

// Subpath-export components with optional peer deps import their own CSS locally so
// it doesn't ship to barrel-only consumers. Enforced by barrel-optional-peers.test.ts.
const SUBPATH_ONLY = [
	"components/MarkdownEditor/index.css",
	"components/CommentInput/index.css",
	"components/TrendChart/index.css",
];

/** A commented-out `@import` is the likelier human error than a deleted one, and the
 *  naive regex cannot tell them apart — strip comments before parsing. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function allCssFiles(dir: string, acc: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		if (entry === "node_modules") continue;
		const full = resolve(dir, entry);
		if (statSync(full).isDirectory()) allCssFiles(full, acc);
		else if (entry.endsWith(".css")) acc.push(full);
	}
	return acc;
}

/** Follow the `@import` graph from index.css, resolving relative specifiers. */
function reachableFromIndex(): Set<string> {
	const seen = new Set<string>();
	const queue = [resolve(SRC_LIB, "index.css")];
	while (queue.length) {
		const file = queue.shift()!;
		if (seen.has(file) || !existsSync(file)) continue;
		seen.add(file);
		const css = stripComments(readFileSync(file, "utf-8"));
		for (const [, spec] of css.matchAll(/@import\s+["']([^"']+)["']/g)) {
			if (!spec.startsWith(".")) continue; // bare specifier: a package (themes)
			queue.push(resolve(dirname(file), spec));
		}
	}
	return seen;
}

const rel = (f: string) => relative(SRC_LIB, f).replaceAll("\\", "/");

test("every stylesheet under src/lib is reachable from index.css", () => {
	const reachable = reachableFromIndex();
	const orphans = allCssFiles(SRC_LIB)
		.filter((f) => !reachable.has(f))
		.map(rel)
		.filter((f) => !SUBPATH_ONLY.includes(f))
		.sort();

	expect(orphans).toEqual([]);
});

test("every relative @import in the CSS graph points at a file that exists", () => {
	const missing: string[] = [];
	for (const file of reachableFromIndex()) {
		const css = stripComments(readFileSync(file, "utf-8"));
		for (const [, spec] of css.matchAll(/@import\s+["']([^"']+)["']/g)) {
			if (!spec.startsWith(".")) continue;
			const target = resolve(dirname(file), spec);
			if (!existsSync(target)) missing.push(`${rel(file)} -> ${spec}`);
		}
	}

	expect(missing.sort()).toEqual([]);
});

test("the frame preset is wired in (and lives outside components/)", () => {
	const css = stripComments(readFileSync(resolve(SRC_LIB, "index.css"), "utf-8"));
	expect(css).toMatch(/@import\s+["']\.\/css\/frame\.css["']/);
	expect(existsSync(resolve(SRC_LIB, "css/frame.css"))).toBe(true);
});
