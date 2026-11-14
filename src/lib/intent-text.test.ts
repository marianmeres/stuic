import { expect, test } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";

// Guard: intent-coloured TEXT never reads the raw intent colour.
//
// A theme picks `--stuic-color-{intent}` as a FILL, to carry `{intent}-foreground` on top.
// Read as text it fails more often than not: over the bundled themes, 227 of 550
// intent x scheme combinations are under 4.5:1 on the page background, and 374 on the
// intent's own tint. The colour a theme derives for the job is
// `--stuic-color-surface-{intent}-foreground` (see docs/domains/theming.md).
//
// The defect is easy to write and invisible in review: `color: var(--stuic-x-error)` looks
// innocent, and the token it reads is declared in another block as the raw intent. So this
// follows every `color` declaration (and every `text-(--token)` utility in a component) down
// its var() chain and fails when the chain ends on a raw intent. It is static on purpose:
// it covers every stylesheet in the library without mounting anything.
//
// What it follows, for `var(--name, fallback)`:
//   a theme token     the end of the chain (the tokens of the bundled theme, not a name
//                     prefix: `--stuic-color-picker-*` belongs to a component)
//   declared here     every value the library declares for it (a `--_private` name is looked
//                     up in its own component directory, where it is reused per intent)
//   not declared      an override hook: the fallback is the default, so that is followed

const SRC_LIB = resolve(import.meta.dirname);
const INTENTS = "primary|accent|destructive|warning|success";
const RAW_INTENT = new RegExp(`^--stuic-color-(${INTENTS})(-hover|-active)?$`);

/** The tokens a theme provides: every custom property of the theme the library ships with. */
const THEME = new Set(
	[
		...readFileSync(
			createRequire(import.meta.url).resolve("@marianmeres/design-tokens/css/stone.css"),
			"utf-8"
		).matchAll(/(--stuic-color-[\w-]+)\s*:/g),
	].map((m) => m[1])
);

/**
 * `color` declarations that are allowed to end on a raw intent, each with its reason.
 * Not a place to park a new offender: a glyph that is a filled shape is a fill, text is not.
 */
const ALLOWED: Record<string, string> = {
	"components/Rating/index.css :: .stuic-rating-icon-fill":
		"the filled star is a shape, not text; `intent` is documented as its fill colour",
};

type Declaration = { file: string; selector: string; prop: string; value: string };

const rel = (f: string) => relative(SRC_LIB, f).replaceAll("\\", "/");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function files(dir: string, ext: string, acc: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const full = resolve(dir, entry);
		if (statSync(full).isDirectory()) files(full, ext, acc);
		else if (entry.endsWith(ext)) acc.push(full);
	}
	return acc;
}

/** Every `prop: value` in a stylesheet, with the selector of the rule it sits in. */
function declarations(file: string): Declaration[] {
	const out: Declaration[] = [];
	const rules: string[] = [];
	let buf = "";
	let parens = 0;
	const flush = () => {
		const colon = buf.indexOf(":");
		if (colon > 0 && rules.length) {
			out.push({
				file,
				selector: rules.at(-1)!,
				prop: buf.slice(0, colon).trim(),
				value: buf
					.slice(colon + 1)
					.trim()
					.replace(/\s+/g, " "),
			});
		}
		buf = "";
	};
	for (const ch of stripComments(readFileSync(file, "utf-8"))) {
		if (ch === "(") parens++;
		if (ch === ")") parens--;
		if (parens > 0) buf += ch;
		else if (ch === "{") {
			rules.push(buf.trim().replace(/\s+/g, " "));
			buf = "";
		} else if (ch === "}") {
			flush();
			rules.pop();
		} else if (ch === ";") flush();
		else buf += ch;
	}
	return out;
}

/** The var() calls of a value, outermost only: a fallback belongs to its var(). */
function vars(value: string): { name: string; fallback?: string }[] {
	const out: { name: string; fallback?: string }[] = [];
	let at = 0;
	while ((at = value.indexOf("var(", at)) !== -1) {
		let depth = 0;
		let end = at + 3;
		for (; end < value.length; end++) {
			if (value[end] === "(") depth++;
			else if (value[end] === ")" && --depth === 0) break;
		}
		const inner = value.slice(at + 4, end);
		const comma = inner.indexOf(",");
		out.push(
			comma === -1
				? { name: inner.trim() }
				: { name: inner.slice(0, comma).trim(), fallback: inner.slice(comma + 1).trim() }
		);
		at = end + 1;
	}
	return out;
}

