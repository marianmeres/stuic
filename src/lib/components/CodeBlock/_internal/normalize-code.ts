/**
 * Prepares a code sample for display (and copying): normalizes line endings, drops the
 * blank lines at both ends and removes the indentation every non-blank line shares — so
 * a sample written inline in an indented template renders flush left.
 *
 * Unlike `String.prototype.trim`, the first line keeps its indentation relative to the
 * rest: `"  a\n    b"` becomes `"a\n  b"`, not `"a\n    b"`.
 */
export function normalizeCode(code: string): string {
	const lines = (code ?? "").replace(/\r\n?/g, "\n").split("\n");
	const isBlank = (line: string) => !line.trim();

	let start = 0;
	let end = lines.length;
	while (start < end && isBlank(lines[start])) start++;
	while (end > start && isBlank(lines[end - 1])) end--;
	const body = lines.slice(start, end);

	// The longest leading-whitespace prefix shared by all non-blank lines. Compared as a
	// string, so a tab and spaces never count as the same indentation.
	let prefix: string | undefined;
	for (const line of body) {
		if (isBlank(line)) continue;
		const indent = line.match(/^[ \t]*/)![0];
		if (prefix === undefined) prefix = indent;
		else while (!indent.startsWith(prefix)) prefix = prefix.slice(0, -1);
		if (!prefix) break;
	}

	const cut = prefix?.length ?? 0;
	if (!cut) return body.join("\n");
	// every non-blank line starts with `prefix`; a whitespace-only line may be shorter
	return body.map((line) => (isBlank(line) ? "" : line.slice(cut))).join("\n");
}
