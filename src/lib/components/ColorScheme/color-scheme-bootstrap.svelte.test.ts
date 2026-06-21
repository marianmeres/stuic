import { describe, test, expect, afterEach } from "vitest";

// Regression guard for the anti-FOUC bootstrap shipped inside the <svelte:head>
// of ColorSchemeLocal / ColorSchemeSystemAware. A classic <script>'s top-level
// `const`/`let` lands in the realm's GLOBAL lexical scope and persists for the
// page's lifetime (it is not a window property, and removing the <script> node
// does not free it). So if that body ever executes a SECOND time in the same
// realm — e.g. Svelte re-inserting <svelte:head> while recovering from an
// otherwise-recoverable hydration_mismatch — an unscoped `const KEY` throws
// "Identifier 'KEY' has already been declared", turning a soft mismatch into a
// fatal, hydration-killing crash. The fix block-scopes the body so re-execution
// is a harmless no-op. This test pins that invariant against the REAL emitted
// head script (read from source), so it also fails if the braces are removed.
//
// Browser test (*.svelte.test.ts) on purpose: it needs a real realm with
// document/localStorage and synchronous inline <script> execution on insert.

// Raw source of the two hydration components. Uses import.meta.glob's ?raw query
// (the pattern already used in themes-list.ts) so it typechecks under
// svelte-check without a per-file `*?raw` module declaration.
const RAW = import.meta.glob("./ColorScheme*.svelte", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const STORAGE_KEY = "stuic-color-scheme";

/** Pull the bootstrap body out of the component's <svelte:head><script>…</script>. */
function extractHeadScript(src: string): string {
	const m = src.match(/<svelte:head>[\s\S]*?<script>([\s\S]*?)<\/script>/);
	if (!m) throw new Error("could not locate the <svelte:head> <script> in source");
	return m[1];
}

// Track inserted nodes so afterEach can detach them (purely DOM hygiene; the
// global lexical bindings, if any, persist regardless — which is the whole point).
const inserted: HTMLScriptElement[] = [];

/** Insert an inline classic <script>; its body executes synchronously on append. */
function runInHead(text: string): void {
	const s = document.createElement("script");
	s.textContent = text;
	document.head.appendChild(s);
	inserted.push(s);
}

/**
 * Run `fn` while capturing window 'error' events. An exception thrown while a
 * dynamically-inserted inline <script> runs is NOT re-thrown to appendChild —
 * the HTML spec "reports" it, surfacing as a window 'error'. A try/catch would
 * miss the redeclaration crash, so we must listen for it.
 */
async function captureErrors(fn: () => void): Promise<string[]> {
	const messages: string[] = [];
	const onError = (e: ErrorEvent) => {
		messages.push(e.message || String(e.error));
	};
	window.addEventListener("error", onError, true);
	try {
		fn();
		// Flush a turn in case reporting is queued rather than dispatched inline.
		await new Promise((r) => setTimeout(r));
	} finally {
		window.removeEventListener("error", onError, true);
	}
	return messages;
}

afterEach(() => {
	for (const s of inserted.splice(0)) s.remove();
	document.documentElement.classList.remove("dark");
	localStorage.removeItem(STORAGE_KEY);
});

describe("ColorScheme inline <svelte:head> bootstrap", () => {
	for (const [path, src] of Object.entries(RAW)) {
		test(`${path}: survives a second execution and still applies the stored scheme`, async () => {
			const body = extractHeadScript(src);
			// Guard against a silently-broken extraction regex.
			expect(body).toContain(STORAGE_KEY);

			localStorage.setItem(STORAGE_KEY, "dark");
			document.documentElement.classList.remove("dark");

			const errors = await captureErrors(() => {
				runInHead(body);
				runInHead(body); // the second run is the regression case
			});

			// The crux: re-execution must not throw a redeclaration SyntaxError.
			expect(errors.join("\n")).not.toMatch(/already been declared/i);
			// …and the bootstrap must still do its job (block-scoping changes nothing
			// behaviorally — a stored "dark" preference paints the dark class).
			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});
	}
});
