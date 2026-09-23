import type { CodeBlockToken } from "../highlight/types.js";

/**
 * Syntax colors are painted with the CSS Custom Highlight API: tokens become `Range`s in
 * named `Highlight`s, styled by `::highlight(stuic-code-block-<type>)`. No markup is
 * added — the code stays plain text nodes, so selecting, copying and the server-rendered
 * HTML are untouched, and a browser without the API simply shows the plain text.
 *
 * The highlight registry is global: every block adds its own ranges to the shared
 * `Highlight` of a type and removes exactly those on cleanup.
 */

export const HIGHLIGHT_PREFIX = "stuic-code-block-";

export function supportsCustomHighlights(): boolean {
	return (
		typeof CSS !== "undefined" &&
		"highlights" in CSS &&
		typeof (globalThis as { Highlight?: unknown }).Highlight === "function"
	);
}

/** The `::highlight()` name a token type is painted by */
export const highlightName = (type: string): string =>
	HIGHLIGHT_PREFIX +
	String(type)
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-");

/**
 * Paints `tokens` — offsets into `root`'s text content — and returns the cleanup that
 * removes them. Offsets outside the text are clamped; empty tokens are skipped. A token
 * may span several text nodes (a line-per-`<span>` rendering).
 */
export function paintTokens(root: Node, tokens: CodeBlockToken[]): () => void {
	if (!tokens.length || !supportsCustomHighlights()) return () => {};

	const nodes: Text[] = [];
	const starts: number[] = [];
	let total = 0;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		nodes.push(n as Text);
		starts.push(total);
		total += (n as Text).data.length;
	}
	if (!nodes.length) return () => {};

	// The last node whose start is <= offset (a start) or < offset (an end), so a start at
	// a node boundary lands in the node that holds the character, and an end in the one
	// that holds the character before it. Zero-length nodes are skipped either way.
	const locate = (offset: number, isEnd: boolean): [Text, number] => {
		let lo = 0;
		let hi = nodes.length - 1;
		let found = 0;
		while (lo <= hi) {
			const mid = (lo + hi) >> 1;
			if (isEnd ? starts[mid] < offset : starts[mid] <= offset) {
				found = mid;
				lo = mid + 1;
			} else {
				hi = mid - 1;
			}
		}
		return [nodes[found], Math.min(offset - starts[found], nodes[found].data.length)];
	};

	const added: [Highlight, Range][] = [];
	for (const [start, end, type] of tokens) {
		const s = Math.max(0, start);
		const e = Math.min(total, end);
		if (!(e > s)) continue;
		const range = new Range();
		range.setStart(...locate(s, false));
		range.setEnd(...locate(e, true));
		const name = highlightName(type);
		let highlight = CSS.highlights.get(name);
		if (!highlight) {
			highlight = new Highlight();
			CSS.highlights.set(name, highlight);
		}
		highlight.add(range);
		added.push([highlight, range]);
	}

	return () => {
		for (const [highlight, range] of added) highlight.delete(range);
	};
}
