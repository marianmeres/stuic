/**
 * Default Preview renderer for {@link CommentInput}: turns a markdown string into
 * **sanitized** HTML.
 *
 * `marked` and `dompurify` are declared as *optional* peer dependencies and are
 * imported dynamically the first time a Preview tab is opened — consumers who
 * never preview (or who pass their own `renderMarkdown`) don't pay for them, and
 * a consumer who hasn't installed them gets a caught error (handled by the
 * component) rather than a hard build failure. Mirrors the lazy-load convention
 * used by `MarkdownEditor` for its Milkdown/CodeMirror backends.
 *
 * Sanitization is non-negotiable here: comment text is untrusted user content and
 * `marked` emits raw HTML embedded in markdown verbatim (an XSS vector). Every
 * code path that returns HTML runs it through DOMPurify first.
 */

/** A markdown-to-HTML renderer. Return value may be sync or async. */
export type MarkdownRenderer = (markdown: string) => string | Promise<string>;

// Cache the resolved (marked + DOMPurify) pipeline so the dynamic imports and
// DOMPurify instance creation happen at most once per page.
let cached: MarkdownRenderer | null = null;

async function load(): Promise<MarkdownRenderer> {
	if (cached) return cached;
	const [{ marked }, dompurify] = await Promise.all([
		import("marked"),
		import("dompurify"),
	]);
	// DOMPurify's default export is the instance in a browser/DOM context.
	const DOMPurify = dompurify.default ?? dompurify;
	cached = async (markdown: string) => {
		// GitHub-flavored markdown + soft line breaks → <br>, matching how comment
		// boxes (incl. GitHub's) treat single newlines.
		const html = await marked.parse(markdown ?? "", { gfm: true, breaks: true });
		return DOMPurify.sanitize(html);
	};
	return cached;
}

/**
 * Render markdown to sanitized HTML using the bundled (lazy) marked + DOMPurify
 * pipeline. Throws if the optional peers aren't installed (the caller catches
 * this and shows a fallback). SSR-safe: returns an empty string off the DOM,
 * since DOMPurify needs a `window` to sanitize against.
 */
export async function renderMarkdownSafe(markdown: string): Promise<string> {
	if (typeof window === "undefined") return "";
	const render = await load();
	return render(markdown);
}
