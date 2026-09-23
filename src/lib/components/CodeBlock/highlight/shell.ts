import type { CodeBlockToken, CodeBlockTokenType } from "./types.js";

const KEYWORDS = new Set([
	"if",
	"then",
	"else",
	"elif",
	"fi",
	"for",
	"while",
	"until",
	"do",
	"done",
	"case",
	"esac",
	"in",
	"function",
	"select",
	"return",
	"export",
	"local",
	"readonly",
	"declare",
	"unset",
]);
/** Keywords followed by a name or a word list, not by a command */
const NOT_FOLLOWED_BY_COMMAND = new Set(["for", "select", "case", "in", "function"]);
/** Keywords followed by assignments */
const DECLARING = new Set(["export", "local", "readonly", "declare"]);

const ASSIGNMENT = /^[A-Za-z_]\w*=/;
/** Characters that end an unquoted word */
const WORD_END = /[\s|&;<>()'"$`]/;

/**
 * Highlights a shell command or session (bash, sh, zsh): `$ ` prompts, comments, quoted
 * strings with the variables inside them, `$VARS`/`${…}`/`$(…)`, the command name, flags,
 * assignments, operators and `\` line continuations. A reading aid, not a parser —
 * heredocs and backticks are left plain.
 */
export function highlightShell(code: string): CodeBlockToken[] {
	const out: CodeBlockToken[] = [];
	const n = code.length;
	const push = (start: number, end: number, type: CodeBlockTokenType) => {
		if (end > start) out.push([start, end, type]);
	};

	/** End of the `$…` expansion starting at `i` (a `$` followed by an expandable char) */
	const expansionEnd = (i: number): number => {
		const next = code[i + 1];
		if (next === "{" || next === "(") {
			const close = next === "{" ? "}" : ")";
			let depth = 0;
			for (let j = i + 1; j < n; j++) {
				if (code[j] === next) depth++;
				else if (code[j] === close && --depth === 0) return j + 1;
			}
			return n;
		}
		if (/[A-Za-z_]/.test(next)) {
			let j = i + 2;
			while (j < n && /\w/.test(code[j])) j++;
			return j;
		}
		return i + 2; // $1 $? $@ $# $* $! $$ $-
	};
	const isExpansion = (i: number) => /[A-Za-z_{(0-9@*#?!$-]/.test(code[i + 1] ?? "");

	let i = 0;
	let command = true; // the next word is a command name
	let declaring = false; // after `export` & co. — words are assignments
	let awaitingIn = 0; // `for NAME in`, `case WORD in`: words until the `in`
	let lineStart = true;

	while (i < n) {
		const c = code[i];

		if (c === "\n") {
			i++;
			command = true;
			declaring = false;
			awaitingIn = 0;
			lineStart = true;
			continue;
		}
		if (c === " " || c === "\t") {
			i++;
			continue;
		}

		// a `$ ` prompt (a `$` followed by a space can't be an expansion)
		if (lineStart) {
			lineStart = false;
			if (c === "$" && (i + 1 === n || code[i + 1] === " " || code[i + 1] === "\n")) {
				push(i, i + 1, "meta");
				i++;
				continue;
			}
		}

		// `\` + newline: the command continues on the next line
		if (c === "\\" && code[i + 1] === "\n") {
			push(i, i + 1, "punctuation");
			i += 2;
			continue;
		}

		// only at the start of a word — mid-word `#` (a URL fragment) is part of the word
		if (c === "#") {
			const nl = code.indexOf("\n", i);
			const end = nl < 0 ? n : nl;
			push(i, end, "comment");
			i = end;
			continue;
		}

		if (c === "'") {
			const close = code.indexOf("'", i + 1);
			const end = close < 0 ? n : close + 1;
			push(i, end, "string");
			i = end;
			command = false;
			continue;
		}

		if (c === '"') {
			let from = i;
			let j = i + 1;
			while (j < n && code[j] !== '"') {
				if (code[j] === "\\") {
					j += 2;
				} else if (code[j] === "$" && isExpansion(j)) {
					push(from, j, "string");
					const e = expansionEnd(j);
					push(j, e, "variable");
					from = j = e;
				} else {
					j++;
				}
			}
			const end = Math.min(j + 1, n);
			push(from, end, "string");
			i = end;
			command = false;
			continue;
		}

		if (c === "$" && isExpansion(i)) {
			if (code[i + 1] === "(") {
				// command substitution: a nested command line
				push(i, i + 2, "punctuation");
				i += 2;
				command = true;
				continue;
			}
			const e = expansionEnd(i);
			push(i, e, "variable");
			i = e;
			command = false;
			continue;
		}

		if (c === "|" || c === "&" || c === ";") {
			const two = code.slice(i, i + 2);
			const len = two === "||" || two === "&&" || two === ";;" ? 2 : 1;
			push(i, i + len, "operator");
			i += len;
			command = true;
			declaring = false;
			continue;
		}

		if (c === ">" || c === "<") {
			const len = code[i + 1] === c || code[i + 1] === "&" ? 2 : 1;
			push(i, i + len, "operator");
			i += len;
			continue;
		}

		if (c === "(" || c === ")" || c === "{" || c === "}") {
			push(i, i + 1, "punctuation");
			i++;
			if (c === "(" || c === "{") command = true;
			continue;
		}

		// an unquoted word
		let j = i;
		while (j < n && !WORD_END.test(code[j])) {
			if (code[j] === "\\") {
				if (code[j + 1] === "\n") break; // a continuation, tokenized on the next round
				j += 2;
			} else {
				j++;
			}
		}
		if (j === i) {
			// a lone character the rules above don't claim (a stray backslash, a backtick)
			i++;
			continue;
		}
		const word = code.slice(i, Math.min(j, n));

		const inKeyword = awaitingIn === 1 && word === "in";
		if (awaitingIn) awaitingIn--;

		const assignment = (command || declaring) && ASSIGNMENT.exec(word);
		if (inKeyword) {
			push(i, j, "keyword");
		} else if (assignment) {
			const eq = i + assignment[0].length - 1;
			push(i, eq, "variable");
			push(eq, eq + 1, "operator");
			// `FOO=1 cmd`: the command still follows
		} else if (command) {
			if (KEYWORDS.has(word)) {
				push(i, j, "keyword");
				command = !NOT_FOLLOWED_BY_COMMAND.has(word) && !DECLARING.has(word);
				declaring = DECLARING.has(word);
				if (word === "for" || word === "select" || word === "case") awaitingIn = 2;
			} else {
				push(i, j, "function");
				command = false;
			}
		} else if (word.length > 1 && word[0] === "-" && !/^-\d/.test(word)) {
			const eq = word.indexOf("=");
			push(i, eq < 0 ? j : i + eq, "parameter");
		} else if (/^\d+$/.test(word)) {
			push(i, j, "number");
		}

		i = j;
	}

	return out;
}
