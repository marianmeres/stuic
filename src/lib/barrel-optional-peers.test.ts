import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

/**
 * Guard: the root barrel (`src/lib/index.ts`) must never reach a component whose
 * peer dependencies are declared OPTIONAL.
 *
 * Why this exists — this regressed once already. `MarkdownEditor` was deliberately
 * kept off the barrel and given the `@marianmeres/stuic/markdown-editor` subpath so
 * its @milkdown/* + @codemirror/* peers stay opt-in. Then `CommentInput` (which
 * embeds MarkdownEditor) WAS added to the barrel, silently re-attaching the whole
 * editor subtree to the main entry point.
 *
 * The fallout is invisible locally: this repo has every optional peer installed as a
 * devDependency, `vite dev` never validates the graph, and the two editor backends sit
 * behind `await import()`. But a consumer that has NOT installed the peers gets a hard
 * build failure — the dynamic-import specifiers are static string literals, so a
 * bundler still resolves them and validates their named exports. Vite substitutes an
 * `__vite-optional-peer-dep:` stub that exports nothing; rolldown (Vite 8+) turns every
 * one of those named imports into a MISSING_EXPORT error. A README note did not prevent
 * this. A test does.
 *
 * A component with optional peers belongs behind its own subpath export, with its CSS
 * imported locally rather than from `src/lib/index.css`.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC_LIB = HERE;
const REPO_ROOT = resolve(HERE, "../..");

/** Peer specifiers that are declared optional and must stay off the root graph. */
const OPTIONAL_PEER_RE = /^@(milkdown|codemirror)\/|^@marianmeres\/trend-chart(\/|$)/;

/** Component dirs that are subpath-only. Reaching any from the barrel is the bug. */
const SUBPATH_ONLY = [
	"components/MarkdownEditor",
	"components/CommentInput",
	"components/TrendChart",
];

// --- module graph walker ----------------------------------------------------
// Deliberately hand-rolled rather than asking a bundler: this must work with no
// build step and no dist/, so it can run in the plain node test project.

/** Strip comments so a commented-out import can't fabricate a graph edge. */
function stripComments(src: string): string {
	// Order matters: block comments first, then line comments.
	return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}

/** Every module specifier in a chunk of JS/TS: static, side-effect, and dynamic. */
function specifiersIn(code: string): string[] {
	const src = stripComments(code);
	const out: string[] = [];
	// `import x from "s"` / `export { x } from "s"` / `import type { x } from "s"`
	for (const m of src.matchAll(/\bfrom\s*["']([^"']+)["']/g)) out.push(m[1]);
	// bare side-effect `import "s"` (this is how subpath components pull their CSS)
	for (const m of src.matchAll(/\bimport\s*["']([^"']+)["']/g)) out.push(m[1]);
	// `await import("s")` — the editor backends live behind exactly this
	for (const m of src.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) out.push(m[1]);
	return out;
}