const ALL = files(SRC_LIB, ".css").flatMap(declarations);

/** Every value the library declares for a custom property. */
const DECLARED = new Map<string, { value: string; file: string }[]>();
const key = (name: string, file: string) =>
	name.startsWith("--_") ? `${dirname(file)} ${name}` : name;
for (const d of ALL) {
	if (!d.prop.startsWith("--")) continue;
	const k = key(d.prop, d.file);
	DECLARED.set(k, [...(DECLARED.get(k) ?? []), { value: d.value, file: d.file }]);
}

/** The theme tokens a value can end on. */
function terminals(value: string, file: string, seen = new Set<string>()): Set<string> {
	const out = new Set<string>();
	for (const { name, fallback } of vars(value)) {
		if (THEME.has(name)) {
			out.add(name);
			continue;
		}
		const k = key(name, file);
		if (seen.has(k)) continue;
		seen.add(k);
		const next = DECLARED.get(k) ?? (fallback ? [{ value: fallback, file }] : []);
		for (const n of next) {
			for (const t of terminals(n.value, n.file, seen)) out.add(t);
		}
	}
	return out;
}

const endsOnRawIntent = (value: string, file: string) =>
	[...terminals(value, file)].some((t) => RAW_INTENT.test(t));

test("the parser reads the stylesheets (a parse that yields nothing proves nothing)", () => {
	expect(THEME.size).toBeGreaterThan(50);
	expect(THEME.has("--stuic-color-surface-warning-foreground")).toBe(true);
	expect(ALL.length).toBeGreaterThan(3000);
	expect(ALL.filter((d) => d.prop === "color").length).toBeGreaterThan(300);
	// a chain it must be able to follow: a private var, per intent, down to the theme
	expect([
		...terminals("var(--_color)", resolve(SRC_LIB, "components/Button/index.css")),
	]).toContain("--stuic-color-primary");
});

test("no `color` declaration ends on a raw intent colour", () => {
	const offenders = ALL.filter(
		(d) => d.prop === "color" && endsOnRawIntent(d.value, d.file)
	).map((d) => `${rel(d.file)} :: ${d.selector}`);

	expect([...new Set(offenders)].sort()).toEqual(Object.keys(ALLOWED).sort());
});

test("no `text-(--token)` utility in a component ends on a raw intent colour", () => {
	const offenders: string[] = [];
	for (const file of files(SRC_LIB, ".svelte")) {
		const source = readFileSync(file, "utf-8");
		for (const [utility, name] of source.matchAll(/\btext-\((--[\w-]+)\)/g)) {
			if (endsOnRawIntent(`var(${name})`, file))
				offenders.push(`${rel(file)} :: ${utility}`);
		}
	}

	expect([...new Set(offenders)].sort()).toEqual([]);
});

// A misspelt theme token does not fail anywhere: the var() falls through to its fallback
// (the raw intent, for the tokens above) and the page looks plausible. So every
// `--stuic-color-*` the library reads must exist in the theme it ships with.
test("every --stuic-color-* token the library reads exists in the bundled theme", () => {
	/** Component namespaces that happen to start with "color". */
	const COMPONENT = /^--stuic-color-(picker|scheme-switcher)-/;
	/** Optional theme extensions: no theme has to define them, so each read has a fallback. */
	const OPTIONAL = ["--stuic-color-card", "--stuic-color-card-hover"];

	const unknown = new Set<string>();
	const sources = [...files(SRC_LIB, ".css"), ...files(SRC_LIB, ".svelte")];
	for (const file of sources) {
		const source = stripComments(readFileSync(file, "utf-8"));
		for (const [, name] of source.matchAll(
			/(?:var\(|[a-z]-\()\s*(--stuic-color-[\w-]+)/g
		)) {
			if (THEME.has(name) || COMPONENT.test(name) || OPTIONAL.includes(name)) continue;
			unknown.add(`${name} (${rel(file)})`);
		}
	}

	expect([...unknown].sort()).toEqual([]);
});
