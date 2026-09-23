import type { CodeBlockToken } from "./types.js";

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const LITERAL = /(?:true|false|null)(?![\w$])/y;
const WORD_CHAR = /[\w$.]/;

/**
 * Tokenizes JSON into `out`, offsetting every token by `base` (so an HTTP body can be
 * tokenized in place). Tolerant: `//` and `/* *\/` comments, unterminated strings and
 * non-JSON placeholders (`...`) never throw — unknown characters are simply skipped.
 */
export function tokenizeJsonInto(
	code: string,
	base: number,
	out: CodeBlockToken[]
): void {
	const n = code.length;
	let i = 0;
	while (i < n) {
		const c = code[i];

		if (c === '"') {
			let j = i + 1;
			while (j < n && code[j] !== '"' && code[j] !== "\n") j += code[j] === "\\" ? 2 : 1;
			const end = Math.min(code[j] === '"' ? j + 1 : j, n);
			// a key is a string followed by a colon
			let k = end;
			while (code[k] === " " || code[k] === "\t") k++;
			out.push([base + i, base + end, code[k] === ":" ? "property" : "string"]);
			i = end;
			continue;
		}

		if (c === "/" && code[i + 1] === "/") {
			const nl = code.indexOf("\n", i);
			const end = nl < 0 ? n : nl;
			out.push([base + i, base + end, "comment"]);
			i = end;
			continue;
		}

		if (c === "/" && code[i + 1] === "*") {
			const close = code.indexOf("*/", i + 2);
			const end = close < 0 ? n : close + 2;
			out.push([base + i, base + end, "comment"]);
			i = end;
			continue;
		}

		if ("{}[],:".includes(c)) {
			out.push([base + i, base + i + 1, "punctuation"]);
			i++;
			continue;
		}

		if (!WORD_CHAR.test(code[i - 1] ?? "")) {
			if (c === "-" || (c >= "0" && c <= "9")) {
				NUMBER.lastIndex = i;
				const m = NUMBER.exec(code);
				if (m && m[0] !== "-") {
					out.push([base + i, base + i + m[0].length, "number"]);
					i += m[0].length;
					continue;
				}
			}
			if (c === "t" || c === "f" || c === "n") {
				LITERAL.lastIndex = i;
				const m = LITERAL.exec(code);
				if (m) {
					out.push([base + i, base + i + m[0].length, "literal"]);
					i += m[0].length;
					continue;
				}
			}
		}

		i++;
	}
}

/** Highlights JSON (and JSON with comments): keys, strings, numbers, literals, punctuation. */
export function highlightJson(code: string): CodeBlockToken[] {
	const out: CodeBlockToken[] = [];
	tokenizeJsonInto(code, 0, out);
	return out;
}