/** `.svelte` files carry imports in `<script>` AND `<script module>`. Both count. */
function codeOf(file: string): string {
	const raw = readFileSync(file, "utf-8");
	if (!file.endsWith(".svelte")) return raw;
	return [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
		.map((m) => m[1])
		.join("\n");
}

/** Mirror the resolution a bundler does: $lib alias, NodeNext .js->.ts, dir index. */
function resolveSpecifier(spec: string, fromFile: string): string | null {
	let base: string;
	if (spec.startsWith("$lib/")) base = resolve(SRC_LIB, spec.slice("$lib/".length));
	else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
	else return null; // bare specifier — handled by the caller, not resolved to disk

	const candidates = [base];
	// TS emits `./x.js` for `./x.ts` and `./x.svelte.ts`
	if (base.endsWith(".js")) {
		candidates.push(base.slice(0, -3) + ".ts", base.slice(0, -3) + ".svelte.ts");
	}
	candidates.push(base + ".ts", base + ".js", base + ".svelte");
	if (existsSync(base) && statSync(base).isDirectory()) {
		candidates.push(resolve(base, "index.ts"), resolve(base, "index.js"));
	}
	for (const c of candidates) {
		if (existsSync(c) && statSync(c).isFile()) return c;
	}
	return null;
}

const WALKABLE = /\.(ts|js|svelte)$/;

/** Transitive closure from `entry`. Returns reached local files + bare specifiers. */
function walk(entry: string): { files: Set<string>; bare: Set<string> } {
	const files = new Set<string>();
	const bare = new Set<string>();
	const queue = [entry];
	while (queue.length) {
		const file = queue.pop()!;
		if (files.has(file) || !WALKABLE.test(file)) continue;
		files.add(file);
		for (const spec of specifiersIn(codeOf(file))) {
			if (!spec.startsWith(".") && !spec.startsWith("$lib/")) {
				bare.add(spec);
				continue;
			}
			const resolved = resolveSpecifier(spec, file);
			if (resolved) queue.push(resolved);
		}
	}
	return { files, bare };
}

const rel = (f: string) => relative(REPO_ROOT, f);

// --- the guard --------------------------------------------------------------

describe("root barrel isolation from optional peer deps", () => {
	const barrel = walk(resolve(SRC_LIB, "index.ts"));

	test("walker is not vacuous — it DOES find the peers when they are reachable", () => {
		// Anti-vacuity self-check. Without this, a walker that silently resolves
		// nothing would make every assertion below pass. Entering at CommentInput
		// exercises the exact chain the barrel must not have: CommentInput.svelte ->
		// MarkdownEditor/index.ts -> MarkdownEditor.svelte -> await import(_internal/*)
		// -> @milkdown/* + @codemirror/*, crossing .ts, .svelte <script module>,
		// <script>, and a dynamic import on the way.
		const viaSubpath = walk(resolve(SRC_LIB, "components/CommentInput/index.ts"));
		const peers = [...viaSubpath.bare].filter((s) => OPTIONAL_PEER_RE.test(s));

		expect(peers.length).toBeGreaterThan(0);
		expect(peers.some((p) => p.startsWith("@milkdown/"))).toBe(true);
		expect(peers.some((p) => p.startsWith("@codemirror/"))).toBe(true);
		// and it really did traverse the .svelte -> dynamic-import hops
		expect(
			[...viaSubpath.files].some((f) =>
				f.endsWith("MarkdownEditor/_internal/milkdown.ts")
			)
		).toBe(true);
	});

	test("walker finds @marianmeres/trend-chart when entering at its subpath", () => {
		// Anti-vacuity for the non-editor optional peer: the TrendChart subpath
		// statically imports it, so the walker must see it there.
		const via = walk(resolve(SRC_LIB, "components/TrendChart/index.ts"));
		const peers = [...via.bare].filter((s) => OPTIONAL_PEER_RE.test(s));
		expect(peers).toContain("@marianmeres/trend-chart");
	});

	test("no optional editor peer is reachable from src/lib/index.ts", () => {
		const leaked = [...barrel.bare].filter((s) => OPTIONAL_PEER_RE.test(s)).sort();
		expect(leaked).toEqual([]);
	});

	test("no subpath-only component is reachable from src/lib/index.ts", () => {
		const leaked = [...barrel.files]
			.map(rel)
			.filter((f) => SUBPATH_ONLY.some((dir) => f.includes(dir)))
			.sort();
		expect(leaked).toEqual([]);
	});

	test("subpath-only component CSS stays out of the central stylesheet", () => {
		const css = readFileSync(resolve(SRC_LIB, "index.css"), "utf-8");
		const imported = [...css.matchAll(/@import\s+["']([^"']+)["']/g)].map((m) => m[1]);
		const leaked = imported
			.filter((s) =>
				SUBPATH_ONLY.some((dir) => s.includes(dir.replace("components/", "")))
			)
			.sort();
		// These components import their own index.css locally instead; centralizing it
		// would ship the styles to every barrel consumer, defeating the isolation.
		expect(leaked).toEqual([]);
	});

	test("each subpath-only component is actually exported from package.json", () => {
		const pkg = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf-8"));
		// Kept off the barrel + not exported anywhere = unreachable for consumers.
		for (const dir of SUBPATH_ONLY) {
			const entry = Object.values(
				pkg.exports as Record<string, { svelte?: string }>
			).find((e) => e?.svelte?.includes(dir.replace("components/", "components/")));
			expect(entry, `no package.json export points at ${dir}`).toBeTruthy();
		}
	});

	test("each subpath-only component imports its own CSS locally", () => {
		for (const dir of SUBPATH_ONLY) {
			const cssFile = resolve(SRC_LIB, dir, "index.css");
			if (!existsSync(cssFile)) continue;
			const name = dir.split("/").pop()!;
			const component = resolve(SRC_LIB, dir, `${name}.svelte`);
			expect(codeOf(component), `${name}.svelte must import "./index.css"`).toMatch(
				/import\s+["']\.\/index\.css["']/
			);
		}
	});
});
